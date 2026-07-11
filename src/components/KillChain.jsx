import { useEffect, useRef, useState } from "react";
import { m, useReducedMotion, useInView } from "framer-motion";
import SectionHeader from "./SectionHeader";
import { SPRING, fadeUp, stagger } from "../lib/motion";
import { useI18n } from "../i18n/LanguageContext";
import { KILL_CHAIN } from "../data/killchain";

function nodeTone(kind, active) {
  if (kind === "defense") {
    return active
      ? "border-neon bg-neon/20 text-neon shadow-glow-sm"
      : "border-neon/40 bg-neon/[0.06] text-neon/80";
  }
  return active
    ? "border-red-400 bg-red-500/20 text-red-300 [box-shadow:0_0_16px_rgba(248,113,113,0.35)]"
    : "border-red-500/40 bg-red-500/[0.06] text-red-400/80";
}

export default function KillChain() {
  const shouldReduce = useReducedMotion();
  const { t, tr } = useI18n();
  const [selected, setSelected] = useState(0);
  const stage = KILL_CHAIN[selected];

  // Measure the chain width so the packet can travel it with a transform
  // (x) instead of animating `left` — keeps the loop compositor-only.
  const trackRef = useRef(null);
  const [trackW, setTrackW] = useState(0);
  useEffect(() => {
    const el = trackRef.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;
    const measure = () => setTrackW(el.offsetWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // The packet only travels while the chain is actually on screen — no
  // infinite loop running behind the scenes for a section nobody's looking
  // at. SSR-safe: useInView reports false until the client observes it.
  const trackInView = useInView(trackRef, { once: false, margin: "-100px" });

  return (
    <section id="killchain" className="relative border-t border-gridline scroll-mt-24">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <SectionHeader index="06" label={t("killchain.label")} title={t("killchain.title")} />

        <m.div
          variants={stagger}
          initial={shouldReduce ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          <m.div variants={fadeUp} className="mt-6 flex flex-wrap items-center gap-2 font-mono text-[10px] tracking-[0.2em]">
            <span className="rounded border border-white/10 px-2 py-1 text-white/55">
              {t("killchain.caseTag")}
            </span>
            <span className="rounded border border-neon/40 bg-neon/10 px-2 py-1 text-neon">
              {t("killchain.statusTag")}
            </span>
          </m.div>

          <m.p
            variants={fadeUp}
            className="mt-6 max-w-2xl font-mono text-sm leading-relaxed text-white/50"
          >
            {t("killchain.intro")}
          </m.p>

          {/* Desktop: horizontal chain */}
          <m.div ref={trackRef} variants={fadeUp} className="relative mt-14 hidden md:block">
            <div className="absolute left-0 right-0 top-5 h-px bg-gridline" />
            {/* draw-in via scaleX (compositor-only) instead of width (layout) */}
            <m.div
              aria-hidden="true"
              className="absolute left-0 top-5 h-px w-full origin-left bg-gradient-to-r from-red-500/70 via-amber-400/60 to-neon"
              initial={shouldReduce ? { scaleX: 1 } : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, ease: "easeInOut" }}
            />
            {/* travelling packet — transform-only loop along the measured track */}
            {!shouldReduce && trackW > 0 && trackInView && (
              <m.span
                aria-hidden="true"
                className="absolute left-0 top-5 z-10 -ml-1 -mt-1 h-2 w-2 rounded-full bg-neon [box-shadow:0_0_12px_4px_rgba(16,185,129,0.6)]"
                initial={{ x: 0 }}
                animate={{ x: [0, trackW] }}
                transition={{ duration: 3.4, ease: "linear", repeat: Infinity, repeatDelay: 0.4 }}
              />
            )}
            <ol className="relative flex justify-between">
              {KILL_CHAIN.map((s, i) => {
                const active = i === selected;
                return (
                  <li key={s.id} className="flex flex-1 flex-col items-center text-center last:flex-none">
                    <span className="relative flex h-10 w-10 items-center justify-center">
                      {active && !shouldReduce && (
                        <span
                          aria-hidden="true"
                          className={`absolute inline-flex h-full w-full animate-ping rounded-full ${
                            s.kind === "defense" ? "bg-neon/25" : "bg-red-500/25"
                          }`}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => setSelected(i)}
                        aria-pressed={active}
                        aria-label={`${tr(s.label)}: ${tr(s.summary)}`}
                        className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border font-mono text-xs transition-all duration-300 ${nodeTone(
                          s.kind,
                          active
                        )}`}
                      >
                        {s.phase}
                      </button>
                    </span>
                    <span
                      className={`mt-3 max-w-[7rem] font-mono text-[10px] tracking-[0.15em] transition-colors duration-300 ${
                        active ? "text-white" : "text-white/55"
                      }`}
                    >
                      {tr(s.label)}
                    </span>
                  </li>
                );
              })}
            </ol>
          </m.div>

          {/* Mobile: vertical chain */}
          <m.ol
            variants={fadeUp}
            className="relative mt-12 space-y-3 border-l border-gridline pl-6 md:hidden"
          >
            {KILL_CHAIN.map((s, i) => {
              const active = i === selected;
              return (
                <li key={s.id} className="relative">
                  <span className="absolute -left-[27px] top-1.5 flex h-3 w-3 items-center justify-center">
                    <span
                      className={`h-2.5 w-2.5 rounded-full border ${
                        s.kind === "defense"
                          ? "border-neon bg-neon/40"
                          : "border-red-400 bg-red-500/40"
                      }`}
                    />
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelected(i)}
                    aria-pressed={active}
                    className={`flex min-h-[44px] w-full items-center gap-3 rounded border px-3 py-2 text-left font-mono text-xs transition-colors duration-300 ${
                      active
                        ? "border-neon/40 bg-white/[0.04] text-white"
                        : "border-white/10 text-white/50"
                    }`}
                  >
                    <span className="text-white/50">{s.phase}</span>
                    {tr(s.label)}
                  </button>
                </li>
              );
            })}
          </m.ol>

          {/* Shared detail panel */}
          <m.div
            variants={fadeUp}
            className="relative mt-10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl [-webkit-backdrop-filter:blur(24px)] md:p-8"
          >
            {/* Keyed on stage id → React remounts on selection, replaying the
                enter transition. Avoids AnimatePresence exit-lock inside this
                variant-driven parent. */}
            <m.div
              key={stage.id}
              initial={shouldReduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING }}
            >
              <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] tracking-[0.25em]">
                <span
                  className={`rounded border px-2 py-1 ${
                    stage.kind === "defense"
                      ? "border-neon/40 bg-neon/10 text-neon"
                      : "border-red-500/40 bg-red-500/10 text-red-400"
                  }`}
                >
                  {stage.kind === "defense" ? "RESPONSE" : "ADVERSARY"}
                </span>
                <span className="text-white/50">PHASE {stage.phase} / 06</span>
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold text-white md:text-2xl">
                {tr(stage.label)}
              </h3>
              <p className="mt-3 max-w-2xl font-mono text-xs leading-relaxed text-white/60 md:text-sm">
                {tr(stage.detail)}
              </p>
            </m.div>
          </m.div>

          <m.p
            variants={fadeUp}
            className="mt-6 max-w-2xl font-mono text-xs leading-relaxed text-neon/90"
          >
            {t("killchain.outcome")}
          </m.p>
        </m.div>
      </div>
    </section>
  );
}
