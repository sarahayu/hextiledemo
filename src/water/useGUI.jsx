import { useEffect, useState } from 'react';

export default function useGUI() {
  const [speedyCounter, setSpeedyCounter] = useState(1027);
  const [playing, setPlaying] = useState(false);
  const [useVsup, setUseVsup] = useState(false);
  const [showAllRings, setShowAllRings] = useState(false);

  useEffect(() => {
    if (playing) {
      let timer = setTimeout(
        () => setSpeedyCounter((c) => (c % 1199) + 1),
        1000 / 30
      );
      return function () {
        clearTimeout(timer);
      };
    }
  }, [speedyCounter, playing]);

  return {
    speedyCounter,
    setSpeedyCounter,
    playing,
    setPlaying,
    useVsup,
    setUseVsup,
    showAllRings,
    setShowAllRings,
  };
}
