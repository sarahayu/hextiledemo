import React from 'react';

import {
  colorInterpUnmetCont,
  getMIVal,
  heightInterpUnmet,
} from 'src/utils/scales';
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
      hoveredHex,
      hoveredGeoActive,
      hoveredGeos,
      selectedGeoJSON,
      selectedGeos,
      selectionFinalized,
    } = this.props;

    return [
      new GeoJsonLayer({
        id: 'GeoJsonExt',
        data: selectedGeoJSON,
        opacity: 0.75,
        extruded: true,
        getElevation: (d) =>
          heightInterpUnmet(
            curScenario > -1
              ? d.properties.UnmetDemand[SCENARIOS[curScenario]][speedyCounter]
              : d.properties.UnmetDemandBaseline[speedyCounter]
          ),
        pickable: true,
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

          if (d.properties.DU_ID == hoveredGeoActive) {
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
          getFillColor: [
            curScenario,
            speedyCounter,
            hoveredGeoActive,
            selectionFinalized,
          ],
        },
      }),
      new GeoJsonLayer({
        id: 'GeoJsonGray',
        data: temporalDataGeo,
        opacity: 0.3,
        stroked: false,
        getFillColor: (d) => {
          if (!selectionFinalized && d.properties.DU_ID in hoveredGeos) {
            return [100, 100, 100, 205 * hoveredGeos[d.properties.DU_ID] + 50];
          }
          return [0, 0, 0, 0];
        },
        visible: !selectionFinalized,
        updateTriggers: {
          getFillColor: [hoveredHex, selectionFinalized],
        },
      }),
      new GeoJsonLayer({
        id: 'GeoJsonColor',
        data: {
          type: 'FeatureCollection',
          features: temporalDataGeo.features.filter(
            (f) => f.properties.DU_ID in selectedGeos
          ),
        },
        opacity: 0.3,
        pickable: true,
        getLineWidth: (d) =>
          d.properties.DU_ID == hoveredGeoActive ? 100 : 20,
        getFillColor: (d) => {
          if (d.properties.DU_ID == hoveredGeoActive) {
            const hlcol = [0 / 255, 0 / 255, 128 / 255, 128 / 255];
            const fill = colorInterpUnmetCont(
              curScenario > -1
                ? selectedGeos[d.properties.DU_ID].UnmetDemand[
                    SCENARIOS[curScenario]
                  ][speedyCounter]
                : selectedGeos[d.properties.DU_ID].UnmetDemandBaseline[
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
          if (d.properties.DU_ID in selectedGeos) {
            return colorInterpUnmetCont(
              curScenario > -1
                ? selectedGeos[d.properties.DU_ID].UnmetDemand[
                    SCENARIOS[curScenario]
                  ][speedyCounter]
                : selectedGeos[d.properties.DU_ID].UnmetDemandBaseline[
                    speedyCounter
                  ]
            );
          }
          return [0, 0, 0, 0];
        },
        getLineColor: [0, 0, 0],
        updateTriggers: {
          getFillColor: [hoveredGeoActive, curScenario, selectionFinalized],
          getLineWidth: [hoveredGeoActive],
        },
      }),
      new SolidHexTileLayer({
        id: `HoveringTiles`,
        data: data,
        thicknessRange: [0, 1],
        getFillColor: [0, 0, 0, 0],
        ...(USE_TERRAIN_3D ? { extensions: [new TerrainExtension()] } : {}),
        pickable: !selectionFinalized,
        autoHighlight: !selectionFinalized,
      }),
      new SolidHexTileLayer({
        id: `Groundwater`,
        data,
        thicknessRange: [0, 1],
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
        id: `Difference`,
        data,
        thicknessRange: [0.5, 0.65],
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
        thicknessRange: [0.4, 0.65],
        getFillColor: (d) =>
          colorInterpUnmet(
            curScenario > -1
              ? d.properties.UnmetDemand[SCENARIOS[curScenario]][speedyCounter]
              : d.properties.UnmetDemandBaseline[speedyCounter]
          ),
        getValue: (d) =>
          getMIVal(
            curScenario > -1
              ? 1
              : d.properties.MUnmetDemandBaseline[speedyCounter]
          ),
        visible: displayUnmet && displayDemAsRings,
        opacity: 1.0,
        ...(USE_TERRAIN_3D ? { extensions: [new TerrainExtension()] } : {}),
        updateTriggers: {
          getFillColor: [curScenario, speedyCounter],
          getValue: [curScenario, speedyCounter],
        },
      }),
      new SolidHexTileLayer({
        id: `DemandRings`,
        data,
        thicknessRange: [0.5, 0.65],
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
        id: `ScenarioUnmet`,
        data,
        loaders: [OBJLoader],
        mesh: 'assets/drop.obj',
        raised: true,
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
        id: `ScenarioDemand`,
        data,
        loaders: [OBJLoader],
        mesh: 'assets/drop.obj',
        raised: true,
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
        id: `SettlementIcons`,
        data: this.state.data0,
        loaders: [OBJLoader],
        mesh: 'assets/dam.obj',
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
        id: `ExhangeIcons`,
        data: this.state.data1,
        loaders: [OBJLoader],
        mesh: 'assets/cow.obj',
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
        id: `ProjectIcons`,
        data: this.state.data2,
        loaders: [OBJLoader],
        mesh: 'assets/project.obj',
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
        id: `NonProjectIcons`,
        data: this.state.data3,
        loaders: [OBJLoader],
        mesh: 'assets/nonproject.obj',

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
};
