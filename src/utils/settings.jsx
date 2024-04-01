import * as d3 from 'd3';
import { AmbientLight, _SunLight as SunLight } from '@deck.gl/core';
import { FlyToInterpolator, LightingEffect } from 'deck.gl';
import { saturate } from './utils';

export const INITIAL_VIEW_STATE = {
  longitude: -121.046040643251,
  latitude: 37.53320315272563,
  zoom: 7.3252675985610685,
  minZoom: 7,
  maxZoom: 15,
  pitch: 50.85,
  bearing: 32.58,
};

export const COWS_VIEW_STATE = {
  longitude: -120.799348991653,
  latitude: 37.07909824584108,
  zoom: 9.589607161282105,
  minZoom: 7,
  maxZoom: 11,
  pitch: 50.85,
  bearing: 32.58,
  transitionDuration: 3000,
  transitionInterpolator: new FlyToInterpolator(),
};

export const COWS_OUT_VIEW_STATE = {
  longitude: -121.134704643101,
  latitude: 37.71392572292552,
  zoom: 7.714668594935653,
  minZoom: 7,
  maxZoom: 11,
  pitch: 50.85,
  bearing: 32.58,
  transitionDuration: 3000,
  transitionInterpolator: new FlyToInterpolator(),
};

export const PROJ_OUT_VIEW_STATE = {
  longitude: -121.724611542995,
  latitude: 38.20436329728941,
  zoom: 8.054386171593723,
  minZoom: 7,
  maxZoom: 11,
  pitch: 50.85,
  bearing: 32.58,
  transitionDuration: 3000,
  transitionInterpolator: new FlyToInterpolator(),
};

export const SETT_VIEW_STATE = {
  longitude: -121.816103974157,
  latitude: 38.98693235425995,
  zoom: 9.654348182289308,
  minZoom: 7,
  maxZoom: 11,
  pitch: 50.85,
  bearing: 32.58,
  transitionDuration: 3000,
  transitionInterpolator: new FlyToInterpolator(),
};

export const PROJ_VIEW_STATE = {
  longitude: -121.80183018585,
  latitude: 38.26807071392864,
  zoom: 9.572807132250027,
  minZoom: 7,
  maxZoom: 11,
  pitch: 50.85,
  bearing: 32.58,
  transitionDuration: 3000,
  transitionInterpolator: new FlyToInterpolator(),
};

export const JUXTAPOSE_VIEW_STATE = {
  longitude: -120.732027389154,
  latitude: 37.00972667884932,
  zoom: 8.599616427840187,
  minZoom: 7,
  maxZoom: 11,
  pitch: 50.85,
  bearing: 32.58,
  transitionDuration: 3000,
  transitionInterpolator: new FlyToInterpolator(),
};

export const AMBIENT_LIGHT = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.7,
});

export const DIR_LIGHT = new SunLight({
  timestamp: Date.UTC(2019, 6, 1, 22),
  color: [255, 255, 255],
  intensity: 0.8,
  // _shadow: true
});

export const HOLDERS = {
  0: 'Settlement',
  1: 'Exchange',
  2: 'Project',
  3: 'Non-Project',
};

export const SCENARIOS = {
  0: 'bl_h000',
  1: 'CS3_ALT3_2022med_L2020ADV',
  2: 'LTO_BA_EXP1_2022MED',
};

export const SCENARIO_LABELS = {
  0: 'Scenario 1',
  1: 'Scenario 2',
  2: 'Scenario 3',
};

export function inRange(a, x, y) {
  return a >= x && a <= y;
}

export const USE_TERRAIN_3D = false;

export const LIGHTING = new LightingEffect({
  ambientLight: AMBIENT_LIGHT,
  dirLight: DIR_LIGHT,
});

export const INITIAL_FIRE_VIEW_STATE = {
  longitude: -119.99582643167989,
  latitude: 37.88453894208306,
  zoom: 10.364947995424346,
  pitch: 49.903969287830776,
  bearing: 28.126875,
};

export const INITIAL_ELEC_VIEW_STATE = {
  longitude: -97.7431,
  latitude: 30.2672,
  zoom: 5,
  minZoom: 3,
  maxZoom: 10,
  pitch: 50.85,
  bearing: 32.58,
};

