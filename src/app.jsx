import React from 'react';
import { createRoot } from 'react-dom/client';

import CentralValleyWater from './sandbox/CentralValleyWater';

export function renderToDOM(container) {
  createRoot(container).render(<CentralValleyWater />);
}
