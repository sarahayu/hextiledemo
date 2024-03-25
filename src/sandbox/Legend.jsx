import React, { useEffect } from 'react';
import { useLayoutEffect, useRef } from 'react';

import * as d3 from 'd3';
import * as h3 from 'h3-js';
import * as vsup from 'vsup';
import { WATER_INTERPS } from 'src/utils/scales';
import {
  FORMATIONS,
  hexLegendU,
  hexagonOutline,
  hexagonShape,
  iconhexLegendU,
} from 'src/utils/utils';

export default function Legend({ res }) {
  const legendArea = useRef();
  const hexText = useRef();

  useLayoutEffect(() => {
    const height = window.innerHeight;
    const width = 800;
    const legendd3 = d3
      .select(legendArea.current)
      .attr('width', width)
      .attr('height', height);

    legendd3.append('g').call(
      vsup.legend
        .arcmapLegend()
        .vtitle('Groundwater')
        .utitle('Variance')
        .scale(WATER_INTERPS.groundwater.vsup)
        .size(150)
        .x(width - 180)
        .y(height - 470)
    );

    let xPos = width - 600,
      yPos = height - 150;

    legendd3
      .append('g')
      .attr('transform', `translate(${xPos},${yPos})`)
      .call(hexLegendU(WATER_INTERPS.difference));

    (xPos = width - 600), (yPos = height - 275);

    legendd3
      .append('g')
      .attr('transform', `translate(${xPos},${yPos})`)
      .call(iconhexLegendU(WATER_INTERPS.unmetDemand));

    legendd3
      .append('g')
      .call(
        hexagonShape(width - 100, height - 100, 70, 'rgba(146, 146, 146, 0.5)')
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
              `${Math.round(h3.getHexagonAreaAvg(res, h3.UNITS.km2))} km\u00B2`
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
