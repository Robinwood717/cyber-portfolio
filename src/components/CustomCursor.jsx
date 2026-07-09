import { useEffect, useRef } from "react";

// Neon reticle: a dot that tracks the pointer and a ring that eases behind it,
// swelling over interactive targets. Activation is driven by a real MOUSE
// `pointermove` — not a media-query guess — so touch-only devices never trigger
// it and the reticle divs stay `display:none` (gated on `.has-custom-cursor`).
// Any touch input deactivates it; fully off under reduced motion.
export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return undefined;

    let active = false;
    let mx = 0;
    let my = 0;
    let rx = 0;
    let ry = 0;
    let raf = 0;

    const loop = () => {
      rx += (mx - rx) * 0.2;
      ry += (my - ry) * 0.2;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      raf = requestAnimationFrame(loop);
    };
    const activate = () => {
      if (active) return;
      active = true;
      rx = mx; // snap the ring to the first real position — no fly-in from 0,0
      ry = my;
      document.documentElement.classList.add("has-custom-cursor");
      raf = requestAnimationFrame(loop);
    };
    const deactivate = () => {
      if (!active) return;
      active = false;
      cancelAnimationFrame(raf);
      raf = 0;
      document.documentElement.classList.remove("has-custom-cursor");
    };

    const onPointerMove = (e) => {
      if (e.pointerType && e.pointerType !== "mouse") return; // ignore touch/pen
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
      if (!active) activate();
    };
    const onOver = (e) => {
      if (!active) return;
      const hit = e.target.closest?.("a, button, [role=button], input, textarea, select, label");
      ring.dataset.hover = hit ? "1" : "0";
    };
    const onLeave = () => {
      if (!active) return;
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };
    const onEnter = () => {
      if (!active) return;
      dot.style.opacity = "1";
      ring.style.opacity = "1";
    };
    const onTouch = () => deactivate();

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);
    window.addEventListener("touchstart", onTouch, { passive: true });

    return () => {
      deactivate();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      window.removeEventListener("touchstart", onTouch);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} aria-hidden="true" className="cursor-dot" />
      <div ref={ringRef} aria-hidden="true" className="cursor-ring" data-hover="0" />
    </>
  );
}
