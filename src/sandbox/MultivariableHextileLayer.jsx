import {
  colorInterpDemDiff,
  colorInterpVsupDemDiff,
  colorInterpVsupGW,
  scaleContDemDiffVar,
  scaleStepUDemVar,
  valueInterpUDem,
} from 'src/utils/scales';
import { SCENARIOS } from 'src/utils/settings';

import { PathStyleExtension } from '@deck.gl/extensions';
import { OBJLoader } from '@loaders.gl/obj';
import { CompositeLayer } from 'deck.gl';
import IconHexTileLayer from 'src/hextile/IconHexTileLayer';
import SolidHexTileLayer from 'src/hextile/SolidHexTileLayer';
import { indepVariance } from 'src/utils/utils';

import DeaggregatedLayer from './DeaggregateLayer';

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
    } = this.props;

    return [
      new SolidHexTileLayer({
        id: `Groundwater`,
        data,
        thicknessRange: [0, 1],
        getFillColor: (d) =>
          colorInterpVsupGW(
            d.properties.Groundwater[speedyCounter],
            d.properties.GroundwaterVar[speedyCounter]
          ),
        opacity: 1,
        visible,
        updateTriggers: {
          getFillColor: [speedyCounter],
        },
      }),
      new SolidHexTileLayer({
        id: `DiffRings`,
        data,
        thicknessRange: [0.4, 0.65],
        getFillColor: (d) =>
          curOption == 0
            ? colorInterpVsupDemDiff(
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
            : colorInterpDemDiff(
                d.properties.UnmetDemand[SCENARIOS[curScenario]][
                  speedyCounter
                ] - d.properties.UnmetDemandBaseline[speedyCounter],
                true
              ),
        getValue: (d) =>
          curOption == 0
            ? 1
            : scaleStepUDemVar(
                indepVariance(
                  d.properties.UnmetDemandBaselineVar[speedyCounter],
                  d.properties.UnmetDemandVar[SCENARIOS[curScenario]][
                    speedyCounter
                  ]
                )
              ),
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
          (1 -
            scaleContDemDiffVar(
              d.properties.UnmetDemandBaselineVar[speedyCounter]
            )) *
            200 +
            55,
        ],
        getValue: (d) =>
          valueInterpUDem(
            d.properties.UnmetDemand[SCENARIOS[curScenario]][speedyCounter]
          ),
        visible,
        sizeScale: 3000,
        opacity: 1,
        updateTriggers: {
          getTranslation: [speedyCounter],
        },
      }),
      new DeaggregatedLayer({
        ...this.props,
        id: 'DeagLayer',
        data,
      }),
    ];
  }
}

MultivariableHextileLayer.layerName = 'MultivariableHextileLayer';
MultivariableHextileLayer.defaultProps = {
  ...CompositeLayer.defaultProps,
  autoHighlight: true,
};
