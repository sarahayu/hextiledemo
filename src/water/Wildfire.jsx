import React, {
  Children,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { MapboxOverlay } from '@deck.gl/mapbox';
import { OBJLoader } from '@loaders.gl/obj';
import {
  BitmapLayer,
  CompositeLayer,
  DeckGL,
  PolygonLayer,
  TileLayer,
} from 'deck.gl';
import { useControl, useMap } from 'react-map-gl';
import IconHexTileLayer from 'src/hextile/IconHexTileLayer';
import SolidHexTileLayer from 'src/hextile/SolidHexTileLayer';

import { FIRE_INTERPS } from 'src/utils/scales';

import maplibregl from 'maplibre-gl';
import Map from 'react-map-gl/maplibre';
import { INITIAL_FIRE_VIEW_STATE, LIGHTING } from 'src/utils/settings';

import { fireDataHex as data } from 'src/utils/data';

import useGUI from './useGUI';
import DeckGLOverlay from 'src/utils/overlay';

export default function Wildfire() {
  const curInput = useGUI();
  const { getTooltip } = useHexTooltip(curInput);

  const curState = {
    data,
    ...curInput,
  };
  const layers = [];

  return (
    <Map
      reuseMaps
      preventStyleDiffing
      mapLib={maplibregl}
      mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      antialias
      initialViewState={INITIAL_FIRE_VIEW_STATE}
    >
      <DeckGLOverlay
        antialias
        getTooltip={getTooltip}
        interleaved
        effects={[LIGHTING]}
      >
        <PolygonLayer
          id={'ground'}
          data={[
            [
              [-119.99582643167989 - 1, 37.88453894208306 - 1],
              [-119.99582643167989 - 1, 37.88453894208306 + 1],
              [-119.99582643167989 + 1, 37.88453894208306 + 1],
              [-119.99582643167989 + 1, 37.88453894208306 - 1],
            ],
          ]}
          stroked={false}
          getPolygon={(f) => f}
          getFillColor={[0, 0, 0, 0]}
          getPolygonOffset={({ layerIndex }) => [0, layerIndex * 1000]}
          beforeId={'background'}
        />
        <WildfireLayer
          id={'slide-fire'}
          {...curState}
          zoomRange={[9, 14]}
          beforeId={'place_hamlet'}
        />
      </DeckGLOverlay>
    </Map>
  );
}

function _Wildfire({ curInput }) {
  const { current: mapbox } = useMap();

  // useEffect(() => {
  //   if (!mapbox) return;

  //   const curState = {
  //     data,
  //     ...curInput,
  //   };
  //   mapbox.on('load', () => {
  //     const overlay = new MapboxOverlay({
  //       interleaved: true,
  //       effects: [LIGHTING],

  //       layers: [
  //         new PolygonLayer({
  //           id: 'ground',
  //           data: [
  //             [
  //               [-119.99582643167989 - 1, 37.88453894208306 - 1],
  //               [-119.99582643167989 - 1, 37.88453894208306 + 1],
  //               [-119.99582643167989 + 1, 37.88453894208306 + 1],
  //               [-119.99582643167989 + 1, 37.88453894208306 - 1],
  //             ],
  //           ],
  //           stroked: false,
  //           getPolygon: (f) => f,
  //           getFillColor: [0, 0, 0, 0],
  //           getPolygonOffset: ({ layerIndex }) => [0, layerIndex * 1000],
  //           beforeId: 'background',
  //         }),
  //         new WildfireLayer({
  //           id: 'slide-fire',
  //           ...curState,
  //           zoomRange: [9, 14],
  //           beforeId: 'place_hamlet',
  //         }),
  //       ],
  //     });
  //     mapbox.getMap().addControl(overlay).setLight({
  //       anchor: 'viewport',
  //       color: 'yellow',
  //       intensity: 1,
  //     });
  //   });
  // }, []);
}

class WildfireLayer extends CompositeLayer {
  renderLayers() {
    const { data, visible, zoomRange } = this.props;

    return [
      new SolidHexTileLayer({
        id: `DiffRings`,
        data,
        thicknessRange: [0, 1],
        getFillColor: (d) =>
          FIRE_INTERPS.power.interpColor(
            d['properties']['power'],
            false,
            false
          ),
        extruded: true,
        getElevation: (d) =>
          3000 *
          Math.pow(
            FIRE_INTERPS.power.scaleLinearVar(d['properties']['confidence']),
            4
          ),
        stroked: false,
        getValue: (d) =>
          FIRE_INTERPS.power.scaleLinearVar(d['properties']['confidence']),
        visible,
        zoomRange,
      }),
      new IconHexTileLayer({
        id: `ScenarioUnmet`,
        raised: true,
        getElevation: (d) =>
          3000 *
          Math.pow(
            FIRE_INTERPS.power.scaleLinearVar(d['properties']['confidence']),
            4
          ),
        data,
        loaders: [OBJLoader],
        mesh: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/humanoid_quad.obj',
        getColor: [0, 188, 242],
        getValue: (d) =>
          FIRE_INTERPS.personnel.scaleLinear(d['properties']['personnel']),
        visible,
        sizeScale: 400,
        zoomRange,
      }),
      new DeaggregatedLayer({
        ...this.props,
        id: 'DeagLayer',
        data,
      }),
    ];
  }
}

WildfireLayer.layerName = 'WildfireLayer';
WildfireLayer.defaultProps = {
  ...CompositeLayer.defaultProps,
  autoHighlight: true,
};

class DeaggregatedLayer extends CompositeLayer {
  renderLayers() {
    const { data, visible, zoomRange, selectionFinalized = false } = this.props;

    return [
      new SolidHexTileLayer({
        id: `HoveringTiles`,
        data,
        stroked: false,
        thicknessRange: [0, 1],
        getFillColor: [0, 0, 0, 0],
        pickable: !selectionFinalized,
        autoHighlight: !selectionFinalized,
        visible,
        zoomRange,
      }),
    ];
  }
}

DeaggregatedLayer.layerName = 'DeaggregatedLayer';
DeaggregatedLayer.defaultProps = {
  ...CompositeLayer.defaultProps,
  autoHighlight: true,
};

function useHexTooltip({ speedyCounter, curOption }) {
  const mainTooltipElem = useRef();
  const secondaryTooltipElem = useRef();
  const lastObject = useRef({});

  useEffect(() => {
    mainTooltipElem.current = document.querySelector('#main-tooltip');
    secondaryTooltipElem.current = document.querySelector('#secondary-tooltip');
  }, []);

  const handleHex = useCallback(
    (object) => {
      const power = object['properties']['power'];
      const confidence = object['properties']['confidence'];
      const personnel = object['properties']['personnel'];

      secondaryTooltipElem.current.classList.remove('active');
      mainTooltipElem.current.classList.add('active');
      mainTooltipElem.current.innerHTML = `\
      <div><b>Power</b> ${power}</div>
      <div><b>Confidence</b> ${confidence}</div>
      <div><b>Personnel</b> ${personnel}</div>
      `;
    },
    [speedyCounter]
  );

  const getTooltip = useCallback(
    ({ object }) => {
      if (!object) {
        secondaryTooltipElem.current.classList.remove('active');
        mainTooltipElem.current.classList.remove('active');
        return;
      }

      handleHex(object);

      lastObject.current = object;
    },
    [speedyCounter, curOption]
  );

  return { getTooltip };
}
