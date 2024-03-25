import React from 'react';

import DeckGL from '@deck.gl/react';
import maplibregl from 'maplibre-gl';
import { Map } from 'react-map-gl';
import mapStyle from 'src/assets/style.json';
import { INITIAL_VIEW_STATE, LIGHTING } from 'src/utils/settings';

import {
  electionDataSquare as data,
  electionPrecinctGeo as dataDeag,
} from 'src/utils/data';

import useGUI from './useGUI';
import useHexTooltip from './useHexTooltip';

import BaseTerrainLayer from './BaseTerrainLayer';
import BasicGeoLayer from './BasicGeoLayer';
import useHexMouseEvts from 'src/sandbox/useHexMouseEvts';

import { PathStyleExtension } from '@deck.gl/extensions';
import { OBJLoader } from '@loaders.gl/obj';
import { CompositeLayer } from 'deck.gl';
import SolidSquareTileLayer from 'src/squaretile/SolidSquareTileLayer';
import { indepVariance } from 'src/utils/utils';

import { ELECTION_INTERPS } from 'src/utils/scales';
import { electionPrecinctGeo } from 'src/utils/data';
import Clock from 'src/Clock';
import Legend from './Legend';
import { USER_VIEW } from './user_settings';

export default function Election2020Square() {
  const curInput = useGUI();
  // const hexMouseEvts = useHexMouseEvts({
  //   disabled: curInput.curOption > 1,
  //   dataDeag,
  //   deagKey: 'PrecinctRgs',
  // });
  const { getTooltip } = useHexTooltip(curInput);

  const curState = {
    data,
    ...curInput,
    // ...hexMouseEvts,
  };

  return (
    <>
      <DeckGL controller effects={[LIGHTING]} initialViewState={USER_VIEW}>
        <Map
          reuseMaps
          preventStyleDiffing
          mapLib={maplibregl}
          mapStyle={mapStyle}
        />
        <BaseTerrainLayer id="slide-terrain" {...curState} />
        <UserSquareLayer
          id="slide-election"
          {...curState}
          zoomRange={[0, 1]}
          visible
        />
      </DeckGL>
      <GUI {...curState} />
    </>
  );
}

export class UserSquareLayer extends CompositeLayer {
  renderLayers() {
    const {
      data,
      curOption,
      speedyCounter = 1026,
      clickedHexes,
      selectionFinalized,
      visible,
      zoomRange,
      highlighted,
    } = this.props;

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
          return d.hexId == highlighted ? 5000 : 1;
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
