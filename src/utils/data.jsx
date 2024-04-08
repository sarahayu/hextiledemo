import { dataFilter, getMapsizeSquare } from 'src/utils/utils';

export const waterDataHex = dataFilter(
  await (await fetch('./assets/hex_5_6.json')).json(),
  (d) => d.DemandBaseline
);

export const waterDataSquare = dataFilter(
  await (await fetch('./assets/square_5_6.json')).json(),
  (d) => d.DemandBaseline
);

export const waterDataAvgs = await (
  await fetch('./assets/averages.json')
).json();

export const demandUnitGeo = await (
  await fetch('./assets/demand_geo_small.json')
).json();

export const groundwaterGeo = await (
  await fetch('./assets/groundwater_geo.json')
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

export const wildfireDataHex = await (
  await fetch('./assets/wildfire_hex_7_8.json')
).json();

export const fireDataHex = await (
  await fetch('./assets/fire_hex_7_9.json')
).json();

export const precinctGeo = await (
  await fetch('./assets/precinct_geo.json')
).json();

export const countyGeo = await (await fetch('./assets/county_geo.json')).json();

export const CALI_BBOX = getMapsizeSquare(groundwaterGeo);
export const TEX_BBOX = getMapsizeSquare(electionPrecinctGeo);
