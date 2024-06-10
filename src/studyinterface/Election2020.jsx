import { SCENARIOS } from 'src/utils/settings';

import { PathStyleExtension } from '@deck.gl/extensions';
import { OBJLoader } from '@loaders.gl/obj';
import { CompositeLayer } from 'deck.gl';
import IconHexTileLayer from 'src/hextile-lib/IconHexTileLayer';
import SolidHexTileLayer from 'src/hextile-lib/SolidHexTileLayer';
import { indepVariance } from 'src/utils/utils';

import DeagHexTileLayer from '../hextile-lib/DeagHexTileLayer';
import { ELECTION_INTERPS } from 'src/utils/electionInterps';
import { electionPrecinctGeo } from 'src/data/data';

const curScenario = 0;

export default class UserHexLayer extends CompositeLayer {
  renderLayers() {
    const {
      data,
      speedyCounter = 1026,
      clickedHexes,
      selectionFinalized,
      visible,
      zoomRange,
      useVsup,
      highlighted = null,
    } = this.props;

    return [
      new SolidHexTileLayer({
        id: `HexParty`,
        data,
        thicknessRange: [0, 1],
        getFillColor: (d) => {
          // console.log(d.properties['DemLead']);
          // console.log(d.properties['DemLeadVar']);
          // console.log(
          //   ELECTION_INTERPS.party.interpVsup(
          //     d.properties['DemLead'] || 0,
          //     d.properties['DemLeadVar'] || 0
          //   )
          // );
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
      }),
      new SolidHexTileLayer({
        id: `HexWhite`,
        data,
        thicknessRange: [0.4, 0.65],
        getFillColor: (d) =>
          ELECTION_INTERPS.poc.interpColor(d.properties['PoC'], false),
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
        // raised: true,
        visible,
        // getElevation: (d) => (d.hexId in clickedHexes ? 5000 : 0),
        // getLineWidth: (d) => (d.hexId in clickedHexes ? 100 : 0),
        stroked: true,
        extruded: false,
        lineJointRounded: true,
        getLineColor: [255, 255, 255, 200],
        getOffset: -0.5,
        extensions: [new PathStyleExtension({ offset: true })],
        opacity: 1.0,
        updateTriggers: {
          getFillColor: [speedyCounter],
          getValue: [speedyCounter, useVsup],
          getElevation: [selectionFinalized],
          getLineWidth: [selectionFinalized],
        },
        zoomRange,
      }),
      new IconHexTileLayer({
        id: `HexPopulation`,
        data,
        loaders: [OBJLoader],
        mesh: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/humanoid_quad.obj',
        // raised: true,
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
      }),
      new SolidHexTileLayer({
        id: `HexHoveringTiles`,
        data,
        thicknessRange: [0, 1],
        getFillColor: [0, 0, 0, 0],
        pickable: this.props.pickable,
        autoHighlight: this.props.autoHighlight,
        stroked: true,
        getLineWidth: (d) => {
          return d.hexId == highlighted ? 5 : 0;
        },
        lineWidthUnits: 'pixels',
        visible,
        zoomRange,
        updateTriggers: {
          getLineWidth: [highlighted],
        },
      }),
    ];
  }
}

UserHexLayer.layerName = 'MultivariableHextileLayer';
UserHexLayer.defaultProps = {
  ...CompositeLayer.defaultProps,
  autoHighlight: true,
  pickable: true,
};
