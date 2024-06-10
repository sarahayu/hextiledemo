import React from 'react';
import { useCallback, useState } from 'react';

import DeckGL from '@deck.gl/react';
import maplibregl from 'maplibre-gl';
import { Map } from 'react-map-gl';
import mapStyle from 'src/assets/style.json';
import { LIGHTING } from 'src/utils/settings';

import { electionDataHex as data } from 'src/data/electionDataHex';

import useGUI from './election/useGUI';
import useHexTooltip from './election/useHexTooltip';

import { MapView, View } from 'deck.gl';
import useHexMouseEvts from 'src/water/useHexMouseEvts';
import {
  electionCountyGeo,
  electionPrecinctGeo,
} from './data/electionPrecinctGeo';
import BaseTerrainLayer from './election/BaseTerrainLayer';

import { GeoJsonLayer } from 'deck.gl';
import { useLayoutEffect, useRef } from 'react';
import { ELECTION_INTERPS } from 'src/utils/electionInterps';

import * as d3 from 'd3';
import * as vsup from 'vsup';

export default function Election2020Mult() {
  const curInput = useGUI();
  const hexMouseEvts = useHexMouseEvts({
    disabled: curInput.curOption > 1,
    dataDeag: electionPrecinctGeo,
    deagKey: 'PrecinctRgs',
  });
  const getTooltip = useHexTooltip({ ...curInput, hextiles: false });

  const curState = {
    data,
    ...curInput,
    ...hexMouseEvts,
  };
  const [viewStates, setViewStates] = useState({
    longitude: -97.7431,
    latitude: 30.2672,
    zoom: 5,
    minZoom: 3,
    maxZoom: 15,
    pitch: 50.85,
    bearing: 32.58,
  });
  const onViewStateChange = useCallback(({ viewId, viewState }) => {
    setViewStates({
      one: viewState,
      two: viewState,
      three: viewState,
    });
  }, []);

  return (
    <>
      <DeckGL
        controller
        effects={[LIGHTING]}
        viewState={viewStates}
        onViewStateChange={onViewStateChange}
        getTooltip={getTooltip}
        layerFilter={({ layer, viewport }) => {
          return (
            layer.id == 'slide-terrain' ||
            (layer.id == 'Pop' && viewport.id == 'one') ||
            (layer.id == 'Votes' && viewport.id == 'two') ||
            (layer.id == 'Demog' && viewport.id == 'three')
          );
        }}
        views={[
          new MapView({
            id: 'one',
            x: '0%',
            y: '0%',
            height: '50%',
            width: '50%',
            controller: true,
          }),
          new MapView({
            id: 'two',
            x: '50%',
            y: '0%',
            height: '50%',
            width: '50%',
            controller: true,
          }),
          new MapView({
            id: 'three',
            x: '25%',
            y: '50%',
            height: '50%',
            width: '50%',
            controller: true,
          }),
        ]}
      >
        <View id="one">
          <Map
            reuseMaps
            preventStyleDiffing
            mapLib={maplibregl}
            mapStyle={mapStyle}
          />
        </View>
        <View id="two">
          <Map
            reuseMaps
            preventStyleDiffing
            mapLib={maplibregl}
            mapStyle={mapStyle}
          />
        </View>
        <View id="three">
          <Map
            reuseMaps
            preventStyleDiffing
            mapLib={maplibregl}
            mapStyle={mapStyle}
          />
        </View>
        <BaseTerrainLayer id="slide-terrain" {...curState} />
        <GeoJsonLayer
          id={'Pop'}
          data={electionCountyGeo}
          opacity={1}
          stroked={true}
          lineWidthScale={100}
          filled={true}
          getFillColor={(d) =>
            ELECTION_INTERPS.population.interpColor(
              d.properties['Population per Sqkm'],
              false,
              false
            )
          }
          pickable={true}
          autoHighlight={true}
        />
        <GeoJsonLayer
          id={'Votes'}
          data={electionPrecinctGeo}
          opacity={1}
          stroked={true}
          lineWidthScale={100}
          filled={true}
          getFillColor={(d) =>
            ELECTION_INTERPS.party.interpColor(
              d.properties.DemLeadCount,
              false,
              false
            )
          }
          pickable={true}
          autoHighlight={true}
        />
        <GeoJsonLayer
          id={'Demog'}
          data={electionCountyGeo}
          opacity={1}
          stroked={true}
          lineWidthScale={100}
          filled={true}
          getFillColor={(d) =>
            ELECTION_INTERPS.poc.interpColor(
              d.properties['PoCCount'] || 0,
              false,
              false
            )
          }
          pickable={true}
          autoHighlight={true}
        />
      </DeckGL>
      <GUI {...curState} />
    </>
  );
}

function GUI({
  curOption,
  setCurOption,
  speedyCounter,
  setSpeedyCounter,
  playing,
  setPlaying,
}) {
  return (
    <>
      <Legend />
    </>
  );
}

function Legend({}) {
  const legendArea = useRef();

  useLayoutEffect(() => {
    const height = 500;
    const width = 400;
    d3.select(legendArea.current)
      .attr('width', width)
      .attr('height', height)
      .call(function (a) {
        a.append('g').call(
          vsup.legend
            .simpleLegend(null, 250, 20, '.2s')
            .title('Population / Km2')
            .size(250)
            .height(20)
            .scale(ELECTION_INTERPS.population.colorsStepped)
            .x(width - 280)
            .y(height - 240)
        );
      })
      .call(function (a) {
        a.append('g').call(
          vsup.legend
            .simpleLegend(null, 250, 20, '.2s')
            .title('Percent Democrat Lead')
            .size(250)
            .height(20)
            .scale(ELECTION_INTERPS.party.colorsStepped)
            .x(width - 280)
            .y(height - 170)
        );
      })
      .call(function (a) {
        a.append('g').call(
          vsup.legend
            .simpleLegend(null, 250, 20, '.2s')
            .title('Percent PoC')
            .size(250)
            .height(20)
            .scale(ELECTION_INTERPS.poc.colorsStepped)
            .x(width - 280)
            .y(height - 100)
        );
      });
  }, []);

  return <svg className="legend-area" ref={legendArea}></svg>;
}
