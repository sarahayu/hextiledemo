import React from 'react';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import DeckGL from '@deck.gl/react';
import * as d3 from 'd3';
import * as h3 from 'h3-js';
import maplibregl from 'maplibre-gl';
import { Map } from 'react-map-gl';
import mapStyle from 'src/assets/style.json';
import { LIGHTING } from 'src/utils/settings';
import * as vsup from 'vsup';

import {
  electionDataHex as hexData,
  electionDataSquare as squareData,
} from 'src/utils/data';

import { FlyToInterpolator } from 'deck.gl';
import { ELECTION_INTERPS } from 'src/utils/scales';
import {
  arcmapLegendPretty,
  download,
  getFormattedTime,
  hexLegendU,
  hexLegendV,
  hexagonShape,
  iconhexLegendU,
  iconhexLegendV,
} from 'src/utils/utils';
import BaseTerrainLayer from './study_interface/BaseTerrainLayer';
import UserSquareLayer from './study_interface/Election2020Square';
import UserHexLayer from './study_interface/Election2020';
import generateQs from './study_interface/generate_qs';
import { USER_VIEW } from './study_interface/user_settings';

const resRange = Object.keys(hexData).map((d) => parseInt(d));

const questions = generateQs();
export default function StudyInterface() {
  const [zoom, setZoom] = useState(5);

  const allAns = useRef([]);
  const [question, setQuestion] = useState(-1);
  const [enteredText, setEnteredText] = useState('');
  const [startTime, setStartTime] = useState();
  const [useVsup, setUseVsup] = useState(false);
  const [interSlide, setInterSlide] = useState(false);
  const { curViewState, zoomInHex, zoomInSquare } = useCamera();

  const curState = {
    data: hexData,
  };

  const handleStart = () => {
    setQuestion((c) => {
      if (questions[c + 1].map == 'hex')
        zoomInHex(questions[c + 1].a, () => {
          setStartTime(Date.now());
        });
      else
        zoomInSquare(questions[c + 1].a, () => {
          setStartTime(Date.now());
        });
      return c + 1;
    });
  };

  const handleClick = useCallback(() => {
    if (!interSlide) {
      const d = {
        ...questions[question],
        user: enteredText,
        time: Date.now() - startTime,
      };

      console.log(d);
      allAns.current.push(d);

      setEnteredText('');

      if (question == 29) {
        setInterSlide(true);
      } else {
        setQuestion((c) => {
          if (c + 1 < questions.length) {
            if (questions[c + 1].type == 'text') {
              if (questions[c + 1].map == 'hex')
                zoomInHex(questions[c + 1].a, () => {
                  setStartTime(Date.now());
                });
              else
                zoomInSquare(questions[c + 1].a, () => {
                  setStartTime(Date.now());
                });
            } else {
              setStartTime(Date.now());
            }
          }
          return c + 1;
        });
      }
    } else {
      setEnteredText('');
      setInterSlide(false);
      setQuestion((c) => {
        if (c + 1 < questions.length) {
          if (questions[c + 1].type == 'text') {
            if (questions[c + 1].map == 'hex')
              zoomInHex(questions[c + 1].a, () => {
                setStartTime(Date.now());
              });
            else
              zoomInSquare(questions[c + 1].a, () => {
                setStartTime(Date.now());
              });
          } else {
            setStartTime(Date.now());
          }
        }
        return c + 1;
      });
    }
  });

  const submitAnswer = useCallback(
    ({ object }) => {
      const d = {
        ...questions[question],
        user: object.hexId,
        time: Date.now() - startTime,
      };
      console.log(d);
      allAns.current.push(d);

      setQuestion((c) => {
        if (c + 1 < questions.length) {
          if (questions[c + 1].type == 'text') {
            if (questions[c + 1].map == 'hex')
              zoomInHex(questions[c + 1].a, () => {
                setStartTime(Date.now());
              });
            else
              zoomInSquare(questions[c + 1].a, () => {
                setStartTime(Date.now());
              });
          } else {
            setStartTime(Date.now());
          }
        }
        return c + 1;
      });
    },
    [startTime, question]
  );

  useEffect(() => {
    if (question == questions.length) {
      console.log(allAns.current);
      let xhr = new XMLHttpRequest();
      xhr.open(
        'POST',
        `https://userstudy-4f273-default-rtdb.firebaseio.com/${getFormattedTime()}.json`,
        true
      );
      xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

      // send the collected data as JSON
      xhr.send(JSON.stringify(allAns.current));
    }
  }, [question]);

  return (
    <>
      <DeckGL
        controller
        effects={[LIGHTING]}
        initialViewState={curViewState}
        onViewStateChange={({ viewState }) => {
          // console.log(viewState.zoom);
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
          pickable={(questions[question] || {}).type === 'click' && !interSlide}
          autoHighlight={
            (questions[question] || {}).type === 'click' && !interSlide
          }
          id="slide-hex"
          {...{
            data: hexData,
          }}
          zoomRange={[0, 1]}
          visible={(questions[question] || {}).map == 'hex'}
          onClick={submitAnswer}
          useVsup={useVsup}
          highlighted={
            questions[question] && questions[question].type == 'text'
              ? questions[question].a
              : null
          }
        />
        <UserSquareLayer
          pickable={(questions[question] || {}).type === 'click' && !interSlide}
          autoHighlight={
            (questions[question] || {}).type === 'click' && !interSlide
          }
          id="slide-elec-square"
          {...{
            data: squareData,
          }}
          zoomRange={[0, 1]}
          visible={(questions[question] || {}).map == 'square'}
          onClick={submitAnswer}
          highlighted={
            questions[question] && questions[question].type == 'text'
              ? questions[question].a
              : null
          }
        />
      </DeckGL>
      {question < questions.length && (
        <div className="study-area">
          {question == -1 && (
            <>
              <p>Press button to start.</p>
              <button onClick={handleStart}>Next</button>
            </>
          )}
          {question > -1 && !interSlide && (
            <>
              <p>{questions[question].q}</p>
              {questions[question].type == 'text' && (
                <>
                  <input
                    type="text"
                    value={enteredText}
                    onChange={(e) => setEnteredText(e.target.value)}
                  />
                  <button onClick={handleClick}>Next</button>
                </>
              )}
            </>
          )}
          {interSlide && (
            <>
              <p>Starting next part.</p>
              <button onClick={handleClick}>Next</button>
            </>
          )}
          {question > -1 && !interSlide && (
            <>
              <p
                style={{
                  fontSize: '12px',
                  marginTop: '0.3em',
                }}
              >
                {question + 1} / 60
              </p>
            </>
          )}
        </div>
      )}
      {(questions[question] || {}).map == 'hex' && (
        <GUIHex
          res={d3.scaleQuantize().domain([0, 1]).range(resRange)(
            d3.scaleLinear().domain([5, 8]).range([0, 1]).clamp(true)(zoom)
          )}
          useVsup={useVsup}
          setUseVsup={setUseVsup}
        />
      )}
      {(questions[question] || {}).map == 'square' && (
        <GUISquare
          res={d3.scaleQuantize().domain([0, 1]).range(resRange)(
            d3.scaleLinear().domain([5, 8]).range([0, 1]).clamp(true)(zoom)
          )}
        />
      )}
      {question >= questions.length && (
        <button
          style={{
            position: 'absolute',
            left: '20px',
            bottom: '20px',
          }}
          onClick={() => download(allAns.current, 'user-data')}
        >
          Download results
        </button>
      )}
    </>
  );
}

function GUIHex({ res, useVsup, setUseVsup }) {
  const legendArea = useRef();
  const hexText = useRef();

  useEffect(() => {
    d3.selectAll('.lin-legend').style(
      'visibility',
      useVsup ? 'hidden' : 'visible'
    );
    d3.selectAll('.vsup-legend-u').style(
      'visibility',
      useVsup ? 'visible' : 'hidden'
    );
    d3.selectAll('.vsup-legend-v').attr(
      'transform',
      `translate(${0},${useVsup ? 0 : 50})`
    );
    d3.selectAll('.box1')
      .attr('transform', `translate(${0},${useVsup ? 0 : 150})`)
      .attr('height', useVsup ? 250 : 100)
      .attr('width', useVsup ? 250 : 300);
    d3.selectAll('.box2')
      .attr('transform', `translate(${0},${useVsup ? 0 : 60})`)
      .attr('height', useVsup ? 170 : 110);
  }, [useVsup]);

  useLayoutEffect(() => {
    const svg = d3
      .select(legendArea.current)
      .attr('width', window.innerWidth)
      .attr('height', window.innerHeight);

    const height = 200;
    const width = window.innerWidth;

    const legendElem = svg
      .append('g')
      .attr(
        'transform',
        `translate(${0},${window.innerHeight - height - 100})`
      );

    legendElem
      .append('g')
      .attr('transform', `translate(${0},${height - 250})`)
      .append('rect')
      .attr('class', 'box1')
      .attr('height', 250)
      .attr('width', 250)
      .attr('fill', 'white');

    legendElem
      .append('g')
      .attr('transform', `translate(${0},${height - 170})`)
      .append('rect')
      .attr('class', 'box2')
      .attr('height', 170)
      .attr('width', 920)
      .attr('x', 350)
      .attr('fill', 'white');

    legendElem
      .append('g')
      .attr('class', 'vsup-legend-u')
      .append('g')
      .call(
        arcmapLegendPretty()
          .vtitle('% Dem. Lead')
          .utitle('Variance')
          .scale(ELECTION_INTERPS.party.vsup)
          .size(150)
          .x(40)
          .y(height - 150 - 40)
      );

    legendElem
      .append('g')
      .attr('class', 'lin-legend')
      .append('g')
      .call(
        vsup.legend
          .simpleLegend(null, 250, 20, '.2s')
          .title('% Dem. Lead')
          .size(250)
          .height(20)
          .scale(ELECTION_INTERPS.party.colorsStepped)
          .x(20)
          .y(height - 70)
      );

    let xPos = 400,
      yPos = height - 120;

    legendElem
      .append('g')
      .attr('transform', `translate(${xPos},${yPos})`)
      .append('g')
      .attr('class', 'vsup-legend-v')
      .call(hexLegendU(ELECTION_INTERPS.poc, '% PoC'));

    legendElem
      .append('g')
      .attr('transform', `translate(${xPos},${yPos + 20})`)
      .append('g')
      .attr('class', 'vsup-legend-u')
      .call(hexLegendV(ELECTION_INTERPS.poc));

    (xPos = 750), (yPos = height - 120);

    legendElem
      .append('g')
      .attr('transform', `translate(${xPos},${yPos})`)
      .append('g')
      .attr('class', 'vsup-legend-v')
      .call(
        iconhexLegendU(
          ELECTION_INTERPS.population,
          'assets/human.png',
          'Pop. / Km2'
        )
      );

    legendElem
      .append('g')
      .attr('transform', `translate(${xPos},${yPos + 55})`)
      .append('g')
      .attr('class', 'vsup-legend-u')
      .call(iconhexLegendV(ELECTION_INTERPS.population, 'assets/human.png'));

    legendElem
      .append('g')
      .attr('transform', `translate(${width - 60},${height - 80})`)
      .call(hexagonShape(0, 0, 50, 'rgba(146, 146, 146, 0.5)'))
      .call(function (a) {
        hexText.current = [
          a
            .append('text')
            .attr('x', 0)
            .attr('y', 8)
            .attr('text-anchor', 'middle')
            .style('font-weight', 'bold')
            .style('blend-mode', 'multiply')
            .text(
              `${d3.format('.2s')(
                h3.getHexagonAreaAvg(res, h3.UNITS.km2)
              )} km\u00B2`
            ),
          a
            .append('text')
            .attr('x', 0)
            .attr('y', 55)
            .attr('text-anchor', 'middle')
            .style('font-size', '11px')
            .text(
              `\u2190 ${d3.format('.2s')(
                h3.getHexagonEdgeLengthAvg(res, h3.UNITS.km)
              )} km \u2192;`
            ),
        ];
      });
  }, []);

  useEffect(() => {
    let [areaText, sideText] = hexText.current;
    areaText.text(
      `${d3.format('.2s')(h3.getHexagonAreaAvg(res, h3.UNITS.km2))} km\u00B2`
    );
    sideText.text(
      `\u2190 ${d3.format('.2s')(
        h3.getHexagonEdgeLengthAvg(res, h3.UNITS.km)
      )} km \u2192;`
    );
  }, [res]);

  return (
    <>
      <svg className="legend-area" ref={legendArea}></svg>
      <div className="study-input">
        <input
          type="checkbox"
          checked={useVsup}
          onChange={() => setUseVsup((prev) => !prev)}
        />
        <span>Use VSUP</span>
      </div>
    </>
  );
}

function hexSideToSquareSide(res) {
  return h3.getHexagonEdgeLengthAvg(parseInt(res), h3.UNITS.km) * 2;
}

function GUISquare({ res }) {
  const legendArea = useRef();
  const hexText = useRef();

  useLayoutEffect(() => {
    const height = window.innerHeight;
    const width = window.innerWidth;
    const legendd3 = d3
      .select(legendArea.current)
      .attr('width', width)
      .attr('height', height);

    legendd3
      .append('g')
      .attr('transform', `translate(${width - 60},${height - 170})`)
      .call((a) => {
        a.append('rect')
          .attr('x', -50)
          .attr('y', -50)
          .attr('width', 100)
          .attr('height', 100)
          .attr('fill', 'rgba(146, 146, 146, 0.5)');
      })
      .call(function (a) {
        hexText.current = [
          a
            .append('text')
            .attr('x', 0)
            .attr('y', 8)
            .attr('text-anchor', 'middle')
            .style('font-weight', 'bold')
            .style('blend-mode', 'multiply')
            .text(
              `${d3.format('.2s')(
                h3.getHexagonAreaAvg(res, h3.UNITS.km2)
              )} km\u00B2`
            ),
          a
            .append('text')
            .attr('x', 0)
            .attr('y', 55)
            .attr('text-anchor', 'middle')
            .style('font-size', '11px')
            .text(
              `\u2190 ${d3.format('.2s')(
                h3.getHexagonEdgeLengthAvg(res, h3.UNITS.km)
              )} km \u2192;`
            ),
        ];
      });

    legendd3
      .append('g')
      .attr('transform', `translate(${120},${height - 200})`)
      .call((a) => {
        a.append('rect')
          .attr('x', -120)
          .attr('y', -140)
          .attr('width', 459)
          .attr('height', 240)
          // .attr('mix-blend-mode', 'lighten')
          .attr('fill', 'rgba(255, 255, 255, 1)');

        const squareSide = 75;

        a.append('text')
          .attr('x', squareSide)
          .attr('y', -squareSide - 15)
          .style('font-weight', 'bold')
          .attr('text-anchor', 'middle')
          .text('Measure Type');

        a.append('rect')
          .attr('x', 0)
          .attr('y', -squareSide)
          .attr('width', squareSide)
          .attr('height', squareSide)
          .attr('fill', 'rgba(72, 30, 197, 0.7)');
        a.append('rect')
          .attr('x', squareSide)
          .attr('y', -squareSide)
          .attr('width', squareSide)
          .attr('height', squareSide)
          .attr('fill', 'rgba(165, 0, 38, 0.7)');
        a.append('rect')
          .attr('x', squareSide)
          .attr('y', 0)
          .attr('width', squareSide)
          .attr('height', squareSide)
          .attr('fill', 'rgba(156, 156, 156, 0.7)');
        a.append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', squareSide)
          .attr('height', squareSide)
          .attr('fill', 'rgba(0, 121, 42, 0.7)');

        let domm, uAxisScale;

        domm = [100, 0];
        uAxisScale = d3
          .scalePoint()
          .range([0, squareSide])
          .domain([domm[0], -(domm[1] - domm[0]) / 2, domm[1]]);
        a.append('g')
          .attr('transform', `translate(${0},${-squareSide})`)
          .call(d3.axisLeft(uAxisScale));

        domm = ELECTION_INTERPS.poc.scaleLinear.domain();
        uAxisScale = d3
          .scalePoint()
          .range([0, squareSide])
          .domain([domm[0], (domm[1] - domm[0]) / 2, domm[1]]);
        a.append('g')
          .attr('transform', `translate(${0},${0})`)
          .call(d3.axisLeft(uAxisScale));

        domm = [-100, 0];
        uAxisScale = d3
          .scalePoint()
          .range([0, squareSide])
          .domain([domm[0], -(domm[1] - domm[0]) / 2, domm[1]]);
        a.append('g')
          .attr('transform', `translate(${squareSide * 2},${-squareSide})`)
          .call(d3.axisRight(uAxisScale));

        domm = ELECTION_INTERPS.population.scaleLinear.domain();
        uAxisScale = d3
          .scalePoint()
          .range([0, squareSide])
          .domain([domm[0], (domm[1] - domm[0]) / 2, domm[1]]);
        a.append('g')
          .attr('transform', `translate(${squareSide * 2},${0})`)
          .call(d3.axisRight(uAxisScale));

        a.append('text')
          .attr('x', -20)
          .attr('y', -18)
          .attr('text-anchor', 'end')
          .text('% Dem. Lead');
        a.append('text')
          .attr('x', squareSide * 2 + 20)
          .attr('y', -18)
          .attr('text-anchor', 'start')
          .text('% Rep. Lead');
        a.append('text')
          .attr('x', squareSide * 2 + 20)
          .attr('y', 0 + 12)
          .attr('text-anchor', 'start')
          .text('Pop. / Km2');
        a.append('text')
          .attr('x', -20)
          .attr('y', 0 + 12)
          .attr('text-anchor', 'end')
          .text('% PoC');
      });
  }, []);

  useEffect(() => {
    let [areaText, sideText] = hexText.current;
    areaText.text(
      `${d3.format('.2s')(Math.pow(hexSideToSquareSide(res), 2))} km\u00B2`
    );
    sideText.text(
      `\u2190 ${d3.format('.2s')(hexSideToSquareSide(res))} km \u2192;`
    );
  }, [res]);

  return (
    <>
      <svg className="legend-area" ref={legendArea}></svg>
    </>
  );
}

function kmToLatDeg(dist) {
  return dist / 111.1;
}

function resToDegSide(res) {
  return kmToLatDeg(hexSideToSquareSide(res));
}

function square_to_geo_center(sqid) {
  const [strLat, strLon, res] = sqid.split('/');
  const sideDeg = resToDegSide(res);
  return [parseFloat(strLat) + sideDeg / 2, parseFloat(strLon) + sideDeg / 2];
}

function useCamera() {
  const [curViewState, setCurViewState] = useState(USER_VIEW);
  const [transitioning, setTransitioning] = useState(false);

  const zoomInHex = useCallback((hexId, cb) => {
    const [centerLat, centerLng] = h3.cellToLatLng(hexId);
    setTransitioning(true);
    setCurViewState({
      ...USER_VIEW,
      zoom: 7.45,
      latitude: centerLat,
      longitude: centerLng,
      transitionDuration: 500,
      transitionInterpolator: new FlyToInterpolator(),
      onTransitionEnd: () => {
        setTransitioning(false);
        cb();
      },
    });
  }, []);

  const zoomInSquare = useCallback((sqid, cb) => {
    const [centerLat, centerLng] = square_to_geo_center(sqid);
    setTransitioning(true);
    setCurViewState({
      ...USER_VIEW,
      zoom: 7.45,
      latitude: centerLat,
      longitude: centerLng,
      transitionDuration: 500,
      transitionInterpolator: new FlyToInterpolator(),
      onTransitionEnd: () => {
        setTransitioning(false);
        cb();
      },
    });
  }, []);

  return { curViewState, transitioning, zoomInHex, zoomInSquare };
}
