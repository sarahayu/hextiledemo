// import { CompositeLayer, SolidPolygonLayer, PolygonLayer } from 'deck.gl';
// import * as d3 from 'd3';
// import * as h3 from 'h3-js';
// import { lerp } from '@math.gl/core';
// import { resScale } from 'src/utils/scales';

// function scaleBounds(hexId, paths, value = 1) {
//   // if(!outside) return

//   // get center and distance to lerp from
//   const dist = value;
//   const [centerLat, centerLng] = h3.cellToLatLng(hexId);

//   // lerp each vertex
//   let scaledPaths = paths.map((v) => {
//     let v1Lng = lerp(centerLng, v[0], dist);
//     let v1Lat = lerp(centerLat, v[1], dist);

//     return [v1Lng, v1Lat];
//   });

//   return scaledPaths;
// }

// function calcPolyBorder(hexId, [thicknessMin, thicknessMax]) {
//   // calc hexagonal tile outline boundary
//   let bounds = h3.cellToBoundary(hexId).map((p) => [p[1], p[0]]);

//   // scale bounds and create polygons
//   let scaledBoundsOuter = scaleBounds(hexId, bounds, thicknessMax);
//   let scaledBoundsInner = scaleBounds(hexId, bounds, thicknessMin);
//   // let borderPolygons = createBorderPolygons(scaledBoundsOuter, scaledBoundsInner)

//   return [scaledBoundsOuter, scaledBoundsInner];
// }

// export default class DeaggregatedHexTileLayer extends CompositeLayer {
//   initializeState() {
//     super.initializeState();

//     const resRange = Object.keys(this.props.data).map((d) => parseInt(d));
//     const lastResolution = d3.scaleQuantize().domain([0, 1]).range(resRange)(
//       resScale(this.context.viewport.zoom)
//     );

//     this.setState({
//       ...this.state,
//       resRange,
//       lastResolution,
//     });

//     this.createPolygons();
//   }

//   createPolygons() {
//     const { lastResolution } = this.state;

//     const polygons = [];

//     const resHex = this.props.data[lastResolution];

//     Object.keys(resHex).forEach((hexId, i) => {
//       let properts = resHex[hexId];

//       const inner = this.props.getValue
//         ? d3
//             .scaleLinear()
//             .domain([0, 1])
//             .range([
//               this.props.thicknessRange[1],
//               this.props.thicknessRange[0],
//             ])(this.props.getValue({ properties: properts }))
//         : this.props.thicknessRange[0];

//       let tilePolygon = calcPolyBorder(hexId, [
//         inner,
//         this.props.thicknessRange[1],
//       ]);

//       if (this.props.raised)
//         polygons.push({
//           polygon: tilePolygon.map((hexPoints) =>
//             hexPoints.map(([x, y]) => [
//               x,
//               y,
//               typeof this.props.getElevation === 'function'
//                 ? this.props.getElevation({
//                     hexId: hexId,
//                     properties: properts,
//                   })
//                 : this.props.getElevation,
//             ])
//           ),
//           hexId: hexId,
//           properties: properts,
//         });
//       else
//         polygons.push({
//           hexId: hexId,
//           polygon: tilePolygon,
//           properties: properts,
//         });
//     });

//     this.setState({
//       ...this.state,
//       polygons,
//     });
//   }

//   shouldUpdateState({ changeFlags }) {
//     return changeFlags.somethingChanged;
//   }

//   updateState(params) {
//     const { resRange, lastResolution } = this.state;
//     const { props, oldProps, changeFlags, context } = params;

//     if (
//       props.getElevation != oldProps.getElevation ||
//       props.getValue != oldProps.getValue ||
//       changeFlags.viewportChanged
//     ) {
//       const curRes = d3.scaleQuantize().domain([0, 1]).range(resRange)(
//         resScale(context.viewport.zoom)
//       );

//       if (
//         curRes != lastResolution ||
//         props.getValue != oldProps.getValue ||
//         props.getElevation != oldProps.getElevation
//       ) {
//         this.setState({
//           ...this.state,
//           lastResolution: curRes,
//         });
//         this.createPolygons();
//       }
//     }
//   }

