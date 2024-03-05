import * as d3 from 'd3';
import { temporalDataHex } from 'src/utils/data';
import { percentile, saturate } from 'src/utils/utils';
import * as vsup from 'vsup';

/////////////////// extents /////////////////////////

const extentGW = [-300, 700]; /*  [
  0,
  d3.quantile(
    Object.values(Object.values(temporalDataHex).slice(-1)[0]).map(
      (d) => d['Groundwater'][0]
    ),
    0.75
  ),
]; */ /* percentile(
  d3.extent(
    Object.values(Object.values(temporalDataHex).slice(-1)[0]).map(
      (d) => d['Groundwater'][0]
    )
  ),
  0.95
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

// TODO find actual var?
const extentGWVar = [
  0,
  d3.quantile(
    Object.values(Object.values(temporalDataHex).slice(-1)[0]).map(
      (d) => d['GroundwaterVar'][0]
    ),
    1
  ),
]; /* d3.extent(
  Object.values(Object.values(temporalDataHex).slice(-1)[0]).map(
    (d) => d['GroundwaterVar'][0]
  )
); */
const extentUDemVar = [0, 650];
const extentDemDiffVar = extentUDemVar;

/////////////////// scales /////////////////////////

const stepRes = 10;

const scaleContGW = d3
  .scaleLinear()
  .domain(extentGW)
  .range([0.5, 1])
  .clamp(true);
const scaleStepGW = d3
  .scaleQuantize()
  .domain(extentGW)
  .range(d3.ticks(0, 1, stepRes));
const scaleContDem = d3
  .scaleLinear()
  .domain(extentDem)
  .range([0, 1])
  .clamp(true);
const scaleStepDem = d3
  .scaleQuantize()
  .domain(extentDem)
  .range(d3.ticks(0, 1, stepRes));
export const scaleContUDem = d3
  .scaleLinear()
  .domain(extentUDem)
  .range([1, 0])
  .clamp(true);
const scaleStepUDem = d3
  .scaleQuantize()
  .domain(extentUDem)
  .range(d3.ticks(1, 0, stepRes));
export const scaleContDemDiff = d3
  .scaleLinear()
  .domain(extentDemDiff)
  .range([0, 1])
  .clamp(true);
const scaleStepDemDiff = d3
  .scaleQuantize()
  .domain(extentDemDiff)
  .range(d3.ticks(0, 1, stepRes));

// TODO find variances
export const scaleContGWVar = d3
  .scaleLinear()
  .domain(extentGWVar)
  .range([0, 0.5])
  .clamp(true);
export const scaleContUDemVar = d3
  .scaleLinear()
  .domain(extentUDemVar)
  .range([0.9, 0.4])
  .clamp(true);
export const scaleStepGWVar = d3
  .scaleQuantize()
  .domain(extentGWVar)
  .range(d3.ticks(0.9, 0.4, stepRes));
export const scaleStepUDemVar = d3
  .scaleQuantize()
  .domain(extentUDemVar)
  .range(d3.ticks(0.9, 0.4, stepRes));
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

const colorScaleGW = saturate(
  (d) => d3.interpolateBlues(d3.scaleLinear([0.75, 1.0])(d)),
  -0.5,
  0.5
);
const colorScaleDem = saturate(d3.interpolateOranges, 1, 1);
const colorScaleUDem = saturate(d3.interpolateOranges, 0, 2);
const colorScaleDemDiff = saturate(d3.interpolateRdYlGn, 0, 0);
const colorScaleUDemVar = saturate(d3.interpolateBlues, 0, 0);

// normalized color scales to use for legends
export const colorScaleGWNorm = d3
  .scaleQuantize()
  .domain(extentGW)
  .range(d3.quantize(colorScaleGW, stepRes));
export const colorScaleDemNorm = d3
  .scaleQuantize()
  .domain(extentDem)
  .range(d3.quantize(colorScaleDem, stepRes));
export const colorScaleUDemNorm = d3
  .scaleQuantize()
  .domain(extentUDem)
  .range(d3.quantize(colorScaleUDem, stepRes).reverse());
export const colorScaleDemDiffNorm = d3
  .scaleQuantize()
  .domain(extentDemDiff)
  .range(d3.quantize(colorScaleDemDiff, stepRes));
export const colorScaleUDemVarNorm = d3
  .scaleQuantize()
  .domain(extentUDemVar)
  .range(d3.quantize(colorScaleUDemVar, stepRes).reverse());

// vsup color scales
export const colorScaleVsupGW = vsup
  .scale()
  .quantize(
    linearTreeQuantization()
      .branching(2)
      .layers(4)
      .valueDomain(extentGW)
      .uncertaintyDomain(extentGWVar)
  )
  .range(colorScaleGW);
export const colorScaleVsupUDem = vsup
  .scale()
  .quantize(
    linearTreeQuantization()
      .branching(2)
      .layers(4)
      .valueDomain(extentUDem)
      .uncertaintyDomain(extentUDemVar)
  )
  .range(colorScaleUDem);
