import React from 'react';
import { useLayoutEffect, useRef } from 'react';

import * as d3 from 'd3';
import * as vsup from 'vsup';
import { WATER_INTERPS } from 'src/utils/scales';

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
            .arcmapLegend()
            .vtitle('Groundwater')
            .utitle('Variance')
            .scale(WATER_INTERPS.groundwater.vsup)
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
            .scale(WATER_INTERPS.difference.colorsStepped)
            .x(width - 280)
            .y(height - 100)
        );
      });
  }, []);

  return <svg className="legend-area" ref={legendArea}></svg>;
}
