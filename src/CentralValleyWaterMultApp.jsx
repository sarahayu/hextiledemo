import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';

import DeckGL from '@deck.gl/react';
import maplibregl from 'maplibre-gl';
import { Map } from 'react-map-gl';
import mapStyle from 'src/assets/style.json';
import { INITIAL_VIEW_STATE, LIGHTING, SCENARIOS } from 'src/utils/settings';
import { groundwaterGeo } from 'src/utils/data';
import { demandUnitGeo } from 'src/utils/data';

import {
  waterDataHex as data,
  demandUnitGeo as dataDeag,
} from 'src/utils/data';

import * as d3 from 'd3';
import * as vsup from 'vsup';
import useGUI from './water/useGUI';
import useHexMouseEvts from './water/useHexMouseEvts';
import useHexTooltip from './water/useHexTooltip';

import BaseTerrainLayer from './water/BaseTerrainLayer';
import { GeoJsonLayer, MapView, View } from 'deck.gl';
import { WATER_INTERPS } from 'src/utils/scales';
import Clock from 'src/Clock';

const SCENARIO = SCENARIOS[0];

export default function CentralValleyWaterMult() {
  const curInput = useGUI();
  const hexMouseEvts = useHexMouseEvts({
    disabled: curInput.curOption > 1,
    dataDeag,
    deagKey: 'DURgs',
  });
  const getTooltip = useHexTooltip({ ...curInput, hextiles: false });

  const curState = {
    data,
    ...curInput,
    ...hexMouseEvts,
  };
  const [viewStates, setViewStates] = useState(INITIAL_VIEW_STATE);
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
            (layer.id == 'GroundwaterGeo' && viewport.id == 'one') ||
            (layer.id == 'UDemGeo' && viewport.id == 'two') ||
            (layer.id == 'DemDiffGeo' && viewport.id == 'three')
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
          id={'GroundwaterGeo'}
          data={groundwaterGeo}
          opacity={1}
          stroked={false}
          filled={true}
          getFillColor={(d) => [
            ...WATER_INTERPS.groundwater.interpColor(
              d.properties.Groundwater[curInput.speedyCounter]
            ),
            255,
          ]}
          updateTriggers={{
            getFillColor: [curInput.speedyCounter],
          }}
          pickable={true}
          autoHighlight={true}
        />
        <GeoJsonLayer
          id={'UDemGeo'}
          data={demandUnitGeo}
          opacity={1}
          stroked={false}
          filled={true}
          getFillColor={(d) => [
            ...WATER_INTERPS.unmetDemand.interpColor(
              d.properties.UnmetDemand[SCENARIO][curInput.speedyCounter]
            ),
            255,
          ]}
          updateTriggers={{
            getFillColor: [curInput.speedyCounter],
          }}
          pickable={true}
          autoHighlight={true}
        />
        <GeoJsonLayer
          id={'DemDiffGeo'}
          data={demandUnitGeo}
          opacity={1}
          stroked={false}
          filled={true}
          getFillColor={(d) => [
            ...WATER_INTERPS.difference.interpColor(
              d.properties.UnmetDemand[SCENARIO][curInput.speedyCounter] -
                d.properties.UnmetDemandBaseline[curInput.speedyCounter]
            ),
            255,
          ]}
          updateTriggers={{
            getFillColor: [curInput.speedyCounter],
          }}
          pickable={true}
          autoHighlight={true}
        />
      </DeckGL>
      <GUI {...curState} />
    </>
  );
}

function GUI({ speedyCounter, setSpeedyCounter, playing, setPlaying }) {
  return (
    <>
      <Clock
        counter={speedyCounter}
        displayMonth={false}
        dataset="averageDemandBaseline"
      />
      <Legend />
      <div className="styled-input" style={{ bottom: '20px' }}>
        <button
          onClick={() => {
            setPlaying((p) => !p);
          }}
        >
          {playing ? 'Pause' : 'Play'}
        </button>
        <input
          onChange={function (e) {
            setPlaying(false);
            setSpeedyCounter(parseInt(e.target.value));
          }}
          onInput={function (e) {
            setSpeedyCounter(parseInt(e.target.value));
          }}
          value={speedyCounter}
          style={{
            width: '40vw',
            display: 'block',
          }}
          type="range"
          min="0"
          max="1199"
          id="myRange"
        />
        <input
          style={{
            width: '10ch',
            display: 'block',
          }}
          type="number"
          value={speedyCounter}
          onChange={function (e) {
            setSpeedyCounter(parseInt(e.target.value));
          }}
        />
      </div>
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
            .title('GW (ft)')
            .size(250)
            .height(20)
            .scale(WATER_INTERPS.groundwater.colorsStepped)
            .x(width - 280)
            .y(height - 240)
        );
      })
      .call(function (a) {
        a.append('g').call(
          vsup.legend
            .simpleLegend(null, 250, 20, '.2s')
            .title('Scenario Unmet (600 TAF/km2)')
            .size(250)
            .height(20)
            .scale(WATER_INTERPS.unmetDemandPositive.colorsStepped)
            .x(width - 280)
            .y(height - 170)
        );
      })
      .call(function (a) {
        a.append('g').call(
          vsup.legend
            .simpleLegend(null, 250, 20, '.2s')
            .title('Diff. w/ BL (600 TAF / km2)')
            .size(250)
            .height(20)
            .scale(WATER_INTERPS.difference.colorsStepped)
            .x(width - 280)
            .y(height - 100)
        );
      });
  }, []);

  return <svg className="legend-area" ref={legendArea}></svg>;
}
