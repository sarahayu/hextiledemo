import React from 'react';

import DeckGL from '@deck.gl/react';
import maplibregl from 'maplibre-gl';
import { Map } from 'react-map-gl';
import mapStyle from 'src/assets/style.json';
import { LIGHTING } from 'src/utils/settings';

import { useState } from 'react';

import { temporalDataHex } from 'src/utils/data';

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
import { dataFilter } from 'src/utils/utils';

import { temporalDataGeo } from 'src/utils/data';
import BillboardIconHexTileLayer from 'src/hextile/BillboardIconHexTileLayer';

export default function CentralValleyWater() {
  const [curOption, setCurOption] = useState(1);
  const hexMouseEvts = useHexMouseEvts();

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

  const layers = [
    new SlideTerrain(params),
    new CentralValleyWaterSlide({
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
      new GeoJsonLayer({
        id: 'GeoJsonExt',
        data: selectedGeoJSON,
        opacity: 0.75,
        extruded: true,
        getElevation: (d) =>
          heightInterpUDem(d.properties.UnmetDemandBaseline[speedyCounter]),
        pickable: true,
        getLineWidth: 100,
        getFillColor: (d) => {
          let fill = colorInterpUDem(
            d.properties.UnmetDemandBaseline[speedyCounter]
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
      }),
      new SolidHexTileLayer({
        id: `Groundwater`,
        data,
        thicknessRange: [0, 1],
        getFillColor: (d) =>
          colorInterpVsupGW(
            d.properties.Groundwater[speedyCounter],
            d.properties.GroundwaterVar[speedyCounter]
          ),
        opacity: 0.2,
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
                d.properties.UnmetDemandBaselineVar[speedyCounter],
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
                d.properties.UnmetDemandBaselineVar[speedyCounter]
              ),
        raised: true,
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
      // new IconHexTileLayer({
      //   id: `ScenarioUnmet`,
      //   data,
      //   loaders: [OBJLoader],
      //   mesh: 'assets/drop.obj',
      //   raised: true,
      //   getColor: (d) => [
      //     255,
      //     130,
      //     35,
      //     scaleContDemDiffVar(
      //       d.properties.UnmetDemandBaselineVar[speedyCounter]
      //     ) * 255,
      //   ] /* (d) =>
      //     colorInterpUDem(d.properties.UnmetDemandBaseline[speedyCounter]) */,
      //   getValue: (d) =>
      //     valueInterpUDem(
      //       d.properties.UnmetDemand[SCENARIOS[0]][speedyCounter]
      //     ),
      //   sizeScale: 3000,
      //   opacity: 1,
      //   updateTriggers: {
      //     getTranslation: [speedyCounter],
      //   },
      // }),

      new BillboardIconHexTileLayer({
        id: `ScenarioUnmet`,
        data,
        loaders: [OBJLoader],
        iconAtlas: 'assets/drop.png',
        raised: true,
        getColor: (d) => [
          255,
          130,
          35,
          scaleContUDemVar(d.properties.UnmetDemandBaselineVar[speedyCounter]) *
            215 +
            40,
        ] /* (d) =>
          colorInterpUDem(d.properties.UnmetDemandBaseline[speedyCounter]) */,
        getValue: (d) =>
          valueInterpUDem(
            d.properties.UnmetDemand[SCENARIOS[0]][speedyCounter]
          ),
        sizeScale: 3000,
        opacity: 1,
        updateTriggers: {
          getValue: [speedyCounter],
        },
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
      <button
        onClick={() => {
          setPlaying((p) => !p);
        }}
        style={{
          position: 'absolute',
          display: 'block',
          bottom: '40px',
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
          bottom: '20px',
          right: '50%',
          transform: 'translateX(50%)',
        }}
        type="range"
        min="0"
        max="1199"
        id="myRange"
      />
      <div
        onChange={function (e) {
          setCurOption(e.target.value);
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
      </div>
    </>
  );
}
