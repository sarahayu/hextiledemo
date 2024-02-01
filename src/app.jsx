import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

import { data } from './utils/data';

import MartiniSlides from './MartiniSlides';
import SlideEpilogue from './slides/SlideEpilogue';
import WaterDeckGL from './WaterDeckGL';

import MainGUI from './MainGUI';
import SandboxGUI from './SandboxGUI';

import useCamera from './hooks/useCamera';
import useCounters from './hooks/useCounters';
import useHexTooltip from './hooks/useHexTooltip';
import useSandboxGUI from './hooks/useSandboxGUI';

export default function App() {
  const [slide, setSlide] = useState(0);
  const [curScenario, setCurScenario] = useState(0);

  const curState = {
    data,
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
      <WaterDeckGL
        {...{
          layers,
          curViewState,
          getTooltip,
        }}
      />
      <MainGUI {...params} />
      {isEpilogue && <SandboxGUI {...{ ...params, ...sandboxGUI }} />}
    </>
  );
}

export function renderToDOM(container) {
  createRoot(container).render(<App />);
}
