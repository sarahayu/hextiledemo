import * as d3 from 'd3';
import * as vsup from 'vsup';
import { HOLDERS } from './settings';

function RGBtoHSV(color) {
  let r, g, b, h, s, v;
  r = color[0];
  g = color[1];
  b = color[2];
  let minn = Math.min(r, g, b);
  let maxx = Math.max(r, g, b);

  v = maxx;
  let delta = maxx - minn;
  if (maxx != 0) s = delta / maxx; // s
  else {
    // r = g = b = 0        // s = 0, v is undefined
    s = 0;
    h = -1;
    v = 0;
    return [h, s, v];
  }
  if (r === maxx) h = (g - b) / delta; // between yellow & magenta
  else if (g === maxx) h = 2 + (b - r) / delta; // between cyan & yellow
  else h = 4 + (r - g) / delta; // between magenta & cyan
  h *= 60; // degrees
  if (h < 0) h += 360;
  if (isNaN(h)) h = 0;
  return [h, s, v];
}

function HSVtoRGB(color) {
  let i;
  let h, s, v, r, g, b;
  h = color[0];
  s = color[1];
  v = color[2];
  if (s === 0) {
    // achromatic (grey)
    r = g = b = v;
    return [r, g, b];
  }
  h /= 60; // sector 0 to 5
  i = Math.floor(h);
  let f = h - i; // factorial part of h
  let p = v * (1 - s);
  let q = v * (1 - s * f);
  let t = v * (1 - s * (1 - f));
  switch (i) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    default: // case 5:
      r = v;
      g = p;
      b = q;
      break;
  }
  return [r, g, b];
}

export function percentile(arr, p = 0.95) {
  return [d3.quantile(arr, (1 - p) / 2), d3.quantile(arr, 1 - (1 - p) / 2)];
}

export function indepVariance(v1, v2) {
  return v1 + v2;
}

export function saturate(color, k = 1, m = 1) {
  if (typeof color == 'function') return (d) => saturate(color(d), k, m);
  if (Array.isArray(color)) color = d3.rgb(...color).toString();
  const { l, c, h } = d3.lch(color);
  return d3.lch(l + 18 * m, c + 18 * k, h).toString();
}

export function dataFilter(data, cond, excludeRes) {
  let newData = {};
  if (!excludeRes) excludeRes = [];

  Object.keys(data).forEach((res) => {
    if (excludeRes.includes(res)) return;
    let hexes = data[res];
    let newHexes = {};
    Object.keys(hexes).forEach((hexId) => {
      if (cond(hexes[hexId])) newHexes[hexId] = hexes[hexId];
    });
    newData[res] = newHexes;
  });
  return newData;
}

export function flatten(arr) {
  return [].concat.apply([], arr);
}

export function extent2D(arrOfArr) {
  return d3.extent(flatten(arrOfArr.map((arr) => d3.extent(arr))));
}

// https://stackoverflow.com/a/34890276
export function arrGroupBy(xs, key) {
  return xs.reduce(function (rv, x) {
    rv[key(x)] = x;
    return rv;
  }, {});
}

export const isGeo = (o) => !!(o.properties || {}).DU_ID;
export const isHex = (o) => !isGeo(o);

export const formatMonthYear = (date) => {
  return (
    date.toLocaleString('default', {
      month: 'long',
    }) +
    ' ' +
    date.toLocaleString('default', { year: 'numeric' })
  );
};

export const getHolderStr = (object) =>
  HOLDERS[
    object.properties.LandUse.constructor === Array
      ? object.properties.LandUse[0]
      : object.properties.LandUse
  ];

export const rgbStrToArr = (s) =>
  s
    .replace(/[^\d,]/g, '')
    .split(',')
    .map((d) => Number(d));

const NUM_STEPS = 10;

const noneIfSuperSmall = (val, zeroVal = 0) =>
  Math.abs(val - zeroVal) < 1 / NUM_STEPS ? 0 : 1;

