import React, { useLayoutEffect, useRef } from 'react';

import * as vsup from 'vsup';
import * as d3 from 'd3';
import DeckGL from '@deck.gl/react';
import maplibregl from 'maplibre-gl';
import { Map } from 'react-map-gl';
import mapStyle from 'src/assets/style.json';
import { LIGHTING } from 'src/utils/settings';

import { useState } from 'react';

import { temporalDataGeoGW, temporalDataHex } from 'src/utils/data';

import useCamera from 'src/scrollyline/hooks/useCamera';
import useCounters from 'src/scrollyline/hooks/useCounters';

import Clock from 'src/Clock';

import SlideTerrain from './SlideTerrain';
import useHexMouseEvts from './useHexMouseEvts';
import useHexTooltip from './useHexTooltip';

import {
  colorInterpVsupDemDiff,
  colorInterpVsupGW,
  colorInterpOwner,
  colorInterpUDem,
  colorInterpVsupUDem,
  scaleStepUDemVar,
  heightInterpUDem,
  colorInterpDemDiff,
  scaleContDemDiff,
  scaleContUDem,
  valueInterpUDem,
  scaleContDemDiffVar,
  scaleContUDemVar,
  colorInterpUDemVar,
  colorScaleVsupGW,
  colorScaleDemDiffNorm,
  colorScaleUDemNorm,
  colorScaleUDemVarNorm,
  colorScaleVsupDemDiff,
  colorScaleGWNorm,
} from 'src/utils/scales';
import { SCENARIOS } from 'src/utils/settings';

import {
  _TerrainExtension as TerrainExtension,
  PathStyleExtension,
} from '@deck.gl/extensions';
import { OBJLoader } from '@loaders.gl/obj';
import { CompositeLayer, GeoJsonLayer } from 'deck.gl';
import IconHexTileLayer from 'src/hextile/IconHexTileLayer';
import SolidHexTileLayer from 'src/hextile/SolidHexTileLayer';
import { USE_TERRAIN_3D } from 'src/utils/settings';
import { dataFilter, indepVariance } from 'src/utils/utils';

import { temporalDataGeo } from 'src/utils/data';
import BillboardIconHexTileLayer from 'src/hextile/BillboardIconHexTileLayer';

export default function CentralValleyWater() {
  const [curOption, setCurOption] = useState(1);
  const legendArea = useRef();
  const hexMouseEvts = useHexMouseEvts({ curOption });

  const curState = {
    data: temporalDataHex,
    curOption,
    curScenario: 0,
    setCurOption,
    ...hexMouseEvts,
  };

  const centralValleyWaterGUI = useGUI();
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

  useLayoutEffect(() => {
    const height = 500;
    const width = 400;
    d3.select(legendArea.current)
      .attr('width', width)
      .attr('height', height)
      .call(function (a) {
        a.append('g').call(
          vsup.legend
            .arcmapLegend()
            .vtitle('Groundwater')
            .utitle('Variance')
            .scale(colorScaleVsupGW)
            .size(150)
            .x(width - 180)
            .y(height - 300)
        );
      })
      .call(function (a) {
        a.append('g').call(
          vsup.legend
            .simpleLegend()
            .title('Difference w/ Baseline')
            .size(250)
            .height(20)
            .scale(colorScaleDemDiffNorm)
            .x(width - 280)
            .y(height - 100)
        );
      });
  }, []);

  const layers = [
    new SlideTerrain(params),
    new CentralValleyWaterSlide({
      ...params,
      ...centralValleyWaterGUI,
    }),
    new ControlMap({
      ...params,
      ...centralValleyWaterGUI,
    }),
  ];

  return (
    <>
      <DeckGL
        layers={layers}
        effects={[LIGHTING]}
        initialViewState={curViewState}
        controller={true}
        getTooltip={getTooltip}
      >
        <Map
          reuseMaps
          mapLib={maplibregl}
          mapStyle={mapStyle}
          preventStyleDiffing={true}
        />
      </DeckGL>
      <Clock
        counter={counters.speedyCounter}
        displayMonth={false}
        dataset="averageDemandBaseline"
      />
      <GUI {...{ ...params, ...centralValleyWaterGUI }} />
      <svg className="legend-area" ref={legendArea}></svg>
    </>
  );
}

