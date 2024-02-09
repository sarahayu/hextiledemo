import React from 'react';

import { colorInterpUnmetCont, heightInterpUnmet } from 'src/utils/scales';
import { SCENARIOS } from 'src/utils/settings';

import { _TerrainExtension as TerrainExtension } from '@deck.gl/extensions';
import { OBJLoader } from '@loaders.gl/obj';
import { CompositeLayer, GeoJsonLayer } from 'deck.gl';
import IconHexTileLayer from 'src/hextile/IconHexTileLayer';
import SolidHexTileLayer from 'src/hextile/SolidHexTileLayer';
import {
  colorInterpDemand,
  colorInterpDifference,
  colorInterpGW,
  colorInterpUnmet,
  valueInterpDemand,
  valueInterpUnmet,
} from 'src/utils/scales';
import { USE_TERRAIN_3D } from 'src/utils/settings';
import { dataFilter } from 'src/utils/utils';

import { temporalDataGeo } from 'src/utils/data';

export default class SandboxSlide extends CompositeLayer {
  initializeState() {
    super.initializeState();
    this.setState({
      data0: dataFilter(this.props.data, (d) => d.LandUse[0] == 0),
      data1: dataFilter(this.props.data, (d) => d.LandUse[0] == 1),
      data2: dataFilter(this.props.data, (d) => d.LandUse[0] == 2),
      data3: dataFilter(this.props.data, (d) => d.LandUse[0] == 3),
    });
  }
  renderLayers() {
    const {
      data,
      curScenario,
      speedyCounter,
      displayGW,
      displayDiff,
      displayUnmet,
      displayDemand,
      displayLandUse,
      displayDemAsRings,
      hovHovHexArr,
      setHovHovHexArr,
      hovHex,
      setHovHex,
      curHex,
      setCurHex,
      clickHex,
      setClickHex,
      clickHex2,
      setClickHex2,
      hovHexArr,
      setHovHexArr,
      clickHexArr,
      setClickHexArr,
    } = this.props;

    return [
      new GeoJsonLayer({
        id: 'GeoJsonExt',
        data: clickHex,
        opacity: 0.75,
        filled: true,
        extruded: true,
        // wireframe: true,
        getElevation: (d) =>
          heightInterpUnmet(
            curScenario > -1
              ? d.properties.UnmetDemand[SCENARIOS[curScenario]][speedyCounter]
              : d.properties.UnmetDemandBaseline[speedyCounter]
          ),
        pickable: true,
        // autoHighlight: true,
        getLineWidth: 100,
        getFillColor: (d) => {
          let fill = colorInterpUnmetCont(
            curScenario > -1
              ? d.properties.UnmetDemand[SCENARIOS[curScenario]][speedyCounter]
              : d.properties.UnmetDemandBaseline[speedyCounter]
          );

          if (fill[3] == 0) {
            fill = [255, 255, 255, 255];
          }

          if (hovHovHexArr && hovHovHexArr.includes(d.properties.DU_ID)) {
            const hlcol = [0 / 255, 0 / 255, 128 / 255, 128 / 255];
            return [
              (hlcol[0] * hlcol[3] + (fill[0] / 255) * (1 - hlcol[3])) * 255,
              (hlcol[1] * hlcol[3] + (fill[1] / 255) * (1 - hlcol[3])) * 255,
              (hlcol[2] * hlcol[3] + (fill[2] / 255) * (1 - hlcol[3])) * 255,
              (hlcol[3] * hlcol[3] + (fill[3] / 255) * (1 - hlcol[3])) * 255,
            ];
          }

          return fill;
        },
        updateTriggers: {
          getFillColor: [curScenario, speedyCounter, hovHovHexArr, curScenario],
        },
      }),
      new GeoJsonLayer({
        id: 'GeoJsonGray',
        data: temporalDataGeo,
        opacity: 0.3,
        stroked: true,
        pickable: !curHex,
        // autoHighlight: !curHex,
        filled: true,
        extruded: false,
        // wireframe: true,
        // getElevation: (f) => Math.sqrt(f.properties.valuePerSqm) * 10,
        getLineWidth: 100,
        getFillColor: (d) => {
          if (!curHex && hovHexArr && hovHexArr.includes(d.properties.DU_ID)) {
            return [100, 100, 100, 205 * hovHex[d.properties.DU_ID] + 50];
          }
          return [0, 0, 0, 0];
          // const inter = intersect(h3ToFeature(hovHex), d.geometry);
          // if (!inter) return [100, 100, 100, 0];
          // const ar = area(intersect(h3ToFeature(hovHex), d.geometry)) / area(h3ToFeature(hovHex));
          // // console.log(ar);
          // return [50, 50, 50, 205 * ar + 50];
        },
        getLineColor: [255, 255, 255, 0],
        // pickable: true,
        updateTriggers: {
          getFillColor: [hovHexArr, clickHexArr, curHex],
        },
      }),
      new GeoJsonLayer({
        id: 'GeoJsonColor',
        data: {
          type: 'FeatureCollection',
          features: temporalDataGeo.features.filter(
            (f) => clickHexArr && clickHexArr.includes(f.properties.DU_ID)
          ),
        },
        opacity: 0.3,
        stroked: true,
        pickable: true,
        // autoHighlight: true,
        filled: true,
        extruded: false,
        // wireframe: true,
        // getElevation: (f) => Math.sqrt(f.properties.valuePerSqm) * 10,
        getLineWidth: (d) =>
          hovHovHexArr && hovHovHexArr.includes(d.properties.DU_ID) ? 100 : 20,
        getFillColor: (d) => {
          if (hovHovHexArr && hovHovHexArr.includes(d.properties.DU_ID)) {
            const hlcol = [0 / 255, 0 / 255, 128 / 255, 128 / 255];
            const fill = colorInterpUnmetCont(
              curScenario > -1
                ? clickHex2[d.properties.DU_ID].UnmetDemand[
                    SCENARIOS[curScenario]
                  ][speedyCounter]
                : clickHex2[d.properties.DU_ID].UnmetDemandBaseline[
                    speedyCounter
                  ]
            );
            return [
              (hlcol[0] * hlcol[3] + (fill[0] / 255) * (1 - hlcol[3])) * 255,
              (hlcol[1] * hlcol[3] + (fill[1] / 255) * (1 - hlcol[3])) * 255,
              (hlcol[2] * hlcol[3] + (fill[2] / 255) * (1 - hlcol[3])) * 255,
              (hlcol[3] * hlcol[3] + (fill[3] / 255) * (1 - hlcol[3])) * 255,
            ];
          }
          if (clickHexArr && clickHexArr.includes(d.properties.DU_ID)) {
            return colorInterpUnmetCont(
              curScenario > -1
                ? clickHex2[d.properties.DU_ID].UnmetDemand[
                    SCENARIOS[curScenario]
                  ][speedyCounter]
                : clickHex2[d.properties.DU_ID].UnmetDemandBaseline[
                    speedyCounter
                  ]
            );
          }
          return [0, 0, 0, 0];
          // const inter = intersect(h3ToFeature(hovHex), d.geometry);
          // if (!inter) return [100, 100, 100, 0];
          // const ar = area(intersect(h3ToFeature(hovHex), d.geometry)) / area(h3ToFeature(hovHex));
          // // console.log(ar);
          // return [50, 50, 50, 205 * ar + 50];
        },
        getLineColor: [0, 0, 0],
        // pickable: true,
        updateTriggers: {
          getFillColor: [hovHexArr, clickHexArr, hovHovHexArr, curScenario],
          getLineWidth: [hovHovHexArr],
        },
      }),
      new SolidHexTileLayer({
        id: `HoveringTilesEpilogue`,
        data: data,
        thicknessRange: [0, 1],
        filled: true,

        extruded: false,
        raised: false,
        getFillColor: [0, 0, 0, 0],
        ...(USE_TERRAIN_3D ? { extensions: [new TerrainExtension()] } : {}),
        pickable: !curHex,
        autoHighlight: !curHex,
        // onHover: ({ object }) => {
        //   if (!object) return setHovHex(null);
        //   console.log('in solid');
        //   return setHovHex(object.hexId);
        // },
      }),
      new SolidHexTileLayer({
        id: `GroundwaterEpilogue`,
        data,
        thicknessRange: [0, 1],
        filled: true,

        extruded: false,
        raised: false,
        getFillColor: (d) =>
          colorInterpGW(d.properties.Groundwater[speedyCounter]),
        visible: displayGW,
        opacity: 0.2,
        ...(USE_TERRAIN_3D ? { extensions: [new TerrainExtension()] } : {}),
        updateTriggers: {
          getFillColor: [speedyCounter],
        },
      }),
      new SolidHexTileLayer({
        id: `DifferenceEpilogue`,
        data,
        thicknessRange: [0.5, 0.65],
        filled: true,

        extruded: false,
        raised: false,
        getFillColor: (d) =>
          colorInterpDifference(
            curScenario < 0
              ? 0
              : d.properties.UnmetDemand[SCENARIOS[curScenario]][
                  speedyCounter
                ] - d.properties.UnmetDemandBaseline[speedyCounter]
          ),
        visible: displayDiff && curScenario > -1,
        opacity: 1.0,
        ...(USE_TERRAIN_3D ? { extensions: [new TerrainExtension()] } : {}),
        updateTriggers: {
          getFillColor: [curScenario, speedyCounter],
        },
      }),
      new SolidHexTileLayer({
        id: `UnmetRings`,
        data,
        thicknessRange: [0.5, 0.65],
        filled: true,

        extruded: false,
        raised: false,
        getFillColor: (d) =>
          colorInterpUnmet(
            curScenario > -1
              ? d.properties.UnmetDemand[SCENARIOS[curScenario]][speedyCounter]
              : d.properties.UnmetDemandBaseline[speedyCounter]
          ),
        visible: displayUnmet && displayDemAsRings,
        opacity: 1.0,
        ...(USE_TERRAIN_3D ? { extensions: [new TerrainExtension()] } : {}),
        updateTriggers: {
          getFillColor: [curScenario, speedyCounter],
        },
      }),
      new SolidHexTileLayer({
        id: `DemandRings`,
        data,
        thicknessRange: [0.5, 0.65],
        filled: true,

        extruded: false,
        raised: false,
        getFillColor: (d) =>
          colorInterpDemand(
            curScenario > -1
              ? d.properties.Demand[SCENARIOS[curScenario]][speedyCounter]
              : d.properties.DemandBaseline[speedyCounter]
          ),
        visible: displayDemand && displayDemAsRings,
        opacity: 1.0,
        ...(USE_TERRAIN_3D ? { extensions: [new TerrainExtension()] } : {}),
        updateTriggers: {
          getFillColor: [curScenario, speedyCounter],
        },
      }),
      new IconHexTileLayer({
        id: `ScenarioUnmetEpilogue`,
        data,
        loaders: [OBJLoader],
        mesh: 'assets/drop.obj',
        raised: true,
        extruded: false,

        getColor: [255, 130, 35],
        getValue: (d) =>
          valueInterpUnmet(
            curScenario > -1
              ? d.properties.UnmetDemand[SCENARIOS[curScenario]][speedyCounter]
              : d.properties.UnmetDemandBaseline[speedyCounter]
          ),
        sizeScale: 3000,
        visible: displayUnmet && !displayDemAsRings,
        opacity: 1,
        ...(USE_TERRAIN_3D
          ? {
              extensions: [
                new TerrainExtension({
                  terrainDrawMode: 'offset',
                }),
              ],
            }
          : {}),
        updateTriggers: {
          getTranslation: [curScenario, speedyCounter],
        },
      }),
      new IconHexTileLayer({
        id: `ScenarioDemandEpilogue`,
        data,
        loaders: [OBJLoader],
        mesh: 'assets/drop.obj',
        raised: true,
        extruded: false,

        getColor: [255, 130, 35],
        getValue: (d) =>
          valueInterpDemand(
            curScenario > -1
              ? d.properties.Demand[SCENARIOS[curScenario]][speedyCounter]
              : d.properties.DemandBaseline[speedyCounter]
          ),
        sizeScale: 3000,
        visible: displayDemand && !displayDemAsRings,
        opacity: 1,
        ...(USE_TERRAIN_3D
          ? {
              extensions: [
                new TerrainExtension({
                  terrainDrawMode: 'offset',
                }),
              ],
            }
          : {}),
        updateTriggers: {
          getTranslation: [curScenario, speedyCounter],
        },
      }),
      new IconHexTileLayer({
        id: `SettlementIconsEpilogue`,
        data: this.state.data0,
        loaders: [OBJLoader],
        mesh: 'assets/dam.obj',
        raised: false,

        getColor: [255, 127, 206],
        sizeScale: 0.8 * 500,
        visible: displayLandUse,
        opacity: 1,
        ...(USE_TERRAIN_3D
          ? {
              extensions: [
                new TerrainExtension({
                  terrainDrawMode: 'offset',
                }),
              ],
            }
          : {}),
        updateTriggers: {
          getTranslation: [speedyCounter],
        },
      }),
      new IconHexTileLayer({
        id: `ExhangeIconsEpilogue`,
        data: this.state.data1,
        loaders: [OBJLoader],
        mesh: 'assets/cow.obj',
        raised: false,

        getColor: [255, 127, 206],
        sizeScale: 0.8 * 550,
        visible: displayLandUse,
        opacity: 1,
        ...(USE_TERRAIN_3D
          ? {
              extensions: [
                new TerrainExtension({
                  terrainDrawMode: 'offset',
                }),
              ],
            }
          : {}),
        updateTriggers: {
          getTranslation: [speedyCounter],
        },
      }),
      new IconHexTileLayer({
        id: `ProjectIconsEpilogue`,
        data: this.state.data2,
        loaders: [OBJLoader],
        mesh: 'assets/project.obj',
        raised: false,

        getColor: [255, 127, 206],
        sizeScale: 0.8 * 180,
        visible: displayLandUse,
        opacity: 1,
        ...(USE_TERRAIN_3D
          ? {
              extensions: [
                new TerrainExtension({
                  terrainDrawMode: 'offset',
                }),
              ],
            }
          : {}),
        updateTriggers: {
          getTranslation: [speedyCounter],
        },
      }),
      new IconHexTileLayer({
        id: `NonProjectIconsEpilogue`,
        data: this.state.data3,
        loaders: [OBJLoader],
        mesh: 'assets/nonproject.obj',
        raised: false,

        getColor: [255, 127, 206],
        sizeScale: 0.8 * 140,
        visible: displayLandUse,
        opacity: 1,
        ...(USE_TERRAIN_3D
          ? {
              extensions: [
                new TerrainExtension({
                  terrainDrawMode: 'offset',
                }),
              ],
            }
          : {}),
        updateTriggers: {
          getTranslation: [speedyCounter],
        },
      }),
    ];
  }
}

SandboxSlide.layerName = 'SandboxSlide';
SandboxSlide.defaultProps = {
  ...CompositeLayer.defaultProps,
  // autoHighlight: true,
};
