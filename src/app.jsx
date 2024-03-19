import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';

import CentralValleyWater from './sandbox/CentralValleyWater';
import CentralValleyWaterSquare from './sandbox_square/CentralValleyWater';
import Wildfire from './sandbox/Wildfire';
import Election2020 from './election/Election2020';

export function renderToDOM(container) {
  createRoot(container).render(
    <HashRouter>
      <Routes>
        <Route path="/" element={<CentralValleyWater />} />
        <Route path="square" element={<CentralValleyWaterSquare />} />
        <Route path="fire" element={<Wildfire />} />
        <Route path="election" element={<Election2020 />} />
      </Routes>
    </HashRouter>
  );
}
