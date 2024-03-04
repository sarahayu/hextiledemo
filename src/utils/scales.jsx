import * as d3 from 'd3';
import { temporalDataHex } from 'src/utils/data';
import { saturate } from 'src/utils/utils';
import * as vsup from 'vsup';

/////////////////// extents /////////////////////////

const extentGW = [-250, 700]; /* d3.extent(
  Object.values(Object.values(temporalDataHex).slice(-1)[0]).map(
    (d) => d['GroundwaterAverage']
  )
); */

const extentDem = d3.extent(
  Object.values(Object.values(temporalDataHex).slice(-1)[0]).map(
    (d) => d['DemandBaselineAverage']
  )
);

const extentUDem = d3.extent(
  Object.values(Object.values(temporalDataHex).slice(-1)[0]).map(
    (d) => d['UnmetDemandBaselineAverage']
  )
);

const extentDemDiff = [-30, 30];

const extentDeliv = d3.extent(
  Object.values(Object.values(temporalDataHex).slice(-1)[0]).map(
    (d) => d['DemandBaselineAverage'] + d['UnmetDemandBaselineAverage']
  )
);

// TODO find actual var
const extentGWVar = [0, 10000];
const extentUDemVar = [0, 650];
const extentDemDiffVar = extentUDemVar;

/////////////////// scales /////////////////////////

const stepRes = 10;

const scaleStepGW = d3
  .scaleQuantize()
  .domain(extentGW)
  .range(d3.ticks(0, 1, stepRes));
const scaleStepDem = d3
  .scaleQuantize()
  .domain(extentDem)
  .range(d3.ticks(0, 1, stepRes));
const scaleStepUDem = d3
  .scaleQuantize()
  .domain(extentUDem)
  .range(d3.ticks(1, 0, stepRes));
const scaleStepDemDiff = d3
  .scaleQuantize()
  .domain(extentDemDiff)
  .range(d3.ticks(0, 1, stepRes));

const scaleContGW = d3.scaleLinear().domain(extentGW).range([0, 1]).clamp(true);
const scaleContDem = d3
  .scaleLinear()
  .domain(extentDem)
  .range([0, 1])
  .clamp(true);
export const scaleContUDem = d3
  .scaleLinear()
  .domain(extentUDem)
  .range([1, 0])
  .clamp(true);
export const scaleContDemDiff = d3
  .scaleLinear()
  .domain(extentDemDiff)
  .range([0, 1])
  .clamp(true);

// TODO find unmet demand variance
export const scaleContUDemVar = d3
  .scaleLinear()
  .domain(extentUDemVar)
  .range([1, 0])
  .clamp(true);

export const scaleStepUDemVar = d3
  .scaleQuantize()
  .domain(extentUDemVar)
  .range(d3.ticks(1, 0, stepRes));

export const scaleContGWVar = d3
  .scaleLinear()
  .domain(extentGWVar)
  .range([0, 0.5])
  .clamp(true);

export const scaleContDemDiffVar = d3
  .scaleLinear()
  .domain(extentDemDiffVar)
  .range([0, 1])
  .clamp(true);

/////////////////// color scales /////////////////////////

const d3Scale = (d) =>
  d3.scaleLinear().domain(d3.ticks(0, 1, d.length)).range(d);
// .interpolate(d3.interpolateLab);

// https://observablehq.com/@recifs/invert-a-color-scale-42
const withInvert = (color) => {
  color.invert = (c) => {
    c = d3.color(c);
    return d3.least(color.ticks(256), (d) => distance(c, color(d)));
  };
  return color;
};

const colorScaleGW = saturate(d3.interpolateBlues, 1, -1);
const colorScaleDem = saturate(d3.interpolateOranges, 1, 1);
const colorScaleUDem = saturate(d3.interpolateOranges, 0, 2);
const colorScaleDemDiff = saturate(d3.interpolateRdYlGn, 0, 0);

/////////////////// color interpolators /////////////////////////

const noneIfSuperSmall = (val, zeroVal = 0) =>
  Math.abs(val - zeroVal) < 1 / stepRes ? 0 : 1;

export const colorInterpGW = (val, useAlpha = false, useStep = false) => [
  ...colorScaleGW(useStep ? scaleStepGW(val) : scaleContGW(val))
    .replace(/[^\d,]/g, '')
    .split(',')
    .map((d) => Number(d)),
  (useAlpha ? noneIfSuperSmall(scaleStepGW(val)) : 1) * 255,
];

export const colorInterpDem = (val, useAlpha = false, useStep = false) => [
  ...colorScaleDem(useStep ? scaleStepDem(val) : scaleContDem(val))
    .replace(/[^\d,]/g, '')
    .split(',')
    .map((d) => Number(d)),
  (useAlpha ? noneIfSuperSmall(scaleStepDem(val)) : 1) * 255,
];

export const colorInterpUDem = (val, useAlpha = false, useStep = false) => [
  ...colorScaleUDem(useStep ? scaleStepUDem(val) : scaleContUDem(val))
    .replace(/[^\d,]/g, '')
    .split(',')
    .map((d) => Number(d)),
  (useAlpha ? noneIfSuperSmall(scaleStepUDem(val)) : 1) * 255,
];

