import React, { useEffect, useState } from 'react';
import { useLayoutEffect, useRef } from 'react';

import DeckGL from '@deck.gl/react';
import maplibregl from 'maplibre-gl';
import { Map } from 'react-map-gl';
import mapStyle from 'src/assets/style.json';
import { LIGHTING } from 'src/utils/settings';

import {
  electionDataSquare as data,
  electionPrecinctGeo as dataDeag,
} from 'src/utils/data';

import useGUI from './useGUI';
import useHexTooltip from './useHexTooltip';

import useHexMouseEvts from 'src/sandbox/useHexMouseEvts';
import BaseTerrainLayer from './BaseTerrainLayer';

import { CompositeLayer } from 'deck.gl';
import SolidSquareTileLayer from 'src/squaretile/SolidSquareTileLayer';

import { ELECTION_INTERPS } from 'src/utils/scales';

import * as d3 from 'd3';
import * as h3 from 'h3-js';

const resRange = Object.keys(data).map((d) => parseInt(d));

export default function Election2020Square() {
  const [zoom, setZoom] = useState(5);
  const curInput = useGUI();
  const hexMouseEvts = useHexMouseEvts({
    disabled: curInput.curOption > 1,
    dataDeag,
    deagKey: 'PrecinctRgs',
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
        initialViewState={{
          longitude: -97.7431,
          latitude: 30.2672,
          zoom: 5,
          minZoom: 3,
          maxZoom: 15,
          pitch: 50.85,
          bearing: 32.58,
        }}
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
        <MultivariableSquareTileLayer
          id="slide-election"
          {...curState}
          zoomRange={[5, 8]}
          visible
        />
      </DeckGL>
      <GUI
        res={d3.scaleQuantize().domain([0, 1]).range(resRange)(
          d3.scaleLinear().domain([5, 8]).range([0, 1]).clamp(true)(zoom)
        )}
        {...curState}
      />
    </>
  );
}

class MultivariableSquareTileLayer extends CompositeLayer {
  renderLayers() {
    const {
      data,
      curOption,
      speedyCounter = 1026,
      clickedHexes,
      selectionFinalized,
      visible,
      zoomRange,
    } = this.props;

    return [
      new SolidSquareTileLayer({
        id: `SquareBorders`,
        data,
        getFillColor: [0, 0, 0, 0],
        getLineColor: [80, 80, 80, 100],
        stroked: true,
        lineWidthUnits: 'pixels',
        getValue: (d) => 2,
        visible,
        extruded: false,
        opacity: 1.0,
        zoomRange,
        offset: [0, 0],
      }),
      new SolidSquareTileLayer({
        id: `PoC`,
        data,
        getFillColor: [0, 121, 42],
        getValue: (d) => ELECTION_INTERPS.poc.scaleLinear(d.properties['PoC']),
        visible,
        extruded: false,
        opacity: 1.0,
        zoomRange,
        offset: [-1, -1],
      }),
      new SolidSquareTileLayer({
        id: `Dem`,
        data,
        getFillColor: [72, 30, 197],
        getValue: (d) =>
          ELECTION_INTERPS.party.scaleLinear(
            d.properties['DemLead'] > 0
              ? d.properties['DemLead'] * 2 - 100
              : -100
          ),
        visible,
        extruded: false,
        opacity: 1.0,
        zoomRange,
        offset: [-1, 1],
      }),
      new SolidSquareTileLayer({
        id: `Repub`,
        data,
        getFillColor: [165, 0, 38],
        getValue: (d) =>
          ELECTION_INTERPS.party.scaleLinear(
            d.properties['DemLead'] < 0
              ? -d.properties['DemLead'] * 2 - 100
              : -100
          ),
        visible,
        extruded: false,
        opacity: 1.0,
        zoomRange,
        offset: [1, 1],
      }),
      new SolidSquareTileLayer({
        id: `Pop`,
        data,
        getFillColor: [156, 156, 156],
        getValue: (d) =>
          ELECTION_INTERPS.population.scaleLinear(d.properties['PopSqKm']),
        visible,
        extruded: false,
        opacity: 1.0,
        zoomRange,
        offset: [1, -1],
      }),
    ];
  }
}

MultivariableSquareTileLayer.layerName = 'MultivariableSquareTileLayer';
MultivariableSquareTileLayer.defaultProps = {
  ...CompositeLayer.defaultProps,
  autoHighlight: true,
};

function hexSideToSquareSide(res) {
  return h3.getHexagonEdgeLengthAvg(parseInt(res), h3.UNITS.km) * 2;
}

function GUI({ res }) {
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
      .attr('transform', `translate(${120},${height - 140})`)
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
