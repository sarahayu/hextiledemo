import React from 'react';
import { Children } from 'react';

import { MapboxOverlay } from '@deck.gl/mapbox';
import { useControl } from 'react-map-gl';

function createLayer(LayerType, reactProps) {
  const props = {};
  // Layer.defaultProps is treated as ReactElement.defaultProps and merged into react props
  // Remove them
  const defaultProps = LayerType.defaultProps || {};
  for (const key in reactProps) {
    if (defaultProps[key] !== reactProps[key]) {
      props[key] = reactProps[key];
    }
  }
  // @ts-ignore Cannot instantiate an abstract class (Layer)
  return new LayerType(props);
}

export default function DeckGLOverlay(props) {
  const overlay = useControl(
    () =>
      new MapboxOverlay({
        ...props,
        layers: Children.map(props.children, (layer) => {
          const a = createLayer(layer.type, layer.props);
          return a;
        }),
      })
  );
  overlay.setProps({
    ...props,
    layers: Children.map(props.children, (layer) => {
      const a = createLayer(layer.type, layer.props);
      return a;
    }),
  });
  return null;
}