export const colorScaleVsupDemDiff = vsup
  .scale()
  .quantize(
    linearTreeQuantization()
      .branching(2)
      .layers(4)
      .valueDomain(extentDemDiff)
      .uncertaintyDomain(extentDemDiffVar)
  )
  .range(colorScaleDemDiff);

/////////////////// color interpolators /////////////////////////

// TODO factor in steps?

const noneIfSuperSmall = (val, zeroVal = 0) =>
  Math.abs(val - zeroVal) < 1 / stepRes ? 0 : 1;

export const colorInterpGW = (val, useAlpha = false, useStep = false) => [
  ...colorScaleGWNorm(val)
    .replace(/[^\d,]/g, '')
    .split(',')
    .map((d) => Number(d)),
  (useAlpha ? noneIfSuperSmall(scaleStepGW(val)) : 1) * 255,
];

export const colorInterpDem = (val, useAlpha = false, useStep = false) => [
  ...colorScaleDemNorm(val)
    .replace(/[^\d,]/g, '')
    .split(',')
    .map((d) => Number(d)),
  (useAlpha ? noneIfSuperSmall(scaleStepDem(val)) : 1) * 255,
];

export const colorInterpUDem = (val, useAlpha = false, useStep = false) => [
  ...colorScaleUDemNorm(val)
    .replace(/[^\d,]/g, '')
    .split(',')
    .map((d) => Number(d)),
  (useAlpha ? noneIfSuperSmall(scaleStepUDem(val)) : 1) * 255,
];

export const colorInterpDemDiff = (val, useAlpha = false, useStep = false) => [
  ...colorScaleDemDiffNorm(val)
    .replace(/[^\d,]/g, '')
    .split(',')
    .map((d) => Number(d)),
  (useAlpha ? noneIfSuperSmall(scaleStepDemDiff(val), 0.5) : 1) * 255,
];

export const colorInterpUDemVar = (val, useAlpha = false, useStep = false) => [
  ...colorScaleUDemVarNorm(val)
    .replace(/[^\d,]/g, '')
    .split(',')
    .map((d) => Number(d)),
  (useAlpha ? noneIfSuperSmall(scaleStepUDemVar(val)) : 1) * 255,
];

export const colorInterpVsupGW = (d, u, useAlpha = false, useStep = false) => [
  ...colorScaleVsupGW(d, u)
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
  ...colorScaleVsupUDem(d, u)
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
  ...colorScaleVsupDemDiff(d, u)
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

const epsilon = 1e-9;

function linearTreeQuantization(branchingFactor, treeLayers) {
  let branch = branchingFactor || 2;
  let layers = treeLayers || 2;
  const uscale = d3.scaleLinear();
  const vscale = d3.scaleLinear();
  let tree = makeTree();

  function quantization(value, uncertainty) {
    var u = uncertainty != undefined ? uncertainty : value.u;
    var v = uncertainty != undefined ? value : value.v;
    let i = 0;

    // find the right layer of the tree, based on uncertainty
    while (i < tree.length - 1 && uscale(u) < 1 - (i + 1) / layers - epsilon) {
      i++;
    }

    // find right leaf of tree, based on value
    const vgap = tree[i].length > 1 ? (tree[i][1].v - tree[i][0].v) / 2 : 0;

    let j = 0;

    while (j < tree[i].length - 1 && v > tree[i][j].v + vgap) {
      j++;
    }

    return tree[i][j];
  }

  function makeTree() {
    // Our tree should be "squarish" - it should have about
    // as many layers as leaves.
    const tree = [];

    let n;

    // let oldDomain = vscale.domain();
    // vscale.domain([oldDomain[0] + (oldDomain[0] - oldDomain[1]), oldDomain[1]]);
    vscale.nice(Math.pow(branch, layers - 1));
    uscale.nice(layers);

    tree[0] = [];
    tree[0].push({
      u: uscale.invert((layers - 1) / layers),
      v: vscale.invert(0.5),
    });

    for (let i = 1; i < layers; i++) {
      tree[i] = [];
      n = 2 * Math.pow(branch, i);
      for (let j = 1; j < n; j += 2) {
        tree[i].push({
          u: uscale.invert(1 - (i + 1) / layers),
          v: vscale.invert(j / n),
        });
      }
    }
    return tree;
  }

  quantization.range = () => [].concat.apply([], tree);

  quantization.tree = () => tree;

  quantization.data = quantization.tree;

  quantization.branching = function (newbranch) {
    if (!arguments.length) {
      return branch;
    } else {
      branch = Math.max(1, newbranch);
      tree = makeTree();
      return quantization;
    }
  };

  quantization.layers = function (newlayers) {
    if (!arguments.length) {
      return layers;
    } else {
      layers = Math.max(1, newlayers);
      tree = makeTree();
      return quantization;
    }
  };

  quantization.uncertaintyDomain = function (uDom) {
    if (!arguments.length) {
      return uscale.domain();
    } else {
      uscale.domain(uDom);
      tree = makeTree();
      return quantization;
    }
  };

  quantization.valueDomain = function (vDom) {
    if (!arguments.length) {
      return vscale.domain();
    } else {
      vscale.domain(vDom);
      tree = makeTree();
      return quantization;
    }
  };

  return quantization;
}
