// Deliberately no jsdom environment directive for this file: it runs in
// vitest's default node environment, where `window`/`document`/
// `IntersectionObserver` are simply undefined (same as the SSR/prerender
// worker in scripts/prerender.mjs). If useInViewport or ModelViewport ever
// touched any of those at module-evaluation time (rather than inside a
// hook/effect that only runs client-side), importing them here would throw
// a ReferenceError and this file would fail to even collect.
import { describe, it, expect } from "vitest";

describe("3D model integration modules are SSR-safe to import", () => {
  it("useInViewport has no top-level window/document access", async () => {
    const mod = await import("../hooks/useInViewport");
    expect(typeof mod.default).toBe("function");
  });

  it("ModelViewport has no top-level window/document access", async () => {
    const mod = await import("./ModelViewport");
    expect(typeof mod.default).toBe("function");
  });

  it("modelTheme has no top-level window/document access", async () => {
    const mod = await import("../lib/modelTheme");
    expect(typeof mod.IDLE_ROTATION_SECONDS).toBe("number");
  });

  it("confirms this file is actually running without DOM globals (sanity check for the tests above)", () => {
    expect(typeof window).toBe("undefined");
    expect(typeof document).toBe("undefined");
    expect(typeof IntersectionObserver).toBe("undefined");
  });
});
