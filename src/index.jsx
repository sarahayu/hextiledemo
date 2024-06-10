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
            <main id="index-main">
                <div className="main-container">
                    <Link to="CentralValleyWaterApp" title="CentralValleyWaterApp" ><img src="CentralValleyWaterApp.png" className="linkPics" /></Link>
            <Link to="WildfireApp" title="WildfireApp" ><img src="WildfireApp.png" className="linkPics" /></Link>
            <Link to="Election2020App" title="Election2020App" ><img src="Election2020App.png" className="linkPics" /></Link>
            <Link to="Election2020SquareApp" title="Election2020SquareApp" ><img src="Election2020SquareApp.png" className="linkPics" /></Link>
            <Link to="CentralValleyWaterMultApp" title="CentralValleyWaterMultApp" ><img src="CentralValleyWaterMultApp.png" className="linkPics" /></Link>
            <Link to="Election2020MultApp" title="Election2020MultApp" ><img src="Election2020MultApp.png" className="linkPics" /></Link>
            <Link to="CentralValleyWaterSquareApp" title="CentralValleyWaterSquareApp" ><img src="CentralValleyWaterSquareApp.png" className="linkPics" /></Link>
                </div>
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

    