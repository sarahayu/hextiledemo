import React from 'react';

import DeckGL from '@deck.gl/react';
import maplibregl from 'maplibre-gl';
import { Map } from 'react-map-gl';
import mapStyle from 'src/assets/style.json';
import { LIGHTING } from 'src/utils/settings';

import SandboxSlide from 'src/sandbox/SandboxSlide';

import { useState } from 'react';

import { temporalDataGeo, temporalDataHex } from 'src/utils/data';

import useCamera from 'src/scrollyline/hooks/useCamera';
import useCounters from 'src/scrollyline/hooks/useCounters';

import Clock from 'src/Clock';

import area from '@turf/area';
import booleanIntersects from '@turf/boolean-intersects';
import intersect from '@turf/intersect';

import { h3ToFeature } from 'geojson2h3';
import GUI from './GUI';
import SlideTerrain from './SlideTerrain';
import useGUI from './useGUI';
import useHexTooltip from './useHexTooltip';

export default function Sandbox() {
  const [curScenario, setCurScenario] = useState(0);
  const [curHex, setCurHex] = useState(null);
  const [hovHex, setHovHex] = useState(null);
  const [clickHex, setClickHex] = useState({
    type: 'FeatureCollection',
    features: [],
  });
  const [clickHex2, setClickHex2] = useState({});

  const [hovHexArr, setHovHexArr] = useState(null);
  const [clickHexArr, setClickHexArr] = useState(null);

  const [hovHovHexArr, setHovHovHexArr] = useState([]);

  const curState = {
    data: temporalDataHex,
    curScenario,
    setCurScenario,
    curHex,
    setCurHex,
    hovHovHexArr,
    setHovHovHexArr,
    hovHex,
    setHovHex,
    clickHex,
    setClickHex,
    clickHex2,
    setClickHex2,
    hovHexArr,
    setHovHexArr,
    clickHexArr,
    setClickHexArr,
  };

  const sandboxGUI = useGUI();
  const counters = useCounters(curState);
  const { curViewState, transitioning } = useCamera(curState);
  const { getTooltip } = useHexTooltip({
    ...curState,
    ...counters,
  });

  const params = {
    ...curState,
    ...counters,
    transitioning,
  };

  const layers = [
    new SlideTerrain(params),
    new SandboxSlide({
      ...params,
      ...sandboxGUI,
      autoHighlight: true,
      onHover: ({ object }) => {
        if (!object)
          return setHovHexArr(null) || setHovHex({}) || setHovHovHexArr([]);
        if (curHex) {
          setHovHexArr(null);
          setHovHex({});
          const h = h3ToFeature(curHex);
          if (object) {
            console.log('hovering over geo object');
            setHovHovHexArr([object.properties.DU_ID]);
            // setHovHovHexArr(
            //   temporalDataGeo.features
            //     .filter((f) => {
            //       return booleanIntersects(h, f.geometry);
            //     })
            //     .map((f) => {
            //       return f.properties.DU_ID;
            //     })
            // );
          }
        }
        const h = h3ToFeature(object.hexId);
        return setHovHexArr(
          temporalDataGeo.features
            .filter((f) => {
              return booleanIntersects(h, f.geometry);
            })
            .map((f) => {
              setHovHex((a) => ({
                ...a,
                [f.properties.DU_ID]: area(intersect(h, f.geometry)) / area(h),
              }));
              return f.properties.DU_ID;
            })
        );
      },
      onClick: ({ object }) => {
        if (curHex == object.hexId) {
          return (
            setClickHexArr(null) ||
            setClickHex({
              type: 'FeatureCollection',
              features: [],
            }) ||
            setClickHex2({}) ||
            setCurHex(null)
          );
        }
        if (hovHovHexArr.includes(object.properties.DU_ID)) {
          return (
            setClickHexArr(null) ||
            setClickHex({
              type: 'FeatureCollection',
              features: [],
            }) ||
            setClickHex2({}) ||
            setCurHex(null)
          );
        }
        if (curHex) return;
        setClickHex({
          type: 'FeatureCollection',
          features: [],
        });

        setHovHexArr(null);
        setHovHex({});

        setCurHex(object.hexId);
        const h = h3ToFeature(object.hexId);
        return setClickHexArr(
          temporalDataGeo.features
            .filter((f) => {
              return booleanIntersects(h, f.geometry);
            })
            .map((f) => {
              const fh = intersect(h, f.geometry);
              // console.log(fh);
              const are = area(fh) / area(h);
              setClickHex((a) => ({
                type: 'FeatureCollection',
                features: [
                  ...a.features,
                  {
                    ...fh,
                    properties: { ...f.properties, area: are },
                  },
                ],
              }));
              setClickHex2((a) => ({
                ...a,
                [f.properties.DU_ID]: { ...f.properties, area: are },
              }));
              // console.log(clickHex2);
              return f.properties.DU_ID;
            })
        );
      },
    }),
  ];

  return (
    <>
      <DeckGL
        layers={layers}
        effects={[LIGHTING]}
        initialViewState={curViewState}
        controller={true}
        getTooltip={getTooltip}
      >
        <Map
          reuseMaps
          mapLib={maplibregl}
          mapStyle={mapStyle}
          preventStyleDiffing={true}
        />
      </DeckGL>
      <Clock
        counter={counters.speedyCounter}
        displayMonth={false}
        dataset="averageDemandBaseline"
      />
      <GUI {...{ ...params, ...sandboxGUI }} />
    </>
  );
}
