import React from 'react';
import { useState } from 'react';

import maplibregl from 'maplibre-gl';
import { Map } from 'react-map-gl';
import { INITIAL_VIEW_STATE, LIGHTING } from 'src/utils/settings';

import { demandUnitGeo as dataDeag } from 'src/data/demandUnitGeo';
import { waterDataSquare as data } from 'src/data/waterDataSquare';

import useGUI from './water/useGUI';
import useHexMouseEvts from './water/useHexMouseEvts';

import { SCENARIOS } from 'src/utils/settings';

import { CompositeLayer } from 'deck.gl';
import SolidSquareTileLayer from 'src/squaretile/SolidSquareTileLayer';

import { WATER_INTERPS } from 'src/utils/scales';

import { useEffect, useLayoutEffect, useRef } from 'react';
import Clock from 'src/utils/Clock';

import * as d3 from 'd3';
import * as h3 from 'h3-js';
import DeckGLOverlay from 'src/utils/overlay';

export default function CentralValleyWaterSquare() {
  const { current: resRange } = useRef(
    Object.keys(data).map((d) => parseInt(d))
  );
  const curInput = useGUI();
  const hexMouseEvts = useHexMouseEvts({
    disabled: curInput.curOption > 1,
    dataDeag,
    deagKey: 'DURgs',
  });
  const [zoom, setZoom] = useState(INITIAL_VIEW_STATE.zoom);

  const curState = {
    data,
    ...curInput,
    ...hexMouseEvts,
  };

  return (
    <>
      <Map
        reuseMaps
        preventStyleDiffing
        mapLib={maplibregl}
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
        antialias
        initialViewState={INITIAL_VIEW_STATE}
      >
        <DeckGLOverlay
          interleaved
          effects={[LIGHTING]}
          onViewStateChange={({ viewState }) => {
            setZoom(viewState.zoom);
          }}
        >
          <MultivariableHextileLayer
            id="slide-waters"
            {...curState}
            zoomRange={[7, 9]}
            visible
            beforeId={'place_hamlet'}
          />
        </DeckGLOverlay>
      </Map>
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
      new SolidSquareTileLayer({
        id: `SquareBorders`,
        data,
        getFillColor: [0, 0, 0, 0],
        getLineColor: [80, 80, 80, 100],
        stroked: true,
        lineWidthUnits: 'pixels',
        getValue: (d) => 2,
        visible,
        extruded: false,
        opacity: 1.0,
        zoomRange,
        offset: [0, 0],
      }),
      new SolidSquareTileLayer({
        id: `Groundwater`,
        data,
        thicknessRange: [0, 1],
        getFillColor: (d) => WATER_INTERPS.groundwater.interpColor(450),
        getValue: (d) =>
          WATER_INTERPS.groundwater.scaleLinear(
            d.properties.Groundwater[speedyCounter]
          ),
        opacity: 1,
        visible,
        updateTriggers: {
          getFillColor: [speedyCounter],
        },
        zoomRange,
        offset: [1, 1],
      }),
      new SolidSquareTileLayer({
        id: `DifferencePos`,
        data,
        thicknessRange: [0, 1],
        getFillColor: WATER_INTERPS.difference.interpColor(25, false),
        getValue: (d) =>
          WATER_INTERPS.difference.scaleLinear(
            d.properties.UnmetDemand[SCENARIOS[curScenario]][speedyCounter] -
              d.properties.UnmetDemandBaseline[speedyCounter]
          ) > 0.5
            ? (WATER_INTERPS.difference.scaleLinear(
                d.properties.UnmetDemand[SCENARIOS[curScenario]][
                  speedyCounter
                ] - d.properties.UnmetDemandBaseline[speedyCounter]
              ) -
                0.5) /
              0.5
            : 0,
        opacity: 1,
        visible,
        updateTriggers: {
          getValue: [speedyCounter],
        },
        zoomRange,
        offset: [1, -1],
      }),
      new SolidSquareTileLayer({
        id: `DifferenceNeg`,
        data,
        thicknessRange: [0, 1],
        getFillColor: WATER_INTERPS.difference.interpColor(-25, false),
        getValue: (d) =>
          WATER_INTERPS.difference.scaleLinear(
            d.properties.UnmetDemand[SCENARIOS[curScenario]][speedyCounter] -
              d.properties.UnmetDemandBaseline[speedyCounter]
          ) < 0.5
            ? 1 -
              WATER_INTERPS.difference.scaleLinear(
                d.properties.UnmetDemand[SCENARIOS[curScenario]][
                  speedyCounter
                ] - d.properties.UnmetDemandBaseline[speedyCounter]
              ) /
                0.5
            : 0,
        opacity: 1,
        visible,
        updateTriggers: {
          getValue: [speedyCounter],
        },
        zoomRange,
        offset: [-1, -1],
      }),
      new SolidSquareTileLayer({
        id: `UnmetDemand`,
        data,
        thicknessRange: [0, 1],
        getFillColor: [157, 157, 157],
        getValue: (d) =>
          WATER_INTERPS.unmetDemand.scaleLinear(
            d.properties.UnmetDemand[SCENARIOS[curScenario]][speedyCounter]
          ),
        opacity: 1,
        visible,
        updateTriggers: {
          getValue: [speedyCounter],
        },
        zoomRange,
        offset: [-1, 1],
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
      <div className="styled-input" style={{ right: '40%', bottom: '50px' }}>
        <button
          onClick={() => {
            setPlaying((p) => !p);
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
            width: '40vw',
            display: 'block',
          }}
          type="range"
          min="0"
          max="1199"
          id="myRange"
        />
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
      </div>
    </>
  );
}

function hexSideToSquareSide(res) {
  return h3.getHexagonEdgeLengthAvg(parseInt(res), h3.UNITS.km) * 2;
}

function Legend({ res }) {
  const legendArea = useRef();
  const hexText = useRef();

  useLayoutEffect(() => {
    const height = window.innerHeight;
    const width = window.innerWidth;
    const legendd3 = d3
      .select(legendArea.current)
      .attr('width', width)
      .attr('height', height);

    legendd3
      .append('g')
      .attr('transform', `translate(${width - 60},${height - 170})`)
      .call((a) => {
        a.append('rect')
          .attr('x', -50)
          .attr('y', -50)
          .attr('width', 100)
          .attr('height', 100)
          .attr('fill', 'rgba(146, 146, 146, 0.5)');
      })
      .call(function (a) {
        hexText.current = [
          a
            .append('text')
            .attr('x', 0)
            .attr('y', 8)
            .attr('text-anchor', 'middle')
            .style('font-weight', 'bold')
            .style('blend-mode', 'multiply')
            .text(
              `${d3.format('.2s')(
                h3.getHexagonAreaAvg(res, h3.UNITS.km2)
              )} km\u00B2`
            ),
          a
            .append('text')
            .attr('x', 0)
            .attr('y', 55)
            .attr('text-anchor', 'middle')
            .style('font-size', '11px')
            .text(
              `\u2190 ${d3.format('.2s')(
                h3.getHexagonEdgeLengthAvg(res, h3.UNITS.km)
              )} km \u2192;`
            ),
        ];
      });

    legendd3
      .append('g')
      .attr('transform', `translate(${200},${height - 140})`)
      .call((a) => {
        a.append('rect')
          .attr('x', -200)
          .attr('y', -140)
          .attr('width', 559)
          .attr('height', 240)
          // .attr('mix-blend-mode', 'lighten')
          .attr('fill', 'rgba(255, 255, 255, 1)');

        const squareSide = 75;

        a.append('text')
          .attr('x', squareSide)
          .attr('y', -squareSide - 15)
          .style('font-weight', 'bold')
          .attr('text-anchor', 'middle')
          .text('Measure Type');

        a.append('rect')
          .attr('x', 0)
          .attr('y', -squareSide)
          .attr('width', squareSide)
          .attr('height', squareSide)
          .attr('fill', 'rgba(157, 157, 157, 0.7)');
        a.append('rect')
          .attr('x', squareSide)
          .attr('y', -squareSide)
          .attr('width', squareSide)
          .attr('height', squareSide)
          .attr('fill', 'rgba(57, 79, 132, 0.7)');
        a.append('rect')
          .attr('x', squareSide)
          .attr('y', 0)
          .attr('width', squareSide)
          .attr('height', squareSide)
          .attr('fill', 'rgba(0, 104, 55, 0.7)');
        a.append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', squareSide)
          .attr('height', squareSide)
          .attr('fill', 'rgba(165, 0, 38, 0.7)');

        let domm = [],
          uAxisScale;

        [domm[1], domm[0]] =
          WATER_INTERPS.unmetDemandPositive.scaleLinear.domain();
        // [domm[1], domm[0]] = domm;
        uAxisScale = d3
          .scalePoint()
          .range([0, squareSide])
          .domain([domm[0], -(domm[1] - domm[0]) / 2, domm[1]]);
        a.append('g')
          .attr('transform', `translate(${0},${-squareSide})`)
          .call(d3.axisLeft(uAxisScale));

        domm = [0, 30];
        uAxisScale = d3
          .scalePoint()
          .range([0, squareSide])
          .domain([domm[0], (domm[1] - domm[0]) / 2, domm[1]]);
        a.append('g')
          .attr('transform', `translate(${0},${0})`)
          .call(d3.axisLeft(uAxisScale));

        [domm[1], domm[0]] = WATER_INTERPS.groundwater.scaleLinear.domain();
        // [domm[1], domm[0]] = domm;
        uAxisScale = d3
          .scalePoint()
          .range([0, squareSide])
          .domain([domm[0], -(domm[1] - domm[0]) / 2, domm[1]]);
        a.append('g')
          .attr('transform', `translate(${squareSide * 2},${-squareSide})`)
          .call(d3.axisRight(uAxisScale));

        domm = [0, 30];
        uAxisScale = d3
          .scalePoint()
          .range([0, squareSide])
          .domain([domm[0], (domm[1] - domm[0]) / 2, domm[1]]);
        a.append('g')
          .attr('transform', `translate(${squareSide * 2},${0})`)
          .call(d3.axisRight(uAxisScale));

        a.append('text')
          .attr('x', -20)
          .attr('y', -18)
          .style('font-size', 12)
          .attr('text-anchor', 'end')
          .text('Scenario Unmet (600 TAF/km2)');
        a.append('text')
          .attr('x', squareSide * 2 + 20)
          .attr('y', -18)
          .attr('text-anchor', 'start')
          .style('font-size', 12)
          .text('GW (ft)');
        a.append('text')
          .attr('x', squareSide * 2 + 20)
          .attr('y', 0 + 12)
          .attr('text-anchor', 'start')
          .style('font-size', 12)
          .text('+ Diff. w/ BL (600 TAF/km2)');
        a.append('text')
          .attr('x', -20)
          .attr('y', 0 + 12)
          .attr('text-anchor', 'end')
          .style('font-size', 12)
          .text('- Diff. w/ BL (600 TAF/km2)');
      });
  }, []);

  useEffect(() => {
    let [areaText, sideText] = hexText.current;
    areaText.text(
      `${d3.format('.2s')(Math.pow(hexSideToSquareSide(res), 2))} km\u00B2`
    );
    sideText.text(
      `\u2190 ${d3.format('.2s')(hexSideToSquareSide(res))} km \u2192;`
    );
  }, [res]);

  return <svg className="legend-area" ref={legendArea}></svg>;
}
