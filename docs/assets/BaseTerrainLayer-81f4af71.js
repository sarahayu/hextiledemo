import{C as r}from"./settings-3f87ae0a.js";import{T as n,B as l}from"./tile-layer-0fe13059.js";class a extends r{renderLayers(){return[new n({data:"https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}",minZoom:7,maxZoom:11,tileSize:256,renderSubLayers:e=>{const{bbox:{west:t,south:s,east:o,north:i}}=e.tile;return new l(e,{data:null,image:e.data,bounds:[t,s,o,i]})}})]}}a.layerName="BaseTerrainLayer";a.defaultProps={...r.defaultProps};export{a as B};