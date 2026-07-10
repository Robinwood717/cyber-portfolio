// Pure command registry for the interactive hero terminal.
//
// No React in this file: every command resolves to plain descriptor objects
// that TerminalOutput.jsx maps to React nodes. Typed input is always treated
// as data (parsed to a known command or an "error" descriptor), never as
// markup — the renderer must NEVER pass any of these values through
// dangerouslySetInnerHTML.
//
// Descriptors carry i18n either as `{ key }` refs (resolved via t() at
// render time) or `{ en, el }` pairs from the data files (resolved via tr()).
// Render-time resolution means the whole scrollback re-translates when the
// visitor toggles the language, instead of freezing mixed-language history.

import { PROJECTS, getProject } from "../data/projects";
import { EXPERIENCE } from "../data/experience";
import { SITE } from "../data/site";

export const REGISTRY = [
  { name: "help" },
  { name: "whoami" },
  { name: "projects" },
  { name: "skills" },
  { name: "experience" },
  { name: "contact" },
  { name: "ls" },
  { name: "cat", arg: "<slug>" },
  { name: "man", arg: "<slug>" },
  { name: "open", arg: "<slug>" },
  { name: "lang" },
  { name: "banner" },
  { name: "clear" },
  { name: "sudo" },
  { name: "theme" },
];

export const COMMAND_NAMES = REGISTRY.map((c) => c.name);
const SLUGS = PROJECTS.map((p) => p.slug);
const SLUG_COMMANDS = new Set(["cat", "man", "open"]);

// --- parsing -----------------------------------------------------------

export function parse(input) {
  const tokens = String(input ?? "").trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return null;
  return { name: tokens[0].toLowerCase(), args: tokens.slice(1).map((a) => a.toLowerCase()) };
}

// --- nearest-match suggestion ------------------------------------------

