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

export default function Election2020Square() {
  const curInput = useGUI();
  const hexMouseEvts = useHexMouseEvts({
    disabled: curInput.curOption > 1,
    dataDeag,
    deagKey: 'PrecinctRgs',
  });
  const { getTooltip } = useHexTooltip(curInput);

  const curState = {
    data,
    ...curInput,
    ...hexMouseEvts,
  };

  return (
    <>
      <DeckGL
        controller
        effects={[LIGHTING]}
        initialViewState={{
          longitude: -97.7431,
          latitude: 30.2672,
          zoom: 5,
          minZoom: 3,
          maxZoom: 15,
          pitch: 50.85,
          bearing: 32.58,
        }}
        getTooltip={getTooltip}
      >
        <Map
          reuseMaps
          preventStyleDiffing
          mapLib={maplibregl}
          mapStyle={mapStyle}
        />
        <BaseTerrainLayer id="slide-terrain" {...curState} />
        <MultivariableSquareTileLayer
          id="slide-election"
          {...curState}
          zoomRange={[5, 8]}
          visible
        />
      </DeckGL>
      <GUI {...curState} />
    </>
  );
}

class MultivariableSquareTileLayer extends CompositeLayer {
  renderLayers() {
    const {
      data,
      curOption,
      speedyCounter = 1026,
      clickedHexes,
      selectionFinalized,
      visible,
      zoomRange,
    } = this.props;

    return [
      new SolidSquareTileLayer({
        id: `PoC`,
        data,
        getFillColor: [0, 121, 42],
        getValue: (d) =>
          ELECTION_INTERPS.poc.scaleLinear(100 - d.properties['PercWhite']),
        visible,
        extruded: false,
        opacity: 1.0,
        zoomRange,
        offset: [-1, -1],
      }),
      new SolidSquareTileLayer({
        id: `Dem`,
        data,
        getFillColor: [72, 30, 197],
        getValue: (d) =>
          ELECTION_INTERPS.party.scaleLinear(d.properties['DemLead']),
        visible,
        extruded: false,
        opacity: 1.0,
        zoomRange,
        offset: [-1, 1],
      }),
      new SolidSquareTileLayer({
        id: `Pop`,
        data,
        getFillColor: [156, 156, 156],
        getValue: (d) =>
          ELECTION_INTERPS.population.scaleLinear(d.properties['PopSqKm']),
        visible,
        extruded: false,
        opacity: 1.0,
        zoomRange,
        offset: [1, 1],
      }),
    ];
  }
}

MultivariableSquareTileLayer.layerName = 'MultivariableSquareTileLayer';
MultivariableSquareTileLayer.defaultProps = {
  ...CompositeLayer.defaultProps,
  autoHighlight: true,
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
