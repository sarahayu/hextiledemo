import{r as n,R as i}from"./index-47bc6533.js";import{j as C,a as E,b as _,c as I,w as R,C as h,M as T,m as k,d as G,L as O,q as D,s as $,h as x,e as V,f as F,g as H,k as N}from"./settings-3f87ae0a.js";import{C as M}from"./groundwaterGeo-46c54bcf.js";import"./scales-0efcb647.js";import{O as z}from"./index-bac40e01.js";import{S,P as q,I as A}from"./SolidHexTileLayer-72de8124.js";import{G as U,l as B}from"./index-230f96f1.js";import{D as K}from"./overlay-27be0fdc.js";import{T as W,B as Z}from"./tile-layer-0fe13059.js";import{s as f}from"./selectAll-b7696bd5.js";const L=await C("wildfire_hex_7_8");function J(){const[p,t]=n.useState(1);return{curOption:p,setCurOption:t}}function X({curOption:p}){const t=n.useRef(),a=n.useRef(),s=n.useRef({});n.useEffect(()=>{t.current=document.querySelector("#main-tooltip"),a.current=document.querySelector("#secondary-tooltip")},[]);const l=n.useCallback(e=>{t.current.classList.add("active"),a.current.classList.add("active"),a.current.innerHTML=`      <div><b>GEOID</b> ${e.properties.GEOID}</div>
      <div><b>Votes / Km2</b> ${e.properties.votes_per_sqkm}</div>
      <div><b>Percent Dem. Lead</b> ${e.properties.pct_dem_lead}</div>
    `},[]),d=n.useCallback(e=>{a.current.classList.remove("active"),t.current.classList.add("active"),e.properties.pct_dem_lead?t.current.innerHTML=`        <div><b>GEOID</b> ${e.properties.GEOID}</div>
        <div><b>Votes / Km2</b> ${e.properties.votes_per_sqkm}</div>
        <div><b>% Dem. Lead</b> ${e.properties.pct_dem_lead}</div>
      `:t.current.innerHTML=`        <div><b>County Subdiv.</b> ${e.properties["county_subdivision_dec_Geographic Area Name"]}</div>
        <div><b>GEOID</b> ${e.properties.GEOID}</div>
        <div><b>% PoC</b> ${100-e.properties["county_subdivision_dec_Percent White"]}</div>
        <div><b>Pop. / Km2</b> ${e.properties["Population per Sqkm"]}</div>
      `},[]),c=n.useCallback(e=>{a.current.classList.remove("active"),t.current.classList.add("active"),t.current.innerHTML=`    <div><b>% PoC</b> ${e.properties.PoC}</div>
    <div><b>% PoC Var</b> ${e.properties.PoCVar}</div>
      <div><b>Pop. Den</b> ${e.properties.PopSqKm}</div>
      <div><b>Pop. Den Var</b> ${e.properties.PopSqKmVar}</div>
      <div><b>% Dem. Lead</b> ${e.properties.DemLead}</div>
      <div><b>% Dem. Lead Var</b> ${e.properties.DemLeadVar}</div>
      <div><b>Num. of County Subdivs</b> ${e.properties.CountyRgs.length}</div>
      <div><b>Num. of Precincts</b> ${e.properties.PrecinctRgs.length}</div>
      `},[]);return n.useCallback(({object:e})=>{if(!e){s.current&&(a.current.classList.remove("active"),E(s.current)&&t.current.classList.remove("active"),s.current=e);return}E(e)?c(e):_(e)?l(e):d(e),s.current=e},[])}const o=I(R,L);function b(p){return p.properties.Fire!=0?Math.pow(o.elev.scaleLinear(p.properties.Elev),2)*3e3:0}class y extends h{renderLayers(){const{data:t,visible:a,zoomRange:s,useVsup:l,showAllRings:d,useElev:c}=this.props;return[new S({id:"Fire",data:t,thicknessRange:[0,1],getFillColor:r=>l?o.fire.interpVsup(r.properties.Fire||0,r.properties.FireVar||0,r.properties.Fire===0,.001):o.fire.interpColor(r.properties.Fire||0,r.properties.Fire===0,!0,.001),extruded:!0,getElevation:c?b:0,opacity:1,visible:a,updateTriggers:{getFillColor:[l]},zoomRange:s,pickable:!1}),new S({id:"GR2",data:t,thicknessRange:[.4,.65],getFillColor:r=>o.gr2.interpColor(r.properties.SpreadRate,!d),getValue:r=>l?o.gr2.scaleLinearVar(r.properties.SpreadRateVar)*.7+.3:1,visible:a,stroked:!0,raised:!0,getElevation:c?b:0,lineJointRounded:!0,getLineColor:[255,255,255,200],getOffset:-.5,extensions:[new q({offset:!0})],opacity:1,updateTriggers:{getFillColor:[d],getValue:[l]},zoomRange:s,pickable:!1}),new A({id:"Personnel",data:t,loaders:[z],mesh:"assets/human.obj",raised:!0,getElevation:c?b:0,getColor:r=>[255,255,7,(l?o.personnel.scaleLinearVar(r.properties.PersVar):1)*200+55],getValue:r=>o.personnel.scaleLinear(r.properties.Pers),visible:a,sizeScale:400,opacity:1,updateTriggers:{getColor:[l]},zoomRange:s,pickable:!1})]}}y.layerName="MultivariableHextileLayer";y.defaultProps={...h.defaultProps,autoHighlight:!0};class P extends h{renderLayers(){return[new W({data:"http://infovis.cs.ucdavis.edu/mapProxy/wmts/fbfm40/webmercator/{z}/{x}/{y}.png",minZoom:2,maxZoom:11,tileSize:256,renderSubLayers:t=>{const{bbox:{west:a,south:s,east:l,north:d}}=t.tile;return new Z(t,{data:null,image:t.data,bounds:[a,s,l,d]})}})]}}P.layerName="BaseTerrainLayer";P.defaultProps={...h.defaultProps};const Q=Object.keys(L).map(p=>parseInt(p)),w=[10,12];function pe(){const[p,t]=n.useState(5),[a,s]=n.useState(!1),[l,d]=n.useState(!1),[c,r]=n.useState(!1),e=J(),m=X(e),u={data:L,...e};return i.createElement(i.Fragment,null,i.createElement(T,{reuseMaps:!0,preventStyleDiffing:!0,mapLib:k,mapStyle:"https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",antialias:!0,initialViewState:G},i.createElement(K,{getTooltip:m,interleaved:!0,effects:[O],onViewStateChange:({viewState:g})=>{t(g.zoom)},antialias:!0},i.createElement(U,{id:"ground",data:M,stroked:!1,getFillColor:[0,0,0,0],beforeId:"landcover"}),i.createElement(y,{id:"slide-election",...u,zoomRange:w,visible:!0,useVsup:a,showAllRings:l,useElev:c,beforeId:"place_hamlet"}))),i.createElement(Y,{res:D().domain(w).range(Q)(p),useVsup:a,setUseVsup:s,showAllRings:l,setShowAllRings:d,useElev:c,setUseElev:r}))}function Y({res:p,useVsup:t,setUseVsup:a,showAllRings:s,setShowAllRings:l,useElev:d,setUseElev:c}){const r=n.useRef();return n.useEffect(()=>{f(".lin-legend").style("visibility",t?"hidden":"visible"),f(".vsup-legend-v").style("visibility",t?"visible":"hidden"),f(".vsup-legend-u").attr("transform",`translate(0,${t?0:50})`),f(".box1").attr("transform",`translate(0,${t?0:150})`).attr("height",t?250:100).attr("width",t?250:300),f(".box2").attr("transform",`translate(0,${t?0:60})`).attr("height",t?170:110)},[t]),n.useEffect(()=>{$("#diff-u").html("").call(x(o.gr2,"ROS (ch/h)",s,".2"))},[s]),n.useLayoutEffect(()=>{const e=$(r.current).attr("width",window.innerWidth).attr("height",window.innerHeight),m=200,u=e.append("g").attr("transform",`translate(0,${window.innerHeight-m})`);u.append("g").attr("transform",`translate(0,${m-250})`).append("rect").attr("class","box1").attr("height",250).attr("width",250).attr("fill","white"),u.append("g").attr("transform",`translate(0,${m-170})`).append("rect").attr("class","box2").attr("height",170).attr("width",920).attr("x",350).attr("fill","white"),u.append("g").attr("class","vsup-legend-v").append("g").call(V().vtitle("Power").utitle("Uncertainty").scale(o.fire.vsup).size(150).x(40).y(m-150-40)),u.append("g").attr("class","lin-legend").append("g").call(B.simpleLegend(null,250,20,".2s").title("Power").size(250).height(20).scale(o.fire.colorsStepped).x(20).y(m-70));let g=400,v=m-120;u.append("g").attr("transform",`translate(${g},${v})`).append("g").attr("class","vsup-legend-u").attr("id","diff-u").call(x(o.gr2,"ROS (ch/h)",s,".2")),u.append("g").attr("transform",`translate(${g},${v+20})`).append("g").attr("class","vsup-legend-v").call(F(o.gr2,!0)),g=750,v=m-120,u.append("g").attr("transform",`translate(${g},${v})`).append("g").attr("class","vsup-legend-u").call(H(o.personnel,"assets/human.png","Personnel",".2")),u.append("g").attr("transform",`translate(${g},${v+55})`).append("g").attr("class","vsup-legend-v").call(N(o.personnel,"assets/human.png"))},[]),i.createElement(i.Fragment,null,i.createElement("svg",{className:"legend-area",ref:r}),i.createElement("div",{className:"study-input"},i.createElement("input",{type:"checkbox",checked:t,onChange:()=>a(e=>!e)}),i.createElement("span",null,"Use VSUP"),i.createElement("input",{type:"checkbox",checked:s,onChange:()=>l(e=>!e)}),i.createElement("span",null,"Show All Rings"),i.createElement("input",{type:"checkbox",checked:d,onChange:()=>c(e=>!e)}),i.createElement("span",null,"Show Elevation")))}export{pe as default};
