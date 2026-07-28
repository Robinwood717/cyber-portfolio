// Runs in vitest's default NODE environment on purpose — no jsdom directive.
// scripts/prerender.mjs renders with no DOM globals at all, and components
// branch on `typeof window !== "undefined"`, so rendering under jsdom would
// take a different path than the real build and prove nothing about it.
//
// The prerendered HTML is what React hydrates against, so it must not depend
// on WHEN it was rendered. It used to: the Command Center threat feed stamped
// `new Date()` into its seed rows, which baked the build machine's clock into
// dist/*.html. Every visitor then hydrated with a different time, React saw a
// text mismatch and fell back to client-rendering the entire root (React
// #418/#423), throwing the prerender away.
//
// This renders through the real build-time entry (scripts/prerender.mjs uses
// the same `render`) at two wall-clock times an hour apart and requires the
// markup to be byte-identical, so any future nondeterministic render — clock,
// Math.random, locale-dependent formatting — fails here rather than silently
// on the deployed site.
import { describe, it, expect, afterEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

async function renderAt(epochMs, url) {
  vi.resetModules();
  vi.useFakeTimers();
  vi.setSystemTime(new Date(epochMs));
  const { render } = await import("./entry-server");
  const html = render(url);
  vi.useRealTimers();
  return html;
}

const T1 = Date.UTC(2026, 0, 15, 9, 13, 35);
const T2 = Date.UTC(2026, 0, 15, 17, 47, 2); // same day, very different clock

describe("prerendered markup is time-independent (hydration safety)", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the homepage identically regardless of build time", async () => {
    const a = await renderAt(T1, "/");
    const b = await renderAt(T2, "/");
    expect(a).toBe(b);
  });

  it("renders a project dossier identically regardless of build time", async () => {
    const a = await renderAt(T1, "/ops/dlp-scanner");
    const b = await renderAt(T2, "/ops/dlp-scanner");
    expect(a).toBe(b);
  });

  it("bakes no wall-clock reading into the homepage markup", async () => {
    const html = await renderAt(T1, "/");
    // The threat feed ships placeholders; the only HH:MM:SS allowed is the
    // uptime counter, which is derived from a constant baseline.
    const clocks = html.match(/\d{2}:\d{2}:\d{2}/g) ?? [];
    const fromBuildClock = clocks.filter((c) => c.startsWith("09:"));
    expect(fromBuildClock).toEqual([]);
    expect(html).toContain("--:--:--");
  });
});

// prefers-reduced-motion is a client-only signal — the prerender has no
// `window`, so it always took the non-reduced branch while reduced-motion
// visitors took the other one, and hydration failed for exactly the readers
// who asked for less motion. Motion reduction now happens through
// MotionConfig reducedMotion="user" (which drops the transform tween without
// changing markup) and CSS motion-reduce: utilities, so the rendered tree is
// the same either way. This guards the rule at the source level, because a
// reintroduced branch only misbehaves for a visitor whose OS setting the test
// suite does not emulate.
describe("markup never branches on reduced motion", () => {
  const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)));

  // Overlays that open on demand. Their panels live inside AnimatePresence
  // behind state that is false on first render, so their `initial` never
  // reaches the prerendered markup and cannot mismatch. They keep their
  // explicit reduced-motion branch on purpose: these are focal, centred
  // elements, where relying on MotionConfig to snap the transform would put a
  // one-frame offset right where the reader is looking. Off-screen section
  // reveals do not have that problem, which is why they do not need it.
  const EXEMPT = ["components/CommandPalette.jsx", "components/DossierModal.jsx"];

  function walk(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) return walk(p);
      return e.isFile() && /\.jsx?$/.test(e.name) && !/\.test\./.test(e.name) ? [p] : [];
    });
  }

  it("no component decides `initial` from useReducedMotion", () => {
    const offenders = [];
    for (const file of walk(SRC)) {
      const rel = path.relative(SRC, file).split(path.sep).join("/");
      if (EXEMPT.includes(rel)) continue;
      const src = fs.readFileSync(file, "utf8");
      src.split(/\r?\n/).forEach((line, i) => {
        // `initial={shouldReduce ? ... }` and friends — a ternary on a
        // reduced-motion value inside an `initial` prop.
        if (/initial=\{[^}]*(shouldReduce|reduceMotion|prefersReduced)[^}]*\?/.test(line)) {
          offenders.push(`${path.relative(SRC, file)}:${i + 1}`);
        }
      });
    }
    expect(offenders).toEqual([]);
  });
});
