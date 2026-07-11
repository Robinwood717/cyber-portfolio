import { useRef } from "react";
import { m, AnimatePresence, useReducedMotion } from "framer-motion";
import { useI18n } from "../i18n/LanguageContext";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { SPRING_MODAL } from "../lib/motion";

export default function DossierModal({ open, onClose, project }) {
  const shouldReduce = useReducedMotion();
  const { t, tr } = useI18n();
  const panelRef = useRef(null);
  const closeRef = useRef(null);

  // Scroll lock, focus trap, Escape, and focus restore.
  useFocusTrap(panelRef, { open, onClose, initialFocusRef: closeRef });

  if (!project) return null;

  const rowVariants = {
    hidden: { opacity: 0, x: shouldReduce ? 0 : -12 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <AnimatePresence>
      {open && (
        <m.div
          className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.2 } }}
          exit={{ opacity: 0, transition: { duration: 0.12 } }}
        >
          {/* backdrop */}
          <button
            type="button"
            aria-label={t("project.dossier.close")}
            onClick={onClose}
            className="fixed inset-0 cursor-default bg-black/85 backdrop-blur-sm"
          />

          <m.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={`${project.title}: ${t("project.dossier.header")}`}
            initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: SPRING_MODAL }}
            exit={
              shouldReduce
                ? { opacity: 0, transition: { duration: 0.14 } }
                : {
                    opacity: 0,
                    y: 24,
                    scale: 0.98,
                    transition: { duration: 0.18, ease: [0.4, 0, 1, 1] },
                  }
            }
            className="dossier-scanlines relative z-10 my-auto w-full max-w-2xl overflow-hidden rounded-lg border border-red-500/25 bg-[#020202] shadow-[0_0_60px_rgba(0,0,0,0.9),0_0_40px_rgba(248,113,113,0.08)]"
          >
            {/* header bar */}
            <div className="flex items-center justify-between border-b border-red-500/20 bg-red-500/[0.04] px-5 py-3">
              <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.25em]">
                <span className="rounded border border-red-500/50 bg-red-500/15 px-2 py-1 text-red-300">
                  TLP:RED
                </span>
                <span className="text-white/55">{t("project.dossier.header")}</span>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="inline-flex min-h-[44px] items-center rounded border border-white/15 px-2.5 py-1 font-mono text-[10px] tracking-[0.2em] text-white/50 transition-colors duration-200 hover:border-neon/50 hover:text-neon"
              >
                {t("project.dossier.close")}
              </button>
            </div>

            <div className="relative px-6 py-7 md:px-8">
              {/* declassified stamp */}
              <span className="pointer-events-none absolute right-5 top-4 -rotate-12 select-none rounded border-2 border-red-500/30 px-2 py-1 font-mono text-[9px] tracking-[0.2em] text-red-500/40">
                {t("project.dossier.declassified")}
              </span>

              <p className="font-mono text-[10px] tracking-[0.35em] text-red-400/70">
                {project.codename}
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-white md:text-3xl">
                {project.title}
              </h2>
              <p className="mt-4 max-w-xl font-mono text-xs leading-relaxed text-white/55 md:text-sm">
                {tr(project.summary)}
              </p>

              <m.dl
                initial={shouldReduce ? false : "hidden"}
                animate="visible"
                transition={{ staggerChildren: 0.06, delayChildren: 0.1 }}
                className="mt-7 space-y-2.5 border-t border-white/10 pt-6 font-mono text-xs md:text-sm"
              >
                {project.dossier?.map(([k, v]) => (
                  <m.div
                    key={k}
                    variants={rowVariants}
                    className="grid grid-cols-[110px_1fr] gap-3 leading-relaxed md:grid-cols-[130px_1fr]"
                  >
                    <dt className="text-red-400/60">{k}</dt>
                    <dd className="text-white/70">{tr(v)}</dd>
                  </m.div>
                ))}
              </m.dl>

              <p className="mt-8 border-t border-white/10 pt-4 font-mono text-[10px] tracking-[0.2em] text-white/45">
                {t("project.dossier.footer")}
              </p>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
