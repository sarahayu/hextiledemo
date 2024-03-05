import React, { useEffect, useRef } from 'react';

import { useCallback } from 'react';
import { dateInterpIdx } from 'src/utils/scales';
import { HOLDERS, SCENARIOS, SCENARIO_LABELS } from 'src/utils/settings';
import { indepVariance } from 'src/utils/utils';

const isGeo = (o) => !!(o.properties || {}).DU_ID;

export default function useHexTooltip({
  slide,
  curScenario,
  speedyCounter,
  curOption,
}) {
  const mainTooltipElem = useRef();
  const mainTooltipContent = useRef();
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

        if (curOption > 1) {
          secondaryTooltipElem.current.classList.remove('active');
          mainTooltipElem.current.classList.remove('active');
        }
        return;
      }

      if (lastObject.current) {
        if (isGeo(lastObject.current)) {
          secondaryTooltipElem.current.classList.remove('active');
        }
      }

      const date = dateInterpIdx(speedyCounter);
      if (curOption <= 1 && isGeo(object)) {
        mainTooltipElem.current.classList.add('active');
        mainTooltipElem.current.innerHTML = mainTooltipContent.current;
        secondaryTooltipElem.current.classList.add('active');
        secondaryTooltipElem.current.innerHTML = `\
      ${
        object.properties.DU_ID
          ? `<div><b>Region ID</b> ${object.properties.DU_ID}</div>`
          : ''
      }
      <div><b>Scenario Demand</b> ${
        curScenario > -1
          ? object.properties.Demand[SCENARIOS[curScenario]][speedyCounter]
          : object.properties.DemandBaseline[speedyCounter]
      }</div>
      <div><b>Scen. Unmet Demand</b> ${
        curScenario > -1
          ? -object.properties.UnmetDemand[SCENARIOS[curScenario]][
              speedyCounter
            ]
          : -object.properties.UnmetDemandBaseline[speedyCounter]
      }</div>
      <div><b>Difference in Unmet Demand</b> ${
        object.properties.UnmetDemand[SCENARIOS[curScenario]][speedyCounter] -
        object.properties.UnmetDemandBaseline[speedyCounter]
      }</div>
      <div><b>Land Holder</b> ${
        // TODO refactor?
        HOLDERS[
          object.properties.LandUse.constructor === Array
            ? object.properties.LandUse[0]
            : object.properties.LandUse
        ]
      }</div>
  `;
      } else {
        mainTooltipElem.current.classList.add('active');
        if (object.properties.GroundwaterVar == undefined) {
          mainTooltipElem.current.innerHTML = mainTooltipContent.current = `\
        <div><i>${date.toLocaleString('default', {
          month: 'long',
        })} ${date.toLocaleString('default', { year: 'numeric' })}</i></div>
        <div><i>${
          object.properties.DU_ID
            ? curScenario > -1
              ? SCENARIO_LABELS[curScenario]
              : 'Historical Baseline'
            : ''
        }</i></div>
        ${
          object.properties.DU_ID
            ? `<b>Region ID</b> ${object.properties.DU_ID}</div>`
            : ''
        }
        ${
          object.properties.elem_id
            ? `<b>Elem ID</b> ${object.properties.elem_id}</div>`
            : ''
        }
        ${
          object.properties.Groundwater
            ? `<div><b>Groundwater</b> ${object.properties.Groundwater[speedyCounter]}</div>`
            : ''
        }
        ${
          object.properties.DU_ID
            ? `
          <div><b>Scenario Demand</b> ${
            curScenario > -1
              ? object.properties.Demand[SCENARIOS[curScenario]][speedyCounter]
              : object.properties.DemandBaseline[speedyCounter]
          }</div>
          <div><b>Scen. Unmet Demand</b> ${
            curScenario > -1
              ? -object.properties.UnmetDemand[SCENARIOS[curScenario]][
                  speedyCounter
                ]
              : -object.properties.UnmetDemandBaseline[speedyCounter]
          }</div>
          <div><b>Difference in Unmet Demand</b> ${
            object.properties.UnmetDemand[SCENARIOS[curScenario]][
              speedyCounter
            ] - object.properties.UnmetDemandBaseline[speedyCounter]
          }</div>`
            : ''
        }
      `;
        } else {
          mainTooltipElem.current.innerHTML = mainTooltipContent.current = `\
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
      ${
        object.properties.Groundwater
          ? `<div><b>Groundwater</b> ${object.properties.Groundwater[speedyCounter]}</div>`
          : ''
      }
      <div><b>Scenario Demand</b> ${
        curScenario > -1
          ? object.properties.Demand[SCENARIOS[curScenario]][speedyCounter]
          : object.properties.DemandBaseline[speedyCounter]
      }</div>
      <div><b>Scen. Unmet Demand</b> ${
        curScenario > -1
          ? -object.properties.UnmetDemand[SCENARIOS[curScenario]][
              speedyCounter
            ]
          : -object.properties.UnmetDemandBaseline[speedyCounter]
      }</div>
      <div><b>Difference in Unmet Demand</b> ${
        object.properties.UnmetDemand[SCENARIOS[curScenario]][speedyCounter] -
        object.properties.UnmetDemandBaseline[speedyCounter]
      }</div>
      <div><b>Land Holder</b> ${
        // TODO refactor?
        HOLDERS[
          object.properties.LandUse.constructor === Array
            ? object.properties.LandUse[0]
            : object.properties.LandUse
        ]
      }</div>
      ${
        object.properties.GroundwaterVar
          ? `<div><b>Variance (GW)</b> ${object.properties.GroundwaterVar[speedyCounter]}
      </div>`
          : ''
      }
      ${
        object.properties.UnmetDemandVar
          ? `<div><b>Var. (Scen. UnmetDem)</b> ${
              object.properties.UnmetDemandVar[SCENARIOS[curScenario]][
                speedyCounter
              ]
            }
      </div>`
          : ''
      }
      ${
        object.properties.UnmetDemandVar
          ? `<div><b>Var. (Difference)</b> ${indepVariance(
              object.properties.UnmetDemandBaselineVar[speedyCounter],
              object.properties.UnmetDemandVar[SCENARIOS[curScenario]][
                speedyCounter
              ]
            )}
      </div>`
          : ''
      }
      ${
        object.properties.DURgs
          ? `<div><b>Demand Regions</b> ${object.properties.DURgs.join(
              ', '
            )}</div>`
          : ''
      }
      ${
        object.properties.GWRgs
          ? `<div><b>GW Regions</b> ${object.properties.GWRgs.join(', ')}</div>`
          : ''
      }
  `;
        }
      }
      lastObject.current = object;
    },
    [slide, speedyCounter, curScenario, curOption]
  );

  return { getTooltip };
}
