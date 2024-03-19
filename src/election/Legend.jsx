import React from 'react';
import { useLayoutEffect, useRef } from 'react';

import * as d3 from 'd3';
import * as vsup from 'vsup';
import {
  COUNTY_INTERPS,
  PRECINCT_INTERPS,
  WATER_INTERPS,
} from 'src/utils/scales';

export default function Legend({}) {
  const legendArea = useRef();

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
            .title('Democrat Lead')
            .size(250)
            .height(20)
            .scale(PRECINCT_INTERPS.party.colorsStepped)
            .x(width - 280)
            .y(height - 150)
        );
      })
      .call(function (a) {
        a.append('g').call(
          vsup.legend
            .simpleLegend()
            .title('Percent White')
            .size(250)
            .height(20)
            .scale(COUNTY_INTERPS.white.colorsStepped)
            .x(width - 280)
            .y(height - 100)
        );
      });
  }, []);

  return <svg className="legend-area" ref={legendArea}></svg>;
}
