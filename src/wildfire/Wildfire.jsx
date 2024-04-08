import React from 'react';
import { useRef, useState } from 'react';

import * as d3 from 'd3';
import * as h3 from 'h3-js';
import maplibregl from 'maplibre-gl';
import { Map } from 'react-map-gl';
import {
  INITIAL_ELEC_VIEW_STATE,
  INITIAL_FIRE_VIEW_STATE,
  LIGHTING,
} from 'src/utils/settings';

import { CALI_BBOX, wildfireDataHex as data } from 'src/utils/data';

import useGUI from './useGUI';
import useHexTooltip from './useHexTooltip';

import useHexMouseEvts from 'src/water/useHexMouseEvts';
import MultivariableHextileLayer from './MultivariableHextileLayer';

import { useEffect, useLayoutEffect } from 'react';

import * as vsup from 'vsup';

import { GeoJsonLayer } from 'deck.gl';
import DeckGLOverlay from 'src/utils/overlay';
import { ELECTION_INTERPS, WILDFIRE_INTERPS } from 'src/utils/scales';
import {
  arcmapLegendPretty,
  hexLegendU,
  hexLegendV,
  hexagonShape,
  iconhexLegendU,
  iconhexLegendV,
} from 'src/utils/utils';
import BaseTerrainLayer from './BaseTerrainLayer';

const RES_RANGE = Object.keys(data).map((d) => parseInt(d));
const ZOOM_RANGE = [10, 12];

export default function Wildfire() {
  const [zoom, setZoom] = useState(5);
  const [useVsup, setUseVsup] = useState(false);
  const [showAllRings, setShowAllRings] = useState(false);
  const [useElev, setUseElev] = useState(false);

  const curInput = useGUI();
  const hexTooltip = useHexTooltip(curInput);

  const curState = {
    data,
    ...curInput,
  };

  return (
    <>
      <Map
        reuseMaps
        preventStyleDiffing
        mapLib={maplibregl}
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
        antialias
        initialViewState={INITIAL_FIRE_VIEW_STATE}
      >
        <DeckGLOverlay
          getTooltip={hexTooltip}
          interleaved
          effects={[LIGHTING]}
          onViewStateChange={({ viewState }) => {
            setZoom(viewState.zoom);
          }}
          antialias
        >
          <GeoJsonLayer
            id="ground"
            data={CALI_BBOX}
            stroked={false}
            getFillColor={[0, 0, 0, 0]}
            beforeId={'landcover'}
          />
          <MultivariableHextileLayer
            id="slide-election"
            {...curState}
            zoomRange={ZOOM_RANGE}
            visible
            useVsup={useVsup}
            showAllRings={showAllRings}
            useElev={useElev}
            beforeId={'place_hamlet'}
          />
          {/* <BaseTerrainLayer /> */}
        </DeckGLOverlay>
      </Map>
      <GUI
        res={d3.scaleQuantize().domain(ZOOM_RANGE).range(RES_RANGE)(zoom)}
        useVsup={useVsup}
        setUseVsup={setUseVsup}
        showAllRings={showAllRings}
        setShowAllRings={setShowAllRings}
        useElev={useElev}
        setUseElev={setUseElev}
      />
    </>
  );
}

