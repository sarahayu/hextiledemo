import { useEffect, useState } from 'react';

export default function useGUI() {
  const [speedyCounter, setSpeedyCounter] = useState(1027);
  const [playing, setPlaying] = useState(false);
  const [curOption, setCurOption] = useState(1);

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
    curOption,
    setCurOption,
  };
}
