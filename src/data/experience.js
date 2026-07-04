// [REVIEW] Every entry below is DRAFTED from verifiable workspace/GitHub
// artifacts, NOT from a confirmed CV. Dates and role framing are provisional
// placeholders — correct them before publishing. Search this file for
// "[REVIEW]" to find each item that needs your confirmation.
export const EXPERIENCE = [
  {
    // [REVIEW] Degree confirmed via site copy; date span is an assumption.
    period: "2021 — PRESENT",
    ongoing: true,
    role: "Integrated Master's (MEng), ICS Engineering",
    org: "University of the Aegean",
    tag: "EDUCATION",
    detail:
      "Five-year integrated master's across network security, cryptography, advanced data structures, and discrete mathematics.",
  },
  {
    // [REVIEW] Based on the IR-2506-RUNNER case file; confirm date + context
    // (personal engagement vs. coursework vs. professional).
    period: "2026",
    role: "Incident Response — PowerShell implant eradication",
    org: "Engagement IR-2506-RUNNER",
    tag: "SECURITY",
    detail:
      "Traced an obfuscated PowerShell loader from delivery to root-cause removal using Sysinternals/Autoruns. Implant eradicated at the source — zero reimage, zero data loss.",
  },
  {
    // [REVIEW] Derived from the dlp-scanner repo in this workspace.
    period: "2026",
    role: "Built DLP Scanner (PII auditor)",
    org: "Personal project · open source",
    tag: "BUILD",
    detail:
      "Zero-dependency Python DLP engine detecting credit cards, Greek AFM, and emails with real validation, masked reporting, and ISO 27001 mapping.",
  },
  {
    // [REVIEW] Derived from the Doc Digitizer workspace project.
    period: "2026",
    role: "Built Doc Digitizer (OCR pipeline)",
    org: "Personal project",
    tag: "BUILD",
    detail:
      "Containerized FastAPI + Azure AI Vision OCR pipeline that ingests scanned Greek paperwork, extracts text, and auto-classifies documents. Streamlit-fronted, Docker-deployed.",
  },
  {
    // [REVIEW] Derived from the LibreChat workspace project.
    period: "2026",
    role: "Deployed self-hosted team chat",
    org: "Personal project",
    tag: "BUILD",
    detail:
      "Self-hosted, claude.ai-style team chat — React + Express + MongoDB with streaming Anthropic integration, deployed via Docker.",
  },
  {
    // [REVIEW] Derived from the mitm-lab-assignment repo.
    period: "2025",
    role: "MITM attack lab + defense analysis",
    org: "University of the Aegean · coursework",
    tag: "SECURITY",
    detail:
      "Seven-phase authorized MITM lab (ARP/DNS spoofing, SSL stripping, rogue certs) on isolated VMs, paired with a mapped countermeasure analysis.",
  },
];
