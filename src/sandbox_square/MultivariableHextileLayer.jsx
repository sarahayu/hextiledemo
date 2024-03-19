import { SCENARIOS } from 'src/utils/settings';

import { CompositeLayer } from 'deck.gl';
import SolidSquareTileLayer from 'src/squaretile/SolidSquareTileLayer';

import { WATER_INTERPS } from 'src/utils/scales';

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
      new SolidSquareTileLayer({
        id: `Groundwater`,
        data,
        thicknessRange: [0, 1],
        getFillColor: (d) => WATER_INTERPS.groundwater.interpColor(450),
        getValue: (d) =>
          WATER_INTERPS.groundwater.scaleLinear(
            d.properties.Groundwater[speedyCounter]
          ),
        opacity: 1,
        visible,
        updateTriggers: {
          getFillColor: [speedyCounter],
        },
        zoomRange,
        offset: [1, 1],
      }),
      new SolidSquareTileLayer({
        id: `Difference`,
        data,
        thicknessRange: [0, 1],
        getFillColor: (d) => WATER_INTERPS.difference.interpColor(18, false),
        getValue: (d) =>
          WATER_INTERPS.difference.scaleLinear(
            d.properties.UnmetDemand[SCENARIOS[curScenario]][speedyCounter] -
              d.properties.UnmetDemandBaseline[speedyCounter]
          ),
        opacity: 1,
        visible,
        updateTriggers: {
          getFillColor: [speedyCounter],
        },
        zoomRange,
        offset: [1, -1],
      }),
      new SolidSquareTileLayer({
        id: `UnmetDemand`,
        data,
        thicknessRange: [0, 1],
        getFillColor: (d) => WATER_INTERPS.difference.interpColor(-18, false),
        getValue: (d) =>
          WATER_INTERPS.unmetDemand.scaleLinear(
            d.properties.UnmetDemand[SCENARIOS[curScenario]][speedyCounter]
          ),
        opacity: 1,
        visible,
        updateTriggers: {
          getFillColor: [speedyCounter],
        },
        zoomRange,
        offset: [-1, -1],
      }),
    ];
  }
}

MultivariableHextileLayer.layerName = 'MultivariableHextileLayer';
MultivariableHextileLayer.defaultProps = {
  ...CompositeLayer.defaultProps,
  autoHighlight: true,
};
