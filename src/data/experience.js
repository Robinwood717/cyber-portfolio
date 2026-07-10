// Text fields are { en, el } pairs, resolved at render via tr() from
// LanguageContext. Security acronyms and tool names stay English in both.
export const EXPERIENCE = [
  {
    period: { en: "2021 - PRESENT", el: "2021 - ΣΗΜΕΡΑ" },
    ongoing: true,
    role: {
      en: "Integrated Master's (MEng), ICS Engineering",
      el: "Ενιαίο Μεταπτυχιακό (MEng), Μηχανικός ΤΠΕ",
    },
    org: { en: "University of the Aegean", el: "Πανεπιστήμιο Αιγαίου" },
    tag: "EDUCATION",
    detail: {
      en: "Five-year integrated master's across network security, cryptography, advanced data structures, and discrete mathematics.",
      el: "Πενταετές ενιαίο μεταπτυχιακό με αντικείμενα την ασφάλεια δικτύων, την κρυπτογραφία, τις προηγμένες δομές δεδομένων και τα διακριτά μαθηματικά.",
    },
  },
  {
    period: { en: "2026", el: "2026" },
    role: {
      en: "Incident Response: PowerShell implant eradication",
      el: "Incident Response: εξάλειψη implant PowerShell",
    },
    org: { en: "Engagement IR-2506-RUNNER", el: "Ανάθεση IR-2506-RUNNER" },
    tag: "SECURITY",
    detail: {
      en: "Traced an obfuscated PowerShell loader from delivery to root-cause removal using Sysinternals/Autoruns. Implant eradicated at the source. Zero reimage, zero data loss.",
      el: "Ιχνηλάτηση ενός αποκρυπτογραφημένου PowerShell loader από την παράδοση έως την αφαίρεση στη ρίζα του, με Sysinternals/Autoruns. Το implant εξαλείφθηκε στην πηγή. Καμία επανεγκατάσταση, καμία απώλεια δεδομένων.",
    },
  },
  {
    period: { en: "2026", el: "2026" },
    role: {
      en: "Built DLP Scanner (PII auditor)",
      el: "Ανάπτυξη DLP Scanner (ελεγκτής PII)",
    },
    org: { en: "Personal project · open source", el: "Προσωπικό έργο · open source" },
    tag: "BUILD",
    detail: {
      en: "Zero-dependency Python DLP engine detecting credit cards, Greek AFM, and emails with real validation, masked reporting, and ISO 27001 mapping.",
      el: "Μηχανή DLP σε Python χωρίς εξαρτήσεις που εντοπίζει κάρτες, ελληνικά ΑΦΜ και emails με πραγματική επικύρωση, αναφορές με μασκάρισμα και αντιστοίχιση σε ISO 27001.",
    },
  },
  {
    period: { en: "2026", el: "2026" },
    role: {
      en: "Built Doc Digitizer (OCR pipeline)",
      el: "Ανάπτυξη Doc Digitizer (pipeline OCR)",
    },
    org: { en: "Personal project", el: "Προσωπικό έργο" },
    tag: "BUILD",
    detail: {
      en: "Containerized FastAPI + Azure AI Vision OCR pipeline that ingests scanned Greek paperwork, extracts text, and auto-classifies documents. Streamlit-fronted, Docker-deployed.",
      el: "Containerized pipeline με FastAPI + Azure AI Vision OCR που εισάγει σαρωμένα ελληνικά έγγραφα, εξάγει το κείμενο και ταξινομεί αυτόματα τα έγγραφα. Με διεπαφή Streamlit και ανάπτυξη σε Docker.",
    },
  },
  {
    period: { en: "2026", el: "2026" },
    role: {
      en: "Deployed self-hosted team chat",
      el: "Ανάπτυξη self-hosted ομαδικού chat",
    },
    org: { en: "Personal project", el: "Προσωπικό έργο" },
    tag: "BUILD",
    detail: {
      en: "Self-hosted, claude.ai-style team chat: React + Express + MongoDB with streaming Anthropic integration, deployed via Docker.",
      el: "Self-hosted ομαδικό chat σε στυλ claude.ai: React + Express + MongoDB με streaming ενσωμάτωση Anthropic, ανάπτυξη μέσω Docker.",
    },
  },
  {
    period: { en: "2025", el: "2025" },
    role: {
      en: "MITM attack lab + defense analysis",
      el: "Εργαστήριο επιθέσεων MITM + ανάλυση άμυνας",
    },
    org: {
      en: "University of the Aegean · coursework",
      el: "Πανεπιστήμιο Αιγαίου · εργασία μαθήματος",
    },
    tag: "SECURITY",
    detail: {
      en: "Seven-phase authorized MITM lab (ARP/DNS spoofing, SSL stripping, rogue certs) on isolated VMs, paired with a mapped countermeasure analysis.",
      el: "Εξουσιοδοτημένο εργαστήριο MITM επτά φάσεων (ARP/DNS spoofing, SSL stripping, rogue certificates) σε απομονωμένες VMs, μαζί με αντιστοιχισμένη ανάλυση αντιμέτρων.",
    },
  },
];
