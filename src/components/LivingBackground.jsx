import { useEffect, useRef } from "react";

// Ambient network-mesh canvas that sits behind all content. Nodes drift, link
// to nearby neighbours, react to the cursor, and parallax against scroll by
// per-node depth. Everything is perf-bounded: node count scales with viewport
// area, DPR is clamped, the loop pauses when the tab is hidden, and
// reduced-motion draws a single static frame with no animation loop.
const NEON = "16, 185, 129";
const LINK_DIST = 132;
const MAX_NODES = 90;

export default function LivingBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    let width = 0;
    let height = 0;
    let nodes = [];
    let raf = 0;
    let scrollY = window.scrollY;
    const pointer = { x: -9999, y: -9999, active: false };

    const nodeCount = () => {
      const byArea = Math.round((window.innerWidth * window.innerHeight) / 22000);
      return Math.max(28, Math.min(MAX_NODES, byArea));
    };

    const build = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      nodes = Array.from({ length: nodeCount() }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        depth: 0.35 + Math.random() * 0.65,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const parY = (n) => {
        const y = n.y - scrollY * n.depth * 0.06;
        return ((y % height) + height) % height;
      };

      for (const n of nodes) {
        if (!reduced) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0) n.x += width;
          else if (n.x > width) n.x -= width;
          if (n.y < 0) n.y += height;
          else if (n.y > height) n.y -= height;
        }
      }

      // links
      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i];
        const ax = a.x;
        const ay = parY(a);
        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j];
          const dx = ax - b.x;
          const dy = ay - parY(b);
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DIST) {
            const alpha = (1 - dist / LINK_DIST) * 0.16;
            ctx.strokeStyle = `rgba(${NEON}, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(b.x, parY(b));
            ctx.stroke();
          }
        }
      }

      // nodes + cursor influence
      for (const n of nodes) {
        const ny = parY(n);
        let glow = 0.32;
        if (pointer.active) {
          const d = Math.hypot(n.x - pointer.x, ny - pointer.y);
          if (d < 150) {
            glow = 0.32 + (1 - d / 150) * 0.55;
            const alpha = (1 - d / 150) * 0.22;
            ctx.strokeStyle = `rgba(${NEON}, ${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(n.x, ny);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.stroke();
          }
        }
        ctx.fillStyle = `rgba(${NEON}, ${glow})`;
        ctx.beginPath();
        ctx.arc(n.x, ny, 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (raf || reduced) return;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const onScroll = () => {
      scrollY = window.scrollY;
      if (reduced) draw();
    };
    const onPointerMove = (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };
    const onPointerLeave = () => {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") stop();
      else start();
    };

    let resizeTimer = 0;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        build();
        if (reduced) draw();
      }, 180);
    };

    build();
    draw();
    start();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      clearTimeout(resizeTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}
