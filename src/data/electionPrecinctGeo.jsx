import { getMapsizeSquare } from 'src/utils/utils';
import { jsonLoad } from '../utils/utils';

export const electionPrecinctGeo = await jsonLoad('precinct_geo');
export const electionCountyGeo = await jsonLoad('county_geo');
export const TEX_BBOX = getMapsizeSquare(electionPrecinctGeo);
