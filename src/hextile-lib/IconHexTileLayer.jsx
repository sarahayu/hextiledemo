import * as d3 from 'd3';
import { CompositeLayer, SimpleMeshLayer } from 'deck.gl';
import * as h3 from 'h3-js';
import { FORMATIONS, kmToLonLat } from 'src/utils/utils';

const formationInterp = d3
  .scaleQuantize()
  .domain([0, 1])
  .range(d3.range(0, FORMATIONS.length));

const START_FORM = FORMATIONS[0];

export default class IconHexTileLayer extends CompositeLayer {
  initializeState() {
    super.initializeState();

    const { zoom } = this.context.viewport;

    const resRange = Object.keys(this.props.data).map((d) => parseInt(d));
    const valueInterpResolution = d3
      .scaleLinear()
      .domain(this.props.zoomRange)
      .range([0, 1])
      .clamp(true);
    const curRes = d3.scaleQuantize().domain([0, 1]).range(resRange)(
      valueInterpResolution(zoom)
    );

    this.setState({
      hextiles: this.props.data,
      resRange,
      lastResolution: curRes,
      valueInterpResolution,
    });

    this.createPolygons();
  }

  createPolygons() {
    // console.log('updating IconHexTile polygons');
    const { hextiles, lastResolution } = this.state;

    const data = [];

    const resHex = hextiles[lastResolution];
    const [ddx, ddy] = this.props.offset;

    Object.keys(resHex).forEach((hexID) => {
      const properties = resHex[hexID];

      const edgeLen =
        h3.edgeLength(h3.originToDirectedEdges(hexID)[0], h3.UNITS.km) * 0.48;
      const [lat, lon] = h3.cellToLatLng(hexID);

      let polyIdx = 0;
      const iconScale =
        h3.getHexagonEdgeLengthAvg(lastResolution, h3.UNITS.km) /
        h3.getHexagonEdgeLengthAvg(5, h3.UNITS.km);

      for (let [dx, dy, dz] of this.props.getValue ? START_FORM : [[0, 0, 0]]) {
        const [offsetXLon, offsetYLat] = kmToLonLat(
          [(dx + ddx) * edgeLen, (dy + ddy) * edgeLen],
          lon,
          lat
        );
        data.push({
          position: [
            lon + offsetXLon,
            lat + offsetYLat,
            (typeof this.props.getElevation === 'function'
              ? this.props.getElevation({ properties })
              : this.props.getElevation) +
              dz * 100000 * iconScale,
          ],
          properties,
          polyIdx: polyIdx++,
          hexID,
        });
      }
    });

    this.setState({
      ...this.state,
      polygons: data,
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
      changeFlags.viewportChanged
    ) {
      const curRes = d3.scaleQuantize().domain([0, 1]).range(resRange)(
        valueInterpResolution(context.viewport.zoom)
      );

      if (
        curRes != lastResolution ||
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
    const { polygons, lastResolution, resRange } = this.state;

    const iconScale =
      h3.getHexagonEdgeLengthAvg(lastResolution, h3.UNITS.km) /
      h3.getHexagonEdgeLengthAvg(5, h3.UNITS.km);

    return [
      new SimpleMeshLayer(
        this.getSubLayerProps({
          ...{
            data: this.props.data,
            mesh: this.props.mesh,
            texture: this.props.texture,
            textureParameters: this.props.textureParameters,
            getPosition: this.props.getPosition,
            getColor: this.props.getColor,
            getOrientation: this.props.getOrientation,
            getScale: this.props.getScale,
            getTranslation: this.props.getTranslation,
            getTransformMatrix: this.props.getTransformMatrix,
            sizeScale: this.props.sizeScale,
            _useMeshColors: this.props._useMeshColors,
            _instanced: this.props._instanced,
            wireframe: this.props.wireframe,
            material: this.props.material,
            transitions: this.props.transitions,
            updateTriggers: this.props.updateTriggers,
          },

          id: `IconHexTileLayer`,
          data: polygons,
          getPosition: (d) => d.position,
          sizeScale: this.props.sizeScale * iconScale,
          // TODO: optimize this by only updating getTranslation fn on getValue change (similarly, cache getValue fn higher up)
          getTranslation:
            this.props.getValue === null
              ? [0, 0, 0]
              : (d) => {
                  const curForm =
                    FORMATIONS[formationInterp(this.props.getValue(d))][
                      d.polyIdx
                    ];
                  const baseForm = FORMATIONS[0][d.polyIdx];
                  const edgeLen =
                    h3.edgeLength(
                      h3.originToDirectedEdges(d.hexID)[0],
                      h3.UNITS.m
                    ) * 0.5;

                  return [
                    (curForm[0] - baseForm[0]) * edgeLen,
                    (curForm[1] - baseForm[1]) * edgeLen,
                    (curForm[2] - baseForm[2]) * 100000 * iconScale,
                  ];
                },
        })
      ),
    ];
  }
}

IconHexTileLayer.layerName = 'IconHexTileLayer';
IconHexTileLayer.defaultProps = {
  ...CompositeLayer.defaultProps,
  ...SimpleMeshLayer.defaultProps,
  thicknessRange: [0.7, 0.9],
  getValue: null,
  getElevation: () => 0,
  offset: [0, 0],
  zoomRange: [7, 9],
};
