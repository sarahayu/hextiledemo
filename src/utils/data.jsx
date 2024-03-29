import { arrGroupBy, dataFilter } from 'src/utils/utils';
import * as turf from '@turf/turf';

export const temporalDataHex = dataFilter(
  await (await fetch('./assets/hex_5_6.json')).json(),
  (d) => d.DemandBaseline
);

export const temporalDataSquare = dataFilter(
  await (await fetch('./assets/square_5_6.json')).json(),
  (d) => d.DemandBaseline
);

export const averageData = await (await fetch('./assets/averages.json')).json();
export const temporalDataGeo = await (
  await fetch('./assets/demand_geo_small.json')
).json();

export const electionDataHex = await (
  await fetch('./assets/election_hex_3_4.json')
).json();

export const electionDataSquare = await (
  await fetch('./assets/election_square_3_4.json')
).json();

export const electionPrecinctGeo = await (
  await fetch('./assets/precinct_geo.json')
).json();

// export const temporalDataGeoByDUID = arrGroupBy(
//   temporalDataGeo.features,
//   (t) => t.properties.id
// );

export const temporalDataGeoGW = await (
  await fetch('./assets/groundwater_geo.json')
).json();

export const fireDataHex = await (
  await fetch('./assets/fire_hex_7_9.json')
).json();

export const precinctGeo = await (
  await fetch('./assets/precinct_geo.json')
).json();

export const countyGeo = await (await fetch('./assets/county_geo.json')).json();

export const CALI_BBOX = (() => {
  const poly = turf.bboxPolygon(turf.bbox(temporalDataGeoGW));
  const [centerX, centerY] = turf.center(poly).geometry.coordinates;

  for (let coord of poly.geometry.coordinates[0]) {
    coord[0] += (coord[0] - centerX) * 2;
    coord[1] += (coord[1] - centerY) * 2;
  }

  return poly;
})();
