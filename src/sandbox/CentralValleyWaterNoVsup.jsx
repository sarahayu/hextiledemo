import React, { useEffect } from 'react';
import { useRef, useState } from 'react';

import DeckGL from '@deck.gl/react';
import * as d3 from 'd3';
import maplibregl from 'maplibre-gl';
import { Map } from 'react-map-gl';
import mapStyle from 'src/assets/style.json';
import { INITIAL_VIEW_STATE, LIGHTING } from 'src/utils/settings';

import {
  temporalDataHex as data,
  temporalDataGeo as dataDeag,
} from 'src/utils/data';

import useGUI from './useGUI';
import useHexMouseEvts from './useHexMouseEvts';
import useHexTooltip from './useHexTooltip';

import { SCENARIOS } from 'src/utils/settings';
import BaseTerrainLayer from './BaseTerrainLayer';

import { PathStyleExtension } from '@deck.gl/extensions';
import { OBJLoader } from '@loaders.gl/obj';
import { CompositeLayer } from 'deck.gl';
import IconHexTileLayer from 'src/hextile/IconHexTileLayer';
import SolidHexTileLayer from 'src/hextile/SolidHexTileLayer';
import { indepVariance } from 'src/utils/utils';

import Clock from 'src/Clock';
import { temporalDataGeo } from 'src/utils/data';
import { WATER_INTERPS } from 'src/utils/scales';
import DeagHexTileLayer from '../hextile/DeagHexTileLayer';

import { useLayoutEffect } from 'react';

import * as h3 from 'h3-js';
import { hexagonShape } from 'src/utils/utils';
import * as vsup from 'vsup';

export default function CentralValleyWaterNoVsup() {
  const { current: resRange } = useRef(
    Object.keys(data).map((d) => parseInt(d))
  );
  const [zoom, setZoom] = useState(INITIAL_VIEW_STATE.zoom);

  const curInput = useGUI();
  const hexMouseEvts = useHexMouseEvts({
    disabled: curInput.curOption > 1,
    dataDeag,
    deagKey: 'DURgs',
  });
  const { getTooltip } = useHexTooltip(curInput);

  const curState = {
    data,
    ...curInput,
    ...hexMouseEvts,
  };

  return (
    <>
      <DeckGL
        controller
        effects={[LIGHTING]}
        initialViewState={INITIAL_VIEW_STATE}
        getTooltip={getTooltip}
        onViewStateChange={({ viewState }) => {
          setZoom(viewState.zoom);
        }}
      >
        <Map
          reuseMaps
          preventStyleDiffing
          mapLib={maplibregl}
          mapStyle={mapStyle}
        />
        <BaseTerrainLayer id="slide-terrain" {...curState} />
        <MultivariableHextileLayer
          id="slide-waters"
          {...curState}
          zoomRange={[7, 9]}
          visible
        />
      </DeckGL>
      <GUI
        {...curState}
        res={d3.scaleQuantize().domain([0, 1]).range(resRange)(
          d3.scaleLinear().domain([7, 9]).range([0, 1]).clamp(true)(zoom)
        )}
      />
    </>
  );
}

const curScenario = 0;

