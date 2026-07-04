import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
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
  const { t } = useI18n();
  const [selected, setSelected] = useState(0);
  const stage = KILL_CHAIN[selected];

  return (
    <section id="killchain" className="relative border-t border-gridline scroll-mt-24">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <SectionHeader index="04" label={t("killchain.label")} title={t("killchain.title")} />

        <motion.div
          variants={stagger}
          initial={shouldReduce ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          <motion.div variants={fadeUp} className="mt-6 flex flex-wrap items-center gap-2 font-mono text-[10px] tracking-[0.2em]">
            <span className="rounded border border-white/10 px-2 py-1 text-white/40">
              {t("killchain.caseTag")}
            </span>
            <span className="rounded border border-neon/40 bg-neon/10 px-2 py-1 text-neon">
              {t("killchain.statusTag")}
            </span>
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-2xl font-mono text-sm leading-relaxed text-white/50"
          >
            {t("killchain.intro")}
          </motion.p>

          {/* Desktop: horizontal chain */}
          <motion.div variants={fadeUp} className="relative mt-14 hidden md:block">
            <div className="absolute left-0 right-0 top-5 h-px bg-gridline" />
            <motion.div
              aria-hidden="true"
              className="absolute left-0 top-5 h-px bg-gradient-to-r from-red-500/70 via-amber-400/60 to-neon"
              initial={shouldReduce ? { width: "100%" } : { width: 0 }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, ease: "easeInOut" }}
            />
            <ol className="relative flex justify-between">
              {KILL_CHAIN.map((s, i) => {
                const active = i === selected;
                return (
                  <li key={s.id} className="flex flex-1 flex-col items-center text-center last:flex-none">
                    <button
                      type="button"
                      onClick={() => setSelected(i)}
                      aria-pressed={active}
                      aria-label={`${s.label}: ${s.summary}`}
                      className={`flex h-10 w-10 items-center justify-center rounded-full border font-mono text-xs transition-all duration-300 ${nodeTone(
                        s.kind,
                        active
                      )}`}
                    >
                      {s.phase}
                    </button>
                    <span
                      className={`mt-3 max-w-[7rem] font-mono text-[10px] tracking-[0.15em] transition-colors duration-300 ${
                        active ? "text-white" : "text-white/40"
                      }`}
                    >
                      {s.label}
                    </span>
                  </li>
                );
              })}
            </ol>
          </motion.div>

          {/* Mobile: vertical chain */}
          <motion.ol
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
                    className={`flex w-full items-center gap-3 rounded border px-3 py-2 text-left font-mono text-xs transition-colors duration-300 ${
                      active
                        ? "border-neon/40 bg-white/[0.04] text-white"
                        : "border-white/10 text-white/50"
                    }`}
                  >
                    <span className="text-white/30">{s.phase}</span>
                    {s.label}
                  </button>
                </li>
              );
            })}
          </motion.ol>

          {/* Shared detail panel */}
          <motion.div
            variants={fadeUp}
            className="relative mt-10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl [-webkit-backdrop-filter:blur(24px)] md:p-8"
          >
            {/* Keyed on stage id → React remounts on selection, replaying the
                enter transition. Avoids AnimatePresence exit-lock inside this
                variant-driven parent. */}
            <motion.div
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
                <span className="text-white/30">PHASE {stage.phase} / 06</span>
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold text-white md:text-2xl">
                {stage.label}
              </h3>
              <p className="mt-3 max-w-2xl font-mono text-xs leading-relaxed text-white/60 md:text-sm">
                {stage.detail}
              </p>
            </motion.div>
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-2xl font-mono text-xs leading-relaxed text-neon/90"
          >
            {t("killchain.outcome")}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