export function levenshtein(a, b) {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i += 1) {
    const row = [i];
    for (let j = 1; j <= n; j += 1) {
      row[j] = Math.min(
        prev[j] + 1,
        row[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = row;
  }
  return prev[n];
}

// Nearest candidate for a mistyped word: unique prefix first (feels like a
// shell), then smallest edit distance within a tolerance of 2. Returns null
// for gibberish so the error state never suggests nonsense.
export function suggest(word, candidates = COMMAND_NAMES) {
  if (!word) return null;
  const prefixed = candidates.filter((c) => c.startsWith(word));
  if (prefixed.length === 1) return prefixed[0];
  let best = null;
  let bestDist = 3;
  for (const c of candidates) {
    const d = levenshtein(word, c);
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return best;
}

// --- tab completion -----------------------------------------------------

function commonPrefix(words) {
  if (words.length === 0) return "";
  let prefix = words[0];
  for (const w of words.slice(1)) {
    while (!w.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  return prefix;
}

// Returns the completed input string, or null when there is nothing better.
export function completeInput(value) {
  const raw = String(value ?? "");
  const trimmed = raw.replace(/^\s+/, "");
  if (!trimmed) return null;
  const tokens = trimmed.split(/\s+/);
  const endsWithSpace = /\s$/.test(raw);

  // Completing the command word itself.
  if (tokens.length === 1 && !endsWithSpace) {
    const word = tokens[0].toLowerCase();
    const matches = COMMAND_NAMES.filter((c) => c.startsWith(word));
    if (matches.length === 0) return null;
    if (matches.length === 1) {
      const cmd = matches[0];
      return SLUG_COMMANDS.has(cmd) ? `${cmd} ` : cmd;
    }
    const prefix = commonPrefix(matches);
    return prefix.length > word.length ? prefix : null;
  }

  // Completing a slug argument for cat / man / open.
  const cmd = tokens[0].toLowerCase();
  if (!SLUG_COMMANDS.has(cmd)) return null;
  const partial = endsWithSpace ? "" : (tokens[1] ?? "").toLowerCase();
  if (tokens.length > 2 || (tokens.length === 2 && endsWithSpace)) return null;
  const matches = SLUGS.filter((s) => s.startsWith(partial));
  if (matches.length === 0) return null;
  if (matches.length === 1) return `${cmd} ${matches[0]}`;
  const prefix = commonPrefix(matches);
  return prefix.length > partial.length ? `${cmd} ${prefix}` : null;
}

// --- command implementations -------------------------------------------

function usageError(name) {
  return {
    entries: [
      {
        kind: "usage",
        usage: `${name} <slug>`,
        slugs: SLUGS,
        command: name,
      },
    ],
  };
}

function slugError(name, input) {
  return {
    entries: [
      {
        kind: "error",
        variant: "slug",
        input,
        suggestion: suggest(input, SLUGS),
        command: name,
      },
    ],
  };
}

function projectCard(p) {
  return {
    slug: p.slug,
    codename: p.codename,
    title: p.title,
    eyebrow: p.eyebrow,
    summary: p.summary,
    tags: p.tags,
    lang: p.lang,
    repo: p.repo,
    flagship: Boolean(p.flagship),
  };
}

const COMMANDS = {
  help: () => ({
    entries: [
      { kind: "help", commands: REGISTRY },
      { kind: "lines", lines: [{ key: "terminal.historyHint", tone: "faint" }] },
    ],
  }),

  whoami: () => ({
    entries: [
      {
        kind: "whoami",
        fields: [
          ["SUBJECT", SITE.name],
          ["ROLE", { key: "hero.role" }],
          ["AFFILIATION", { en: SITE.university, el: "Πανεπιστήμιο Αιγαίου" }],
          ["LOCATION", { en: SITE.location, el: "Σάμος, Ελλάδα" }],
          ["STATUS", { key: "terminal.whoami.status" }],
        ],
        assessmentKey: "terminal.whoami.assessment",
      },
    ],
  }),

  projects: () => ({
    entries: [{ kind: "projects", items: PROJECTS.map(projectCard) }],
  }),

  skills: () => ({
    entries: [
      {
        kind: "skills",
        groups: [
          { label: "DOMAINS", chipsKey: "marquee.areas", tone: "neon" },
          {
            label: "TOOLING",
            chips: [...new Set(PROJECTS.flatMap((p) => p.tags ?? []))],
            tone: "dim",
          },
        ],
      },
    ],
  }),

  experience: () => ({
    entries: [
      {
        kind: "experience",
        rows: EXPERIENCE.map((e) => ({
          period: e.period,
          role: e.role,
          org: e.org,
          tag: e.tag,
        })),
      },
    ],
  }),

  contact: () => ({
    entries: [
      {
        kind: "contact",
        links: [
          { label: "EMAIL", value: SITE.email, href: `mailto:${SITE.email}` },
          { label: "GITHUB", value: SITE.githubHandle, href: SITE.github, external: true },
          { label: "LINKEDIN", value: SITE.linkedinHandle, href: SITE.linkedin, external: true },
        ],
        outroKey: "terminal.contactOutro",
      },
    ],
  }),

  ls: () => ({
    entries: [
      {
        kind: "ls",
        items: PROJECTS.map((p) => ({ slug: p.slug, flagship: Boolean(p.flagship) })),
      },
    ],
  }),

  cat: (args) => {
    if (args.length === 0) return usageError("cat");
    const project = getProject(args[0]);
    if (!project) return slugError("cat", args[0]);
    return { entries: [{ kind: "cat", project: projectCard(project) }] };
  },

  man: (args) => {
    if (args.length === 0) return usageError("man");
    const project = getProject(args[0]);
    if (!project) return slugError("man", args[0]);
    if (!project.flagship) {
      return {
        entries: [
          { kind: "lines", lines: [{ key: "terminal.manNote", tone: "dim" }] },
          { kind: "cat", project: projectCard(project) },
        ],
      };
    }
    return {
      entries: [
        {
          kind: "man",
          project: {
            ...projectCard(project),
            overview: project.overview,
            architecture: project.architecture,
            methodology: project.methodology,
            outcome: project.outcome,
          },
        },
      ],
    };
  },

  open: (args) => {
    if (args.length === 0) return usageError("open");
    const project = getProject(args[0]);
    if (!project) return slugError("open", args[0]);
    if (!project.flagship) {
      return {
        entries: [
          {
            kind: "lines",
            lines: [
              { key: "terminal.noDossier", tone: "dim" },
              { text: project.repo, href: project.repo, external: true, tone: "link" },
            ],
          },
        ],
      };
    }
    return {
      entries: [
        {
          kind: "lines",
          lines: [{ key: "terminal.opening", suffix: ` /ops/${project.slug}`, tone: "neon" }],
        },
      ],
      action: { type: "navigate", to: `/ops/${project.slug}` },
    };
  },

  lang: () => ({
    entries: [{ kind: "lines", lines: [{ key: "terminal.langSwitched", tone: "neon" }] }],
    action: { type: "toggleLang" },
  }),

  banner: () => ({ entries: [{ kind: "banner" }] }),

  clear: () => ({ entries: [], action: { type: "clear" } }),

  sudo: () => ({ entries: [{ kind: "denied" }] }),

  theme: () => ({
    entries: [
      {
        kind: "lines",
        lines: [
          { key: "terminal.theme.l1", tone: "dim" },
          { key: "terminal.theme.l2", tone: "dim" },
        ],
      },
    ],
  }),
};

// --- entry point ---------------------------------------------------------

// runCommand(input) -> { entries: [descriptor], action? } | null for empty
// input. Unknown commands produce a designed error descriptor with a
// nearest-match suggestion; the raw input travels as plain data.
export function runCommand(input) {
  const parsed = parse(input);
  if (!parsed) return null;
  const impl = COMMANDS[parsed.name];
  if (!impl) {
    return {
      entries: [
        {
          kind: "error",
          variant: "command",
          input: parsed.name,
          suggestion: suggest(parsed.name),
        },
      ],
    };
  }
  return impl(parsed.args);
}
