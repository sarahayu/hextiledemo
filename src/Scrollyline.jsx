import React, { useEffect, useRef } from 'react';
import DeckGL from '@deck.gl/react';
import maplibregl from 'maplibre-gl';
import { Map } from 'react-map-gl';
import mapStyle from 'src/assets/style.json';

import { useState } from 'react';

import { temporalData } from 'src/utils/data';

import MartiniSlides from 'src/MartiniSlides';
import SlideEpilogue from 'src/slides/SlideEpilogue';

import MainGUI from 'src/MainGUI';
import SandboxGUI from 'src/SandboxGUI';

import useCamera from 'src/hooks/useCamera';
import useCounters from 'src/hooks/useCounters';
import useHexTooltip from 'src/hooks/useHexTooltip';
import useSandboxGUI from 'src/hooks/useSandboxGUI';
import { LIGHTING } from './utils/settings';

export default function Scrollyline() {
  const [slide, setSlide] = useState(0);
  const [curScenario, setCurScenario] = useState(0);

  const [scrollIdx, setScrollIdx] = useState(0);
  const scrollIdxRef = useRef(0);
  const scrollMult = 10000;

  useEffect(() => {
    window.addEventListener('wheel', (e) => {
      setScrollIdx(
        (s) =>
          (scrollIdxRef.current = Math.min(
            22 * scrollMult,
            Math.max(0, s + e.deltaY)
          ))
      );

      setSlide(() =>
        Math.min(22, Math.max(0, Math.floor(scrollIdxRef.current / scrollMult)))
      );
    });
  }, []);

  const curState = {
    data: temporalData,
    slide,
    setSlide,
    curScenario,
    setCurScenario,
  };

  const sandboxGUI = useSandboxGUI();
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
    autoHighlight: true,
  };

  const isEpilogue = slide >= 22;

  const layers = [
    new MartiniSlides(params),
    new SlideEpilogue({ ...params, ...sandboxGUI }),
  ];

  return (
    <>
      <DeckGL
        layers={layers}
        effects={[LIGHTING]}
        initialViewState={curViewState}
        controller={{ scrollZoom: false }}
        getTooltip={getTooltip}
      >
        <Map
          reuseMaps
          mapLib={maplibregl}
          mapStyle={mapStyle}
          preventStyleDiffing={true}
        />
      </DeckGL>
      <MainGUI {...params} />
      {isEpilogue && <SandboxGUI {...{ ...params, ...sandboxGUI }} />}
      <div
        className="scroll-indic"
        style={{
          transform: `scaleY(${
            ((scrollIdx % scrollMult) / scrollMult) * 100
          }%)`,
        }}
      ></div>
    </>
  );
}
