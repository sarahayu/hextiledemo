import{_ as y,r as ht,t as ut,u as z,v as dt,x as pt,y as ft,z as mt,A as gt,B as vt,T as yt,D as xt,G as D,E as St,F as It,H as U,J as bt,C as F,p as R,q as M,K as w,N as Lt,O as B}from"./settings-cc329b7d.js";import{e as V,o as k,c as q,a as A,U as b,P as $,b as Ot}from"./overlay-a69705c9.js";class j{static get componentName(){return Object.prototype.hasOwnProperty.call(this,"extensionName")?this.extensionName:""}constructor(t){y(this,"opts",void 0),t&&(this.opts=t)}equals(t){return this===t?!0:this.constructor===t.constructor&&ht(this.opts,t.opts,1)}getShaders(t){return null}getSubLayerProps(t){const{defaultProps:s}=t.constructor,n={updateTriggers:{}};for(const i in s)if(i in this.props){const o=s[i],a=this.props[i];n[i]=a,o&&o.type==="accessor"&&(n.updateTriggers[i]=this.props.updateTriggers[i],typeof a=="function"&&(n[i]=this.getSubLayerAccessor(a)))}return n}initializeState(t,s){}updateState(t,s){}onNeedsRedraw(t){}getNeedsPickingBuffer(t){return!1}draw(t,s){}finalizeState(t,s){}}y(j,"defaultProps",{});y(j,"extensionName","LayerExtension");const C=Math.PI/180,E=new Float32Array(16),G=new Float32Array(12);function H(e,t,s){const n=t[0]*C,i=t[1]*C,o=t[2]*C,a=Math.sin(o),l=Math.sin(n),c=Math.sin(i),d=Math.cos(o),p=Math.cos(n),h=Math.cos(i),r=s[0],f=s[1],u=s[2];e[0]=r*h*p,e[1]=r*c*p,e[2]=r*-l,e[3]=f*(-c*d+h*l*a),e[4]=f*(h*d+c*l*a),e[5]=f*p*a,e[6]=u*(c*a+h*l*d),e[7]=u*(-h*a+c*l*d),e[8]=u*p*d}function J(e){return e[0]=e[0],e[1]=e[1],e[2]=e[2],e[3]=e[4],e[4]=e[5],e[5]=e[6],e[6]=e[8],e[7]=e[9],e[8]=e[10],e[9]=e[12],e[10]=e[13],e[11]=e[14],e.subarray(0,12)}const Pt={size:12,accessor:["getOrientation","getScale","getTranslation","getTransformMatrix"],shaderAttributes:{instanceModelMatrix__LOCATION_0:{size:3,elementOffset:0},instanceModelMatrix__LOCATION_1:{size:3,elementOffset:3},instanceModelMatrix__LOCATION_2:{size:3,elementOffset:6},instanceTranslation:{size:3,elementOffset:9}},update(e,{startRow:t,endRow:s}){const{data:n,getOrientation:i,getScale:o,getTranslation:a,getTransformMatrix:l}=this.props,c=Array.isArray(l),d=c&&l.length===16,p=Array.isArray(o),h=Array.isArray(i),r=Array.isArray(a),f=d||!c&&!!l(n[0]);f?e.constant=d:e.constant=h&&p&&r;const u=e.value;if(e.constant){let m;f?(E.set(l),m=J(E)):(m=G,H(m,i,o),m.set(a,9)),e.value=new Float32Array(m)}else{let m=t*e.size;const{iterable:x,objectInfo:S}=ut(n,t,s);for(const I of x){S.index++;let g;if(f)E.set(d?l:l(I,S)),g=J(E);else{g=G;const lt=h?i:i(I,S),ct=p?o:o(I,S);H(g,lt,ct),g.set(r?a:a(I,S),9)}u[m++]=g[0],u[m++]=g[1],u[m++]=g[2],u[m++]=g[3],u[m++]=g[4],u[m++]=g[5],u[m++]=g[6],u[m++]=g[7],u[m++]=g[8],u[m++]=g[9],u[m++]=g[10],u[m++]=g[11]}}}};function Mt(e,t){return t===z.CARTESIAN||t===z.METER_OFFSETS||t===z.DEFAULT&&!e.isGeospatial}const At=`#version 300 es
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
`,Et=`#version 300 es
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
`;function Q(e){let t=1/0,s=1/0,n=1/0,i=-1/0,o=-1/0,a=-1/0;const l=e.POSITION?e.POSITION.value:[],c=l&&l.length;for(let d=0;d<c;d+=3){const p=l[d],h=l[d+1],r=l[d+2];t=p<t?p:t,s=h<s?h:s,n=r<n?r:n,i=p>i?p:i,o=h>o?h:o,a=r>a?r:a}return[[t,s,n],[i,o,a]]}function wt(e,t){if(!e)throw new Error(t||"loader assertion failed.")}class L{constructor(t,s){y(this,"fields",void 0),y(this,"metadata",void 0),wt(Array.isArray(t)),Ft(t),this.fields=t,this.metadata=s||new Map}compareTo(t){if(this.metadata!==t.metadata||this.fields.length!==t.fields.length)return!1;for(let s=0;s<this.fields.length;++s)if(!this.fields[s].compareTo(t.fields[s]))return!1;return!0}select(){const t=Object.create(null);for(var s=arguments.length,n=new Array(s),i=0;i<s;i++)n[i]=arguments[i];for(const a of n)t[a]=!0;const o=this.fields.filter(a=>t[a.name]);return new L(o,this.metadata)}selectAt(){for(var t=arguments.length,s=new Array(t),n=0;n<t;n++)s[n]=arguments[n];const i=s.map(o=>this.fields[o]).filter(Boolean);return new L(i,this.metadata)}assign(t){let s,n=this.metadata;if(t instanceof L){const a=t;s=a.fields,n=W(W(new Map,this.metadata),a.metadata)}else s=t;const i=Object.create(null);for(const a of this.fields)i[a.name]=a;for(const a of s)i[a.name]=a;const o=Object.values(i);return new L(o,n)}}function Ft(e){const t={};for(const s of e)t[s.name]&&console.warn("Schema: duplicated field name",s.name,s),t[s.name]=!0}function W(e,t){return new Map([...e||new Map,...t||new Map])}class P{constructor(t,s){let n=arguments.length>2&&arguments[2]!==void 0?arguments[2]:!1,i=arguments.length>3&&arguments[3]!==void 0?arguments[3]:new Map;y(this,"name",void 0),y(this,"type",void 0),y(this,"nullable",void 0),y(this,"metadata",void 0),this.name=t,this.type=s,this.nullable=n,this.metadata=i}get typeId(){return this.type&&this.type.typeId}clone(){return new P(this.name,this.type,this.nullable,this.metadata)}compareTo(t){return this.name===t.name&&this.type===t.type&&this.nullable===t.nullable&&this.metadata===t.metadata}toString(){return"".concat(this.type).concat(this.nullable?", nullable":"").concat(this.metadata?", metadata: ".concat(this.metadata):"")}}let v=function(e){return e[e.NONE=0]="NONE",e[e.Null=1]="Null",e[e.Int=2]="Int",e[e.Float=3]="Float",e[e.Binary=4]="Binary",e[e.Utf8=5]="Utf8",e[e.Bool=6]="Bool",e[e.Decimal=7]="Decimal",e[e.Date=8]="Date",e[e.Time=9]="Time",e[e.Timestamp=10]="Timestamp",e[e.Interval=11]="Interval",e[e.List=12]="List",e[e.Struct=13]="Struct",e[e.Union=14]="Union",e[e.FixedSizeBinary=15]="FixedSizeBinary",e[e.FixedSizeList=16]="FixedSizeList",e[e.Map=17]="Map",e[e.Dictionary=-1]="Dictionary",e[e.Int8=-2]="Int8",e[e.Int16=-3]="Int16",e[e.Int32=-4]="Int32",e[e.Int64=-5]="Int64",e[e.Uint8=-6]="Uint8",e[e.Uint16=-7]="Uint16",e[e.Uint32=-8]="Uint32",e[e.Uint64=-9]="Uint64",e[e.Float16=-10]="Float16",e[e.Float32=-11]="Float32",e[e.Float64=-12]="Float64",e[e.DateDay=-13]="DateDay",e[e.DateMillisecond=-14]="DateMillisecond",e[e.TimestampSecond=-15]="TimestampSecond",e[e.TimestampMillisecond=-16]="TimestampMillisecond",e[e.TimestampMicrosecond=-17]="TimestampMicrosecond",e[e.TimestampNanosecond=-18]="TimestampNanosecond",e[e.TimeSecond=-19]="TimeSecond",e[e.TimeMillisecond=-20]="TimeMillisecond",e[e.TimeMicrosecond=-21]="TimeMicrosecond",e[e.TimeNanosecond=-22]="TimeNanosecond",e[e.DenseUnion=-23]="DenseUnion",e[e.SparseUnion=-24]="SparseUnion",e[e.IntervalDayTime=-25]="IntervalDayTime",e[e.IntervalYearMonth=-26]="IntervalYearMonth",e}({}),tt,et,st;class N{static isNull(t){return t&&t.typeId===v.Null}static isInt(t){return t&&t.typeId===v.Int}static isFloat(t){return t&&t.typeId===v.Float}static isBinary(t){return t&&t.typeId===v.Binary}static isUtf8(t){return t&&t.typeId===v.Utf8}static isBool(t){return t&&t.typeId===v.Bool}static isDecimal(t){return t&&t.typeId===v.Decimal}static isDate(t){return t&&t.typeId===v.Date}static isTime(t){return t&&t.typeId===v.Time}static isTimestamp(t){return t&&t.typeId===v.Timestamp}static isInterval(t){return t&&t.typeId===v.Interval}static isList(t){return t&&t.typeId===v.List}static isStruct(t){return t&&t.typeId===v.Struct}static isUnion(t){return t&&t.typeId===v.Union}static isFixedSizeBinary(t){return t&&t.typeId===v.FixedSizeBinary}static isFixedSizeList(t){return t&&t.typeId===v.FixedSizeList}static isMap(t){return t&&t.typeId===v.Map}static isDictionary(t){return t&&t.typeId===v.Dictionary}get typeId(){return v.NONE}compareTo(t){return this===t}}tt=Symbol.toStringTag;class O extends N{constructor(t,s){super(),y(this,"isSigned",void 0),y(this,"bitWidth",void 0),this.isSigned=t,this.bitWidth=s}get typeId(){return v.Int}get[tt](){return"Int"}toString(){return"".concat(this.isSigned?"I":"Ui","nt").concat(this.bitWidth)}}class _t extends O{constructor(){super(!0,8)}}class zt extends O{constructor(){super(!0,16)}}class Dt extends O{constructor(){super(!0,32)}}class Ct extends O{constructor(){super(!1,8)}}class Rt extends O{constructor(){super(!1,16)}}class jt extends O{constructor(){super(!1,32)}}const nt={HALF:16,SINGLE:32,DOUBLE:64};et=Symbol.toStringTag;class it extends N{constructor(t){super(),y(this,"precision",void 0),this.precision=t}get typeId(){return v.Float}get[et](){return"Float"}toString(){return"Float".concat(this.precision)}}class Nt extends it{constructor(){super(nt.SINGLE)}}class Tt extends it{constructor(){super(nt.DOUBLE)}}st=Symbol.toStringTag;class Ut extends N{constructor(t,s){super(),y(this,"listSize",void 0),y(this,"children",void 0),this.listSize=t,this.children=[s]}get typeId(){return v.FixedSizeList}get valueType(){return this.children[0].type}get valueField(){return this.children[0]}get[st](){return"FixedSizeList"}toString(){return"FixedSizeList[".concat(this.listSize,"]<").concat(this.valueType,">")}}function Bt(e){switch(e.constructor){case Int8Array:return new _t;case Uint8Array:return new Ct;case Int16Array:return new zt;case Uint16Array:return new Rt;case Int32Array:return new Dt;case Uint32Array:return new jt;case Float32Array:return new Nt;case Float64Array:return new Tt;default:throw new Error("array type not supported")}}function K(e,t){(e.COLOR_0||e.colors)&&t||(e.colors={constant:!0,value:new Float32Array([1,1,1])}),St.assert(e.positions||e.POSITION,'no "postions" or "POSITION" attribute in mesh')}function X(e,t){if(e.attributes)return K(e.attributes,t),e instanceof D?e:new D(e);if(e.positions||e.POSITION)return K(e,t),new D({attributes:e});throw Error("Invalid mesh")}const Vt=[0,0,0,255],kt={mesh:{type:"object",value:null,async:!0},texture:{type:"image",value:null,async:!0},sizeScale:{type:"number",value:1,min:0},_useMeshColors:{type:"boolean",value:!1},_instanced:!0,wireframe:!1,material:!0,getPosition:{type:"accessor",value:e=>e.position},getColor:{type:"accessor",value:Vt},getOrientation:{type:"accessor",value:[0,0,0]},getScale:{type:"accessor",value:[1,1,1]},getTranslation:{type:"accessor",value:[0,0,0]},getTransformMatrix:{type:"accessor",value:[]},textureParameters:{type:"object",ignore:!0}};class _ extends dt{constructor(...t){super(...t),y(this,"state",void 0)}getShaders(){const t=!pt(this.context.gl),s={};return ft(this.context.gl,It.GLSL_DERIVATIVES)&&(s.DERIVATIVES_AVAILABLE=1),super.getShaders({vs:At,fs:Et,modules:[mt,gt,vt],transpileToGLSL100:t,defines:s})}getBounds(){var t;if(this.props._instanced)return super.getBounds();let s=this.state.positionBounds;if(s)return s;const{mesh:n}=this.props;if(!n)return null;if(s=(t=n.header)===null||t===void 0?void 0:t.boundingBox,!s){const{attributes:i}=X(n,this.props._useMeshColors);i.POSITION=i.POSITION||i.positions,s=Q(i)}return this.state.positionBounds=s,s}initializeState(){this.getAttributeManager().addInstanced({instancePositions:{transition:!0,type:5130,fp64:this.use64bitPositions(),size:3,accessor:"getPosition"},instanceColors:{type:5121,transition:!0,size:this.props.colorFormat.length,normalized:!0,accessor:"getColor",defaultValue:[0,0,0,255]},instanceModelMatrix:Pt}),this.setState({emptyTexture:new yt(this.context.gl,{data:new Uint8Array(4),width:1,height:1})})}updateState(t){super.updateState(t);const{props:s,oldProps:n,changeFlags:i}=t;if(s.mesh!==n.mesh||i.extensionsChanged){var o;if(this.state.positionBounds=null,(o=this.state.model)===null||o===void 0||o.delete(),s.mesh){this.state.model=this.getModel(s.mesh);const a=s.mesh.attributes||s.mesh;this.setState({hasNormals:!!(a.NORMAL||a.normals)})}this.getAttributeManager().invalidateAll()}s.texture!==n.texture&&this.setTexture(s.texture),this.state.model&&this.state.model.setDrawMode(this.props.wireframe?3:4)}finalizeState(t){super.finalizeState(t),this.state.emptyTexture.delete()}draw({uniforms:t}){if(!this.state.model)return;const{viewport:s}=this.context,{sizeScale:n,coordinateSystem:i,_instanced:o}=this.props;this.state.model.setUniforms(t).setUniforms({sizeScale:n,composeModelMatrix:!o||Mt(s,i),flatShading:!this.state.hasNormals}).draw()}getModel(t){const s=new xt(this.context.gl,{...this.getShaders(),id:this.props.id,geometry:X(t,this.props._useMeshColors),isInstanced:!0}),{texture:n}=this.props,{emptyTexture:i}=this.state;return s.setUniforms({sampler:n||i,hasTexture:!!n}),s}setTexture(t){const{emptyTexture:s,model:n}=this.state;n&&n.setUniforms({sampler:t||s,hasTexture:!!t})}}y(_,"defaultProps",kt);y(_,"layerName","SimpleMeshLayer");const Gt={inject:{"vs:#decl":`
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
`}},Ht={inject:{"vs:#decl":`
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
`}},Jt={getDashArray:{type:"accessor",value:[0,0]},getOffset:{type:"accessor",value:0},dashJustified:!1,dashGapPickable:!1};class ot extends j{constructor({dash:t=!1,offset:s=!1,highPrecisionDash:n=!1}={}){super({dash:t||n,offset:s,highPrecisionDash:n})}isEnabled(t){return"pathTesselator"in t.state}getShaders(t){if(!t.isEnabled(this))return null;let s={};return t.opts.dash&&(s=U(s,Gt)),t.opts.offset&&(s=U(s,Ht)),s}initializeState(t,s){const n=this.getAttributeManager();!n||!s.isEnabled(this)||(s.opts.dash&&n.addInstanced({instanceDashArrays:{size:2,accessor:"getDashArray"}}),s.opts.highPrecisionDash&&n.addInstanced({instanceDashOffsets:{size:1,accessor:"getPath",transform:s.getDashOffsets.bind(this)}}),s.opts.offset&&n.addInstanced({instanceOffsets:{size:1,accessor:"getOffset"}}))}updateState(t,s){if(!s.isEnabled(this))return;const n={};s.opts.dash&&(n.dashAlignMode=this.props.dashJustified?1:0,n.dashGapPickable=!!this.props.dashGapPickable),this.state.model.setUniforms(n)}getDashOffsets(t){const s=[0],n=this.props.positionFormat==="XY"?2:3,i=Array.isArray(t[0]),o=i?t.length:t.length/n;let a,l;for(let c=0;c<o-1;c++)a=i?t[c]:t.slice(c*n,c*n+n),a=this.projectPosition(a),c>0&&(s[c]=s[c-1]+bt(l,a)),l=a;return s}}y(ot,"defaultProps",Jt);y(ot,"extensionName","PathStyleExtension");const Wt=/^[og]\s*(.+)?/,Kt=/^mtllib /,Xt=/^usemtl /;class T{constructor(t){let{index:s,name:n="",mtllib:i,smooth:o,groupStart:a}=t;this.index=s,this.name=n,this.mtllib=i,this.smooth=o,this.groupStart=a,this.groupEnd=-1,this.groupCount=-1,this.inherited=!1}clone(){let t=arguments.length>0&&arguments[0]!==void 0?arguments[0]:this.index;return new T({index:t,name:this.name,mtllib:this.mtllib,smooth:this.smooth,groupStart:0})}}class Yt{constructor(){let t=arguments.length>0&&arguments[0]!==void 0?arguments[0]:"";this.name=t,this.geometry={vertices:[],normals:[],colors:[],uvs:[]},this.materials=[],this.smooth=!0,this.fromDeclaration=null}startMaterial(t,s){const n=this._finalize(!1);n&&(n.inherited||n.groupCount<=0)&&this.materials.splice(n.index,1);const i=new T({index:this.materials.length,name:t,mtllib:Array.isArray(s)&&s.length>0?s[s.length-1]:"",smooth:n!==void 0?n.smooth:this.smooth,groupStart:n!==void 0?n.groupEnd:0});return this.materials.push(i),i}currentMaterial(){if(this.materials.length>0)return this.materials[this.materials.length-1]}_finalize(t){const s=this.currentMaterial();if(s&&s.groupEnd===-1&&(s.groupEnd=this.geometry.vertices.length/3,s.groupCount=s.groupEnd-s.groupStart,s.inherited=!1),t&&this.materials.length>1)for(let n=this.materials.length-1;n>=0;n--)this.materials[n].groupCount<=0&&this.materials.splice(n,1);return t&&this.materials.length===0&&this.materials.push({name:"",smooth:this.smooth}),s}}class Zt{constructor(){this.objects=[],this.object=null,this.vertices=[],this.normals=[],this.colors=[],this.uvs=[],this.materialLibraries=[],this.startObject("",!1)}startObject(t){let s=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!0;if(this.object&&!this.object.fromDeclaration){this.object.name=t,this.object.fromDeclaration=s;return}const n=this.object&&typeof this.object.currentMaterial=="function"?this.object.currentMaterial():void 0;if(this.object&&typeof this.object._finalize=="function"&&this.object._finalize(!0),this.object=new Yt(t),this.object.fromDeclaration=s,n&&n.name&&typeof n.clone=="function"){const i=n.clone(0);i.inherited=!0,this.object.materials.push(i)}this.objects.push(this.object)}finalize(){this.object&&typeof this.object._finalize=="function"&&this.object._finalize(!0)}parseVertexIndex(t,s){const n=parseInt(t);return(n>=0?n-1:n+s/3)*3}parseNormalIndex(t,s){const n=parseInt(t);return(n>=0?n-1:n+s/3)*3}parseUVIndex(t,s){const n=parseInt(t);return(n>=0?n-1:n+s/2)*2}addVertex(t,s,n){const i=this.vertices,o=this.object.geometry.vertices;o.push(i[t+0],i[t+1],i[t+2]),o.push(i[s+0],i[s+1],i[s+2]),o.push(i[n+0],i[n+1],i[n+2])}addVertexPoint(t){const s=this.vertices;this.object.geometry.vertices.push(s[t+0],s[t+1],s[t+2])}addVertexLine(t){const s=this.vertices;this.object.geometry.vertices.push(s[t+0],s[t+1],s[t+2])}addNormal(t,s,n){const i=this.normals,o=this.object.geometry.normals;o.push(i[t+0],i[t+1],i[t+2]),o.push(i[s+0],i[s+1],i[s+2]),o.push(i[n+0],i[n+1],i[n+2])}addColor(t,s,n){const i=this.colors,o=this.object.geometry.colors;o.push(i[t+0],i[t+1],i[t+2]),o.push(i[s+0],i[s+1],i[s+2]),o.push(i[n+0],i[n+1],i[n+2])}addUV(t,s,n){const i=this.uvs,o=this.object.geometry.uvs;o.push(i[t+0],i[t+1]),o.push(i[s+0],i[s+1]),o.push(i[n+0],i[n+1])}addUVLine(t){const s=this.uvs;this.object.geometry.uvs.push(s[t+0],s[t+1])}addFace(t,s,n,i,o,a,l,c,d){const p=this.vertices.length;let h=this.parseVertexIndex(t,p),r=this.parseVertexIndex(s,p),f=this.parseVertexIndex(n,p);if(this.addVertex(h,r,f),i!==void 0&&i!==""){const u=this.uvs.length;h=this.parseUVIndex(i,u),r=this.parseUVIndex(o,u),f=this.parseUVIndex(a,u),this.addUV(h,r,f)}if(l!==void 0&&l!==""){const u=this.normals.length;h=this.parseNormalIndex(l,u),r=l===c?h:this.parseNormalIndex(c,u),f=l===d?h:this.parseNormalIndex(d,u),this.addNormal(h,r,f)}this.colors.length>0&&this.addColor(h,r,f)}addPointGeometry(t){this.object.geometry.type="Points";const s=this.vertices.length;for(const n of t)this.addVertexPoint(this.parseVertexIndex(n,s))}addLineGeometry(t,s){this.object.geometry.type="Line";const n=this.vertices.length,i=this.uvs.length;for(const o of t)this.addVertexLine(this.parseVertexIndex(o,n));for(const o of s)this.addUVLine(this.parseUVIndex(o,i))}}function qt(e){const t=new Zt;e.indexOf(`\r
`)!==-1&&(e=e.replace(/\r\n/g,`
`)),e.indexOf(`\\
`)!==-1&&(e=e.replace(/\\\n/g,""));const s=e.split(`
`);let n="",i="",o=0,a=[];const l=typeof"".trimLeft=="function";for(let p=0,h=s.length;p<h;p++)if(n=s[p],n=l?n.trimLeft():n.trim(),o=n.length,o!==0&&(i=n.charAt(0),i!=="#"))if(i==="v"){const r=n.split(/\s+/);switch(r[0]){case"v":t.vertices.push(parseFloat(r[1]),parseFloat(r[2]),parseFloat(r[3])),r.length>=7&&t.colors.push(parseFloat(r[4]),parseFloat(r[5]),parseFloat(r[6]));break;case"vn":t.normals.push(parseFloat(r[1]),parseFloat(r[2]),parseFloat(r[3]));break;case"vt":t.uvs.push(parseFloat(r[1]),parseFloat(r[2]));break}}else if(i==="f"){const f=n.substr(1).trim().split(/\s+/),u=[];for(let x=0,S=f.length;x<S;x++){const I=f[x];if(I.length>0){const g=I.split("/");u.push(g)}}const m=u[0];for(let x=1,S=u.length-1;x<S;x++){const I=u[x],g=u[x+1];t.addFace(m[0],I[0],g[0],m[1],I[1],g[1],m[2],I[2],g[2])}}else if(i==="l"){const r=n.substring(1).trim().split(" ");let f;const u=[];if(n.indexOf("/")===-1)f=r;else{f=[];for(let m=0,x=r.length;m<x;m++){const S=r[m].split("/");S[0]!==""&&f.push(S[0]),S[1]!==""&&u.push(S[1])}}t.addLineGeometry(f,u)}else if(i==="p"){const f=n.substr(1).trim().split(" ");t.addPointGeometry(f)}else if((a=Wt.exec(n))!==null){const r=(" "+a[0].substr(1).trim()).substr(1);t.startObject(r)}else if(Xt.test(n))t.object.startMaterial(n.substring(7).trim(),t.materialLibraries);else if(Kt.test(n))t.materialLibraries.push(n.substring(7).trim());else if(i==="s"){if(a=n.split(" "),a.length>1){const f=a[1].trim().toLowerCase();t.object.smooth=f!=="0"&&f!=="off"}else t.object.smooth=!0;const r=t.object.currentMaterial();r&&(r.smooth=t.object.smooth)}else{if(n==="\0")continue;throw new Error('Unexpected line: "'.concat(n,'"'))}t.finalize();const c=[],d=[];for(const p of t.objects){const{geometry:h}=p;if(h.vertices.length===0)continue;const r={header:{vertexCount:h.vertices.length/3},attributes:{}};switch(h.type){case"Points":r.mode=0;break;case"Line":r.mode=1;break;default:r.mode=4;break}r.attributes.POSITION={value:new Float32Array(h.vertices),size:3},h.normals.length>0&&(r.attributes.NORMAL={value:new Float32Array(h.normals),size:3}),h.colors.length>0&&(r.attributes.COLOR_0={value:new Float32Array(h.colors),size:3}),h.uvs.length>0&&(r.attributes.TEXCOORD_0={value:new Float32Array(h.uvs),size:2}),r.materials=[];for(const f of p.materials){const u={name:f.name,flatShading:!f.smooth};r.materials.push(u),d.push(u)}r.name=p.name,c.push(r)}return{meshes:c,materials:d}}function $t(e){let t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},s;for(const i in t)s=s||new Map,i!=="value"&&s.set(i,JSON.stringify(t[i]));const n=[];for(const i in e){const o=e[i],a=Qt(i,o);n.push(a)}return new L(n,s)}function Qt(e,t){const s=new Map;for(const o in t)o!=="value"&&s.set(o,JSON.stringify(t[o]));const n=Bt(t.value);return!("size"in t)||t.size===1?new P(e,n,!1,s):new P(e,new Ut(t.size,new P("value",n)),!1,s)}function Y(e,t){const{meshes:s}=qt(e),n=s.reduce((l,c)=>l+c.header.vertexCount,0),i=te(s,n),o={vertexCount:n,boundingBox:Q(i)},a=$t(i,{mode:4,boundingBox:o.boundingBox});return{loaderData:{header:{}},schema:a,header:o,mode:4,attributes:i}}function te(e,t){const s=new Float32Array(t*3);let n,i,o,a=0;for(const c of e){const{POSITION:d,NORMAL:p,COLOR_0:h,TEXCOORD_0:r}=c.attributes;s.set(d.value,a*3),p&&(n=n||new Float32Array(t*3),n.set(p.value,a*3)),h&&(i=i||new Float32Array(t*3),i.set(h.value,a*3)),r&&(o=o||new Float32Array(t*2),o.set(r.value,a*2)),a+=d.value.length/3}const l={};return l.POSITION={value:s,size:3},n&&(l.NORMAL={value:n,size:3}),i&&(l.COLOR_0={value:i,size:3}),o&&(l.TEXCOORD_0={value:o,size:2}),l}const ee="3.4.14",se={name:"OBJ",id:"obj",module:"obj",version:ee,worker:!0,extensions:["obj"],mimeTypes:["text/plain"],testText:ne,options:{obj:{}}};function ne(e){return e[0]==="v"}const ce={...se,parse:async(e,t)=>Y(new TextDecoder().decode(e)),parseTextSync:(e,t)=>Y(e)},ie=M().domain([0,1]).range(Lt(0,w.length)),oe=w[0];class at extends F{initializeState(){super.initializeState();const{zoom:t}=this.context.viewport,s=Object.keys(this.props.data).map(o=>parseInt(o)),n=R().domain(this.props.zoomRange).range([0,1]).clamp(!0),i=M().domain([0,1]).range(s)(n(t));this.setState({hextiles:this.props.data,resRange:s,lastResolution:i,valueInterpResolution:n}),this.createPolygons()}createPolygons(){const{hextiles:t,lastResolution:s}=this.state,n=[],i=t[s],[o,a]=this.props.offset;Object.keys(i).forEach(l=>{const c=i[l],d=V(k(l)[0],b.km)*.48,[p,h]=q(l);let r=0;const f=A(s,b.km)/A(5,b.km);for(let[u,m,x]of this.props.getValue?oe:[[0,0,0]])n.push({position:[h+(u+o)*d/(111.32*Math.cos(p*Math.PI/180)),p+(m+a)*d/110.574,(typeof this.props.getElevation=="function"?this.props.getElevation({properties:c}):this.props.getElevation)+x*1e5*f],properties:c,polyIdx:r++,hexID:l})}),this.setState({...this.state,polygons:n})}shouldUpdateState({changeFlags:t}){return t.somethingChanged}updateState(t){const{resRange:s,lastResolution:n,valueInterpResolution:i}=this.state,{props:o,oldProps:a,changeFlags:l,context:c}=t;if(o.getElevation!=a.getElevation||l.viewportChanged){const d=M().domain([0,1]).range(s)(i(c.viewport.zoom));(d!=n||o.getElevation!=a.getElevation)&&(this.setState({...this.state,lastResolution:d}),this.createPolygons())}}renderLayers(){const{polygons:t,lastResolution:s,resRange:n}=this.state,i=A(s,b.km)/A(5,b.km);return[new _(this.getSubLayerProps({data:this.props.data,mesh:this.props.mesh,texture:this.props.texture,textureParameters:this.props.textureParameters,getPosition:this.props.getPosition,getColor:this.props.getColor,getOrientation:this.props.getOrientation,getScale:this.props.getScale,getTranslation:this.props.getTranslation,getTransformMatrix:this.props.getTransformMatrix,sizeScale:this.props.sizeScale,_useMeshColors:this.props._useMeshColors,_instanced:this.props._instanced,wireframe:this.props.wireframe,material:this.props.material,transitions:this.props.transitions,updateTriggers:this.props.updateTriggers,id:"IconHexTileLayer",data:t,getPosition:o=>o.position,sizeScale:this.props.sizeScale*i,getTranslation:this.props.getValue===null?[0,0,0]:o=>{const a=w[ie(this.props.getValue(o))][o.polyIdx],l=w[0][o.polyIdx],c=V(k(o.hexID)[0],b.m)*.5;return[(a[0]-l[0])*c,(a[1]-l[1])*c,(a[2]-l[2])*1e5*i]}}))]}}at.layerName="IconHexTileLayer";at.defaultProps={...F.defaultProps,..._.defaultProps,thicknessRange:[.7,.9],getValue:null,getElevation:()=>0,offset:[0,0],zoomRange:[7,9]};function Z(e,t,s=1){const n=s,[i,o]=q(e);return t.map(l=>{let c=B(o,l[0],n),d=B(i,l[1],n);return[c,d]})}function ae(e,[t,s]){let n=Ot(e).map(a=>[a[1],a[0]]),i=Z(e,n,s),o=Z(e,n,t);return[i,o]}class rt extends F{initializeState(){super.initializeState();const t=Object.keys(this.props.data).map(i=>parseInt(i)),s=R().domain(this.props.zoomRange).range([0,1]).clamp(!0),n=M().domain([0,1]).range(t)(s(this.context.viewport.zoom));this.setState({...this.state,resRange:t,lastResolution:n,valueInterpResolution:s}),this.createPolygons()}createPolygons(){const{lastResolution:t}=this.state,s=[],n=this.props.data[t];Object.keys(n).forEach((i,o)=>{let a=n[i];const l=this.props.getValue?R().domain([0,1]).range([this.props.thicknessRange[1],this.props.thicknessRange[0]])(this.props.getValue({properties:a})):this.props.thicknessRange[0];let c=ae(i,[l,this.props.thicknessRange[1]]);this.props.raised?s.push({polygon:c.map(d=>d.map(([p,h])=>[p,h,typeof this.props.getElevation=="function"?this.props.getElevation({hexId:i,properties:a}):this.props.getElevation])),hexId:i,properties:a}):s.push({hexId:i,polygon:c,properties:a})}),this.setState({...this.state,polygons:s})}shouldUpdateState({changeFlags:t}){return t.somethingChanged}updateState(t){const{resRange:s,lastResolution:n,valueInterpResolution:i}=this.state,{props:o,oldProps:a,changeFlags:l,context:c}=t;if(o.getElevation!=a.getElevation||o.getValue!=a.getValue||l.viewportChanged){const d=M().domain([0,1]).range(s)(i(c.viewport.zoom));(d!=n||o.getValue!=a.getValue||o.getElevation!=a.getElevation)&&(this.setState({...this.state,lastResolution:d}),this.createPolygons())}}renderLayers(){return[new $(this.getSubLayerProps({data:this.props.data,filled:this.props.filled,stroked:this.props.stroked,extruded:this.props.extruded,wireframe:this.props.wireframe,lineWidthUnits:this.props.lineWidthUnits,_normalize:this.props._normalize,_windingOrder:this.props._windingOrder,_full3d:this.props._full3d,elevationScale:this.props.elevationScale,getPolygon:this.props.getPolygon,getElevation:this.props.getElevation,getFillColor:this.props.getFillColor,getLineColor:this.props.getLineColor,getLineWidth:this.props.getLineWidth,material:this.props.material,transitions:this.props.transitions,updateTriggers:this.props.updateTriggers,onClick:this.props.onClick,id:"SolidHexTileLayer",data:this.state.polygons,getPolygon:t=>t.polygon,pickable:this.props.pickable,autoHighlight:this.props.autoHighlight,extensions:this.props.extensions,getOffset:this.props.getOffset,lineJointRounded:this.props.lineJointRounded}))]}}rt.layerName="SolidHexTileLayer";rt.defaultProps={...F.defaultProps,...$.defaultProps,thicknessRange:[.7,.9],getValue:void 0,raised:!1,zoomRange:[7,9]};export{at as I,ce as O,ot as P,rt as S};
