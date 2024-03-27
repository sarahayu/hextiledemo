import React from 'react';
import { useRef, useState } from 'react';

import DeckGL from '@deck.gl/react';
import * as d3 from 'd3';
import * as h3 from 'h3-js';
import maplibregl from 'maplibre-gl';
import { Map } from 'react-map-gl';
import mapStyle from 'src/assets/style.json';
import { LIGHTING } from 'src/utils/settings';

import {
  electionDataHex as data,
  electionPrecinctGeo as dataDeag,
} from 'src/utils/data';

import useGUI from './useGUI';
import useHexTooltip from './useHexTooltip';

import useHexMouseEvts from 'src/sandbox/useHexMouseEvts';
import BaseTerrainLayer from './BaseTerrainLayer';
import MultivariableHextileLayer from './MultivariableHextileLayer';

import { useEffect, useLayoutEffect } from 'react';

import * as vsup from 'vsup';

import { ELECTION_INTERPS } from 'src/utils/scales';
import {
  arcmapLegendPretty,
  hexLegendU,
  hexLegendV,
  hexagonShape,
  iconhexLegendU,
  iconhexLegendV,
} from 'src/utils/utils';

export default function Election2020() {
  const { current: resRange } = useRef(
    Object.keys(data).map((d) => parseInt(d))
  );
  const [zoom, setZoom] = useState(5);
  const [useVsup, setUseVsup] = useState(false);
  const [showAllRings, setShowAllRings] = useState(false);

  const curInput = useGUI();
  const hexMouseEvts = useHexMouseEvts({
    disabled: curInput.curOption > 1,
    dataDeag,
    deagKey: 'PrecinctRgs',
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
        initialViewState={{
          longitude: -97.7431,
          latitude: 30.2672,
          zoom: 5,
          minZoom: 3,
          maxZoom: 10,
          pitch: 50.85,
          bearing: 32.58,
        }}
        onViewStateChange={({ viewState }) => {
          setZoom(viewState.zoom);
        }}
        getTooltip={getTooltip}
      >
        <Map
          reuseMaps
          preventStyleDiffing
          mapLib={maplibregl}
          mapStyle={mapStyle}
        />
        <BaseTerrainLayer id="slide-terrain" {...curState} />
        <MultivariableHextileLayer
          id="slide-election"
          {...curState}
          zoomRange={[5, 7]}
          visible={curInput.curOption == 1}
          useVsup={useVsup}
          showAllRings={showAllRings}
        />
      </DeckGL>
      <GUI
        res={d3.scaleQuantize().domain([0, 1]).range(resRange)(
          d3.scaleLinear().domain([5, 7]).range([0, 1]).clamp(true)(zoom)
        )}
        useVsup={useVsup}
        setUseVsup={setUseVsup}
        showAllRings={showAllRings}
        setShowAllRings={setShowAllRings}
      />
    </>
  );
}

function GUI({ res, useVsup, setUseVsup, showAllRings, setShowAllRings }) {
  const legendArea = useRef();
  const hexText = useRef();

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
      .call(hexLegendU(ELECTION_INTERPS.poc, '% PoC', showAllRings));
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
          .vtitle('% Dem. Lead')
          .utitle('Variance')
          .scale(ELECTION_INTERPS.party.vsup)
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
          .title('% Dem. Lead')
          .size(250)
          .height(20)
          .scale(ELECTION_INTERPS.party.colorsStepped)
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
      .call(hexLegendU(ELECTION_INTERPS.poc, '% PoC', showAllRings));

    legendElem
      .append('g')
      .attr('transform', `translate(${xPos},${yPos + 20})`)
      .append('g')
      .attr('class', 'vsup-legend-v')
      .call(hexLegendV(ELECTION_INTERPS.poc));

    (xPos = 750), (yPos = height - 120);

    legendElem
      .append('g')
      .attr('transform', `translate(${xPos},${yPos})`)
      .append('g')
      .attr('class', 'vsup-legend-u')
      .call(
        iconhexLegendU(
          ELECTION_INTERPS.population,
          'assets/human.png',
          'Pop. / Km2'
        )
      );

    legendElem
      .append('g')
      .attr('transform', `translate(${xPos},${yPos + 55})`)
      .append('g')
      .attr('class', 'vsup-legend-v')
      .call(iconhexLegendV(ELECTION_INTERPS.population, 'assets/human.png'));

    legendElem
      .append('g')
      .attr('transform', `translate(${width - 60},${height - 80})`)
      .call(hexagonShape(0, 0, 50, 'rgba(146, 146, 146, 0.5)'))
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
  }, []);

  useEffect(() => {
    let [areaText, sideText] = hexText.current;
    areaText.text(
      `${d3.format('.2s')(h3.getHexagonAreaAvg(res, h3.UNITS.km2))} km\u00B2`
    );
    sideText.text(
      `\u2190 ${d3.format('.2s')(
        h3.getHexagonEdgeLengthAvg(res, h3.UNITS.km)
      )} km \u2192;`
    );
  }, [res]);

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
      </div>
    </>
  );
}
