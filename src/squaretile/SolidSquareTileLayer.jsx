import { CompositeLayer, SolidPolygonLayer, PolygonLayer } from 'deck.gl';
import * as d3 from 'd3';
import * as h3 from 'h3-js';
import { lerp } from '@math.gl/core';

function h3_to_geo_center(h3str) {
  const [strLat, strLon, res] = h3str.split('/');
  const sideDeg = resToDegSide(res);
  return [parseFloat(strLat) + sideDeg / 2, parseFloat(strLon) + sideDeg / 2];
}

function scaleBounds(hexId, paths, value = 1, offset) {
  // if(!outside) return

  // get center and distance to lerp from
  const dist = value;
  const [centerLat, centerLng] = h3_to_geo_center(hexId);
  const res = h3_to_res(hexId);
  const sideDeg = (resToDegSide(res) / 4) * dist;

  // lerp each vertex
  let scaledPaths = paths.map((v) => {
    let v1Lng = lerp(centerLng, v[0], dist);
    let v1Lat = lerp(centerLat, v[1], dist);

    return [v1Lng + sideDeg * offset[0], v1Lat + sideDeg * offset[1]];
  });

  return scaledPaths;
}

function h3_to_res(h3str) {
  const [lat, lon, res] = h3str.split('/');
  return parseInt(res);
}

function cellToBoundary(hexId) {
  const [lat, lon] = h3_to_geo_center(hexId);
  const res = h3_to_res(hexId);
  const sideDeg = resToDegSide(res) / 4;
  return [
    [lat + sideDeg, lon - sideDeg],
    [lat + sideDeg, lon + sideDeg],
    [lat - sideDeg, lon + sideDeg],
    [lat - sideDeg, lon - sideDeg],
  ];
}

function kmToLatDeg(dist) {
  return dist / 111.1;
}

function hexSideToSquareSide(res) {
  return h3.getHexagonEdgeLengthAvg(parseInt(res), h3.UNITS.km) * 2;
}

function resToDegSide(res) {
  return kmToLatDeg(hexSideToSquareSide(res));
}

function calcPolyBorder(hexId, [thicknessMin, thicknessMax], offset) {
  // calc hexagonal tile outline boundary
  let bounds = cellToBoundary(hexId).map((p) => [p[1], p[0]]);

  // scale bounds and create polygons
  // let scaledBoundsOuter = scaleBounds(hexId, bounds, thicknessMax);
  let scaledBoundsInner = scaleBounds(hexId, bounds, 1 - thicknessMin, offset);

  return [scaledBoundsInner];
}

export default class SolidSquareTileLayer extends CompositeLayer {
  initializeState() {
    super.initializeState();

    const resRange = Object.keys(this.props.data).map((d) => parseInt(d));
    const valueInterpResolution = d3
      .scaleLinear()
      .domain(this.props.zoomRange)
      .range([0, 1])
      .clamp(true);
    const lastResolution = d3.scaleQuantize().domain([0, 1]).range(resRange)(
      valueInterpResolution(this.context.viewport.zoom)
    );

    this.setState({
      ...this.state,
      resRange,
      lastResolution,
      valueInterpResolution,
    });

    this.createPolygons();
  }

  createPolygons() {
    // console.log('updating SolidHexTile polygons');
    const { lastResolution } = this.state;

    const polygons = [];

    const resHex = this.props.data[lastResolution];

    Object.keys(resHex).forEach((hexId, i) => {
      let properts = resHex[hexId];

      const inner = this.props.getValue
        ? d3
            .scaleLinear()
            .domain([0, 1])
            .range([
              this.props.thicknessRange[1],
              this.props.thicknessRange[0],
            ])(this.props.getValue({ properties: properts }))
        : this.props.thicknessRange[0];

      let tilePolygon = calcPolyBorder(
        hexId,
        [inner, this.props.thicknessRange[1]],
        this.props.offset
      );

      if (this.props.raised)
        polygons.push({
          polygon: tilePolygon.map((hexPoints) =>
            hexPoints.map(([x, y]) => [
              x,
              y,
              typeof this.props.getElevation === 'function'
                ? this.props.getElevation({
                    hexId: hexId,
                    properties: properts,
                  })
                : this.props.getElevation,
            ])
          ),
          hexId: hexId,
          properties: properts,
        });
      else
        polygons.push({
          hexId: hexId,
          polygon: tilePolygon,
          properties: properts,
        });
    });

    this.setState({
      ...this.state,
      polygons,
    });
  }

  shouldUpdateState({ changeFlags }) {
    return changeFlags.somethingChanged;
  }

  updateState(params) {
    const { resRange, lastResolution, valueInterpResolution } = this.state;
    const { props, oldProps, changeFlags, context } = params;

    if (
      props.getElevation != oldProps.getElevation ||
      props.getValue != oldProps.getValue ||
      changeFlags.viewportChanged
    ) {
      const curRes = d3.scaleQuantize().domain([0, 1]).range(resRange)(
        valueInterpResolution(context.viewport.zoom)
      );

      if (
        curRes != lastResolution ||
        props.getValue != oldProps.getValue ||
        props.getElevation != oldProps.getElevation
      ) {
        this.setState({
          ...this.state,
          lastResolution: curRes,
        });
        this.createPolygons();
      }
    }
  }

  renderLayers() {
    return [
      new PolygonLayer(
        this.getSubLayerProps({
          ...{
            data: this.props.data,
            filled: this.props.filled,
            stroked: this.props.stroked,
            lineWidthUnits: this.props.lineWidthUnits,
            extruded: this.props.extruded,
            wireframe: this.props.wireframe,
            _normalize: this.props._normalize,
            _windingOrder: this.props._windingOrder,
            _full3d: this.props._full3d,
            elevationScale: this.props.elevationScale,
            getPolygon: this.props.getPolygon,
            getElevation: this.props.getElevation,
            getFillColor: this.props.getFillColor,
            getLineColor: this.props.getLineColor,
            getLineWidth: this.props.getLineWidth,
            material: this.props.material,
            transitions: this.props.transitions,
            updateTriggers: this.props.updateTriggers,
            onClick: this.props.onClick,
          },
          id: `SolidSquareTileLayer`,
          data: this.state.polygons,
          getPolygon: (d) => d.polygon,
          pickable: this.props.pickable,
          autoHighlight: this.props.autoHighlight,
          extensions: this.props.extensions,
          getOffset: this.props.getOffset,
          lineJointRounded: this.props.lineJointRounded,
        })
      ),
    ];
  }
}

SolidSquareTileLayer.layerName = 'SolidSquareTileLayer';
SolidSquareTileLayer.defaultProps = {
  ...CompositeLayer.defaultProps,
  ...PolygonLayer.defaultProps,
  thicknessRange: [0, 1],
  getValue: undefined,
  raised: false,
  zoomRange: [7, 9],
  offset: [0, 0],
};
