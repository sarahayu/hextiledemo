import { arrGroupBy, dataFilter } from 'src/utils/utils';

export const temporalDataHex = dataFilter(
  await (await fetch('/assets/hex_5_6.json')).json(),
  (d) => d.DemandBaseline
);

export const averageData = await (await fetch('/assets/averages.json')).json();
export const temporalDataGeo = await (
  await fetch('/assets/demand_geo.json')
).json();

export const temporalDataGeoByDUID = arrGroupBy(
  temporalDataGeo.features,
  (t) => t.properties.DU_ID
);

export const temporalDataGeoGW = await (
  await fetch('/assets/groundwater_geo.json')
).json();
