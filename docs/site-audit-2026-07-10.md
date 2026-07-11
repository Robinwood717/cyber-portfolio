# Site Audit — Consolidated Report (2026-07-10)

Branch: `round-2-overhaul` · Consolidated from five specialized audit passes:
security, UI/UX, performance, SEO/accessibility, and code quality.

Findings are deduplicated (source passes noted per finding) and globally prioritized:
Security blockers → user-visible broken → UI/UX critical → performance top-3 → SEO/a11y → code quality → nice-to-haves.

**Security verdict: FIX FIRST** (F2). App code itself is clean — no XSS paths, no secrets in the repo or git history, clean `npm audit` on production deps, terminal input and GitHub feed defensively built.

Status legend: `[ ]` open · `[x]` done · `[-]` skipped/deferred

---

## Band A — Ship blockers & credibility (user-visible)

### [x] F1 — Live "provisional; correct before publishing" copy + unverified experience data
*(Done: disclaimer removed from both locales, `[REVIEW]` comments stripped. Owner action still pending: verify dates/roles against the real CV.)*
**Severity:** Critical · **Source:** code-quality, ui-ux
**Files:** `src/i18n/en.js:97-98`, `src/i18n/el.js:98-99`, `src/data/experience.js` (`[REVIEW]` comments at lines 1, 10, 25, 40, 54, 68, 82), rendered by `src/components/Experience.jsx:92-100`
The Experience intro shown to every visitor (both languages) literally says timestamps/scope are provisional and should be corrected before publishing. Every entry in `experience.js` carries a `[REVIEW]` draft comment. Directly undercuts recruiter credibility.
**Fix:** Rewrite `experience.intro` in both locales as normal recruiter-facing copy; strip `[REVIEW]` comments. *Full data verification against the real CV needs owner input.*

