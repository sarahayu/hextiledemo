import { _TerrainExtension as TerrainExtension } from '@deck.gl/extensions';
import { OBJLoader } from '@loaders.gl/obj';
import { CompositeLayer } from 'deck.gl';
import IconHexTileLayer from 'src/hextile/IconHexTileLayer';
import SolidHexTileLayer from 'src/hextile/SolidHexTileLayer';
import {
  colorInterpDifference,
  colorInterpGW,
  valueInterpDemand,
  valueInterpUnmet,
} from 'src/utils/scales';
import { SCENARIOS, USE_TERRAIN_3D } from 'src/utils/settings';
import { dataFilter } from 'src/utils/utils';

export default class SlideEpilogue extends CompositeLayer {
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
          getFillColor: [speedyCounter, curScenario],
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
          getTranslation: [speedyCounter, curScenario],
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
          getTranslation: [speedyCounter, curScenario],
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

SlideEpilogue.layerName = 'SlideEpilogue';
SlideEpilogue.defaultProps = {
  ...CompositeLayer.defaultProps,
  autoHighlight: true,
};
