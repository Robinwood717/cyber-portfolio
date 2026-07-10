import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { LazyMotion, MotionConfig } from "framer-motion";
import App from "./App";
import { LanguageProvider } from "./i18n/LanguageContext";
import "./index.css";

// Animation features load in their own chunk; until they arrive the `m`
// components render static markup, so first paint never waits on them.
const loadMotionFeatures = () =>
  import("./lib/motionFeatures").then((mod) => mod.default);

const app = (
  <React.StrictMode>
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <LanguageProvider>
        <LazyMotion features={loadMotionFeatures} strict>
          <MotionConfig reducedMotion="user">
            <App />
          </MotionConfig>
        </LazyMotion>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);

const container = document.getElementById("root");
// Prerendered pages (scripts/prerender.mjs) ship markup in #root and
// hydrate; the dev server's empty shell mounts from scratch.
if (container.hasChildNodes()) {
  ReactDOM.hydrateRoot(container, app);
} else {
  ReactDOM.createRoot(container).render(app);
}
