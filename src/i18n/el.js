// Greek dictionary. Strategy: short, unambiguous UI labels (nav, palette
// chrome, buttons) are translated so the EN/ΕΛ toggle is visibly functional.
// Everything prose/marketing is left as "TODO_EL: <english>" — these resolve
// back to en.js until you replace them with your own Greek copy.
//
// To find what still needs translating: search this file for "TODO_EL".
export const el = {
  nav: {
    doctrine: "ΔΟΓΜΑ",
    experience: "ΕΜΠΕΙΡΙΑ",
    operations: "ΕΠΙΧΕΙΡΗΣΕΙΣ",
    connect: "ΣΥΝΔΕΣΗ",
    search: "ΑΝΑΖΗΤΗΣΗ",
  },
  hero: {
    name: "ΑΝΑΣΤΑΣΙΟΣ ΣΟΥΜΠΑΚΗΣ",
    role: "TODO_EL: Security & Information Systems Engineer",
    boot: "TODO_EL", // array — falls back to en.hero.boot until translated
    awaiting: "awaiting_input",
    viewOps: "[ ΕΠΙΧΕΙΡΗΣΕΙΣ ]",
    establishContact: "[ ΕΠΙΚΟΙΝΩΝΙΑ ]",
    scrollHint: "TODO_EL: SCROLL TO ENUMERATE ▼",
  },
  doctrine: {
    label: "ΕΚΠΑΙΔΕΥΣΗ // ΔΟΓΜΑ",
    title: "TODO_EL: Built on theory. Deployed against threats.",
    p1intro: "TODO_EL",
    p1: "TODO_EL",
    p2: "TODO_EL",
    sig: "// doctrine.sig — integrity verified ✓",
    lines: "TODO_EL", // array — falls back to en.doctrine.lines
  },
  experience: {
    label: "ΙΣΤΟΡΙΚΟ // ΑΝΑΘΕΣΕΙΣ",
    title: "TODO_EL: Engagements & build log.",
    intro: "TODO_EL",
    present: "ΣΗΜΕΡΑ",
  },
  killchain: {
    label: "ΦΑΚΕΛΟΣ // ΑΛΥΣΙΔΑ ΕΠΙΘΕΣΗΣ",
    title: "TODO_EL: Anatomy of an eradication.",
    intro: "TODO_EL",
    caseTag: "IR-2506-RUNNER",
    statusTag: "STATUS: ERADICATED",
    outcome: "TODO_EL",
    selectHint: "ΕΠΙΛΕΞΤΕ ΣΤΑΔΙΟ ▸",
  },
  operations: {
    label: "ΕΠΙΧΕΙΡΗΣΕΙΣ // ΦΑΚΕΛΟΙ",
    title: "TODO_EL: Field-proven operations.",
    openDossier: "ΑΝΟΙΓΜΑ ΦΑΚΕΛΟΥ",
    viewSource: "ΠΗΓΑΙΟΣ ΚΩΔΙΚΑΣ",
    flagshipEyebrow: "ΝΑΥΑΡΧΙΔΑ",
    telemetryTitle: "ΖΩΝΤΑΝΗ ΤΗΛΕΜΕΤΡΙΑ",
    telemetry: "TODO_EL", // array of rows — falls back to en.operations.telemetry
  },
  contact: {
    label: "ΚΡΥΠΤΟΓΡΑΦΗΜΕΝΟ ΚΑΝΑΛΙ",
    title: "TODO_EL: Establish Secure Connection.",
    intro: "TODO_EL",
    copyright: "© 2026 ΑΝΑΣΤΑΣΙΟΣ ΣΟΥΜΠΑΚΗΣ // ΠΑΝΕΠΙΣΤΗΜΙΟ ΑΙΓΑΙΟΥ",
    warning: "TODO_EL: ALL SESSIONS LOGGED. UNAUTHORIZED ACCESS WILL BE TRACED.",
  },
  palette: {
    placeholder: "Πληκτρολογήστε εντολή ή αναζήτηση…",
    empty: "Καμία αντίστοιχη εντολή.",
    hint: "πλοήγηση ↑↓ · επιλογή ↵ · κλείσιμο esc",
    groups: {
      navigate: "ΠΛΟΗΓΗΣΗ",
      operations: "ΕΠΙΧΕΙΡΗΣΕΙΣ",
      actions: "ΕΝΕΡΓΕΙΕΣ",
    },
    actions: {
      home: "TODO_EL: Go to home",
      doctrine: "TODO_EL: Go to doctrine",
      experience: "TODO_EL: Go to experience",
      killchain: "TODO_EL: Go to kill chain",
      operations: "TODO_EL: Go to operations",
      contact: "TODO_EL: Go to contact",
      copyEmail: "TODO_EL: Copy email address",
      copiedEmail: "Αντιγράφηκε ✓",
      github: "TODO_EL: Open GitHub profile",
      linkedin: "TODO_EL: Open LinkedIn profile",
      toggleLang: "TODO_EL: Toggle language (EN / ΕΛ)",
    },
  },
  project: {
    back: "← ΠΙΣΩ ΣΤΙΣ ΕΠΙΧΕΙΡΗΣΕΙΣ",
    openCaseFile: "[ ΑΝΟΙΓΜΑ ΦΑΚΕΛΟΥ ]",
    viewOnGithub: "ΠΡΟΒΟΛΗ ΣΤΟ GITHUB ↗",
    notFound: "TODO_EL: Case file not found.",
    sections: {
      overview: "ΕΠΙΣΚΟΠΗΣΗ",
      architecture: "ΑΡΧΙΤΕΚΤΟΝΙΚΗ",
      methodology: "ΜΕΘΟΔΟΛΟΓΙΑ",
      outcome: "ΑΠΟΤΕΛΕΣΜΑ",
    },
    dossier: {
      header: "ΑΠΟΡΡΗΤΟΣ ΦΑΚΕΛΟΣ",
      declassified: "ΑΠΟΧΑΡΑΚΤΗΡΙΣΜΕΝΟ ΓΙΑ ΕΠΙΣΚΟΠΗΣΗ",
      close: "ΚΛΕΙΣΙΜΟ ✕",
      footer: "TODO_EL: END OF FILE // HANDLING: TLP:CLEAR ON PUBLICATION",
    },
  },
};
