import { useEffect, useState } from "react";
import { useI18n } from "../i18n/LanguageContext";
import { SITE } from "../data/site";
import { PROJECTS } from "../data/projects";
import useGithubActivity, {
  formatRelative,
  languageBreakdown,
} from "../hooks/useGithubActivity";

// GITHUB UPLINK panel: real repository telemetry with three states that
// share one fixed layout (4 rows + breakdown bar + footer), so swapping
// skeleton -> live -> fallback never reflows the Command Center grid.

const ROW = "flex h-10 items-center gap-3 border-b border-white/5";

// Manifest fallback: the same real repositories, from the local data files,
// shown when the API is unreachable and no cache exists.
const MANIFEST = PROJECTS.map((p) => ({
  name: p.repo.split("/").pop(),
  language: p.lang,
  pushedAt: null,
  url: p.repo,
}));

const BAR_TONES = ["bg-neon", "bg-neon/60", "bg-neon/35", "bg-white/25"];

function pad(n) {
  return String(n).padStart(2, "0");
}

function Badge({ status, gh }) {
  const styles = {
    live: "border-neon/40 text-neon",
    fallback: "border-[#febc2e]/50 text-[#febc2e]",
    loading: "border-white/20 text-white/40 animate-pulse",
  };
  const text = { live: "LIVE", fallback: "SIM", loading: "SYNC" }[status];
  return (
    <span
      className={`absolute right-5 top-5 border px-1.5 py-0.5 font-mono text-[9px] tracking-[0.25em] md:right-6 md:top-6 ${styles[status]}`}
      title={status === "fallback" ? gh.fallbackNote : undefined}
    >
      {text}
    </span>
  );
}

function SkeletonRows({ frozen }) {
  const pulse = frozen ? "" : "animate-pulse";
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className={ROW} aria-hidden="true">
          <span className={`h-3 w-28 rounded bg-white/10 ${pulse}`} />
          <span className={`h-3 w-12 rounded bg-white/[0.06] ${pulse}`} />
          <span className={`ml-auto h-3 w-16 rounded bg-white/[0.06] ${pulse}`} />
        </div>
      ))}
    </>
  );
}

function RepoRows({ repos, gh, lang, now }) {
  return (
    <>
      {repos.map((repo) => (
        <a
          key={repo.name}
          href={repo.url}
          target="_blank"
          rel="noreferrer"
          className={`${ROW} group min-w-0`}
        >
          <span className="truncate text-white/80 transition-colors duration-200 group-hover:text-neon">
            {repo.name}
          </span>
          <span className="shrink-0 border border-white/15 px-1.5 py-0.5 text-[9px] tracking-wider text-white/50">
            {repo.language}
          </span>
          <span className="ml-auto shrink-0 text-[10px] text-neon/70 [font-variant-numeric:tabular-nums]">
            {repo.pushedAt
              ? `${gh.pushedPrefix} ${formatRelative(repo.pushedAt, gh, lang, now)}`
              : gh.standby}
          </span>
        </a>
      ))}
    </>
  );
}

export default function GithubUplink({ frozen }) {
  const { t, lang } = useI18n();
  const gh = t("soc.github");
  const { status, repos, syncedAt } = useGithubActivity();

  // Re-render once a minute so relative timestamps stay honest on long
  // visits. Text-only updates: no motion, safe under reduced motion.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState !== "hidden") setNow(Date.now());
    }, 60000);
    return () => clearInterval(id);
  }, []);

  const rows = status === "fallback" ? MANIFEST : repos;
  const langs = languageBreakdown(rows);
  const total = langs.reduce((sum, [, n]) => sum + n, 0) || 1;

  return (
    <div className="font-mono text-[11px] md:text-xs">
      <Badge status={status} gh={gh} />

      {status === "loading" ? (
        <SkeletonRows frozen={frozen} />
      ) : (
        <RepoRows repos={rows} gh={gh} lang={lang} now={now} />
      )}

      <div className="mt-4">
        <div className="flex items-baseline justify-between text-[10px] tracking-[0.2em]">
          <span className="text-white/40">{gh.languages}</span>
          <span className="text-white/40">
            {status === "loading"
              ? "…"
              : langs.map(([name, n]) => `${name} ×${n}`).join(" · ")}
          </span>
        </div>
        <div className="mt-1.5 flex h-1 overflow-hidden rounded-full bg-white/5">
          {status !== "loading" &&
            langs.map(([name, n], i) => (
              <span
                key={name}
                style={{ width: `${(n / total) * 100}%` }}
                className={`h-full ${BAR_TONES[i % BAR_TONES.length]}`}
              />
            ))}
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-3 text-[10px] tracking-[0.15em] text-white/35">
        <a
          href={SITE.github}
          target="_blank"
          rel="noreferrer"
          className="truncate transition-colors duration-200 hover:text-neon"
        >
          {gh.sourceNote}
        </a>
        <span className="shrink-0 [font-variant-numeric:tabular-nums]">
          {status === "live" && syncedAt
            ? `${gh.lastSync} ${(() => {
                const d = new Date(syncedAt);
                return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
              })()}`
            : status === "fallback"
              ? gh.fallbackNote
              : `${gh.lastSync} …`}
        </span>
      </div>
    </div>
  );
}
