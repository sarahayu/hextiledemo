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

  const handleExtrudedGeo = useCallback((object) => {
    mainTooltipElem.current.classList.add('active');
    secondaryTooltipElem.current.classList.add('active');
    secondaryTooltipElem.current.innerHTML = `\
      <div><b>GEOID</b> ${object.properties.GEOID}</div>
      <div><b>Votes / Km2</b> ${object.properties.votes_per_sqkm}</div>
      <div><b>Percent Dem. Lead</b> ${object.properties.pct_dem_lead}</div>
    `;
  }, []);

  const handleBasicGeo = useCallback((object) => {
    secondaryTooltipElem.current.classList.remove('active');
    mainTooltipElem.current.classList.add('active');

    if (object.properties.pct_dem_lead)
      mainTooltipElem.current.innerHTML = `\
        <div><b>GEOID</b> ${object.properties.GEOID}</div>
        <div><b>Votes / Km2</b> ${object.properties.votes_per_sqkm}</div>
        <div><b>% Dem. Lead</b> ${object.properties.pct_dem_lead}</div>
      `;
    else
      mainTooltipElem.current.innerHTML = `\
        <div><b>County Subdiv.</b> ${
          object.properties['county_subdivision_dec_Geographic Area Name']
        }</div>
        <div><b>GEOID</b> ${object.properties.GEOID}</div>
        <div><b>% PoC</b> ${
          100 - object.properties['county_subdivision_dec_Percent White']
        }</div>
        <div><b>Pop. / Km2</b> ${object.properties['Population per Sqkm']}</div>
      `;
  }, []);

  const handleHex = useCallback((object) => {
    secondaryTooltipElem.current.classList.remove('active');
    mainTooltipElem.current.classList.add('active');
    mainTooltipElem.current.innerHTML = `\
      <div><b>% PoC</b> ${100 - object.properties['PercWhite']}</div>
      <div><b>Pop. / Km2</b> ${object.properties['PopSqKm']}</div>
      <div><b>Votes / Km2</b> ${object.properties.VotesPerSqKm}</div>
      <div><b>% Turnout / Km2</b> ${object.properties.TurnoutPerSqKm}</div>
      <div><b>% Dem. Lead</b> ${object.properties.DemLead}</div>
      <div><b>Num. of County Subdivs</b> ${
        object.properties.CountyRgs.length
      }</div>
      <div><b>Num. of Precincts</b> ${
        object.properties.PrecinctRgs.length
      }</div>
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
