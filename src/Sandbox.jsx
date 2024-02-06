import React from 'react';

import { useCallback } from 'react';
import {
  colorInterpUnmetCont,
  dateInterpIdx,
  heightInterpUnmet,
} from 'src/utils/scales';
import { HOLDERS, SCENARIO_LABELS, SCENARIOS } from 'src/utils/settings';

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

import { useState } from 'react';

import { temporalDataGeo, temporalDataHex } from 'src/utils/data';

import WaterDeckGL from 'src/WaterDeckGL';

import useCamera from 'src/hooks/useCamera';
import useCounters from 'src/hooks/useCounters';

import { BitmapLayer, TerrainLayer, TileLayer } from 'deck.gl';

import Clock from 'src/Clock';

import booleanIntersects from '@turf/boolean-intersects';
import intersect from '@turf/intersect';
import area from '@turf/area';

import { h3ToFeature } from 'geojson2h3';

export default function Sandbox() {
  const [curScenario, setCurScenario] = useState(0);
  const [curHex, setCurHex] = useState(null);
  const [hovHex, setHovHex] = useState(null);
  const [clickHex, setClickHex] = useState({
    type: 'FeatureCollection',
    features: [],
  });
  const [clickHex2, setClickHex2] = useState({});

  const [hovHexArr, setHovHexArr] = useState(null);
  const [clickHexArr, setClickHexArr] = useState(null);

  const [hovHovHexArr, setHovHovHexArr] = useState([]);

  const curState = {
    data: temporalDataHex,
    curScenario,
    setCurScenario,
    curHex,
    setCurHex,
    hovHovHexArr,
    setHovHovHexArr,
    hovHex,
    setHovHex,
    clickHex,
    setClickHex,
    clickHex2,
    setClickHex2,
    hovHexArr,
    setHovHexArr,
    clickHexArr,
    setClickHexArr,
  };

  const sandboxGUI = useGUI();
  const counters = useCounters(curState);
  const { curViewState, transitioning } = useCamera(curState);
  const { getTooltip } = useHexTooltip({
    ...curState,
    ...counters,
  });

  const params = {
    ...curState,
    ...counters,
    transitioning,
  };

  const layers = [
    new SlideTerrain(params),
    new SandboxSlide({
      ...params,
      ...sandboxGUI,
      autoHighlight: true,
      onHover: ({ object }) => {
        if (!object)
          return setHovHexArr(null) || setHovHex({}) || setHovHovHexArr([]);
        if (curHex) {
          setHovHexArr(null);
          setHovHex({});
          const h = h3ToFeature(curHex);
          if (object) {
            console.log('hovering over geo object');
            setHovHovHexArr([object.properties.DU_ID]);
            // setHovHovHexArr(
            //   temporalDataGeo.features
            //     .filter((f) => {
            //       return booleanIntersects(h, f.geometry);
            //     })
            //     .map((f) => {
            //       return f.properties.DU_ID;
            //     })
            // );
          }
        }
        const h = h3ToFeature(object.hexId);
        return setHovHexArr(
          temporalDataGeo.features
            .filter((f) => {
              return booleanIntersects(h, f.geometry);
            })
            .map((f) => {
              setHovHex((a) => ({
                ...a,
                [f.properties.DU_ID]: area(intersect(h, f.geometry)) / area(h),
              }));
              return f.properties.DU_ID;
            })
        );
      },
      onClick: ({ object }) => {
        if (curHex == object.hexId) {
          return (
            setClickHexArr(null) ||
            setClickHex({
              type: 'FeatureCollection',
              features: [],
            }) ||
            setClickHex2({}) ||
            setCurHex(null)
          );
        }
        if (hovHovHexArr.includes(object.properties.DU_ID)) {
          return (
            setClickHexArr(null) ||
            setClickHex({
              type: 'FeatureCollection',
              features: [],
            }) ||
            setClickHex2({}) ||
            setCurHex(null)
          );
        }
        if (curHex) return;
        setClickHex({
          type: 'FeatureCollection',
          features: [],
        });

        setHovHexArr(null);
        setHovHex({});

        setCurHex(object.hexId);
        const h = h3ToFeature(object.hexId);
        return setClickHexArr(
          temporalDataGeo.features
            .filter((f) => {
              return booleanIntersects(h, f.geometry);
            })
            .map((f) => {
              const fh = intersect(h, f.geometry);
              // console.log(fh);
              const are = area(fh) / area(h);
              setClickHex((a) => ({
                type: 'FeatureCollection',
                features: [
                  ...a.features,
                  {
                    ...fh,
                    properties: { ...f.properties, area: are },
                  },
                ],
              }));
              setClickHex2((a) => ({
                ...a,
                [f.properties.DU_ID]: { ...f.properties, area: are },
              }));
              // console.log(clickHex2);
              return f.properties.DU_ID;
            })
        );
      },
    }),
  ];

  return (
    <>
      <WaterDeckGL
        {...{
          layers,
          curViewState,
          getTooltip,
        }}
      />
      <MainGUI {...params} />
      <GUI {...{ ...params, ...sandboxGUI }} />
    </>
  );
}

