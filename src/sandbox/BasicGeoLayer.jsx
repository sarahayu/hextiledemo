import * as d3 from 'd3';

import { temporalDataGeoGW } from 'src/utils/data';

import { SCENARIOS } from 'src/utils/settings';

import { CompositeLayer, GeoJsonLayer } from 'deck.gl';

import { temporalDataGeo } from 'src/utils/data';
import { WATER_INTERPS } from 'src/utils/scales';

const curScenario = 0;

export default class BasicGeoLayer extends CompositeLayer {
  renderLayers() {
    const { curOption, speedyCounter } = this.props;

    return [
      new GeoJsonLayer({
        id: 'GroundwaterGeo',
        data: temporalDataGeoGW,
        opacity: 1,
        stroked: false,
        filled: true,
        getFillColor: (d) => [
          ...WATER_INTERPS.groundwater.interpColor(
            d.properties.Groundwater[speedyCounter]
          ),
          255,
        ],
        visible: curOption == 2,
        updateTriggers: {
          getFillColor: [speedyCounter],
        },
        pickable: true,
        autoHighlight: true,
      }),
      new GeoJsonLayer({
        id: 'UDemGeo',
        data: temporalDataGeo,
        opacity: 1,
        stroked: false,
        filled: true,
        getFillColor: (d) => [
          ...WATER_INTERPS.unmetDemand.interpColor(
            d.properties.UnmetDemand[SCENARIOS[curScenario]][speedyCounter]
          ),
          255,
        ],
        visible: curOption == 3,
        updateTriggers: {
          getFillColor: [speedyCounter],
        },
        pickable: true,
        autoHighlight: true,
      }),
      new GeoJsonLayer({
        id: 'DemDiffGeo',
        data: temporalDataGeo,
        opacity: 1,
        stroked: false,
        filled: true,
        getFillColor: (d) => [
          ...WATER_INTERPS.difference.interpColor(
            d.properties.UnmetDemand[SCENARIOS[curScenario]][speedyCounter] -
              d.properties.UnmetDemandBaseline[speedyCounter]
          ),
          255,
        ],
        visible: curOption == 4,
        updateTriggers: {
          getFillColor: [speedyCounter],
        },
        pickable: true,
        autoHighlight: true,
      }),
    ];
  }
}

BasicGeoLayer.layerName = 'BasicGeoLayer';
BasicGeoLayer.defaultProps = {
  ...CompositeLayer.defaultProps,
  autoHighlight: true,
};
