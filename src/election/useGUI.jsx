import { useEffect, useState } from 'react';

export default function useGUI() {
  const [curOption, setCurOption] = useState(2);

  return {
    curOption,
    setCurOption,
  };
}
