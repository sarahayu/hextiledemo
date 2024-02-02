import { _TerrainExtension as TerrainExtension } from '@deck.gl/extensions';
import { OBJLoader } from '@loaders.gl/obj';
import { CompositeLayer } from 'deck.gl';
import IconHexTileLayer from 'src/hextile/IconHexTileLayer';
import { valueInterpDemand } from 'src/utils/scales';
import { USE_TERRAIN_3D } from 'src/utils/settings';

export default class SlideDemandIntro extends CompositeLayer {
  renderLayers() {
    const { data, slide, counter } = this.props;

    return [
      new IconHexTileLayer({
        id: `DemandIcons`,
        data,
        loaders: [OBJLoader],
        mesh: 'assets/drop.obj',
        raised: true,
        extruded: false,

        getColor: [255, 130, 35],
        getValue: (d) =>
          valueInterpDemand(d.properties.DemandBaseline[counter]),
        sizeScale: 3000,
        visible: slide == 1,
        opacity: 1,
        ...(USE_TERRAIN_3D
          ? {
              extensions: [
                new TerrainExtension({
                  terrainDrawMode: 'offset',
                }),
              ],
            }
          : {}),
        updateTriggers: {
          getTranslation: [counter],
        },
      }),
    ];
  }
}

SlideDemandIntro.layerName = 'SlideDemandIntro';
SlideDemandIntro.defaultProps = {
  ...CompositeLayer.defaultProps,
};
