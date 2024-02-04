import React from 'react';

import { _TerrainExtension as TerrainExtension } from '@deck.gl/extensions';
import { OBJLoader } from '@loaders.gl/obj';
import { CompositeLayer } from 'deck.gl';
import SolidHexTileLayer from 'src/hextile/SolidHexTileLayer';
import IconHexTileLayer from 'src/hextile/IconHexTileLayer';
import {
  colorInterpDifference,
  colorInterpGW,
  valueInterpDemand,
  valueInterpUnmet,
} from 'src/utils/scales';
import { SCENARIOS, USE_TERRAIN_3D } from 'src/utils/settings';
import { dataFilter } from 'src/utils/utils';

import { useState } from 'react';

import { temporalData } from 'src/utils/data';

import MartiniSlides from 'src/MartiniSlides';
import WaterDeckGL from 'src/WaterDeckGL';

import MainGUI from 'src/MainGUI';
import SandboxGUI from 'src/SandboxGUI';

import useCamera from 'src/hooks/useCamera';
import useCounters from 'src/hooks/useCounters';
import useHexTooltip from 'src/hooks/useHexTooltip';
import useSandboxGUI from 'src/hooks/useSandboxGUI';

export default function Sandbox() {
  const [slide, setSlide] = useState(22);
  const [curScenario, setCurScenario] = useState(0);

  const curState = {
    data: temporalData,
    slide,
    setSlide,
    curScenario,
    setCurScenario,
  };

  const sandboxGUI = useSandboxGUI();
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
    autoHighlight: true,
  };

  const isEpilogue = slide >= 22;

  const layers = [
    new MartiniSlides(params),
    new SandboxSlide({ ...params, ...sandboxGUI }),
  ];

  return (
    <>
      <WaterDeckGL
        {...{
          layers,
          curViewState,
          getTooltip,
        }}
      />
      <MainGUI {...params} />
      {isEpilogue && <SandboxGUI {...{ ...params, ...sandboxGUI }} />}
    </>
  );
}

