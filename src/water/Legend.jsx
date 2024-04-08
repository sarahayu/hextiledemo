import React, { useEffect } from 'react';
import { useLayoutEffect, useRef } from 'react';

import * as d3 from 'd3';
import * as h3 from 'h3-js';
import * as vsup from 'vsup';
import { WATER_INTERPS } from 'src/utils/scales';
import {
  FORMATIONS,
  arcmapLegendPretty,
  hexLegendU,
  hexLegendV,
  hexagonOutline,
  hexagonShape,
  iconhexLegendU,
  iconhexLegendV,
} from 'src/utils/utils';

export default function Legend({
  res,
  useVsup,
  setUseVsup,
  showAllRings,
  setShowAllRings,
}) {
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
      .call(
        hexLegendU(
          WATER_INTERPS.difference,
          'Diff. w/ BL (600 TAF/km2)',
          showAllRings
        )
      );
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
          .vtitle('GW (ft)')
          .utitle('Variance')
          .scale(WATER_INTERPS.groundwater.vsup)
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
          .title('GW (ft)')
          .size(250)
          .height(20)
          .scale(WATER_INTERPS.groundwater.colorsStepped)
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
      .call(
        hexLegendU(
          WATER_INTERPS.difference,
          'Diff. w/ BL (600 TAF/km2)',
          showAllRings
        )
      );

    legendElem
      .append('g')
      .attr('transform', `translate(${xPos},${yPos + 20})`)
      .append('g')
      .attr('class', 'vsup-legend-v')
      .call(hexLegendV(WATER_INTERPS.difference));

    (xPos = 750), (yPos = height - 120);

    legendElem
      .append('g')
      .attr('transform', `translate(${xPos},${yPos})`)
      .append('g')
      .attr('class', 'vsup-legend-u')
      .call(
        iconhexLegendU(
          WATER_INTERPS.unmetDemandPositive,
          'assets/drop.png',
          'Scenario Unmet (600 TAF/km2)'
        )
      );

    legendElem
      .append('g')
      .attr('transform', `translate(${xPos},${yPos + 55})`)
      .append('g')
      .attr('class', 'vsup-legend-v')
      .call(
        iconhexLegendV(WATER_INTERPS.unmetDemandPositive, 'assets/drop.png')
      );

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
