import { useEffect, useRef } from "react";

// A neon reticle: a precise dot that tracks the pointer 1:1, and a lagging
// ring that eases behind it and swells over interactive targets. Only mounts
// on fine-pointer, non-reduced-motion devices; the native cursor is hidden via
// the `has-custom-cursor` class while active, and any touch input tears it all
// down so mobile is never affected.
export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return undefined;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return undefined;

    document.documentElement.classList.add("has-custom-cursor");

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let raf = 0;

    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
    };
    const loop = () => {
      rx += (mx - rx) * 0.2;
      ry += (my - ry) * 0.2;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      raf = requestAnimationFrame(loop);
    };
    const onOver = (e) => {
      const hit = e.target.closest?.("a, button, [role=button], input, textarea, select, label");
      ring.dataset.hover = hit ? "1" : "0";
    };
    const onLeave = () => {
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };
    const onEnter = () => {
      dot.style.opacity = "1";
      ring.style.opacity = "1";
    };

    let cleanup = () => {};
    const onTouch = () => {
      document.documentElement.classList.remove("has-custom-cursor");
      cleanup();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);
    window.addEventListener("touchstart", onTouch, { once: true, passive: true });
    raf = requestAnimationFrame(loop);

    cleanup = () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      window.removeEventListener("touchstart", onTouch);
      document.documentElement.classList.remove("has-custom-cursor");
    };
    return cleanup;
  }, []);

  return (
    <>
      <div ref={dotRef} aria-hidden="true" className="cursor-dot" />
      <div ref={ringRef} aria-hidden="true" className="cursor-ring" data-hover="0" />
    </>
  );
}
