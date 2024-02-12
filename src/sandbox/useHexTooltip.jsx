import React from 'react';

import { useCallback } from 'react';
import { dateInterpIdx } from 'src/utils/scales';
import { HOLDERS, SCENARIOS, SCENARIO_LABELS } from 'src/utils/settings';

export default function useHexTooltip({
  slide,
  counter,
  cycler,
  curScenario,
  speedyCounter,
}) {
  const getTooltip = useCallback(
    ({ object }) => {
      if (!object) return;

      const date = dateInterpIdx(speedyCounter);
      return (
        object && {
          html: `\
      <div><i>${date.toLocaleString('default', {
        month: 'long',
      })} ${date.toLocaleString('default', { year: 'numeric' })}</i></div>
      <div><i>${
        curScenario > -1 ? SCENARIO_LABELS[curScenario] : 'Historical Baseline'
      }</i></div>
      <div><b>Demand</b></div>
      <div>${
        curScenario > -1
          ? object.properties.Demand[SCENARIOS[curScenario]][speedyCounter]
          : object.properties.DemandBaseline[speedyCounter]
      }</div>
      <div><b>Supply</b></div>
      <div>${
        curScenario > -1
          ? object.properties.Demand[SCENARIOS[curScenario]][speedyCounter] +
            object.properties.UnmetDemand[SCENARIOS[curScenario]][speedyCounter]
          : object.properties.DemandBaseline[speedyCounter] +
            object.properties.UnmetDemandBaseline[speedyCounter]
      }</div>
      <div><b>Unmet Demand</b></div>
      <div>${
        curScenario > -1
          ? -object.properties.UnmetDemand[SCENARIOS[curScenario]][
              speedyCounter
            ]
          : -object.properties.UnmetDemandBaseline[speedyCounter]
      }</div>
      <div><b>Groundwater</b></div>
      <div>${
        object.properties.Groundwater
          ? object.properties.Groundwater[speedyCounter]
          : 'N/A'
      }</div>
      <div><b>Land Holder</b></div>
      <div>${
        HOLDERS[
          object.properties.LandUse[0]
            ? object.properties.LandUse[0]
            : object.properties.LandUse
        ]
      }</div>
      <div><b>Moran's I (UnmetDemandBaseline)</b></div>
      <div>${
        object.properties.MUnmetDemandBaseline
          ? object.properties.MUnmetDemandBaseline[speedyCounter]
          : 'N/A'
      }</div>
  `,
        }
      );
    },
    [counter, slide, speedyCounter, cycler, curScenario]
  );

  return { getTooltip };
}
