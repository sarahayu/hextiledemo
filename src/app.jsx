import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';

import CentralValleyWater from './sandbox/CentralValleyWater';
import Wildfire from './sandbox/Wildfire';

export function renderToDOM(container) {
  createRoot(container).render(
    <HashRouter>
      <Routes>
        <Route path="/" element={<CentralValleyWater />} />
        <Route path="fire" element={<Wildfire />} />
      </Routes>
    </HashRouter>
  );
}
