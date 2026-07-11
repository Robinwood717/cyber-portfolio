import { useEffect, useMemo, useRef, useState } from "react";
import { m, useReducedMotion, useInView } from "framer-motion";
import SectionHeader from "./SectionHeader";
import GithubUplink from "./GithubUplink";
import { fadeUp, stagger } from "../lib/motion";
import { useI18n } from "../i18n/LanguageContext";

// Simulated uptime baseline so the counter reads like a long-lived node
// rather than starting at zero on every visit.
const UPTIME_BASE_MS = ((137 * 24 + 4) * 3600 + 12 * 60 + 7) * 1000;

function pad(n) {
  return String(n).padStart(2, "0");
}

function formatClock(date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function formatUptime(ms) {
  const total = Math.floor(ms / 1000);
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${d}D ${pad(h)}:${pad(mins)}:${pad(s)}`;
}

// `live` shows the neon status dot; `pulse` layers the animate-ping ring on
// top of it. Only one panel (Threat Feed) gets the pulse — a single moving
// light reads as "streaming"; six in sync just reads as noise.
function Panel({ label, live = true, pulse = false, className = "", children }) {
  return (
    <m.article
      variants={fadeUp}
      style={{
        WebkitBackfaceVisibility: "hidden",
        backfaceVisibility: "hidden",
      }}
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl [-webkit-backdrop-filter:blur(24px)] md:p-6 ${className}`}
    >
      <div className="flex items-center gap-2">
        {live && (
          <span className="relative flex h-2 w-2">
            {pulse && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon/60" />
            )}
            <span className="relative inline-flex h-2 w-2 rounded-full bg-neon" />
          </span>
        )}
        <p className="font-mono text-[10px] tracking-[0.3em] text-neon">{label}</p>
      </div>
      <div className="mt-5">{children}</div>
    </m.article>
  );
}

