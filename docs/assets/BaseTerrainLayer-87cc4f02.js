import{r as d}from"./index-3bff66e1.js";import{d as f}from"./scales-7c027d43.js";import{S as c,W as D,X as u,Y as b,e as B,g as $,k as V,C as L}from"./settings-cc329b7d.js";import{T as x,B as E}from"./tile-layer-fb41f257.js";const n=0;function A({speedyCounter:i,hextiles:t=!0}){const r=d.useRef(),a=d.useRef(),o=d.useRef({});d.useEffect(()=>{r.current=document.querySelector("#main-tooltip"),a.current=document.querySelector("#secondary-tooltip")},[]);const l=d.useCallback(e=>{const m=e.properties.Demand[c[n]][i],s=-e.properties.UnmetDemand[c[n]][i],v=-s-e.properties.UnmetDemandBaseline[i];r.current.classList.add("active"),a.current.classList.add("active"),a.current.innerHTML=`        <div><b>Region ID</b> ${e.properties.id}</div>
        <div><b>Scenario Demand</b> ${m}</div>
        <div><b>Scen. Unmet Demand</b> ${s}</div>
        <div><b>Difference in Unmet Demand</b> ${v}</div>
        <div><b>Land Holder</b> ${D(e)}</div>
      `},[i]),U=d.useCallback(e=>{if(a.current.classList.remove("active"),r.current.classList.add("active"),r.current.innerHTML=`        <div><i>${u(f(i))}</i></div>
      `,e.properties.Demand){const m=e.properties.Demand[c[n]][i],s=-e.properties.UnmetDemand[c[n]][i],v=-s-e.properties.UnmetDemandBaseline[i];r.current.innerHTML+=`        
          <div><i>${b[n]}</i></div>
          <div><b>Region ID</b> ${e.properties.id}</div>
          <div><b>Scenario Demand</b> ${m}</div>
          <div><b>Scen. Unmet Demand</b> ${s}</div>
          <div><b>Difference in Unmet Demand</b> ${v}</div>
          <div><b>Land Holder</b> ${D(e)}</div>
        `}else{const m=e.properties.Groundwater[i];r.current.innerHTML+=`     
          <div><b>Elem ID</b> ${e.properties.id}</div>
          <div><b>Groundwater</b> ${m}</div>
      `}},[i]),g=d.useCallback(e=>{const m=e.properties.Demand[c[n]][i],s=-e.properties.UnmetDemand[c[n]][i],v=-s-e.properties.UnmetDemandBaseline[i],T=e.properties.Groundwater[i],w=e.properties.GroundwaterVar[i],p=e.properties.UnmetDemandVar[c[n]][i],G=B(e.properties.UnmetDemandBaselineVar[i],p),H=e.properties.DURgs.join(", "),R=e.properties.GWRgs.join(", ");a.current.classList.remove("active"),r.current.classList.add("active"),r.current.innerHTML=`        <div><i>${u(f(i))}</i></div>
        <div><i>${b[n]}</i></div>
        <div><b>Groundwater</b> ${T}</div>
        <div><b>Scenario Demand</b> ${m}</div>
        <div><b>Scen. Unmet Demand</b> ${s}</div>
        <div><b>Difference in Unmet Demand</b> ${v}</div>
        <div><b>Land Holder</b> ${D(e)}</div>
        <div><b>Variance (GW)</b> ${w}</div>
        <div><b>Var. (Scen. UnmetDem)</b> ${p}</div>
        <div><b>Var. (Difference)</b> ${G}</div>
        <div><b>Demand Regions</b> ${H}</div>
        <div><b>GW Regions</b> ${R}</div>
      `},[i]);return d.useCallback(({object:e})=>{if(!e){o.current&&(a.current.classList.remove("active"),(!t||$(o.current))&&r.current.classList.remove("active"),o.current=e);return}$(e)&&t?g(e):V(e)&&t?l(e):U(e),o.current=e},[i])}class S extends L{renderLayers(){return[new x({data:"https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}",minZoom:7,maxZoom:11,tileSize:256,renderSubLayers:t=>{const{bbox:{west:r,south:a,east:o,north:l}}=t.tile;return new E(t,{data:null,image:t.data,bounds:[r,a,o,l]})}})]}}S.layerName="BaseTerrainLayer";S.defaultProps={...L.defaultProps};export{S as B,A as u};
