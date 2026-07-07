import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { SPRING, fadeUp, stagger } from "../lib/motion";
import { useI18n } from "../i18n/LanguageContext";
import MagneticButton from "./MagneticButton";

// Tones are positional and pair with the boot strings in the dictionary
// (hero.boot). Keeping them out of i18n means translators only touch copy.
const TONES = [
  "text-white/70",
  "text-white/70",
  "font-medium text-neon [text-shadow:0_0_14px_rgba(16,185,129,0.5)]",
  "text-white",
];

function Cursor() {
  return (
    <span
      aria-hidden="true"
      className="ml-1 inline-block h-[1.05em] w-[0.55em] translate-y-[0.15em] animate-blink bg-neon [box-shadow:0_0_10px_rgba(16,185,129,0.8)]"
    />
  );
}

function useBootSequence(lines) {
  const [pos, setPos] = useState(() => {
    const skip =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return skip ? { line: lines.length, char: 0 } : { line: 0, char: 0 };
  });
  const done = pos.line >= lines.length;

  useEffect(() => {
    if (done) return undefined;
    const current = lines[pos.line];
    const delay =
      pos.char === 0
        ? pos.line === 0
          ? 450
          : 320
        : current[pos.char - 1] === "."
          ? 45
          : 18;
    const t = setTimeout(() => {
      setPos((p) =>
        p.char < current.length
          ? { ...p, char: p.char + 1 }
          : { line: p.line + 1, char: 0 }
      );
    }, delay);
    return () => clearTimeout(t);
  }, [pos, done, lines]);

  return { pos, done };
}

export default function TerminalHero() {
  const { t } = useI18n();
  const bootLines = t("hero.boot");
  const { pos, done } = useBootSequence(bootLines);
  const shouldReduce = useReducedMotion();

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-20 pt-28">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-grid-lines bg-[length:56px_56px] [-webkit-mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_72%)] [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_72%)]"
      />
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-72 w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon/10 blur-[140px]"
      />

      {/* Static identity block — recruiter reads name + title immediately,
          independent of the boot animation. */}
      <motion.div
        variants={stagger}
        initial={shouldReduce ? false : "hidden"}
        animate="visible"
        className="relative mb-9 flex flex-col items-center text-center"
      >
        <motion.p
          variants={fadeUp}
          className="font-mono text-[11px] tracking-[0.4em] text-neon/80"
        >
          {t("hero.role")}
        </motion.p>
        <motion.h1
          variants={fadeUp}
          className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl"
        >
          {t("hero.name")}
        </motion.h1>
      </motion.div>

      <motion.div
        initial={shouldReduce ? false : { opacity: 0, y: 36, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ ...SPRING, delay: 0.1 }}
        style={{
          WebkitBackfaceVisibility: "hidden",
          backfaceVisibility: "hidden",
          willChange: "transform",
        }}
        className="relative w-full max-w-2xl rounded-xl border border-white/10 bg-white/[0.03] shadow-terminal backdrop-blur-2xl [-webkit-backdrop-filter:blur(40px)]"
      >
        <div className="relative flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <p className="pointer-events-none absolute inset-x-0 truncate px-20 text-center font-mono text-[11px] text-white/35">
            anastasios@aegean: ~/secure-session - ssh - 80×24
          </p>
        </div>

        <div
          role="log"
          aria-live="polite"
          className="min-h-[220px] space-y-2.5 px-5 py-6 font-mono text-[13px] leading-relaxed md:min-h-[240px] md:px-7 md:text-[15px]"
        >
          {bootLines.slice(0, Math.min(pos.line + 1, bootLines.length)).map((line, i) => {
            const complete = i < pos.line;
            return (
              <p key={line} className={TONES[i] ?? "text-white/70"}>
                {complete ? line : line.slice(0, pos.char)}
                {!complete && <Cursor />}
              </p>
            );
          })}
          {done && (
            <p className="text-white/45">
              <span className="text-neon">{">"}</span> {t("hero.awaiting")}
              <Cursor />
            </p>
          )}
        </div>
      </motion.div>

      <motion.div
        variants={stagger}
        initial={shouldReduce ? false : "hidden"}
        animate={done || shouldReduce ? "visible" : "hidden"}
        className="relative mt-10 flex flex-col items-center gap-8"
      >
        <motion.div
          variants={fadeUp}
          className="flex flex-wrap items-center justify-center gap-4 font-mono text-xs tracking-[0.2em]"
        >
          <MagneticButton>
            <Link
              to="/#operations"
              className="block border border-neon/40 bg-neon/[0.06] px-6 py-3.5 text-neon transition-all duration-200 hover:bg-neon/15 hover:shadow-glow-sm active:scale-[0.97]"
            >
              {t("hero.viewOps")}
            </Link>
          </MagneticButton>
          <MagneticButton>
            <Link
              to="/#contact"
              className="block border border-white/15 px-6 py-3.5 text-white/60 transition-[color,border-color,transform] duration-300 hover:border-white/40 hover:text-white active:scale-[0.97] active:duration-100"
            >
              {t("hero.establishContact")}
            </Link>
          </MagneticButton>
        </motion.div>
        <motion.p
          variants={fadeUp}
          className="font-mono text-[10px] tracking-[0.4em] text-white/25"
        >
          {t("hero.scrollHint")}
        </motion.p>
      </motion.div>

      <p
        aria-hidden="true"
        className="absolute bottom-6 left-6 hidden font-mono text-[10px] tracking-[0.25em] text-white/15 md:block"
      >
        NODE: SAMOS.GR {"//"} 37.7924N 26.7066E
      </p>
      <p
        aria-hidden="true"
        className="absolute bottom-6 right-6 hidden font-mono text-[10px] tracking-[0.25em] text-white/15 md:block"
      >
        SESSION: TLS_1.3 {"//"} AES-256-GCM
      </p>
    </section>
  );
}
