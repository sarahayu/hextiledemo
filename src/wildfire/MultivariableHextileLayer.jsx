import { PathStyleExtension } from '@deck.gl/extensions';
import { OBJLoader } from '@loaders.gl/obj';
import { CompositeLayer } from 'deck.gl';
import IconHexTileLayer from 'src/hextile-lib/IconHexTileLayer';
import SolidHexTileLayer from 'src/hextile-lib/SolidHexTileLayer';

import { WILDFIRE_INTERPS } from 'src/utils/wildfireInterps';

function getElev(d) {
  if (d.properties['Fire'] != 0)
    return (
      Math.pow(WILDFIRE_INTERPS.elev.scaleLinear(d.properties['Elev']), 2) *
      3000
    );
  return 0;
}

export default class MultivariableHextileLayer extends CompositeLayer {
  renderLayers() {
    const { data, visible, zoomRange, useVsup, showAllRings, useElev } =
      this.props;

    return [
      new SolidHexTileLayer({
        id: `Fire`,
        data,
        thicknessRange: [0, 1],
        getFillColor: (d) => {
          if (useVsup)
            return WILDFIRE_INTERPS.fire.interpVsup(
              d.properties['Fire'] || 0,
              d.properties['FireVar'] || 0,
              d.properties['Fire'] === 0,
              0.001
            );
          return WILDFIRE_INTERPS.fire.interpColor(
            d.properties['Fire'] || 0,
            d.properties['Fire'] === 0,
            true,
            0.001
          );
        },
        extruded: true,
        getElevation: useElev ? getElev : 0,
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
          WILDFIRE_INTERPS.gr2.interpColor(
            d.properties['SpreadRate'],
            !showAllRings
          ),
        getValue: (d) => {
          if (useVsup)
            return (
              WILDFIRE_INTERPS.gr2.scaleLinearVar(
                d.properties['SpreadRateVar']
              ) *
                0.7 +
              0.3
            );
          return 1;
        },
        visible,
        stroked: true,
        raised: true,
        getElevation: useElev ? getElev : 0,
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
        getElevation: useElev ? getElev : 0,
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
