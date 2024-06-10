import { getMapsizeSquare } from 'src/utils/utils';
import { jsonLoad } from '../utils/utils';

export const groundwaterGeo = await jsonLoad('groundwater_geo');
export const CALI_BBOX = getMapsizeSquare(groundwaterGeo);
