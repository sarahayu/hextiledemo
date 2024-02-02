import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

import { temporalData } from 'src/utils/data';

import MartiniSlides from 'src/MartiniSlides';
import SlideEpilogue from 'src/slides/SlideEpilogue';
import WaterDeckGL from 'src/WaterDeckGL';

import MainGUI from 'src/MainGUI';
import SandboxGUI from 'src/SandboxGUI';

import useCamera from 'src/hooks/useCamera';
import useCounters from 'src/hooks/useCounters';
import useHexTooltip from 'src/hooks/useHexTooltip';
import useSandboxGUI from 'src/hooks/useSandboxGUI';

export default function App() {
  const [slide, setSlide] = useState(0);
  const [curScenario, setCurScenario] = useState(0);

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
