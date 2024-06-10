import { wildfireDataHex } from 'src/data/wildfireDataHex';
import { createScales } from 'src/utils/utils';
import { wildfireScales } from './settings';

export const WILDFIRE_INTERPS = createScales(wildfireScales, wildfireDataHex);
