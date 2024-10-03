import { SCENARIOS } from 'src/utils/settings';

import { PathStyleExtension } from '@deck.gl/extensions';
import { OBJLoader } from '@loaders.gl/obj';
import { CompositeLayer } from 'deck.gl';
import IconHexTileLayer from 'src/hextile-lib/IconHexTileLayer';
import SolidHexTileLayer from 'src/hextile-lib/SolidHexTileLayer';
import { indepVariance } from 'src/utils/utils';

import DeagHexTileLayer from '../hextile-lib/DeagHexTileLayer';
import { WATER_INTERPS } from 'src/utils/waterInterps';
import { demandUnitGeo } from 'src/data/demandUnitGeo';
import IconHexTileFlatLayer from './IconHexTileFlatLayer';

const SCENARIO = SCENARIOS[0];

export default class MultivariableHextileFlatLayer extends CompositeLayer {
  renderLayers() {
    const { data, speedyCounter, visible, zoomRange, useVsup, showAllRings } =
      this.props;

    return [
      new SolidHexTileLayer({
        id: `Groundwater`,
        data,
        thicknessRange: [0, 1],
        getFillColor: (d) =>
          useVsup
            ? WATER_INTERPS.groundwater.interpVsup(
                d.properties.Groundwater[speedyCounter],
                d.properties.GroundwaterVar[speedyCounter]
              )
            : WATER_INTERPS.groundwater.interpColor(
                d.properties.Groundwater[speedyCounter]
              ),
        opacity: 1,
        visible,
        updateTriggers: {
          getFillColor: [speedyCounter, useVsup],
        },
        zoomRange,
        pickable: false,
      }),
      new SolidHexTileLayer({
        id: `DiffRings`,
        data,
        thicknessRange: [0.4, 0.65],
        getFillColor: (d) =>
          WATER_INTERPS.difference.interpColor(
            d.properties.UnmetDemand[SCENARIO][speedyCounter] -
              d.properties.UnmetDemandBaseline[speedyCounter],
            !showAllRings
          ),
        getValue: (d) =>
          useVsup
            ? WATER_INTERPS.difference.scaleLinearVar(
                indepVariance(
                  d.properties.UnmetDemandBaselineVar[speedyCounter],
                  d.properties.UnmetDemandVar[SCENARIO][speedyCounter]
                )
              ) *
                0.7 +
              0.3
            : 1,
        visible,
        stroked: true,
        extruded: false,
        lineJointRounded: true,
        getLineColor: [255, 255, 255, 200],
        getOffset: -0.5,
        extensions: [new PathStyleExtension({ offset: true })],
        opacity: 1.0,
        updateTriggers: {
          getFillColor: [speedyCounter, showAllRings],
          getValue: [speedyCounter, useVsup],
        },
        zoomRange,
        pickable: false,
      }),
      new IconHexTileFlatLayer({
        id: `ScenarioUnmet`,
        data,
        hexIconAtlas: './assets/drop.png',
        hexIconMapping: {
          default: {
            x: 0,
            y: 0,
            width: 128,
            height: 128,
            anchorY: 128,
            mask: true,
          },
        },
        getHexIcon: () => 'default',
        getColor: (d) => [
          255,
          130,
          35,
          (useVsup
            ? WATER_INTERPS.unmetDemand.scaleLinearVar(
                d.properties.UnmetDemandVar[SCENARIO][speedyCounter]
              )
            : 1) *
            200 +
            55,
        ],
        getValue: (d) =>
          WATER_INTERPS.unmetDemand.scaleLinear(
            d.properties.UnmetDemand[SCENARIO][speedyCounter]
          ),
        visible,
        billboard: false,
        getSize: 4000,
        sizeUnits: 'meters',
        sizeScale: 1,
        opacity: 1,
        updateTriggers: {
          getPosition: [speedyCounter],
          getColor: [useVsup],
        },
        zoomRange,
        pickable: false,
      }),
      new DeagHexTileLayer({
        ...this.props,
        id: 'DeagLayer',
        data,
        deagData: demandUnitGeo,
        getFillColor: (d) => {
          return WATER_INTERPS.unmetDemand.interpColor(
            d.properties.UnmetDemand[SCENARIO][speedyCounter],
            false,
            false
          );
        },
        updateTriggers: {
          getFillColor: [speedyCounter],
        },
      }),
    ];
  }
}

MultivariableHextileFlatLayer.layerName = 'MultivariableHextileFlatLayer';
MultivariableHextileFlatLayer.defaultProps = {
  ...CompositeLayer.defaultProps,
  autoHighlight: true, // have to do this or else component layers can't detect picking and autoHighlighting (stupid)
};