export const createScales = (dataSettings, hexData) => {
  const scaleNames = Object.keys(dataSettings);

  for (const name of scaleNames) {
    const curScaleObj = dataSettings[name];

    const rangeValue = curScaleObj['value']['range'] || [0, 1];
    const rangeVariance = curScaleObj['variance']['range'] || [1, 0];
    const colorsValue = curScaleObj['value']['color'] || d3.interpolateReds;
    const colorsVariance =
      curScaleObj['variance']['color'] || d3.interpolateReds;

    if (typeof curScaleObj['value']['domain'] === 'function') {
      // get highest resolution hexes
      const highestResHexes = Object.values(hexData).slice(-1)[0];

      curScaleObj['value']['domain'] = d3.extent(
        Object.values(highestResHexes).map(curScaleObj['value']['domain'])
      );
    }

    if (typeof curScaleObj['value']['domain'] === 'string') {
      // get highest resolution hexes
      const highestResHexes = Object.values(hexData).slice(-1)[0];

      curScaleObj['value']['domain'] = d3.extent(
        Object.values(highestResHexes).map(
          (d) => d[curScaleObj['value']['domain']]
        )
      );
    }

    const scaleValue = d3
      .scaleLinear()
      .domain(curScaleObj['value']['domain'])
      .range(rangeValue);
    const scaleVariance = d3
      .scaleLinear()
      .domain(curScaleObj['variance']['domain'])
      .range(rangeVariance);

    // create step and continuous scales for value and variance
    curScaleObj['scaleLinear'] = scaleValue.copy().clamp(true);
    curScaleObj['scaleStepped'] = d3
      .scaleQuantize()
      .domain(curScaleObj['value']['domain'])
      .range(d3.ticks(rangeValue[0], rangeValue[1], NUM_STEPS));
    curScaleObj['scaleLinearVar'] = scaleVariance.copy().clamp(true);
    curScaleObj['scaleSteppedVar'] = d3
      .scaleQuantize()
      .domain(curScaleObj['variance']['domain'])
      .range(d3.ticks(rangeVariance[0], rangeVariance[1], NUM_STEPS));

    // create colorScales
    curScaleObj['colorsLinear'] = (d) => colorsValue(scaleValue(d));
    curScaleObj['colorsStepped'] = d3
      .scaleQuantize()
      .domain(curScaleObj['value']['domain'])
      .range(
        d3.quantize(
          (d) => colorsValue(d3.scaleLinear([0, 1]).range(rangeValue)(d)),
          NUM_STEPS
        )
      );
    curScaleObj['colorsLinearVar'] = (d) => colorsVariance(scaleVariance(d));
    curScaleObj['colorsSteppedVar'] = d3
      .scaleQuantize()
      .domain(curScaleObj['variance']['domain'])
      .range(
        d3.quantize(
          (d) => colorsVariance(d3.scaleLinear([0, 1]).range(rangeVariance)(d)),
          NUM_STEPS
        )
      );

    // create vsupScales
    // TODO factor in scaleValue and scaleVariance into this somehow
    curScaleObj['vsup'] = vsup
      .scale()
      .quantize(
        vsup
          .quantization()
          .branching(2)
          .layers(4)
          .valueDomain(curScaleObj['value']['domain'])
          .uncertaintyDomain(curScaleObj['variance']['domain'])
      )
      .range(colorsValue);

    // create colorInterpolators
    curScaleObj['interpColor'] = (d, useAlpha = false, useStep = true) => {
      return [
        ...rgbStrToArr(
          (useStep
            ? curScaleObj['colorsStepped']
            : curScaleObj['colorsLinear'])(d)
        ),
        ...(useAlpha
          ? [
              noneIfSuperSmall(
                curScaleObj['scaleStepped'](d),
                curScaleObj['value']['zero'] || 0
              ) * 255,
            ]
          : []),
      ];
    };
    curScaleObj['interpColorVar'] = (d, useAlpha = false, useStep = true) => [
      ...rgbStrToArr(
        (useStep
          ? curScaleObj['colorsSteppedVar']
          : curScaleObj['colorsLinearVar'])(d)
      ),
      ...(useAlpha
        ? [
            noneIfSuperSmall(
              curScaleObj['scaleSteppedVar'](d),
              curScaleObj['variance']['zero'] || 0
            ) * 255,
          ]
        : []),
    ];

    // create vsupInterpolators
    curScaleObj['interpVsup'] = (d, u, useAlpha = false) => [
      ...rgbStrToArr(curScaleObj['vsup'](d, u)),
      ...(useAlpha
        ? [
            noneIfSuperSmall(
              curScaleObj['scaleStepped'](d),
              curScaleObj['value']['zero'] || 0
            ) * 255,
          ]
        : []),
    ];
  }

  return dataSettings;
};

