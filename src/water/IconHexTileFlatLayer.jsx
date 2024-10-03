import * as d3 from 'd3';
import { CompositeLayer, IconLayer } from 'deck.gl';
import * as h3 from 'h3-js';
import { FORMATIONS, kmToLonLat } from 'src/utils/utils';

const formationInterp = d3
  .scaleQuantize()
  .domain([0, 1])
  .range(d3.range(0, FORMATIONS.length));

const START_FORM = FORMATIONS[0];

export default class IconHexTileFlatLayer extends CompositeLayer {
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
      new IconLayer(
        this.getSubLayerProps({
          iconAtlas: this.props.hexIconAtlas,
          iconMapping: this.props.hexIconMapping,
          sizeScale: this.props.sizeScale,
          billboard: this.props.billboard,
          sizeUnits: this.props.sizeUnits,
          sizeMinPixels: this.props.sizeMinPixels,
          sizeMaxPixels: this.props.sizeMaxPixels,
          alphaCutoff: this.props.alphaCutoff,
          getPosition: this.props.getPosition,
          getIcon: this.props.getHexIcon,
          getColor: this.props.getColor,
          getSize: this.props.getSize,
          getAngle: this.props.getAngle,
          getPixelOffset: this.props.getPixelOffset,
          onIconError: this.props.onIconError,
          textureParameters: this.props.textureParameters,
          updateTriggers: this.props.updateTriggers,

          id: `IconHexTileFlatLayer`,
          data: polygons,
          getPosition: (d) => {
            if (this.props.getValue === null) return [0, 0, 0];

            const curForm =
              FORMATIONS[formationInterp(this.props.getValue(d))][d.polyIdx];
            const baseForm = FORMATIONS[0][d.polyIdx];
            const edgeLen =
              h3.edgeLength(h3.originToDirectedEdges(d.hexID)[0], h3.UNITS.km) *
              0.5;

            const pngCorrectionY = -edgeLen / 3;

            const transX = (curForm[0] - baseForm[0]) * edgeLen;
            const transY =
              (curForm[1] - baseForm[1]) * edgeLen + pngCorrectionY;
            const transZ = (curForm[2] - baseForm[2]) * 100000 * iconScale;

            const [transLon, transLat] = kmToLonLat(
              [transX, transY],
              d.position[0],
              d.position[1]
            );

            return [
              d.position[0] + transLon,
              d.position[1] + transLat,
              d.position[2] + transZ,
            ];
          },
          sizeScale: this.props.sizeScale * iconScale,
        })
      ),
    ];
  }
}

IconHexTileFlatLayer.layerName = 'IconHexTileFlatLayer';
IconHexTileFlatLayer.defaultProps = {
  ...CompositeLayer.defaultProps,
  ...IconLayer.defaultProps,
  thicknessRange: [0.7, 0.9],
  getValue: null,
  getElevation: () => 0,
  offset: [0, 0],
  zoomRange: [7, 9],
};
