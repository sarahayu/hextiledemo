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

export default function useHexTooltip({ speedyCounter, hextiles = true }) {
  const mainTooltipElem = useRef();
  const secondaryTooltipElem = useRef();
  const lastObject = useRef({});

  useEffect(() => {
    mainTooltipElem.current = document.querySelector('#main-tooltip');
    secondaryTooltipElem.current = document.querySelector('#secondary-tooltip');
  }, []);

  const handleExtrudedGeo = useCallback(
    (object) => {
      const scenDem =
        object.properties.Demand[SCENARIOS[curScenario]][speedyCounter];
      const scenUDem =
        -object.properties.UnmetDemand[SCENARIOS[curScenario]][speedyCounter];
      const diffDem =
        -scenUDem - object.properties.UnmetDemandBaseline[speedyCounter];

      mainTooltipElem.current.classList.add('active');
      secondaryTooltipElem.current.classList.add('active');

      secondaryTooltipElem.current.innerHTML = `\
        <div><b>Region ID</b> ${object.properties.id}</div>
        <div><b>Scenario Demand</b> ${scenDem}</div>
        <div><b>Scen. Unmet Demand</b> ${scenUDem}</div>
        <div><b>Difference in Unmet Demand</b> ${diffDem}</div>
        <div><b>Land Holder</b> ${getHolderStr(object)}</div>
      `;
    },
    [speedyCounter]
  );

  const handleBasicGeo = useCallback(
    (object) => {
      secondaryTooltipElem.current.classList.remove('active');
      mainTooltipElem.current.classList.add('active');
      mainTooltipElem.current.innerHTML = `\
        <div><i>${formatMonthYear(dateInterpIdx(speedyCounter))}</i></div>
      `;

      if (object.properties.Demand) {
        const scenDem =
          object.properties.Demand[SCENARIOS[curScenario]][speedyCounter];
        const scenUDem =
          -object.properties.UnmetDemand[SCENARIOS[curScenario]][speedyCounter];
        const diffDem =
          -scenUDem - object.properties.UnmetDemandBaseline[speedyCounter];

        mainTooltipElem.current.innerHTML += `\        
          <div><i>${SCENARIO_LABELS[curScenario]}</i></div>
          <div><b>Region ID</b> ${object.properties.id}</div>
          <div><b>Scenario Demand</b> ${scenDem}</div>
          <div><b>Scen. Unmet Demand</b> ${scenUDem}</div>
          <div><b>Difference in Unmet Demand</b> ${diffDem}</div>
          <div><b>Land Holder</b> ${getHolderStr(object)}</div>
        `;
      } else {
        const gw = object.properties.Groundwater[speedyCounter];

        mainTooltipElem.current.innerHTML += `\     
          <div><b>Elem ID</b> ${object.properties.id}</div>
          <div><b>Groundwater</b> ${gw}</div>
      `;
      }
    },
    [speedyCounter]
  );

  const handleHex = useCallback(
    (object) => {
      const scenDem =
        object.properties.Demand[SCENARIOS[curScenario]][speedyCounter];
      const scenUDem =
        -object.properties.UnmetDemand[SCENARIOS[curScenario]][speedyCounter];
      const diffDem =
        -scenUDem - object.properties.UnmetDemandBaseline[speedyCounter];
      const gw = object.properties.Groundwater[speedyCounter];
      const gwVar = object.properties.GroundwaterVar[speedyCounter];
      const UDemVar =
        object.properties.UnmetDemandVar[SCENARIOS[curScenario]][speedyCounter];
      const diffVar = indepVariance(
        object.properties.UnmetDemandBaselineVar[speedyCounter],
        UDemVar
      );
      const drgs = object.properties.DURgs.join(', ');
      const gwrgs = object.properties.GWRgs.join(', ');

      secondaryTooltipElem.current.classList.remove('active');
      mainTooltipElem.current.classList.add('active');
      mainTooltipElem.current.innerHTML = `\
        <div><i>${formatMonthYear(dateInterpIdx(speedyCounter))}</i></div>
        <div><i>${SCENARIO_LABELS[curScenario]}</i></div>
        <div><b>Groundwater</b> ${gw}</div>
        <div><b>Scenario Demand</b> ${scenDem}</div>
        <div><b>Scen. Unmet Demand</b> ${scenUDem}</div>
        <div><b>Difference in Unmet Demand</b> ${diffDem}</div>
        <div><b>Land Holder</b> ${getHolderStr(object)}</div>
        <div><b>Variance (GW)</b> ${gwVar}</div>
        <div><b>Var. (Scen. UnmetDem)</b> ${UDemVar}</div>
        <div><b>Var. (Difference)</b> ${diffVar}</div>
        <div><b>Demand Regions</b> ${drgs}</div>
        <div><b>GW Regions</b> ${gwrgs}</div>
      `;
    },
    [speedyCounter]
  );

  const getTooltip = useCallback(
    ({ object }) => {
      if (!object) {
        if (lastObject.current) {
          secondaryTooltipElem.current.classList.remove('active');

          if (!hextiles || isHex(lastObject.current)) {
            mainTooltipElem.current.classList.remove('active');
          }

          lastObject.current = object;
        }

        return;
      }

      if (isHex(object) && hextiles) {
        handleHex(object);
      } else if (isGeo(object) && hextiles) {
        handleExtrudedGeo(object);
      } else {
        handleBasicGeo(object);
      }

      lastObject.current = object;
    },
    [speedyCounter]
  );

  return getTooltip;
}
