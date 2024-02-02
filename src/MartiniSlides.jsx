import { CompositeLayer } from 'deck.gl';

import SlideAverages from 'src/slides/SlideAverages';
import SlideDeliveries from 'src/slides/SlideDeliveries';
import SlideDemandIntro from 'src/slides/SlideDemandIntro';
import SlideDemandVsUnmet from 'src/slides/SlideDemandVsUnmet';
import SlideEndRandomized from 'src/slides/SlideEndRandomized';
import SlideOwners from 'src/slides/SlideOwners';
import SlideScenarioExplanations from 'src/slides/SlideScenarioExplanations';
import SlideTerrain from 'src/slides/SlideTerrain';

export default class MartiniSlides extends CompositeLayer {
  renderLayers() {
    return [
      new SlideTerrain(this.props),
      new SlideDemandIntro(this.props),
      new SlideDemandVsUnmet(this.props),
      new SlideAverages(this.props),
      new SlideOwners(this.props),
      new SlideDeliveries(this.props),
      new SlideScenarioExplanations(this.props),
      new SlideEndRandomized(this.props),
    ];
  }
}

MartiniSlides.layerName = 'MartiniSlides';
MartiniSlides.defaultProps = {
  ...CompositeLayer.defaultProps,
};