### [x] F2 — Security headers exist only on Vercel; other documented deploy targets ship none
*(Done: `public/_headers` mirrors `vercel.json`; `interest-cohort`/`browsing-topics` added to both; README documents GH Pages as unsupported for the hardened deploy.)*
**Severity:** High (security ship blocker) · **Source:** security (verdict driver), perf (#8)
**Files:** `vercel.json:4-33` (only header source), missing `public/_headers`, `README.md:65-69`, `public/_redirects`, `package.json:9` (`postbuild` 404.html for GH Pages)
The CSP/HSTS/XFO/COOP/CORP set from the earlier hardening commit applies only on Vercel. Netlify (`_redirects` present) and GitHub Pages (postbuild step present) deploys would ship **zero** hardening — GH Pages can't serve custom headers at all. A `curl -I` against a non-Vercel deploy would contradict the site's own security branding.
**Fix:** Either add `public/_headers` mirroring `vercel.json` (Netlify parity) and document GH Pages as unsupported, **or** pin the deploy target to Vercel and remove the vestigial `_redirects` + `postbuild` step. Bonus hardening: HSTS `preload`, `browsing-topics=()`/`interest-cohort=()` in Permissions-Policy.

### [-] F3 — OG/Twitter image URLs relative (broken share previews) + canonical commented out
*(Blocked: no production domain exists anywhere in the repo — needs owner's domain choice.)*
**Severity:** Critical (SEO) · **Source:** seo-a11y
**Files:** `index.html:17-20, 29, 34, 46`
Scrapers require absolute image URLs (the file's own comment says so); `og:image`/`twitter:image` are `/og.png`. No page has a canonical URL. Sharing the deployed URL today shows a broken/missing preview card.
**Fix:** Set absolute `https://<domain>/og.png` and per-page canonical once the domain is decided. *Blocked on domain choice — stopgap: wire to current deploy URL.*

### [x] F4 — "Encrypted channel" contact copy overclaims; no PGP anything exists
*(Done: reframed as "DIRECT CHANNEL" in both locales; false "sessions logged/traced" line replaced with a truthful no-trackers statement.)*
**Severity:** High (credibility) · **Source:** ui-ux, corroborated by security ("no PGP flow exists")
**Files:** `src/i18n/en.js:172-177`, `src/components/ContactFooter.jsx`, `src/components/TerminalOutput.jsx:236-247`
"ENCRYPTED CHANNEL … Handshake complete. Channel integrity verified" fronts a plain `mailto:` + social links. A security audience will notice the cryptographic overclaim immediately.
**Fix:** Either add a real PGP key block (fingerprint + copyable public key in `public/`) to earn the framing, or rewrite the copy to something honest.

### [x] F5 — Navbar likely overflows in the ~640–820px viewport range
*(Done: desktop nav + hamburger + MobileNav all collapse at `md` now.)*
**Severity:** High · **Source:** ui-ux
**Files:** `src/components/Navbar.jsx:48-100`
Desktop nav (3 links + ⌘K + lang toggle + CONNECT) turns on at `sm:` (640px) exactly where the hamburger disappears; content width at 0.22em tracking exceeds small-viewport widths. Greek labels are no shorter.
**Fix:** Collapse at `md:` (768px) instead of `sm:`; verify at 640–820px.

### [x] F6 — CRT overlay renders above the mobile menu and darkens edges up to 40%
*(Done: overlay dropped to z-40 below header/nav; vignette softened 0.4 → 0.25.)*
**Severity:** Medium (user-visible layering bug) · **Source:** ui-ux
**Files:** `src/index.css:91-105` (`.crt-overlay`, `z-70`) vs `src/components/MobileNav.jsx:72` (`z-[60]`)
Scanlines/vignette sit on top of the full-screen mobile nav and compound the F7 contrast problem.
**Fix:** Drop overlay z-index below the nav (or raise nav above it); lighten the vignette.

---

## Band B — UI/UX & accessibility (critical/high)

### [x] F7 — Systemic sub-AA text contrast (`text-white/40` and below on `#050505`)
*(Done: site-wide sweep — informational text floor raised to `/45`–`/55`; aria-hidden decorative glyphs left as-is.)*
**Severity:** Critical (WCAG 1.4.3) · **Source:** ui-ux, seo-a11y
**Files (representative):** `TerminalHero.jsx`, `ContactFooter.jsx:52,64`, `TerminalOutput.jsx` (~9 spots), `KillChain.jsx`, `GithubUplink.jsx:122-141`, `CommandCenter.jsx:80,98`, `Methodology.jsx:42,46`, `ProjectsBento.jsx:18,36`, `Navbar.jsx:73`, `MobileNav.jsx:126`, `Experience.jsx:60`, `DossierModal.jsx:136`, `CommandPalette.jsx:184,204`
`white/40` ≈ 3.7:1, lower opacities worse — used on real informational text (labels, timestamps, hints, descriptions) at 9–13px.
**Fix:** Muted-text floor of `white/50`–`/55` for informational text (`/40`→`/55`, `/35`→`/50`, `/30`→`/50`, `/25-45`→`/45+`, verify per spot); reserve lower opacities for `aria-hidden` decoration only. Includes `ProjectsBento.jsx:18` tag chips (`/45`→`/55`).

### [x] F8 — Terminal input and Command Palette input strip their own focus indicator
*(Done: both inputs now show an on-brand visible focus treatment.)*
**Severity:** High (WCAG 2.4.7) · **Source:** seo-a11y, ui-ux
**Files:** `src/components/TerminalHero.jsx:284`, `src/components/CommandPalette.jsx:169`
Both override the (good) global focus style with `outline-none` and no replacement.
**Fix:** On-brand visible focus treatment (e.g. `focus-visible:ring-2 ring-neon/60` or bottom-border glow).

### [x] F9 — Command Palette has no focus trap or scroll lock despite `aria-modal="true"`
*(Done: shared `src/hooks/useFocusTrap.js` extracted; all three modal surfaces use it.)*
**Severity:** High (WCAG 2.4.3) · **Source:** code-quality, seo-a11y
**Files:** `src/components/CommandPalette.jsx:115-159`; correct implementations duplicated in `DossierModal.jsx:5-46` and `MobileNav.jsx:20-51`
Tab escapes the open dialog into obscured page content.
**Fix:** Extract shared `useFocusTrap` hook (in `src/hooks/`) from the two existing implementations; apply to all three surfaces (kills the ~30-line duplication too).

### [x] F10 — Typewriter boot sequence animates inside `aria-live="polite"`
*(Done: in-progress line renders `aria-hidden`; only completed lines enter the live log.)*
**Severity:** High (screen-reader UX) · **Source:** ui-ux (critical), seo-a11y
**Files:** `src/components/TerminalHero.jsx:244-256`, animation driver at `:32-63`
Character-by-character mutations inside a live region → stream of partial-word announcements on the site's flagship feature.
**Fix:** Keep in-progress lines `aria-hidden`; push each line into the live region only when complete (or announce the finished boot text once).

### [x] F11 — No `<noscript>` fallback: JS failure = blank black page
*(Done: noscript block with name, role, and contact links. Prerendering (F14) additionally means full page content exists without JS.)*
**Severity:** High · **Source:** ui-ux
**Files:** `index.html:88-90`
**Fix:** Minimal `<noscript>` block with name, role, email link.

### [x] F12 — Grid stretch turns short cards into tall empty boxes
*(Done: `items-start` on both grids; telemetry card pinned to row 1, col 3 on `lg`.)*
**Severity:** High (visual polish) · **Source:** ui-ux
**Files:** `src/components/ProjectsBento.jsx:132-181`, `src/components/CommandCenter.jsx:250-270`
Default `align-items: stretch` makes short panels match the tallest in row → dead space reads unfinished.
**Fix:** `self-start` on short cards or `items-start` on grid containers.

### [x] F13 — Real project proof buried late; TelemetryCard interrupts the flagship pair on mobile
*(Done: Operations now follows Experience; section indexes renumbered; flagship cards adjacent in DOM order.)*
**Severity:** High (content order) · **Source:** ui-ux
**Files:** `src/pages/Home.jsx:10-22`, `src/components/ProjectsBento.jsx:179-184`
Operations (actual case studies) comes 7th of 8 sections; on mobile the decorative TelemetryCard sits between the two flagship case studies.
**Fix:** Move Operations directly after Experience; reorder bento items so flagships are adjacent.

---

## Band C — Performance top-3

### [x] F14 — No prerendering: LCP text and per-route meta are 100% client-rendered
*(Done: `src/entry-server.jsx` + `scripts/prerender.mjs` render `/` and both `/ops/*` routes to static HTML at build time with route-specific title/description/og; `main.jsx` hydrates. Canonical URLs still blocked on domain (F3).)*
**Severity:** Critical (perf + SEO) · **Source:** perf (#1), seo-a11y (#1)
**Files:** `index.html:89`, `src/main.jsx`, `vite.config.js`, `package.json` build script, `src/hooks/useDocumentMeta.js`, `src/App.jsx:66-70`
Hero `<h1>` (likely LCP) paints only after the full 400 kB bundle executes (~1–2s extra mobile LCP). Same root cause breaks per-route social previews/search snippets: `/ops/*` pages present identical title/description/image to non-JS crawlers (LinkedIn, Discord, Slack).
**Fix:** Build-time prerender of `/` and `/ops/:slug` (react-dom/server script rendering each route into `dist/*.html` with route-specific title/description/og/canonical) + `hydrateRoot`. Stopgap: extend `useDocumentMeta` to update og/twitter tags client-side.

### [x] F15 — Framer Motion is ~31% of gzipped JS (~41 kB) loaded eagerly
*(Done: `LazyMotion strict` + `m` components everywhere; `domAnimation` loads as a 10.8 kB gzip async chunk.)*
**Severity:** High · **Source:** perf (#2, measured)
**Files:** `src/main.jsx:4,15`, `src/lib/motion.js`, ~12 components using full `motion`
**Fix:** `LazyMotion` + `m` with `domAnimation` loaded lazily (~6 kB sync cost); replace marquee (`SkillsMarquee.jsx:31-38`) and simple scroll-reveals with CSS. Est. 20–35 kB gzip off the critical path.

### [x] F16 — No code-splitting: one 400 kB / 131 kB-gzip chunk for everything
*(Done: vendor chunk (53.0 kB gz) split from app (55.4 kB gz); CommandPalette, DossierModal, and motion features load lazily. Critical path: 131 kB → ~110 kB gz, plus prerendered HTML paints before any JS.)*
**Severity:** High · **Source:** perf (#3), code-quality (#9)
**Files:** `src/App.jsx:8-11,66-73`, `src/pages/ProjectPage.jsx:8`, `vite.config.js`
ProjectPage, DossierModal, CommandPalette all gate homepage first paint; no vendor chunk separation → every deploy invalidates all caching.
**Fix:** `React.lazy` + `Suspense` for `/ops/:slug`; lazy-load CommandPalette/DossierModal behind triggers; `manualChunks` for vendor/motion/app.

---

## Band D — SEO & accessibility (remaining)

### [-] F17 — No sitemap.xml; robots.txt Sitemap directive commented out
*(Blocked: sitemap URLs must be absolute — needs owner's domain choice, same as F3.)*
**Severity:** High · **Source:** seo-a11y
**Files:** `public/robots.txt:4-5`, missing `public/sitemap.xml`
**Fix:** Static sitemap listing `/`, `/ops/dlp-scanner`, `/ops/mitm-lab`; uncomment Sitemap line. *Partially blocked on domain.*

### [ ] F18 — Open modals don't hide background content from assistive tech
**Severity:** Medium · **Source:** seo-a11y
**Files:** `src/App.jsx`, `CommandPalette.jsx`, `DossierModal.jsx` (contrast: `MobileNav.jsx:71` does it right)
**Fix:** Toggle `inert`/`aria-hidden` on the app tree while a dialog is open.

### [ ] F19 — GitHub Uplink status changes are silent for screen readers; "SIM" badge explained only via `title`
**Severity:** Medium · **Source:** seo-a11y (#8), ui-ux (#13)
**Files:** `src/components/GithubUplink.jsx:31-46,91-118`, `src/components/CommandCenter.jsx:261`
**Fix:** `role="status" aria-live="polite"` announcement when state settles; visible caption or `aria-describedby` for SIM instead of `title`-only.

### [ ] F20 — Panel/Block section labels are `<p>`, not headings
**Severity:** Medium (WCAG 1.3.1) · **Source:** seo-a11y
**Files:** `src/components/CommandCenter.jsx:29-51` (→`<h3>`), `src/pages/ProjectPage.jsx:18-24` (→`<h2>`)

### [ ] F21 — Person JSON-LD misaligned with ranking goal
**Severity:** Medium · **Source:** seo-a11y
**Files:** `index.html:48-68`
`url` points to GitHub, no `image`, no literal "Cybersecurity" keyword.
**Fix:** `url` → site root, add `image`, add "Cybersecurity" to `knowsAbout`/`jobTitle`. *Partially blocked on domain.*

### [ ] F22 — Document title/description never localize
**Severity:** Low · **Source:** seo-a11y
**Files:** `src/hooks/useDocumentMeta.js:3-5` — derive from i18n instead of hardcoded English.

### [ ] F23 — Command Palette lacks combobox/listbox ARIA relationship
**Severity:** Low · **Source:** seo-a11y
**Files:** `src/components/CommandPalette.jsx:161-202` — add `role="combobox"`/`aria-activedescendant`/`role="option"`/`aria-selected`.

### [ ] F24 — Stray decorative glyph not `aria-hidden`
**Severity:** Low · **Source:** seo-a11y
**Files:** `src/components/TerminalOutput.jsx:327`

---

## Band E — Performance (remaining)

### [ ] F25 — Hashed `/assets/*` have no explicit immutable Cache-Control
**Severity:** Medium · **Source:** perf
**Files:** `vercel.json:27-32` (only `/fonts/` covered) — add `/assets/(.*)` block with 1-year immutable.

### [ ] F26 — CommandCenter starts 3 timers + GitHub fetch on mount regardless of scroll position
**Severity:** Medium · **Source:** perf
**Files:** `src/components/CommandCenter.jsx:61-70,123-126,156-162`, `src/hooks/useGithubActivity.js:95`
**Fix:** Arm intervals/fetch via IntersectionObserver or the existing `whileInView` signal.

### [ ] F27 — Both i18n dictionaries bundled eagerly
**Severity:** Medium · **Source:** perf
**Files:** `src/i18n/LanguageContext.jsx:9-10` — dynamic `import()` of the inactive dictionary on toggle.

### [ ] F28 — Missing preconnect for api.github.com
**Severity:** Low · **Source:** perf
**Files:** `index.html` — `<link rel="preconnect" href="https://api.github.com" crossorigin>`.

---

## Band F — Code quality & hygiene

### [ ] F29 — No error boundary anywhere in the tree
**Severity:** Medium · **Source:** code-quality
**Files:** `src/main.jsx`, `src/App.jsx` — top-level boundary with terminal-aesthetic fallback UI.

### [ ] F30 — Duplicated `STATUS_TONE` map
**Severity:** Medium · **Source:** code-quality
**Files:** `src/components/ProjectsBento.jsx:8-14`, `src/pages/ProjectPage.jsx:10-16` — extract to one module.

### [ ] F31 — No lint/typecheck tooling
**Severity:** Medium · **Source:** code-quality
**Files:** `package.json` — add ESLint (+react, react-hooks plugins), `lint` script.

### [ ] F32 — README describes an earlier, unfinished state
**Severity:** Medium · **Source:** code-quality
**Files:** `README.md:35,70-72` — Greek i18n is actually complete (0 key drift); `og.png` already exists and is wired.

### [ ] F33 — Dev-dependency vulnerabilities (esbuild/vite/vitest advisories)
**Severity:** Medium (dev-only exposure) · **Source:** security
**Fix:** Bump vite/vitest majors at a convenient moment; verified not reachable in production bundle.

### [ ] F34 — Clipboard UX inconsistent: palette flash never expires, no fallback selection
**Severity:** Medium · **Source:** ui-ux (#9), code-quality (#7)
**Files:** `src/components/CommandPalette.jsx:57-69,102-111` vs correct pattern in `src/components/CopyButton.jsx:16-40`
**Fix:** Shared copy helper/hook: 2s timeout reset + select-text fallback in both surfaces.

### [ ] F35 — `window.open` without explicit `noopener`
**Severity:** Low (defense-in-depth) · **Source:** security
**Files:** `src/components/CommandPalette.jsx:75,84` — use `"noopener,noreferrer"`.

---

## Band G — Nice-to-haves & judgment calls

### [ ] F36 — "LIVE TELEMETRY" card: pulsing live-dot on fully static hardcoded data
**Severity:** Medium (honesty of framing) · **Source:** ui-ux
**Files:** `src/components/ProjectsBento.jsx:132-158`, `src/i18n/en.js:163-169` — drop the pulse or add "simulated" framing.

### [ ] F37 — Cumulative ambient-motion load risks "effects showcase" impression
**Severity:** Medium (design judgment) · **Source:** ui-ux
Nine simultaneous ambient systems; recommendation is keep 2–3 signature moments (terminal, kill chain), mute the rest. *Owner taste call.*

### [ ] F38 — Compact `[ COPY ]` chip text is 9px
**Severity:** Low · **Source:** ui-ux — `src/components/CopyButton.jsx:57`, bump to 10–11px.

### [ ] F39 — Section numbering starts at [02]; [01] never appears
**Severity:** Low · **Source:** ui-ux — `Methodology.jsx:14` … `ContactFooter.jsx:99`.

### [ ] F40 — Language detection via string comparison
**Severity:** Low · **Source:** ui-ux — `src/App.jsx:57` compares a translated string instead of reading `lang`.

### [ ] F41 — `TerminalOutput.jsx` is 485 lines / ~15 sub-components
**Severity:** Low (defer) · **Source:** code-quality — split into `terminal/renderers/*` when it grows further.

### [ ] F42 — Email address ships in plaintext in the bundle
**Severity:** Low (optional) · **Source:** code-quality — obfuscate only if spam becomes a problem.

### [ ] F43 — Greek content has no indexable URL
**Severity:** Low (decision) · **Source:** seo-a11y — `/el` route + hreflang, or accept English-only indexing.

---

## Non-findings (verified healthy)

- No XSS sinks, no secrets in repo or full git history, production `npm audit` clean (security)
- Terminal input pipeline and GitHub feed hook are defensively well-built, with tests (security, code-quality)
- Font self-hosting/subsetting/preload strategy is correct and efficient (perf)
- i18n dictionaries have zero key drift between en/el (code-quality)
- Skip link, global focus style, reduced-motion guards, MobileNav/DossierModal focus traps all correct (seo-a11y)
- 37/37 tests pass; clean build (code-quality)
