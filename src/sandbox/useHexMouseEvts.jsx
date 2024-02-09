import React from 'react';

import { useCallback, useState } from 'react';
import { temporalDataGeo } from 'src/utils/data';
import { default as turfArea } from '@turf/area';
import booleanIntersects from '@turf/boolean-intersects';
import intersect from '@turf/intersect';
import { h3ToFeature } from 'geojson2h3';

export default function useHexMouseEvts() {
  const [hoveredHex, setHoveredHex] = useState(null);
  const [hoveredGeos, setHoveredGeos] = useState({});
  const [hoveredGeoActive, setHoveredGeoActive] = useState([]);
  const [clickedHex, setClickedHex] = useState(null);
  const [clickedGeoJSON, setClickedGeoJSON] = useState({
    type: 'FeatureCollection',
    features: [],
  });
  const [clickedGeos, setClickedGeos] = useState({});

  const onHover = useCallback(
    ({ object }) => {
      // unhover
      if (!object) {
        setHoveredHex(null);
        setHoveredGeos({});
        setHoveredGeoActive([]);
        return;
      }

      // hover geos
      if (clickedHex) {
        setHoveredHex(null);
        setHoveredGeos({});
        setHoveredGeoActive(object.properties.DU_ID);
        return true;
      }

      if (hoveredHex != object.hexId) {
        // hover hexes
        const hoveredHexFeature = h3ToFeature(object.hexId);
        const hovereds = {};
        temporalDataGeo.features.forEach((f) => {
          const intersectionFeature = intersect(hoveredHexFeature, f.geometry);
          if (!intersectionFeature) return;
          hovereds[f.properties.DU_ID] =
            turfArea(intersectionFeature) / turfArea(hoveredHexFeature);
        });
        setHoveredGeos(hovereds);
        setHoveredHex(object.hexId);

        return true;
      }
    },
    [clickedHex]
  );

  const onClick = useCallback(
    ({ object }) => {
      // unclick
      if (object.properties.DU_ID == hoveredGeoActive) {
        setClickedGeoJSON({
          type: 'FeatureCollection',
          features: [],
        });
        setClickedGeos({});
        setClickedHex(null);
        return true;
      }

      // a hex has already been clicked previously
      if (clickedHex) return;

      setClickedHex(object.hexId);
      setHoveredGeos({});

      const hoveredHexFeature = h3ToFeature(object.hexId);
      const clickeds = {};
      const clickedJSON = {
        type: 'FeatureCollection',
        features: [],
      };

      temporalDataGeo.features.forEach((f) => {
        const intersectionFeature = intersect(hoveredHexFeature, f.geometry);
        if (!intersectionFeature) return;
        const area =
          turfArea(intersectionFeature) / turfArea(hoveredHexFeature);
        clickedJSON.features.push({
          ...intersectionFeature,
          properties: { ...f.properties, area },
        });
        clickeds[f.properties.DU_ID] = { ...f.properties, area };
      });

      setClickedGeos(clickeds);
      setClickedGeoJSON(clickedJSON);

      return true;
    },
    [clickedHex, hoveredGeoActive]
  );

  return {
    clickedHex,
    hoveredGeos,
    clickedGeoJSON,
    clickedGeos,
    hoveredGeoActive,
    onHover,
    onClick,
  };
}