// prettier-ignore
export const FORMATIONS = [
    /* none         */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [0.33, 0.58, -1], [-0.33, -0.58, -1], [0.33, -0.58, -1]],
    /* dot          */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [0.33, 0.58, -1], [-0.33, -0.58, -1], [0, 0, 0]],
    /* line         */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [0.33, 0.58, -1], [0, 0.33, 0], [0, -0.33, 0]],
    /* triangle     */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [-0.33, -0.33, 0], [0.33, -0.33, 0], [0, 0.29, 0]],
    /* square       */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, -0.33, 0], [0.33, -0.33, 0], [-0.33, 0.33, 0], [0.33, 0.33, 0]],
    /* house        */[[0, 0, -1], [-0.67, 0, -1], [-0.33, -0.67, 0], [0.33, -0.67, 0], [-0.33, 0, 0], [0.33, 0, 0], [0, 0.58, 0]],
    /* rectangle    */[[0, 0, -1], [-0.33, -0.67, 0], [0.33, -0.67, 0], [-0.33, 0, 0], [0.33, 0, 0], [-0.33, 0.67, 0], [0.33, 0.67, 0],],
    /* hexagon      */[[0, 0, 0], [-0.67, 0, 0], [0.67, 0, 0], [-0.33, 0.58, 0], [0.33, 0.58, 0], [-0.33, -0.58, 0], [0.33, -0.58, 0],],
]

