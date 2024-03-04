import { _TerrainExtension as TerrainExtension } from '@deck.gl/extensions';
import { CompositeLayer } from 'deck.gl';
import SolidHexTileLayer from 'src/hextile/SolidHexTileLayer';
import { colorInterpContDemDiffAlpha, colorInterpGW } from 'src/utils/scales';
import { inRange, USE_TERRAIN_3D } from 'src/utils/settings';

export default class SlideDeliveries extends CompositeLayer {
  renderLayers() {
    const { data, slide } = this.props;

    return [
      new SolidHexTileLayer({
        id: `GroundwaterAgainLayer`,
        data,
        thicknessRange: [0, 1],
        filled: true,

        extruded: false,
        raised: false,
        getFillColor: (d) => colorInterpGW(d.properties.GroundwaterAverage),
        visible: inRange(slide, 12, 13),
        opacity: inRange(slide, 13, 13) ? 0.2 : 0,
        transitions: {
          opacity: 250,
        },
        ...(USE_TERRAIN_3D ? { extensions: [new TerrainExtension()] } : {}),
      }),
      new SolidHexTileLayer({
        id: `DeliveryWaterLayer`,
        data,
        thicknessRange: [0.5, 0.65],
        filled: true,

        extruded: false,
        raised: false,
        getFillColor: (d) =>
          colorInterpContDemDiffAlpha(
            d.properties.DemandBaselineAverage +
              d.properties.UnmetDemandBaselineAverage
          ),
        visible: inRange(slide, 11, 13),
        opacity: inRange(slide, 12, 13) ? 1 : 0,
        transitions: {
          opacity: 250,
        },
        ...(USE_TERRAIN_3D ? { extensions: [new TerrainExtension()] } : {}),
      }),
    ];
  }
}

SlideDeliveries.layerName = 'SlideDeliveries';
SlideDeliveries.defaultProps = {
  ...CompositeLayer.defaultProps,
};
