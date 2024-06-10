import { electionPrecinctGeo as dataDeag } from 'src/data/data';
import { electionDataSquare as _squareData } from 'src/data/electionDataSquare';
import { electionDataHex as _hexData } from 'src/data/electionDataHex';

const hexData = Object.keys(_hexData['4']).map((id) => hexToObject(id));
const squareData = Object.keys(_squareData['4']).map((id) =>
  squareToObject(id)
);

function hexToObject(id) {
  const { CountyRgs, PrecinctRgs, ...rest } = _hexData['4'][id];

  return {
    id,
    ...rest,
  };
}

function squareToObject(id) {
  const { CountyRgs, PrecinctRgs, ...rest } = _squareData['4'][id];

  return {
    id,
    ...rest,
  };
}

// https://stackoverflow.com/a/59347979
function getRanArr(max, lngth) {
  let arr = [];
  do {
    let ran = rando(max);
    arr = arr.indexOf(ran) > -1 ? arr : arr.concat(ran);
  } while (arr.length < lngth);

  return arr;
}

// https://stackoverflow.com/a/12646864
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

function rando(max) {
  return Math.floor(Math.random() * max);
}

function pick15Hexes() {
  const regs = getRanArr(hexData.length, 15).map((d) => hexData[d]);
  return regs;
}

function pick15Squares() {
  const regs = getRanArr(squareData.length, 15).map((d) => squareData[d]);
  return regs;
}

function task1() {
  const tasks = [];

  const hregs = pick15Hexes();
  const sregs = pick15Squares();
  for (let i = 0; i < 5; i++) {
    const vars = shuffleArray([
      'population density',
      'person of color',
      'dem. lead',
    ]);

    for (let v of vars) {
      const encs = shuffleArray(['hex', 'square']);

      for (let enc of encs) {
        tasks.push({
          type: 'text',
          q: `What is your best estimate for ${v} in this tile?`,
          a: (enc == 'hex' ? hregs[i] : sregs[i]).id,
          map: enc,
        });
      }
    }
  }

  return tasks;
}

// https://stackoverflow.com/a/55297611

// sort array ascending
const asc = (arr, key) => arr.sort((a, b) => a[key] - b[key]);

const quantile = (arr, q, key) => {
  const sorted = asc(arr, key);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return (
      sorted[base][key] + rest * (sorted[base + 1][key] - sorted[base][key])
    );
  } else {
    return sorted[base][key];
  }
};

function perc(dat, p, key) {
  return quantile(Array.from(dat), p / 100, key);
}

function findMatchings(dat, [amin, amax], [bmin, bmax], keya, keyb) {}

const keyToStr = {
  PopSqKm: 'population density',
  DemLead: 'dem. lead',
  PoC: 'person of color',
};

function task2() {
  let tasks_final = [];

  let as = [
    [0, 25],
    [25, 100],
    [100, 150],
    [150, 100000000],
  ];

  let keya = 'PopSqKm',
    keyb = 'DemLead';

  let tasks = [];
  for (let [amin, amax] of as) {
    for (let enc of ['hex', 'square']) {
      let datwithin = enc == 'hex' ? hexData : squareData;
      datwithin = datwithin.filter(
        (reg) => reg[keya] <= amax && reg[keya] >= amin
      );

      console.log(datwithin);

      const b0 = perc(datwithin, 0, keyb),
        b25 = perc(datwithin, 25, keyb),
        b50 = perc(datwithin, 50, keyb),
        b75 = perc(datwithin, 75, keyb),
        b100 = perc(datwithin, 100, keyb);

      const bs = [
        [Math.round(b0), Math.round(b25)],
        [Math.round(b25), Math.round(b50)],
        [Math.round(b50), Math.round(b75)],
        [Math.round(b75), Math.round(b100)],
      ];

      for (let [bmin, bmax] of bs) {
        tasks.push({
          type: 'click',
          q: `Which tile has ${keyToStr[keya]} in range [${amin},${amax}] and ${keyToStr[keyb]} in [${bmin},${bmax}]?`,
          a: datwithin
            .filter((reg) => reg[keyb] <= bmax && reg[keyb] >= bmin)
            .map((a) => a.id),
          map: enc,
        });
      }
    }
  }

  tasks_final = [...tasks_final, ...getRanArr(32, 10).map((i) => tasks[i])];

  tasks = [];

  (keya = 'PopSqKm'), (keyb = 'PoC');

  for (let [amin, amax] of as) {
    for (let enc of ['hex', 'square']) {
      let datwithin = enc == 'hex' ? hexData : squareData;
      datwithin = datwithin.filter(
        (reg) => reg[keya] <= amax && reg[keya] >= amin
      );

      const b0 = perc(datwithin, 0, keyb),
        b25 = perc(datwithin, 25, keyb),
        b50 = perc(datwithin, 50, keyb),
        b75 = perc(datwithin, 75, keyb),
        b100 = perc(datwithin, 100, keyb);

      const bs = [
        [Math.round(b0), Math.round(b25)],
        [Math.round(b25), Math.round(b50)],
        [Math.round(b50), Math.round(b75)],
        [Math.round(b75), Math.round(b100)],
      ];

      for (let [bmin, bmax] of bs) {
        tasks.push({
          type: 'click',
          q: `Which tile has ${keyToStr[keya]} in range [${amin},${amax}] and ${keyToStr[keyb]} in [${bmin},${bmax}]?`,
          a: datwithin
            .filter((reg) => reg[keyb] <= bmax && reg[keyb] >= bmin)
            .map((a) => a.id),
          map: enc,
        });
      }
    }
  }

  tasks_final = [...tasks_final, ...getRanArr(32, 10).map((i) => tasks[i])];

  as = [
    [-100, -50],
    [-50, 0],
    [0, 20],
    [20, 100],
  ];

  tasks = [];
  (keya = 'DemLead'), (keyb = 'PoC');

  for (let [amin, amax] of as) {
    for (let enc of ['hex', 'square']) {
      let datwithin = enc == 'hex' ? hexData : squareData;
      datwithin = datwithin.filter(
        (reg) => reg[keya] <= amax && reg[keya] >= amin
      );

      const b0 = perc(datwithin, 0, keyb),
        b25 = perc(datwithin, 25, keyb),
        b50 = perc(datwithin, 50, keyb),
        b75 = perc(datwithin, 75, keyb),
        b100 = perc(datwithin, 100, keyb);

      const bs = [
        [Math.round(b0), Math.round(b25)],
        [Math.round(b25), Math.round(b50)],
        [Math.round(b50), Math.round(b75)],
        [Math.round(b75), Math.round(b100)],
      ];

      for (let [bmin, bmax] of bs) {
        tasks.push({
          type: 'click',
          q: `Which tile has ${keyToStr[keya]} in range [${amin},${amax}] and ${keyToStr[keyb]} in [${bmin},${bmax}]?`,
          a: datwithin
            .filter((reg) => reg[keyb] <= bmax && reg[keyb] >= bmin)
            .map((a) => a.id),
          map: enc,
        });
      }
    }
  }

  tasks_final = [...tasks_final, ...getRanArr(32, 10).map((i) => tasks[i])];

  return tasks_final;
}

export default function generateQs() {
  let a = [...task1(), ...task2()];
  console.log(a);
  console.log('gen functions');
  return a;
}