class SandboxSlide extends CompositeLayer {
  initializeState() {
    super.initializeState();
    this.setState({
      data0: dataFilter(this.props.data, (d) => d.LandUse[0] == 0),
      data1: dataFilter(this.props.data, (d) => d.LandUse[0] == 1),
      data2: dataFilter(this.props.data, (d) => d.LandUse[0] == 2),
      data3: dataFilter(this.props.data, (d) => d.LandUse[0] == 3),
    });
  }
  renderLayers() {
    const {
      data,
      slide,
      curScenario,
      speedyCounter,
      displayGW,
      displayDiff,
      displayUnmet,
      displayDemand,
      displayLandUse,
    } = this.props;
    const isEpilogue = slide >= 22;

    return [
      new SolidHexTileLayer({
        id: `HoveringTilesEpilogue`,
        data: data,
        thicknessRange: [0, 1],
        filled: true,

        extruded: false,
        raised: false,
        getFillColor: [0, 0, 0, 0],
        ...(USE_TERRAIN_3D ? { extensions: [new TerrainExtension()] } : {}),
        visible: isEpilogue,
        pickable: true,
        autoHighlight: true,
      }),
      new SolidHexTileLayer({
        id: `GroundwaterEpilogue`,
        data,
        thicknessRange: [0, 1],
        filled: true,

        extruded: false,
        raised: false,
        getFillColor: (d) =>
          colorInterpGW(d.properties.Groundwater[speedyCounter]),
        visible: displayGW && isEpilogue,
        opacity: 0.2,
        ...(USE_TERRAIN_3D ? { extensions: [new TerrainExtension()] } : {}),
        updateTriggers: {
          getFillColor: [speedyCounter],
        },
      }),
      new SolidHexTileLayer({
        id: `DifferenceEpilogue`,
        data,
        thicknessRange: [0.5, 0.65],
        filled: true,

        extruded: false,
        raised: false,
        getFillColor: (d) =>
          colorInterpDifference(
            d.properties.UnmetDemand[SCENARIOS[curScenario]][speedyCounter] -
              d.properties.UnmetDemandBaseline[speedyCounter]
          ),
        visible: displayDiff && isEpilogue,
        opacity: 1.0,
        ...(USE_TERRAIN_3D ? { extensions: [new TerrainExtension()] } : {}),
        updateTriggers: {
          getFillColor: [speedyCounter],
        },
      }),
      new IconHexTileLayer({
        id: `ScenarioUnmetEpilogue`,
        data,
        loaders: [OBJLoader],
        mesh: 'assets/drop.obj',
        raised: true,
        extruded: false,

        getColor: [255, 130, 35],
        getValue: (d) =>
          valueInterpUnmet(
            d.properties.UnmetDemand[SCENARIOS[curScenario]][speedyCounter]
          ),
        sizeScale: 3000,
        visible: displayUnmet && isEpilogue,
        opacity: 1,
        ...(USE_TERRAIN_3D
          ? {
              extensions: [
                new TerrainExtension({
                  terrainDrawMode: 'offset',
                }),
              ],
            }
          : {}),
        updateTriggers: {
          getTranslation: [speedyCounter],
        },
      }),
      new IconHexTileLayer({
        id: `ScenarioDemandEpilogue`,
        data,
        loaders: [OBJLoader],
        mesh: 'assets/drop.obj',
        raised: true,
        extruded: false,

        getColor: [255, 130, 35],
        getValue: (d) =>
          valueInterpDemand(
            d.properties.Demand[SCENARIOS[curScenario]][speedyCounter]
          ),
        sizeScale: 3000,
        visible: displayDemand && isEpilogue,
        opacity: 1,
        ...(USE_TERRAIN_3D
          ? {
              extensions: [
                new TerrainExtension({
                  terrainDrawMode: 'offset',
                }),
              ],
            }
          : {}),
        updateTriggers: {
          getTranslation: [speedyCounter],
        },
      }),
      new IconHexTileLayer({
        id: `SettlementIconsEpilogue`,
        data: this.state.data0,
        loaders: [OBJLoader],
        mesh: 'assets/dam.obj',
        raised: false,

        getColor: [255, 127, 206],
        sizeScale: 0.8 * 500,
        visible: displayLandUse && isEpilogue,
        opacity: 1,
        ...(USE_TERRAIN_3D
          ? {
              extensions: [
                new TerrainExtension({
                  terrainDrawMode: 'offset',
                }),
              ],
            }
          : {}),
        updateTriggers: {
          getTranslation: [speedyCounter],
        },
      }),
      new IconHexTileLayer({
        id: `ExhangeIconsEpilogue`,
        data: this.state.data1,
        loaders: [OBJLoader],
        mesh: 'assets/cow.obj',
        raised: false,

        getColor: [255, 127, 206],
        sizeScale: 0.8 * 550,
        visible: displayLandUse && isEpilogue,
        opacity: 1,
        ...(USE_TERRAIN_3D
          ? {
              extensions: [
                new TerrainExtension({
                  terrainDrawMode: 'offset',
                }),
              ],
            }
          : {}),
        updateTriggers: {
          getTranslation: [speedyCounter],
        },
      }),
      new IconHexTileLayer({
        id: `ProjectIconsEpilogue`,
        data: this.state.data2,
        loaders: [OBJLoader],
        mesh: 'assets/project.obj',
        raised: false,

        getColor: [255, 127, 206],
        sizeScale: 0.8 * 180,
        visible: displayLandUse && isEpilogue,
        opacity: 1,
        ...(USE_TERRAIN_3D
          ? {
              extensions: [
                new TerrainExtension({
                  terrainDrawMode: 'offset',
                }),
              ],
            }
          : {}),
        updateTriggers: {
          getTranslation: [speedyCounter],
        },
      }),
      new IconHexTileLayer({
        id: `NonProjectIconsEpilogue`,
        data: this.state.data3,
        loaders: [OBJLoader],
        mesh: 'assets/nonproject.obj',
        raised: false,

        getColor: [255, 127, 206],
        sizeScale: 0.8 * 140,
        visible: displayLandUse && isEpilogue,
        opacity: 1,
        ...(USE_TERRAIN_3D
          ? {
              extensions: [
                new TerrainExtension({
                  terrainDrawMode: 'offset',
                }),
              ],
            }
          : {}),
        updateTriggers: {
          getTranslation: [speedyCounter],
        },
      }),
    ];
  }
}

SandboxSlide.layerName = 'SandboxSlide';
SandboxSlide.defaultProps = {
  ...CompositeLayer.defaultProps,
  autoHighlight: true,
};
