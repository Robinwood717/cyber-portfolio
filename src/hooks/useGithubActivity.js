import { useEffect, useState } from "react";
import { SITE } from "../data/site";

// Live GitHub telemetry for the Command Center's GITHUB UPLINK panel.
//
// Rate-limit strategy (unauthenticated is 60 req/hr per visitor IP):
// - localStorage cache with a TTL: a fresh cache serves without any request.
// - Conditional requests: we store the ETag and send If-None-Match; a 304
//   does not count against the rate limit and just re-validates the cache.
// - Any failure falls back to stale cached data first, and only then to the
//   "fallback" state (the panel renders manifest data in the same layout).

const API_URL = `https://api.github.com/users/Robinwood717/repos?per_page=100&sort=pushed`;
const CACHE_KEY = "sec-portfolio-gh-cache-v1";
const TTL_MS = 10 * 60 * 1000;
const MAX_REPOS = 4;

// Pure: raw API payload -> the few fields the panel renders. Forks are
// dropped; newest push first.
export function parseRepos(payload) {
  if (!Array.isArray(payload)) return [];
  return payload
    .filter((r) => r && !r.fork && r.name && r.pushed_at)
    .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
    .slice(0, MAX_REPOS)
    .map((r) => ({
      name: r.name,
      language: r.language ?? "N/A",
      pushedAt: r.pushed_at,
      // API data lands in an href: only accept github.com URLs.
      url:
        typeof r.html_url === "string" && r.html_url.startsWith("https://github.com/")
          ? r.html_url
          : `${SITE.github}/${encodeURIComponent(r.name)}`,
    }));
}

// Pure: repo list -> ordered [language, count] pairs for the breakdown bar.
export function languageBreakdown(repos) {
  const counts = new Map();
  for (const r of repos) counts.set(r.language, (counts.get(r.language) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

// Pure: ISO timestamp -> short relative label ("3h ago" / "πριν 3ω").
// `dict` is the soc.github i18n subtree so the formatter stays testable.
export function formatRelative(iso, dict, lang = "en", now = Date.now()) {
  if (!iso) return dict.standby; // new Date(null) is the 1970 epoch, not NaN
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return dict.standby;
  const s = Math.max(0, Math.floor((now - then) / 1000));
  if (s < 60) return dict.justNow;
  const steps = [
    [60 * 60 * 24 * 365, dict.units.year],
    [60 * 60 * 24 * 30, dict.units.month],
    [60 * 60 * 24, dict.units.day],
    [60 * 60, dict.units.hour],
    [60, dict.units.minute],
  ];
  for (const [size, unit] of steps) {
    if (s >= size) {
      const n = Math.floor(s / size);
      return lang === "el"
        ? `${dict.agoSuffix} ${n}${unit}`
        : `${n}${unit} ${dict.agoSuffix}`;
    }
  }
  return dict.justNow;
}

function readCache() {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.repos)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(cache) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* storage full or blocked: caching is best-effort */
  }
}

// status: "loading" -> skeleton · "live" -> real rows · "fallback" -> manifest
export default function useGithubActivity() {
  const [state, setState] = useState({ status: "loading", repos: [], syncedAt: null });

  useEffect(() => {
    const cached = readCache();
    if (cached && Date.now() - cached.fetchedAt < TTL_MS) {
      setState({ status: "live", repos: cached.repos, syncedAt: cached.fetchedAt });
      return undefined;
    }

    const controller = new AbortController();
    (async () => {
      try {
        const headers = { Accept: "application/vnd.github+json" };
        if (cached?.etag) headers["If-None-Match"] = cached.etag;
        const res = await fetch(API_URL, { headers, signal: controller.signal });

        if (res.status === 304 && cached) {
          const fetchedAt = Date.now();
          writeCache({ ...cached, fetchedAt });
          setState({ status: "live", repos: cached.repos, syncedAt: fetchedAt });
          return;
        }
        if (!res.ok) throw new Error(`github ${res.status}`);

        const repos = parseRepos(await res.json());
        if (repos.length === 0) throw new Error("github empty");
        const fetchedAt = Date.now();
        writeCache({ etag: res.headers.get("ETag") ?? null, repos, fetchedAt });
        setState({ status: "live", repos, syncedAt: fetchedAt });
      } catch (err) {
        if (err?.name === "AbortError") return;
        // Stale cache beats simulated fallback: it is still real data.
        if (cached) {
          setState({ status: "live", repos: cached.repos, syncedAt: cached.fetchedAt });
        } else {
          setState({ status: "fallback", repos: [], syncedAt: null });
        }
      }
    })();

    return () => controller.abort();
  }, []);

  return state;
}
