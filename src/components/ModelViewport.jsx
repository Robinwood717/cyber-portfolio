import { Component, lazy, Suspense, useEffect, useState } from "react";
import useInViewport from "../hooks/useInViewport";
import { IDLE_ROTATION_SECONDS } from "../lib/modelTheme";

// The only eager import from the r3f world: React.lazy's loader function is
// just a closure until it's actually called, so this line does not pull
// three/@react-three/fiber into the chunk that imports ModelViewport. The
// real import() only fires once `showCanvas` goes true below.
const Scene3D = lazy(() => import("./Scene3D"));

function supportsWebGL() {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  if (!window.WebGLRenderingContext) return false;
  let gl = null;
  try {
    const canvas = document.createElement("canvas");
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    return !!gl;
  } catch {
    return false;
  } finally {
    // Dropping the canvas reference is NOT enough: the context stays live
    // until GC, and browsers cap live contexts per page (Chrome: 16), evicting
    // the OLDEST when the cap is passed. Since this probe runs on every mount
    // and the site is an SPA, a handful of route changes would otherwise
    // accumulate enough zombie probes to evict a *live* scene's context and
    // black its canvas out. Hand it back immediately instead.
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  }
}

// A decorative set piece must never take the page down with it. If the 3D
// chunk, the GLB fetch, or the WASM meshopt decoder throws (e.g. a stricter
// CSP without 'wasm-unsafe-eval' blocks WebAssembly.instantiate), this
// boundary swallows the error and the poster simply stays visible.
class SceneErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    console.warn("3D scene failed, keeping poster fallback:", error);
    // The canvas is about to unmount. If it had already reported ready the
    // poster is faded out, so without this the panel would go completely
    // empty rather than falling back.
    this.props.onFailure?.();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function prefersReducedData() {
  if (typeof navigator === "undefined") return false;
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  return Boolean(conn?.saveData);
}

// Decorative-only wrapper: mounts the heavy Scene3D chunk at most once, only
// once the panel is actually approaching the viewport, and only when the
// device can render it cheaply. Always renders the poster underneath so
// there is real content in the prerendered HTML and during the download
// window for the 3D chunk — the canvas cross-fades in on top once ready,
// never the other way around, so nothing pops from blank to visible.
export default function ModelViewport({
  modelUrl,
  poster,
  accentMaterials,
  rotationSeconds = IDLE_ROTATION_SECONDS,
  className = "",
}) {
  const [ref, inView] = useInViewport({ rootMargin: "240px" });
  const [everInView, setEverInView] = useState(false);
  const [canRender, setCanRender] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCanRender(supportsWebGL() && !prefersReducedData());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onMotionChange = () => setReducedMotion(mq.matches);
    mq.addEventListener?.("change", onMotionChange);

    const onVisibility = () => setTabVisible(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      mq.removeEventListener?.("change", onMotionChange);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    if (inView) setEverInView(true);
  }, [inView]);

  // Preload intent: once the panel is close to the viewport, kick off the
  // chunk + model fetch. `everInView` latches so scrolling briefly past and
  // back doesn't tear the WebGL context down and rebuild it.
  const showCanvas = canRender && everInView;
  const active = inView && tabVisible;

  return (
    // Position comes from the caller (every call site passes `absolute
    // inset-0` inside a sized, positioned box). Hardcoding `relative` here
    // would conflict with that: .relative wins the CSS order battle, the
    // wrapper drops out of the parent's box, and it collapses to zero
    // height because every child is absolutely positioned.
    <div
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none overflow-hidden ${className}`}
    >
      <img
        src={poster}
        alt=""
        loading="lazy"
        decoding="async"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-out ${
          ready ? "opacity-0" : "opacity-100"
        }`}
      />
      {showCanvas && (
        <SceneErrorBoundary onFailure={() => setReady(false)}>
          <Suspense fallback={null}>
            <Scene3D
              modelUrl={modelUrl}
              accentMaterials={accentMaterials}
              active={active}
              reducedMotion={reducedMotion}
              rotationSeconds={rotationSeconds}
              onReady={() => setReady(true)}
              // A lost GPU context does not throw, so the boundary never sees
              // it — the canvas just goes blank. Bring the poster back instead.
              onContextLost={() => setReady(false)}
              onContextRestored={() => setReady(true)}
            />
          </Suspense>
        </SceneErrorBoundary>
      )}
    </div>
  );
}
