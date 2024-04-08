import React, { useRef } from 'react';

import { useCallback, useState } from 'react';
import * as turf from '@turf/turf';
import { h3ToFeature } from 'geojson2h3';
import { arrGroupBy } from 'src/utils/utils';

export default function useHexMouseEvts({
  dataDeag,
  disabled = false,
  deagKey,
}) {
  const { current: deagGeoById } = useRef(
    arrGroupBy(dataDeag.features, (t) => t.properties.id)
  );
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
      if (disabled) return;
      if (selectionFinalized) {
        // hover geos
        setHoveredHex(null);
        setHoveredGeos({});
        setHoveredGeoActive(object.properties.id);
      } else if (object.properties[deagKey]) {
        // hover hexes
        const hoveredHexFeature = h3ToFeature(object.hexId);
        const hovereds = {};
        for (const id of object.properties[deagKey]) {
          const f = deagGeoById[id];
          const intersectionFeature = turf.intersect(
            hoveredHexFeature,
            f.geometry
          );

          // have to do a null check because simplifying using mapshaper sometimes make previously intersecting regions no longer intersect
          if (intersectionFeature)
            hovereds[f.properties.id] =
              turf.area(intersectionFeature) / turf.area(hoveredHexFeature);
        }
        setHoveredGeos(hovereds);
        setHoveredHex(object.hexId);
      }
      return true;
    },
    [clickedHexes, selectionFinalized, disabled, deagKey]
  );

  const onClick = useCallback(
    ({ object }, evt) => {
      // unclick
      if (object.properties.id == hoveredGeoActive) {
        setSelectedGeoJSON({
          type: 'FeatureCollection',
          features: [],
        });
        setSelectedGeos({});
        setClickedHexes({});
        setSelectionFinalized(false);
        return true;
      }

      if (object.properties[deagKey] == undefined) return;
      // clicking additional hexes
      if (evt.srcEvent.shiftKey) {
        setClickedHexes((c) => ({
          ...c,
          [object.hexId]: object.properties[deagKey],
        }));
        return true;
      }

      setSelectionFinalized(true);
      setHoveredHex(null);
      setHoveredGeos({});
      setHoveredGeoActive(object.properties.id);

      // TODO change clickedHexes to ref...
      setClickedHexes({});
      // TODO: ...because of this
      const clickedHexesCurrent = {
        ...clickedHexes,
        [object.hexId]: object.properties[deagKey],
      };
      setClickedHexes(clickedHexesCurrent);

      const selecteds = {};
      const selectedsJSON = {
        type: 'FeatureCollection',
        features: [],
      };

      for (const hexId in clickedHexesCurrent) {
        for (const id of clickedHexesCurrent[hexId]) {
          const feat = deagGeoById[id];
          const hoveredHexFeature = h3ToFeature(hexId);
          const intersectionFeature = turf.intersect(
            hoveredHexFeature,
            feat.geometry
          );
          selectedsJSON.features.push({
            ...intersectionFeature,
            properties: { ...feat.properties },
          });
          selecteds[feat.properties.id] = { ...feat.properties };
        }
      }

      setSelectedGeos(selecteds);
      setSelectedGeoJSON(selectedsJSON);

      return true;
    },
    [clickedHexes, hoveredGeoActive, selectionFinalized, deagKey]
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
