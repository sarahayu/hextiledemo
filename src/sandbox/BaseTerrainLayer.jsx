import { CompositeLayer } from 'deck.gl';

import { BitmapLayer, TileLayer } from 'deck.gl';

export default class BaseTerrainLayer extends CompositeLayer {
  renderLayers() {
    return [
      new TileLayer({
        data: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}',
        minZoom: 7,
        maxZoom: 11,
        tileSize: 256,
        // zoomOffset: -1,

        renderSubLayers: (props) => {
          const {
            bbox: { west, south, east, north },
          } = props.tile;

          return new BitmapLayer(props, {
            data: null,
            image: props.data,
            bounds: [west, south, east, north],
          });
        },
      }),
    ];
  }
}

BaseTerrainLayer.layerName = 'BaseTerrainLayer';
BaseTerrainLayer.defaultProps = {
  ...CompositeLayer.defaultProps,
};