class MultivariableHextileLayer extends CompositeLayer {
  renderLayers() {
    const {
      data,
      curOption,
      speedyCounter,
      clickedHexes,
      selectionFinalized,
      visible,
      zoomRange,
    } = this.props;

    return [
      new SolidHexTileLayer({
        id: `Groundwater`,
        data,
        thicknessRange: [0, 1],
        getFillColor: (d) =>
          WATER_INTERPS.groundwater.interpColor(
            d.properties.Groundwater[speedyCounter]
          ),
        opacity: 1,
        visible,
        updateTriggers: {
          getFillColor: [speedyCounter],
        },
        zoomRange,
      }),
      new SolidHexTileLayer({
        id: `DiffRings`,
        data,
        thicknessRange: [0.4, 0.65],
        getFillColor: (d) =>
          curOption == 0
            ? WATER_INTERPS.difference.interpVsup(
                d.properties.UnmetDemand[SCENARIOS[curScenario]][
                  speedyCounter
                ] - d.properties.UnmetDemandBaseline[speedyCounter],
                indepVariance(
                  d.properties.UnmetDemandBaselineVar[speedyCounter],
                  d.properties.UnmetDemandVar[SCENARIOS[curScenario]][
                    speedyCounter
                  ]
                ),
                true
              )
            : WATER_INTERPS.difference.interpColor(
                d.properties.UnmetDemand[SCENARIOS[curScenario]][
                  speedyCounter
                ] - d.properties.UnmetDemandBaseline[speedyCounter],
                true
              ),
        getValue: (d) =>
          curOption == 0
            ? 1
            : WATER_INTERPS.difference.scaleLinearVar(
                indepVariance(
                  d.properties.UnmetDemandBaselineVar[speedyCounter],
                  d.properties.UnmetDemandVar[SCENARIOS[curScenario]][
                    speedyCounter
                  ]
                )
              ) *
                0.8 +
              0.2,
        raised: true,
        visible,
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
        zoomRange,
      }),
      new IconHexTileLayer({
        id: `ScenarioUnmet`,
        data,
        loaders: [OBJLoader],
        mesh: './assets/drop.obj',
        raised: true,
        getColor: (d) => [
          255,
          130,
          35,
          WATER_INTERPS.unmetDemand.scaleLinearVar(
            d.properties.UnmetDemandVar[SCENARIOS[curScenario]][speedyCounter]
          ) *
            200 +
            55,
        ],
        getValue: (d) =>
          WATER_INTERPS.unmetDemand.scaleLinear(
            d.properties.UnmetDemand[SCENARIOS[curScenario]][speedyCounter]
          ),
        visible,
        sizeScale: 3000,
        opacity: 1,
        updateTriggers: {
          getTranslation: [speedyCounter],
        },
        zoomRange,
      }),
      new DeagHexTileLayer({
        ...this.props,
        id: 'DeagLayer',
        data,
        deagData: temporalDataGeo,
        getFillColor: (d) => {
          return WATER_INTERPS.unmetDemand.interpColor(
            d.properties.UnmetDemand[SCENARIOS[curScenario]][speedyCounter],
            false,
            false
          );
        },
        updateTriggers: {
          getFillColor: [speedyCounter],
        },
      }),
    ];
  }
}

MultivariableHextileLayer.layerName = 'MultivariableHextileLayer';
MultivariableHextileLayer.defaultProps = {
  ...CompositeLayer.defaultProps,
  autoHighlight: true,
};

function GUI({
  curOption,
  setCurOption,
  speedyCounter,
  setSpeedyCounter,
  playing,
  setPlaying,
  res,
}) {
  return (
    <>
      <Clock
        counter={speedyCounter}
        displayMonth={false}
        dataset="averageDemandBaseline"
      />
      <Legend res={res} />
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
    </>
  );
}

function Legend({ res }) {
  const legendArea = useRef();
  const hexText = useRef();

  useLayoutEffect(() => {
    const height = 500;
    const width = 400;
    d3.select(legendArea.current)
      .attr('width', width)
      .attr('height', height)
      .call(function (a) {
        a.append('g').call(
          vsup.legend
            .simpleLegend()
            .title('Groundwater')
            .size(250)
            .height(20)
            .scale(WATER_INTERPS.groundwater.colorsStepped)
            .x(width - 280)
            .y(height - 320)
        );
      })
      .call(function (a) {
        a.append('g').call(
          vsup.legend
            .simpleLegend()
            .title('Difference w/ Baseline')
            .size(250)
            .height(20)
            .scale(WATER_INTERPS.difference.colorsStepped)
            .x(width - 280)
            .y(height - 250)
        );
      })
      .call(function (a) {
        a.append('g')
          .call(
            hexagonShape(
              width - 100,
              height - 100,
              70,
              'rgba(146, 146, 146, 0.5)'
            )
          )
          .call(function (a) {
            hexText.current = [
              a
                .append('text')
                .attr('x', width - 100)
                .attr('y', height - 92)
                .attr('text-anchor', 'middle')
                .style('font-weight', 'bold')
                .style('blend-mode', 'multiply')
                .text(
                  `${Math.round(
                    h3.getHexagonAreaAvg(res, h3.UNITS.km2)
                  )} km\u00B2`
                ),
              a
                .append('text')
                .attr('x', width - 100)
                .attr('y', height - 50)
                .attr('text-anchor', 'middle')
                .style('font-size', '11px')
                .text(
                  `\u2190 ${Math.round(
                    h3.getHexagonEdgeLengthAvg(res, h3.UNITS.km)
                  )} km \u2192;`
                ),
            ];
          });
      });
  }, []);

  useEffect(() => {
    let [areaText, sideText] = hexText.current;
    areaText.text(
      `${Math.round(h3.getHexagonAreaAvg(res, h3.UNITS.km2))} km\u00B2`
    );
    sideText.text(
      `\u2190 ${Math.round(
        h3.getHexagonEdgeLengthAvg(res, h3.UNITS.km)
      )} km \u2192;`
    );
  }, [res]);

  return <svg className="legend-area" ref={legendArea}></svg>;
}
