import React from 'react';

import { useCallback, useState } from 'react';
import { temporalDataGeoByDUID } from 'src/utils/data';
import * as turf from '@turf/turf';
import { h3ToFeature } from 'geojson2h3';

export default function useHexMouseEvts() {
  const [hoveredHex, setHoveredHex] = useState(null);
  const [hoveredGeos, setHoveredGeos] = useState({});
  const [hoveredGeoActive, setHoveredGeoActive] = useState([]);
  const [clickedHexes, setClickedHexes] = useState({});
  const [selectedGeoJSON, setSelectedGeoJSON] = useState({
    type: 'FeatureCollection',
    features: [],
  });
  const [selectedGeos, setSelectedGeos] = useState({});
  const [selectionFinalized, setSelectionFinalized] = useState(false);

  const onHover = useCallback(
    ({ object }) => {
      // unhover
      if (!object) {
        setHoveredHex(null);
        setHoveredGeos({});
        setHoveredGeoActive([]);
        return;
      }

      if (selectionFinalized) {
        // hover geos
        setHoveredHex(null);
        setHoveredGeos({});
        setHoveredGeoActive(object.properties.DU_ID);
      } else {
        // hover hexes
        const hoveredHexFeature = h3ToFeature(object.hexId);
        const hovereds = {};
        for (const duid of object.properties.DURgs) {
          const f = temporalDataGeoByDUID[duid];
          const intersectionFeature = turf.intersect(
            hoveredHexFeature,
            f.geometry
          );
          hovereds[f.properties.DU_ID] =
            turf.area(intersectionFeature) / turf.area(hoveredHexFeature);
        }
        setHoveredGeos(hovereds);
        setHoveredHex(object.hexId);
      }

      return true;
    },
    [clickedHexes, selectionFinalized]
  );

  const onClick = useCallback(
    ({ object }, evt) => {
      // unclick
      if (object.properties.DU_ID == hoveredGeoActive) {
        setSelectedGeoJSON({
          type: 'FeatureCollection',
          features: [],
        });
        setSelectedGeos({});
        setClickedHexes({});
        setSelectionFinalized(false);
        return true;
      }

      // clicking additional hexes
      if (evt.srcEvent.shiftKey) {
        setClickedHexes((c) => ({
          ...c,
          [object.hexId]: object.properties.DURgs,
        }));
        return true;
      }

      setSelectionFinalized(true);
      setHoveredHex(null);
      setHoveredGeos({});
      setHoveredGeoActive(object.properties.DU_ID);

      // TODO change clickedHexes to ref...
      setClickedHexes({});
      // TODO: ...because of this
      const clickedHexesCurrent = {
        ...clickedHexes,
        [object.hexId]: object.properties.DURgs,
      };
      setClickedHexes(clickedHexesCurrent);

      const selecteds = {};
      const selectedsJSON = {
        type: 'FeatureCollection',
        features: [],
      };

      for (const hid in clickedHexesCurrent) {
        for (const duid of clickedHexesCurrent[hid]) {
          const feat = temporalDataGeoByDUID[duid];
          const hoveredHexFeature = h3ToFeature(hid);
          const intersectionFeature = turf.intersect(
            hoveredHexFeature,
            feat.geometry
          );
          selectedsJSON.features.push({
            ...intersectionFeature,
            properties: { ...feat.properties },
          });
          selecteds[feat.properties.DU_ID] = { ...feat.properties };
        }
      }

      setSelectedGeos(selecteds);
      setSelectedGeoJSON(selectedsJSON);

      return true;
    },
    [clickedHexes, hoveredGeoActive, selectionFinalized]
  );

  return {
    hoveredHex,
    clickedHexes,
    hoveredGeos,
    selectedGeoJSON,
    selectedGeos,
    hoveredGeoActive,
    onHover,
    onClick,
    selectionFinalized,
  };
}
