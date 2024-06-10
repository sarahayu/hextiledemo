import { jsonLoad } from '../utils/utils';

export const precinctGeo = await jsonLoad('precinct_geo');
export const countyGeo = await jsonLoad('county_geo');
