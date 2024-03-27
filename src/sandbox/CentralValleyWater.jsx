import React, { useRef, useState } from 'react';

import DeckGL from '@deck.gl/react';
import maplibregl from 'maplibre-gl';
import { Map } from 'react-map-gl';
import mapStyle from 'src/assets/style.json';
import { INITIAL_VIEW_STATE, LIGHTING } from 'src/utils/settings';
import * as d3 from 'd3';

import {
  temporalDataHex as data,
  temporalDataGeo as dataDeag,
} from 'src/utils/data';

import useGUI from './useGUI';
import useHexMouseEvts from './useHexMouseEvts';
import useHexTooltip from './useHexTooltip';

import BaseTerrainLayer from './BaseTerrainLayer';
import BasicGeoLayer from './BasicGeoLayer';
import GUI from './GUI';
import MultivariableHextileLayer from './MultivariableHextileLayer';

export default function CentralValleyWater() {
  const { current: resRange } = useRef(
    Object.keys(data).map((d) => parseInt(d))
  );
  const [zoom, setZoom] = useState(INITIAL_VIEW_STATE.zoom);
  const [useVsup, setUseVsup] = useState(false);
  const [showAllRings, setShowAllRings] = useState(false);

  const curInput = useGUI();
  const hexMouseEvts = useHexMouseEvts({
    disabled: curInput.curOption > 1,
    dataDeag,
    deagKey: 'DURgs',
  });
  const { getTooltip } = useHexTooltip(curInput);

  const curState = {
    data,
    ...curInput,
    ...hexMouseEvts,
  };

  return (
    <>
      <DeckGL
        controller
        effects={[LIGHTING]}
        initialViewState={INITIAL_VIEW_STATE}
        getTooltip={getTooltip}
        onViewStateChange={({ viewState }) => {
          setZoom(viewState.zoom);
        }}
      >
        <Map
          reuseMaps
          preventStyleDiffing
          mapLib={maplibregl}
          mapStyle={mapStyle}
        />
        <BaseTerrainLayer id="slide-terrain" {...curState} />
        <MultivariableHextileLayer
          id="slide-waters"
          {...curState}
          zoomRange={[7, 9]}
          visible
          useVsup={useVsup}
          showAllRings={showAllRings}
        />
      </DeckGL>
      <GUI
        {...curState}
        res={d3.scaleQuantize().domain([0, 1]).range(resRange)(
          d3.scaleLinear().domain([7, 9]).range([0, 1]).clamp(true)(zoom)
        )}
        useVsup={useVsup}
        setUseVsup={setUseVsup}
        showAllRings={showAllRings}
        setShowAllRings={setShowAllRings}
      />
    </>
  );
}
