import React, { useCallback, useEffect, useRef, useState } from 'react';

import { MapboxOverlay } from '@deck.gl/mapbox';
import { OBJLoader } from '@loaders.gl/obj';
import { BitmapLayer, CompositeLayer, PolygonLayer, TileLayer } from 'deck.gl';
import { useMap } from 'react-map-gl';
import IconHexTileLayer from 'src/hextile/IconHexTileLayer';
import SolidHexTileLayer from 'src/hextile/SolidHexTileLayer';

import { FIRE_INTERPS } from 'src/utils/scales';

import maplibregl from 'maplibre-gl';
import Map from 'react-map-gl/maplibre';
import { INITIAL_FIRE_VIEW_STATE, LIGHTING } from 'src/utils/settings';

import { fireDataHex as data } from 'src/utils/data';

import useGUI from './useGUI';

// function DeckGLOverlay(props) {
//   const overlay = useControl(() => new MapboxOverlay(props));
//   overlay.setProps(props);
//   return null;
// }

export default function Wildfire() {
  const curInput = useGUI();
  const { getTooltip } = useHexTooltip(curInput);

  return (
    <Map
      getTooltip={getTooltip}
      id="mymap"
      style={{ width: 1200, height: 800 }}
      effects={[LIGHTING]}
      light={{
        anchor: 'viewport',
        color: 'yellow',
        intensity: 1,
      }}
      antialias
      interleaved
      initialViewState={INITIAL_FIRE_VIEW_STATE}
      mapLib={maplibregl}
      mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      preventStyleDiffing={true}
    >
      <_Wildfire curInput={curInput} />
    </Map>
  );
}

function _Wildfire({ curInput }) {
  const { current: mapbox } = useMap();

  useEffect(() => {
    if (!mapbox) return;

    const curState = {
      data,
      ...curInput,
    };
    mapbox.on('load', () => {
      const overlay = new MapboxOverlay({
        interleaved: true,
        effects: [LIGHTING],

        layers: [
          new TileLayer({
            id: 'carto',
            data: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/{z}/{y}/{x}',
            minZoom: 7,
            maxZoom: 11,
            tileSize: 256,
            // zoomOffset: -1,

            renderSubLayers: (props) => {
              const {
                bbox: { west, south, east, north },
              } = props.tile;

              return new BitmapLayer(props, {
                data: null,
                image: props.data,
                bounds: [west, south, east, north],
              });
            },
            beforeId: 'waterway',
          }),
          new TileLayer({
            id: 'supply',
            data: 'http://infovis.cs.ucdavis.edu/mapProxy/wmts/fbfm40/webmercator/{z}/{x}/{y}.png',
            minZoom: 7,
            maxZoom: 11,
            tileSize: 256,
            // zoomOffset: -1,

            renderSubLayers: (props) => {
              const {
                bbox: { west, south, east, north },
              } = props.tile;

              if (-(west - -119.94742725262628) < north - 37.90192590898632)
                return new BitmapLayer(props, {
                  data: null,
                  image: props.data,
                  bounds: [west, south, east, north],
                });
            },
            beforeId: 'waterway',
          }),
          new PolygonLayer({
            id: 'ground',
            data: [
              [
                [-119.99582643167989 - 1, 37.88453894208306 - 1],
                [-119.99582643167989 - 1, 37.88453894208306 + 1],
                [-119.99582643167989 + 1, 37.88453894208306 + 1],
                [-119.99582643167989 + 1, 37.88453894208306 - 1],
              ],
            ],
            stroked: false,
            getPolygon: (f) => f,
            getFillColor: [0, 0, 0, 0],
            getPolygonOffset: ({ layerIndex }) => [0, layerIndex * 1000],
            beforeId: 'background',
          }),
          new WildfireLayer({
            id: 'slide-fire',
            ...curState,
            visible: curInput.curOption == 0 || curInput.curOption == 1,
            // beforeId: 'waterway_label',
          }),
        ],
      });
      mapbox.getMap().addControl(overlay).setLight({
        anchor: 'viewport',
        color: 'yellow',
        intensity: 1,
      });
    });
  }, []);
}

class WildfireLayer extends CompositeLayer {
  renderLayers() {
    const { data, visible } = this.props;

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
    const { data, visible, selectionFinalized = false } = this.props;

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