export const electionScales = {
  party: {
    value: {
      domain: [-100, 100], //'DemLead',
      color: saturate(
        d3.interpolateRgbBasis(['red', 'purple', 'blue']),
        -1.0,
        0.2
      ),
    },
    variance: {
      domain: [0, 2000], //'DemLeadVar',
      // range: [1, 0],
    },
  },
  votes: {
    value: {
      domain: [0, 42508],
    },
    variance: {
      domain: [0, 1],
    },
  },
  population: {
    value: {
      domain: [0, 200], //'Pop',
      color: d3.interpolateGreys,
    },
    variance: {
      domain: [0, 8e5],
    },
  },
  poc: {
    value: {
      domain: [0, 50], //'PoC',
      // range: [1, 0],
      color: saturate(d3.interpolateBuGn, 0.5, -0.3),
    },
    variance: {
      domain: [0, 100], //'PoCVar',
    },
  },
};

// export const electionScales = {
//   party: {
//     value: {
//       domain: [-100, 100],
//       color: saturate(
//         d3.interpolateRgbBasis(['red', 'purple', 'blue']),
//         -1.0,
//         0.2
//       ),
//     },
//     variance: {
//       domain: [0, 500],
//       // range: [1, 0],
//     },
//   },
//   votes: {
//     value: {
//       domain: [0, 42508],
//     },
//     variance: {
//       domain: [0, 1],
//     },
//   },
//   population: {
//     value: {
//       domain: 'PopSqKm',
//       color: d3.interpolateGreys,
//     },
//     variance: {
//       domain: 'PopSqKmVar',
//     },
//   },
//   poc: {
//     value: {
//       domain: [0, 300],
//       // range: [1, 0],
//       color: saturate(d3.interpolateBuGn, 0.5, -0.3),
//     },
//     variance: {
//       domain: [0, 1e5],
//       // domain: [0, 5e9],
//     },
//   },
// };

export const fireScales = {
  power: {
    value: {
      domain: [0, 300],
    },
    variance: {
      domain: [0, 100],
      range: [0, 1],
    },
  },
  personnel: {
    value: {
      domain: [0, 100],
    },
    variance: {
      domain: [0, 1],
    },
  },
};

export const wildfireScales = {
  fire: {
    value: {
      domain: [0, 300],
      color: saturate(
        (d) => d3.interpolateOrRd(d3.scaleLinear([0.4, 1.0])(d)),
        -0.5,
        0.5
      ),
    },
    variance: {
      domain: 'FireVar',
    },
  },
  personnel: {
    value: {
      domain: [0, 100],
    },
    variance: {
      domain: [0, 1],
    },
  },
  gr2: {
    value: {
      domain: [0, 60],
      color: saturate(
        (d) => d3.interpolateGreys(d3.scaleLinear([0.2, 1.0])(d)),
        1,
        0.6
      ),
    },
    variance: {
      domain: 'SpreadRateVar',
    },
  },
  elev: {
    value: {
      domain: [500, 2000],
    },
    variance: {
      domain: [0, 2],
    },
  },
};

export const waterScales = {
  groundwater: {
    value: {
      domain: [-300, 700],
      color: saturate(
        (d) => d3.interpolateBlues(d3.scaleLinear([0.75, 1.0])(d)),
        -0.5,
        0.5
      ),
    },
    variance: {
      domain: [0, 10000],
    },
  },
  demand: {
    value: {
      domain: [0, 150],
      color: saturate(d3.interpolateOranges, 1, 1),
    },
    variance: {
      domain: [0, 650],
    },
  },
  unmetDemand: {
    value: {
      domain: [-150, 0],
      range: [1, 0],
      color: saturate(d3.interpolateOranges, 0, 0),
    },
    variance: {
      domain: [0, 650],
    },
  },
  unmetDemandPositive: {
    value: {
      domain: [0, 150],
      color: saturate(d3.interpolateOranges, 0, 0),
    },
    variance: {
      domain: [0, 650],
    },
  },
  difference: {
    value: {
      domain: [-30, 30],
      color: saturate(d3.interpolateRdYlGn, 0, 0),
      zero: 0.5,
    },
    variance: {
      domain: [0, 650],
    },
  },
};
