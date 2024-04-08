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

export default function useHexTooltip({ hextiles = true }) {
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
    // mainTooltipElem.current.innerHTML = `\
    // <div><b># PoC</b> ${object.properties['PoC']}</div>
    // <div><b># PoC Var</b> ${object.properties['PoCVar']}</div>
    //   <div><b>Pop.</b> ${object.properties['Pop']}</div>
    //   <div><b>Pop. Var</b> ${object.properties['PopVar']}</div>
    //   <div><b># Dem.</b> ${object.properties.DemLead}</div>
    //   <div><b># Dem. Var</b> ${object.properties.DemLeadVar}</div>
    //   <div><b>Num. of County Subdivs</b> ${object.properties.CountyRgs.length}</div>
    //   <div><b>Num. of Precincts</b> ${object.properties.PrecinctRgs.length}</div>
    //   `;

    mainTooltipElem.current.innerHTML = `\
    <div><b>% PoC</b> ${object.properties['PoC']}</div>
    <div><b>% PoC Var</b> ${object.properties['PoCVar']}</div>
      <div><b>Pop. Den</b> ${object.properties['PopSqKm']}</div>
      <div><b>Pop. Den Var</b> ${object.properties['PopSqKmVar']}</div>
      <div><b>% Dem. Lead</b> ${object.properties.DemLead}</div>
      <div><b>% Dem. Lead Var</b> ${object.properties.DemLeadVar}</div>
      <div><b>Num. of County Subdivs</b> ${object.properties.CountyRgs.length}</div>
      <div><b>Num. of Precincts</b> ${object.properties.PrecinctRgs.length}</div>
      `;
  }, []);

  const getTooltip = useCallback(({ object }) => {
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
  }, []);

  return getTooltip;
}
