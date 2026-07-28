// @vitest-environment jsdom
//
// Scene3D itself (real WebGL/three rendering) is out of scope for jsdom.
// These tests cover the gating logic that decides whether Scene3D's heavy
// chunk is ever asked for: WebGL support, saveData, reduced motion, and
// viewport latching. Scene3D is mocked so we can assert on *whether* and
// *with what props* it would have been loaded, without touching three.js.
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, useEffect } from "react";
import { createRoot } from "react-dom/client";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const { sceneMountSpy, sceneUnmountSpy, scenePropsLog } = vi.hoisted(() => ({
  sceneMountSpy: vi.fn(),
  sceneUnmountSpy: vi.fn(),
  scenePropsLog: [],
}));

// Mocking the module Scene3D.jsx (not re-implementing it) lets us prove
// Scene3D only ever renders once the real gates pass, without pulling
// three/@react-three/fiber into the test. Note: the mock *factory* body
// (module-eval time) only runs once for the file's lifetime even across
// `vi.resetModules()` calls between tests — dynamic-import caching is
// per-specifier, not per-test — so the reliable per-render signal is the
// mount effect below (sceneMountSpy), not factory-execution.
vi.mock("./Scene3D", () => {
  return {
    default: function MockScene3D(props) {
      scenePropsLog.push(props);
      // Mirrors the real component's onReady contract without depending on
      // any three.js/WebGL behaviour.
      useEffect(() => {
        sceneMountSpy();
        props.onReady?.();
        return () => sceneUnmountSpy();
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
      return null;
    },
  };
});

class FakeIntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
    this.observed = [];
    this.disconnected = false;
    FakeIntersectionObserver.instances.push(this);
  }
  observe(el) {
    this.observed.push(el);
  }
  unobserve() {}
  disconnect() {
    this.disconnected = true;
  }
  trigger(isIntersecting) {
    this.callback([{ isIntersecting, target: this.observed[0] }]);
  }
}
FakeIntersectionObserver.instances = [];

function mockMatchMedia(matches) {
  const listeners = new Set();
  const mql = {
    matches,
    media: "(prefers-reduced-motion: reduce)",
    addEventListener: (_event, cb) => listeners.add(cb),
    removeEventListener: (_event, cb) => listeners.delete(cb),
    _listeners: listeners,
  };
  window.matchMedia = vi.fn().mockReturnValue(mql);
  return mql;
}

function mockWebGL(supported) {
  if (supported) {
    window.WebGLRenderingContext = function WebGLRenderingContext() {};
    window.HTMLCanvasElement.prototype.getContext = vi.fn((type) =>
      type === "webgl" || type === "experimental-webgl" ? {} : null
    );
  } else {
    delete window.WebGLRenderingContext;
    window.HTMLCanvasElement.prototype.getContext = vi.fn(() => null);
  }
}

function mockConnection(saveData) {
  Object.defineProperty(window.navigator, "connection", {
    value: saveData === undefined ? undefined : { saveData },
    configurable: true,
  });
}

let ModelViewport;

describe("ModelViewport gating", () => {
  let container;
  let root;

  beforeEach(async () => {
    vi.resetModules();
    sceneMountSpy.mockClear();
    sceneUnmountSpy.mockClear();
    scenePropsLog.length = 0;
    FakeIntersectionObserver.instances = [];
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
    mockMatchMedia(false);
    mockWebGL(true);
    mockConnection(undefined);
    Object.defineProperty(document, "visibilityState", {
      value: "visible",
      configurable: true,
    });

    ({ default: ModelViewport } = await import("./ModelViewport"));

    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  function renderViewport(props = {}) {
    act(() => {
      root.render(
        <ModelViewport modelUrl="/models/thing.glb" poster="/poster.png" {...props} />
      );
    });
  }

  function enterViewport() {
    const observer = FakeIntersectionObserver.instances[0];
    act(() => observer.trigger(true));
  }

  it("always renders the poster image, even before any gating resolves", () => {
    renderViewport();
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img.getAttribute("src")).toBe("/poster.png");
  });

  it("never renders (never loads) Scene3D when WebGL is unsupported", async () => {
    mockWebGL(false);
    renderViewport();
    enterViewport();
    await act(async () => {});
    expect(sceneMountSpy).not.toHaveBeenCalled();
  });

  it("never renders (never loads) Scene3D when the device requests reduced data (saveData)", async () => {
    mockConnection(true);
    renderViewport();
    enterViewport();
    await act(async () => {});
    expect(sceneMountSpy).not.toHaveBeenCalled();
  });

  it("does not render Scene3D until the panel has actually entered the viewport", async () => {
    renderViewport();
    await act(async () => {});
    expect(sceneMountSpy).not.toHaveBeenCalled();

    enterViewport();
    await act(async () => {});
    expect(sceneMountSpy).toHaveBeenCalledTimes(1);
  });

  it("renders Scene3D once WebGL is supported, saveData is off, and the panel is in view", async () => {
    renderViewport();
    enterViewport();
    await act(async () => {});
    expect(sceneMountSpy).toHaveBeenCalledTimes(1);
  });

  it("passes reducedMotion=true through to Scene3D when the media query matches, without blocking the canvas", async () => {
    mockMatchMedia(true);
    renderViewport();
    enterViewport();
    await act(async () => {});
    expect(sceneMountSpy).toHaveBeenCalledTimes(1);
    expect(scenePropsLog.at(-1).reducedMotion).toBe(true);
  });

  it("passes reducedMotion=false through to Scene3D when the media query does not match", async () => {
    renderViewport();
    enterViewport();
    await act(async () => {});
    expect(scenePropsLog.at(-1).reducedMotion).toBe(false);
  });

  it("latches: once shown, scrolling back out of view keeps Scene3D mounted instead of tearing it down", async () => {
    renderViewport();
    enterViewport();
    await act(async () => {});
    expect(sceneMountSpy).toHaveBeenCalledTimes(1);

    const observer = FakeIntersectionObserver.instances[0];
    act(() => observer.trigger(false));
    await act(async () => {});

    expect(sceneUnmountSpy).not.toHaveBeenCalled();
    expect(sceneMountSpy).toHaveBeenCalledTimes(1);
  });

  it("marks active=false (pause, not unmount) once the panel scrolls back out of view", async () => {
    renderViewport();
    enterViewport();
    await act(async () => {});

    const observer = FakeIntersectionObserver.instances[0];
    act(() => observer.trigger(false));
    await act(async () => {});

    expect(scenePropsLog.at(-1).active).toBe(false);
  });

  it("marks active=false when the tab is hidden even while the panel is in view", async () => {
    renderViewport();
    enterViewport();
    await act(async () => {});
    expect(scenePropsLog.at(-1).active).toBe(true);

    Object.defineProperty(document, "visibilityState", {
      value: "hidden",
      configurable: true,
    });
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    await act(async () => {});

    expect(scenePropsLog.at(-1).active).toBe(false);
  });

  it("disconnects the IntersectionObserver on unmount (no leaked observers)", () => {
    renderViewport();
    const observer = FakeIntersectionObserver.instances[0];
    expect(observer.disconnected).toBe(false);
    act(() => root.unmount());
    expect(observer.disconnected).toBe(true);
  });
});
