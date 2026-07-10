import { m, useReducedMotion } from "framer-motion";
import SectionHeader from "./SectionHeader";
import { fadeUp, stagger } from "../lib/motion";
import { useI18n } from "../i18n/LanguageContext";
import { EXPERIENCE } from "../data/experience";

// The spine sits at SPINE px from the list's left edge; every node centers on
// that exact coordinate with -translate-x-1/2, so dots can never drift off the
// line. Content clears the spine via matching padding.
const SPINE = 18;

const TAG_TONE = {
  EDUCATION: {
    chip: "border-white/15 text-white/50",
    dot: "border-white/40 bg-white/20",
  },
  SECURITY: {
    chip: "border-red-500/40 text-red-400/90",
    dot: "border-red-400 bg-red-500/30",
  },
  BUILD: {
    chip: "border-neon/40 text-neon",
    dot: "border-neon bg-neon/30",
  },
};

function Node({ tag, ongoing }) {
  const tone = TAG_TONE[tag] ?? TAG_TONE.EDUCATION;
  return (
    <span
      style={{ left: SPINE }}
      className="absolute top-[3px] flex h-3.5 w-3.5 -translate-x-1/2 items-center justify-center"
    >
      {ongoing && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon/50" />
      )}
      <span
        className={`relative inline-flex h-2.5 w-2.5 rounded-full border ${
          ongoing ? "border-neon bg-neon shadow-glow-sm" : tone.dot
        }`}
      />
    </span>
  );
}

function Entry({ item, tr }) {
  const tone = TAG_TONE[item.tag] ?? TAG_TONE.EDUCATION;
  return (
    <m.li variants={fadeUp} className="relative" style={{ paddingLeft: SPINE + 26 }}>
      <Node tag={item.tag} ongoing={item.ongoing} />
      {/* connector tick from the spine into the entry */}
      <span
        aria-hidden="true"
        style={{ left: SPINE, width: 16 }}
        className="absolute top-[9px] h-px bg-gridline"
      />

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="font-mono text-[11px] tracking-[0.2em] text-neon/80">
          <span aria-hidden="true" className="mr-2 text-white/25">{">"}</span>
          {tr(item.period)}
        </span>
        <span
          className={`rounded border px-2 py-0.5 font-mono text-[9px] tracking-[0.2em] ${tone.chip}`}
        >
          {item.tag}
        </span>
      </div>

      <h3 className="mt-2 font-display text-lg font-semibold text-white md:text-xl">
        {tr(item.role)}
      </h3>
      <p className="mt-0.5 font-mono text-xs tracking-wide text-white/55">
        {tr(item.org)}
      </p>
      <p className="mt-3 max-w-2xl font-mono text-xs leading-relaxed text-white/55 md:text-sm">
        {tr(item.detail)}
      </p>
    </m.li>
  );
}

export default function Experience() {
  const shouldReduce = useReducedMotion();
  const { t, tr } = useI18n();

  return (
    <section id="experience" className="relative border-t border-gridline scroll-mt-24">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <SectionHeader index="03" label={t("experience.label")} title={t("experience.title")} />

        <m.p
          initial={shouldReduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-6 max-w-xl font-mono text-sm leading-relaxed text-white/50"
        >
          {t("experience.intro")}
        </m.p>

        <m.ol
          variants={stagger}
          initial={shouldReduce ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="relative mt-14 space-y-12"
        >
          {/* spine — draws in from the top as the log enters the viewport */}
          <m.span
            aria-hidden="true"
            style={{ left: SPINE }}
            initial={shouldReduce ? false : { scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute bottom-1 top-1 w-px origin-top bg-gradient-to-b from-neon/60 via-gridline to-gridline"
          />
          {EXPERIENCE.map((item) => (
            <Entry key={`${item.period.en}-${item.role.en}`} item={item} tr={tr} />
          ))}
        </m.ol>
      </div>
    </section>
  );
}
