import{_ as A,T as ye,aI as Re,aJ as We,t as xe,v as Et,z as Ot,B as kt,aK as ct,D as Rt,G as Wt,E as U,C as ve,aL as Be,aM as De,aN as Ue,aO as Kt,aP as Ne,aQ as Pe,aR as ut}from"./settings-71d1aff4.js";const Ge=`#define SHADER_NAME icon-layer-vertex-shader

attribute vec2 positions;

attribute vec3 instancePositions;
attribute vec3 instancePositions64Low;
attribute float instanceSizes;
attribute float instanceAngles;
attribute vec4 instanceColors;
attribute vec3 instancePickingColors;
attribute vec4 instanceIconFrames;
attribute float instanceColorModes;
attribute vec2 instanceOffsets;
attribute vec2 instancePixelOffset;

uniform float sizeScale;
uniform vec2 iconsTextureDim;
uniform float sizeMinPixels;
uniform float sizeMaxPixels;
uniform bool billboard;
uniform int sizeUnits;

varying float vColorMode;
varying vec4 vColor;
varying vec2 vTextureCoords;
varying vec2 uv;

vec2 rotate_by_angle(vec2 vertex, float angle) {
  float angle_radian = angle * PI / 180.0;
  float cos_angle = cos(angle_radian);
  float sin_angle = sin(angle_radian);
  mat2 rotationMatrix = mat2(cos_angle, -sin_angle, sin_angle, cos_angle);
  return rotationMatrix * vertex;
}

void main(void) {
  geometry.worldPosition = instancePositions;
  geometry.uv = positions;
  geometry.pickingColor = instancePickingColors;
  uv = positions;

  vec2 iconSize = instanceIconFrames.zw;
  float sizePixels = clamp(
    project_size_to_pixel(instanceSizes * sizeScale, sizeUnits), 
    sizeMinPixels, sizeMaxPixels
  );
  float instanceScale = iconSize.y == 0.0 ? 0.0 : sizePixels / iconSize.y;
  vec2 pixelOffset = positions / 2.0 * iconSize + instanceOffsets;
  pixelOffset = rotate_by_angle(pixelOffset, instanceAngles) * instanceScale;
  pixelOffset += instancePixelOffset;
  pixelOffset.y *= -1.0;

  if (billboard)  {
    gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, vec3(0.0), geometry.position);
    DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
    vec3 offset = vec3(pixelOffset, 0.0);
    DECKGL_FILTER_SIZE(offset, geometry);
    gl_Position.xy += project_pixel_size_to_clipspace(offset.xy);

  } else {
    vec3 offset_common = vec3(project_pixel_size(pixelOffset), 0.0);
    DECKGL_FILTER_SIZE(offset_common, geometry);
    gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, offset_common, geometry.position); 
    DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
  }

  vTextureCoords = mix(
    instanceIconFrames.xy,
    instanceIconFrames.xy + iconSize,
    (positions.xy + 1.0) / 2.0
  ) / iconsTextureDim;

  vColor = instanceColors;
  DECKGL_FILTER_COLOR(vColor, geometry);

  vColorMode = instanceColorModes;
}
`,He=`#define SHADER_NAME icon-layer-fragment-shader

precision highp float;

uniform float opacity;
uniform sampler2D iconsTexture;
uniform float alphaCutoff;

varying float vColorMode;
varying vec4 vColor;
varying vec2 vTextureCoords;
varying vec2 uv;

void main(void) {
  geometry.uv = uv;

  vec4 texColor = texture2D(iconsTexture, vTextureCoords);
  vec3 color = mix(texColor.rgb, vColor.rgb, vColorMode);
  float a = texColor.a * opacity * vColor.a;

  if (a < alphaCutoff) {
    discard;
  }

  gl_FragColor = vec4(color, a);
  DECKGL_FILTER_COLOR(gl_FragColor, geometry);
}
`,je=1024,qe=4,Vt=()=>{},Yt={10241:9987,10240:9729,10242:33071,10243:33071};function Ke(t){return Math.pow(2,Math.ceil(Math.log2(t)))}function Ve(t,e,n,i){const r=Math.min(n/e.width,i/e.height),o=Math.floor(e.width*r),a=Math.floor(e.height*r);return r===1?{data:e,width:o,height:a}:(t.canvas.height=a,t.canvas.width=o,t.clearRect(0,0,o,a),t.drawImage(e,0,0,e.width,e.height,0,0,o,a),{data:t.canvas,width:o,height:a})}function J(t){return t&&(t.id||t.url)}function Ye(t,e,n,i){const r=t.width,o=t.height,a=new ye(t.gl,{width:e,height:n,parameters:i});return We(t,a,{targetY:0,width:r,height:o}),t.delete(),a}function $t(t,e,n){for(let i=0;i<e.length;i++){const{icon:r,xOffset:o}=e[i],a=J(r);t[a]={...r,x:o,y:n}}}function $e({icons:t,buffer:e,mapping:n={},xOffset:i=0,yOffset:r=0,rowHeight:o=0,canvasWidth:a}){let s=[];for(let l=0;l<t.length;l++){const u=t[l],d=J(u);if(!n[d]){const{height:c,width:g}=u;i+g+e>a&&($t(n,s,r),i=0,r=o+r+e,o=0,s=[]),s.push({icon:u,xOffset:i}),i=i+g+e,o=Math.max(o,c)}}return s.length>0&&$t(n,s,r),{mapping:n,rowHeight:o,xOffset:i,yOffset:r,canvasWidth:a,canvasHeight:Ke(o+r+e)}}function Xe(t,e,n){if(!t||!e)return null;n=n||{};const i={},{iterable:r,objectInfo:o}=xe(t);for(const a of r){o.index++;const s=e(a,o),l=J(s);if(!s)throw new Error("Icon is missing.");if(!s.url)throw new Error("Icon url is missing.");!i[l]&&(!n[l]||s.url!==n[l].url)&&(i[l]={...s,source:a,sourceIndex:o.index})}return i}class Je{constructor(e,{onUpdate:n=Vt,onError:i=Vt}){A(this,"gl",void 0),A(this,"onUpdate",void 0),A(this,"onError",void 0),A(this,"_loadOptions",null),A(this,"_texture",null),A(this,"_externalTexture",null),A(this,"_mapping",{}),A(this,"_textureParameters",null),A(this,"_pendingCount",0),A(this,"_autoPacking",!1),A(this,"_xOffset",0),A(this,"_yOffset",0),A(this,"_rowHeight",0),A(this,"_buffer",qe),A(this,"_canvasWidth",je),A(this,"_canvasHeight",0),A(this,"_canvas",null),this.gl=e,this.onUpdate=n,this.onError=i}finalize(){var e;(e=this._texture)===null||e===void 0||e.delete()}getTexture(){return this._texture||this._externalTexture}getIconMapping(e){const n=this._autoPacking?J(e):e;return this._mapping[n]||{}}setProps({loadOptions:e,autoPacking:n,iconAtlas:i,iconMapping:r,textureParameters:o}){if(e&&(this._loadOptions=e),n!==void 0&&(this._autoPacking=n),r&&(this._mapping=r),i){var a;(a=this._texture)===null||a===void 0||a.delete(),this._texture=null,this._externalTexture=i}o&&(this._textureParameters=o)}get isLoaded(){return this._pendingCount===0}packIcons(e,n){if(!this._autoPacking||typeof document>"u")return;const i=Object.values(Xe(e,n,this._mapping)||{});if(i.length>0){const{mapping:r,xOffset:o,yOffset:a,rowHeight:s,canvasHeight:l}=$e({icons:i,buffer:this._buffer,canvasWidth:this._canvasWidth,mapping:this._mapping,rowHeight:this._rowHeight,xOffset:this._xOffset,yOffset:this._yOffset});this._rowHeight=s,this._mapping=r,this._xOffset=o,this._yOffset=a,this._canvasHeight=l,this._texture||(this._texture=new ye(this.gl,{width:this._canvasWidth,height:this._canvasHeight,parameters:this._textureParameters||Yt})),this._texture.height!==this._canvasHeight&&(this._texture=Ye(this._texture,this._canvasWidth,this._canvasHeight,this._textureParameters||Yt)),this.onUpdate(),this._canvas=this._canvas||document.createElement("canvas"),this._loadIcons(i)}}_loadIcons(e){const n=this._canvas.getContext("2d",{willReadFrequently:!0});for(const i of e)this._pendingCount++,Re(i.url,this._loadOptions).then(r=>{const o=J(i),a=this._mapping[o],{x:s,y:l,width:u,height:d}=a,{data:c,width:g,height:f}=Ve(n,r,u,d);this._texture.setSubImageData({data:c,x:s+(u-g)/2,y:l+(d-f)/2,width:g,height:f}),a.width=g,a.height=f,this._texture.generateMipmap(),this.onUpdate()}).catch(r=>{this.onError({url:i.url,source:i.source,sourceIndex:i.sourceIndex,loadOptions:this._loadOptions,error:r})}).finally(()=>{this._pendingCount--})}}const _e=[0,0,0,255],Ze={iconAtlas:{type:"image",value:null,async:!0},iconMapping:{type:"object",value:{},async:!0},sizeScale:{type:"number",value:1,min:0},billboard:!0,sizeUnits:"pixels",sizeMinPixels:{type:"number",min:0,value:0},sizeMaxPixels:{type:"number",min:0,value:Number.MAX_SAFE_INTEGER},alphaCutoff:{type:"number",value:.05,min:0,max:1},getPosition:{type:"accessor",value:t=>t.position},getIcon:{type:"accessor",value:t=>t.icon},getColor:{type:"accessor",value:_e},getSize:{type:"accessor",value:1},getAngle:{type:"accessor",value:0},getPixelOffset:{type:"accessor",value:[0,0]},onIconError:{type:"function",value:null,optional:!0},textureParameters:{type:"object",ignore:!0}};class pt extends Et{constructor(...e){super(...e),A(this,"state",void 0)}getShaders(){return super.getShaders({vs:Ge,fs:He,modules:[Ot,kt]})}initializeState(){this.state={iconManager:new Je(this.context.gl,{onUpdate:this._onUpdate.bind(this),onError:this._onError.bind(this)})},this.getAttributeManager().addInstanced({instancePositions:{size:3,type:5130,fp64:this.use64bitPositions(),transition:!0,accessor:"getPosition"},instanceSizes:{size:1,transition:!0,accessor:"getSize",defaultValue:1},instanceOffsets:{size:2,accessor:"getIcon",transform:this.getInstanceOffset},instanceIconFrames:{size:4,accessor:"getIcon",transform:this.getInstanceIconFrame},instanceColorModes:{size:1,type:5121,accessor:"getIcon",transform:this.getInstanceColorMode},instanceColors:{size:this.props.colorFormat.length,type:5121,normalized:!0,transition:!0,accessor:"getColor",defaultValue:_e},instanceAngles:{size:1,transition:!0,accessor:"getAngle"},instancePixelOffset:{size:2,transition:!0,accessor:"getPixelOffset"}})}updateState(e){super.updateState(e);const{props:n,oldProps:i,changeFlags:r}=e,o=this.getAttributeManager(),{iconAtlas:a,iconMapping:s,data:l,getIcon:u,textureParameters:d}=n,{iconManager:c}=this.state,g=a||this.internalState.isAsyncPropLoading("iconAtlas");if(c.setProps({loadOptions:n.loadOptions,autoPacking:!g,iconAtlas:a,iconMapping:g?s:null,textureParameters:d}),g?i.iconMapping!==n.iconMapping&&o.invalidate("getIcon"):(r.dataChanged||r.updateTriggersChanged&&(r.updateTriggersChanged.all||r.updateTriggersChanged.getIcon))&&c.packIcons(l,u),r.extensionsChanged){var f;const{gl:m}=this.context;(f=this.state.model)===null||f===void 0||f.delete(),this.state.model=this._getModel(m),o.invalidateAll()}}get isLoaded(){return super.isLoaded&&this.state.iconManager.isLoaded}finalizeState(e){super.finalizeState(e),this.state.iconManager.finalize()}draw({uniforms:e}){const{sizeScale:n,sizeMinPixels:i,sizeMaxPixels:r,sizeUnits:o,billboard:a,alphaCutoff:s}=this.props,{iconManager:l}=this.state,u=l.getTexture();u&&this.state.model.setUniforms(e).setUniforms({iconsTexture:u,iconsTextureDim:[u.width,u.height],sizeUnits:ct[o],sizeScale:n,sizeMinPixels:i,sizeMaxPixels:r,billboard:a,alphaCutoff:s}).draw()}_getModel(e){const n=[-1,-1,-1,1,1,1,1,-1];return new Rt(e,{...this.getShaders(),id:this.props.id,geometry:new Wt({drawMode:6,attributes:{positions:{size:2,value:new Float32Array(n)}}}),isInstanced:!0})}_onUpdate(){this.setNeedsRedraw()}_onError(e){var n;const i=(n=this.getCurrentLayer())===null||n===void 0?void 0:n.props.onIconError;i?i(e):U.error(e.error.message)()}getInstanceOffset(e){const{width:n,height:i,anchorX:r=n/2,anchorY:o=i/2}=this.state.iconManager.getIconMapping(e);return[n/2-r,i/2-o]}getInstanceColorMode(e){return this.state.iconManager.getIconMapping(e).mask?1:0}getInstanceIconFrame(e){const{x:n,y:i,width:r,height:o}=this.state.iconManager.getIconMapping(e);return[n,i,r,o]}}A(pt,"defaultProps",Ze);A(pt,"layerName","IconLayer");const Qe=`#define SHADER_NAME scatterplot-layer-vertex-shader

attribute vec3 positions;

attribute vec3 instancePositions;
attribute vec3 instancePositions64Low;
attribute float instanceRadius;
attribute float instanceLineWidths;
attribute vec4 instanceFillColors;
attribute vec4 instanceLineColors;
attribute vec3 instancePickingColors;

uniform float opacity;
uniform float radiusScale;
uniform float radiusMinPixels;
uniform float radiusMaxPixels;
uniform float lineWidthScale;
uniform float lineWidthMinPixels;
uniform float lineWidthMaxPixels;
uniform float stroked;
uniform bool filled;
uniform bool antialiasing;
uniform bool billboard;
uniform int radiusUnits;
uniform int lineWidthUnits;

varying vec4 vFillColor;
varying vec4 vLineColor;
varying vec2 unitPosition;
varying float innerUnitRadius;
varying float outerRadiusPixels;


void main(void) {
  geometry.worldPosition = instancePositions;
  outerRadiusPixels = clamp(
    project_size_to_pixel(radiusScale * instanceRadius, radiusUnits),
    radiusMinPixels, radiusMaxPixels
  );
  float lineWidthPixels = clamp(
    project_size_to_pixel(lineWidthScale * instanceLineWidths, lineWidthUnits),
    lineWidthMinPixels, lineWidthMaxPixels
  );
  outerRadiusPixels += stroked * lineWidthPixels / 2.0;
  float edgePadding = antialiasing ? (outerRadiusPixels + SMOOTH_EDGE_RADIUS) / outerRadiusPixels : 1.0;
  unitPosition = edgePadding * positions.xy;
  geometry.uv = unitPosition;
  geometry.pickingColor = instancePickingColors;

  innerUnitRadius = 1.0 - stroked * lineWidthPixels / outerRadiusPixels;
  
  if (billboard) {
    gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, vec3(0.0), geometry.position);
    DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
    vec3 offset = edgePadding * positions * outerRadiusPixels;
    DECKGL_FILTER_SIZE(offset, geometry);
    gl_Position.xy += project_pixel_size_to_clipspace(offset.xy);
  } else {
    vec3 offset = edgePadding * positions * project_pixel_size(outerRadiusPixels);
    DECKGL_FILTER_SIZE(offset, geometry);
    gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, offset, geometry.position);
    DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
  }
  vFillColor = vec4(instanceFillColors.rgb, instanceFillColors.a * opacity);
  DECKGL_FILTER_COLOR(vFillColor, geometry);
  vLineColor = vec4(instanceLineColors.rgb, instanceLineColors.a * opacity);
  DECKGL_FILTER_COLOR(vLineColor, geometry);
}
`,tn=`#define SHADER_NAME scatterplot-layer-fragment-shader

precision highp float;

uniform bool filled;
uniform float stroked;
uniform bool antialiasing;

varying vec4 vFillColor;
varying vec4 vLineColor;
varying vec2 unitPosition;
varying float innerUnitRadius;
varying float outerRadiusPixels;

void main(void) {
  geometry.uv = unitPosition;

  float distToCenter = length(unitPosition) * outerRadiusPixels;
  float inCircle = antialiasing ? 
    smoothedge(distToCenter, outerRadiusPixels) : 
    step(distToCenter, outerRadiusPixels);

  if (inCircle == 0.0) {
    discard;
  }

  if (stroked > 0.5) {
    float isLine = antialiasing ? 
      smoothedge(innerUnitRadius * outerRadiusPixels, distToCenter) :
      step(innerUnitRadius * outerRadiusPixels, distToCenter);

    if (filled) {
      gl_FragColor = mix(vFillColor, vLineColor, isLine);
    } else {
      if (isLine == 0.0) {
        discard;
      }
      gl_FragColor = vec4(vLineColor.rgb, vLineColor.a * isLine);
    }
  } else if (!filled) {
    discard;
  } else {
    gl_FragColor = vFillColor;
  }

  gl_FragColor.a *= inCircle;
  DECKGL_FILTER_COLOR(gl_FragColor, geometry);
}
`,Xt=[0,0,0,255],en={radiusUnits:"meters",radiusScale:{type:"number",min:0,value:1},radiusMinPixels:{type:"number",min:0,value:0},radiusMaxPixels:{type:"number",min:0,value:Number.MAX_SAFE_INTEGER},lineWidthUnits:"meters",lineWidthScale:{type:"number",min:0,value:1},lineWidthMinPixels:{type:"number",min:0,value:0},lineWidthMaxPixels:{type:"number",min:0,value:Number.MAX_SAFE_INTEGER},stroked:!1,filled:!0,billboard:!1,antialiasing:!0,getPosition:{type:"accessor",value:t=>t.position},getRadius:{type:"accessor",value:1},getFillColor:{type:"accessor",value:Xt},getLineColor:{type:"accessor",value:Xt},getLineWidth:{type:"accessor",value:1},strokeWidth:{deprecatedFor:"getLineWidth"},outline:{deprecatedFor:"stroked"},getColor:{deprecatedFor:["getFillColor","getLineColor"]}};class Bt extends Et{getShaders(){return super.getShaders({vs:Qe,fs:tn,modules:[Ot,kt]})}initializeState(){this.getAttributeManager().addInstanced({instancePositions:{size:3,type:5130,fp64:this.use64bitPositions(),transition:!0,accessor:"getPosition"},instanceRadius:{size:1,transition:!0,accessor:"getRadius",defaultValue:1},instanceFillColors:{size:this.props.colorFormat.length,transition:!0,normalized:!0,type:5121,accessor:"getFillColor",defaultValue:[0,0,0,255]},instanceLineColors:{size:this.props.colorFormat.length,transition:!0,normalized:!0,type:5121,accessor:"getLineColor",defaultValue:[0,0,0,255]},instanceLineWidths:{size:1,transition:!0,accessor:"getLineWidth",defaultValue:1}})}updateState(e){if(super.updateState(e),e.changeFlags.extensionsChanged){var n;const{gl:i}=this.context;(n=this.state.model)===null||n===void 0||n.delete(),this.state.model=this._getModel(i),this.getAttributeManager().invalidateAll()}}draw({uniforms:e}){const{radiusUnits:n,radiusScale:i,radiusMinPixels:r,radiusMaxPixels:o,stroked:a,filled:s,billboard:l,antialiasing:u,lineWidthUnits:d,lineWidthScale:c,lineWidthMinPixels:g,lineWidthMaxPixels:f}=this.props;this.state.model.setUniforms(e).setUniforms({stroked:a?1:0,filled:s,billboard:l,antialiasing:u,radiusUnits:ct[n],radiusScale:i,radiusMinPixels:r,radiusMaxPixels:o,lineWidthUnits:ct[d],lineWidthScale:c,lineWidthMinPixels:g,lineWidthMaxPixels:f}).draw()}_getModel(e){const n=[-1,-1,0,1,-1,0,1,1,0,-1,1,0];return new Rt(e,{...this.getShaders(),id:this.props.id,geometry:new Wt({drawMode:6,vertexCount:4,attributes:{positions:{size:3,value:new Float32Array(n)}}}),isInstanced:!0})}}A(Bt,"defaultProps",en);A(Bt,"layerName","ScatterplotLayer");function nn(t,e){if(!t)return null;const n="startIndices"in t?t.startIndices[e]:e,i=t.featureIds.value[n];return n!==-1?rn(t,i,n):null}function rn(t,e,n){const i={properties:{...t.properties[e]}};for(const r in t.numericProps)i.properties[r]=t.numericProps[r].value[n];return i}function on(t,e){const n={points:null,lines:null,polygons:null};for(const i in n){const r=t[i].globalFeatureIds.value;n[i]=new Uint8ClampedArray(r.length*3);const o=[];for(let a=0;a<r.length;a++)e(r[a],o),n[i][a*3+0]=o[0],n[i][a*3+1]=o[1],n[i][a*3+2]=o[2]}return n}const sn=`#define SHADER_NAME multi-icon-layer-fragment-shader

precision highp float;

uniform float opacity;
uniform sampler2D iconsTexture;
uniform float gamma;
uniform bool sdf;
uniform float alphaCutoff;
uniform float sdfBuffer;
uniform float outlineBuffer;
uniform vec4 outlineColor;

varying vec4 vColor;
varying vec2 vTextureCoords;
varying vec2 uv;

void main(void) {
  geometry.uv = uv;

  if (!picking_uActive) {
    float alpha = texture2D(iconsTexture, vTextureCoords).a;
    vec4 color = vColor;
    if (sdf) {
      float distance = alpha;
      alpha = smoothstep(sdfBuffer - gamma, sdfBuffer + gamma, distance);

      if (outlineBuffer > 0.0) {
        float inFill = alpha;
        float inBorder = smoothstep(outlineBuffer - gamma, outlineBuffer + gamma, distance);
        color = mix(outlineColor, vColor, inFill);
        alpha = inBorder;
      }
    }
    float a = alpha * color.a;
    
    if (a < alphaCutoff) {
      discard;
    }

    gl_FragColor = vec4(color.rgb, a * opacity);
  }

  DECKGL_FILTER_COLOR(gl_FragColor, geometry);
}
`,Ct=192/256,Jt=[],an={getIconOffsets:{type:"accessor",value:t=>t.offsets},alphaCutoff:.001,smoothing:.1,outlineWidth:0,outlineColor:{type:"color",value:[0,0,0,255]}};class Dt extends pt{constructor(...e){super(...e),A(this,"state",void 0)}getShaders(){return{...super.getShaders(),fs:sn}}initializeState(){super.initializeState(),this.getAttributeManager().addInstanced({instanceOffsets:{size:2,accessor:"getIconOffsets"},instancePickingColors:{type:5121,size:3,accessor:(n,{index:i,target:r})=>this.encodePickingColor(i,r)}})}updateState(e){super.updateState(e);const{props:n,oldProps:i}=e;let{outlineColor:r}=n;r!==i.outlineColor&&(r=r.map(o=>o/255),r[3]=Number.isFinite(r[3])?r[3]:1,this.setState({outlineColor:r})),!n.sdf&&n.outlineWidth&&U.warn("".concat(this.id,": fontSettings.sdf is required to render outline"))()}draw(e){const{sdf:n,smoothing:i,outlineWidth:r}=this.props,{outlineColor:o}=this.state,a=r?Math.max(i,Ct*(1-r)):-1;if(e.uniforms={...e.uniforms,sdfBuffer:Ct,outlineBuffer:a,gamma:i,sdf:!!n,outlineColor:o},super.draw(e),n&&r){const{iconManager:s}=this.state;s.getTexture()&&this.state.model.draw({uniforms:{outlineBuffer:Ct}})}}getInstanceOffset(e){return e?Array.from(e).flatMap(n=>super.getInstanceOffset(n)):Jt}getInstanceColorMode(e){return 1}getInstanceIconFrame(e){return e?Array.from(e).flatMap(n=>super.getInstanceIconFrame(n)):Jt}}A(Dt,"defaultProps",an);A(Dt,"layerName","MultiIconLayer");const X=1e20;class ln{constructor({fontSize:e=24,buffer:n=3,radius:i=8,cutoff:r=.25,fontFamily:o="sans-serif",fontWeight:a="normal",fontStyle:s="normal"}={}){this.buffer=n,this.cutoff=r,this.radius=i;const l=this.size=e+n*4,u=this._createCanvas(l),d=this.ctx=u.getContext("2d",{willReadFrequently:!0});d.font=`${s} ${a} ${e}px ${o}`,d.textBaseline="alphabetic",d.textAlign="left",d.fillStyle="black",this.gridOuter=new Float64Array(l*l),this.gridInner=new Float64Array(l*l),this.f=new Float64Array(l),this.z=new Float64Array(l+1),this.v=new Uint16Array(l)}_createCanvas(e){const n=document.createElement("canvas");return n.width=n.height=e,n}draw(e){const{width:n,actualBoundingBoxAscent:i,actualBoundingBoxDescent:r,actualBoundingBoxLeft:o,actualBoundingBoxRight:a}=this.ctx.measureText(e),s=Math.ceil(i),l=0,u=Math.max(0,Math.min(this.size-this.buffer,Math.ceil(a-o))),d=Math.min(this.size-this.buffer,s+Math.ceil(r)),c=u+2*this.buffer,g=d+2*this.buffer,f=Math.max(c*g,0),m=new Uint8ClampedArray(f),x={data:m,width:c,height:g,glyphWidth:u,glyphHeight:d,glyphTop:s,glyphLeft:l,glyphAdvance:n};if(u===0||d===0)return x;const{ctx:p,buffer:h,gridInner:y,gridOuter:b}=this;p.clearRect(h,h,u,d),p.fillText(e,h,h+s);const S=p.getImageData(h,h,u,d);b.fill(X,0,f),y.fill(0,0,f);for(let _=0;_<d;_++)for(let L=0;L<u;L++){const w=S.data[4*(_*u+L)+3]/255;if(w===0)continue;const z=(_+h)*c+L+h;if(w===1)b[z]=0,y[z]=X;else{const M=.5-w;b[z]=M>0?M*M:0,y[z]=M<0?M*M:0}}Zt(b,0,0,c,g,c,this.f,this.v,this.z),Zt(y,h,h,u,d,c,this.f,this.v,this.z);for(let _=0;_<f;_++){const L=Math.sqrt(b[_])-Math.sqrt(y[_]);m[_]=Math.round(255-255*(L/this.radius+this.cutoff))}return x}}function Zt(t,e,n,i,r,o,a,s,l){for(let u=e;u<e+i;u++)Qt(t,n*o+u,o,r,a,s,l);for(let u=n;u<n+r;u++)Qt(t,u*o+e,1,i,a,s,l)}function Qt(t,e,n,i,r,o,a){o[0]=0,a[0]=-X,a[1]=X,r[0]=t[e];for(let s=1,l=0,u=0;s<i;s++){r[s]=t[e+s*n];const d=s*s;do{const c=o[l];u=(r[s]-r[c]+d-c*c)/(s-c)/2}while(u<=a[l]&&--l>-1);l++,o[l]=s,a[l]=u,a[l+1]=X}for(let s=0,l=0;s<i;s++){for(;a[l+1]<s;)l++;const u=o[l],d=s-u;t[e+s*n]=r[u]+d*d}}const cn=32,un=[];function gn(t){return Math.pow(2,Math.ceil(Math.log2(t)))}function dn({characterSet:t,getFontWidth:e,fontHeight:n,buffer:i,maxCanvasWidth:r,mapping:o={},xOffset:a=0,yOffset:s=0}){let l=0,u=a;const d=n+i*2;for(const c of t)if(!o[c]){const g=e(c);u+g+i*2>r&&(u=0,l++),o[c]={x:u+i,y:s+l*d+i,width:g,height:d,layoutWidth:g,layoutHeight:n},u+=g+i*2}return{mapping:o,xOffset:u,yOffset:s+l*d,canvasHeight:gn(s+(l+1)*d)}}function Ce(t,e,n,i){let r=0;for(let a=e;a<n;a++){var o;const s=t[a];r+=((o=i[s])===null||o===void 0?void 0:o.layoutWidth)||0}return r}function be(t,e,n,i,r,o){let a=e,s=0;for(let l=e;l<n;l++){const u=Ce(t,l,l+1,r);s+u>i&&(a<l&&o.push(l),a=l,s=0),s+=u}return s}function fn(t,e,n,i,r,o){let a=e,s=e,l=e,u=0;for(let d=e;d<n;d++)if((t[d]===" "||t[d+1]===" "||d+1===n)&&(l=d+1),l>s){let c=Ce(t,s,l,r);u+c>i&&(a<s&&(o.push(s),a=s,u=0),c>i&&(c=be(t,s,l,i,r,o),a=o[o.length-1])),s=l,u+=c}return u}function hn(t,e,n,i,r=0,o){o===void 0&&(o=t.length);const a=[];return e==="break-all"?be(t,r,o,n,i,a):fn(t,r,o,n,i,a),a}function pn(t,e,n,i,r,o){let a=0,s=0;for(let l=e;l<n;l++){const u=t[l],d=i[u];d?(s||(s=d.layoutHeight),r[l]=a+d.layoutWidth/2,a+=d.layoutWidth):(U.warn("Missing character: ".concat(u," (").concat(u.codePointAt(0),")"))(),r[l]=a,a+=cn)}o[0]=a,o[1]=s}function mn(t,e,n,i,r){const o=Array.from(t),a=o.length,s=new Array(a),l=new Array(a),u=new Array(a),d=(n==="break-word"||n==="break-all")&&isFinite(i)&&i>0,c=[0,0],g=[0,0];let f=0,m=0,x=0;for(let h=0;h<=a;h++){const y=o[h];if((y===`
`||h===a)&&(x=h),x>m){const b=d?hn(o,n,i,r,m,x):un;for(let S=0;S<=b.length;S++){const _=S===0?m:b[S-1],L=S<b.length?b[S]:x;pn(o,_,L,r,s,g);for(let w=_;w<L;w++){var p;const z=o[w],M=((p=r[z])===null||p===void 0?void 0:p.layoutOffsetY)||0;l[w]=f+g[1]/2+M,u[w]=g[0]}f=f+g[1]*e,c[0]=Math.max(c[0],g[0])}m=x}y===`
`&&(s[m]=0,l[m]=0,u[m]=0,m++)}return c[1]=f,{x:s,y:l,rowWidth:u,size:c}}function yn({value:t,length:e,stride:n,offset:i,startIndices:r,characterSet:o}){const a=t.BYTES_PER_ELEMENT,s=n?n/a:1,l=i?i/a:0,u=r[e]||Math.ceil((t.length-l)/s),d=o&&new Set,c=new Array(e);let g=t;if(s>1||l>0){const f=t.constructor;g=new f(u);for(let m=0;m<u;m++)g[m]=t[m*s+l]}for(let f=0;f<e;f++){const m=r[f],x=r[f+1]||u,p=g.subarray(m,x);c[f]=String.fromCodePoint.apply(null,p),d&&p.forEach(d.add,d)}if(d)for(const f of d)o.add(String.fromCodePoint(f));return{texts:c,characterCount:u}}class Se{constructor(e=5){A(this,"limit",void 0),A(this,"_cache",{}),A(this,"_order",[]),this.limit=e}get(e){const n=this._cache[e];return n&&(this._deleteOrder(e),this._appendOrder(e)),n}set(e,n){this._cache[e]?(this.delete(e),this._cache[e]=n,this._appendOrder(e)):(Object.keys(this._cache).length===this.limit&&this.delete(this._order[0]),this._cache[e]=n,this._appendOrder(e))}delete(e){this._cache[e]&&(delete this._cache[e],this._deleteOrder(e))}_deleteOrder(e){const n=this._order.indexOf(e);n>=0&&this._order.splice(n,1)}_appendOrder(e){this._order.push(e)}}function xn(){const t=[];for(let e=32;e<128;e++)t.push(String.fromCharCode(e));return t}const V={fontFamily:"Monaco, monospace",fontWeight:"normal",characterSet:xn(),fontSize:64,buffer:4,sdf:!1,cutoff:.25,radius:12,smoothing:.1},te=1024,ee=.9,ne=1.2,Le=3;let gt=new Se(Le);function vn(t,e){let n;typeof e=="string"?n=new Set(Array.from(e)):n=new Set(e);const i=gt.get(t);if(!i)return n;for(const r in i.mapping)n.has(r)&&n.delete(r);return n}function Pn(t,e){for(let n=0;n<t.length;n++)e.data[4*n+3]=t[n]}function ie(t,e,n,i){t.font="".concat(i," ").concat(n,"px ").concat(e),t.fillStyle="#000",t.textBaseline="alphabetic",t.textAlign="left"}function _n(t){U.assert(Number.isFinite(t)&&t>=Le,"Invalid cache limit"),gt=new Se(t)}class Cn{constructor(){A(this,"props",{...V}),A(this,"_key",void 0),A(this,"_atlas",void 0)}get texture(){return this._atlas}get mapping(){return this._atlas&&this._atlas.mapping}get scale(){const{fontSize:e,buffer:n}=this.props;return(e*ne+n*2)/e}setProps(e={}){Object.assign(this.props,e),this._key=this._getKey();const n=vn(this._key,this.props.characterSet),i=gt.get(this._key);if(i&&n.size===0){this._atlas!==i&&(this._atlas=i);return}const r=this._generateFontAtlas(n,i);this._atlas=r,gt.set(this._key,r)}_generateFontAtlas(e,n){const{fontFamily:i,fontWeight:r,fontSize:o,buffer:a,sdf:s,radius:l,cutoff:u}=this.props;let d=n&&n.data;d||(d=document.createElement("canvas"),d.width=te);const c=d.getContext("2d",{willReadFrequently:!0});ie(c,i,o,r);const{mapping:g,canvasHeight:f,xOffset:m,yOffset:x}=dn({getFontWidth:p=>c.measureText(p).width,fontHeight:o*ne,buffer:a,characterSet:e,maxCanvasWidth:te,...n&&{mapping:n.mapping,xOffset:n.xOffset,yOffset:n.yOffset}});if(d.height!==f){const p=c.getImageData(0,0,d.width,d.height);d.height=f,c.putImageData(p,0,0)}if(ie(c,i,o,r),s){const p=new ln({fontSize:o,buffer:a,radius:l,cutoff:u,fontFamily:i,fontWeight:"".concat(r)});for(const h of e){const{data:y,width:b,height:S,glyphTop:_}=p.draw(h);g[h].width=b,g[h].layoutOffsetY=o*ee-_;const L=c.createImageData(b,S);Pn(y,L),c.putImageData(L,g[h].x,g[h].y)}}else for(const p of e)c.fillText(p,g[p].x,g[p].y+a+o*ee);return{xOffset:m,yOffset:x,mapping:g,data:d,width:d.width,height:d.height}}_getKey(){const{fontFamily:e,fontWeight:n,fontSize:i,buffer:r,sdf:o,radius:a,cutoff:s}=this.props;return o?"".concat(e," ").concat(n," ").concat(i," ").concat(r," ").concat(a," ").concat(s):"".concat(e," ").concat(n," ").concat(i," ").concat(r)}}const bn=`#define SHADER_NAME text-background-layer-vertex-shader

attribute vec2 positions;

attribute vec3 instancePositions;
attribute vec3 instancePositions64Low;
attribute vec4 instanceRects;
attribute float instanceSizes;
attribute float instanceAngles;
attribute vec2 instancePixelOffsets;
attribute float instanceLineWidths;
attribute vec4 instanceFillColors;
attribute vec4 instanceLineColors;
attribute vec3 instancePickingColors;

uniform bool billboard;
uniform float opacity;
uniform float sizeScale;
uniform float sizeMinPixels;
uniform float sizeMaxPixels;
uniform vec4 padding;
uniform int sizeUnits;

varying vec4 vFillColor;
varying vec4 vLineColor;
varying float vLineWidth;
varying vec2 uv;
varying vec2 dimensions;

vec2 rotate_by_angle(vec2 vertex, float angle) {
  float angle_radian = radians(angle);
  float cos_angle = cos(angle_radian);
  float sin_angle = sin(angle_radian);
  mat2 rotationMatrix = mat2(cos_angle, -sin_angle, sin_angle, cos_angle);
  return rotationMatrix * vertex;
}

void main(void) {
  geometry.worldPosition = instancePositions;
  geometry.uv = positions;
  geometry.pickingColor = instancePickingColors;
  uv = positions;
  vLineWidth = instanceLineWidths;
  float sizePixels = clamp(
    project_size_to_pixel(instanceSizes * sizeScale, sizeUnits),
    sizeMinPixels, sizeMaxPixels
  );

  dimensions = instanceRects.zw * sizePixels + padding.xy + padding.zw;

  vec2 pixelOffset = (positions * instanceRects.zw + instanceRects.xy) * sizePixels + mix(-padding.xy, padding.zw, positions);
  pixelOffset = rotate_by_angle(pixelOffset, instanceAngles);
  pixelOffset += instancePixelOffsets;
  pixelOffset.y *= -1.0;

  if (billboard)  {
    gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, vec3(0.0), geometry.position);
    DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
    vec3 offset = vec3(pixelOffset, 0.0);
    DECKGL_FILTER_SIZE(offset, geometry);
    gl_Position.xy += project_pixel_size_to_clipspace(offset.xy);
  } else {
    vec3 offset_common = vec3(project_pixel_size(pixelOffset), 0.0);
    DECKGL_FILTER_SIZE(offset_common, geometry);
    gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, offset_common, geometry.position);
    DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
  }
  vFillColor = vec4(instanceFillColors.rgb, instanceFillColors.a * opacity);
  DECKGL_FILTER_COLOR(vFillColor, geometry);
  vLineColor = vec4(instanceLineColors.rgb, instanceLineColors.a * opacity);
  DECKGL_FILTER_COLOR(vLineColor, geometry);
}
`,Sn=`#define SHADER_NAME text-background-layer-fragment-shader

precision highp float;

uniform bool stroked;

varying vec4 vFillColor;
varying vec4 vLineColor;
varying float vLineWidth;
varying vec2 uv;
varying vec2 dimensions;

void main(void) {
  geometry.uv = uv;

  vec2 pixelPosition = uv * dimensions;
  if (stroked) {
    float distToEdge = min(
      min(pixelPosition.x, dimensions.x - pixelPosition.x),
      min(pixelPosition.y, dimensions.y - pixelPosition.y)
    );
    float isBorder = smoothedge(distToEdge, vLineWidth);
    gl_FragColor = mix(vFillColor, vLineColor, isBorder);
  } else {
    gl_FragColor = vFillColor;
  }

  DECKGL_FILTER_COLOR(gl_FragColor, geometry);
}
`,Ln={billboard:!0,sizeScale:1,sizeUnits:"pixels",sizeMinPixels:0,sizeMaxPixels:Number.MAX_SAFE_INTEGER,padding:{type:"array",value:[0,0,0,0]},getPosition:{type:"accessor",value:t=>t.position},getSize:{type:"accessor",value:1},getAngle:{type:"accessor",value:0},getPixelOffset:{type:"accessor",value:[0,0]},getBoundingRect:{type:"accessor",value:[0,0,0,0]},getFillColor:{type:"accessor",value:[0,0,0,255]},getLineColor:{type:"accessor",value:[0,0,0,255]},getLineWidth:{type:"accessor",value:1}};class Ut extends Et{constructor(...e){super(...e),A(this,"state",void 0)}getShaders(){return super.getShaders({vs:bn,fs:Sn,modules:[Ot,kt]})}initializeState(){this.getAttributeManager().addInstanced({instancePositions:{size:3,type:5130,fp64:this.use64bitPositions(),transition:!0,accessor:"getPosition"},instanceSizes:{size:1,transition:!0,accessor:"getSize",defaultValue:1},instanceAngles:{size:1,transition:!0,accessor:"getAngle"},instanceRects:{size:4,accessor:"getBoundingRect"},instancePixelOffsets:{size:2,transition:!0,accessor:"getPixelOffset"},instanceFillColors:{size:4,transition:!0,normalized:!0,type:5121,accessor:"getFillColor",defaultValue:[0,0,0,255]},instanceLineColors:{size:4,transition:!0,normalized:!0,type:5121,accessor:"getLineColor",defaultValue:[0,0,0,255]},instanceLineWidths:{size:1,transition:!0,accessor:"getLineWidth",defaultValue:1}})}updateState(e){super.updateState(e);const{changeFlags:n}=e;if(n.extensionsChanged){var i;const{gl:r}=this.context;(i=this.state.model)===null||i===void 0||i.delete(),this.state.model=this._getModel(r),this.getAttributeManager().invalidateAll()}}draw({uniforms:e}){const{billboard:n,sizeScale:i,sizeUnits:r,sizeMinPixels:o,sizeMaxPixels:a,getLineWidth:s}=this.props;let{padding:l}=this.props;l.length<4&&(l=[l[0],l[1],l[0],l[1]]),this.state.model.setUniforms(e).setUniforms({billboard:n,stroked:!!s,padding:l,sizeUnits:ct[r],sizeScale:i,sizeMinPixels:o,sizeMaxPixels:a}).draw()}_getModel(e){const n=[0,0,1,0,1,1,0,1];return new Rt(e,{...this.getShaders(),id:this.props.id,geometry:new Wt({drawMode:6,vertexCount:4,attributes:{positions:{size:2,value:new Float32Array(n)}}}),isInstanced:!0})}}A(Ut,"defaultProps",Ln);A(Ut,"layerName","TextBackgroundLayer");const re={start:1,middle:0,end:-1},oe={top:1,center:0,bottom:-1},bt=[0,0,0,255],Mn=1,An={billboard:!0,sizeScale:1,sizeUnits:"pixels",sizeMinPixels:0,sizeMaxPixels:Number.MAX_SAFE_INTEGER,background:!1,getBackgroundColor:{type:"accessor",value:[255,255,255,255]},getBorderColor:{type:"accessor",value:bt},getBorderWidth:{type:"accessor",value:0},backgroundPadding:{type:"array",value:[0,0,0,0]},characterSet:{type:"object",value:V.characterSet},fontFamily:V.fontFamily,fontWeight:V.fontWeight,lineHeight:Mn,outlineWidth:{type:"number",value:0,min:0},outlineColor:{type:"color",value:bt},fontSettings:{type:"object",value:{},compare:1},wordBreak:"break-word",maxWidth:{type:"number",value:-1},getText:{type:"accessor",value:t=>t.text},getPosition:{type:"accessor",value:t=>t.position},getColor:{type:"accessor",value:bt},getSize:{type:"accessor",value:32},getAngle:{type:"accessor",value:0},getTextAnchor:{type:"accessor",value:"middle"},getAlignmentBaseline:{type:"accessor",value:"center"},getPixelOffset:{type:"accessor",value:[0,0]},backgroundColor:{deprecatedFor:["background","getBackgroundColor"]}};class Nt extends ve{constructor(...e){super(...e),A(this,"state",void 0),A(this,"getBoundingRect",(n,i)=>{let{size:[r,o]}=this.transformParagraph(n,i);const{fontSize:a}=this.state.fontAtlasManager.props;r/=a,o/=a;const{getTextAnchor:s,getAlignmentBaseline:l}=this.props,u=re[typeof s=="function"?s(n,i):s],d=oe[typeof l=="function"?l(n,i):l];return[(u-1)*r/2,(d-1)*o/2,r,o]}),A(this,"getIconOffsets",(n,i)=>{const{getTextAnchor:r,getAlignmentBaseline:o}=this.props,{x:a,y:s,rowWidth:l,size:[u,d]}=this.transformParagraph(n,i),c=re[typeof r=="function"?r(n,i):r],g=oe[typeof o=="function"?o(n,i):o],f=a.length,m=new Array(f*2);let x=0;for(let p=0;p<f;p++){const h=(1-c)*(u-l[p])/2;m[x++]=(c-1)*u/2+h+a[p],m[x++]=(g-1)*d/2+s[p]}return m})}initializeState(){this.state={styleVersion:0,fontAtlasManager:new Cn},this.props.maxWidth>0&&U.warn("v8.9 breaking change: TextLayer maxWidth is now relative to text size")()}updateState(e){const{props:n,oldProps:i,changeFlags:r}=e;(r.dataChanged||r.updateTriggersChanged&&(r.updateTriggersChanged.all||r.updateTriggersChanged.getText))&&this._updateText(),(this._updateFontAtlas()||n.lineHeight!==i.lineHeight||n.wordBreak!==i.wordBreak||n.maxWidth!==i.maxWidth)&&this.setState({styleVersion:this.state.styleVersion+1})}getPickingInfo({info:e}){return e.object=e.index>=0?this.props.data[e.index]:null,e}_updateFontAtlas(){const{fontSettings:e,fontFamily:n,fontWeight:i}=this.props,{fontAtlasManager:r,characterSet:o}=this.state,a={...e,characterSet:o,fontFamily:n,fontWeight:i};if(!r.mapping)return r.setProps(a),!0;for(const s in a)if(a[s]!==r.props[s])return r.setProps(a),!0;return!1}_updateText(){var e;const{data:n,characterSet:i}=this.props,r=(e=n.attributes)===null||e===void 0?void 0:e.getText;let{getText:o}=this.props,a=n.startIndices,s;const l=i==="auto"&&new Set;if(r&&a){const{texts:u,characterCount:d}=yn({...ArrayBuffer.isView(r)?{value:r}:r,length:n.length,startIndices:a,characterSet:l});s=d,o=(c,{index:g})=>u[g]}else{const{iterable:u,objectInfo:d}=xe(n);a=[0],s=0;for(const c of u){d.index++;const g=Array.from(o(c,d)||"");l&&g.forEach(l.add,l),s+=g.length,a.push(s)}}this.setState({getText:o,startIndices:a,numInstances:s,characterSet:l||i})}transformParagraph(e,n){const{fontAtlasManager:i}=this.state,r=i.mapping,o=this.state.getText,{wordBreak:a,lineHeight:s,maxWidth:l}=this.props,u=o(e,n)||"";return mn(u,s,a,l*i.props.fontSize,r)}renderLayers(){const{startIndices:e,numInstances:n,getText:i,fontAtlasManager:{scale:r,texture:o,mapping:a},styleVersion:s}=this.state,{data:l,_dataDiff:u,getPosition:d,getColor:c,getSize:g,getAngle:f,getPixelOffset:m,getBackgroundColor:x,getBorderColor:p,getBorderWidth:h,backgroundPadding:y,background:b,billboard:S,fontSettings:_,outlineWidth:L,outlineColor:w,sizeScale:z,sizeUnits:M,sizeMinPixels:T,sizeMaxPixels:C,transitions:v,updateTriggers:P}=this.props,I=this.getSubLayerClass("characters",Dt),k=this.getSubLayerClass("background",Ut);return[b&&new k({getFillColor:x,getLineColor:p,getLineWidth:h,padding:y,getPosition:d,getSize:g,getAngle:f,getPixelOffset:m,billboard:S,sizeScale:z,sizeUnits:M,sizeMinPixels:T,sizeMaxPixels:C,transitions:v&&{getPosition:v.getPosition,getAngle:v.getAngle,getSize:v.getSize,getFillColor:v.getBackgroundColor,getLineColor:v.getBorderColor,getLineWidth:v.getBorderWidth,getPixelOffset:v.getPixelOffset}},this.getSubLayerProps({id:"background",updateTriggers:{getPosition:P.getPosition,getAngle:P.getAngle,getSize:P.getSize,getFillColor:P.getBackgroundColor,getLineColor:P.getBorderColor,getLineWidth:P.getBorderWidth,getPixelOffset:P.getPixelOffset,getBoundingRect:{getText:P.getText,getTextAnchor:P.getTextAnchor,getAlignmentBaseline:P.getAlignmentBaseline,styleVersion:s}}}),{data:l.attributes&&l.attributes.background?{length:l.length,attributes:l.attributes.background}:l,_dataDiff:u,autoHighlight:!1,getBoundingRect:this.getBoundingRect}),new I({sdf:_.sdf,smoothing:Number.isFinite(_.smoothing)?_.smoothing:V.smoothing,outlineWidth:L/(_.radius||V.radius),outlineColor:w,iconAtlas:o,iconMapping:a,getPosition:d,getColor:c,getSize:g,getAngle:f,getPixelOffset:m,billboard:S,sizeScale:z*r,sizeUnits:M,sizeMinPixels:T*r,sizeMaxPixels:C*r,transitions:v&&{getPosition:v.getPosition,getAngle:v.getAngle,getColor:v.getColor,getSize:v.getSize,getPixelOffset:v.getPixelOffset}},this.getSubLayerProps({id:"characters",updateTriggers:{all:P.getText,getPosition:P.getPosition,getAngle:P.getAngle,getColor:P.getColor,getSize:P.getSize,getPixelOffset:P.getPixelOffset,getIconOffsets:{getTextAnchor:P.getTextAnchor,getAlignmentBaseline:P.getAlignmentBaseline,styleVersion:s}}}),{data:l,_dataDiff:u,startIndices:e,numInstances:n,getIconOffsets:this.getIconOffsets,getIcon:i})]}static set fontAtlasCacheLimit(e){_n(e)}}A(Nt,"defaultProps",An);A(Nt,"layerName","TextLayer");const ot={circle:{type:Bt,props:{filled:"filled",stroked:"stroked",lineWidthMaxPixels:"lineWidthMaxPixels",lineWidthMinPixels:"lineWidthMinPixels",lineWidthScale:"lineWidthScale",lineWidthUnits:"lineWidthUnits",pointRadiusMaxPixels:"radiusMaxPixels",pointRadiusMinPixels:"radiusMinPixels",pointRadiusScale:"radiusScale",pointRadiusUnits:"radiusUnits",pointAntialiasing:"antialiasing",pointBillboard:"billboard",getFillColor:"getFillColor",getLineColor:"getLineColor",getLineWidth:"getLineWidth",getPointRadius:"getRadius"}},icon:{type:pt,props:{iconAtlas:"iconAtlas",iconMapping:"iconMapping",iconSizeMaxPixels:"sizeMaxPixels",iconSizeMinPixels:"sizeMinPixels",iconSizeScale:"sizeScale",iconSizeUnits:"sizeUnits",iconAlphaCutoff:"alphaCutoff",iconBillboard:"billboard",getIcon:"getIcon",getIconAngle:"getAngle",getIconColor:"getColor",getIconPixelOffset:"getPixelOffset",getIconSize:"getSize"}},text:{type:Nt,props:{textSizeMaxPixels:"sizeMaxPixels",textSizeMinPixels:"sizeMinPixels",textSizeScale:"sizeScale",textSizeUnits:"sizeUnits",textBackground:"background",textBackgroundPadding:"backgroundPadding",textFontFamily:"fontFamily",textFontWeight:"fontWeight",textLineHeight:"lineHeight",textMaxWidth:"maxWidth",textOutlineColor:"outlineColor",textOutlineWidth:"outlineWidth",textWordBreak:"wordBreak",textCharacterSet:"characterSet",textBillboard:"billboard",textFontSettings:"fontSettings",getText:"getText",getTextAngle:"getAngle",getTextColor:"getColor",getTextPixelOffset:"getPixelOffset",getTextSize:"getSize",getTextAnchor:"getTextAnchor",getTextAlignmentBaseline:"getAlignmentBaseline",getTextBackgroundColor:"getBackgroundColor",getTextBorderColor:"getBorderColor",getTextBorderWidth:"getBorderWidth"}}},st={type:Be,props:{lineWidthUnits:"widthUnits",lineWidthScale:"widthScale",lineWidthMinPixels:"widthMinPixels",lineWidthMaxPixels:"widthMaxPixels",lineJointRounded:"jointRounded",lineCapRounded:"capRounded",lineMiterLimit:"miterLimit",lineBillboard:"billboard",getLineColor:"getColor",getLineWidth:"getWidth"}},At={type:De,props:{extruded:"extruded",filled:"filled",wireframe:"wireframe",elevationScale:"elevationScale",material:"material",_full3d:"_full3d",getElevation:"getElevation",getFillColor:"getFillColor",getLineColor:"getLineColor"}};function $({type:t,props:e}){const n={};for(const i in e)n[i]=t.defaultProps[e[i]];return n}function St(t,e){const{transitions:n,updateTriggers:i}=t.props,r={updateTriggers:{},transitions:n&&{getPosition:n.geometry}};for(const o in e){const a=e[o];let s=t.props[o];o.startsWith("get")&&(s=t.getSubLayerAccessor(s),r.updateTriggers[a]=i[o],n&&(r.transitions[a]=n[o])),r[a]=s}return r}function zn(t){if(Array.isArray(t))return t;switch(U.assert(t.type,"GeoJSON does not have type"),t.type){case"Feature":return[t];case"FeatureCollection":return U.assert(Array.isArray(t.features),"GeoJSON does not have features array"),t.features;default:return[{geometry:t}]}}function se(t,e,n={}){const i={pointFeatures:[],lineFeatures:[],polygonFeatures:[],polygonOutlineFeatures:[]},{startRow:r=0,endRow:o=t.length}=n;for(let a=r;a<o;a++){const s=t[a],{geometry:l}=s;if(l)if(l.type==="GeometryCollection"){U.assert(Array.isArray(l.geometries),"GeoJSON does not have geometries array");const{geometries:u}=l;for(let d=0;d<u.length;d++){const c=u[d];ae(c,i,e,s,a)}}else ae(l,i,e,s,a)}return i}function ae(t,e,n,i,r){const{type:o,coordinates:a}=t,{pointFeatures:s,lineFeatures:l,polygonFeatures:u,polygonOutlineFeatures:d}=e;if(!Tn(o,a)){U.warn("".concat(o," coordinates are malformed"))();return}switch(o){case"Point":s.push(n({geometry:t},i,r));break;case"MultiPoint":a.forEach(c=>{s.push(n({geometry:{type:"Point",coordinates:c}},i,r))});break;case"LineString":l.push(n({geometry:t},i,r));break;case"MultiLineString":a.forEach(c=>{l.push(n({geometry:{type:"LineString",coordinates:c}},i,r))});break;case"Polygon":u.push(n({geometry:t},i,r)),a.forEach(c=>{d.push(n({geometry:{type:"LineString",coordinates:c}},i,r))});break;case"MultiPolygon":a.forEach(c=>{u.push(n({geometry:{type:"Polygon",coordinates:c}},i,r)),c.forEach(g=>{d.push(n({geometry:{type:"LineString",coordinates:g}},i,r))})});break}}const wn={Point:1,MultiPoint:2,LineString:2,MultiLineString:3,Polygon:3,MultiPolygon:4};function Tn(t,e){let n=wn[t];for(U.assert(n,"Unknown GeoJSON type ".concat(t));e&&--n>0;)e=e[0];return e&&Number.isFinite(e[0])}function Me(){return{points:{},lines:{},polygons:{},polygonsOutline:{}}}function et(t){return t.geometry.coordinates}function In(t,e){const n=Me(),{pointFeatures:i,lineFeatures:r,polygonFeatures:o,polygonOutlineFeatures:a}=t;return n.points.data=i,n.points._dataDiff=e.pointFeatures&&(()=>e.pointFeatures),n.points.getPosition=et,n.lines.data=r,n.lines._dataDiff=e.lineFeatures&&(()=>e.lineFeatures),n.lines.getPath=et,n.polygons.data=o,n.polygons._dataDiff=e.polygonFeatures&&(()=>e.polygonFeatures),n.polygons.getPolygon=et,n.polygonsOutline.data=a,n.polygonsOutline._dataDiff=e.polygonOutlineFeatures&&(()=>e.polygonOutlineFeatures),n.polygonsOutline.getPath=et,n}function Fn(t,e){const n=Me(),{points:i,lines:r,polygons:o}=t,a=on(t,e);return n.points.data={length:i.positions.value.length/i.positions.size,attributes:{...i.attributes,getPosition:i.positions,instancePickingColors:{size:3,value:a.points}},properties:i.properties,numericProps:i.numericProps,featureIds:i.featureIds},n.lines.data={length:r.pathIndices.value.length-1,startIndices:r.pathIndices.value,attributes:{...r.attributes,getPath:r.positions,instancePickingColors:{size:3,value:a.lines}},properties:r.properties,numericProps:r.numericProps,featureIds:r.featureIds},n.lines._pathType="open",n.polygons.data={length:o.polygonIndices.value.length-1,startIndices:o.polygonIndices.value,attributes:{...o.attributes,getPolygon:o.positions,pickingColors:{size:3,value:a.polygons}},properties:o.properties,numericProps:o.numericProps,featureIds:o.featureIds},n.polygons._normalize=!1,o.triangles&&(n.polygons.data.attributes.indices=o.triangles.value),n.polygonsOutline.data={length:o.primitivePolygonIndices.value.length-1,startIndices:o.primitivePolygonIndices.value,attributes:{...o.attributes,getPath:o.positions,instancePickingColors:{size:3,value:a.polygons}},properties:o.properties,numericProps:o.numericProps,featureIds:o.featureIds},n.polygonsOutline._pathType="open",n}const En=["points","linestrings","polygons"],On={...$(ot.circle),...$(ot.icon),...$(ot.text),...$(st),...$(At),stroked:!0,filled:!0,extruded:!1,wireframe:!1,_full3d:!1,iconAtlas:{type:"object",value:null},iconMapping:{type:"object",value:{}},getIcon:{type:"accessor",value:t=>t.properties.icon},getText:{type:"accessor",value:t=>t.properties.text},pointType:"circle",getRadius:{deprecatedFor:"getPointRadius"}};class Ae extends ve{initializeState(){this.state={layerProps:{},features:{}}}updateState({props:e,changeFlags:n}){if(!n.dataChanged)return;const{data:i}=this.props,r=i&&"points"in i&&"polygons"in i&&"lines"in i;this.setState({binary:r}),r?this._updateStateBinary({props:e,changeFlags:n}):this._updateStateJSON({props:e,changeFlags:n})}_updateStateBinary({props:e,changeFlags:n}){const i=Fn(e.data,this.encodePickingColor);this.setState({layerProps:i})}_updateStateJSON({props:e,changeFlags:n}){const i=zn(e.data),r=this.getSubLayerRow.bind(this);let o={};const a={};if(Array.isArray(n.dataChanged)){const l=this.state.features;for(const u in l)o[u]=l[u].slice(),a[u]=[];for(const u of n.dataChanged){const d=se(i,r,u);for(const c in l)a[c].push(Ue({data:o[c],getIndex:g=>g.__source.index,dataRange:u,replace:d[c]}))}}else o=se(i,r);const s=In(o,a);this.setState({features:o,featuresDiff:a,layerProps:s})}getPickingInfo(e){const n=super.getPickingInfo(e),{index:i,sourceLayer:r}=n;return n.featureType=En.find(o=>r.id.startsWith("".concat(this.id,"-").concat(o,"-"))),i>=0&&r.id.startsWith("".concat(this.id,"-points-text"))&&this.state.binary&&(n.index=this.props.data.points.globalFeatureIds.value[i]),n}_updateAutoHighlight(e){const n="".concat(this.id,"-points-"),i=e.featureType==="points";for(const r of this.getSubLayers())r.id.startsWith(n)===i&&r.updateAutoHighlight(e)}_renderPolygonLayer(){const{extruded:e,wireframe:n}=this.props,{layerProps:i}=this.state,r="polygons-fill",o=this.shouldRenderSubLayer(r,i.polygons.data)&&this.getSubLayerClass(r,At.type);if(o){const a=St(this,At.props),s=e&&n;return s||delete a.getLineColor,a.updateTriggers.lineColors=s,new o(a,this.getSubLayerProps({id:r,updateTriggers:a.updateTriggers}),i.polygons)}return null}_renderLineLayers(){const{extruded:e,stroked:n}=this.props,{layerProps:i}=this.state,r="polygons-stroke",o="linestrings",a=!e&&n&&this.shouldRenderSubLayer(r,i.polygonsOutline.data)&&this.getSubLayerClass(r,st.type),s=this.shouldRenderSubLayer(o,i.lines.data)&&this.getSubLayerClass(o,st.type);if(a||s){const l=St(this,st.props);return[a&&new a(l,this.getSubLayerProps({id:r,updateTriggers:l.updateTriggers}),i.polygonsOutline),s&&new s(l,this.getSubLayerProps({id:o,updateTriggers:l.updateTriggers}),i.lines)]}return null}_renderPointLayers(){const{pointType:e}=this.props,{layerProps:n,binary:i}=this.state;let{highlightedObjectIndex:r}=this.props;!i&&Number.isFinite(r)&&(r=n.points.data.findIndex(s=>s.__source.index===r));const o=new Set(e.split("+")),a=[];for(const s of o){const l="points-".concat(s),u=ot[s],d=u&&this.shouldRenderSubLayer(l,n.points.data)&&this.getSubLayerClass(l,u.type);if(d){const c=St(this,u.props);let g=n.points;if(s==="text"&&i){const{instancePickingColors:f,...m}=g.data.attributes;g={...g,data:{...g.data,attributes:m}}}a.push(new d(c,this.getSubLayerProps({id:l,updateTriggers:c.updateTriggers,highlightedObjectIndex:r}),g))}}return a}renderLayers(){const{extruded:e}=this.props,n=this._renderPolygonLayer(),i=this._renderLineLayers(),r=this._renderPointLayers();return[!e&&n,i,r,e&&n]}getSubLayerAccessor(e){const{binary:n}=this.state;return!n||typeof e!="function"?super.getSubLayerAccessor(e):(i,r)=>{const{data:o,index:a}=r,s=nn(o,a);return e(s,r)}}}A(Ae,"layerName","GeoJsonLayer");A(Ae,"defaultProps",On);function Z(t,e,n){t=+t,e=+e,n=(r=arguments.length)<2?(e=t,t=0,1):r<3?1:+n;for(var i=-1,r=Math.max(0,Math.ceil((e-t)/n))|0,o=new Array(r);++i<r;)o[i]=t+i*n;return o}var Lt=Array.prototype.slice;function kn(t){return t}var at=1,lt=2,zt=3,nt=4,le=1e-6;function Rn(t){return"translate("+(t+.5)+",0)"}function Wn(t){return"translate(0,"+(t+.5)+")"}function Bn(t){return function(e){return+t(e)}}function Dn(t){var e=Math.max(0,t.bandwidth()-1)/2;return t.round()&&(e=Math.round(e)),function(n){return+t(n)+e}}function Un(){return!this.__axis}function Gt(t,e){var n=[],i=null,r=null,o=6,a=6,s=3,l=t===at||t===nt?-1:1,u=t===nt||t===lt?"x":"y",d=t===at||t===zt?Rn:Wn;function c(g){var f=i??(e.ticks?e.ticks.apply(e,n):e.domain()),m=r??(e.tickFormat?e.tickFormat.apply(e,n):kn),x=Math.max(o,0)+s,p=e.range(),h=+p[0]+.5,y=+p[p.length-1]+.5,b=(e.bandwidth?Dn:Bn)(e.copy()),S=g.selection?g.selection():g,_=S.selectAll(".domain").data([null]),L=S.selectAll(".tick").data(f,e).order(),w=L.exit(),z=L.enter().append("g").attr("class","tick"),M=L.select("line"),T=L.select("text");_=_.merge(_.enter().insert("path",".tick").attr("class","domain").attr("stroke","currentColor")),L=L.merge(z),M=M.merge(z.append("line").attr("stroke","currentColor").attr(u+"2",l*o)),T=T.merge(z.append("text").attr("fill","currentColor").attr(u,l*x).attr("dy",t===at?"0em":t===zt?"0.71em":"0.32em")),g!==S&&(_=_.transition(g),L=L.transition(g),M=M.transition(g),T=T.transition(g),w=w.transition(g).attr("opacity",le).attr("transform",function(C){return isFinite(C=b(C))?d(C):this.getAttribute("transform")}),z.attr("opacity",le).attr("transform",function(C){var v=this.parentNode.__axis;return d(v&&isFinite(v=v(C))?v:b(C))})),w.remove(),_.attr("d",t===nt||t==lt?a?"M"+l*a+","+h+"H0.5V"+y+"H"+l*a:"M0.5,"+h+"V"+y:a?"M"+h+","+l*a+"V0.5H"+y+"V"+l*a:"M"+h+",0.5H"+y),L.attr("opacity",1).attr("transform",function(C){return d(b(C))}),M.attr(u+"2",l*o),T.attr(u,l*x).text(m),S.filter(Un).attr("fill","none").attr("font-size",10).attr("font-family","sans-serif").attr("text-anchor",t===lt?"start":t===nt?"end":"middle"),S.each(function(){this.__axis=b})}return c.scale=function(g){return arguments.length?(e=g,c):e},c.ticks=function(){return n=Lt.call(arguments),c},c.tickArguments=function(g){return arguments.length?(n=g==null?[]:Lt.call(g),c):n.slice()},c.tickValues=function(g){return arguments.length?(i=g==null?null:Lt.call(g),c):i&&i.slice()},c.tickFormat=function(g){return arguments.length?(r=g,c):r},c.tickSize=function(g){return arguments.length?(o=a=+g,c):o},c.tickSizeInner=function(g){return arguments.length?(o=+g,c):o},c.tickSizeOuter=function(g){return arguments.length?(a=+g,c):a},c.tickPadding=function(g){return arguments.length?(s=+g,c):s},c}function Nn(t){return Gt(at,t)}function ze(t){return Gt(lt,t)}function Gn(t){return Gt(zt,t)}var wt=Math.PI,Tt=2*wt,j=1e-6,Hn=Tt-j;function It(){this._x0=this._y0=this._x1=this._y1=null,this._=""}function we(){return new It}It.prototype=we.prototype={constructor:It,moveTo:function(t,e){this._+="M"+(this._x0=this._x1=+t)+","+(this._y0=this._y1=+e)},closePath:function(){this._x1!==null&&(this._x1=this._x0,this._y1=this._y0,this._+="Z")},lineTo:function(t,e){this._+="L"+(this._x1=+t)+","+(this._y1=+e)},quadraticCurveTo:function(t,e,n,i){this._+="Q"+ +t+","+ +e+","+(this._x1=+n)+","+(this._y1=+i)},bezierCurveTo:function(t,e,n,i,r,o){this._+="C"+ +t+","+ +e+","+ +n+","+ +i+","+(this._x1=+r)+","+(this._y1=+o)},arcTo:function(t,e,n,i,r){t=+t,e=+e,n=+n,i=+i,r=+r;var o=this._x1,a=this._y1,s=n-t,l=i-e,u=o-t,d=a-e,c=u*u+d*d;if(r<0)throw new Error("negative radius: "+r);if(this._x1===null)this._+="M"+(this._x1=t)+","+(this._y1=e);else if(c>j)if(!(Math.abs(d*s-l*u)>j)||!r)this._+="L"+(this._x1=t)+","+(this._y1=e);else{var g=n-o,f=i-a,m=s*s+l*l,x=g*g+f*f,p=Math.sqrt(m),h=Math.sqrt(c),y=r*Math.tan((wt-Math.acos((m+c-x)/(2*p*h)))/2),b=y/h,S=y/p;Math.abs(b-1)>j&&(this._+="L"+(t+b*u)+","+(e+b*d)),this._+="A"+r+","+r+",0,0,"+ +(d*g>u*f)+","+(this._x1=t+S*s)+","+(this._y1=e+S*l)}},arc:function(t,e,n,i,r,o){t=+t,e=+e,n=+n,o=!!o;var a=n*Math.cos(i),s=n*Math.sin(i),l=t+a,u=e+s,d=1^o,c=o?i-r:r-i;if(n<0)throw new Error("negative radius: "+n);this._x1===null?this._+="M"+l+","+u:(Math.abs(this._x1-l)>j||Math.abs(this._y1-u)>j)&&(this._+="L"+l+","+u),n&&(c<0&&(c=c%Tt+Tt),c>Hn?this._+="A"+n+","+n+",0,1,"+d+","+(t-a)+","+(e-s)+"A"+n+","+n+",0,1,"+d+","+(this._x1=l)+","+(this._y1=u):c>j&&(this._+="A"+n+","+n+",0,"+ +(c>=wt)+","+d+","+(this._x1=t+n*Math.cos(r))+","+(this._y1=e+n*Math.sin(r))))},rect:function(t,e,n,i){this._+="M"+(this._x0=this._x1=+t)+","+(this._y0=this._y1=+e)+"h"+ +n+"v"+ +i+"h"+-n+"Z"},toString:function(){return this._}};function jn(t){return Math.abs(t=Math.round(t))>=1e21?t.toLocaleString("en").replace(/,/g,""):t.toString(10)}function dt(t,e){if((n=(t=e?t.toExponential(e-1):t.toExponential()).indexOf("e"))<0)return null;var n,i=t.slice(0,n);return[i.length>1?i[0]+i.slice(2):i,+t.slice(n+1)]}function qn(t){return t=dt(Math.abs(t)),t?t[1]:NaN}function Kn(t,e){return function(n,i){for(var r=n.length,o=[],a=0,s=t[0],l=0;r>0&&s>0&&(l+s+1>i&&(s=Math.max(1,i-l)),o.push(n.substring(r-=s,r+s)),!((l+=s+1)>i));)s=t[a=(a+1)%t.length];return o.reverse().join(e)}}function Vn(t){return function(e){return e.replace(/[0-9]/g,function(n){return t[+n]})}}var Yn=/^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;function Ft(t){if(!(e=Yn.exec(t)))throw new Error("invalid format: "+t);var e;return new Ht({fill:e[1],align:e[2],sign:e[3],symbol:e[4],zero:e[5],width:e[6],comma:e[7],precision:e[8]&&e[8].slice(1),trim:e[9],type:e[10]})}Ft.prototype=Ht.prototype;function Ht(t){this.fill=t.fill===void 0?" ":t.fill+"",this.align=t.align===void 0?">":t.align+"",this.sign=t.sign===void 0?"-":t.sign+"",this.symbol=t.symbol===void 0?"":t.symbol+"",this.zero=!!t.zero,this.width=t.width===void 0?void 0:+t.width,this.comma=!!t.comma,this.precision=t.precision===void 0?void 0:+t.precision,this.trim=!!t.trim,this.type=t.type===void 0?"":t.type+""}Ht.prototype.toString=function(){return this.fill+this.align+this.sign+this.symbol+(this.zero?"0":"")+(this.width===void 0?"":Math.max(1,this.width|0))+(this.comma?",":"")+(this.precision===void 0?"":"."+Math.max(0,this.precision|0))+(this.trim?"~":"")+this.type};function $n(t){t:for(var e=t.length,n=1,i=-1,r;n<e;++n)switch(t[n]){case".":i=r=n;break;case"0":i===0&&(i=n),r=n;break;default:if(!+t[n])break t;i>0&&(i=0);break}return i>0?t.slice(0,i)+t.slice(r+1):t}var Te;function Xn(t,e){var n=dt(t,e);if(!n)return t+"";var i=n[0],r=n[1],o=r-(Te=Math.max(-8,Math.min(8,Math.floor(r/3)))*3)+1,a=i.length;return o===a?i:o>a?i+new Array(o-a+1).join("0"):o>0?i.slice(0,o)+"."+i.slice(o):"0."+new Array(1-o).join("0")+dt(t,Math.max(0,e+o-1))[0]}function ce(t,e){var n=dt(t,e);if(!n)return t+"";var i=n[0],r=n[1];return r<0?"0."+new Array(-r).join("0")+i:i.length>r+1?i.slice(0,r+1)+"."+i.slice(r+1):i+new Array(r-i.length+2).join("0")}const ue={"%":function(t,e){return(t*100).toFixed(e)},b:function(t){return Math.round(t).toString(2)},c:function(t){return t+""},d:jn,e:function(t,e){return t.toExponential(e)},f:function(t,e){return t.toFixed(e)},g:function(t,e){return t.toPrecision(e)},o:function(t){return Math.round(t).toString(8)},p:function(t,e){return ce(t*100,e)},r:ce,s:Xn,X:function(t){return Math.round(t).toString(16).toUpperCase()},x:function(t){return Math.round(t).toString(16)}};function ge(t){return t}var de=Array.prototype.map,fe=["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];function Jn(t){var e=t.grouping===void 0||t.thousands===void 0?ge:Kn(de.call(t.grouping,Number),t.thousands+""),n=t.currency===void 0?"":t.currency[0]+"",i=t.currency===void 0?"":t.currency[1]+"",r=t.decimal===void 0?".":t.decimal+"",o=t.numerals===void 0?ge:Vn(de.call(t.numerals,String)),a=t.percent===void 0?"%":t.percent+"",s=t.minus===void 0?"-":t.minus+"",l=t.nan===void 0?"NaN":t.nan+"";function u(c){c=Ft(c);var g=c.fill,f=c.align,m=c.sign,x=c.symbol,p=c.zero,h=c.width,y=c.comma,b=c.precision,S=c.trim,_=c.type;_==="n"?(y=!0,_="g"):ue[_]||(b===void 0&&(b=12),S=!0,_="g"),(p||g==="0"&&f==="=")&&(p=!0,g="0",f="=");var L=x==="$"?n:x==="#"&&/[boxX]/.test(_)?"0"+_.toLowerCase():"",w=x==="$"?i:/[%p]/.test(_)?a:"",z=ue[_],M=/[defgprs%]/.test(_);b=b===void 0?6:/[gprs]/.test(_)?Math.max(1,Math.min(21,b)):Math.max(0,Math.min(20,b));function T(C){var v=L,P=w,I,k,E;if(_==="c")P=z(C)+P,C="";else{C=+C;var W=C<0||1/C<0;if(C=isNaN(C)?l:z(Math.abs(C),b),S&&(C=$n(C)),W&&+C==0&&m!=="+"&&(W=!1),v=(W?m==="("?m:s:m==="-"||m==="("?"":m)+v,P=(_==="s"?fe[8+Te/3]:"")+P+(W&&m==="("?")":""),M){for(I=-1,k=C.length;++I<k;)if(E=C.charCodeAt(I),48>E||E>57){P=(E===46?r+C.slice(I+1):C.slice(I))+P,C=C.slice(0,I);break}}}y&&!p&&(C=e(C,1/0));var B=v.length+C.length+P.length,F=B<h?new Array(h-B+1).join(g):"";switch(y&&p&&(C=e(F+C,F.length?h-P.length:1/0),F=""),f){case"<":C=v+C+P+F;break;case"=":C=v+F+C+P;break;case"^":C=F.slice(0,B=F.length>>1)+v+C+P+F.slice(B);break;default:C=F+v+C+P;break}return o(C)}return T.toString=function(){return c+""},T}function d(c,g){var f=u((c=Ft(c),c.type="f",c)),m=Math.max(-8,Math.min(8,Math.floor(qn(g)/3)))*3,x=Math.pow(10,-m),p=fe[8+m/3];return function(h){return f(x*h)+p}}return{format:u,formatPrefix:d}}var it,Y;Zn({decimal:".",thousands:",",grouping:[3],currency:["$",""],minus:"-"});function Zn(t){return it=Jn(t),Y=it.format,it.formatPrefix,it}function Qn(t,e,n){t=+t,e=+e,n=(r=arguments.length)<2?(e=t,t=0,1):r<3?1:+n;for(var i=-1,r=Math.max(0,Math.ceil((e-t)/n))|0,o=new Array(r);++i<r;)o[i]=t+i*n;return o}var he={name:"implicit"};function Ie(){var t=Kt(),e=[],n=[],i=he;function r(o){var a=o+"",s=t.get(a);if(!s){if(i!==he)return i;t.set(a,s=e.push(o))}return n[(s-1)%n.length]}return r.domain=function(o){if(!arguments.length)return e.slice();e=[],t=Kt();for(var a=-1,s=o.length,l,u;++a<s;)t.has(u=(l=o[a])+"")||t.set(u,e.push(l));return r},r.range=function(o){return arguments.length?(n=Ne.call(o),r):n.slice()},r.unknown=function(o){return arguments.length?(i=o,r):i},r.copy=function(){return Ie(e,n).unknown(i)},Pe.apply(r,arguments),r}function Fe(){var t=Ie().unknown(void 0),e=t.domain,n=t.range,i=[0,1],r,o,a=!1,s=0,l=0,u=.5;delete t.unknown;function d(){var c=e().length,g=i[1]<i[0],f=i[g-0],m=i[1-g];r=(m-f)/Math.max(1,c-s+l*2),a&&(r=Math.floor(r)),f+=(m-f-r*(c-s))*u,o=r*(1-s),a&&(f=Math.round(f),o=Math.round(o));var x=Qn(c).map(function(p){return f+r*p});return n(g?x.reverse():x)}return t.domain=function(c){return arguments.length?(e(c),d()):e()},t.range=function(c){return arguments.length?(i=[+c[0],+c[1]],d()):i.slice()},t.rangeRound=function(c){return i=[+c[0],+c[1]],a=!0,d()},t.bandwidth=function(){return o},t.step=function(){return r},t.round=function(c){return arguments.length?(a=!!c,d()):a},t.padding=function(c){return arguments.length?(s=Math.min(1,l=+c),d()):s},t.paddingInner=function(c){return arguments.length?(s=Math.min(1,c),d()):s},t.paddingOuter=function(c){return arguments.length?(l=+c,d()):l},t.align=function(c){return arguments.length?(u=Math.max(0,Math.min(1,c)),d()):u},t.copy=function(){return Fe(e(),i).round(a).paddingInner(s).paddingOuter(l).align(u)},Pe.apply(d(),arguments)}function Ee(t){var e=t.copy;return t.padding=t.paddingOuter,delete t.paddingInner,delete t.paddingOuter,t.copy=function(){return Ee(e())},t}function ft(){return Ee(Fe.apply(null,arguments).paddingInner(1))}function G(t){return function(){return t}}var pe=Math.abs,O=Math.atan2,H=Math.cos,ti=Math.max,Mt=Math.min,D=Math.sin,K=Math.sqrt,R=1e-12,Q=Math.PI,ht=Q/2,ei=2*Q;function ni(t){return t>1?0:t<-1?Q:Math.acos(t)}function me(t){return t>=1?ht:t<=-1?-ht:Math.asin(t)}function ii(t){return t.innerRadius}function ri(t){return t.outerRadius}function oi(t){return t.startAngle}function si(t){return t.endAngle}function ai(t){return t&&t.padAngle}function li(t,e,n,i,r,o,a,s){var l=n-t,u=i-e,d=a-r,c=s-o,g=c*l-d*u;if(!(g*g<R))return g=(d*(e-o)-c*(t-r))/g,[t+g*l,e+g*u]}function rt(t,e,n,i,r,o,a){var s=t-n,l=e-i,u=(a?o:-o)/K(s*s+l*l),d=u*l,c=-u*s,g=t+d,f=e+c,m=n+d,x=i+c,p=(g+m)/2,h=(f+x)/2,y=m-g,b=x-f,S=y*y+b*b,_=r-o,L=g*x-m*f,w=(b<0?-1:1)*K(ti(0,_*_*S-L*L)),z=(L*b-y*w)/S,M=(-L*y-b*w)/S,T=(L*b+y*w)/S,C=(-L*y+b*w)/S,v=z-p,P=M-h,I=T-p,k=C-h;return v*v+P*P>I*I+k*k&&(z=T,M=C),{cx:z,cy:M,x01:-d,y01:-c,x11:z*(r/_-1),y11:M*(r/_-1)}}function Oe(){var t=ii,e=ri,n=G(0),i=null,r=oi,o=si,a=ai,s=null;function l(){var u,d,c=+t.apply(this,arguments),g=+e.apply(this,arguments),f=r.apply(this,arguments)-ht,m=o.apply(this,arguments)-ht,x=pe(m-f),p=m>f;if(s||(s=u=we()),g<c&&(d=g,g=c,c=d),!(g>R))s.moveTo(0,0);else if(x>ei-R)s.moveTo(g*H(f),g*D(f)),s.arc(0,0,g,f,m,!p),c>R&&(s.moveTo(c*H(m),c*D(m)),s.arc(0,0,c,m,f,p));else{var h=f,y=m,b=f,S=m,_=x,L=x,w=a.apply(this,arguments)/2,z=w>R&&(i?+i.apply(this,arguments):K(c*c+g*g)),M=Mt(pe(g-c)/2,+n.apply(this,arguments)),T=M,C=M,v,P;if(z>R){var I=me(z/c*D(w)),k=me(z/g*D(w));(_-=I*2)>R?(I*=p?1:-1,b+=I,S-=I):(_=0,b=S=(f+m)/2),(L-=k*2)>R?(k*=p?1:-1,h+=k,y-=k):(L=0,h=y=(f+m)/2)}var E=g*H(h),W=g*D(h),B=c*H(S),F=c*D(S);if(M>R){var q=g*H(y),tt=g*D(y),mt=c*H(b),yt=c*D(b),N;if(x<Q&&(N=li(E,W,mt,yt,q,tt,B,F))){var xt=E-N[0],vt=W-N[1],Pt=q-N[0],_t=tt-N[1],jt=1/D(ni((xt*Pt+vt*_t)/(K(xt*xt+vt*vt)*K(Pt*Pt+_t*_t)))/2),qt=K(N[0]*N[0]+N[1]*N[1]);T=Mt(M,(c-qt)/(jt-1)),C=Mt(M,(g-qt)/(jt+1))}}L>R?C>R?(v=rt(mt,yt,E,W,g,C,p),P=rt(q,tt,B,F,g,C,p),s.moveTo(v.cx+v.x01,v.cy+v.y01),C<M?s.arc(v.cx,v.cy,C,O(v.y01,v.x01),O(P.y01,P.x01),!p):(s.arc(v.cx,v.cy,C,O(v.y01,v.x01),O(v.y11,v.x11),!p),s.arc(0,0,g,O(v.cy+v.y11,v.cx+v.x11),O(P.cy+P.y11,P.cx+P.x11),!p),s.arc(P.cx,P.cy,C,O(P.y11,P.x11),O(P.y01,P.x01),!p))):(s.moveTo(E,W),s.arc(0,0,g,h,y,!p)):s.moveTo(E,W),!(c>R)||!(_>R)?s.lineTo(B,F):T>R?(v=rt(B,F,q,tt,c,-T,p),P=rt(E,W,mt,yt,c,-T,p),s.lineTo(v.cx+v.x01,v.cy+v.y01),T<M?s.arc(v.cx,v.cy,T,O(v.y01,v.x01),O(P.y01,P.x01),!p):(s.arc(v.cx,v.cy,T,O(v.y01,v.x01),O(v.y11,v.x11),!p),s.arc(0,0,c,O(v.cy+v.y11,v.cx+v.x11),O(P.cy+P.y11,P.cx+P.x11),p),s.arc(P.cx,P.cy,T,O(P.y11,P.x11),O(P.y01,P.x01),!p))):s.arc(0,0,c,S,b,p)}if(s.closePath(),u)return s=null,u+""||null}return l.centroid=function(){var u=(+t.apply(this,arguments)+ +e.apply(this,arguments))/2,d=(+r.apply(this,arguments)+ +o.apply(this,arguments))/2-Q/2;return[H(d)*u,D(d)*u]},l.innerRadius=function(u){return arguments.length?(t=typeof u=="function"?u:G(+u),l):t},l.outerRadius=function(u){return arguments.length?(e=typeof u=="function"?u:G(+u),l):e},l.cornerRadius=function(u){return arguments.length?(n=typeof u=="function"?u:G(+u),l):n},l.padRadius=function(u){return arguments.length?(i=u==null?null:typeof u=="function"?u:G(+u),l):i},l.startAngle=function(u){return arguments.length?(r=typeof u=="function"?u:G(+u),l):r},l.endAngle=function(u){return arguments.length?(o=typeof u=="function"?u:G(+u),l):o},l.padAngle=function(u){return arguments.length?(a=typeof u=="function"?u:G(+u),l):a},l.context=function(u){return arguments.length?(s=u??null,l):s},l}function ke(t,e,n,i,r,o){var a=r||0,s=o||0,l=n||0,u=e||function(){return"#fff"},d=i,c;function g(f){g.el=f,g.setProperties()}return g.setProperties=function(){this.el&&(g.svgGroup||(g.svgGroup=g.el.append("g")),g.svgGroup.attr("transform","translate("+a+","+s+")"),g.svgGroup.selectAll("g").data(t).enter().append("g").selectAll("rect").data(function(f,m){return f.map(function(x){return{r:m,v:x}})}).enter().append("rect").datum(function(f,m){return f.c=m,f}),g.svgGroup.selectAll("g").selectAll("rect").attr("x",function(f){return l/t[f.r].length*f.c}).attr("y",function(f){return f.r*c}).attr("width",function(f){return l/t[f.r].length}).attr("height",c).attr("fill",function(f){return u(f.v)}),d&&g.svgGroup.attr("id",d))},g.data=function(f){return arguments.length?(t=f,c=l/t.length,g.setProperties(),g):t},g.x=function(f){return arguments.length?(a=f,g.setProperties(),g):a},g.y=function(f){return arguments.length?(s=f,g.setProperties(),g):s},g.size=function(f){return arguments.length?(l=f,t&&(c=l/t.length,g.setProperties()),g):l},g.scale=function(f){return arguments.length?(u=f,t&&g.setProperties(),g):u},g.id=function(f){return arguments.length?(d=f,g.setProperties(),g):d},g}function ci(t,e,n,i,r,o){var a=ke(t,e,n,i,r,o);function s(l,u,d,c){var g=ut().domain([0,c]).range([-Math.PI/6,Math.PI/6]),f=ut().domain([0,d]).range([u,0]),m=Oe().innerRadius(f(l.r+1)).outerRadius(f(l.r)).startAngle(g(l.c)).endAngle(g(l.c+1));return m()}return a.setProperties=function(){var l=a.data(),u=a.size(),d=a.scale(),c=a.id(),g=a.x(),f=a.y();a.el&&(a.svgGroup||(a.svgGroup=a.el.append("g")),a.svgGroup.attr("transform","translate("+g+","+f+")"),a.svgGroup.selectAll("g").data(l).enter().append("g").selectAll("path").data(function(m,x){return m.map(function(p){return{r:x,v:p}})}).enter().append("path").datum(function(m,x){return m.c=x,m}),a.svgGroup.selectAll("g").selectAll("path").attr("transform","translate("+u/2+","+u+")").attr("d",function(m){return s(m,u,l.length,l[m.r].length)}).attr("fill",function(m){return d(m.v)}),c&&a.svgGroup.attr("id",c))},a}function ui(t,e,n,i,r,o,a){var s=null,l=r,u=t||null,d=e||200,c=n||30,g=i||null,f=o||0,m=a||0;function x(p){s=p,x.setProperties()}return x.setProperties=function(){if(s){var p=u.domain?u.domain():[0,1],h=d/u.range().length,y=(p[1]-p[0])/u.range().length,b=Z(p[0],p[1]+y,y),S=ft().range([0,d]).domain(b).round(!0);s.attr("class","legend").attr("transform","translate("+f+","+m+")");var _=s.selectAll("rect").data(u.range());_.enter().append("rect").merge(_).attr("x",function(z,M){return M*h}).attr("y",0).attr("height",c).attr("width",h).attr("fill",function(z){return z});var L=s.select("g.legend > g");L.empty()&&(L=s.append("g")),L.attr("transform","translate(0, "+c+")").call(Gn(S).tickFormat(Y(g||"")));var w=s.select("g.legend > text");w.empty()&&(w=s.append("text")),w.style("text-anchor","middle").style("font-size",13).attr("transform","translate("+d/2+", "+(c+30)+")").text(l)}},x.title=function(p){return arguments.length?(l=p,x.setProperties(),x):l},x.scale=function(p){return arguments.length?(u=p,x.setProperties(),x):u},x.size=function(p){return arguments.length?(d=p,x.setProperties(),x):d},x.height=function(p){return arguments.length?(c=p,x.setProperties(),x):c},x.format=function(p){return arguments.length?(g=p,x.setProperties(),x):g},x.x=function(p){return arguments.length?(f=p,x.setProperties(),x):f},x.y=function(p){return arguments.length?(m=p,x.setProperties(),x):m},x}function gi(t,e,n,i,r,o,a){var s=null,l=i||"Uncertainty",u=r||"Value",d=t||null,c=e||200,g=n||null,f=o||0,m=a||0,x=null,p=ke(),h=function(y){s=y,h.setProperties(),s.call(p)};return h.setProperties=function(){if(s){var y=x;y||(y=d.quantize().data());for(var b=[],S=0;S<y.length;S++)b[S]=y[y.length-S-1];p.y(1),p.data(b),p.scale(d),p.size(c),s.attr("class","legend").attr("transform","translate("+f+","+m+")");var _=d&&d.quantize?d.quantize().uncertaintyDomain():[0,1],L=(_[1]-_[0])/b.length,w=Z(_[0],_[1]+L,L),z=d&&d.quantize?d.quantize().valueDomain():[0,1],M=(z[1]-z[0])/b.length,T=Z(z[0],z[1]+M,M),C=ft().range([0,c]).domain(T);s.append("g").call(Nn(C).tickFormat(Y(g||""))),s.append("text").style("text-anchor","middle").style("font-size",13).attr("transform","translate("+c/2+", -25)").text(u);var v=ft().range([0,c]).domain(w);s.append("g").attr("transform","translate("+c+", 0)").call(ze(v).tickFormat(Y(g||""))),s.append("text").style("text-anchor","middle").style("font-size",13).attr("transform","translate("+(c+40)+", "+c/2+")rotate(90)").text(l)}},h.data=function(y){return arguments.length?(x=y,h.setProperties(),h):x},h.scale=function(y){return arguments.length?(d=y,h.setProperties(),h):d},h.size=function(y){return arguments.length?(c=y,h.setProperties(),h):c},h.format=function(y){return arguments.length?(g=y,h.setProperties(),h):g},h.x=function(y){return arguments.length?(f=y,h.setProperties(),h):f},h.y=function(y){return arguments.length?(m=y,h.setProperties(),h):m},h.utitle=function(y){return arguments.length?(l=y,h.setProperties(),h):l},h.vtitle=function(y){return arguments.length?(u=y,h.setProperties(),h):u},h}function di(t,e,n,i,r,o,a){var s=null,l=i||"Uncertainty",u=r||"Value",d=t||null,c=e||200,g=n||null,f=o||0,m=a||0,x=null,p=ci(),h=function(y){s=y,h.setProperties(),s.call(p)};return h.setProperties=function(){if(s){var y=x;y||(y=d.quantize().data());for(var b=[],S=0;S<y.length;S++)b[S]=y[y.length-S-1];p.data(b),p.scale(d),p.size(c),s.attr("class","legend").attr("transform","translate("+f+","+m+")");var _=d&&d.quantize?d.quantize().uncertaintyDomain():[0,1],L=(_[1]-_[0])/b.length,w=Z(_[0],_[1]+L,L),z=ft().range([0,c]).domain(w),M=c/180;s.append("g").attr("transform","translate("+(c+6*M)+","+28*M+")rotate(30)").call(ze(z).tickFormat(Y(g||""))),s.append("text").style("text-anchor","middle").style("font-size",13).attr("transform","translate("+(c+10*M)+","+(40*M+c/2)+")rotate(-60)").text(l);var T=d&&d.quantize?d.quantize().valueDomain():[0,1],C=(T[1]-T[0])/b[0].length,v=Z(T[0],T[1]+C,C),P=ut().range([0,c]).domain(T),I=g?Y(g):P.tickFormat(v.length),k=ut().domain(T).range([-30,30]),E=3*M,W=Oe().innerRadius(c+E).outerRadius(c+E+1).startAngle(-Math.PI/6).endAngle(Math.PI/6),B=s.append("g").attr("transform","translate("+c/2+","+(c-E)+")");B.append("path").attr("fill","black").attr("stroke","transparent").attr("d",W);var F=B.selectAll(".arc-label").data(v).enter().append("g").attr("class","arc-label").attr("transform",function(q){return"rotate("+k(q)+")translate(0,"+(-c-E)+")"});F.append("text").style("font-size","11").style("text-anchor","middle").attr("y",-10).text(I),F.append("line").attr("x1",.5).attr("x2",.5).attr("y1",-6).attr("y2",0).attr("stroke","#000"),s.append("text").style("text-anchor","middle").style("font-size",13).attr("x",c/2).attr("y",-30).text(u)}},h.data=function(y){return arguments.length?(x=y,h.setProperties(),h):x},h.scale=function(y){return arguments.length?(d=y,h.setProperties(),h):d},h.size=function(y){return arguments.length?(c=y,h.setProperties(),h):c},h.format=function(y){return arguments.length?(g=y,h.setProperties(),h):g},h.x=function(y){return arguments.length?(f=y,h.setProperties(),h):f},h.y=function(y){return arguments.length?(m=y,h.setProperties(),h):m},h.utitle=function(y){return arguments.length?(l=y,h.setProperties(),h):l},h.vtitle=function(y){return arguments.length?(u=y,h.setProperties(),h):u},h}const fi=Object.freeze(Object.defineProperty({__proto__:null,arcmapLegend:di,heatmapLegend:gi,simpleLegend:ui},Symbol.toStringTag,{value:"Module"}));var pi=fi;export{Ae as G,pi as l};
