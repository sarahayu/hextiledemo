import{r as H,R as p}from"./index-47bc6533.js";import{C as I,n as G,q as x,F as y,r as z,t as O,i as N,S as _,I as T,M as j,m as B,L as W}from"./settings-3f87ae0a.js";import{W as g,d as k,u as Y,w as D}from"./waterInterps-a0e402f2.js";import{C as X}from"./groundwaterGeo-46c54bcf.js";import{u as Z}from"./useHexMouseEvts-e2c6d0a8.js";import{u as q}from"./useHexTooltip-f3d2ccc2.js";import{e as P,o as v,c as J,a as f,U as c,D as K}from"./overlay-27be0fdc.js";import{G as Q}from"./GUI-ef54c7ab.js";import{S as b,P as $}from"./SolidHexTileLayer-72de8124.js";import{D as ee}from"./DeagHexTileLayer-0ebf5e53.js";import{I as F,G as te}from"./index-230f96f1.js";import"./scales-0efcb647.js";import"./selectAll-b7696bd5.js";const se=x().domain([0,1]).range(O(0,y.length)),oe=y[0];class E extends I{initializeState(){super.initializeState();const{zoom:o}=this.context.viewport,e=Object.keys(this.props.data).map(s=>parseInt(s)),r=G().domain(this.props.zoomRange).range([0,1]).clamp(!0),a=x().domain([0,1]).range(e)(r(o));this.setState({hextiles:this.props.data,resRange:e,lastResolution:a,valueInterpResolution:r}),this.createPolygons()}createPolygons(){const{hextiles:o,lastResolution:e}=this.state,r=[],a=o[e],[s,i]=this.props.offset;Object.keys(a).forEach(t=>{const n=a[t],l=P(v(t)[0],c.km)*.48,[d,h]=J(t);let S=0;const L=f(e,c.km)/f(5,c.km);for(let[R,V,U]of this.props.getValue?oe:[[0,0,0]]){const[A,M]=z([(R+s)*l,(V+i)*l],h,d);r.push({position:[h+A,d+M,(typeof this.props.getElevation=="function"?this.props.getElevation({properties:n}):this.props.getElevation)+U*1e5*L],properties:n,polyIdx:S++,hexID:t})}}),this.setState({...this.state,polygons:r})}shouldUpdateState({changeFlags:o}){return o.somethingChanged}updateState(o){const{resRange:e,lastResolution:r,valueInterpResolution:a}=this.state,{props:s,oldProps:i,changeFlags:t,context:n}=o;if(s.getElevation!=i.getElevation||t.viewportChanged){const l=x().domain([0,1]).range(e)(a(n.viewport.zoom));(l!=r||s.getElevation!=i.getElevation)&&(this.setState({...this.state,lastResolution:l}),this.createPolygons())}}renderLayers(){const{polygons:o,lastResolution:e,resRange:r}=this.state,a=f(e,c.km)/f(5,c.km);return[new F(this.getSubLayerProps({iconAtlas:this.props.hexIconAtlas,iconMapping:this.props.hexIconMapping,sizeScale:this.props.sizeScale,billboard:this.props.billboard,sizeUnits:this.props.sizeUnits,sizeMinPixels:this.props.sizeMinPixels,sizeMaxPixels:this.props.sizeMaxPixels,alphaCutoff:this.props.alphaCutoff,getPosition:this.props.getPosition,getIcon:this.props.getHexIcon,getColor:this.props.getColor,getSize:this.props.getSize,getAngle:this.props.getAngle,getPixelOffset:this.props.getPixelOffset,onIconError:this.props.onIconError,textureParameters:this.props.textureParameters,updateTriggers:this.props.updateTriggers,id:"IconHexTileFlatLayer",data:o,getPosition:s=>{if(this.props.getValue===null)return[0,0,0];const i=y[se(this.props.getValue(s))][s.polyIdx],t=y[0][s.polyIdx],n=P(v(s.hexID)[0],c.km)*.5,l=-n/3,d=(i[0]-t[0])*n,h=(i[1]-t[1])*n+l,S=(i[2]-t[2])*1e5*a,[L,R]=z([d,h],s.position[0],s.position[1]);return[s.position[0]+L,s.position[1]+R,s.position[2]+S]},sizeScale:this.props.sizeScale*a}))]}}E.layerName="IconHexTileFlatLayer";E.defaultProps={...I.defaultProps,...F.defaultProps,thicknessRange:[.7,.9],getValue:null,getElevation:()=>0,offset:[0,0],zoomRange:[7,9]};const u=_[0];class C extends I{renderLayers(){const{data:o,speedyCounter:e,visible:r,zoomRange:a,useVsup:s,showAllRings:i}=this.props;return[new b({id:"Groundwater",data:o,thicknessRange:[0,1],getFillColor:t=>s?g.groundwater.interpVsup(t.properties.Groundwater[e],t.properties.GroundwaterVar[e]):g.groundwater.interpColor(t.properties.Groundwater[e]),opacity:1,visible:r,updateTriggers:{getFillColor:[e,s]},zoomRange:a,pickable:!1}),new b({id:"DiffRings",data:o,thicknessRange:[.4,.65],getFillColor:t=>g.difference.interpColor(t.properties.UnmetDemand[u][e]-t.properties.UnmetDemandBaseline[e],!i),getValue:t=>s?g.difference.scaleLinearVar(N(t.properties.UnmetDemandBaselineVar[e],t.properties.UnmetDemandVar[u][e]))*.7+.3:1,visible:r,stroked:!0,extruded:!1,lineJointRounded:!0,getLineColor:[255,255,255,200],getOffset:-.5,extensions:[new $({offset:!0})],opacity:1,updateTriggers:{getFillColor:[e,i],getValue:[e,s]},zoomRange:a,pickable:!1}),new E({id:"ScenarioUnmet",data:o,hexIconAtlas:"./assets/drop.png",hexIconMapping:{default:{x:0,y:0,width:128,height:128,anchorY:128,mask:!0}},getHexIcon:()=>"default",getColor:t=>[255,130,35,(s?g.unmetDemand.scaleLinearVar(t.properties.UnmetDemandVar[u][e]):1)*200+55],getValue:t=>g.unmetDemand.scaleLinear(t.properties.UnmetDemand[u][e]),visible:r,billboard:!1,getSize:4e3,sizeUnits:"meters",sizeScale:1,opacity:1,updateTriggers:{getPosition:[e],getColor:[s]},zoomRange:a,pickable:!1}),new ee({...this.props,id:"DeagLayer",data:o,deagData:k,getFillColor:t=>g.unmetDemand.interpColor(t.properties.UnmetDemand[u][e],!1,!1),updateTriggers:{getFillColor:[e]}})]}}C.layerName="MultivariableHextileFlatLayer";C.defaultProps={...I.defaultProps,autoHighlight:!0};const ae=Object.keys(D).map(m=>parseInt(m)),w=[7,9];function ye(){const[m,o]=H.useState(T.zoom),e=Y(),r=Z({dataDeag:k,deagKey:"DURgs"}),a=q(e);return p.createElement(p.Fragment,null,p.createElement(j,{reuseMaps:!0,preventStyleDiffing:!0,mapLib:B,mapStyle:"https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",antialias:!0,initialViewState:{...T,maxPitch:0,pitch:0}},p.createElement(K,{getTooltip:a,interleaved:!0,effects:[W],onViewStateChange:({viewState:s})=>{o(s.zoom)}},p.createElement(te,{id:"ground",data:X,stroked:!1,getFillColor:[0,0,0,0],beforeId:"landcover"}),p.createElement(C,{id:"slide-waters",data:D,zoomRange:w,visible:!0,...e,...r,beforeId:"place_hamlet"}))),p.createElement(Q,{res:x().domain(w).range(ae)(m),...e}))}export{ye as default};