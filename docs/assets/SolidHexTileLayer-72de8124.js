import{_ as v,u as Z,v as q,x as I,y as Q,z as $,A as tt,B as et,D as st,E as ot,T as nt,G as it,H as C,J as at,K as rt,N as z,O as lt,C as E,n as R,q as S,F as O,t as ct,r as pt,P as w}from"./settings-3f87ae0a.js";import{e as D,o as k,c as U,a as L,U as P,P as H,b as ht}from"./overlay-27be0fdc.js";class b{static get componentName(){return Object.prototype.hasOwnProperty.call(this,"extensionName")?this.extensionName:""}constructor(t){v(this,"opts",void 0),t&&(this.opts=t)}equals(t){return this===t?!0:this.constructor===t.constructor&&Z(this.opts,t.opts,1)}getShaders(t){return null}getSubLayerProps(t){const{defaultProps:e}=t.constructor,o={updateTriggers:{}};for(const n in e)if(n in this.props){const a=e[n],i=this.props[n];o[n]=i,a&&a.type==="accessor"&&(o.updateTriggers[n]=this.props.updateTriggers[n],typeof i=="function"&&(o[n]=this.getSubLayerAccessor(i)))}return o}initializeState(t,e){}updateState(t,e){}onNeedsRedraw(t){}getNeedsPickingBuffer(t){return!1}draw(t,e){}finalizeState(t,e){}}v(b,"defaultProps",{});v(b,"extensionName","LayerExtension");const M=Math.PI/180,_=new Float32Array(16),N=new Float32Array(12);function F(s,t,e){const o=t[0]*M,n=t[1]*M,a=t[2]*M,i=Math.sin(a),r=Math.sin(o),l=Math.sin(n),c=Math.cos(a),u=Math.cos(o),h=Math.cos(n),g=e[0],m=e[1],d=e[2];s[0]=g*h*u,s[1]=g*l*u,s[2]=g*-r,s[3]=m*(-l*c+h*r*i),s[4]=m*(h*c+l*r*i),s[5]=m*u*i,s[6]=d*(l*i+h*r*c),s[7]=d*(-h*i+l*r*c),s[8]=d*u*c}function B(s){return s[0]=s[0],s[1]=s[1],s[2]=s[2],s[3]=s[4],s[4]=s[5],s[5]=s[6],s[6]=s[8],s[7]=s[9],s[8]=s[10],s[9]=s[12],s[10]=s[13],s[11]=s[14],s.subarray(0,12)}const dt={size:12,accessor:["getOrientation","getScale","getTranslation","getTransformMatrix"],shaderAttributes:{instanceModelMatrix__LOCATION_0:{size:3,elementOffset:0},instanceModelMatrix__LOCATION_1:{size:3,elementOffset:3},instanceModelMatrix__LOCATION_2:{size:3,elementOffset:6},instanceTranslation:{size:3,elementOffset:9}},update(s,{startRow:t,endRow:e}){const{data:o,getOrientation:n,getScale:a,getTranslation:i,getTransformMatrix:r}=this.props,l=Array.isArray(r),c=l&&r.length===16,u=Array.isArray(a),h=Array.isArray(n),g=Array.isArray(i),m=c||!l&&!!r(o[0]);m?s.constant=c:s.constant=h&&u&&g;const d=s.value;if(s.constant){let p;m?(_.set(r),p=B(_)):(p=N,F(p,n,a),p.set(i,9)),s.value=new Float32Array(p)}else{let p=t*s.size;const{iterable:T,objectInfo:y}=q(o,t,e);for(const x of T){y.index++;let f;if(m)_.set(c?r:r(x,y)),f=B(_);else{f=N;const X=h?n:n(x,y),Y=u?a:a(x,y);F(f,X,Y),f.set(g?i:i(x,y),9)}d[p++]=f[0],d[p++]=f[1],d[p++]=f[2],d[p++]=f[3],d[p++]=f[4],d[p++]=f[5],d[p++]=f[6],d[p++]=f[7],d[p++]=f[8],d[p++]=f[9],d[p++]=f[10],d[p++]=f[11]}}}};function ut(s,t){return t===I.CARTESIAN||t===I.METER_OFFSETS||t===I.DEFAULT&&!s.isGeospatial}const ft=`#version 300 es
#define SHADER_NAME simple-mesh-layer-vs
uniform float sizeScale;
uniform bool composeModelMatrix;
in vec3 positions;
in vec3 normals;
in vec3 colors;
in vec2 texCoords;
in vec3 instancePositions;
in vec3 instancePositions64Low;
in vec4 instanceColors;
in vec3 instancePickingColors;
in mat3 instanceModelMatrix;
in vec3 instanceTranslation;
out vec2 vTexCoord;
out vec3 cameraPosition;
out vec3 normals_commonspace;
out vec4 position_commonspace;
out vec4 vColor;

void main(void) {
  geometry.worldPosition = instancePositions;
  geometry.uv = texCoords;
  geometry.pickingColor = instancePickingColors;

  vTexCoord = texCoords;
  cameraPosition = project_uCameraPosition;
  vColor = vec4(colors * instanceColors.rgb, instanceColors.a);

  vec3 pos = (instanceModelMatrix * positions) * sizeScale + instanceTranslation;

  if (composeModelMatrix) {
    DECKGL_FILTER_SIZE(pos, geometry);
    normals_commonspace = project_normal(instanceModelMatrix * normals);
    geometry.worldPosition += pos;
    gl_Position = project_position_to_clipspace(pos + instancePositions, instancePositions64Low, vec3(0.0), position_commonspace);
    geometry.position = position_commonspace;
  }
  else {
    pos = project_size(pos);
    DECKGL_FILTER_SIZE(pos, geometry);
    gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, pos, position_commonspace);
    geometry.position = position_commonspace;
    normals_commonspace = project_normal(instanceModelMatrix * normals);
  }

  geometry.normal = normals_commonspace;
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);

  DECKGL_FILTER_COLOR(vColor, geometry);
}
`,gt=`#version 300 es
#define SHADER_NAME simple-mesh-layer-fs

precision highp float;

uniform bool hasTexture;
uniform sampler2D sampler;
uniform bool flatShading;
uniform float opacity;

in vec2 vTexCoord;
in vec3 cameraPosition;
in vec3 normals_commonspace;
in vec4 position_commonspace;
in vec4 vColor;

out vec4 fragColor;

void main(void) {
  geometry.uv = vTexCoord;

  vec3 normal;
  if (flatShading) {
#ifdef DERIVATIVES_AVAILABLE
    normal = normalize(cross(dFdx(position_commonspace.xyz), dFdy(position_commonspace.xyz)));
#else
    normal = vec3(0.0, 0.0, 1.0);
#endif
  } else {
    normal = normals_commonspace;
  }

  vec4 color = hasTexture ? texture(sampler, vTexCoord) : vColor;
  DECKGL_FILTER_COLOR(color, geometry);

  vec3 lightColor = lighting_getLightColor(color.rgb, cameraPosition, position_commonspace.xyz, normal);
  fragColor = vec4(lightColor, color.a * opacity);
}
`;function mt(s){let t=1/0,e=1/0,o=1/0,n=-1/0,a=-1/0,i=-1/0;const r=s.POSITION?s.POSITION.value:[],l=r&&r.length;for(let c=0;c<l;c+=3){const u=r[c],h=r[c+1],g=r[c+2];t=u<t?u:t,e=h<e?h:e,o=g<o?g:o,n=u>n?u:n,a=h>a?h:a,i=g>i?g:i}return[[t,e,o],[n,a,i]]}function G(s,t){(s.COLOR_0||s.colors)&&t||(s.colors={constant:!0,value:new Float32Array([1,1,1])}),at.assert(s.positions||s.POSITION,'no "postions" or "POSITION" attribute in mesh')}function V(s,t){if(s.attributes)return G(s.attributes,t),s instanceof C?s:new C(s);if(s.positions||s.POSITION)return G(s,t),new C({attributes:s});throw Error("Invalid mesh")}const yt=[0,0,0,255],vt={mesh:{type:"object",value:null,async:!0},texture:{type:"image",value:null,async:!0},sizeScale:{type:"number",value:1,min:0},_useMeshColors:{type:"boolean",value:!1},_instanced:!0,wireframe:!1,material:!0,getPosition:{type:"accessor",value:s=>s.position},getColor:{type:"accessor",value:yt},getOrientation:{type:"accessor",value:[0,0,0]},getScale:{type:"accessor",value:[1,1,1]},getTranslation:{type:"accessor",value:[0,0,0]},getTransformMatrix:{type:"accessor",value:[]},textureParameters:{type:"object",ignore:!0}};class A extends Q{constructor(...t){super(...t),v(this,"state",void 0)}getShaders(){const t=!$(this.context.gl),e={};return tt(this.context.gl,rt.GLSL_DERIVATIVES)&&(e.DERIVATIVES_AVAILABLE=1),super.getShaders({vs:ft,fs:gt,modules:[et,st,ot],transpileToGLSL100:t,defines:e})}getBounds(){var t;if(this.props._instanced)return super.getBounds();let e=this.state.positionBounds;if(e)return e;const{mesh:o}=this.props;if(!o)return null;if(e=(t=o.header)===null||t===void 0?void 0:t.boundingBox,!e){const{attributes:n}=V(o,this.props._useMeshColors);n.POSITION=n.POSITION||n.positions,e=mt(n)}return this.state.positionBounds=e,e}initializeState(){this.getAttributeManager().addInstanced({instancePositions:{transition:!0,type:5130,fp64:this.use64bitPositions(),size:3,accessor:"getPosition"},instanceColors:{type:5121,transition:!0,size:this.props.colorFormat.length,normalized:!0,accessor:"getColor",defaultValue:[0,0,0,255]},instanceModelMatrix:dt}),this.setState({emptyTexture:new nt(this.context.gl,{data:new Uint8Array(4),width:1,height:1})})}updateState(t){super.updateState(t);const{props:e,oldProps:o,changeFlags:n}=t;if(e.mesh!==o.mesh||n.extensionsChanged){var a;if(this.state.positionBounds=null,(a=this.state.model)===null||a===void 0||a.delete(),e.mesh){this.state.model=this.getModel(e.mesh);const i=e.mesh.attributes||e.mesh;this.setState({hasNormals:!!(i.NORMAL||i.normals)})}this.getAttributeManager().invalidateAll()}e.texture!==o.texture&&this.setTexture(e.texture),this.state.model&&this.state.model.setDrawMode(this.props.wireframe?3:4)}finalizeState(t){super.finalizeState(t),this.state.emptyTexture.delete()}draw({uniforms:t}){if(!this.state.model)return;const{viewport:e}=this.context,{sizeScale:o,coordinateSystem:n,_instanced:a}=this.props;this.state.model.setUniforms(t).setUniforms({sizeScale:o,composeModelMatrix:!a||ut(e,n),flatShading:!this.state.hasNormals}).draw()}getModel(t){const e=new it(this.context.gl,{...this.getShaders(),id:this.props.id,geometry:V(t,this.props._useMeshColors),isInstanced:!0}),{texture:o}=this.props,{emptyTexture:n}=this.state;return e.setUniforms({sampler:o||n,hasTexture:!!o}),e}setTexture(t){const{emptyTexture:e,model:o}=this.state;o&&o.setUniforms({sampler:t||e,hasTexture:!!t})}}v(A,"defaultProps",vt);v(A,"layerName","SimpleMeshLayer");const xt={inject:{"vs:#decl":`
attribute vec2 instanceDashArrays;
attribute float instanceDashOffsets;
varying vec2 vDashArray;
varying float vDashOffset;
`,"vs:#main-end":`
vDashArray = instanceDashArrays;
vDashOffset = instanceDashOffsets / width.x;
`,"fs:#decl":`
uniform float dashAlignMode;
uniform float capType;
uniform bool dashGapPickable;
varying vec2 vDashArray;
varying float vDashOffset;

float round(float x) {
  return floor(x + 0.5);
}
`,"fs:#main-start":`
  float solidLength = vDashArray.x;
  float gapLength = vDashArray.y;
  float unitLength = solidLength + gapLength;

  float offset;

  if (unitLength > 0.0) {
    if (dashAlignMode == 0.0) {
      offset = vDashOffset;
    } else {
      unitLength = vPathLength / round(vPathLength / unitLength);
      offset = solidLength / 2.0;
    }

    float unitOffset = mod(vPathPosition.y + offset, unitLength);

    if (gapLength > 0.0 && unitOffset > solidLength) {
      if (capType <= 0.5) {
        if (!(dashGapPickable && picking_uActive)) {
          discard;
        }
      } else {
        float distToEnd = length(vec2(
          min(unitOffset - solidLength, unitLength - unitOffset),
          vPathPosition.x
        ));
        if (distToEnd > 1.0) {
          if (!(dashGapPickable && picking_uActive)) {
            discard;
          }
        }
      }
    }
  }
`}},Pt={inject:{"vs:#decl":`
attribute float instanceOffsets;
`,"vs:DECKGL_FILTER_SIZE":`
  float offsetWidth = abs(instanceOffsets * 2.0) + 1.0;
  size *= offsetWidth;
`,"vs:#main-end":`
  float offsetWidth = abs(instanceOffsets * 2.0) + 1.0;
  float offsetDir = sign(instanceOffsets);
  vPathPosition.x = (vPathPosition.x + offsetDir) * offsetWidth - offsetDir;
  vPathPosition.y *= offsetWidth;
  vPathLength *= offsetWidth;
`,"fs:#main-start":`
  float isInside;
  isInside = step(-1.0, vPathPosition.x) * step(vPathPosition.x, 1.0);
  if (isInside == 0.0) {
    discard;
  }
`}},St={getDashArray:{type:"accessor",value:[0,0]},getOffset:{type:"accessor",value:0},dashJustified:!1,dashGapPickable:!1};class W extends b{constructor({dash:t=!1,offset:e=!1,highPrecisionDash:o=!1}={}){super({dash:t||o,offset:e,highPrecisionDash:o})}isEnabled(t){return"pathTesselator"in t.state}getShaders(t){if(!t.isEnabled(this))return null;let e={};return t.opts.dash&&(e=z(e,xt)),t.opts.offset&&(e=z(e,Pt)),e}initializeState(t,e){const o=this.getAttributeManager();!o||!e.isEnabled(this)||(e.opts.dash&&o.addInstanced({instanceDashArrays:{size:2,accessor:"getDashArray"}}),e.opts.highPrecisionDash&&o.addInstanced({instanceDashOffsets:{size:1,accessor:"getPath",transform:e.getDashOffsets.bind(this)}}),e.opts.offset&&o.addInstanced({instanceOffsets:{size:1,accessor:"getOffset"}}))}updateState(t,e){if(!e.isEnabled(this))return;const o={};e.opts.dash&&(o.dashAlignMode=this.props.dashJustified?1:0,o.dashGapPickable=!!this.props.dashGapPickable),this.state.model.setUniforms(o)}getDashOffsets(t){const e=[0],o=this.props.positionFormat==="XY"?2:3,n=Array.isArray(t[0]),a=n?t.length:t.length/o;let i,r;for(let l=0;l<a-1;l++)i=n?t[l]:t.slice(l*o,l*o+o),i=this.projectPosition(i),l>0&&(e[l]=e[l-1]+lt(r,i)),r=i;return e}}v(W,"defaultProps",St);v(W,"extensionName","PathStyleExtension");const Tt=S().domain([0,1]).range(ct(0,O.length)),Lt=O[0];class K extends E{initializeState(){super.initializeState();const{zoom:t}=this.context.viewport,e=Object.keys(this.props.data).map(a=>parseInt(a)),o=R().domain(this.props.zoomRange).range([0,1]).clamp(!0),n=S().domain([0,1]).range(e)(o(t));this.setState({hextiles:this.props.data,resRange:e,lastResolution:n,valueInterpResolution:o}),this.createPolygons()}createPolygons(){const{hextiles:t,lastResolution:e}=this.state,o=[],n=t[e],[a,i]=this.props.offset;Object.keys(n).forEach(r=>{const l=n[r],c=D(k(r)[0],P.km)*.48,[u,h]=U(r);let g=0;const m=L(e,P.km)/L(5,P.km);for(let[d,p,T]of this.props.getValue?Lt:[[0,0,0]]){const[y,x]=pt([(d+a)*c,(p+i)*c],h,u);o.push({position:[h+y,u+x,(typeof this.props.getElevation=="function"?this.props.getElevation({properties:l}):this.props.getElevation)+T*1e5*m],properties:l,polyIdx:g++,hexID:r})}}),this.setState({...this.state,polygons:o})}shouldUpdateState({changeFlags:t}){return t.somethingChanged}updateState(t){const{resRange:e,lastResolution:o,valueInterpResolution:n}=this.state,{props:a,oldProps:i,changeFlags:r,context:l}=t;if(a.getElevation!=i.getElevation||r.viewportChanged){const c=S().domain([0,1]).range(e)(n(l.viewport.zoom));(c!=o||a.getElevation!=i.getElevation)&&(this.setState({...this.state,lastResolution:c}),this.createPolygons())}}renderLayers(){const{polygons:t,lastResolution:e,resRange:o}=this.state,n=L(e,P.km)/L(5,P.km);return[new A(this.getSubLayerProps({data:this.props.data,mesh:this.props.mesh,texture:this.props.texture,textureParameters:this.props.textureParameters,getPosition:this.props.getPosition,getColor:this.props.getColor,getOrientation:this.props.getOrientation,getScale:this.props.getScale,getTranslation:this.props.getTranslation,getTransformMatrix:this.props.getTransformMatrix,sizeScale:this.props.sizeScale,_useMeshColors:this.props._useMeshColors,_instanced:this.props._instanced,wireframe:this.props.wireframe,material:this.props.material,transitions:this.props.transitions,updateTriggers:this.props.updateTriggers,id:"IconHexTileLayer",data:t,getPosition:a=>a.position,sizeScale:this.props.sizeScale*n,getTranslation:this.props.getValue===null?[0,0,0]:a=>{const i=O[Tt(this.props.getValue(a))][a.polyIdx],r=O[0][a.polyIdx],l=D(k(a.hexID)[0],P.m)*.5;return[(i[0]-r[0])*l,(i[1]-r[1])*l,(i[2]-r[2])*1e5*n]}}))]}}K.layerName="IconHexTileLayer";K.defaultProps={...E.defaultProps,...A.defaultProps,thicknessRange:[.7,.9],getValue:null,getElevation:()=>0,offset:[0,0],zoomRange:[7,9]};function j(s,t,e=1){const o=e,[n,a]=U(s);return t.map(r=>{let l=w(a,r[0],o),c=w(n,r[1],o);return[l,c]})}function _t(s,[t,e]){let o=ht(s).map(i=>[i[1],i[0]]),n=j(s,o,e),a=j(s,o,t);return[n,a]}class J extends E{initializeState(){super.initializeState();const t=Object.keys(this.props.data).map(n=>parseInt(n)),e=R().domain(this.props.zoomRange).range([0,1]).clamp(!0),o=S().domain([0,1]).range(t)(e(this.context.viewport.zoom));this.setState({...this.state,resRange:t,lastResolution:o,valueInterpResolution:e}),this.createPolygons()}createPolygons(){const{lastResolution:t}=this.state,e=[],o=this.props.data[t];Object.keys(o).forEach((n,a)=>{let i=o[n];const r=this.props.getValue?R().domain([0,1]).range([this.props.thicknessRange[1],this.props.thicknessRange[0]])(this.props.getValue({properties:i})):this.props.thicknessRange[0];let l=_t(n,[r,this.props.thicknessRange[1]]);this.props.raised?e.push({polygon:l.map(c=>c.map(([u,h])=>[u,h,typeof this.props.getElevation=="function"?this.props.getElevation({hexId:n,properties:i}):this.props.getElevation])),hexId:n,properties:i}):e.push({hexId:n,polygon:l,properties:i})}),this.setState({...this.state,polygons:e})}shouldUpdateState({changeFlags:t}){return t.somethingChanged}updateState(t){const{resRange:e,lastResolution:o,valueInterpResolution:n}=this.state,{props:a,oldProps:i,changeFlags:r,context:l}=t;if(a.getElevation!=i.getElevation||a.getValue!=i.getValue||r.viewportChanged){const c=S().domain([0,1]).range(e)(n(l.viewport.zoom));(c!=o||a.getValue!=i.getValue||a.getElevation!=i.getElevation)&&(this.setState({...this.state,lastResolution:c}),this.createPolygons())}}renderLayers(){return[new H(this.getSubLayerProps({data:this.props.data,filled:this.props.filled,stroked:this.props.stroked,extruded:this.props.extruded,wireframe:this.props.wireframe,lineWidthUnits:this.props.lineWidthUnits,_normalize:this.props._normalize,_windingOrder:this.props._windingOrder,_full3d:this.props._full3d,elevationScale:this.props.elevationScale,getPolygon:this.props.getPolygon,getElevation:this.props.getElevation,getFillColor:this.props.getFillColor,getLineColor:this.props.getLineColor,getLineWidth:this.props.getLineWidth,material:this.props.material,transitions:this.props.transitions,updateTriggers:this.props.updateTriggers,onClick:this.props.onClick,id:"SolidHexTileLayer",data:this.state.polygons,getPolygon:t=>t.polygon,pickable:this.props.pickable,autoHighlight:this.props.autoHighlight,extensions:this.props.extensions,getOffset:this.props.getOffset,lineJointRounded:this.props.lineJointRounded}))]}}J.layerName="SolidHexTileLayer";J.defaultProps={...E.defaultProps,...H.defaultProps,thicknessRange:[.7,.9],getValue:void 0,raised:!1,zoomRange:[7,9]};export{K as I,W as P,J as S,mt as g};
