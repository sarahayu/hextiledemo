import React from 'react';
import { createRoot } from 'react-dom/client';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Scrollyline from './Scrollyline';
import Sandbox from './Sandbox';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Scrollyline />,
  },
  {
    path: '/sandbox',
    element: <Sandbox />,
  },
]);

export function renderToDOM(container) {
  createRoot(container).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}
