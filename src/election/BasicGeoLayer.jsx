import { countyGeo, precinctGeo } from 'src/utils/data';

import { CompositeLayer, GeoJsonLayer } from 'deck.gl';
import { COUNTY_INTERPS, PRECINCT_INTERPS } from 'src/utils/scales';

export default class BasicGeoLayer extends CompositeLayer {
  renderLayers() {
    const { curOption, speedyCounter = 1026 } = this.props;

    return [
      new GeoJsonLayer({
        id: 'Votes',
        data: precinctGeo,
        opacity: 1,
        stroked: true,
        lineWidthScale: 100,
        filled: true,
        extruded: true,
        getElevation: (d) =>
          PRECINCT_INTERPS.votes.scaleLinear(d.properties.votes_per_sqkm) *
          300000,
        getFillColor: (d) =>
          PRECINCT_INTERPS.party.interpColor(
            d.properties.pct_dem_lead,
            false,
            false
          ),
        visible: curOption == 2,
        pickable: true,
        autoHighlight: true,
      }),
      new GeoJsonLayer({
        id: 'Demog',
        data: countyGeo,
        opacity: 1,
        stroked: true,
        lineWidthScale: 100,
        filled: true,
        extruded: true,
        getElevation: (d) =>
          COUNTY_INTERPS.population.scaleLinear(d.properties['PopDen'] || 0) *
          300000,
        getFillColor: (d) =>
          COUNTY_INTERPS.white.interpColor(
            d.properties['PercWhite'] || 1,
            false,
            false
          ),
        visible: curOption == 3,
        pickable: true,
        autoHighlight: true,
      }),
    ];
  }
}

BasicGeoLayer.layerName = 'BasicGeoLayer';
BasicGeoLayer.defaultProps = {
  ...CompositeLayer.defaultProps,
  autoHighlight: true,
};
