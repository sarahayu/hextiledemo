import * as d3 from 'd3';
import { electionDataHex, waterDataHex, wildfireDataHex } from 'src/utils/data';
import { createScales } from 'src/utils/utils';
import {
  electionScales,
  fireScales,
  waterScales,
  wildfireScales,
} from './settings';

export const WATER_INTERPS = createScales(waterScales, waterDataHex);
export const ELECTION_INTERPS = createScales(
  electionScales,
  electionDataHex,
  true,
  false
);
export const FIRE_INTERPS = createScales(fireScales, {});
export const WILDFIRE_INTERPS = createScales(wildfireScales, wildfireDataHex);

/////////////////// other interpolators /////////////////////////

export const heightInterpUDem = (val) =>
  d3.scaleLinear([100, 4090])(WATER_INTERPS.unmetDemand.scaleLinear(val));

export const valueInterpResolution = d3
  .scaleLinear()
  .domain([9, 14])
  .range([0, 1])
  .clamp(true);

export const dateInterpIdx = d3
  .scaleTime()
  .domain([new Date('10/31/1921'), new Date('9/30/2021')])
  .range([0, 1199]).invert;
