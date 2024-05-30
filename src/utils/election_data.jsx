export const _electionDataHex = await (async () => {
  console.log('election');
  return await (await fetch('./assets/election_hex_3_4.json')).json();
})();
