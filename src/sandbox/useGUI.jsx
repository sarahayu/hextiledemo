import React from 'react';
import { useState } from 'react';

export default function useGUI() {
  const [displayGW, setDisplayGW] = useState(true);
  const [displayDiff, setDisplayDiff] = useState(true);
  const [displayUnmet, setDisplayUnmet] = useState(true);
  const [displayDemand, setDisplayDemand] = useState(false);
  const [displayLandUse, setDisplayLandUse] = useState(false);
  const [displayDemAsRings, setDisplayDemAsRings] = useState(false);

  return {
    displayGW,
    setDisplayGW,
    displayDiff,
    setDisplayDiff,
    displayUnmet,
    setDisplayUnmet,
    displayDemand,
    setDisplayDemand,
    displayLandUse,
    setDisplayLandUse,
    displayDemAsRings,
    setDisplayDemAsRings,
  };
}
