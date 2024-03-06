import React from 'react';

import DeckGL from '@deck.gl/react';
import maplibregl from 'maplibre-gl';
import { Map } from 'react-map-gl';
import mapStyle from 'src/assets/style.json';
import { INITIAL_VIEW_STATE, LIGHTING } from 'src/utils/settings';

import { temporalDataHex as data } from 'src/utils/data';

import useGUI from './useGUI';
import useHexMouseEvts from './useHexMouseEvts';
import useHexTooltip from './useHexTooltip';

import BaseTerrainLayer from './BaseTerrainLayer';
import BasicGeoLayer from './BasicGeoLayer';
import GUI from './GUI';
import MultivariableHextileLayer from './MultivariableHextileLayer';

export default function CentralValleyWater() {
  const curInput = useGUI();
  const hexMouseEvts = useHexMouseEvts(curInput);
  const { getTooltip } = useHexTooltip(curInput);

  const curState = {
    data,
    ...curInput,
    ...hexMouseEvts,
  };

  return (
    <>
      <DeckGL
        effects={[LIGHTING]}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        getTooltip={getTooltip}
      >
        <Map
          reuseMaps
          mapLib={maplibregl}
          mapStyle={mapStyle}
          preventStyleDiffing={true}
        />
        <BaseTerrainLayer id="slide-terrain" {...curState} />
        <MultivariableHextileLayer
          id="slide-waters"
          {...curState}
          visible={curInput.curOption == 0 || curInput.curOption == 1}
        />
        <BasicGeoLayer id="slide-basic" {...curState} />
      </DeckGL>
      <GUI {...curState} />
    </>
  );
}
