// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import useInViewport from "./useInViewport";

// react-dom/test-utils' act() needs this flag set explicitly outside of
// @testing-library/react (which normally sets it for you).
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Minimal fake that lets a test manually fire intersection events and
// inspect what the hook asked for (rootMargin) and did (observe/disconnect).
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

function Harness({ options }) {
  const [ref, inView] = useInViewport(options);
  return <div ref={ref}>{inView ? "in" : "out"}</div>;
}

describe("useInViewport", () => {
  let container;
  let root;

  beforeEach(() => {
    FakeIntersectionObserver.instances = [];
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  it("starts with inView false (SSR-safe initial render)", () => {
    act(() => {
      root.render(<Harness />);
    });
    expect(container.textContent).toBe("out");
  });

  it("flips to true once the observer reports an intersection", () => {
    act(() => {
      root.render(<Harness />);
    });
    const observer = FakeIntersectionObserver.instances[0];
    act(() => observer.trigger(true));
    expect(container.textContent).toBe("in");
  });

  it("flips back to false when the target leaves the viewport", () => {
    act(() => {
      root.render(<Harness />);
    });
    const observer = FakeIntersectionObserver.instances[0];
    act(() => observer.trigger(true));
    act(() => observer.trigger(false));
    expect(container.textContent).toBe("out");
  });

  it("defaults rootMargin to 200px", () => {
    act(() => {
      root.render(<Harness />);
    });
    expect(FakeIntersectionObserver.instances[0].options).toEqual({ rootMargin: "200px" });
  });

  it("forwards a custom rootMargin to the observer", () => {
    act(() => {
      root.render(<Harness options={{ rootMargin: "240px" }} />);
    });
    expect(FakeIntersectionObserver.instances[0].options).toEqual({ rootMargin: "240px" });
  });

  it("with once=true, disconnects itself after the first intersection", () => {
    act(() => {
      root.render(<Harness options={{ once: true }} />);
    });
    const observer = FakeIntersectionObserver.instances[0];
    act(() => observer.trigger(true));
    expect(observer.disconnected).toBe(true);
  });

  it("without once, stays connected across repeated intersection changes", () => {
    act(() => {
      root.render(<Harness />);
    });
    const observer = FakeIntersectionObserver.instances[0];
    act(() => observer.trigger(true));
    act(() => observer.trigger(false));
    expect(observer.disconnected).toBe(false);
  });

  it("disconnects the observer on unmount (no leaked observers)", () => {
    act(() => {
      root.render(<Harness />);
    });
    const observer = FakeIntersectionObserver.instances[0];
    expect(observer.disconnected).toBe(false);
    act(() => root.unmount());
    expect(observer.disconnected).toBe(true);
  });

  it("does not throw and stays out of view when IntersectionObserver is unsupported", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    expect(() => {
      act(() => {
        root.render(<Harness />);
      });
    }).not.toThrow();
    expect(container.textContent).toBe("out");
  });
});
