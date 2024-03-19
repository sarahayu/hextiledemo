import React from 'react';

import DeckGL from '@deck.gl/react';
import maplibregl from 'maplibre-gl';
import { Map } from 'react-map-gl';
import mapStyle from 'src/assets/style.json';
import { INITIAL_VIEW_STATE, LIGHTING } from 'src/utils/settings';

import {
  temporalDataHex as data,
  temporalDataGeo as dataDeag,
} from 'src/utils/data';

import useGUI from './useGUI';
import useHexTooltip from './useHexTooltip';

import BaseTerrainLayer from './BaseTerrainLayer';
import BasicGeoLayer from './BasicGeoLayer';
import GUI from './GUI';
import MultivariableHextileLayer from './MultivariableHextileLayer';
import useHexMouseEvts from 'src/sandbox/useHexMouseEvts';

export default function Election2020() {
  const curInput = useGUI();
  const hexMouseEvts = useHexMouseEvts({
    disabled: curInput.curOption > 1,
    dataDeag,
    deagKey: 'DURgs',
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
        {/* <BaseTerrainLayer id="slide-terrain" {...curState} /> */}
        {/* <MultivariableHextileLayer
          id="slide-election"
          {...curState}
          zoomRange={[7, 9]}
          visible={curInput.curOption == 1}
        /> */}
        <BasicGeoLayer id="slide-basic" {...curState} />
      </DeckGL>
      <GUI {...curState} />
    </>
  );
}
