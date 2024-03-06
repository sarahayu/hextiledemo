import { colorInterpUDem, heightInterpUDem } from 'src/utils/scales';
import { SCENARIOS } from 'src/utils/settings';

import { CompositeLayer, GeoJsonLayer } from 'deck.gl';
import SolidHexTileLayer from 'src/hextile/SolidHexTileLayer';

import { temporalDataGeo } from 'src/utils/data';

const curScenario = 0;

export default class DeaggregatedLayer extends CompositeLayer {
  renderLayers() {
    const {
      data,
      curOption,
      speedyCounter,
      hoveredHex,
      visible,
      clickedHexes,
      hoveredGeoActive,
      hoveredGeos,
      selectedGeoJSON,
      selectedGeos,
      selectionFinalized,
    } = this.props;

    return [
      new GeoJsonLayer({
        id: 'GeoJsonExt',
        data: selectedGeoJSON,
        opacity: 0.75,
        extruded: true,
        getElevation: (d) =>
          heightInterpUDem(
            d.properties.UnmetDemand[SCENARIOS[curScenario]][speedyCounter]
          ),
        visible,
        pickable: true,
        getLineWidth: 100,
        getFillColor: (d) => {
          let fill = colorInterpUDem(
            d.properties.UnmetDemand[SCENARIOS[curScenario]][speedyCounter]
          );

          if (fill[3] == 0) {
            fill = [255, 255, 255, 255];
          }

          if (d.properties.DU_ID == hoveredGeoActive) {
            const hlcol = [0 / 255, 0 / 255, 128 / 255, 128 / 255];
            return [
              (hlcol[curScenario] * hlcol[3] +
                (fill[curScenario] / 255) * (1 - hlcol[3])) *
                255,
              (hlcol[1] * hlcol[3] + (fill[1] / 255) * (1 - hlcol[3])) * 255,
              (hlcol[2] * hlcol[3] + (fill[2] / 255) * (1 - hlcol[3])) * 255,
              (hlcol[3] * hlcol[3] + (fill[3] / 255) * (1 - hlcol[3])) * 255,
            ];
          }

          return fill;
        },
        updateTriggers: {
          getFillColor: [
            curOption,
            speedyCounter,
            hoveredGeoActive,
            selectionFinalized,
          ],
          getElevation: [curOption, speedyCounter],
        },
      }),
      new GeoJsonLayer({
        id: 'GeoJsonGray',
        data: temporalDataGeo,
        opacity: 0.3,
        stroked: false,
        getFillColor: (d) => {
          if (!selectionFinalized && d.properties.DU_ID in hoveredGeos) {
            return [100, 100, 100, 205 * hoveredGeos[d.properties.DU_ID] + 50];
          }
          return [0, 0, 0, 0];
        },
        visible: visible && !selectionFinalized,
        updateTriggers: {
          getFillColor: [hoveredHex, selectionFinalized],
        },
      }),
      new GeoJsonLayer({
        id: 'GeoJsonColor',
        data: {
          type: 'FeatureCollection',
          features: temporalDataGeo.features.filter(
            (f) => f.properties.DU_ID in selectedGeos
          ),
        },
        opacity: 0.3,
        pickable: true,
        visible,
        getLineWidth: (d) =>
          d.properties.DU_ID == hoveredGeoActive ? 100 : 20,
        getFillColor: (d) => {
          if (d.properties.DU_ID == hoveredGeoActive) {
            const hlcol = [0 / 255, 0 / 255, 128 / 255, 128 / 255];
            const fill = colorInterpUDem(
              selectedGeos[d.properties.DU_ID].UnmetDemand[
                SCENARIOS[curScenario]
              ][speedyCounter]
            );
            return [
              (hlcol[curScenario] * hlcol[3] +
                (fill[curScenario] / 255) * (1 - hlcol[3])) *
                255,
              (hlcol[1] * hlcol[3] + (fill[1] / 255) * (1 - hlcol[3])) * 255,
              (hlcol[2] * hlcol[3] + (fill[2] / 255) * (1 - hlcol[3])) * 255,
              (hlcol[3] * hlcol[3] + (fill[3] / 255) * (1 - hlcol[3])) * 255,
            ];
          }
          if (d.properties.DU_ID in selectedGeos) {
            return colorInterpUDem(
              selectedGeos[d.properties.DU_ID].UnmetDemand[
                SCENARIOS[curScenario]
              ][speedyCounter]
            );
          }
          return [0, 0, 0, 0];
        },
        getLineColor: [0, 0, 0],
        updateTriggers: {
          getFillColor: [hoveredGeoActive, curOption, selectionFinalized],
          getLineWidth: [hoveredGeoActive],
        },
      }),
      new SolidHexTileLayer({
        id: `HoveringTiles`,
        data,
        thicknessRange: [0, 1],
        getFillColor: [0, 0, 0, 0],
        pickable: !selectionFinalized,
        autoHighlight: !selectionFinalized,
        visible,
      }),
    ];
  }
}

DeaggregatedLayer.layerName = 'DeaggregatedLayer';
DeaggregatedLayer.defaultProps = {
  ...CompositeLayer.defaultProps,
  autoHighlight: true,
};
