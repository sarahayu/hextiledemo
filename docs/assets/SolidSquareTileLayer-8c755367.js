import{C as m,p as c,q as d,O as f}from"./settings-71d1aff4.js";import{P as y,a as P,U as k}from"./overlay-85c106ea.js";function S(s){const[e,o,i]=s.split("/"),t=u(i);return[parseFloat(e)+t/2,parseFloat(o)+t/2]}function E(s,e,o=1,i){const t=o,[r,n]=S(s),p=v(s),a=u(p)/4*t;return e.map(g=>{let h=f(n,g[0],t),R=f(r,g[1],t);return[h+a*i[0],R+a*i[1]]})}function v(s){const[e,o,i]=s.split("/");return parseInt(i)}function _(s){const[e,o]=S(s),i=v(s),t=u(i)/4;return[[e+t,o-t],[e+t,o+t],[e-t,o+t],[e-t,o-t]]}function C(s){return s/111.1}function T(s){return P(parseInt(s),k.km)*2}function u(s){return C(T(s))}function z(s,[e,o],i){let t=_(s).map(n=>[n[1],n[0]]);return[E(s,t,1-e,i)]}class L extends m{initializeState(){super.initializeState();const e=Object.keys(this.props.data).map(t=>parseInt(t)),o=c().domain(this.props.zoomRange).range([0,1]).clamp(!0),i=d().domain([0,1]).range(e)(o(this.context.viewport.zoom));this.setState({...this.state,resRange:e,lastResolution:i,valueInterpResolution:o}),this.createPolygons()}createPolygons(){const{lastResolution:e}=this.state,o=[],i=this.props.data[e];Object.keys(i).forEach((t,r)=>{let n=i[t];const p=this.props.getValue?c().domain([0,1]).range([this.props.thicknessRange[1],this.props.thicknessRange[0]])(this.props.getValue({properties:n})):this.props.thicknessRange[0];let a=z(t,[p,this.props.thicknessRange[1]],this.props.offset);this.props.raised?o.push({polygon:a.map(l=>l.map(([g,h])=>[g,h,typeof this.props.getElevation=="function"?this.props.getElevation({hexId:t,properties:n}):this.props.getElevation])),hexId:t,properties:n}):o.push({hexId:t,polygon:a,properties:n})}),this.setState({...this.state,polygons:o})}shouldUpdateState({changeFlags:e}){return e.somethingChanged}updateState(e){const{resRange:o,lastResolution:i,valueInterpResolution:t}=this.state,{props:r,oldProps:n,changeFlags:p,context:a}=e;if(r.getElevation!=n.getElevation||r.getValue!=n.getValue||p.viewportChanged){const l=d().domain([0,1]).range(o)(t(a.viewport.zoom));(l!=i||r.getValue!=n.getValue||r.getElevation!=n.getElevation)&&(this.setState({...this.state,lastResolution:l}),this.createPolygons())}}renderLayers(){return[new y(this.getSubLayerProps({data:this.props.data,filled:this.props.filled,stroked:this.props.stroked,lineWidthUnits:this.props.lineWidthUnits,extruded:this.props.extruded,wireframe:this.props.wireframe,_normalize:this.props._normalize,_windingOrder:this.props._windingOrder,_full3d:this.props._full3d,elevationScale:this.props.elevationScale,getPolygon:this.props.getPolygon,getElevation:this.props.getElevation,getFillColor:this.props.getFillColor,getLineColor:this.props.getLineColor,getLineWidth:this.props.getLineWidth,material:this.props.material,transitions:this.props.transitions,updateTriggers:this.props.updateTriggers,onClick:this.props.onClick,id:"SolidSquareTileLayer",data:this.state.polygons,getPolygon:e=>e.polygon,pickable:this.props.pickable,autoHighlight:this.props.autoHighlight,extensions:this.props.extensions,getOffset:this.props.getOffset,lineJointRounded:this.props.lineJointRounded}))]}}L.layerName="SolidSquareTileLayer";L.defaultProps={...m.defaultProps,...y.defaultProps,thicknessRange:[0,1],getValue:void 0,raised:!1,zoomRange:[7,9],offset:[0,0]};export{L as S};
