import { CompositeLayer } from 'deck.gl';

import SlideAverages from 'src/scrollyline/slides/SlideAverages';
import SlideDeliveries from 'src/scrollyline/slides/SlideDeliveries';
import SlideDemandIntro from 'src/scrollyline/slides/SlideDemandIntro';
import SlideDemandVsUnmet from 'src/scrollyline/slides/SlideDemandVsUnmet';
import SlideEndRandomized from 'src/scrollyline/slides/SlideEndRandomized';
import SlideOwners from 'src/scrollyline/slides/SlideOwners';
import SlideScenarioExplanations from 'src/scrollyline/slides/SlideScenarioExplanations';
import SlideTerrain from 'src/scrollyline/slides/SlideTerrain';

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
