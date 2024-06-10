import * as d3 from 'd3';

/////////////////// other interpolators /////////////////////////

export const valueInterpResolution = d3
  .scaleLinear()
  .domain([9, 14])
  .range([0, 1])
  .clamp(true);

export const dateInterpIdx = d3
  .scaleTime()
  .domain([new Date('10/31/1921'), new Date('9/30/2021')])
  .range([0, 1199]).invert;
