import { dataFilter } from 'src/utils/utils';

export const temporalData = dataFilter(
  await (await fetch('/assets/combine_hex_5_6_100.json')).json(),
  (d) => d.DemandBaseline
);

export const averageData = await (await fetch('/assets/averages.json')).json();
