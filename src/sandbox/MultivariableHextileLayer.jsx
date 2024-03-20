import { SCENARIOS } from 'src/utils/settings';

import { PathStyleExtension } from '@deck.gl/extensions';
import { OBJLoader } from '@loaders.gl/obj';
import { CompositeLayer } from 'deck.gl';
import IconHexTileLayer from 'src/hextile/IconHexTileLayer';
import SolidHexTileLayer from 'src/hextile/SolidHexTileLayer';
import { indepVariance } from 'src/utils/utils';

import DeagHexTileLayer from '../hextile/DeagHexTileLayer';
import { WATER_INTERPS } from 'src/utils/scales';
import { temporalDataGeo } from 'src/utils/data';

const curScenario = 0;

export default class MultivariableHextileLayer extends CompositeLayer {
  renderLayers() {
    const {
      data,
      curOption,
      speedyCounter,
      clickedHexes,
      selectionFinalized,
      visible,
      zoomRange,
    } = this.props;

    return [
      new SolidHexTileLayer({
        id: `Groundwater`,
        data,
        thicknessRange: [0, 1],
        getFillColor: (d) =>
          WATER_INTERPS.groundwater.interpVsup(
            d.properties.Groundwater[speedyCounter],
            d.properties.GroundwaterVar[speedyCounter]
          ),
        opacity: 1,
        visible,
        updateTriggers: {
          getFillColor: [speedyCounter],
        },
        zoomRange,
      }),
      new SolidHexTileLayer({
        id: `DiffRings`,
        data,
        thicknessRange: [0.4, 0.65],
        getFillColor: (d) =>
          curOption == 0
            ? WATER_INTERPS.difference.interpVsup(
                d.properties.UnmetDemand[SCENARIOS[curScenario]][
                  speedyCounter
                ] - d.properties.UnmetDemandBaseline[speedyCounter],
                indepVariance(
                  d.properties.UnmetDemandBaselineVar[speedyCounter],
                  d.properties.UnmetDemandVar[SCENARIOS[curScenario]][
                    speedyCounter
                  ]
                ),
                true
              )
            : WATER_INTERPS.difference.interpColor(
                d.properties.UnmetDemand[SCENARIOS[curScenario]][
                  speedyCounter
                ] - d.properties.UnmetDemandBaseline[speedyCounter],
                true
              ),
        getValue: (d) =>
          curOption == 0
            ? 1
            : WATER_INTERPS.difference.scaleLinearVar(
                indepVariance(
                  d.properties.UnmetDemandBaselineVar[speedyCounter],
                  d.properties.UnmetDemandVar[SCENARIOS[curScenario]][
                    speedyCounter
                  ]
                )
              ) *
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
        id: `ScenarioUnmet`,
        data,
        loaders: [OBJLoader],
        mesh: './assets/drop.obj',
        raised: true,
        getColor: (d) => [
          255,
          130,
          35,
          WATER_INTERPS.unmetDemand.scaleLinearVar(
            d.properties.UnmetDemandVar[SCENARIOS[curScenario]][speedyCounter]
          ) *
            200 +
            55,
        ],
        getValue: (d) =>
          WATER_INTERPS.unmetDemand.scaleLinear(
            d.properties.UnmetDemand[SCENARIOS[curScenario]][speedyCounter]
          ),
        visible,
        sizeScale: 3000,
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
        deagData: temporalDataGeo,
        getFillColor: (d) => {
          return WATER_INTERPS.unmetDemand.interpColor(
            d.properties.UnmetDemand[SCENARIOS[curScenario]][speedyCounter],
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

MultivariableHextileLayer.layerName = 'MultivariableHextileLayer';
MultivariableHextileLayer.defaultProps = {
  ...CompositeLayer.defaultProps,
  autoHighlight: true,
};
