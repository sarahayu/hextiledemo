import * as d3 from 'd3';

import { temporalDataGeoGW } from 'src/utils/data';

import {
  colorScaleDemDiffNorm,
  colorScaleGWNorm,
  colorScaleUDemNorm,
} from 'src/utils/scales';
import { SCENARIOS } from 'src/utils/settings';

import { CompositeLayer, GeoJsonLayer } from 'deck.gl';

import { temporalDataGeo } from 'src/utils/data';

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
        getFillColor: (d) =>
          Object.values({
            ...d3.color(
              colorScaleGWNorm(d.properties.Groundwater[speedyCounter])
            ),
            opacity: 255,
          }),
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
        getFillColor: (d) =>
          Object.values({
            ...d3.color(
              colorScaleUDemNorm(
                d.properties.UnmetDemand[SCENARIOS[curScenario]][speedyCounter]
              )
            ),
            opacity: 255,
          }),
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
        getFillColor: (d) =>
          Object.values({
            ...d3.color(
              colorScaleDemDiffNorm(
                d.properties.UnmetDemand[SCENARIOS[curScenario]][
                  speedyCounter
                ] - d.properties.UnmetDemandBaseline[speedyCounter]
              )
            ),
            opacity: 255,
          }),
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