// prettier-ignore
export const INTERIM_FORMATIONS = [
    /* none                     */[
    /*          none            */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [0.33, 0.58, -1], [-0.33, -0.58, -1], [0.33, -0.58, -1]],
    /*          dot             */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [0.33, 0.58, -1], [-0.33, -0.58, -1], [0.33, -0.58, -1]],
    /*          line            */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [0.33, 0.58, -1], [-0.33, -0.58, -1], [0.33, -0.58, -1]],
    /*          triangle        */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [0.33, 0.58, -1], [-0.33, -0.58, -1], [0.33, -0.58, -1]],
    /*          square          */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [0.33, 0.58, -1], [-0.33, -0.58, -1], [0.33, -0.58, -1]],
    /*          house           */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [0.33, 0.58, -1], [-0.33, -0.58, -1], [0.33, -0.58, -1]],
    /*          rectangle       */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [0.33, 0.58, -1], [-0.33, -0.58, -1], [0.33, -0.58, -1]],
    /*          hexagon         */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [0.33, 0.58, -1], [-0.33, -0.58, -1], [0.33, -0.58, -1]],
    /*                          */],
    /* dot                     */[
    /*          none            */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [0.33, 0.58, -1], [-0.33, -0.58, -1], [0.33, -0.58, -1]],
    /*          dot             */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [0.33, 0.58, -1], [-0.33, -0.58, -1], [0, 0, 0]],
    /*          line            */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [0.33, 0.58, -1], [-0.33, -0.58, -1], [0, 0, 0]],
    /*          triangle        */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [0.33, 0.58, -1], [-0.33, -0.58, -1], [0, 0, 0]],
    /*          square          */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [0.33, 0.58, -1], [-0.33, -0.58, -1], [0, 0, 0]],
    /*          house           */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [0.33, 0.58, -1], [-0.33, -0.58, -1], [0, 0, 0]],
    /*          rectangle       */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [0.33, 0.58, -1], [-0.33, -0.58, -1], [0, 0, 0]],
    /*          hexagon         */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [0.33, 0.58, -1], [-0.33, -0.58, -1], [0, 0, 0]],
    /*                          */],
    /* line                     */[
    /*          none            */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [0.33, 0.58, -1], [-0.33, -0.58, -1], [0.33, -0.58, -1]],
    /*          dot             */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [0.33, 0.58, -1], [-0.33, -0.58, -1], [0, 0, 0]],
    /*          line            */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [0.33, 0.58, -1], [0, 0.33, 0], [0, -0.33, 0]],
    /*          triangle        */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [0.33, 0.58, -1], [0, 0.33, 0], [0, -0.33, 0]],
    /*          square          */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [0.33, 0.58, -1], [0, 0.33, 0], [0, -0.33, 0]],
    /*          house           */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [0.33, 0.58, -1], [0, 0.33, 0], [0, -0.33, 0]],
    /*          rectangle       */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [0.33, 0.58, -1], [0, 0.33, 0], [0, -0.33, 0]],
    /*          hexagon         */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [0.33, 0.58, -1], [0, 0.33, 0], [0, -0.33, 0]],
    /*                          */],
    /* triangle                 */[
    /*          none            */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [0.33, 0.58, -1], [-0.33, -0.58, -1], [0.33, -0.58, -1]],
    /*          dot             */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [0.33, 0.58, -1], [-0.33, -0.58, -1], [0, 0, 0]],
    /*          line            */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [0.33, 0.58, -1], [0, 0.33, 0], [0, -0.33, 0]],
    /*          triangle        */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [-0.33, -0.33, 0], [0.33, -0.33, 0], [0, 0.29, 0]],
    /*          square          */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [-0.33, -0.33, 0], [0.33, -0.33, 0], [0, 0.29, 0]],
    /*          house           */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [-0.33, -0.33, 0], [0.33, -0.33, 0], [0, 0.29, 0]],
    /*          rectangle       */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [-0.33, -0.33, 0], [0.33, -0.33, 0], [0, 0.29, 0]],
    /*          hexagon         */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [-0.33, -0.33, 0], [0.33, -0.33, 0], [0, 0.29, 0]],
    /*                          */],
    /* square                   */[
    /*          none            */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [0.33, 0.58, -1], [-0.33, -0.58, -1], [0.33, -0.58, -1]],
    /*          dot             */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [0.33, 0.58, -1], [-0.33, -0.58, -1], [0, 0, 0]],
    /*          line            */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [0.33, 0.58, -1], [0, 0.33, 0], [0, -0.33, 0]],
    /*          triangle        */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [-0.33, -0.33, 0], [0.33, -0.33, 0], [0, 0.29, 0]],
    /*          square          */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, -0.33, 0], [0.33, -0.33, 0], [-0.33, 0.33, 0], [0.33, 0.33, 0]],
    /*          house           */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, -0.33, 0], [0.33, -0.33, 0], [-0.33, 0.33, 0], [0.33, 0.33, 0]],
    /*          rectangle       */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, -0.33, 0], [0.33, -0.33, 0], [-0.33, 0.33, 0], [0.33, 0.33, 0]],
    /*          hexagon         */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, -0.33, 0], [0.33, -0.33, 0], [-0.33, 0.33, 0], [0.33, 0.33, 0]],
    /*                          */],
    /* house                    */[
    /*          none            */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [0.33, 0.58, -1], [-0.33, -0.58, -1], [0.33, -0.58, -1]],
    /*          dot             */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [0.33, 0.58, -1], [-0.33, -0.58, -1], [0, 0, 0]],
    /*          line            */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [0.33, 0.58, -1], [0, 0.33, 0], [0, -0.33, 0]],
    /*          triangle        */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [-0.33, -0.33, 0], [0.33, -0.33, 0], [0, 0.29, 0]],
    /*          square          */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, -0.33, 0], [0.33, -0.33, 0], [-0.33, 0.33, 0], [0.33, 0.33, 0]],
    /*          house           */[[0, 0, -1], [-0.67, 0, -1], [-0.33, -0.67, 0], [0.33, -0.67, 0], [-0.33, 0, 0], [0.33, 0, 0], [0, 0.58, 0]],
    /*          rectangle       */[[0, 0, -1], [-0.67, 0, -1], [-0.33, -0.67, 0], [0.33, -0.67, 0], [-0.33, 0, 0], [0.33, 0, 0], [0, 0.58, 0]],
    /*          hexagon         */[[0, 0, -1], [-0.67, 0, -1], [-0.33, -0.67, 0], [0.33, -0.67, 0], [-0.33, 0, 0], [0.33, 0, 0], [0, 0.58, 0]],
    /*                          */],
    /* rectangle                */[
    /*          none            */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [0.33, 0.58, -1], [-0.33, -0.58, -1], [0.33, -0.58, -1]],
    /*          dot             */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [0.33, 0.58, -1], [-0.33, -0.58, -1], [0, 0, 0]],
    /*          line            */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [0.33, 0.58, -1], [0, 0.33, 0], [0, -0.33, 0]],
    /*          triangle        */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [-0.33, -0.33, 0], [0.33, -0.33, 0], [0, 0.29, 0]],
    /*          square          */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, -0.33, 0], [0.33, -0.33, 0], [-0.33, 0.33, 0], [0.33, 0.33, 0]],
    /*          house           */[[0, 0, -1], [-0.67, 0, -1], [-0.33, -0.67, 0], [0.33, -0.67, 0], [-0.33, 0, 0], [0.33, 0, 0], [0, 0.58, 0]],
    /*          rectangle       */[[0, 0, -1], [-0.33, -0.67, 0], [0.33, -0.67, 0], [-0.33, 0, 0], [0.33, 0, 0], [-0.33, 0.67, 0], [0.33, 0.67, 0],],
    /*          hexagon         */[[0, 0, -1], [-0.33, -0.67, 0], [0.33, -0.67, 0], [-0.33, 0, 0], [0.33, 0, 0], [-0.33, 0.67, 0], [0.33, 0.67, 0],],
    /*                          */],
    /* hexagon                  */[
    /*          none            */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [0.33, 0.58, -1], [-0.33, -0.58, -1], [0.33, -0.58, -1]],
    /*          dot             */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [0.33, 0.58, -1], [-0.33, -0.58, -1], [0, 0, 0]],
    /*          line            */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [0.33, 0.58, -1], [0, 0.33, 0], [0, -0.33, 0]],
    /*          triangle        */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, 0.58, -1], [-0.33, -0.33, 0], [0.33, -0.33, 0], [0, 0.29, 0]],
    /*          square          */[[0, 0, -1], [-0.67, 0, -1], [0.67, 0, -1], [-0.33, -0.33, 0], [0.33, -0.33, 0], [-0.33, 0.33, 0], [0.33, 0.33, 0]],
    /*          house           */[[0, 0, -1], [-0.67, 0, -1], [-0.33, -0.67, 0], [0.33, -0.67, 0], [-0.33, 0, 0], [0.33, 0, 0], [0, 0.58, 0]],
    /*          rectangle       */[[0, 0, -1], [-0.33, -0.67, 0], [0.33, -0.67, 0], [-0.33, 0, 0], [0.33, 0, 0], [-0.33, 0.67, 0], [0.33, 0.67, 0],],
    /*          hexagon         */[[0, 0, 0], [-0.67, 0, 0], [0.67, 0, 0], [-0.33, 0.58, 0], [0.33, 0.58, 0], [-0.33, -0.58, 0], [0.33, -0.58, 0],],
    /*                          */],
]
