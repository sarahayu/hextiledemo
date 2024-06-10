import{r as i}from"./index-7d9125c4.js";import"./scales-aa151059.js";import{g as o,k as v}from"./settings-71d1aff4.js";function b({hextiles:d=!0}){const r=i.useRef(),s=i.useRef(),t=i.useRef({});i.useEffect(()=>{r.current=document.querySelector("#main-tooltip"),s.current=document.querySelector("#secondary-tooltip")},[]);const p=i.useCallback(e=>{r.current.classList.add("active"),s.current.classList.add("active"),s.current.innerHTML=`      <div><b>GEOID</b> ${e.properties.GEOID}</div>
      <div><b>Votes / Km2</b> ${e.properties.votes_per_sqkm}</div>
      <div><b>Percent Dem. Lead</b> ${e.properties.pct_dem_lead}</div>
    `},[]),n=i.useCallback(e=>{s.current.classList.remove("active"),r.current.classList.add("active"),e.properties.pct_dem_lead?r.current.innerHTML=`        <div><b>GEOID</b> ${e.properties.GEOID}</div>
        <div><b>Votes / Km2</b> ${e.properties.votes_per_sqkm}</div>
        <div><b>% Dem. Lead</b> ${e.properties.pct_dem_lead}</div>
      `:r.current.innerHTML=`        <div><b>County Subdiv.</b> ${e.properties["county_subdivision_dec_Geographic Area Name"]}</div>
        <div><b>GEOID</b> ${e.properties.GEOID}</div>
        <div><b>% PoC</b> ${100-e.properties["county_subdivision_dec_Percent White"]}</div>
        <div><b>Pop. / Km2</b> ${e.properties["Population per Sqkm"]}</div>
      `},[]),a=i.useCallback(e=>{s.current.classList.remove("active"),r.current.classList.add("active"),r.current.innerHTML=`    <div><b>% PoC</b> ${e.properties.PoC}</div>
    <div><b>% PoC Var</b> ${e.properties.PoCVar}</div>
      <div><b>Pop. Den</b> ${e.properties.PopSqKm}</div>
      <div><b>Pop. Den Var</b> ${e.properties.PopSqKmVar}</div>
      <div><b>% Dem. Lead</b> ${e.properties.DemLead}</div>
      <div><b>% Dem. Lead Var</b> ${e.properties.DemLeadVar}</div>
      <div><b>Num. of County Subdivs</b> ${e.properties.CountyRgs.length}</div>
      <div><b>Num. of Precincts</b> ${e.properties.PrecinctRgs.length}</div>
      `},[]);return i.useCallback(({object:e})=>{if(!e){t.current&&(s.current.classList.remove("active"),(!d||o(t.current))&&r.current.classList.remove("active"),t.current=e);return}o(e)&&d?a(e):v(e)&&d?p(e):n(e),t.current=e},[])}export{b as u};
