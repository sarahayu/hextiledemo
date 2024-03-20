import { SCENARIOS } from 'src/utils/settings';

import { PathStyleExtension } from '@deck.gl/extensions';
import { OBJLoader } from '@loaders.gl/obj';
import { CompositeLayer } from 'deck.gl';
import IconHexTileLayer from 'src/hextile/IconHexTileLayer';
import SolidHexTileLayer from 'src/hextile/SolidHexTileLayer';
import { indepVariance } from 'src/utils/utils';

import DeagHexTileLayer from '../hextile/DeagHexTileLayer';
import { ELECTION_INTERPS } from 'src/utils/scales';
import { electionPrecinctGeo } from 'src/utils/data';

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
    } = this.props;

    return [
      new SolidHexTileLayer({
        id: `Party`,
        data,
        thicknessRange: [0, 1],
        getFillColor: (d) =>
          ELECTION_INTERPS.party.interpVsup(
            d.properties['DemLead'] || 0,
            d.properties['VotesPerSqKm'] || 0
          ),
        opacity: 1,
        visible,
        updateTriggers: {
          getFillColor: [speedyCounter],
        },
        zoomRange,
      }),
      new SolidHexTileLayer({
        id: `White`,
        data,
        thicknessRange: [0.4, 0.65],
        getFillColor: (d) =>
          ELECTION_INTERPS.poc.interpColor(
            100 - d.properties['PercWhite'],
            true,
            true,
            0.4
          ),
        getValue: (d) =>
          ELECTION_INTERPS.poc.scaleLinearVar(d.properties['PercWhiteVar']) *
            0.8 +
          0.2,
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
          getFillColor: [curOption, speedyCounter],
          getValue: [curOption, speedyCounter],
          getElevation: [selectionFinalized],
          getLineWidth: [selectionFinalized],
        },
        zoomRange,
      }),
      new IconHexTileLayer({
        id: `Population`,
        data,
        loaders: [OBJLoader],
        mesh: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/humanoid_quad.obj',
        raised: true,
        getColor: (d) => [
          255,
          255,
          7,
          ELECTION_INTERPS.population.scaleLinearVar(
            d.properties['TurnoutPerSqKm']
          ) *
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
        },
        zoomRange,
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