function GUI({
  res,
  useVsup,
  setUseVsup,
  showAllRings,
  setShowAllRings,
  useElev,
  setUseElev,
}) {
  const legendArea = useRef();

  useEffect(() => {
    d3.selectAll('.lin-legend').style(
      'visibility',
      useVsup ? 'hidden' : 'visible'
    );
    d3.selectAll('.vsup-legend-v').style(
      'visibility',
      useVsup ? 'visible' : 'hidden'
    );
    d3.selectAll('.vsup-legend-u').attr(
      'transform',
      `translate(${0},${useVsup ? 0 : 50})`
    );
    d3.selectAll('.box1')
      .attr('transform', `translate(${0},${useVsup ? 0 : 150})`)
      .attr('height', useVsup ? 250 : 100)
      .attr('width', useVsup ? 250 : 300);
    d3.selectAll('.box2')
      .attr('transform', `translate(${0},${useVsup ? 0 : 60})`)
      .attr('height', useVsup ? 170 : 110);
  }, [useVsup]);

  useEffect(() => {
    d3.select('#diff-u')
      .html('')
      .call(hexLegendU(WILDFIRE_INTERPS.gr2, 'ROS (ch/h)', showAllRings, '.2'));
  }, [showAllRings]);

  useLayoutEffect(() => {
    const svg = d3
      .select(legendArea.current)
      .attr('width', window.innerWidth)
      .attr('height', window.innerHeight);

    const height = 200;
    const width = window.innerWidth;

    const legendElem = svg
      .append('g')
      .attr('transform', `translate(${0},${window.innerHeight - height})`);

    legendElem
      .append('g')
      .attr('transform', `translate(${0},${height - 250})`)
      .append('rect')
      .attr('class', 'box1')
      .attr('height', 250)
      .attr('width', 250)
      .attr('fill', 'white');

    legendElem
      .append('g')
      .attr('transform', `translate(${0},${height - 170})`)
      .append('rect')
      .attr('class', 'box2')
      .attr('height', 170)
      .attr('width', 920)
      .attr('x', 350)
      .attr('fill', 'white');

    legendElem
      .append('g')
      .attr('class', 'vsup-legend-v')
      .append('g')
      .call(
        arcmapLegendPretty()
          .vtitle('Power')
          .utitle('Uncertainty')
          .scale(WILDFIRE_INTERPS.fire.vsup)
          .size(150)
          .x(40)
          .y(height - 150 - 40)
      );

    legendElem
      .append('g')
      .attr('class', 'lin-legend')
      .append('g')
      .call(
        vsup.legend
          .simpleLegend(null, 250, 20, '.2s')
          .title('Power')
          .size(250)
          .height(20)
          .scale(WILDFIRE_INTERPS.fire.colorsStepped)
          .x(20)
          .y(height - 70)
      );

    let xPos = 400,
      yPos = height - 120;

    legendElem
      .append('g')
      .attr('transform', `translate(${xPos},${yPos})`)
      .append('g')
      .attr('class', 'vsup-legend-u')
      .attr('id', 'diff-u')
      .call(hexLegendU(WILDFIRE_INTERPS.gr2, 'ROS (ch/h)', showAllRings, '.2'));

    legendElem
      .append('g')
      .attr('transform', `translate(${xPos},${yPos + 20})`)
      .append('g')
      .attr('class', 'vsup-legend-v')
      .call(hexLegendV(WILDFIRE_INTERPS.gr2, true));

    (xPos = 750), (yPos = height - 120);

    legendElem
      .append('g')
      .attr('transform', `translate(${xPos},${yPos})`)
      .append('g')
      .attr('class', 'vsup-legend-u')
      .call(
        iconhexLegendU(
          WILDFIRE_INTERPS.personnel,
          'assets/human.png',
          'Personnel',
          '.2'
        )
      );

    legendElem
      .append('g')
      .attr('transform', `translate(${xPos},${yPos + 55})`)
      .append('g')
      .attr('class', 'vsup-legend-v')
      .call(iconhexLegendV(WILDFIRE_INTERPS.personnel, 'assets/human.png'));
  }, []);

  return (
    <>
      <svg className="legend-area" ref={legendArea}></svg>
      <div className="study-input">
        <input
          type="checkbox"
          checked={useVsup}
          onChange={() => setUseVsup((prev) => !prev)}
        />
        <span>Use VSUP</span>
        <input
          type="checkbox"
          checked={showAllRings}
          onChange={() => setShowAllRings((prev) => !prev)}
        />
        <span>Show All Rings</span>
        <input
          type="checkbox"
          checked={useElev}
          onChange={() => setUseElev((prev) => !prev)}
        />
        <span>Show Elevation</span>
      </div>
    </>
  );
}
