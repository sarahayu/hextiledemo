import { dataFilter } from 'src/utils/utils';
import { jsonLoad } from '../utils/utils';

export const waterDataSquare = await jsonLoad(
  'square_5_6',
  function processCb(json) {
    return dataFilter(json, (d) => d.DemandBaseline);
  }
);
