import React, { useState } from 'react';

import * as d3 from 'd3';
import maplibregl from 'maplibre-gl';
import { Map } from 'react-map-gl';
import { INITIAL_VIEW_STATE, LIGHTING } from 'src/utils/settings';

import { demandUnitGeo as dataDeag } from 'src/data/demandUnitGeo';
import { waterDataHex as data } from 'src/data/waterDataHex';

import { CALI_BBOX } from 'src/data/groundwaterGeo';

import useGUI from './water/useGUI';
import useHexMouseEvts from './water/useHexMouseEvts';
import useHexTooltip from './water/useHexTooltip';

import { GeoJsonLayer } from 'deck.gl';
import DeckGLOverlay from 'src/utils/overlay';
import GUI from './water/GUI';
import MultivariableHextileFlatLayer from './water/MultivariableHextileFlatLayer';

const RES_RANGE = Object.keys(data).map((d) => parseInt(d));
const ZOOM_RANGE = [7, 9];

export default function CentralValleyWaterFlat() {
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
        initialViewState={{ ...INITIAL_VIEW_STATE, maxPitch: 0, pitch: 0 }}
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
          <MultivariableHextileFlatLayer
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
