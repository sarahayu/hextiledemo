import{r as u,R as o}from"./index-47bc6533.js";import{j as C,M as I,m as R,l as T,L as v,q,C as w,s as k,p as g,Q as x,R as y,U as L}from"./settings-3f87ae0a.js";import{u as D,e as P,E as p}from"./electionInterps-d58b56f5.js";import{u as M}from"./useHexMouseEvts-e2c6d0a8.js";import{S as m}from"./SolidSquareTileLayer-3c2605c0.js";import{D as _,g as A,U as f,a as b}from"./overlay-27be0fdc.js";const $=await C("election_square_3_4"),N=Object.keys($).map(r=>parseInt(r)),E=[5,7];function j(){const[r,n]=u.useState(5),d=D(),i=M({disabled:d.curOption>1,dataDeag:P,deagKey:"PrecinctRgs"}),l={data:$,...d,...i};return o.createElement(o.Fragment,null,o.createElement(I,{reuseMaps:!0,preventStyleDiffing:!0,mapLib:R,mapStyle:"https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",antialias:!0,initialViewState:T},o.createElement(_,{interleaved:!0,effects:[v],onViewStateChange:({viewState:c})=>{n(c.zoom)}},o.createElement(h,{id:"slide-election",...l,zoomRange:E,visible:!0,beforeId:"place_hamlet"}))),o.createElement(F,{res:q().domain(E).range(N)(r),...l}))}class h extends w{renderLayers(){const{data:n,curOption:d,speedyCounter:i=1026,clickedHexes:l,selectionFinalized:c,visible:a,zoomRange:e}=this.props;return[new m({id:"SquareBorders",data:n,getFillColor:[0,0,0,0],getLineColor:[80,80,80,100],stroked:!0,lineWidthUnits:"pixels",getValue:t=>2,visible:a,extruded:!1,opacity:1,zoomRange:e,offset:[0,0]}),new m({id:"PoC",data:n,getFillColor:[0,121,42],getValue:t=>p.poc.scaleLinear(t.properties.PoC),visible:a,extruded:!1,opacity:1,zoomRange:e,offset:[-1,-1]}),new m({id:"Dem",data:n,getFillColor:[72,30,197],getValue:t=>p.party.scaleLinear(t.properties.DemLead>0?t.properties.DemLead*2-100:-100),visible:a,extruded:!1,opacity:1,zoomRange:e,offset:[-1,1]}),new m({id:"Repub",data:n,getFillColor:[165,0,38],getValue:t=>p.party.scaleLinear(t.properties.DemLead<0?-t.properties.DemLead*2-100:-100),visible:a,extruded:!1,opacity:1,zoomRange:e,offset:[1,1]}),new m({id:"Pop",data:n,getFillColor:[156,156,156],getValue:t=>p.population.scaleLinear(t.properties.PopSqKm),visible:a,extruded:!1,opacity:1,zoomRange:e,offset:[1,-1]})]}}h.layerName="MultivariableSquareTileLayer";h.defaultProps={...w.defaultProps,autoHighlight:!0};function S(r){return b(parseInt(r),f.km)*2}function F({res:r}){const n=u.useRef(),d=u.useRef();return u.useLayoutEffect(()=>{const i=window.innerHeight,l=window.innerWidth,c=k(n.current).attr("width",l).attr("height",i);c.append("g").attr("transform",`translate(${l-60},${i-170})`).call(a=>{a.append("rect").attr("x",-50).attr("y",-50).attr("width",100).attr("height",100).attr("fill","rgba(146, 146, 146, 0.5)")}).call(function(a){d.current=[a.append("text").attr("x",0).attr("y",8).attr("text-anchor","middle").style("font-weight","bold").style("blend-mode","multiply").text(`${g(".2s")(A(r,f.km2))} km²`),a.append("text").attr("x",0).attr("y",55).attr("text-anchor","middle").style("font-size","11px").text(`← ${g(".2s")(b(r,f.km))} km →;`)]}),c.append("g").attr("transform",`translate(120,${i-140})`).call(a=>{a.append("rect").attr("x",-120).attr("y",-140).attr("width",459).attr("height",240).attr("fill","rgba(255, 255, 255, 1)");const e=75;a.append("text").attr("x",e).attr("y",-e-15).style("font-weight","bold").attr("text-anchor","middle").text("Measure Type"),a.append("rect").attr("x",0).attr("y",-e).attr("width",e).attr("height",e).attr("fill","rgba(72, 30, 197, 0.7)"),a.append("rect").attr("x",e).attr("y",-e).attr("width",e).attr("height",e).attr("fill","rgba(165, 0, 38, 0.7)"),a.append("rect").attr("x",e).attr("y",0).attr("width",e).attr("height",e).attr("fill","rgba(156, 156, 156, 0.7)"),a.append("rect").attr("x",0).attr("y",0).attr("width",e).attr("height",e).attr("fill","rgba(0, 121, 42, 0.7)");let t,s;t=[100,0],s=x().range([0,e]).domain([t[0],-(t[1]-t[0])/2,t[1]]),a.append("g").attr("transform",`translate(0,${-e})`).call(y(s)),t=p.poc.scaleLinear.domain(),s=x().range([0,e]).domain([t[0],(t[1]-t[0])/2,t[1]]),a.append("g").attr("transform","translate(0,0)").call(y(s)),t=[-100,0],s=x().range([0,e]).domain([t[0],-(t[1]-t[0])/2,t[1]]),a.append("g").attr("transform",`translate(${e*2},${-e})`).call(L(s)),t=p.population.scaleLinear.domain(),s=x().range([0,e]).domain([t[0],(t[1]-t[0])/2,t[1]]),a.append("g").attr("transform",`translate(${e*2},0)`).call(L(s)),a.append("text").attr("x",-20).attr("y",-18).attr("text-anchor","end").text("% Dem. Lead"),a.append("text").attr("x",e*2+20).attr("y",-18).attr("text-anchor","start").text("% Rep. Lead"),a.append("text").attr("x",e*2+20).attr("y",0+12).attr("text-anchor","start").text("Pop. / Km2"),a.append("text").attr("x",-20).attr("y",0+12).attr("text-anchor","end").text("% PoC")})},[]),u.useEffect(()=>{let[i,l]=d.current;i.text(`${g(".2s")(Math.pow(S(r),2))} km²`),l.text(`← ${g(".2s")(S(r))} km →;`)},[r]),o.createElement(o.Fragment,null,o.createElement("svg",{className:"legend-area",ref:n}))}export{j as default};