export const colorInterpDemDiff = (val, useAlpha = false, useStep = false) => [
  ...vsup
    .scale()
    .quantize(
      vsup
        .quantization()
        .branching(2)
        .layers(4)
        .valueDomain(extentDemDiff)
        .uncertaintyDomain(extentDemDiffVar)
    )
    .range(colorScaleDemDiff)(val, 0)
    .replace(/[^\d,]/g, '')
    .split(',')
    .map((d) => Number(d)),
  (useAlpha ? noneIfSuperSmall(scaleStepDemDiff(val), 0.5) : 1) * 255,
];

// TODO factor in steps?
export const colorInterpVsupGW = (d, u, useAlpha = false, useStep = false) => [
  ...vsup
    .scale()
    .quantize(
      vsup
        .quantization()
        .branching(2)
        .layers(4)
        .valueDomain(extentGW)
        .uncertaintyDomain(/* extentGWVar */ [0, 1])
    )
    .range(colorScaleGW)(d, /* u */ scaleContGWVar(u))
    .replace(/[^\d,]/g, '')
    .split(',')
    .map((d) => Number(d)),
  (useAlpha ? noneIfSuperSmall(scaleStepGW(d)) : 1) * 255,
];

export const colorInterpVsupUDem = (
  d,
  u,
  useAlpha = false,
  useStep = false
) => [
  ...vsup
    .scale()
    .quantize(
      vsup
        .quantization()
        .branching(2)
        .layers(4)
        .valueDomain(extentUDem)
        .uncertaintyDomain(extentUDemVar)
    )
    .range(colorScaleUDem)(d, u)
    .replace(/[^\d,]/g, '')
    .split(',')
    .map((d) => Number(d)),
  (useAlpha ? noneIfSuperSmall(scaleStepUDem(d)) : 1) * 255,
];

export const colorInterpVsupDemDiff = (
  d,
  u,
  useAlpha = false,
  useStep = false
) => [
  ...vsup
    .scale()
    .quantize(
      vsup
        .quantization()
        .branching(2)
        .layers(4)
        .valueDomain(extentDemDiff)
        .uncertaintyDomain(extentDemDiffVar)
    )
    .range(colorScaleDemDiff)(d, u)
    .replace(/[^\d,]/g, '')
    .split(',')
    .map((d) => Number(d)),
  (useAlpha ? noneIfSuperSmall(scaleStepDemDiff(d), 0.5) : 1) * 255,
];

export const colorInterpOwner = (val) =>
  d3
    .interpolateReds(scaleStepDem(val))
    .replace(/[^\d,]/g, '')
    .split(',')
    .map((d) => Number(d));

// TODO move color ranges to color scale area
export const colorInterpStepUDemAvgAlpha = (val) => [
  ...saturate({
    col: d3
      .interpolateReds(scaleStepUDem(val))
      .replace(/[^\d,]/g, '')
      .split(',')
      .map((d) => Number(d)),
    saturation: 1,
  }),
  scaleStepUDem(val) < 1 / stepRes ? 0 : 255,
];

export const colorInterpStepDemAvg = (val) =>
  saturate({
    col: d3
      .interpolateGreens(scaleStepDem(val))
      .replace(/[^\d,]/g, '')
      .split(',')
      .map((d) => Number(d)),
    saturation: 1,
    // brightness: 1.3,
  });

export const colorInterpContDemDiffAlpha = (val) => [
  ...saturate({
    col: d3
      .interpolateGreys(scaleContDemDiff(val))
      .replace(/[^\d,]/g, '')
      .split(',')
      .map((d) => Number(d)),
    saturation: 1,
    // brightness: 1.3,
  }),
  scaleContDemDiff(val) < 1 / stepRes ? 0 : 255,
];

/////////////////// plain value interpolators /////////////////////////

export const valueInterpUDem = d3
  .scaleLinear()
  .domain([-150, 0])
  .range([1, 0])
  .clamp(true);

export const valueInterpDem = d3
  .scaleLinear()
  .domain([0, 150])
  .range([0, 1])
  .clamp(true);

/////////////////// other interpolators /////////////////////////

export const heightInterpUDem = (val) =>
  d3.scaleLinear([100, 4090])(scaleContUDem(val));

export const valueInterpResolution = d3
  .scaleLinear()
  .domain([7, 12])
  .range([0, 1])
  .clamp(true);

export const dateInterpIdx = d3
  .scaleTime()
  .domain([new Date('10/31/1921'), new Date('9/30/2021')])
  .range([0, 1199]).invert;

/////////////////// color constants /////////////////////////

export const colorGW = colorInterpGW(scaleStepGW.invertExtent(0.5)[0]);

export const colorDemDiff = colorInterpContDemDiffAlpha(
  scaleContDemDiff.invert(0.5)
);

export const colorDemDiffHigh = colorInterpDemDiff(
  scaleStepDemDiff.invertExtent(
    d3.scaleQuantize().domain([0, 1]).range(scaleStepDemDiff.range())(0.75)
  )[0]
);

export const colorDemDiffLow = colorInterpDemDiff(
  scaleStepDemDiff.invertExtent(
    d3.scaleQuantize().domain([0, 1]).range(scaleStepDemDiff.range())(0.25)
  )[1]
);

export const colorUDemAvg = colorInterpStepUDemAvgAlpha(
  scaleStepUDem.invertExtent(0.5)[0]
);

export const colorDemAvg = colorInterpStepDemAvg(
  scaleStepDem.invertExtent(0.5)[0]
);

/////////////////// end document /////////////////////////
