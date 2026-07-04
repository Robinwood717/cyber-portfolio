// The operations grid renders exactly the four public repositories at
// github.com/Robinwood717. Flagship entries (flagship: true) also power a
// dedicated route at /ops/:slug and the declassified dossier modal.
//
// Content is drafted from the repo READMEs and, for dlp-scanner, the copy
// living in this workspace. Prose is English (source language); Greek
// translation of these strings is part of the EL TODO backlog.

export const PROJECTS = [
  {
    slug: "dlp-scanner",
    flagship: true,
    codename: "DLP-SCANNER",
    title: "DLP Scanner",
    eyebrow: "DATA LOSS PREVENTION",
    lang: "Python",
    repo: "https://github.com/Robinwood717/dlp-scanner",
    summary:
      "Zero-dependency Python engine that sweeps document stores for exposed PII — credit cards, Greek AFM tax IDs, emails — validates every hit to kill false positives, masks the value, and maps findings to ISO 27001.",
    tags: ["PYTHON", "ISO-27001", "PII-DETECTION", "AUDIT"],
    statusTags: [
      { text: "TLP:GREEN", tone: "green" },
      { text: "ISO-27001", tone: "neutral" },
      { text: "STATUS: SHIPPED", tone: "neon" },
    ],
    overview:
      "A data-loss-prevention auditor that scans folders of text and CSV files for exposed sensitive data and produces audit evidence with masked values rather than raw PII. Built with a modular detector architecture and zero external dependencies, so it runs anywhere Python 3.9+ does.",
    architecture: [
      ["models.py", "Finding data structures — the shape of every recorded hit."],
      ["detectors.py", "Pattern matching plus real validation (Luhn, GSIS check-digit, RFC 5322)."],
      ["scanner.py", "Directory traversal and file reading, with UTF-8 → Latin-1 encoding fallback."],
      ["reporter.py", "JSON / CSV audit-report generation with masked values."],
      ["main.py", "CLI entry point (--target, --format, --output, --verbose)."],
    ],
    methodology: [
      "Credit cards — matched, then Luhn-validated, masked as ****-****-****-0366.",
      "Greek AFM — matched, then validated with the GSIS check-digit formula, masked as XXXXXX787.",
      "Email — RFC 5322 pattern with word boundaries, masked as ****@example.gr.",
      "Every detector validates before recording, so pattern noise never reaches the report.",
    ],
    outcome:
      "Audit evidence generated, not assembled: each finding is masked, severity-ranked, and traceable to an ISO 27001 Annex A control. Reports are git-ignored by default so raw PII never lands in version control.",
    dossier: [
      ["CLASSIFICATION", "Internal tooling · defensive · compliance"],
      ["THREAT MODEL", "Unmanaged PII sprawl across shared document stores"],
      ["APPROACH", "Detect → validate → mask → map-to-control → report"],
      ["DETECTORS", "Credit card (Luhn) · Greek AFM (GSIS) · Email (RFC 5322)"],
      ["DEPENDENCIES", "None — standard library only"],
      ["EVIDENCE", "Masked JSON/CSV reports, control-mapped, VCS-excluded"],
    ],
  },
  {
    slug: "mitm-lab",
    flagship: true,
    codename: "MITM-LAB",
    title: "MITM Attack Lab",
    eyebrow: "OFFENSIVE // NETWORK SECURITY",
    lang: "Networking",
    repo: "https://github.com/Robinwood717/mitm-lab-assignment",
    summary:
      "Seven-phase man-in-the-middle lab — ARP/DNS spoofing, SSL stripping, rogue certificate injection — executed against isolated VMs, paired with a full defensive analysis.",
    tags: ["BETTERCAP", "WIRESHARK", "OPENSSL", "PFSENSE"],
    statusTags: [
      { text: "TLP:AMBER", tone: "amber" },
      { text: "AUTHORIZED LAB", tone: "neutral" },
      { text: "SCOPE: ISOLATED", tone: "neon" },
    ],
    authorized:
      "Authorized coursework. Every technique was executed exclusively against the author's own controlled virtual machines in an isolated Host-Only network — no production infrastructure or third parties were ever touched.",
    overview:
      "University of the Aegean network-security coursework: a hands-on study of man-in-the-middle techniques in a controlled lab, capturing traffic at each stage and closing with documented countermeasures. The environment was three VirtualBox VMs on a Host-Only network — Kali (attacker), Ubuntu (victim), pfSense (gateway).",
    architecture: [
      ["ARP SPOOFING", "Bettercap cache poisoning to intercept plaintext HTTP credentials."],
      ["DNS SPOOFING", "Spoofed responses + cloned site for credential harvesting."],
      ["SSL STRIPPING", "HTTPS-downgrade testing against HSTS-protected targets."],
      ["ROGUE CERTS", "Self-signed CA via OpenSSL and trust-store manipulation."],
      ["SESSION HIJACK", "Cookie-theft analysis — visibility and security flags."],
      ["ROGUE DHCP", "DHCP starvation and rogue-server methodology."],
    ],
    methodology: [
      "Each phase runs the attack, then captures and analyzes the traffic in Wireshark.",
      "Tooling: Bettercap · Wireshark · Social-Engineering Toolkit · OpenSSL · Apache2.",
      "Findings feed a defense analysis — six mitigations mapped to the attacks.",
      "Countermeasures: DAI, HSTS, certificate pinning, DNSSEC, 802.1X.",
    ],
    outcome:
      "A complete offense-to-defense narrative: every intercept is reproduced, captured, and then neutralized on paper — demonstrating not just how the attacks work, but exactly which control stops each one.",
    dossier: [
      ["CLASSIFICATION", "Academic · offensive lab · authorized"],
      ["ENVIRONMENT", "VirtualBox Host-Only · Kali / Ubuntu / pfSense"],
      ["PHASES", "ARP · DNS · SSL-strip · rogue-cert · hijack · DHCP · defense"],
      ["TOOLING", "Bettercap · Wireshark · SET · OpenSSL · Apache2"],
      ["DEFENSES", "DAI · HSTS · cert-pinning · DNSSEC · 802.1X"],
      ["SCOPE", "Isolated VMs only — zero external exposure"],
    ],
  },
  {
    slug: "appointment-system-ds",
    flagship: false,
    codename: "APPT-DS",
    title: "Distributed Appointment System",
    eyebrow: "DISTRIBUTED SYSTEMS",
    lang: "Java",
    repo: "https://github.com/Robinwood717/appointment-system-ds",
    summary:
      "Distributed hospital appointment booking in Java — RMI + sockets, a 3-tier client/server architecture with a Swing GUI.",
    tags: ["JAVA", "RMI", "SOCKETS", "SWING"],
  },
  {
    slug: "playlist-ds",
    flagship: false,
    codename: "PLAYLIST-DS",
    title: "Playlist Manager",
    eyebrow: "DATA STRUCTURES",
    lang: "C",
    repo: "https://github.com/Robinwood717/playlist-ds",
    summary:
      "Terminal music-playlist manager in C — doubly-linked list, history stack, and a shuffle algorithm.",
    tags: ["C", "LINKED-LIST", "STACK", "ALGORITHMS"],
  },
];

export const FLAGSHIP_SLUGS = PROJECTS.filter((p) => p.flagship).map((p) => p.slug);

export function getProject(slug) {
  return PROJECTS.find((p) => p.slug === slug);
}
