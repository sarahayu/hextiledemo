import{S as y}from"./SolidHexTileLayer-72de8124.js";import{C as c}from"./settings-3f87ae0a.js";import{G as g}from"./index-230f96f1.js";class u extends c{renderLayers(){const{data:h,deagData:a,curOption:p,hoveredHex:f,visible:s,clickedHexes:G,hoveredGeoActive:o,hoveredGeos:n,selectedGeoJSON:L,selectedGeos:t,selectionFinalized:i,zoomRange:C,getFillColor:d}=this.props;return[new g({id:"GeoJsonGray",data:a,opacity:.3,stroked:!1,getFillColor:r=>!i&&r.properties.id in n?[100,100,100,205*n[r.properties.id]+50]:[0,0,0,0],visible:s&&!i,updateTriggers:{getFillColor:[f,i]},pickable:!1}),new g({id:"GeoJsonColor",data:a,opacity:1,pickable:i,visible:s,getLineWidth:r=>r.properties.id in t?r.properties.id==o?100:20:0,getFillColor:r=>{if(r.properties.id in t){if(r.properties.id==o){const e=[0,0,.5019607843137255,.5019607843137255],l=[...d({properties:t[r.properties.id]}),255];return[(e[0]*e[3]+l[0]/255*(1-e[3]))*255,(e[1]*e[3]+l[1]/255*(1-e[3]))*255,(e[2]*e[3]+l[2]/255*(1-e[3]))*255,(e[3]*e[3]+l[3]/255*(1-e[3]))*255]}return[...d({properties:t[r.properties.id]}),255]}return[0,0,0,0]},getLineColor:[0,0,0],updateTriggers:{getFillColor:[...this.props.updateTriggers.getFillColor||[],o,p,i],getLineWidth:[o,p,i]}}),new y({id:"HoveringTiles",data:h,thicknessRange:[0,1],getFillColor:[0,0,0,0],pickable:!i,autoHighlight:!i,visible:s,zoomRange:C})]}}u.layerName="DeaggregatedLayer";u.defaultProps={...c.defaultProps,autoHighlight:!0};export{u as D};