import { waterDataHex } from 'src/data/waterDataHex';
import { createScales } from 'src/utils/utils';
import { waterScales } from './settings';

export const WATER_INTERPS = createScales(waterScales, waterDataHex);
export const heightInterpUDem = (val) =>
  d3.scaleLinear([100, 4090])(WATER_INTERPS.unmetDemand.scaleLinear(val));