//   renderLayers() {
//     return [
//       new GeoJsonLayer(
//         this.getSubLayerProps({
//           id: 'ExtrudedIntersection',
//           data: selectedGeoJSON,
//           opacity: 0.75,
//           extruded: true,
//           getElevation: this.props.getElevation,
//           pickable: true,
//           getLineWidth: 100,
//           getFillColor: (d) => {
//             let fill = this.props.getFillColor(d);

//             if (fill[3] == 0) {
//               fill = [255, 255, 255, 255];
//             }

//             if (d.properties.DU_ID == hoveredGeoActive) {
//               const hlcol = [0 / 255, 0 / 255, 128 / 255, 128 / 255];
//               return [
//                 (hlcol[0] * hlcol[3] + (fill[0] / 255) * (1 - hlcol[3])) * 255,
//                 (hlcol[1] * hlcol[3] + (fill[1] / 255) * (1 - hlcol[3])) * 255,
//                 (hlcol[2] * hlcol[3] + (fill[2] / 255) * (1 - hlcol[3])) * 255,
//                 (hlcol[3] * hlcol[3] + (fill[3] / 255) * (1 - hlcol[3])) * 255,
//               ];
//             }

//             return fill;
//           },
//           updateTriggers: {
//             getFillColor: [
//               curScenario,
//               speedyCounter,
//               hoveredGeoActive,
//               selectionFinalized,
//             ],
//             getElevation: [curScenario, speedyCounter],
//           },
//         })
//       ),
//       new GeoJsonLayer(
//         this.getSubLayerProps({
//           id: 'GeoJSONGray',
//           data: temporalDataGeo,
//           opacity: 0.3,
//           stroked: false,
//           getFillColor: (d) => {
//             if (!selectionFinalized && d.properties.DU_ID in hoveredGeos) {
//               return [
//                 100,
//                 100,
//                 100,
//                 205 * hoveredGeos[d.properties.DU_ID] + 50,
//               ];
//             }
//             return [0, 0, 0, 0];
//           },
//           visible: !selectionFinalized,
//           updateTriggers: {
//             getFillColor: [hoveredHex, selectionFinalized],
//           },
//         })
//       ),
//       new GeoJsonLayer(
//         this.getSubLayerProps({
//           id: 'GeoJSONColor',
//           data: {
//             type: 'FeatureCollection',
//             features: temporalDataGeo.features.filter(
//               (f) => f.properties.DU_ID in selectedGeos
//             ),
//           },
//           opacity: 0.3,
//           pickable: true,
//           getLineWidth: (d) =>
//             d.properties.DU_ID == hoveredGeoActive ? 100 : 20,
//           getFillColor: (d) => {
//             if (d.properties.DU_ID == hoveredGeoActive) {
//               const hlcol = [0 / 255, 0 / 255, 128 / 255, 128 / 255];
//               const fill = this.props.getFillColor(d);
//               return [
//                 (hlcol[0] * hlcol[3] + (fill[0] / 255) * (1 - hlcol[3])) * 255,
//                 (hlcol[1] * hlcol[3] + (fill[1] / 255) * (1 - hlcol[3])) * 255,
//                 (hlcol[2] * hlcol[3] + (fill[2] / 255) * (1 - hlcol[3])) * 255,
//                 (hlcol[3] * hlcol[3] + (fill[3] / 255) * (1 - hlcol[3])) * 255,
//               ];
//             }
//             if (d.properties.DU_ID in selectedGeos) {
//               return this.props.getFillColor(d);
//             }
//             return [0, 0, 0, 0];
//           },
//           getLineColor: [0, 0, 0],
//           updateTriggers: {
//             getFillColor: [hoveredGeoActive, curScenario, selectionFinalized],
//             getLineWidth: [hoveredGeoActive],
//           },
//         })
//       ),
//     ];
//   }
// }

// DeaggregatedHexTileLayer.layerName = 'DeaggregatedHexTileLayer';
// DeaggregatedHexTileLayer.defaultProps = {
//   ...CompositeLayer.defaultProps,
//   ...PolygonLayer.defaultProps,
//   thicknessRange: [0.7, 0.9],
//   getValue: undefined,
//   raised: false,
// };
