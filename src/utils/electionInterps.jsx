import { electionDataHex } from 'src/data/electionDataHex';
import { createScales } from 'src/utils/utils';
import { electionScales } from './settings';

export const ELECTION_INTERPS = createScales(
  electionScales,
  electionDataHex,
  true,
  false
);
