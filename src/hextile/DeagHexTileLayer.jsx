import { CompositeLayer, GeoJsonLayer } from 'deck.gl';
import SolidHexTileLayer from 'src/hextile/SolidHexTileLayer';

export default class DeagHexTileLayer extends CompositeLayer {
  renderLayers() {
    const {
      data,
      deagData,
      curOption,
      hoveredHex,
      visible,
      clickedHexes,
      hoveredGeoActive,
      hoveredGeos,
      selectedGeoJSON,
      selectedGeos,
      selectionFinalized,
      zoomRange,
      getFillColor,
    } = this.props;

    return [
      // new GeoJsonLayer({
      //   id: 'GeoJsonExt',
      //   data: selectedGeoJSON,
      //   opacity: 0.75,
      //   extruded: true,
      //   getElevation: (d) =>
      //     heightInterpUDem(
      //       d.properties.UnmetDemand[SCENARIOS[curScenario]][speedyCounter]
      //     ),
      //   visible,
      //   pickable: true,
      //   getLineWidth: 100,
      //   getFillColor: (d) => {
      //     let fill = [
      //       ...WATER_INTERPS.unmetDemand.interpColor(
      //         d.properties.UnmetDemand[SCENARIOS[curScenario]][speedyCounter],
      //         false,
      //         false
      //       ),
      //       255,
      //     ];

      //     if (fill[3] == 0) {
      //       fill = [255, 255, 255, 255];
      //     }

      //     if (d.properties.id == hoveredGeoActive) {
      //       const hlcol = [0 / 255, 0 / 255, 128 / 255, 128 / 255];
      //       return [
      //         (hlcol[curScenario] * hlcol[3] +
      //           (fill[curScenario] / 255) * (1 - hlcol[3])) *
      //           255,
      //         (hlcol[1] * hlcol[3] + (fill[1] / 255) * (1 - hlcol[3])) * 255,
      //         (hlcol[2] * hlcol[3] + (fill[2] / 255) * (1 - hlcol[3])) * 255,
      //         (hlcol[3] * hlcol[3] + (fill[3] / 255) * (1 - hlcol[3])) * 255,
      //       ];
      //     }

      //     return fill;
      //   },
      //   updateTriggers: {
      //     getFillColor: [
      //       curOption,
      //       speedyCounter,
      //       hoveredGeoActive,
      //       selectionFinalized,
      //     ],
      //     getElevation: [curOption, speedyCounter],
      //   },
      // }),
      new GeoJsonLayer({
        id: 'GeoJsonGray',
        data: deagData,
        opacity: 0.3,
        stroked: false,
        getFillColor: (d) => {
          if (!selectionFinalized && d.properties.id in hoveredGeos) {
            return [100, 100, 100, 205 * hoveredGeos[d.properties.id] + 50];
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
        data: deagData,
        opacity: 0.3,
        pickable: true,
        visible,
        getLineWidth: (d) => {
          if (!(d.properties.id in selectedGeos)) return 0;
          return d.properties.id == hoveredGeoActive ? 100 : 20;
        },
        getFillColor: (d) => {
          if (d.properties.id in selectedGeos) {
            if (d.properties.id == hoveredGeoActive) {
              const hlcol = [0 / 255, 0 / 255, 128 / 255, 128 / 255];
              const fill = [
                ...getFillColor({ properties: selectedGeos[d.properties.id] }),
                255,
              ];
              return [
                (hlcol[0] * hlcol[3] + (fill[0] / 255) * (1 - hlcol[3])) * 255,
                (hlcol[1] * hlcol[3] + (fill[1] / 255) * (1 - hlcol[3])) * 255,
                (hlcol[2] * hlcol[3] + (fill[2] / 255) * (1 - hlcol[3])) * 255,
                (hlcol[3] * hlcol[3] + (fill[3] / 255) * (1 - hlcol[3])) * 255,
              ];
            }
            return [
              ...getFillColor({ properties: selectedGeos[d.properties.id] }),
              255,
            ];
          }
          return [0, 0, 0, 0];
        },
        getLineColor: [0, 0, 0],
        updateTriggers: {
          getFillColor: [
            ...(this.props.updateTriggers.getFillColor || []),
            hoveredGeoActive,
            curOption,
            selectionFinalized,
          ],
          getLineWidth: [hoveredGeoActive, curOption, selectionFinalized],
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
        zoomRange,
      }),
    ];
  }
}

DeagHexTileLayer.layerName = 'DeaggregatedLayer';
DeagHexTileLayer.defaultProps = {
  ...CompositeLayer.defaultProps,
  autoHighlight: true,
};