class SandboxSlide extends CompositeLayer {
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

function GUI({
  curScenario,
  setCurScenario,
  speedyCounter,
  setSpeedyCounter,
  playing,
  setPlaying,
  displayGW,
  setDisplayGW,
  displayDiff,
  setDisplayDiff,
  displayUnmet,
  setDisplayUnmet,
  displayDemand,
  setDisplayDemand,
  displayLandUse,
  setDisplayLandUse,
  displayDemAsRings,
  setDisplayDemAsRings,
}) {
  return (
    <>
      <button
        onClick={() => {
          setPlaying((p) => !p);
        }}
        style={{
          position: 'absolute',
          display: 'block',
          bottom: '20px',
          right: '50%',
          transform: 'translateX(50%)',
        }}
      >
        {playing ? 'Pause' : 'Play'}
      </button>
      <input
        onChange={function (e) {
          setPlaying(false);
          setSpeedyCounter(parseInt(e.target.value));
        }}
        onInput={function (e) {
          setSpeedyCounter(parseInt(e.target.value));
        }}
        value={speedyCounter}
        style={{
          width: '50vw',
          position: 'absolute',
          display: 'block',
          bottom: '40px',
          right: '50%',
          transform: 'translateX(50%)',
        }}
        type="range"
        min="0"
        max="1199"
        id="myRange"
      />
      <div
        style={{
          position: 'absolute',
          display: 'block',
          bottom: '20%',
          right: '0',
          transform: 'translateY(50%)',
        }}
      >
        <div>
          <input
            type="checkbox"
            value="display1"
            checked={displayGW}
            onChange={() => setDisplayGW((d) => !d)}
          />
          <label htmlFor="display1">Display Groundwater</label>
        </div>
        {curScenario != -1 && (
          <div>
            <input
              type="checkbox"
              value="display2"
              checked={displayDiff}
              onChange={() => setDisplayDiff((d) => !d)}
            />
            <label htmlFor="display2">Display Difference to Baseline</label>
          </div>
        )}
        <div>
          <input
            type="checkbox"
            value="display3"
            checked={displayUnmet}
            onChange={() => setDisplayUnmet((d) => !d)}
          />
          <label htmlFor="display3">Display Unmet Demand</label>
        </div>
        <div>
          <input
            type="checkbox"
            value="display4"
            checked={displayDemand}
            onChange={() => setDisplayDemand((d) => !d)}
          />
          <label htmlFor="display4">Display Demand</label>
        </div>
        <div>
          <input
            type="checkbox"
            value="display5"
            checked={displayLandUse}
            onChange={() => setDisplayLandUse((d) => !d)}
          />
          <label htmlFor="display5">Display Land Use</label>
        </div>
        <div>
          <input
            type="checkbox"
            value="displayRings"
            checked={displayDemAsRings}
            onChange={() => setDisplayDemAsRings((d) => !d)}
          />
          <label htmlFor="displayRings">Display Demand as Rings</label>
        </div>
      </div>
      <div
        onChange={function (e) {
          setCurScenario(e.target.value);
        }}
        style={{
          position: 'absolute',
          display: 'block',
          bottom: '50%',
          right: '0',
          transform: 'translateY(50%)',
        }}
      >
        <div>
          <input
            type="radio"
            name="scenario"
            value="-1"
            checked={curScenario == -1}
          />
          <label htmlFor="scenario0">Original</label>
        </div>
        <div>
          <input
            type="radio"
            name="scenario"
            value="0"
            checked={curScenario == 0}
          />
          <label htmlFor="scenario1">Scenario 1</label>
        </div>

        <div>
          <input
            type="radio"
            name="scenario"
            value="1"
            checked={curScenario == 1}
          />
          <label htmlFor="scenario2">Scenario 2</label>
        </div>

        <div>
          <input
            type="radio"
            name="scenario"
            value="2"
            checked={curScenario == 2}
          />
          <label htmlFor="scenario3">Scenario 3</label>
        </div>
      </div>
    </>
  );
}

class SlideTerrain extends CompositeLayer {
  renderLayers() {
    return [
      ...(!USE_TERRAIN_3D
        ? [
            new TileLayer({
              data: 'https://services.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}.png',

              minZoom: 7,
              maxZoom: 11,
              tileSize: 256,
              zoomOffset: -1,

              renderSubLayers: (props) => {
                const {
                  bbox: { west, south, east, north },
                } = props.tile;

                return new BitmapLayer(props, {
                  data: null,
                  image: props.data,
                  bounds: [west, south, east, north],
                });
              },
            }),
          ]
        : []),
      ...(USE_TERRAIN_3D
        ? [
            new TerrainLayer({
              id: 'terrain',
              strategy: 'no-overlap',
              elevationDecoder: {
                rScaler: 5 * 256,
                gScaler: 5 * 1,
                bScaler: (5 * 1) / 256,
                offset: 5 * -32768,
              },
              elevationData: `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png`,
              texture: `https://services.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}.png`,
              operation: 'terrain+draw',
            }),
          ]
        : []),
      new SolidHexTileLayer({
        id: `HoveringTiles`,
        data: this.props.data,
        thicknessRange: [0, 1],
        filled: true,

        extruded: false,
        raised: false,
        getFillColor: [0, 0, 0, 0],
        ...(USE_TERRAIN_3D ? { extensions: [new TerrainExtension()] } : {}),
        // pickable: true,
        // autoHighlight: true,
        // onHover: console.log,
      }),
    ];
  }
}

SlideTerrain.layerName = 'SlideTerrain';
SlideTerrain.defaultProps = {
  ...CompositeLayer.defaultProps,
  // pickable: true,
};

function MainGUI({ speedyCounter }) {
  return (
    <>
      <Clock
        counter={speedyCounter}
        displayMonth={false}
        dataset="averageDemandBaseline"
      />
    </>
  );
}

function useGUI() {
  const [displayGW, setDisplayGW] = useState(true);
  const [displayDiff, setDisplayDiff] = useState(true);
  const [displayUnmet, setDisplayUnmet] = useState(true);
  const [displayDemand, setDisplayDemand] = useState(false);
  const [displayLandUse, setDisplayLandUse] = useState(false);
  const [displayDemAsRings, setDisplayDemAsRings] = useState(false);

  return {
    displayGW,
    setDisplayGW,
    displayDiff,
    setDisplayDiff,
    displayUnmet,
    setDisplayUnmet,
    displayDemand,
    setDisplayDemand,
    displayLandUse,
    setDisplayLandUse,
    displayDemAsRings,
    setDisplayDemAsRings,
  };
}

function useHexTooltip({ slide, counter, cycler, curScenario, speedyCounter }) {
  const getTooltip = useCallback(
    ({ object }) => {
      if (!object) return;

      // if (object.)

      const date = dateInterpIdx(speedyCounter);
      return (
        object && {
          html: `\
    <div><i>${date.toLocaleString('default', {
      month: 'long',
    })} ${date.toLocaleString('default', { year: 'numeric' })}</i></div>
    <div><i>${
      curScenario > -1 ? SCENARIO_LABELS[curScenario] : 'Historical Baseline'
    }</i></div>
    <div><b>Demand</b></div>
    <div>${
      curScenario > -1
        ? object.properties.Demand[SCENARIOS[curScenario]][speedyCounter]
        : object.properties.DemandBaseline[speedyCounter]
    }</div>
    <div><b>Supply</b></div>
    <div>${
      curScenario > -1
        ? object.properties.Demand[SCENARIOS[curScenario]][speedyCounter] +
          object.properties.UnmetDemand[SCENARIOS[curScenario]][speedyCounter]
        : object.properties.DemandBaseline[speedyCounter] +
          object.properties.UnmetDemandBaseline[speedyCounter]
    }</div>
    <div><b>Unmet Demand</b></div>
    <div>${
      curScenario > -1
        ? -object.properties.UnmetDemand[SCENARIOS[curScenario]][speedyCounter]
        : -object.properties.UnmetDemandBaseline[speedyCounter]
    }</div>
    <div><b>Groundwater</b></div>
    <div>${
      object.properties.Groundwater
        ? object.properties.Groundwater[speedyCounter]
        : 'N/A'
    }</div>
    <div><b>Land Holder</b></div>
    <div>${
      HOLDERS[
        object.properties.LandUse[0]
          ? object.properties.LandUse[0]
          : object.properties.LandUse
      ]
    }</div>
`,
        }
      );
    },
    [counter, slide, speedyCounter, cycler, curScenario]
  );

  return { getTooltip };
}
