import { motion, useReducedMotion } from "framer-motion";
import SectionHeader from "./SectionHeader";
import { fadeUp, stagger } from "../lib/motion";
import { useI18n } from "../i18n/LanguageContext";
import { EXPERIENCE } from "../data/experience";

const TAG_TONE = {
  EDUCATION: "border-white/15 text-white/50",
  SECURITY: "border-red-500/40 text-red-400/90",
  BUILD: "border-neon/40 text-neon",
};

function Entry({ item }) {
  return (
    <motion.li variants={fadeUp} className="relative pl-8 md:pl-10">
      {/* timeline node */}
      <span className="absolute left-0 top-1.5 flex h-3 w-3 -translate-x-1/2 items-center justify-center">
        {item.ongoing && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon/60" />
        )}
        <span
          className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
            item.ongoing ? "bg-neon" : "border border-neon/50 bg-void"
          }`}
        />
      </span>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-mono text-[11px] tracking-[0.2em] text-neon/80">
          {item.period}
        </span>
        <span
          className={`rounded border px-2 py-0.5 font-mono text-[9px] tracking-[0.2em] ${
            TAG_TONE[item.tag] ?? "border-white/15 text-white/50"
          }`}
        >
          {item.tag}
        </span>
      </div>

      <h3 className="mt-2 font-display text-lg font-semibold text-white md:text-xl">
        {item.role}
      </h3>
      <p className="mt-0.5 font-mono text-xs tracking-wide text-white/40">{item.org}</p>
      <p className="mt-3 max-w-2xl font-mono text-xs leading-relaxed text-white/55 md:text-sm">
        {item.detail}
      </p>
    </motion.li>
  );
}

export default function Experience() {
  const shouldReduce = useReducedMotion();
  const { t } = useI18n();

  return (
    <section id="experience" className="relative border-t border-gridline scroll-mt-24">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <SectionHeader index="03" label={t("experience.label")} title={t("experience.title")} />

        <motion.p
          initial={shouldReduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-6 max-w-xl font-mono text-sm leading-relaxed text-white/50"
        >
          {t("experience.intro")}
        </motion.p>

        <motion.ol
          variants={stagger}
          initial={shouldReduce ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="relative mt-14 space-y-12 border-l border-gridline pl-1"
        >
          {EXPERIENCE.map((item) => (
            <Entry key={`${item.period}-${item.role}`} item={item} />
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
