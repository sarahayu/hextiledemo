// generated using `generate_index.py`

import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Link, Route, Routes } from "react-router-dom";

const CentralValleyWaterApp = React.lazy(() => import("./CentralValleyWaterApp"));
const WildfireApp = React.lazy(() => import("./WildfireApp"));
const Election2020App = React.lazy(() => import("./Election2020App"));
const Election2020SquareApp = React.lazy(() => import("./Election2020SquareApp"));
const CentralValleyWaterMultApp = React.lazy(() => import("./CentralValleyWaterMultApp"));
const Election2020MultApp = React.lazy(() => import("./Election2020MultApp"));
const CentralValleyWaterSquareApp = React.lazy(() => import("./CentralValleyWaterSquareApp"));


export function renderToDOM(container) {
  ReactDOM.createRoot(container).render(
    <HashRouter>
        <Routes>
        <Route
            index
            element={
            <main>
                <Link to="CentralValleyWaterApp">CentralValleyWaterApp</Link>
            <Link to="WildfireApp">WildfireApp</Link>
            <Link to="Election2020App">Election2020App</Link>
            <Link to="Election2020SquareApp">Election2020SquareApp</Link>
            <Link to="CentralValleyWaterMultApp">CentralValleyWaterMultApp</Link>
            <Link to="Election2020MultApp">Election2020MultApp</Link>
            <Link to="CentralValleyWaterSquareApp">CentralValleyWaterSquareApp</Link>
            </main>
            }
        />
        <Route
        path="CentralValleyWaterApp"
        element={
          <React.Suspense fallback={<>...</>}>
            <CentralValleyWaterApp />
          </React.Suspense>
        }
      />
      <Route
        path="WildfireApp"
        element={
          <React.Suspense fallback={<>...</>}>
            <WildfireApp />
          </React.Suspense>
        }
      />
      <Route
        path="Election2020App"
        element={
          <React.Suspense fallback={<>...</>}>
            <Election2020App />
          </React.Suspense>
        }
      />
      <Route
        path="Election2020SquareApp"
        element={
          <React.Suspense fallback={<>...</>}>
            <Election2020SquareApp />
          </React.Suspense>
        }
      />
      <Route
        path="CentralValleyWaterMultApp"
        element={
          <React.Suspense fallback={<>...</>}>
            <CentralValleyWaterMultApp />
          </React.Suspense>
        }
      />
      <Route
        path="Election2020MultApp"
        element={
          <React.Suspense fallback={<>...</>}>
            <Election2020MultApp />
          </React.Suspense>
        }
      />
      <Route
        path="CentralValleyWaterSquareApp"
        element={
          <React.Suspense fallback={<>...</>}>
            <CentralValleyWaterSquareApp />
          </React.Suspense>
        }
      />
        </Routes>
    </HashRouter>
  );
}

    