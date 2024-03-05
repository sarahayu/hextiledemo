import React from 'react';
import { createRoot } from 'react-dom/client';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Scrollyline from './scrollyline/Scrollyline';
import Sandbox from './sandbox/Sandbox';
import CentralValleyWater from './sandbox/CentralValleyWater';

const router = createBrowserRouter([
  {
    path: '/',
    element: <CentralValleyWater />,
  },
  // {
  //   path: '/sandbox',
  //   element: <Sandbox />,
  // },
  // {
  //   path: '/centralvalleywater',
  //   element: <CentralValleyWater />,
  // },
]);

export function renderToDOM(container) {
  createRoot(container).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}
