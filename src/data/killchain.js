// Reconstructed stages of engagement IR-2506-RUNNER, driving the KillChain
// visualization. Order is the timeline of the attack; the final stage is the
// response. Redacted spans (▚) preserve the operational-security aesthetic
// carried over from the original case card.
//
// label / summary / detail are { en, el } pairs, resolved at render via tr().
// Security acronyms and tool names stay English in both languages.
export const KILL_CHAIN = [
  {
    id: "delivery",
    phase: "01",
    label: { en: "DELIVERY", el: "ΠΑΡΑΔΟΣΗ" },
    kind: "attack",
    summary: {
      en: "Obfuscated PowerShell loader lands on the host.",
      el: "Αποκρυπτογραφημένος PowerShell loader φτάνει στον host.",
    },
    detail: {
      en: "An obfuscated PowerShell loader arrives and executes: the first foothold. Command-line telemetry is deliberately noisy to blend into normal admin activity.",
      el: "Ένας αποκρυπτογραφημένος PowerShell loader φτάνει και εκτελείται: το πρώτο πάτημα. Η τηλεμετρία της γραμμής εντολών είναι σκόπιμα θορυβώδης ώστε να ανακατεύεται με τη φυσιολογική δραστηριότητα διαχείρισης.",
    },
  },
  {
    id: "execution",
    phase: "02",
    label: { en: "EXECUTION", el: "ΕΚΤΕΛΕΣΗ" },
    kind: "attack",
    summary: {
      en: "Loader runs, resolving its staged payload.",
      el: "Ο loader τρέχει και εντοπίζει το staged payload του.",
    },
    detail: {
      en: "The loader decodes and runs in memory, reaching out to resolve a staged payload at ▚▚▚▚▚▚. Living-off-the-land binaries keep the footprint minimal.",
      el: "Ο loader αποκωδικοποιείται και τρέχει στη μνήμη, αναζητώντας ένα staged payload στο ▚▚▚▚▚▚. Τα living-off-the-land binaries κρατούν το αποτύπωμα ελάχιστο.",
    },
  },
  {
    id: "persistence",
    phase: "03",
    label: { en: "PERSISTENCE", el: "ΕΠΙΜΟΝΗ" },
    kind: "attack",
    summary: {
      en: "Run-key + scheduled-task persistence established.",
      el: "Εδραίωση επιμονής με Run-key + scheduled tasks.",
    },
    detail: {
      en: "Persistence is planted across a Run-key and scheduled tasks (plus ▚▚▚▚), guaranteeing the implant survives reboot and user logoff.",
      el: "Η επιμονή φυτεύεται σε ένα Run-key και σε scheduled tasks (συν ▚▚▚▚), εξασφαλίζοντας ότι το implant επιβιώνει σε επανεκκίνηση και αποσύνδεση χρήστη.",
    },
  },
  {
    id: "staging",
    phase: "04",
    label: { en: "STAGING", el: "ΠΡΟΕΤΟΙΜΑΣΙΑ" },
    kind: "attack",
    summary: {
      en: "Payload staged for follow-on activity.",
      el: "Το payload προετοιμάζεται για επόμενη δραστηριότητα.",
    },
    detail: {
      en: "The follow-on payload is staged at ▚▚▚▚▚▚, positioned for later execution. This is the pivot point the response has to sever.",
      el: "Το επόμενο payload προετοιμάζεται στο ▚▚▚▚▚▚, τοποθετημένο για μεταγενέστερη εκτέλεση. Αυτό είναι το σημείο-κλειδί που η απόκριση πρέπει να αποκόψει.",
    },
  },
  {
    id: "detection",
    phase: "05",
    label: { en: "DETECTION", el: "ΑΝΙΧΝΕΥΣΗ" },
    kind: "defense",
    summary: {
      en: "Live execution tracing maps the full chain.",
      el: "Ζωντανή ιχνηλάτηση εκτέλεσης χαρτογραφεί όλη την αλυσίδα.",
    },
    detail: {
      en: "Live execution tracing with Autoruns, Process Explorer, and TCPView builds a complete persistence map: every autorun key, scheduled task, and network path the implant depends on.",
      el: "Η ζωντανή ιχνηλάτηση εκτέλεσης με Autoruns, Process Explorer και TCPView χτίζει έναν πλήρη χάρτη επιμονής: κάθε autorun key, scheduled task και διαδρομή δικτύου από τα οποία εξαρτάται το implant.",
    },
  },
  {
    id: "eradication",
    phase: "06",
    label: { en: "ERADICATION", el: "ΕΞΑΛΕΙΨΗ" },
    kind: "defense",
    summary: {
      en: "Root-cause removal. Zero reimage, zero data loss.",
      el: "Αφαίρεση στη ρίζα. Καμία επανεγκατάσταση, καμία απώλεια δεδομένων.",
    },
    detail: {
      en: "With the full kill chain mapped, the implant is removed at its root: every persistence mechanism severed at the source. Zero reimage. Zero data loss. Full chain documented.",
      el: "Με όλη την kill chain χαρτογραφημένη, το implant αφαιρείται στη ρίζα του: κάθε μηχανισμός επιμονής αποκόπτεται στην πηγή. Καμία επανεγκατάσταση. Καμία απώλεια δεδομένων. Πλήρης τεκμηρίωση της αλυσίδας.",
    },
  },
];
