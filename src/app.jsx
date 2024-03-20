import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';

import CentralValleyWater from './sandbox/CentralValleyWater';
import CentralValleyWaterSquare from './sandbox_square/CentralValleyWater';
import Wildfire from './sandbox/Wildfire';
import Election2020 from './election/Election2020';
import CentralValleyWaterMult from './sandbox/CentralValleyWaterMult';
import Election2020Square from './election/Election2020Square';
import Election2020Mult from './election/Election2020Mult';

export function renderToDOM(container) {
  createRoot(container).render(
    <HashRouter>
      <Routes>
        <Route path="/" element={<CentralValleyWater />} />
        <Route path="water/hex" element={<CentralValleyWater />} />
        <Route path="water/square" element={<CentralValleyWaterSquare />} />
        <Route path="water/mult" element={<CentralValleyWaterMult />} />
        <Route path="election/hex" element={<Election2020 />} />
        <Route path="election/square" element={<Election2020Square />} />
        <Route path="election/mult" element={<Election2020Mult />} />
        <Route path="fire" element={<Wildfire />} />
      </Routes>
    </HashRouter>
  );
}
