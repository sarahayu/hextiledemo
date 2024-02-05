import { dataFilter } from 'src/utils/utils';

export const temporalDataHex = dataFilter(
  await (await fetch('/assets/combine_hex_5_6_100.json')).json(),
  (d) => d.DemandBaseline
);

export const averageData = await (await fetch('/assets/averages.json')).json();
export const temporalDataGeo = await (
  await fetch('/assets/combine_geo_5_6.json')
).json();
