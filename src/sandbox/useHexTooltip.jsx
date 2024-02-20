import React, { useEffect, useRef } from 'react';

import { useCallback } from 'react';
import { dateInterpIdx } from 'src/utils/scales';
import { HOLDERS, SCENARIOS, SCENARIO_LABELS } from 'src/utils/settings';

const isGeo = (o) => !!(o.properties || {}).DU_ID;

export default function useHexTooltip({ slide, curScenario, speedyCounter }) {
  const mainTooltipElem = useRef();
  const secondaryTooltipElem = useRef();
  const lastObject = useRef({});

  useEffect(() => {
    mainTooltipElem.current = document.querySelector('#main-tooltip');
    secondaryTooltipElem.current = document.querySelector('#secondary-tooltip');
  }, []);

  const getTooltip = useCallback(
    ({ object }) => {
      if (!object) {
        if (lastObject.current) {
          if (isGeo(lastObject.current)) {
            secondaryTooltipElem.current.classList.remove('active');
          } else {
            secondaryTooltipElem.current.classList.remove('active');
            mainTooltipElem.current.classList.remove('active');
          }
          lastObject.current = object;
        }
        return;
      }

      if (lastObject.current) {
        if (isGeo(lastObject.current)) {
          secondaryTooltipElem.current.classList.remove('active');
        }
      }

      const date = dateInterpIdx(speedyCounter);
      if (isGeo(object)) {
        secondaryTooltipElem.current.classList.add('active');
        secondaryTooltipElem.current.innerHTML = `\
      ${
        object.properties.DU_ID
          ? `<div><b>Region ID</b> ${object.properties.DU_ID}</div>`
          : ''
      }
      <div><b>Demand</b> ${
        curScenario > -1
          ? object.properties.Demand[SCENARIOS[curScenario]][speedyCounter]
          : object.properties.DemandBaseline[speedyCounter]
      }</div>
      <div><b>Supply</b> ${
        curScenario > -1
          ? object.properties.Demand[SCENARIOS[curScenario]][speedyCounter] +
            object.properties.UnmetDemand[SCENARIOS[curScenario]][speedyCounter]
          : object.properties.DemandBaseline[speedyCounter] +
            object.properties.UnmetDemandBaseline[speedyCounter]
      }</div>
      <div><b>Unmet Demand</b> ${
        curScenario > -1
          ? -object.properties.UnmetDemand[SCENARIOS[curScenario]][
              speedyCounter
            ]
          : -object.properties.UnmetDemandBaseline[speedyCounter]
      }</div>
      ${
        object.properties.Groundwater
          ? `<div><b>Groundwater</b> ${object.properties.Groundwater[speedyCounter]}</div>`
          : ''
      }
      <div><b>Land Holder</b> ${
        // TODO refactor?
        HOLDERS[
          object.properties.LandUse.constructor === Array
            ? object.properties.LandUse[0]
            : object.properties.LandUse
        ]
      }</div>
      ${
        object.properties.MUnmetDemandBaseline
          ? `<div><b>Variance (UnmetDemandBaseline)</b> ${object.properties.MUnmetDemandBaseline[speedyCounter]}
      </div>`
          : ''
      }
      ${
        object.properties.GeoRgs
          ? `<div><b>Demand Regions</b> ${object.properties.GeoRgs.join(
              ', '
            )}</div>`
          : ''
      }
  `;
      } else {
        mainTooltipElem.current.classList.add('active');
        mainTooltipElem.current.innerHTML = `\
        <div><i>${date.toLocaleString('default', {
          month: 'long',
        })} ${date.toLocaleString('default', { year: 'numeric' })}</i></div>
        <div><i>${
          curScenario > -1
            ? SCENARIO_LABELS[curScenario]
            : 'Historical Baseline'
        }</i></div>
      ${
        object.properties.DU_ID
          ? `<b>Region ID</b> ${object.properties.DU_ID}</div>`
          : ''
      }
      <div><b>Demand</b> ${
        curScenario > -1
          ? object.properties.Demand[SCENARIOS[curScenario]][speedyCounter]
          : object.properties.DemandBaseline[speedyCounter]
      }</div>
      <div><b>Supply</b> ${
        curScenario > -1
          ? object.properties.Demand[SCENARIOS[curScenario]][speedyCounter] +
            object.properties.UnmetDemand[SCENARIOS[curScenario]][speedyCounter]
          : object.properties.DemandBaseline[speedyCounter] +
            object.properties.UnmetDemandBaseline[speedyCounter]
      }</div>
      <div><b>Unmet Demand</b> ${
        curScenario > -1
          ? -object.properties.UnmetDemand[SCENARIOS[curScenario]][
              speedyCounter
            ]
          : -object.properties.UnmetDemandBaseline[speedyCounter]
      }</div>
      ${
        object.properties.Groundwater
          ? `<div><b>Groundwater</b> ${object.properties.Groundwater[speedyCounter]}</div>`
          : ''
      }
      <div><b>Land Holder</b> ${
        // TODO refactor?
        HOLDERS[
          object.properties.LandUse.constructor === Array
            ? object.properties.LandUse[0]
            : object.properties.LandUse
        ]
      }</div>
      ${
        object.properties.MUnmetDemandBaseline
          ? `<div><b>Variance (UnmetDemandBaseline)</b> ${object.properties.MUnmetDemandBaseline[speedyCounter]}
      </div>`
          : ''
      }
      ${
        object.properties.GeoRgs
          ? `<div><b>Demand Regions</b> ${object.properties.GeoRgs.join(
              ', '
            )}</div>`
          : ''
      }
  `;
      }
      lastObject.current = object;
    },
    [slide, speedyCounter, curScenario]
  );

  return { getTooltip };
}
