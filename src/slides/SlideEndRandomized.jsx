import { _TerrainExtension as TerrainExtension } from '@deck.gl/extensions';
import { OBJLoader } from '@loaders.gl/obj';
import { CompositeLayer } from 'deck.gl';
import IconHexTileLayer from '../hextile/IconHexTileLayer';
import SolidHexTileLayer from '../hextile/SolidHexTileLayer';
import { colorInterpDifference, valueInterpUnmet } from '../utils/scales';
import { inRange, SCENARIOS, USE_TERRAIN_3D } from '../utils/settings';

export default class SlideEndRandomized extends CompositeLayer {
  renderLayers() {
    const { data, curRes, slide, cycler } = this.props;

    return [
      new IconHexTileLayer({
        id: `ScenarioUnmetRandomized`,
        data,
        loaders: [OBJLoader],
        mesh: './src/assets/drop.obj',
        raised: true,
        extruded: false,

        getColor: (d) => /* colorUnmet */ [255, 130, 35],
        getValue: (d) =>
          valueInterpUnmet(
            d.properties.UnmetDemand[SCENARIOS[cycler % 3]][
              ((Math.floor(cycler / 3) * 67) % 1199) + 1
            ]
          ),
        sizeScale: 3000,
        visible: inRange(slide, 21, 21),
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
          getTranslation: [cycler],
        },
      }),
      new SolidHexTileLayer({
        id: `DifferenceLayerRandomized`,
        data,
        thicknessRange: [0.5, 0.65],
        filled: true,

        extruded: false,
        raised: false,
        getFillColor: (d) =>
          colorInterpDifference(
            d.properties.UnmetDemand[SCENARIOS[cycler % 3]][
              ((Math.floor(cycler / 3) * 67) % 1199) + 1
            ] -
              d.properties.UnmetDemandBaseline[
                ((Math.floor(cycler / 3) * 67) % 1199) + 1
              ]
          ),
        visible: inRange(slide, 20, 21),
        opacity: inRange(slide, 21, 21) ? 1.0 : 0,
        transitions: {
          opacity: 250,
        },
        ...(USE_TERRAIN_3D ? { extensions: [new TerrainExtension()] } : {}),
        updateTriggers: {
          getFillColor: [cycler],
        },
      }),
    ];
  }
}

SlideEndRandomized.layerName = 'SlideEndRandomized';
SlideEndRandomized.defaultProps = {
  ...CompositeLayer.defaultProps,
};
