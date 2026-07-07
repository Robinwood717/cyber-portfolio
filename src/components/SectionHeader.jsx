import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, stagger } from "../lib/motion";

const GLYPHS = "!<>-_\\/[]{}=+*^?#01";

// Eyebrow labels decode on first scroll-in (like the footer channel links).
// Punctuation and spaces stay locked so the shape reads through the scramble.
function useLabelScramble(label, disabled) {
  const [display, setDisplay] = useState(label);
  const timer = useRef(null);
  const played = useRef(false);

  // Keep the shown text in sync when the source label changes (e.g. language
  // toggle) without replaying the animation.
  useEffect(() => {
    setDisplay(label);
  }, [label]);

  useEffect(() => () => clearInterval(timer.current), []);

  const run = () => {
    if (disabled || played.current) {
      setDisplay(label);
      return;
    }
    played.current = true;
    clearInterval(timer.current);
    let frame = 0;
    timer.current = setInterval(() => {
      frame += 1;
      const locked = Math.floor(frame * 0.75);
      setDisplay(
        label
          .split("")
          .map((ch, i) =>
            i < locked || ch === " " || ch === "/"
              ? ch
              : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
          )
          .join("")
      );
      if (locked >= label.length) {
        clearInterval(timer.current);
        setDisplay(label);
      }
    }, 30);
  };

  return { display, run };
}

export default function SectionHeader({ index, label, title, className = "" }) {
  const shouldReduce = useReducedMotion();
  const { display, run } = useLabelScramble(label, !!shouldReduce);

  return (
    <motion.div
      variants={stagger}
      initial={shouldReduce ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className={className}
    >
      <motion.p
        variants={fadeUp}
        onViewportEnter={run}
        viewport={{ once: true, margin: "-60px" }}
        className="font-mono text-xs tracking-[0.35em] text-neon"
      >
        [{index}] {"//"} {display}
      </motion.p>
      <motion.h2
        variants={fadeUp}
        className="mt-4 font-display text-3xl font-semibold text-white md:text-5xl"
      >
        {title}
      </motion.h2>
    </motion.div>
  );
}
