import{r as d}from"./index-47bc6533.js";import{d as p}from"./scales-0efcb647.js";import{S as t,X as l,Y as f,Z as $,i as T,a as u,b as V}from"./settings-3f87ae0a.js";const n=0;function M({speedyCounter:e,hextiles:o=!0}){const r=d.useRef(),c=d.useRef(),v=d.useRef({});d.useEffect(()=>{r.current=document.querySelector("#main-tooltip"),c.current=document.querySelector("#secondary-tooltip")},[]);const b=d.useCallback(i=>{const s=i.properties.Demand[t[n]][e],a=-i.properties.UnmetDemand[t[n]][e],m=-a-i.properties.UnmetDemandBaseline[e];r.current.classList.add("active"),c.current.classList.add("active"),c.current.innerHTML=`        <div><b>Region ID</b> ${i.properties.id}</div>
        <div><b>Scenario Demand</b> ${s}</div>
        <div><b>Scen. Unmet Demand</b> ${a}</div>
        <div><b>Difference in Unmet Demand</b> ${m}</div>
        <div><b>Land Holder</b> ${l(i)}</div>
      `},[e]),U=d.useCallback(i=>{if(c.current.classList.remove("active"),r.current.classList.add("active"),r.current.innerHTML=`        <div><i>${f(p(e))}</i></div>
      `,i.properties.Demand){const s=i.properties.Demand[t[n]][e],a=-i.properties.UnmetDemand[t[n]][e],m=-a-i.properties.UnmetDemandBaseline[e];r.current.innerHTML+=`        
          <div><i>${$[n]}</i></div>
          <div><b>Region ID</b> ${i.properties.id}</div>
          <div><b>Scenario Demand</b> ${s}</div>
          <div><b>Scen. Unmet Demand</b> ${a}</div>
          <div><b>Difference in Unmet Demand</b> ${m}</div>
          <div><b>Land Holder</b> ${l(i)}</div>
        `}else{const s=i.properties.Groundwater[e];r.current.innerHTML+=`     
          <div><b>Elem ID</b> ${i.properties.id}</div>
          <div><b>Groundwater</b> ${s}</div>
      `}},[e]),L=d.useCallback(i=>{const s=i.properties.Demand[t[n]][e],a=-i.properties.UnmetDemand[t[n]][e],m=-a-i.properties.UnmetDemandBaseline[e],S=i.properties.Groundwater[e],g=i.properties.GroundwaterVar[e],D=i.properties.UnmetDemandVar[t[n]][e],H=T(i.properties.UnmetDemandBaselineVar[e],D),G=i.properties.DURgs.join(", "),R=i.properties.GWRgs.join(", ");c.current.classList.remove("active"),r.current.classList.add("active"),r.current.innerHTML=`        <div><i>${f(p(e))}</i></div>
        <div><i>${$[n]}</i></div>
        <div><b>Groundwater</b> ${S}</div>
        <div><b>Scenario Demand</b> ${s}</div>
        <div><b>Scen. Unmet Demand</b> ${a}</div>
        <div><b>Difference in Unmet Demand</b> ${m}</div>
        <div><b>Land Holder</b> ${l(i)}</div>
        <div><b>Variance (GW)</b> ${g}</div>
        <div><b>Var. (Scen. UnmetDem)</b> ${D}</div>
        <div><b>Var. (Difference)</b> ${H}</div>
        <div><b>Demand Regions</b> ${G}</div>
        <div><b>GW Regions</b> ${R}</div>
      `},[e]);return d.useCallback(({object:i})=>{if(!i){v.current&&(c.current.classList.remove("active"),(!o||u(v.current))&&r.current.classList.remove("active"),v.current=i);return}u(i)&&o?L(i):V(i)&&o?b(i):U(i),v.current=i},[e])}export{M as u};
