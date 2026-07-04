import { motion, useReducedMotion } from "framer-motion";
import SectionHeader from "./SectionHeader";
import { fadeUp, stagger } from "../lib/motion";
import { useI18n } from "../i18n/LanguageContext";

export default function Methodology() {
  const shouldReduce = useReducedMotion();
  const { t } = useI18n();
  const lines = t("doctrine.lines");

  return (
    <section id="doctrine" className="relative scroll-mt-24">
      <div className="mx-auto grid max-w-6xl gap-14 px-6 py-24 md:py-32 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
        <SectionHeader index="02" label={t("doctrine.label")} title={t("doctrine.title")} />

        <motion.div
          variants={stagger}
          initial={shouldReduce ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="space-y-8"
        >
          <motion.p
            variants={fadeUp}
            className="font-mono text-sm leading-relaxed text-white/60 md:text-base"
          >
            <span className="text-white">{t("doctrine.p1intro")}</span>{" "}
            {t("doctrine.p1")}
          </motion.p>

          <motion.p
            variants={fadeUp}
            className="font-mono text-sm leading-relaxed text-white/60 md:text-base"
          >
            {t("doctrine.p2")}
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="rounded-xl border border-neon/25 bg-neon/[0.04] p-6 shadow-glow-sm md:p-8"
          >
            <p className="font-mono text-xs text-white/30">{t("doctrine.sig")}</p>
            <div className="mt-4 space-y-2 font-mono text-base font-medium md:text-lg">
              {lines.map((line, i) => (
                <p key={line} className="flex items-baseline gap-4">
                  <span className="text-xs text-white/25">0{i + 1}</span>
                  <span className="text-neon [text-shadow:0_0_14px_rgba(16,185,129,0.45)]">
                    {line}
                  </span>
                </p>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