class CentralValleyWaterSlide extends CompositeLayer {
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
      curOption,
      speedyCounter,
      hoveredHex,
      clickedHexes,
      hoveredGeoActive,
      hoveredGeos,
      selectedGeoJSON,
      selectedGeos,
      selectionFinalized,
    } = this.props;

    return [
      new SolidHexTileLayer({
        id: `Groundwater`,
        data,
        thicknessRange: [0, 1],
        getFillColor: (d) =>
          colorInterpVsupGW(
            d.properties.Groundwater[speedyCounter],
            d.properties.GroundwaterVar[speedyCounter]
          ),
        opacity: 1,
        visible: curOption == 0 || curOption == 1,
        updateTriggers: {
          getFillColor: [speedyCounter],
        },
      }),
      new SolidHexTileLayer({
        id: `DiffRings`,
        data,
        thicknessRange: [0.4, 0.65],
        getFillColor: (d) =>
          curOption == 0
            ? colorInterpVsupDemDiff(
                d.properties.UnmetDemand[SCENARIOS[0]][speedyCounter] -
                  d.properties.UnmetDemandBaseline[speedyCounter],
                indepVariance(
                  d.properties.UnmetDemandBaselineVar[speedyCounter],
                  d.properties.UnmetDemandVar[SCENARIOS[0]][speedyCounter]
                ),
                true
              )
            : colorInterpDemDiff(
                d.properties.UnmetDemand[SCENARIOS[0]][speedyCounter] -
                  d.properties.UnmetDemandBaseline[speedyCounter],
                true
              ),
        getValue: (d) =>
          curOption == 0
            ? 1
            : scaleStepUDemVar(
                indepVariance(
                  d.properties.UnmetDemandBaselineVar[speedyCounter],
                  d.properties.UnmetDemandVar[SCENARIOS[0]][speedyCounter]
                )
              ),
        raised: true,
        visible: curOption == 0 || curOption == 1,
        getElevation: (d) => (d.hexId in clickedHexes ? 5000 : 0),
        getLineWidth: (d) => (d.hexId in clickedHexes ? 100 : 0),
        stroked: true,
        extruded: false,
        lineJointRounded: true,
        getLineColor: [255, 255, 255, 200],
        getOffset: -0.5,
        extensions: [new PathStyleExtension({ offset: true })],
        opacity: 1.0,
        updateTriggers: {
          getFillColor: [curOption, speedyCounter],
          getValue: [curOption, speedyCounter],
          getElevation: [selectionFinalized],
          getLineWidth: [selectionFinalized],
        },
      }),
      new IconHexTileLayer({
        id: `ScenarioUnmet`,
        data,
        loaders: [OBJLoader],
        mesh: './assets/drop.obj',
        raised: true,
        getColor: /* (d) =>
          colorInterpUDemVar(
            d.properties.UnmetDemandBaselineVar[speedyCounter]
          )  */ (d) => [
          255,
          130,
          35,
          (1 -
            scaleContDemDiffVar(
              d.properties.UnmetDemandBaselineVar[speedyCounter]
            )) *
            200 +
            55,
        ] /* (d) =>
          colorInterpUDem(d.properties.UnmetDemandBaseline[speedyCounter]) */,
        getValue: (d) =>
          valueInterpUDem(
            d.properties.UnmetDemand[SCENARIOS[0]][speedyCounter]
          ),
        visible: curOption == 0 || curOption == 1,
        sizeScale: 3000,
        opacity: 1,
        updateTriggers: {
          getTranslation: [speedyCounter],
        },
      }),
      new GeoJsonLayer({
        id: 'GeoJsonExt',
        data: selectedGeoJSON,
        opacity: 0.75,
        extruded: true,
        getElevation: (d) =>
          heightInterpUDem(
            d.properties.UnmetDemand[SCENARIOS[0]][speedyCounter]
          ),
        visible: curOption == 0 || curOption == 1,
        pickable: true,
        getLineWidth: 100,
        getFillColor: (d) => {
          let fill = colorInterpUDem(
            d.properties.UnmetDemand[SCENARIOS[0]][speedyCounter]
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
            curOption,
            speedyCounter,
            hoveredGeoActive,
            selectionFinalized,
          ],
          getElevation: [curOption, speedyCounter],
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
        visible: (!selectionFinalized && curOption == 0) || curOption == 1,
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
        visible: curOption == 0 || curOption == 1,
        getLineWidth: (d) =>
          d.properties.DU_ID == hoveredGeoActive ? 100 : 20,
        getFillColor: (d) => {
          if (d.properties.DU_ID == hoveredGeoActive) {
            const hlcol = [0 / 255, 0 / 255, 128 / 255, 128 / 255];
            const fill = colorInterpUDem(
              curOption > -1
                ? selectedGeos[d.properties.DU_ID].UnmetDemand[SCENARIOS[0]][
                    speedyCounter
                  ]
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
            return colorInterpUDem(
              curOption > -1
                ? selectedGeos[d.properties.DU_ID].UnmetDemand[SCENARIOS[0]][
                    speedyCounter
                  ]
                : selectedGeos[d.properties.DU_ID].UnmetDemandBaseline[
                    speedyCounter
                  ]
            );
          }
          return [0, 0, 0, 0];
        },
        getLineColor: [0, 0, 0],
        updateTriggers: {
          getFillColor: [hoveredGeoActive, curOption, selectionFinalized],
          getLineWidth: [hoveredGeoActive],
        },
      }),
      new SolidHexTileLayer({
        id: `HoveringTiles`,
        data: data,
        thicknessRange: [0, 1],
        getFillColor: [0, 0, 0, 0],
        pickable: !selectionFinalized,
        autoHighlight: !selectionFinalized,
        visible: curOption == 0 || curOption == 1,
      }),
    ];
  }
}

