# SOUMPAKIS // SEC-PORTFOLIO

Cyber threat intelligence–themed portfolio for Anastasios Soumpakis —
Security & Information Systems Engineer. React + Vite + Tailwind CSS +
Framer Motion + React Router.

## Run

Requires Node.js ≥ 18 (https://nodejs.org).

```bash
npm install
npm run dev      # dev server at http://localhost:5173
npm run build    # production build → dist/ (also writes dist/404.html)
npm run preview  # preview the production build
```

## Structure

```
index.html                     # SEO, Open Graph, Twitter, JSON-LD Person schema
public/
├── favicon.svg                # terminal-prompt glyph
├── og.svg                     # social share card (see deploy notes)
├── robots.txt                 # add Sitemap line once a domain exists
└── _redirects                 # Netlify SPA fallback
vercel.json                    # Vercel SPA rewrite
src/
├── main.jsx                   # BrowserRouter + LanguageProvider + MotionConfig
├── App.jsx                    # route shell: overlay, scroll-progress, nav, palette, footer, <Routes>
├── index.css                  # Tailwind layers, CRT + dossier scanlines, reduced-motion
├── lib/motion.js              # spring-physics Framer Motion variants (single source of truth)
├── i18n/                      # EN/ΕΛ dictionaries + LanguageContext (per-key EN fallback)
│   ├── en.js                  # source language
│   ├── el.js                  # Greek — search "TODO_EL" for strings still to translate
│   └── LanguageContext.jsx
├── data/                      # content as data (site, projects, experience, killchain)
├── hooks/useDocumentMeta.js   # per-route <title> + meta description
├── pages/
│   ├── Home.jsx               # hero → marquee → doctrine → experience → kill-chain → operations
│   └── ProjectPage.jsx        # /ops/:slug flagship writeup + dossier modal
└── components/
    ├── ScanlineOverlay.jsx    # fixed CRT scanline + vignette overlay
    ├── ScrollProgress.jsx     # neon read-progress bar
    ├── Navbar.jsx             # glass nav, route-aware links, ⌘K, EN/ΕΛ toggle
    ├── TerminalHero.jsx       # static name/title + typed boot sequence
    ├── SkillsMarquee.jsx      # seamless infinite marquee of focus areas
    ├── Methodology.jsx        # Aegean MEng + neon doctrine block
    ├── Experience.jsx         # engagement/build timeline (entries flagged [REVIEW])
    ├── KillChain.jsx          # interactive IR-2506-RUNNER kill-chain (SVG + motion)
    ├── ProjectsBento.jsx      # data-driven grid: 4 GitHub repos + live telemetry
    ├── DossierModal.jsx       # darker "declassified case file" overlay
    ├── CommandPalette.jsx     # ⌘K / Ctrl+K quick-nav
    └── SectionHeader.jsx      # shared [NN] // LABEL + display heading
```

## Content ownership

- **Experience** (`src/data/experience.js`) is drafted from repos/workspace;
  dates and framing still need confirmation against the CV (tracked as F1 in
  `docs/site-audit-2026-07-10.md`).
- **Greek** (`src/i18n/el.js`): nav/chrome are translated; prose is `TODO_EL`
  and falls back to English until you replace it.
- **Projects** are the four public repos at github.com/Robinwood717.

## Deploy notes

- SPA deep links: `_redirects` (Netlify), `vercel.json` (Vercel), `dist/404.html`
  (GitHub Pages, written by `postbuild`). For GitHub Pages under a repo subpath,
  also set Vite `base`.
- Security headers: `vercel.json` (Vercel) and `public/_headers` (Netlify) carry
  the same CSP/hardening set — keep them in sync. GitHub Pages cannot serve
  custom response headers, so it is not a supported target for the hardened
  deployment; use Vercel or Netlify for production.
- Social preview: `og.svg` works in-app; most scrapers want an absolute PNG —
  export an `og.png` and point `og:image` / `twitter:image` at its absolute URL
  once a domain is chosen. Uncomment the canonical link in `index.html` too.

## Design tokens

- Background `#050505` · structure `#1a1a1a` · text `#ffffff` · accent `#10b981`
- Space Grotesk (display) · JetBrains Mono (everything technical)
- All entrance/hover motion: `spring { stiffness: 170–260, damping: 20–26 }`
- Reduced motion respected via `MotionConfig reducedMotion="user"`, CSS media
  query, and `matchMedia` guards on typewriter/scramble/kill-chain effects.
