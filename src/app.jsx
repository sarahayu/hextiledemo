import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';

import CentralValleyWater from './sandbox/CentralValleyWater';
import CentralValleyWaterSquare from './sandbox_square/CentralValleyWater';
import Wildfire from './sandbox/Wildfire';
import Election2020 from './election/Election2020';
import CentralValleyWaterMult from './sandbox/CentralValleyWaterMult';
import Election2020Square from './election/Election2020Square';
import Election2020Mult from './election/Election2020Mult';
import Election2020NoVsup from './election/Election2020NoVsup';
import CentralValleyWaterNoVsup from './sandbox/CentralValleyWaterNoVsup';

export function renderToDOM(container) {
  createRoot(container).render(
    <HashRouter>
      <Routes>
        <Route path="/" element={<ToC />} />
        <Route path="water/hex" element={<CentralValleyWater />} />
        <Route
          path="water/hex-no-vsup"
          element={<CentralValleyWaterNoVsup />}
        />
        <Route path="water/square" element={<CentralValleyWaterSquare />} />
        <Route path="water/mult" element={<CentralValleyWaterMult />} />
        <Route path="election/hex" element={<Election2020 />} />
        <Route path="election/hex-no-vsup" element={<Election2020NoVsup />} />
        <Route path="election/square" element={<Election2020Square />} />
        <Route path="election/mult" element={<Election2020Mult />} />
        <Route path="fire" element={<Wildfire />} />
      </Routes>
    </HashRouter>
  );
}

function ToC() {
  return (
    <>
      <Link className="toc-link" to="water/mult">
        Water Small Multiples
      </Link>
      <Link className="toc-link" to="water/square">
        Water Square Tiles
      </Link>
      <Link className="toc-link" to="water/hex">
        Water HexTiles
      </Link>
      <Link className="toc-link" to="water/hex-no-vsup">
        Water HexTiles (No VSUP)
      </Link>
      <Link className="toc-link" to="election/mult">
        Election Small Multiples
      </Link>
      <Link className="toc-link" to="election/square">
        Election Square Tiles
      </Link>
      <Link className="toc-link" to="election/hex">
        Election HexTiles
      </Link>
      <Link className="toc-link" to="election/hex-no-vsup">
        Election HexTiles (No VSUP)
      </Link>
      <Link className="toc-link" to="fire">
        Wildfire
      </Link>
    </>
  );
}