CentralValleyWaterSlide.layerName = 'CentralValleyWaterSlide';
CentralValleyWaterSlide.defaultProps = {
  ...CompositeLayer.defaultProps,
  autoHighlight: true,
};

function useGUI() {
  return {};
}

function GUI({
  curOption,
  setCurOption,
  speedyCounter,
  setSpeedyCounter,
  playing,
  setPlaying,
}) {
  return (
    <>
      <div className="styled-input">
        <button
          onClick={() => {
            setPlaying((p) => !p);
          }}
        >
          {playing ? 'Pause' : 'Play'}
        </button>
        <div>
          <input
            style={{
              width: '10ch',
              display: 'block',
            }}
            type="number"
            value={speedyCounter}
            onChange={function (e) {
              setSpeedyCounter(parseInt(e.target.value));
            }}
          />
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
              width: '40vw',
              display: 'block',
            }}
            type="range"
            min="0"
            max="1199"
            id="myRange"
          />
        </div>
      </div>
      <div
        onChange={function (e) {
          setCurOption(e.target.value);
        }}
        style={{
          position: 'absolute',
          display: 'block',
          bottom: '60%',
          right: '0',
          transform: 'translateY(50%)',
        }}
      >
        <div>
          <input
            type="radio"
            name="option"
            value="0"
            checked={curOption == 0}
          />
          <label htmlFor="option1">Option 1</label>
        </div>

        <div>
          <input
            type="radio"
            name="option"
            value="1"
            checked={curOption == 1}
          />
          <label htmlFor="option2">Option 2</label>
        </div>
        <div>
          <input
            type="radio"
            name="option"
            value="2"
            checked={curOption == 2}
          />
          <label htmlFor="option2">GW</label>
        </div>
        <div>
          <input
            type="radio"
            name="option"
            value="3"
            checked={curOption == 3}
          />
          <label htmlFor="option2">Scenario Unmet Dem</label>
        </div>
        <div>
          <input
            type="radio"
            name="option"
            value="4"
            checked={curOption == 4}
          />
          <label htmlFor="option2">Difference</label>
        </div>
      </div>
    </>
  );
}

class ControlMap extends CompositeLayer {
  initializeState() {
    super.initializeState();
  }
  renderLayers() {
    const {
      data,
      curOption,
      speedyCounter,
      hoveredHex,
      clickedHexes,
      hoveredGeoActive,
      hoveredGeos,
      selectedGeoJSON,
      selectedGeos,
      selectionFinalized,
    } = this.props;

    return [
      new GeoJsonLayer({
        id: 'GroundwaterGeo',
        data: temporalDataGeoGW,
        opacity: 1,
        stroked: false,
        filled: true,
        getFillColor: (d) =>
          Object.values({
            ...d3.color(
              colorScaleGWNorm(d.properties.Groundwater[speedyCounter])
            ),
            opacity: 255,
          }),
        visible: curOption == 2,
        updateTriggers: {
          getFillColor: [speedyCounter],
        },
        pickable: true,
        autoHighlight: true,
      }),
      new GeoJsonLayer({
        id: 'UDemGeo',
        data: temporalDataGeo,
        opacity: 1,
        stroked: false,
        filled: true,
        getFillColor: (d) =>
          Object.values({
            ...d3.color(
              colorScaleUDemNorm(
                d.properties.UnmetDemand[SCENARIOS[0]][speedyCounter]
              )
            ),
            opacity: 255,
          }),
        visible: curOption == 3,
        updateTriggers: {
          getFillColor: [speedyCounter],
        },
        pickable: true,
        autoHighlight: true,
      }),
      new GeoJsonLayer({
        id: 'DemDiffGeo',
        data: temporalDataGeo,
        opacity: 1,
        stroked: false,
        filled: true,
        getFillColor: (d) =>
          Object.values({
            ...d3.color(
              colorScaleDemDiffNorm(
                d.properties.UnmetDemand[SCENARIOS[0]][speedyCounter] -
                  d.properties.UnmetDemandBaseline[speedyCounter]
              )
            ),
            opacity: 255,
          }),
        visible: curOption == 4,
        updateTriggers: {
          getFillColor: [speedyCounter],
        },
        pickable: true,
        autoHighlight: true,
      }),
    ];
  }
}

ControlMap.layerName = 'ControlMap';
ControlMap.defaultProps = {
  ...CompositeLayer.defaultProps,
  autoHighlight: true,
};
