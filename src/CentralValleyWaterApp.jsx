import React, { useState } from 'react';

import DeckGL from '@deck.gl/react';
import maplibregl from 'maplibre-gl';
import { Map } from 'react-map-gl';
import mapStyle from 'src/assets/style.json';
import { INITIAL_VIEW_STATE, LIGHTING } from 'src/utils/settings';
import * as d3 from 'd3';

import { demandUnitGeo as dataDeag } from 'src/data/demandUnitGeo';
import { waterDataHex as data } from 'src/data/waterDataHex';

import { CALI_BBOX } from 'src/data/groundwaterGeo';

import useGUI from './water/useGUI';
import useHexMouseEvts from './water/useHexMouseEvts';
import useHexTooltip from './water/useHexTooltip';

import BaseTerrainLayer from './water/BaseTerrainLayer';
import GUI from './water/GUI';
import MultivariableHextileLayer from './water/MultivariableHextileLayer';
import DeckGLOverlay from 'src/utils/overlay';
import { GeoJsonLayer, PolygonLayer } from 'deck.gl';

const RES_RANGE = Object.keys(data).map((d) => parseInt(d));
const ZOOM_RANGE = [7, 9];

export default function CentralValleyWater() {
  const [zoom, setZoom] = useState(INITIAL_VIEW_STATE.zoom);

  const curInput = useGUI();
  const hexMouseEvts = useHexMouseEvts({
    dataDeag,
    deagKey: 'DURgs',
  });
  const hexTooltip = useHexTooltip(curInput);

  return (
    <>
      <Map
        reuseMaps
        preventStyleDiffing
        mapLib={maplibregl}
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
        antialias
        initialViewState={INITIAL_VIEW_STATE}
      >
        <DeckGLOverlay
          getTooltip={hexTooltip}
          interleaved
          effects={[LIGHTING]}
          onViewStateChange={({ viewState }) => {
            setZoom(viewState.zoom);
          }}
        >
          <GeoJsonLayer
            id="ground"
            data={CALI_BBOX}
            stroked={false}
            getFillColor={[0, 0, 0, 0]}
            beforeId={'landcover'}
          />
          <MultivariableHextileLayer
            id="slide-waters"
            data={data}
            zoomRange={ZOOM_RANGE}
            visible
            {...{
              ...curInput,
              ...hexMouseEvts,
            }}
            beforeId={'place_hamlet'}
          />
        </DeckGLOverlay>
      </Map>
      <GUI
        res={d3.scaleQuantize().domain(ZOOM_RANGE).range(RES_RANGE)(zoom)}
        {...curInput}
      />
    </>
  );
}
