import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, stagger } from "../lib/motion";

export default function SectionHeader({ index, label, title, className = "" }) {
  const shouldReduce = useReducedMotion();

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
        className="font-mono text-xs tracking-[0.35em] text-neon"
      >
        [{index}] {"//"} {label}
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
