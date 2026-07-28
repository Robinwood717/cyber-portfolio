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
