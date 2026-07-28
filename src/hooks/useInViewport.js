import { useEffect, useRef, useState } from "react";

// Thin IntersectionObserver wrapper used to gate expensive mounts (the 3D
// scene chunk, WebGL context, rAF loops) to "actually on screen" rather than
// "somewhere on the page". SSR-safe: `inView` starts false and only flips
// once the client observes the node, so server output never assumes
// viewport state.
export default function useInViewport({ rootMargin = "200px", once = false } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && once) observer.disconnect();
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, once]);

  return [ref, inView];
}
