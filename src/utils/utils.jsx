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

export const isGeo = (o) => !!(o.properties || {}).id;
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

const epsilon = 1e-9;

function treeQuantization(branchingFactor, treeLayers) {
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

    vscale.nice(Math.pow(branch, layers - 1));
    uscale.nice(layers);

    tree[0] = [];
    tree[0].push({
      u: uscale.invert((layers - 1) / layers),
      v: vscale.invert(0.5),
    });

    for (let i = 1; i <= layers; i++) {
      tree[i - 1] = [];
      n = 2 * Math.pow(branch, i);
      for (let j = 1; j < n; j += 2) {
        tree[i - 1].push({
          u: uscale.invert(1 - i / layers),
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

export const rgbStrToArr = (s) =>
  s
    .replace(/[^\d,]/g, '')
    .split(',')
    .map((d) => Number(d));

const NUM_BINS = 7;

// assuming val is 0-1 and range is 0-1
const noneIfSuperSmall = (val, zeroVal = 0, alphaThreshold = 1 / NUM_BINS) => {
  let thresholdActual = zeroVal == 0 ? alphaThreshold : alphaThreshold / 2;
  return Math.abs(val - zeroVal) < thresholdActual ? 0 : 1;
};

export const createScales = (
  dataSettings,
  data,
  isHexData = true,
  convergeToOne = true
) => {
  const scaleNames = Object.keys(dataSettings);

  for (const name of scaleNames) {
    const curScaleObj = dataSettings[name];

    const rangeValue = curScaleObj['value']['range'] || [0, 1];
    const rangeVariance = curScaleObj['variance']['range'] || [1, 0];
    const colorsValue = curScaleObj['value']['color'] || d3.interpolateReds;
    const colorsVariance =
      curScaleObj['variance']['color'] || d3.interpolateReds;

    if (typeof curScaleObj['value']['domain'] === 'function') {
      if (isHexData) {
        // get highest resolution hexes
        const highestResHexes = Object.values(data).slice(-1)[0];

        curScaleObj['value']['domain'] = d3.extent(
          Object.values(highestResHexes).map(curScaleObj['value']['domain'])
        );
      } else {
        curScaleObj['value']['domain'] = d3.extent(
          data.features.map(curScaleObj['value']['domain'])
        );
      }
    }

    if (typeof curScaleObj['value']['domain'] === 'string') {
      if (isHexData) {
        // get highest resolution hexes
        const highestResHexes = Object.values(data).slice(-1)[0];

        curScaleObj['value']['domain'] = d3.extent(
          Object.values(highestResHexes).map(
            (d) => d[curScaleObj['value']['domain']]
          )
        );
      } else {
        curScaleObj['value']['domain'] = d3.extent(
          data.features.map((d) => d.properties[curScaleObj['value']['domain']])
        );
      }
    }

    if (typeof curScaleObj['variance']['domain'] === 'function') {
      if (isHexData) {
        // get highest resolution hexes
        const highestResHexes = Object.values(data).slice(-1)[0];

        curScaleObj['variance']['domain'] = d3.extent(
          Object.values(highestResHexes).map(curScaleObj['variance']['domain'])
        );
      } else {
        curScaleObj['variance']['domain'] = d3.extent(
          data.features.map(curScaleObj['variance']['domain'])
        );
      }
    }

    if (typeof curScaleObj['variance']['domain'] === 'string') {
      if (isHexData) {
        // get highest resolution hexes
        const highestResHexes = Object.values(data).slice(-1)[0];

        curScaleObj['variance']['domain'] = d3.extent(
          Object.values(highestResHexes).map(
            (d) => d[curScaleObj['variance']['domain']]
          )
        );
      } else {
        curScaleObj['variance']['domain'] = d3.extent(
          data.features.map(
            (d) => d.properties[curScaleObj['variance']['domain']]
          )
        );
      }
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
    const scaleStepped = d3
      .scaleQuantize()
      .domain(curScaleObj['value']['domain'])
      .range(
        d3
          .range(NUM_BINS)
          .map(
            (d) =>
              (d / (NUM_BINS - 1)) * (rangeValue[1] - rangeValue[0]) +
              rangeValue[0]
          )
      );
    curScaleObj['scaleLinearVar'] = scaleVariance.copy().clamp(true);
    const scaleSteppedVar = d3
      .scaleQuantize()
      .domain(curScaleObj['variance']['domain'])
      .range(
        d3
          .range(NUM_BINS)
          .map(
            (d) =>
              (d / (NUM_BINS - 1)) * (rangeVariance[1] - rangeVariance[0]) +
              rangeVariance[0]
          )
      );

    // create colorScales
    curScaleObj['colorsLinear'] = (d) => colorsValue(scaleValue(d));
    curScaleObj['colorsStepped'] = d3
      .scaleQuantize()
      .domain(curScaleObj['value']['domain'])
      .range(
        d3.quantize(
          (d) => colorsValue(d3.scaleLinear([0, 1]).range(rangeValue)(d)),
          NUM_BINS
        )
      );
    curScaleObj['colorsLinearVar'] = (d) => colorsVariance(scaleVariance(d));
    curScaleObj['colorsSteppedVar'] = d3
      .scaleQuantize()
      .domain(curScaleObj['variance']['domain'])
      .range(
        d3.quantize(
          (d) => colorsVariance(d3.scaleLinear([0, 1]).range(rangeVariance)(d)),
          NUM_BINS
        )
      );

    // create vsupScales
    // TODO factor in scaleValue and scaleVariance into this somehow
    curScaleObj['vsup'] = vsup
      .scale()
      .quantize(
        (convergeToOne ? vsup.quantization() : treeQuantization())
          .branching(2)
          .layers(convergeToOne ? 4 : 3)
          .valueDomain(curScaleObj['value']['domain'])
          .uncertaintyDomain(curScaleObj['variance']['domain'])
      )
      .range(colorsValue);

    // create colorInterpolators
    curScaleObj['interpColor'] = (
      d,
      useAlpha = false,
      useStep = true,
      alphaThreshold = 1 / NUM_BINS
    ) => {
      return [
        ...rgbStrToArr(
          (useStep
            ? curScaleObj['colorsStepped']
            : curScaleObj['colorsLinear'])(d)
        ),
        ...(useAlpha
          ? [
              noneIfSuperSmall(
                scaleStepped(d),
                curScaleObj['value']['zero'] || 0,
                alphaThreshold
              ) * 255,
            ]
          : []),
      ];
    };
    curScaleObj['interpColorVar'] = (
      d,
      useAlpha = false,
      useStep = true,
      alphaThreshold = 1 / NUM_BINS
    ) => [
      ...rgbStrToArr(
        (useStep
          ? curScaleObj['colorsSteppedVar']
          : curScaleObj['colorsLinearVar'])(d)
      ),
      ...(useAlpha
        ? [
            noneIfSuperSmall(
              scaleSteppedVar(d),
              curScaleObj['variance']['zero'] || 0,
              alphaThreshold
            ) * 255,
          ]
        : []),
    ];

    // create vsupInterpolators
    curScaleObj['interpVsup'] = (
      d,
      u,
      useAlpha = false,
      alphaThreshold = 1 / NUM_BINS
    ) => [
      ...rgbStrToArr(curScaleObj['vsup'](d, u)),
      ...(useAlpha
        ? [
            noneIfSuperSmall(
              curScaleObj['scaleStepped'](d),
              curScaleObj['value']['zero'] || 0,
              alphaThreshold
            ) * 255,
          ]
        : []),
    ];
  }

  return dataSettings;
};

// https://codepen.io/Elf/details/rOrRaw
export const hexagonShape = (x, y, size, color) => {
  const _s32 = Math.sqrt(3) / 2;
  const A = size;
  const xDiff = x;
  const yDiff = y;
  const pointData = [
    [A + xDiff, 0 + yDiff],
    [A / 2 + xDiff, A * _s32 + yDiff],
    [-A / 2 + xDiff, A * _s32 + yDiff],
    [-A + xDiff, 0 + yDiff],
    [-A / 2 + xDiff, -A * _s32 + yDiff],
    [A / 2 + xDiff, -A * _s32 + yDiff],
  ];
  return function (svgContainer) {
    svgContainer
      .selectAll('path.area')
      .data([pointData])
      .enter()
      .append('path')
      .attr('d', d3.line())
      .attr('fill', color);
  };
};

export const hexagonOutline = (x, y, size, color, thicknessValue = 0.2) => {
  const _s32 = Math.sqrt(3) / 2;
  let A = size;
  const xDiff = x;
  const yDiff = y;
  const pointData1 = [
    [A + xDiff, 0 + yDiff],
    [A / 2 + xDiff, A * _s32 + yDiff],
    [-A / 2 + xDiff, A * _s32 + yDiff],
    [-A + xDiff, 0 + yDiff],
    [-A / 2 + xDiff, -A * _s32 + yDiff],
    [A / 2 + xDiff, -A * _s32 + yDiff],
  ];
  A = size * (1 - thicknessValue);
  const pointData2 = [
    [A / 2 + xDiff, -A * _s32 + yDiff],
    [-A / 2 + xDiff, -A * _s32 + yDiff],
    [-A + xDiff, 0 + yDiff],
    [-A / 2 + xDiff, A * _s32 + yDiff],
    [A / 2 + xDiff, A * _s32 + yDiff],
    [A + xDiff, 0 + yDiff],
  ];

  const d1 = d3.line()(pointData1);
  const d2 = d3.line()(pointData2);

  return function (svgContainer) {
    svgContainer
      .append('path')
      .attr('d', d1 + ' ' + d2)
      .attr('fill', color);
  };
};

export function iconhexLegendU(measure, iconFile, title = 'Title') {
  const opac = d3.scaleLinear().range([55 / 255, 1]);

  return (svgElement) =>
    svgElement.call((a) => {
      const ss = measure.scaleLinear.invert;
      a.selectAll('.some')
        .data(FORMATIONS)
        .enter()
        .append('g')
        .attr('transform', (d, i) => `translate(${i * 60},${0})`)
        .each(function (d) {
          d3.select(this)
            .selectAll('.others')
            .data(d.filter((dd) => dd[2] > -1))
            .enter()
            .append('svg:image')
            .attr('xlink:href', iconFile)
            .attr('x', (d, i) => d[0] * 20)
            .attr('y', (d, i) => -d[1] * 20 + 15)
            .attr('width', 16)
            .attr('height', 16);
        })
        .append('text')
        .attr('x', 8)
        .attr('y', 0)
        .style('font-size', '10px')
        .attr('text-anchor', 'middle')
        .text((d, i) =>
          i == 0
            ? `<${d3.format('.2s')(ss((i + 1) / FORMATIONS.length))}`
            : i == FORMATIONS.length - 1
            ? `>${d3.format('.2s')(ss(i / FORMATIONS.length))}`
            : `${d3.format('.2s')(
                ss(i / FORMATIONS.length)
              )} \u2014 ${d3.format('.2s')(ss((i + 1) / FORMATIONS.length))}`
        );

      a.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', 60 * 3.5 + (30 - 20) * 2)
        .attr('y', -15)
        .style('font-weight', 'bold')
        .text(title);
    });
}

export function iconhexLegendV(measure, iconFile) {
  const opac = d3.scaleLinear().range([55 / 255, 1]);

  return (svgElement) =>
    svgElement.call((a) => {
      const ss = measure.scaleLinearVar.invert;
      a.selectAll('.budy')
        .data(FORMATIONS)
        .enter()
        .append('g')
        .attr('transform', (d, i) => `translate(${i * 60},${0})`)
        .call((a) => {
          a.append('g')
            .each(function (d) {
              d3.select(this)
                .selectAll('.others')
                .data(FORMATIONS[1].filter((dd) => dd[2] > -1))
                .enter()
                .append('svg:image')
                .attr('xlink:href', iconFile)
                .attr('x', (d, i) => d[0] * 20)
                .attr('y', (d, i) => -d[1] * 20)
                .attr('width', 16)
                .attr('height', 16);
            })
            .attr('opacity', (d, i) => opac(1 - i / (FORMATIONS.length - 1)));
        })
        .append('text')
        .attr('x', 8)
        .attr('y', 25)
        .style('font-size', '10px')
        .attr('text-anchor', 'middle')
        .text((d, i) =>
          i == 0 ? 'Low' : i == FORMATIONS.length - 1 ? 'High' : ''
        );

      a.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', 60 * 3.5 + (30 - 20) * 2)
        .attr('y', 40)
        .text('Variance');
    });
}

export function hexLegendU(measure, title = 'Title', showAllRings = false) {
  const thickRange = [0.4, 0.65],
    valueRange = [0.3, 1];
  const i = (d) =>
    d3
      .scaleLinear()
      .range([0, (thickRange[1] - thickRange[0]) / thickRange[1]])(
      d3.scaleLinear().range(valueRange)(d)
    );
  const amtHex = 7,
    hexSize = 20,
    spacing = hexSize * 2 + 10,
    ringThickness = d3.scaleLinear().range([i(0), i(1)]);

  return (svgElement) =>
    svgElement.call((a) => {
      const s = d3.scaleLinear().range(measure.scaleLinear.domain());

      let toInterpolatorDomain = d3
        .scaleLinear()
        .range([s(1 / (amtHex * 2)), s(1 - 1 / (amtHex * 2))]);

      a.append('g')
        .selectAll('.asdf')
        .data(d3.range(amtHex).map((d) => d / (amtHex - 1)))
        .enter()
        .append('g')
        .attr('transform', (d, i) => `translate(${i * spacing},${0})`)
        .each(function (d, i) {
          d3.select(this).call(
            hexagonOutline(
              0,
              20,
              hexSize,
              d3.rgb(
                ...measure.interpColor(toInterpolatorDomain(d), !showAllRings)
              ),
              ringThickness(1)
            )
          );
        })
        .append('text')
        .style('font-size', '10px')
        .attr('text-anchor', 'middle')
        .attr('x', 0)
        .attr('y', 0)
        .text((d, i) =>
          i == 0
            ? `<${d3.format('.2s')(s((i + 1) / amtHex))}`
            : i == amtHex - 1
            ? `>${d3.format('.2s')(s(i / amtHex))}`
            : `${d3.format('.2s')(s(i / amtHex))} \u2014 ${d3.format('.2s')(
                s((i + 1) / amtHex)
              )}`
        );

      a.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', hexSize * 3 + spacing * 2)
        .attr('y', -15)
        .style('font-weight', 'bold')
        .text(title);
    });
}

export function hexLegendV(measure) {
  const thickRange = [0.4, 0.65],
    valueRange = [0.3, 1];
  const i = (d) =>
    d3
      .scaleLinear()
      .range([0, (thickRange[1] - thickRange[0]) / thickRange[1]])(
      d3.scaleLinear().range(valueRange)(d)
    );
  const amtHex = 7,
    hexSize = 20,
    spacing = hexSize * 2 + 10,
    ringThickness = d3.scaleLinear().range([i(0), i(1)]);

  return (svgElement) =>
    svgElement.call((a) => {
      const s = measure.scaleLinear.invert;
      const ss = measure.scaleLinearVar.invert;

      let toInterpolatorDomain = d3
        .scaleLinear()
        .range([s(1 / (amtHex * 2)), s(1 - 1 / (amtHex * 2))]);
      a.append('g')
        .selectAll('.asdf')
        .data(d3.range(amtHex).map((d) => d / (amtHex - 1)))
        .enter()
        .append('g')
        .attr('transform', (d, i) => `translate(${i * spacing},${hexSize * 2})`)
        .each(function (d, i) {
          d3.select(this).call(
            hexagonOutline(
              0,
              0,
              hexSize,
              d3.rgb(...measure.interpColor(toInterpolatorDomain(0))),
              ringThickness(1 - d)
            )
          );
        })
        .append('text')
        .style('font-size', '10px')
        .attr('text-anchor', 'middle')
        .attr('x', 0)
        .attr('y', hexSize + 10)
        .text((d, i) => (i == 0 ? 'Low' : i == amtHex - 1 ? 'High' : ''));

      a.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', hexSize * 3 + spacing * 2)
        .attr('y', hexSize * 4)
        .text('Variance');
    });
}
function simpleHeatmap(data, m_scale, m_size, m_id, m_x, m_y) {
  let x = m_x ? m_x : 0;
  let y = m_y ? m_y : 0;
  let size = m_size ? m_size : 0;
  let scale = m_scale ? m_scale : () => '#fff';
  let id = m_id;
  let h;

  function heatmap(nel) {
    heatmap.el = nel;
    heatmap.setProperties();
  }

  heatmap.setProperties = function () {
    if (!this.el) {
      return;
    }

    if (!heatmap.svgGroup) {
      heatmap.svgGroup = heatmap.el.append('g');
    }

    heatmap.svgGroup.attr('transform', `translate(${x},${y})`);

    heatmap.svgGroup
      .selectAll('g')
      .data(data)
      .enter()
      .append('g')
      .selectAll('rect')
      .data((d, i) =>
        d.map((val) => ({
          r: i,
          v: val,
        }))
      )
      .enter()
      .append('rect')
      .datum(function (d, i) {
        d.c = i;
        return d;
      });

    heatmap.svgGroup
      .selectAll('g')
      .selectAll('rect')
      .attr('x', (d) => (size / data[d.r].length) * d.c)
      .attr('y', (d) => d.r * h)
      .attr('width', (d) => size / data[d.r].length)
      .attr('height', h)
      .attr('fill', (d) => scale(d.v));

    if (id) {
      heatmap.svgGroup.attr('id', id);
    }
  };

  heatmap.data = function (newData) {
    if (!arguments.length) {
      return data;
    } else {
      data = newData;
      h = size / data.length;
      heatmap.setProperties();
      return heatmap;
    }
  };

  heatmap.x = function (newX) {
    if (!arguments.length) {
      return x;
    } else {
      x = newX;
      heatmap.setProperties();
      return heatmap;
    }
  };

  heatmap.y = function (newY) {
    if (!arguments.length) {
      return y;
    } else {
      y = newY;
      heatmap.setProperties();
      return heatmap;
    }
  };

  heatmap.size = function (newSize) {
    if (!arguments.length) {
      return size;
    } else {
      size = newSize;
      if (data) {
        h = size / data.length;
        heatmap.setProperties();
      }
      return heatmap;
    }
  };

  heatmap.scale = function (newScale) {
    if (!arguments.length) {
      return scale;
    } else {
      scale = newScale;
      if (data) {
        heatmap.setProperties();
      }
      return heatmap;
    }
  };

  heatmap.id = function (newId) {
    if (!arguments.length) {
      return id;
    } else {
      id = newId;
      heatmap.setProperties();
      return heatmap;
    }
  };

  return heatmap;
}

function simpleArcmap(data, m_scale, m_size, m_id, m_x, m_y) {
  const arcmap = simpleHeatmap(data, m_scale, m_size, m_id, m_x, m_y);

  function makeArc(d, size, rows, cols) {
    const angle = d3
      .scaleLinear()
      .domain([0, cols])
      .range([-Math.PI / 6, Math.PI / 6]);
    const radius = d3.scaleLinear().domain([0, rows]).range([size, 0]);

    const arcPath = d3
      .arc()
      .innerRadius(radius(d.r + 1))
      .outerRadius(radius(d.r))
      .startAngle(angle(d.c))
      .endAngle(angle(d.c + 1));

    return arcPath();
  }

  arcmap.setProperties = function () {
    var data = arcmap.data();
    var size = arcmap.size();
    var scale = arcmap.scale();
    var id = arcmap.id();
    var x = arcmap.x();
    var y = arcmap.y();

    if (!arcmap.el) {
      return;
    }

    if (!arcmap.svgGroup) {
      arcmap.svgGroup = arcmap.el.append('g');
    }

    arcmap.svgGroup.attr('transform', `translate(${x},${y})`);

    arcmap.svgGroup
      .selectAll('g')
      .data(data)
      .enter()
      .append('g')
      .selectAll('path')
      .data((d, i) =>
        d.map((val) => ({
          r: i,
          v: val,
        }))
      )
      .enter()
      .append('path')
      .datum(function (d, i) {
        d.c = i;
        return d;
      });

    arcmap.svgGroup
      .selectAll('g')
      .selectAll('path')
      .attr('transform', `translate(${size / 2.0},${size})`)
      .attr('d', (d) => makeArc(d, size, data.length, data[d.r].length))
      .attr('fill', (d) => scale(d.v));

    if (id) {
      arcmap.svgGroup.attr('id', id);
    }
  };

  return arcmap;
}

export function arcmapLegendPretty(
  m_scale,
  m_size,
  m_format,
  m_utitle,
  m_vtitle,
  m_x,
  m_y
) {
  let el = null;
  let utitle = m_utitle ? m_utitle : 'Uncertainty';
  let vtitle = m_vtitle ? m_vtitle : 'Value';
  let scale = m_scale ? m_scale : null;
  let size = m_size ? m_size : 200;
  let fmat = m_format || '.2s';
  let x = m_x ? m_x : 0;
  let y = m_y ? m_y : 0;
  let data = null;

  const arcmap = simpleArcmap();

  var legend = function (nel) {
    el = nel;
    legend.setProperties();

    el.call(arcmap);
  };

  legend.setProperties = function () {
    if (!el) {
      return;
    }

    let tmp = data;
    if (!tmp) {
      tmp = scale.quantize().data();
    }

    const inverted = [];
    for (let i = 0; i < tmp.length; i++) {
      inverted[i] = tmp[tmp.length - i - 1];
    }

    arcmap.data(inverted);
    arcmap.scale(scale);
    arcmap.size(size);

    el.attr('class', 'legend').attr('transform', `translate(${x},${y})`);

    var uncertaintyDomain =
      scale && scale.quantize ? scale.quantize().uncertaintyDomain() : [0, 1];
    const uStep =
      (uncertaintyDomain[1] - uncertaintyDomain[0]) / inverted.length;
    const uDom = d3.range(
      uncertaintyDomain[0],
      uncertaintyDomain[1] + uStep,
      uStep
    );

    const uAxisScale = d3
      .scalePoint()
      .range([0, size])
      .domain(['Low', '', 'High']);

    const px = size / 180;
    el.append('g')
      .attr('transform', `translate(${size + 6 * px},${28 * px})rotate(30)`)
      .call(d3.axisRight(uAxisScale));

    el.append('text')
      .style('text-anchor', 'middle')
      .style('font-size', 13)
      .attr(
        'transform',
        'translate(' +
          (size + 10 * px) +
          ',' +
          (40 * px + size / 2) +
          ')rotate(-60)'
      )
      .text(utitle);

    var valueDomain =
      scale && scale.quantize ? scale.quantize().valueDomain() : [0, 1];
    const vStep = (valueDomain[1] - valueDomain[0]) / inverted[0].length;
    const vTicks = d3.range(valueDomain[0], valueDomain[1] + vStep, vStep);

    const vAxisScale = d3.scaleLinear().range([0, size]).domain(valueDomain);
    const valueFormat = fmat
      ? d3.format(fmat)
      : vAxisScale.tickFormat(vTicks.length);

    const angle = d3.scaleLinear().domain(valueDomain).range([-30, 30]);

    const offset = 3 * px;

    const myArc = d3
      .arc()
      .innerRadius(size + offset)
      .outerRadius(size + offset + 1)
      .startAngle(-Math.PI / 6)
      .endAngle(Math.PI / 6);

    const arcAxis = el
      .append('g')
      .attr('transform', `translate(${size / 2},${size - offset})`);

    arcAxis
      .append('path')
      .attr('fill', 'black')
      .attr('stroke', 'transparent')
      .attr('d', myArc);

    const labelEnter = arcAxis
      .selectAll('.arc-label')
      .data(vTicks)
      .enter()
      .append('g')
      .attr('class', 'arc-label')
      .attr(
        'transform',
        (d) =>
          'rotate(' +
          angle(d) +
          ')translate(' +
          0 +
          ',' +
          (-size - offset) +
          ')'
      );

    labelEnter
      .append('text')
      .style('font-size', '11')
      .style('text-anchor', 'middle')
      .attr('y', -10)
      .text(valueFormat);

    labelEnter
      .append('line')
      .attr('x1', 0.5)
      .attr('x2', 0.5)
      .attr('y1', -6)
      .attr('y2', 0)
      .attr('stroke', '#000');

    el.append('text')
      .style('text-anchor', 'middle')
      .style('font-size', 13)
      .attr('x', size / 2)
      .attr('y', -30)
      .text(vtitle);
  };

  legend.data = function (newData) {
    if (!arguments.length) {
      return data;
    } else {
      data = newData;
      legend.setProperties();
      return legend;
    }
  };

  legend.scale = function (s) {
    if (!arguments.length) {
      return scale;
    } else {
      scale = s;
      legend.setProperties();
      return legend;
    }
  };

  legend.size = function (s) {
    if (!arguments.length) {
      return size;
    } else {
      size = s;
      legend.setProperties();
      return legend;
    }
  };

  legend.format = function (f) {
    if (!arguments.length) {
      return fmat;
    } else {
      fmat = f;
      legend.setProperties();
      return legend;
    }
  };

  legend.x = function (nx) {
    if (!arguments.length) {
      return x;
    } else {
      x = nx;
      legend.setProperties();
      return legend;
    }
  };

  legend.y = function (ny) {
    if (!arguments.length) {
      return y;
    } else {
      y = ny;
      legend.setProperties();
      return legend;
    }
  };

  legend.utitle = function (t) {
    if (!arguments.length) {
      return utitle;
    } else {
      utitle = t;
      legend.setProperties();
      return legend;
    }
  };

  legend.vtitle = function (t) {
    if (!arguments.length) {
      return vtitle;
    } else {
      vtitle = t;
      legend.setProperties();
      return legend;
    }
  };

  return legend;
}

// https://stackoverflow.com/a/55613750
export function download(dat, name) {
  const fileName = name;
  const json = JSON.stringify(dat, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const href = URL.createObjectURL(blob);

  // create "a" HTLM element with href to file
  const link = document.createElement('a');
  link.href = href;
  link.download = fileName + '.json';
  document.body.appendChild(link);
  link.click();

  // clean up "a" element & remove ObjectURL
  document.body.removeChild(link);
  URL.revokeObjectURL(href);
}

// https://stackoverflow.com/a/44485468
export function getFormattedTime() {
  let today = new Date();
  let y = today.getFullYear();
  // JavaScript months are 0-based.
  let m = today.getMonth() + 1;
  let d = today.getDate();
  let h = today.getHours();
  let mi = today.getMinutes();
  let s = today.getSeconds();
  return y + '-' + m + '-' + d + '-' + h + '-' + mi + '-' + s;
}

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
