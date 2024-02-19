import * as d3 from 'd3';
import { temporalDataHex } from 'src/utils/data';
import { saturate } from 'src/utils/utils';

const stepRes = 10;

const a = d3
  .scaleQuantize()
  .domain(
    d3.extent(
      Object.values(Object.values(temporalDataHex).slice(-1)[0]).map(
        (d) => d['UnmetDemandBaselineAverage']
      )
    )
  )
  .range(d3.range(1, -0.001, -1 / stepRes));
// .clamp(true);

const b = d3
  .scaleQuantize()
  .domain(
    d3.extent(
      Object.values(Object.values(temporalDataHex).slice(-1)[0]).map(
        (d) => d['DemandBaselineAverage']
      )
    )
  )
  .range(d3.range(0, 1.001, 1 / stepRes));
// .clamp(true);

const c = d3
  .scaleLinear()
  .domain(
    d3.extent(
      Object.values(Object.values(temporalDataHex).slice(-1)[0]).map(
        (d) => d['DemandBaselineAverage'] + d['UnmetDemandBaselineAverage']
      )
    )
  )
  .range([0, 1])
  .clamp(true);

const g = d3
  .scaleQuantize()
  .domain([-250, 700])
  .range(d3.range(0, 1.001, 1 / stepRes));
const p = d3
  .scaleQuantize()
  .domain([-30, 30])
  .range(d3.range(0, 1.001, 1 / stepRes));

export const colorInterpGW = (val) =>
  saturate({
    col: d3
      .interpolateBlues(g(val))
      .replace(/[^\d,]/g, '')
      .split(',')
      .map((d) => Number(d)),
    saturation: 1.5,
    // brightness: 1.3,
  });

export const colorInterpDifference = (val) => [
  ...saturate({
    col: d3
      .interpolatePRGn(p(val))
      .replace(/[^\d,]/g, '')
      .split(',')
      .map((d) => Number(d)),
    saturation: 1,
    // brightness: 1.3,
  }),
  Math.abs(p(val) - 0.5) < 1 / stepRes ? 0 : 255,
];

export const valueInterpUnmet = d3
  .scaleLinear()
  .domain([-150, 0])
  .range([1, 0])
  .clamp(true);

export const valueInterpDemand = d3
  .scaleLinear()
  .domain([0, 150])
  .range([0, 1])
  .clamp(true);

const w = d3
  .scaleQuantize()
  .domain([-150, 0])
  .range(d3.range(1, -0.001, -1 / stepRes));

const ww = d3.scaleLinear().domain([-150, 0]).range([1, 0]);

const x = d3
  .scaleQuantize()
  .domain([0, 150])
  .range(d3.range(0, 1.001, 1 / stepRes));

export const colorInterpUnmet = (val) => [
  ...saturate({
    col: d3
      .interpolateOranges(w(val))
      .replace(/[^\d,]/g, '')
      .split(',')
      .map((d) => Number(d)),
    saturation: 2,
  }),
  w(val) < 1 / stepRes ? 0 : 255,
];

const q = d3.scaleLinear().domain([-150, 0]).range([1, 0]);

export const colorInterpUnmetCont = (val) => [
  ...saturate({
    col: d3
      .interpolateOranges(q(val))
      .replace(/[^\d,]/g, '')
      .split(',')
      .map((d) => Number(d)),
    saturation: 2,
  }),
  255,
];

export const heightInterpUnmet = (val) => d3.scaleLinear([100, 4090])(ww(val));

export const colorInterpDemand = (val) => [
  ...saturate({
    col: d3
      .interpolateOranges(x(val))
      .replace(/[^\d,]/g, '')
      .split(',')
      .map((d) => Number(d)),
    saturation: 2,
    // brightness: 1.3,
  }),
  x(val) < 1 / stepRes ? 0 : 255,
];

export const dateInterpIdx = d3
  .scaleTime()
  .domain([new Date('10/31/1921'), new Date('9/30/2021')])
  .range([0, 1199]).invert;

export const resScale = d3
  .scaleLinear()
  .domain([7, 12])
  .range([0, 1])
  .clamp(true);

export const colorInterpUnmetAverage = (val) => [
  ...saturate({
    col: d3
      .interpolateReds(a(val))
      .replace(/[^\d,]/g, '')
      .split(',')
      .map((d) => Number(d)),
    saturation: 1,
  }),
  a(val) < 1 / stepRes ? 0 : 255,
];

export const colorInterpDemandAverage = (val) =>
  saturate({
    col: d3
      .interpolateGreens(b(val))
      .replace(/[^\d,]/g, '')
      .split(',')
      .map((d) => Number(d)),
    saturation: 1,
    // brightness: 1.3,
  });

export const colorInterpDiffDemand = (val) => [
  ...saturate({
    col: d3
      .interpolateGreys(c(val))
      .replace(/[^\d,]/g, '')
      .split(',')
      .map((d) => Number(d)),
    saturation: 1,
    // brightness: 1.3,
  }),
  c(val) < 1 / stepRes ? 0 : 255,
];

export const colorUnmetAverage = colorInterpUnmetAverage(
  a.invertExtent(0.5)[0]
);
export const colorDemandAverage = saturate({
  col: colorInterpDemandAverage(b.invertExtent(0.5)[0]),
});
export const colorDiffDemand = colorInterpDiffDemand(c.invert(0.5));

export const colorGW = saturate({ col: colorInterpGW(g.invertExtent(0.5)[0]) });

export const colorDiffHigh = colorInterpDifference(
  p.invertExtent(d3.scaleQuantize().domain([0, 1]).range(p.range())(0.75))[0]
);
export const colorDiffLow = colorInterpDifference(
  p.invertExtent(d3.scaleQuantize().domain([0, 1]).range(p.range())(0.25))[1]
);

export const getMIVal = d3
  .scaleQuantize()
  .domain([0, 650])
  .range(d3.range(1, 0.001, -1 / stepRes));
