import React, { useRef, useState } from 'react';

import DeckGL from '@deck.gl/react';
import maplibregl from 'maplibre-gl';
import { Map } from 'react-map-gl';
import mapStyle from 'src/assets/style.json';
import { INITIAL_VIEW_STATE, LIGHTING } from 'src/utils/settings';
import * as d3 from 'd3';
import * as h3 from 'h3-js';

import {
  electionDataHex as data,
  electionPrecinctGeo as dataDeag,
} from 'src/utils/data';

import useGUI from './useGUI';
import useHexTooltip from './useHexTooltip';

import BaseTerrainLayer from './BaseTerrainLayer';
import UserHexLayer from './MultivariableHextileLayer';
import useHexMouseEvts from 'src/sandbox/useHexMouseEvts';
import Legend from './Legend';
import { valueInterpResolution } from 'src/utils/scales';
import { USER_VIEW } from './user_settings';

export default function Election2020({ visible }) {
  const { current: resRange } = useRef(
    Object.keys(data).map((d) => parseInt(d))
  );
  const [zoom, setZoom] = useState(5);

  const curInput = useGUI();
  // const hexMouseEvts = useHexMouseEvts({
  //   disabled: curInput.curOption > 1,
  //   dataDeag,
  //   deagKey: 'PrecinctRgs',
  // });
  const { getTooltip } = useHexTooltip(curInput);

  const curState = {
    data,
    ...curInput,
    // ...hexMouseEvts,
  };

  return (
    <>
      <DeckGL
        controller
        effects={[LIGHTING]}
        initialViewState={USER_VIEW}
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
        <UserHexLayer
          id="slide-election"
          {...curState}
          zoomRange={[0, 1]}
          visible={visible}
        />
      </DeckGL>
      <GUI
        res={d3.scaleQuantize().domain([0, 1]).range(resRange)(
          d3.scaleLinear().domain([5, 8]).range([0, 1]).clamp(true)(zoom)
        )}
      />
    </>
  );
}

function GUI(props) {
  return (
    <>
      <Legend {...props} />
    </>
  );
}
