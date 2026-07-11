export const SPRING = { type: "spring", stiffness: 170, damping: 26 };
export const SPRING_SNAPPY = { type: "spring", stiffness: 260, damping: 20 };
export const SPRING_MODAL = { type: "spring", stiffness: 280, damping: 30 };

export const fadeUp = {
  hidden: { opacity: 0, y: 44 },
  visible: { opacity: 1, y: 0, transition: SPRING },
};

export const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.045, delayChildren: 0.02 } },
};

export const bentoCard = {
  hidden: { opacity: 0, y: 44 },
  visible: { opacity: 1, y: 0, transition: SPRING },
  hover: { scale: 1.02, y: -6, transition: SPRING_SNAPPY },
};

// x is relative to the glare strip (60% of card width): -150% parks it fully
// off the left edge, 300% carries it fully past the right edge.
export const glareSweep = {
  hidden: { x: "-150%" },
  visible: { x: "-150%" },
  hover: { x: "300%", transition: { duration: 0.9, ease: "easeInOut" } },
};
