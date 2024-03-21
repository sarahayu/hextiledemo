import React from 'react';
import { useRef, useState } from 'react';

import DeckGL from '@deck.gl/react';
import * as d3 from 'd3';
import maplibregl from 'maplibre-gl';
import { Map } from 'react-map-gl';
import mapStyle from 'src/assets/style.json';
import { LIGHTING } from 'src/utils/settings';

import {
  electionDataHex as data,
  electionPrecinctGeo as dataDeag,
} from 'src/utils/data';

import useGUI from './useGUI';
import useHexTooltip from './useHexTooltip';

import useHexMouseEvts from 'src/sandbox/useHexMouseEvts';
import BaseTerrainLayer from './BaseTerrainLayer';

import { PathStyleExtension } from '@deck.gl/extensions';
import { OBJLoader } from '@loaders.gl/obj';
import { CompositeLayer } from 'deck.gl';
import IconHexTileLayer from 'src/hextile/IconHexTileLayer';
import SolidHexTileLayer from 'src/hextile/SolidHexTileLayer';

import { useEffect, useLayoutEffect } from 'react';
import { electionPrecinctGeo } from 'src/utils/data';
import { ELECTION_INTERPS } from 'src/utils/scales';
import DeagHexTileLayer from '../hextile/DeagHexTileLayer';

import * as h3 from 'h3-js';
import { hexagonShape } from 'src/utils/utils';
import * as vsup from 'vsup';

export default function Election2020NoVsup() {
  const { current: resRange } = useRef(
    Object.keys(data).map((d) => parseInt(d))
  );
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
        onViewStateChange={({ viewState }) => {
          setZoom(viewState.zoom);
        }}
        getTooltip={getTooltip}
      >
        <Map
          reuseMaps
          preventStyleDiffing
          mapLib={maplibregl}
          mapStyle={mapStyle}
        />
        <BaseTerrainLayer id="slide-terrain" {...curState} />
        <MultivariableHextileLayer
          id="slide-election"
          {...curState}
          zoomRange={[5, 8]}
          visible={curInput.curOption == 1}
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

class MultivariableHextileLayer extends CompositeLayer {
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
      new SolidHexTileLayer({
        id: `Party`,
        data,
        thicknessRange: [0, 1],
        getFillColor: (d) =>
          ELECTION_INTERPS.party.interpColor(d.properties['DemLead'] || 0),
        opacity: 1,
        visible,
        updateTriggers: {
          getFillColor: [speedyCounter],
        },
        zoomRange,
      }),
      new SolidHexTileLayer({
        id: `White`,
        data,
        thicknessRange: [0.4, 0.65],
        getFillColor: (d) =>
          ELECTION_INTERPS.poc.interpColor(
            100 - d.properties['PercWhite'],
            true,
            true
          ),
        getValue: (d) =>
          ELECTION_INTERPS.poc.scaleLinearVar(d.properties['PercWhiteVar']) *
            0.8 +
          0.2,
        raised: true,
        visible,
        getElevation: (d) => (d.hexId in clickedHexes ? 5000 : 0),
        getLineWidth: (d) => (d.hexId in clickedHexes ? 100 : 0),
        stroked: true,
        extruded: false,
        lineJointRounded: true,
        getLineColor: [255, 255, 255, 200],
        getOffset: -0.5,
        extensions: [new PathStyleExtension({ offset: true })],
        opacity: 1.0,
        updateTriggers: {
          getFillColor: [curOption, speedyCounter],
          getValue: [curOption, speedyCounter],
          getElevation: [selectionFinalized],
          getLineWidth: [selectionFinalized],
        },
        zoomRange,
      }),
      new IconHexTileLayer({
        id: `Population`,
        data,
        loaders: [OBJLoader],
        mesh: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/humanoid_quad.obj',
        raised: true,
        getColor: (d) => [
          255,
          255,
          7,
          ELECTION_INTERPS.population.scaleLinearVar(
            d.properties['TurnoutPerSqKm']
          ) *
            200 +
            55,
        ],
        getValue: (d) =>
          ELECTION_INTERPS.population.scaleLinear(d.properties['PopSqKm']),
        visible,
        sizeScale: 400,
        opacity: 1,
        updateTriggers: {
          getTranslation: [speedyCounter],
        },
        zoomRange,
      }),
      new DeagHexTileLayer({
        ...this.props,
        id: 'DeagLayer',
        data,
        deagData: electionPrecinctGeo,
        getFillColor: (d) => {
          return ELECTION_INTERPS.party.interpColor(
            d.properties['pct_dem_lead'],
            false,
            false
          );
        },
      }),
    ];
  }
}

MultivariableHextileLayer.layerName = 'MultivariableHextileLayer';
MultivariableHextileLayer.defaultProps = {
  ...CompositeLayer.defaultProps,
  autoHighlight: true,
};

function GUI(props) {
  return (
    <>
      <Legend {...props} />
    </>
  );
}

function Legend({ res }) {
  const legendArea = useRef();
  const hexText = useRef();

  useLayoutEffect(() => {
    const height = window.innerHeight;
    const width = 400;
    const legendd3 = d3
      .select(legendArea.current)
      .attr('width', width)
      .attr('height', height);

    legendd3.append('g').call(
      vsup.legend
        .simpleLegend()
        .title('Percent Dem')
        .size(250)
        .height(20)
        .scale(ELECTION_INTERPS.party.colorsStepped)
        .x(width - 280)
        .y(height - 370)
    );

    legendd3.append('g').call(
      vsup.legend
        .simpleLegend()
        .title('Percent PoC')
        .size(250)
        .height(20)
        .scale(ELECTION_INTERPS.poc.colorsStepped)
        .x(width - 280)
        .y(height - 300)
    );

    legendd3
      .append('g')
      .call(
        hexagonShape(width - 100, height - 100, 70, 'rgba(146, 146, 146, 0.5)')
      )
      .call(function (a) {
        hexText.current = [
          a
            .append('text')
            .attr('x', width - 100)
            .attr('y', height - 92)
            .attr('text-anchor', 'middle')
            .style('font-weight', 'bold')
            .style('blend-mode', 'multiply')
            .text(
              `${Math.round(h3.getHexagonAreaAvg(res, h3.UNITS.km2))} km\u00B2`
            ),
          a
            .append('text')
            .attr('x', width - 100)
            .attr('y', height - 50)
            .attr('text-anchor', 'middle')
            .style('font-size', '11px')
            .text(
              `\u2190 ${Math.round(
                h3.getHexagonEdgeLengthAvg(res, h3.UNITS.km)
              )} km \u2192;`
            ),
        ];
      });
  }, []);

  useEffect(() => {
    let [areaText, sideText] = hexText.current;
    areaText.text(
      `${Math.round(h3.getHexagonAreaAvg(res, h3.UNITS.km2))} km\u00B2`
    );
    sideText.text(
      `\u2190 ${Math.round(
        h3.getHexagonEdgeLengthAvg(res, h3.UNITS.km)
      )} km \u2192;`
    );
  }, [res]);

  return <svg className="legend-area" ref={legendArea}></svg>;
}
