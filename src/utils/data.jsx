import { arrGroupBy, dataFilter } from 'src/utils/utils';

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
  await fetch('./assets/demand_geo.json')
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
  await fetch('./assets/precinct_geo_simple.json')
).json();

export const countyGeo = await (
  await fetch('./assets/county_geo_simple.json')
).json();
