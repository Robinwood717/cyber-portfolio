// English is the source language and the fallback for every key.
// The matching keys in el.js carry "TODO_EL:" markers until translated;
// any missing or TODO_EL key resolves back to the value here.
export const en = {
  nav: {
    doctrine: "DOCTRINE",
    experience: "EXPERIENCE",
    operations: "OPERATIONS",
    connect: "CONNECT",
    search: "SEARCH",
  },
  hero: {
    name: "ANASTASIOS SOUMPAKIS",
    role: "Security & Information Systems Engineer",
    boot: [
      "> Initializing secure session...",
      "> Authenticating secure token...",
      "> Access Granted.",
      "> Welcome, Anastasios Soumpakis | Security Engineer.",
    ],
    awaiting: "awaiting_input",
    viewOps: "[ VIEW OPERATIONS ]",
    establishContact: "[ ESTABLISH CONTACT ]",
    scrollHint: "SCROLL TO ENUMERATE ▼",
  },
  doctrine: {
    label: "EDUCATION // DOCTRINE",
    title: "Built on theory. Deployed against threats.",
    p1intro:
      "Integrated Master's (MEng), Information & Communication Systems Engineering — University of the Aegean.",
    p1:
      "Five years of engineering depth across network security, cryptography, advanced data structures, and discrete mathematics. Not a certification sprint — a complete theory of how systems fail, and the discipline to make sure they don't.",
    p2:
      "Every engagement — from live malware eradication to compliance tooling — executes under a single, non-negotiable doctrine:",
    sig: "// doctrine.sig — integrity verified ✓",
    lines: ["Analyze first.", "Act second.", "Document everything."],
  },
  experience: {
    label: "TRACK RECORD // ENGAGEMENTS",
    title: "Engagements & build log.",
    intro:
      "A chronological log of engineering and security work — academic, applied, and self-directed. Timestamps and scope are provisional; correct before publishing.",
    present: "PRESENT",
  },
  killchain: {
    label: "CASE FILE // KILL CHAIN",
    title: "Anatomy of an eradication.",
    intro:
      "Reconstructed attack chain from engagement IR-2506-RUNNER — an obfuscated PowerShell implant traced from delivery to root-cause removal. Select a stage to expand the analysis.",
    caseTag: "IR-2506-RUNNER",
    statusTag: "STATUS: ERADICATED",
    outcome:
      "Implant eradicated at the root. Zero reimage. Zero data loss. Full kill chain documented.",
    selectHint: "SELECT A STAGE ▸",
  },
  operations: {
    label: "OPERATIONS // CASE FILES",
    title: "Field-proven operations.",
    openDossier: "OPEN DOSSIER",
    viewSource: "VIEW SOURCE",
    flagshipEyebrow: "FLAGSHIP",
    telemetryTitle: "LIVE TELEMETRY",
    telemetry: [
      ["STATUS", "OPERATIONAL", true],
      ["THREAT_FEED", "ACTIVE", false],
      ["LAST_INCIDENT", "CLOSED // ERADICATED", false],
      ["POSTURE", "HARDENED", false],
      ["COVERAGE", "ENDPOINT + NET + DOCS", false],
    ],
  },
  contact: {
    label: "ENCRYPTED CHANNEL",
    title: "Establish Secure Connection.",
    intro:
      "Handshake complete. Channel integrity verified. Whether it's an incident that needs answers or a system that needs hardening — transmissions land here.",
    copyright: "© 2026 ANASTASIOS SOUMPAKIS // UNIVERSITY OF THE AEGEAN",
    warning: "ALL SESSIONS LOGGED. UNAUTHORIZED ACCESS WILL BE TRACED.",
  },
  palette: {
    placeholder: "Type a command or search…",
    empty: "No matching commands.",
    hint: "navigate ↑↓ · select ↵ · close esc",
    groups: { navigate: "NAVIGATE", operations: "OPERATIONS", actions: "ACTIONS" },
    actions: {
      home: "Go to home",
      doctrine: "Go to doctrine",
      experience: "Go to experience",
      killchain: "Go to kill chain",
      operations: "Go to operations",
      contact: "Go to contact",
      copyEmail: "Copy email address",
      copiedEmail: "Email copied ✓",
      github: "Open GitHub profile",
      linkedin: "Open LinkedIn profile",
      toggleLang: "Toggle language (EN / ΕΛ)",
    },
  },
  project: {
    back: "← BACK TO OPERATIONS",
    openCaseFile: "[ OPEN CASE FILE ]",
    viewOnGithub: "VIEW ON GITHUB ↗",
    notFound: "Case file not found.",
    sections: {
      overview: "OVERVIEW",
      architecture: "ARCHITECTURE",
      methodology: "METHODOLOGY",
      outcome: "OUTCOME",
    },
    dossier: {
      header: "CLASSIFIED CASE FILE",
      declassified: "DECLASSIFIED FOR REVIEW",
      close: "CLOSE ✕",
      footer: "END OF FILE // HANDLING: TLP:CLEAR ON PUBLICATION",
    },
  },
};
