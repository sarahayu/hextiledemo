import React from 'react';
import { CompositeLayer } from 'deck.gl';
import SolidSquareTileLayer from 'src/squaretile/SolidSquareTileLayer';

import { ELECTION_INTERPS } from 'src/utils/scales';

export default class UserSquareLayer extends CompositeLayer {
  renderLayers() {
    const { data, visible, zoomRange, highlighted } = this.props;

    return [
      new SolidSquareTileLayer({
        id: `SquareBorders`,
        data,
        getFillColor: [0, 0, 0, 0],
        getLineColor: [80, 80, 80, 100],
        stroked: true,
        lineWidthUnits: 'pixels',
        getValue: (d) => 2,
        visible,
        extruded: false,
        opacity: 1.0,
        zoomRange,
        offset: [0, 0],
      }),
      new SolidSquareTileLayer({
        id: `SquarePoC`,
        data,
        getFillColor: [0, 121, 42],
        getValue: (d) => ELECTION_INTERPS.poc.scaleLinear(d.properties['PoC']),
        visible,
        extruded: false,
        opacity: 1.0,
        zoomRange,
        offset: [-1, -1],
      }),
      new SolidSquareTileLayer({
        id: `SquareDem`,
        data,
        getFillColor: [72, 30, 197],
        getValue: (d) =>
          ELECTION_INTERPS.party.scaleLinear(
            d.properties['DemLead'] > 0
              ? d.properties['DemLead'] * 2 - 100
              : -100
          ),
        visible,
        extruded: false,
        opacity: 1.0,
        zoomRange,
        offset: [-1, 1],
      }),
      new SolidSquareTileLayer({
        id: `SquareRepub`,
        data,
        getFillColor: [165, 0, 38],
        getValue: (d) =>
          ELECTION_INTERPS.party.scaleLinear(
            d.properties['DemLead'] < 0
              ? -d.properties['DemLead'] * 2 - 100
              : -100
          ),
        visible,
        extruded: false,
        opacity: 1.0,
        zoomRange,
        offset: [1, 1],
      }),
      new SolidSquareTileLayer({
        id: `SquarePop`,
        data,
        getFillColor: [156, 156, 156],
        getValue: (d) =>
          ELECTION_INTERPS.population.scaleLinear(d.properties['PopSqKm']),
        visible,
        extruded: false,
        opacity: 1.0,
        zoomRange,
        offset: [1, -1],
      }),
      new SolidSquareTileLayer({
        id: `SquareHoveringTiles`,
        data,
        getFillColor: [0, 0, 0, 0],
        pickable: this.props.pickable,
        autoHighlight: this.props.autoHighlight,
        getValue: (d) => 2,
        stroked: true,
        getLineWidth: (d) => {
          return d.hexId == highlighted ? 2000 : 1;
        },
        // lineWidthUnits: 'pixels',
        visible,
        zoomRange,
        opacity: 1.0,
        offset: [0, 0],
      }),
    ];
  }
}

UserSquareLayer.layerName = 'MultivariableSquareTileLayer';
UserSquareLayer.defaultProps = {
  ...CompositeLayer.defaultProps,
  autoHighlight: true,
  pickable: true,
};

function GUI({
  curOption,
  setCurOption,
  speedyCounter,
  setSpeedyCounter,
  playing,
  setPlaying,
}) {
  return <>{/* <Legend /> */}</>;
}
