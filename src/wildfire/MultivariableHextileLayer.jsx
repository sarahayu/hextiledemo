import { PathStyleExtension } from '@deck.gl/extensions';
import { OBJLoader } from '@loaders.gl/obj';
import { CompositeLayer } from 'deck.gl';
import IconHexTileLayer from 'src/hextile/IconHexTileLayer';
import SolidHexTileLayer from 'src/hextile/SolidHexTileLayer';

import { WILDFIRE_INTERPS } from 'src/utils/scales';

export default class MultivariableHextileLayer extends CompositeLayer {
  renderLayers() {
    const { data, visible, zoomRange, useVsup, showAllRings } = this.props;

    return [
      new SolidHexTileLayer({
        id: `Fire`,
        data,
        thicknessRange: [0, 1],
        getFillColor: (d) => {
          if (useVsup)
            return WILDFIRE_INTERPS.fire.interpVsup(
              d.properties['Fire'] || 0,
              d.properties['FireVar'] || 0
            );
          return WILDFIRE_INTERPS.fire.interpColor(d.properties['Fire'] || 0);
        },
        opacity: 1,
        visible,
        updateTriggers: {
          getFillColor: [useVsup],
        },
        zoomRange,
        pickable: false,
      }),
      new SolidHexTileLayer({
        id: `GR2`,
        data,
        thicknessRange: [0.4, 0.65],
        getFillColor: (d) =>
          WILDFIRE_INTERPS.gr2.interpColor(d.properties['GR2'], !showAllRings),
        getValue: (d) => {
          // console.log(d.properties['WhiteVar']);
          // if (useVsup)
          //   return (
          //     WILDFIRE_INTERPS.GR2.scaleLinearVar(d.properties['GR2Var']) *
          //       0.7 +
          //     0.3
          //   );
          return 1;
        },
        visible,
        stroked: true,
        extruded: false,
        lineJointRounded: true,
        getLineColor: [255, 255, 255, 200],
        getOffset: -0.5,
        extensions: [new PathStyleExtension({ offset: true })],
        opacity: 1.0,
        updateTriggers: {
          getFillColor: [showAllRings],
          getValue: [useVsup],
        },
        zoomRange,
        pickable: false,
      }),
      new IconHexTileLayer({
        id: `Personnel`,
        data,
        loaders: [OBJLoader],
        mesh: 'assets/human.obj',
        raised: true,
        getColor: (d) => [
          255,
          255,
          7,
          (useVsup
            ? WILDFIRE_INTERPS.personnel.scaleLinearVar(d.properties['PersVar'])
            : 1) *
            200 +
            55,
        ],
        getValue: (d) =>
          WILDFIRE_INTERPS.personnel.scaleLinear(d.properties['Pers']),
        visible,
        sizeScale: 400,
        opacity: 1,
        updateTriggers: {
          getColor: [useVsup],
        },
        zoomRange,
        pickable: false,
      }),
    ];
  }
}

MultivariableHextileLayer.layerName = 'MultivariableHextileLayer';
MultivariableHextileLayer.defaultProps = {
  ...CompositeLayer.defaultProps,
  autoHighlight: true,
};
