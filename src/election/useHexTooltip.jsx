import React, { useEffect, useRef } from 'react';

import { useCallback } from 'react';
import { dateInterpIdx } from 'src/utils/scales';
import { SCENARIOS, SCENARIO_LABELS } from 'src/utils/settings';
import {
  formatMonthYear,
  getHolderStr,
  indepVariance,
  isGeo,
  isHex,
} from 'src/utils/utils';

const curScenario = 0;

export default function useHexTooltip({ curOption }) {
  const mainTooltipElem = useRef();
  const secondaryTooltipElem = useRef();
  const lastObject = useRef({});

  useEffect(() => {
    mainTooltipElem.current = document.querySelector('#main-tooltip');
    secondaryTooltipElem.current = document.querySelector('#secondary-tooltip');
  }, []);

  const handleBasicGeo = useCallback((object) => {
    secondaryTooltipElem.current.classList.remove('active');
    mainTooltipElem.current.classList.add('active');
    mainTooltipElem.current.innerHTML = `\        
        <div>${JSON.stringify(object.properties)}</div>
      `;
  }, []);

  const getTooltip = useCallback(
    ({ object }) => {
      if (!object) {
        if (lastObject.current) {
          secondaryTooltipElem.current.classList.remove('active');

          if (isHex(lastObject.current)) {
            mainTooltipElem.current.classList.remove('active');
          }

          lastObject.current = object;
        }

        if (curOption > 1) {
          secondaryTooltipElem.current.classList.remove('active');
          mainTooltipElem.current.classList.remove('active');
        }
        return;
      }

      if (curOption <= 1 && isHex(object)) {
        handleHex(object);
      } else if (curOption <= 1 && isGeo(object)) {
        handleExtrudedGeo(object);
      } else {
        handleBasicGeo(object);
      }

      lastObject.current = object;
    },
    [curOption]
  );

  return { getTooltip };
}
