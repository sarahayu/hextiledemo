import React from 'react';

import DeckGL from '@deck.gl/react';
import maplibregl from 'maplibre-gl';
import { Map } from 'react-map-gl';
import mapStyle from 'src/assets/style.json';
import { LIGHTING } from 'src/utils/settings';

import SandboxSlide from 'src/sandbox/SandboxSlide';

import { useState } from 'react';

import { waterDataHex } from 'src/utils/data';

import useCamera from 'src/scrollyline/hooks/useCamera';
import useCounters from 'src/scrollyline/hooks/useCounters';

import Clock from 'src/Clock';

import GUI from './GUI';
import BaseTerrainLayer from './BaseTerrainLayer';
import useGUI from './useGUI';
import useHexMouseEvts from './useHexMouseEvts';
import useHexTooltip from './useHexTooltip';

export default function Sandbox() {
  const [curScenario, setCurScenario] = useState(0);
  const hexMouseEvts = useHexMouseEvts();

  const curState = {
    data: waterDataHex,
    curScenario,
    setCurScenario,
    ...hexMouseEvts,
  };

  const sandboxGUI = useGUI();
  const counters = useCounters(curState);
  const { curViewState, transitioning } = useCamera(curState);
  const { getTooltip } = useHexTooltip({
    ...curState,
    ...counters,
  });

  const params = {
    ...curState,
    ...counters,
    transitioning,
  };

  const layers = [
    new BaseTerrainLayer(params),
    new SandboxSlide({
      ...params,
      ...sandboxGUI,
      autoHighlight: true,
    }),
  ];

  return (
    <>
      <DeckGL
        layers={layers}
        effects={[LIGHTING]}
        initialViewState={curViewState}
        controller={true}
        getTooltip={getTooltip}
      >
        <Map
          reuseMaps
          mapLib={maplibregl}
          mapStyle={mapStyle}
          preventStyleDiffing={true}
        />
      </DeckGL>
      <Clock
        counter={counters.speedyCounter}
        displayMonth={false}
        dataset="averageDemandBaseline"
      />
      <GUI {...{ ...params, ...sandboxGUI }} />
    </>
  );
}
