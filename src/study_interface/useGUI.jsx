import { useEffect, useState } from 'react';

export default function useGUI() {
  const [curOption, setCurOption] = useState(1);

  return {
    curOption,
    setCurOption,
  };
}
