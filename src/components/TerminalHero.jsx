import { useEffect, useRef, useState } from "react";
import { m, useReducedMotion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { SPRING, fadeUp, stagger } from "../lib/motion";
import { useI18n } from "../i18n/LanguageContext";
import { parse, runCommand, completeInput } from "../lib/terminalCommands";
import TerminalEntry from "./TerminalOutput";
import MagneticButton from "./MagneticButton";

// Scrollback + input history caps keep a long-lived session bounded.
const MAX_ENTRIES = 40;
const MAX_HISTORY = 50;

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
  const { t, toggle } = useI18n();
  const bootLines = t("hero.boot");
  const { pos, done } = useBootSequence(bootLines);
  const shouldReduce = useReducedMotion();
  const navigate = useNavigate();

  const [entries, setEntries] = useState([]);
  const [cleared, setCleared] = useState(false);
  const [value, setValue] = useState("");
  const [histIdx, setHistIdx] = useState(-1); // -1 = live (not browsing)

  const historyRef = useRef([]);
  const draftRef = useRef(""); // live input stashed while browsing history
  const ranRef = useRef(new Set()); // commands already run once this session
  const idRef = useRef(0);
  const navTimerRef = useRef(null);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => () => clearTimeout(navTimerRef.current), []);

  // New output pins the scrollback to the bottom. Reveals animate
  // opacity/transform only, so scrollHeight is already final here.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries]);

  const handleRun = (raw) => {
    const input = raw.trim();
    const parsed = parse(input);
    if (!parsed) return;
    const result = runCommand(input);

    // Latency as texture: first invocation of a command staggers in,
    // repeats are instant. Reduced motion is always instant.
    const instant = Boolean(shouldReduce) || ranRef.current.has(parsed.name);
    ranRef.current.add(parsed.name);
    historyRef.current = [...historyRef.current, input].slice(-MAX_HISTORY);
    setHistIdx(-1);
    setValue("");

    if (result.action?.type === "clear") {
      setEntries([]);
      setCleared(true);
      return;
    }
    setEntries((prev) =>
      [
        ...prev,
        { id: (idRef.current += 1), input, descriptors: result.entries, instant },
      ].slice(-MAX_ENTRIES)
    );
    if (result.action?.type === "toggleLang") toggle();
    if (result.action?.type === "navigate") {
      // Let the "opening dossier" line land before the route change.
      navTimerRef.current = setTimeout(
        () => navigate(result.action.to),
        shouldReduce ? 150 : 650
      );
    }
    inputRef.current?.focus();
  };

  const handleInsert = (text) => {
    setValue(text);
    inputRef.current?.focus();
  };

  const recallHistory = (dir) => {
    const hist = historyRef.current;
    if (hist.length === 0) return false;
    if (dir < 0) {
      if (histIdx === -1) {
        draftRef.current = value;
        setHistIdx(hist.length - 1);
        setValue(hist[hist.length - 1]);
      } else if (histIdx > 0) {
        setHistIdx(histIdx - 1);
        setValue(hist[histIdx - 1]);
      }
      return true;
    }
    if (histIdx === -1) return false;
    if (histIdx >= hist.length - 1) {
      setHistIdx(-1);
      setValue(draftRef.current);
    } else {
      setHistIdx(histIdx + 1);
      setValue(hist[histIdx + 1]);
    }
    return true;
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      if (value.trim()) handleRun(value);
    } else if (e.key === "ArrowUp") {
      if (recallHistory(-1)) e.preventDefault();
    } else if (e.key === "ArrowDown") {
      if (recallHistory(1)) e.preventDefault();
    } else if (e.key === "Tab" && !e.shiftKey && value.trim()) {
      // Only hijack Tab mid-command; an empty prompt keeps normal
      // keyboard navigation so the terminal never traps focus.
      e.preventDefault();
      const completed = completeInput(value);
      if (completed) setValue(completed);
    }
  };

  // Tapping anywhere in the terminal body focuses the prompt (mobile
  // affordance), unless the visitor is selecting text to copy.
  const focusPrompt = () => {
    const sel = typeof window !== "undefined" ? window.getSelection() : null;
    if (sel && !sel.isCollapsed) return;
    inputRef.current?.focus();
  };

  return (
    <section className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-6 pb-20 pt-28">
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
      <m.div
        variants={stagger}
        initial={shouldReduce ? false : "hidden"}
        animate="visible"
        className="relative mb-9 flex flex-col items-center text-center"
      >
        <m.p
          variants={fadeUp}
          className="font-mono text-[11px] tracking-[0.4em] text-neon/80"
        >
          {t("hero.role")}
        </m.p>
        <m.h1
          variants={fadeUp}
          className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl"
        >
          {t("hero.name")}
        </m.h1>
      </m.div>

      <m.div
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
          <p className="pointer-events-none absolute inset-x-0 truncate px-20 text-center font-mono text-[11px] text-white/50">
            anastasios@aegean: ~/secure-session - ssh - 80×24
          </p>
        </div>

        {/* Fixed-height scrollback: output scrolls inside the window, so the
            CTAs below never shift as the session grows. */}
        <div
          ref={scrollRef}
          onClick={focusPrompt}
          className="h-[300px] cursor-text overflow-y-auto px-5 py-5 font-mono text-[13px] leading-relaxed md:h-[340px] md:px-7 md:text-[14px] [scrollbar-color:rgba(16,185,129,0.35)_transparent] [scrollbar-width:thin]"
        >
          <div className="space-y-2.5">
            {/* Only fully-typed lines live in the aria-live log; the line
                still animating renders aria-hidden below so screen readers
                hear one clean announcement per line, not per keystroke. */}
            <div role="log" aria-live="polite" className="space-y-2.5">
              {!cleared &&
                bootLines.slice(0, pos.line).map((line, i) => (
                  <p key={line} className={TONES[i] ?? "text-white/70"}>
                    {line}
                  </p>
                ))}
              {entries.map((entry) => (
                <TerminalEntry
                  key={entry.id}
                  entry={entry}
                  onRun={handleRun}
                  onInsert={handleInsert}
                />
              ))}
            </div>
            {!cleared && !done && pos.line < bootLines.length && (
              <p aria-hidden="true" className={TONES[pos.line] ?? "text-white/70"}>
                {bootLines[pos.line].slice(0, pos.char)}
                <Cursor />
              </p>
            )}
          </div>

          {done && (
            <div className="mt-2.5 flex items-center gap-2">
              <span className="text-neon">{">"}</span>
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={onKeyDown}
                aria-label={t("terminal.inputLabel")}
                placeholder={t("terminal.hint")}
                maxLength={80}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="go"
                className="min-h-11 min-w-0 flex-1 border-b border-transparent bg-transparent text-[16px] text-white/85 caret-neon outline-none [text-shadow:none] placeholder:text-white/45 focus-visible:border-neon/60 md:min-h-0 md:text-[14px]"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-white/10 px-5 py-2 font-mono text-[10px] tracking-wider text-white/50">
          <span>{t("terminal.hint")}</span>
          <span className="hidden sm:block">{t("terminal.historyHint")}</span>
        </div>
      </m.div>

      <m.div
        variants={stagger}
        initial={shouldReduce ? false : "hidden"}
        animate={done || shouldReduce ? "visible" : "hidden"}
        className="relative mt-10 flex flex-col items-center gap-8"
      >
        <m.div
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
        </m.div>
        <m.p
          variants={fadeUp}
          className="font-mono text-[10px] tracking-[0.4em] text-white/50"
        >
          {t("hero.scrollHint")}
        </m.p>
      </m.div>

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
