import { SCENARIOS } from 'src/utils/settings';

import { PathStyleExtension } from '@deck.gl/extensions';
import { OBJLoader } from '@loaders.gl/obj';
import { CompositeLayer } from 'deck.gl';
import IconHexTileLayer from 'src/hextile/IconHexTileLayer';
import SolidHexTileLayer from 'src/hextile/SolidHexTileLayer';
import { indepVariance } from 'src/utils/utils';

import DeagHexTileLayer from '../hextile/DeagHexTileLayer';
import { ELECTION_INTERPS } from 'src/utils/scales';
import { electionPrecinctGeo } from 'src/data/electionPrecinctGeo';

const curScenario = 0;

export default class MultivariableHextileLayer extends CompositeLayer {
  renderLayers() {
    const {
      data,
      curOption,
      speedyCounter = 1026,
      clickedHexes,
      selectionFinalized,
      visible,
      zoomRange,
      useVsup,
      showAllRings,
    } = this.props;

    return [
      new SolidHexTileLayer({
        id: `Party`,
        data,
        thicknessRange: [0, 1],
        getFillColor: (d) => {
          if (useVsup)
            return ELECTION_INTERPS.party.interpVsup(
              d.properties['DemLead'] || 0,
              d.properties['DemLeadVar'] || 0
            );
          return ELECTION_INTERPS.party.interpColor(
            d.properties['DemLead'] || 0
          );
        },
        opacity: 1,
        visible,
        updateTriggers: {
          getFillColor: [speedyCounter, useVsup],
        },
        zoomRange,
        pickable: false,
      }),
      new SolidHexTileLayer({
        id: `PoC`,
        data,
        thicknessRange: [0.4, 0.65],
        getFillColor: (d) =>
          ELECTION_INTERPS.poc.interpColor(d.properties['PoC'], !showAllRings),
        getValue: (d) => {
          // console.log(d.properties['WhiteVar']);
          if (useVsup)
            return (
              ELECTION_INTERPS.poc.scaleLinearVar(d.properties['PoCVar']) *
                0.7 +
              0.3
            );
          return 1;
        },
        raised: true,
        visible,
        getElevation: (d) => (d.hexId in clickedHexes ? 5000 : 0),
        getLineWidth: (d) => (d.hexId in clickedHexes ? 100 : 0),
        stroked: true,
        extruded: false,
        lineJointRounded: true,
        getLineColor: [255, 255, 255, 200],
        getOffset: -0.5,
        extensions: [new PathStyleExtension({ offset: true })],
        opacity: 1.0,
        updateTriggers: {
          getFillColor: [curOption, speedyCounter, showAllRings],
          getValue: [curOption, speedyCounter, useVsup],
          getElevation: [selectionFinalized],
          getLineWidth: [selectionFinalized],
        },
        zoomRange,
        pickable: false,
      }),
      new IconHexTileLayer({
        id: `Population`,
        data,
        loaders: [OBJLoader],
        mesh: 'assets/human.obj',
        raised: true,
        getColor: (d) => [
          255,
          255,
          7,
          (useVsup
            ? ELECTION_INTERPS.population.scaleLinearVar(
                d.properties['PopSqKmVar']
              )
            : 1) *
            200 +
            55,
        ],
        getValue: (d) =>
          ELECTION_INTERPS.population.scaleLinear(d.properties['PopSqKm']),
        visible,
        sizeScale: 400,
        opacity: 1,
        updateTriggers: {
          getTranslation: [speedyCounter],
          getColor: [useVsup],
        },
        zoomRange,
        pickable: false,
      }),
      new DeagHexTileLayer({
        ...this.props,
        id: 'DeagLayer',
        data,
        deagData: electionPrecinctGeo,
        getFillColor: (d) => {
          return ELECTION_INTERPS.party.interpColor(
            d.properties['pct_dem_lead'],
            false,
            false
          );
        },
      }),
    ];
  }
}

MultivariableHextileLayer.layerName = 'MultivariableHextileLayer';
MultivariableHextileLayer.defaultProps = {
  ...CompositeLayer.defaultProps,
  autoHighlight: true,
};