/* THREAT FEED — lines print in on a rolling cycle, newest on top. */
function ThreatFeed({ lines, frozen }) {
  const [entries, setEntries] = useState(() =>
    lines.slice(0, 5).map((text, i) => ({ text, at: new Date(Date.now() - i * 4000), key: i }))
  );
  const cursor = useRef(5);

  useEffect(() => {
    if (frozen) return undefined;
    const id = setInterval(() => {
      if (document.visibilityState === "hidden") return;
      setEntries((prev) => {
        const text = lines[cursor.current % lines.length];
        cursor.current += 1;
        return [{ text, at: new Date(), key: cursor.current }, ...prev].slice(0, 6);
      });
    }, 2600);
    return () => clearInterval(id);
  }, [lines, frozen]);

  return (
    <div role="log" aria-live="off" className="space-y-2 font-mono text-[11px] leading-relaxed md:text-xs">
      {entries.map((entry, i) => (
        <m.p
          key={entry.key}
          initial={frozen || i > 0 ? false : { opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={`flex gap-3 border-b border-white/5 pb-1.5 ${i === 0 ? "text-white/80" : "text-white/55"}`}
        >
          <span className="shrink-0 text-neon/60">{formatClock(entry.at)}</span>
          <span className="shrink-0 text-white/25">▸</span>
          <span className="truncate">{entry.text}</span>
        </m.p>
      ))}
    </div>
  );
}

/* SYSTEM POSTURE — labelled gauges that fill to their value on entry. */
function PostureGauges({ gauges, frozen }) {
  return (
    <div className="space-y-4">
      {gauges.map(([label, value]) => (
        <div key={label}>
          <div className="flex items-baseline justify-between font-mono text-[10px] tracking-[0.2em]">
            <span className="text-white/55">{label}</span>
            <span className="text-neon">{value}%</span>
          </div>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/5">
            {/* fill via scaleX (compositor-only) rather than width (layout) */}
            <m.div
              initial={frozen ? { scaleX: value / 100 } : { scaleX: 0 }}
              whileInView={{ scaleX: value / 100 }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, ease: "easeOut", delay: 0.15 }}
              className="h-full w-full origin-left rounded-full bg-gradient-to-r from-neon/40 to-neon shadow-glow-sm"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* SESSION — ticking uptime + integrity readouts. */
function SessionPanel({ t, frozen }) {
  const [now, setNow] = useState(() => Date.now());
  const mounted = useMemo(() => Date.now(), []);

  useEffect(() => {
    if (frozen) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [frozen]);

  const rows = [
    [t("soc.uptimeLabel"), formatUptime(UPTIME_BASE_MS + (now - mounted)), true],
    [t("soc.integrityLabel"), "100%", false],
    [t("soc.nodeLabel"), t("soc.node"), false],
    ["TLS", "1.3 // AES-256-GCM", false],
  ];

  return (
    <div className="space-y-3 font-mono text-[11px] md:text-xs">
      {rows.map(([key, value, hot]) => (
        <p key={key} className="flex items-baseline justify-between gap-3 border-b border-white/5 pb-2">
          <span className="tracking-[0.15em] text-white/55">{key}</span>
          <span className={hot ? "text-neon [font-variant-numeric:tabular-nums]" : "text-white/70"}>
            {value}
          </span>
        </p>
      ))}
    </div>
  );
}

/* NET TRAFFIC — rolling sparkline. */
function TrafficSparkline({ frozen }) {
  const [points, setPoints] = useState(() =>
    Array.from({ length: 24 }, (_, i) => 10 + Math.abs(Math.sin(i * 1.7)) * 16)
  );

  useEffect(() => {
    if (frozen) return undefined;
    const id = setInterval(() => {
      if (document.visibilityState === "hidden") return;
      // Drift from the previous value instead of a fresh random draw each
      // tick, so the line reads as traffic rather than a twitchy jump.
      setPoints((prev) => {
        const last = prev[prev.length - 1];
        const next = Math.min(28, Math.max(6, last + (Math.random() - 0.5) * 6));
        return [...prev.slice(1), next];
      });
    }, 1500);
    return () => clearInterval(id);
  }, [frozen]);

  const path = points
    .map((v, i) => `${(i / (points.length - 1)) * 100},${32 - v}`)
    .join(" ");

  return (
    <div>
      <svg viewBox="0 0 100 34" preserveAspectRatio="none" className="h-20 w-full" aria-hidden="true">
        <polyline
          points={path}
          fill="none"
          stroke="#10b981"
          strokeWidth="1.2"
          strokeLinejoin="round"
          opacity="0.9"
        />
        <polyline
          points={`0,34 ${path} 100,34`}
          fill="rgba(16,185,129,0.08)"
          stroke="none"
        />
      </svg>
      <p className="mt-2 flex justify-between font-mono text-[10px] tracking-[0.2em] text-white/50">
        <span>RX</span>
        <span className="text-neon/70">{Math.round(points[points.length - 1] * 42)} KB/S</span>
      </p>
    </div>
  );
}

/* PERIMETER MAP — grid, home node, ping rings. */
function PerimeterMap({ t, frozen, inView }) {
  return (
    <div className="relative">
      <svg viewBox="0 0 200 110" className="w-full" aria-hidden="true">
        {[...Array(6)].map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 22} x2="200" y2={i * 22} stroke="#1a1a1a" strokeWidth="0.6" />
        ))}
        {[...Array(10)].map((_, i) => (
          <line key={`v${i}`} x1={i * 22} y1="0" x2={i * 22} y2="110" stroke="#1a1a1a" strokeWidth="0.6" />
        ))}
        <path d="M30 78 Q75 40 128 62" fill="none" stroke="#10b981" strokeWidth="0.8" opacity="0.45" strokeDasharray="3 3" />
        <path d="M176 26 Q150 48 128 62" fill="none" stroke="#10b981" strokeWidth="0.8" opacity="0.3" strokeDasharray="3 3" />
        <circle cx="30" cy="78" r="2.5" fill="#febc2e" opacity="0.8" />
        <circle cx="176" cy="26" r="2.5" fill="#febc2e" opacity="0.6" />
        {/* Only rendered while the section is actually on screen — no point
            paying for an infinite SMIL loop nobody is looking at. */}
        {!frozen && inView && (
          <>
            <circle cx="128" cy="62" r="8" fill="none" stroke="#10b981" opacity="0.5">
              <animate attributeName="r" values="4;16" dur="2.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0" dur="2.4s" repeatCount="indefinite" />
            </circle>
          </>
        )}
        <circle cx="128" cy="62" r="4" fill="#10b981" />
      </svg>
      <p className="mt-1 font-mono text-[10px] tracking-[0.25em] text-white/55">
        {t("soc.node")} · <span className="text-neon/80">{t("soc.online")}</span>
      </p>
    </div>
  );
}

export default function CommandCenter() {
  const shouldReduce = useReducedMotion();
  const { t } = useI18n();
  const frozen = !!shouldReduce;

  // Gates the perimeter map's looping ping ring so it only runs while the
  // section is actually on screen (see PerimeterMap). SSR-safe: useInView
  // returns false until the client observes the node, no window access
  // during render.
  const sectionRef = useRef(null);
  const sectionInView = useInView(sectionRef, { once: false, margin: "-100px" });

  return (
    <section
      id="commandcenter"
      ref={sectionRef}
      className="relative border-t border-gridline scroll-mt-24"
    >
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <SectionHeader index="05" label={t("soc.label")} title={t("soc.title")} />

        <m.p
          initial={shouldReduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-6 max-w-xl font-mono text-sm leading-relaxed text-white/50"
        >
          {t("soc.intro")}
        </m.p>

        <m.div
          variants={stagger}
          initial={shouldReduce ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-14 grid grid-cols-1 items-start gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3"
        >
          <Panel label={t("soc.threatFeed")} className="md:col-span-2" pulse>
            <ThreatFeed lines={t("soc.feed")} frozen={frozen} />
          </Panel>
          <Panel label={t("soc.posture")}>
            <PostureGauges gauges={t("soc.gauges")} frozen={frozen} />
          </Panel>
          <Panel label={t("soc.session")}>
            <SessionPanel t={t} frozen={frozen} />
          </Panel>
          <Panel label={t("soc.github.label")} className="md:col-span-2">
            <GithubUplink frozen={frozen} />
          </Panel>
          <Panel label={t("soc.traffic")} className="lg:col-span-2">
            <TrafficSparkline frozen={frozen} />
          </Panel>
          <Panel label={t("soc.map")}>
            <PerimeterMap t={t} frozen={frozen} inView={sectionInView} />
          </Panel>
        </m.div>
      </div>
    </section>
  );
}
