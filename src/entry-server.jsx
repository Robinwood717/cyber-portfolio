import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { LazyMotion, MotionConfig } from "framer-motion";
import App from "./App";
import { LanguageProvider } from "./i18n/LanguageContext";
import { PROJECTS } from "./data/projects";
import motionFeatures from "./lib/motionFeatures";

// Build-time prerender entry (see scripts/prerender.mjs). reducedMotion is
// forced on so entrance animations render at their *final* (visible) state:
// the static HTML paints real content, and the client replays animations
// after hydration.
export function render(url) {
  return renderToString(
    <StaticRouter location={url}>
      <LanguageProvider>
        <LazyMotion features={motionFeatures} strict>
          <MotionConfig reducedMotion="always">
            <App />
          </MotionConfig>
        </LazyMotion>
      </LanguageProvider>
    </StaticRouter>
  );
}

export function getRoutes() {
  return [
    "/",
    ...PROJECTS.filter((p) => p.flagship).map((p) => `/ops/${p.slug}`),
  ];
}

// Route-specific meta baked into the static HTML so social scrapers and
// search snippets see per-page titles/descriptions without executing JS.
export function getMeta(url) {
  const slug = url.startsWith("/ops/") ? url.slice("/ops/".length) : null;
  const project = slug ? PROJECTS.find((p) => p.slug === slug) : null;
  if (!project) return null; // homepage keeps the template's default meta
  const summary =
    typeof project.summary === "string" ? project.summary : project.summary.en;
  return {
    title: `${project.title} // Anastasios Soumpakis`,
    description: summary,
  };
}
