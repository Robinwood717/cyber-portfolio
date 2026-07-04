import { motion } from "framer-motion";

const FOCUS_AREAS = [
  "Incident Response",
  "Network Security",
  "Advanced Data Structures",
  "Discrete Mathematics",
  "Privacy by Design",
];

function MarqueeRun({ hidden = false }) {
  return (
    <div aria-hidden={hidden} className="flex shrink-0 items-center">
      {FOCUS_AREAS.map((area) => (
        <span
          key={area}
          className="flex items-center font-display text-sm font-medium uppercase tracking-[0.3em] text-white/60"
        >
          <span className="px-6 md:px-10">{area}</span>
          <span className="text-neon [text-shadow:0_0_12px_rgba(16,185,129,0.6)]">
            {"//"}
          </span>
        </span>
      ))}
    </div>
  );
}

export default function SkillsMarquee() {
  return (
    <section
      aria-label="Focus areas"
      className="relative overflow-hidden border-y border-gridline bg-white/[0.015] py-5"
    >
      <motion.div
        className="flex w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ ease: "linear", duration: 30, repeat: Infinity }}
      >
        <MarqueeRun />
        <MarqueeRun hidden />
      </motion.div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-void to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-void to-transparent" />
    </section>
  );
}
