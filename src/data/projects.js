// The operations grid renders exactly the four public repositories at
// github.com/Robinwood717. Flagship entries (flagship: true) also power a
// dedicated route at /ops/:slug and the declassified dossier modal.
//
// Prose text fields are { en, el } pairs, resolved at render via tr() from
// LanguageContext. Bare strings (filenames, tool names, technical tokens)
// pass through tr() unchanged and are intentionally identical in both
// languages. Security acronyms stay English throughout.

export const PROJECTS = [
  {
    slug: "dlp-scanner",
    flagship: true,
    codename: "DLP-SCANNER",
    title: "DLP Scanner",
    eyebrow: { en: "DATA LOSS PREVENTION", el: "ΠΡΟΛΗΨΗ ΑΠΩΛΕΙΑΣ ΔΕΔΟΜΕΝΩΝ" },
    lang: "Python",
    repo: "https://github.com/Robinwood717/dlp-scanner",
    summary: {
      en: "Zero-dependency Python engine that sweeps document stores for exposed PII (credit cards, Greek AFM tax IDs, emails), validates every hit to kill false positives, masks the value, and maps findings to ISO 27001.",
      el: "Μηχανή σε Python χωρίς εξαρτήσεις που σαρώνει αποθετήρια εγγράφων για εκτεθειμένα PII (κάρτες, ελληνικά ΑΦΜ, emails), επικυρώνει κάθε εύρημα για να εξαλείψει τα false positives, μασκάρει την τιμή και αντιστοιχίζει τα ευρήματα στο ISO 27001.",
    },
    tags: ["PYTHON", "ISO-27001", "PII-DETECTION", "AUDIT"],
    statusTags: [
      { text: "TLP:GREEN", tone: "green" },
      { text: "ISO-27001", tone: "neutral" },
      { text: "STATUS: SHIPPED", tone: "neon" },
    ],
    overview: {
      en: "A data-loss-prevention auditor that scans folders of text and CSV files for exposed sensitive data and produces audit evidence with masked values rather than raw PII. Built with a modular detector architecture and zero external dependencies, so it runs anywhere Python 3.9+ does.",
      el: "Ένας ελεγκτής data-loss-prevention που σαρώνει φακέλους με αρχεία κειμένου και CSV για εκτεθειμένα ευαίσθητα δεδομένα και παράγει αποδεικτικά ελέγχου με μασκαρισμένες τιμές αντί για ακατέργαστα PII. Σχεδιασμένος με αρθρωτή αρχιτεκτονική detectors και μηδενικές εξωτερικές εξαρτήσεις, ώστε να τρέχει οπουδήποτε τρέχει η Python 3.9+.",
    },
    architecture: [
      ["models.py", {
        en: "Finding data structures: the shape of every recorded hit.",
        el: "Δομές δεδομένων ευρημάτων: η μορφή κάθε καταγεγραμμένου εντοπισμού.",
      }],
      ["detectors.py", {
        en: "Pattern matching plus real validation (Luhn, GSIS check-digit, RFC 5322).",
        el: "Αντιστοίχιση προτύπων και πραγματική επικύρωση (Luhn, ψηφίο ελέγχου GSIS, RFC 5322).",
      }],
      ["scanner.py", {
        en: "Directory traversal and file reading, with UTF-8 → Latin-1 encoding fallback.",
        el: "Διάσχιση καταλόγων και ανάγνωση αρχείων, με fallback κωδικοποίησης UTF-8 → Latin-1.",
      }],
      ["reporter.py", {
        en: "JSON / CSV audit-report generation with masked values.",
        el: "Δημιουργία αναφορών ελέγχου JSON / CSV με μασκαρισμένες τιμές.",
      }],
      ["main.py", {
        en: "CLI entry point (--target, --format, --output, --verbose).",
        el: "Σημείο εισόδου CLI (--target, --format, --output, --verbose).",
      }],
    ],
    methodology: [
      {
        en: "Credit cards: matched, then Luhn-validated, masked as ****-****-****-0366.",
        el: "Κάρτες: εντοπισμός, μετά επικύρωση Luhn, μασκάρισμα ως ****-****-****-0366.",
      },
      {
        en: "Greek AFM: matched, then validated with the GSIS check-digit formula, masked as XXXXXX787.",
        el: "Ελληνικά ΑΦΜ: εντοπισμός, μετά επικύρωση με τον αλγόριθμο ψηφίου ελέγχου GSIS, μασκάρισμα ως XXXXXX787.",
      },
      {
        en: "Email: RFC 5322 pattern with word boundaries, masked as ****@example.gr.",
        el: "Email: πρότυπο RFC 5322 με όρια λέξεων, μασκάρισμα ως ****@example.gr.",
      },
      {
        en: "Every detector validates before recording, so pattern noise never reaches the report.",
        el: "Κάθε detector επικυρώνει πριν την καταγραφή, ώστε ο θόρυβος προτύπων να μη φτάνει ποτέ στην αναφορά.",
      },
    ],
    outcome: {
      en: "Audit evidence generated, not assembled: each finding is masked, severity-ranked, and traceable to an ISO 27001 Annex A control. Reports are git-ignored by default so raw PII never lands in version control.",
      el: "Αποδεικτικά ελέγχου που παράγονται, δεν συναρμολογούνται: κάθε εύρημα είναι μασκαρισμένο, ταξινομημένο κατά σοβαρότητα και ιχνηλάσιμο σε control του ISO 27001 Annex A. Οι αναφορές αγνοούνται από το git εξ ορισμού, ώστε ακατέργαστα PII να μην καταλήγουν ποτέ στο version control.",
    },
    dossier: [
      ["CLASSIFICATION", {
        en: "Internal tooling · defensive · compliance",
        el: "Εσωτερικό εργαλείο · αμυντικό · συμμόρφωση",
      }],
      ["THREAT MODEL", {
        en: "Unmanaged PII sprawl across shared document stores",
        el: "Ανεξέλεγκτη διασπορά PII σε κοινόχρηστα αποθετήρια εγγράφων",
      }],
      ["APPROACH", {
        en: "Detect → validate → mask → map-to-control → report",
        el: "Εντοπισμός → επικύρωση → μασκάρισμα → αντιστοίχιση σε control → αναφορά",
      }],
      ["DETECTORS", "Credit card (Luhn) · Greek AFM (GSIS) · Email (RFC 5322)"],
      ["DEPENDENCIES", {
        en: "None (standard library only)",
        el: "Καμία (μόνο standard library)",
      }],
      ["EVIDENCE", {
        en: "Masked JSON/CSV reports, control-mapped, VCS-excluded",
        el: "Μασκαρισμένες αναφορές JSON/CSV, αντιστοιχισμένες σε controls, εκτός VCS",
      }],
    ],
  },
  {
    slug: "mitm-lab",
    flagship: true,
    codename: "MITM-LAB",
    title: "MITM Attack Lab",
    eyebrow: { en: "OFFENSIVE // NETWORK SECURITY", el: "ΕΠΙΘΕΤΙΚΗ // ΑΣΦΑΛΕΙΑ ΔΙΚΤΥΩΝ" },
    lang: "Networking",
    repo: "https://github.com/Robinwood717/mitm-lab-assignment",
    summary: {
      en: "Seven-phase man-in-the-middle lab (ARP/DNS spoofing, SSL stripping, rogue certificate injection) executed against isolated VMs, paired with a full defensive analysis.",
      el: "Εργαστήριο man-in-the-middle επτά φάσεων (ARP/DNS spoofing, SSL stripping, injection rogue certificate) σε απομονωμένες VMs, μαζί με πλήρη αμυντική ανάλυση.",
    },
    tags: ["BETTERCAP", "WIRESHARK", "OPENSSL", "PFSENSE"],
    statusTags: [
      { text: "TLP:AMBER", tone: "amber" },
      { text: "AUTHORIZED LAB", tone: "neutral" },
      { text: "SCOPE: ISOLATED", tone: "neon" },
    ],
    authorized: {
      en: "Authorized coursework. Every technique was executed exclusively against the author's own controlled virtual machines in an isolated Host-Only network. No production infrastructure or third parties were ever touched.",
      el: "Εξουσιοδοτημένη εργασία μαθήματος. Κάθε τεχνική εκτελέστηκε αποκλειστικά σε ελεγχόμενες εικονικές μηχανές του συγγραφέα, σε απομονωμένο δίκτυο Host-Only. Καμία παραγωγική υποδομή ή τρίτος δεν επηρεάστηκε ποτέ.",
    },
    overview: {
      en: "University of the Aegean network-security coursework: a hands-on study of man-in-the-middle techniques in a controlled lab, capturing traffic at each stage and closing with documented countermeasures. The environment was three VirtualBox VMs on a Host-Only network: Kali (attacker), Ubuntu (victim), pfSense (gateway).",
      el: "Εργασία ασφάλειας δικτύων του Πανεπιστημίου Αιγαίου: πρακτική μελέτη τεχνικών man-in-the-middle σε ελεγχόμενο εργαστήριο, με καταγραφή της κίνησης σε κάθε στάδιο και ολοκλήρωση με τεκμηριωμένα αντίμετρα. Το περιβάλλον ήταν τρεις VMs VirtualBox σε δίκτυο Host-Only: Kali (επιτιθέμενος), Ubuntu (θύμα), pfSense (πύλη).",
    },
    architecture: [
      ["ARP SPOOFING", {
        en: "Bettercap cache poisoning to intercept plaintext HTTP credentials.",
        el: "Δηλητηρίαση cache με Bettercap για υποκλοπή διαπιστευτηρίων HTTP σε καθαρό κείμενο.",
      }],
      ["DNS SPOOFING", {
        en: "Spoofed responses + cloned site for credential harvesting.",
        el: "Πλαστές απαντήσεις + κλωνοποιημένος ιστότοπος για συλλογή διαπιστευτηρίων.",
      }],
      ["SSL STRIPPING", {
        en: "HTTPS-downgrade testing against HSTS-protected targets.",
        el: "Δοκιμή υποβάθμισης HTTPS έναντι στόχων με προστασία HSTS.",
      }],
      ["ROGUE CERTS", {
        en: "Self-signed CA via OpenSSL and trust-store manipulation.",
        el: "Αυτο-υπογεγραμμένη CA μέσω OpenSSL και χειραγώγηση του trust store.",
      }],
      ["SESSION HIJACK", {
        en: "Cookie-theft analysis: visibility and security flags.",
        el: "Ανάλυση κλοπής cookie: ορατότητα και security flags.",
      }],
      ["ROGUE DHCP", {
        en: "DHCP starvation and rogue-server methodology.",
        el: "Μεθοδολογία DHCP starvation και rogue server.",
      }],
    ],
    methodology: [
      {
        en: "Each phase runs the attack, then captures and analyzes the traffic in Wireshark.",
        el: "Κάθε φάση εκτελεί την επίθεση και έπειτα καταγράφει και αναλύει την κίνηση στο Wireshark.",
      },
      {
        en: "Tooling: Bettercap · Wireshark · Social-Engineering Toolkit · OpenSSL · Apache2.",
        el: "Εργαλεία: Bettercap · Wireshark · Social-Engineering Toolkit · OpenSSL · Apache2.",
      },
      {
        en: "Findings feed a defense analysis: six mitigations mapped to the attacks.",
        el: "Τα ευρήματα τροφοδοτούν ανάλυση άμυνας: έξι αντίμετρα αντιστοιχισμένα στις επιθέσεις.",
      },
      {
        en: "Countermeasures: DAI, HSTS, certificate pinning, DNSSEC, 802.1X.",
        el: "Αντίμετρα: DAI, HSTS, certificate pinning, DNSSEC, 802.1X.",
      },
    ],
    outcome: {
      en: "A complete offense-to-defense narrative: every intercept is reproduced, captured, and then neutralized on paper, demonstrating not just how the attacks work, but exactly which control stops each one.",
      el: "Μια πλήρης αφήγηση από την επίθεση στην άμυνα: κάθε υποκλοπή αναπαράγεται, καταγράφεται και έπειτα εξουδετερώνεται στα χαρτιά, δείχνοντας όχι μόνο πώς λειτουργούν οι επιθέσεις, αλλά και ακριβώς ποιο control σταματά την καθεμία.",
    },
    dossier: [
      ["CLASSIFICATION", {
        en: "Academic · offensive lab · authorized",
        el: "Ακαδημαϊκό · επιθετικό εργαστήριο · εξουσιοδοτημένο",
      }],
      ["ENVIRONMENT", "VirtualBox Host-Only · Kali / Ubuntu / pfSense"],
      ["PHASES", "ARP · DNS · SSL-strip · rogue-cert · hijack · DHCP · defense"],
      ["TOOLING", "Bettercap · Wireshark · SET · OpenSSL · Apache2"],
      ["DEFENSES", "DAI · HSTS · cert-pinning · DNSSEC · 802.1X"],
      ["SCOPE", {
        en: "Isolated VMs only, zero external exposure",
        el: "Μόνο απομονωμένες VMs, μηδενική εξωτερική έκθεση",
      }],
    ],
  },
  {
    slug: "appointment-system-ds",
    flagship: false,
    codename: "APPT-DS",
    title: "Distributed Appointment System",
    eyebrow: { en: "DISTRIBUTED SYSTEMS", el: "ΚΑΤΑΝΕΜΗΜΕΝΑ ΣΥΣΤΗΜΑΤΑ" },
    lang: "Java",
    repo: "https://github.com/Robinwood717/appointment-system-ds",
    summary: {
      en: "Distributed hospital appointment booking in Java: RMI + sockets, a 3-tier client/server architecture with a Swing GUI.",
      el: "Κατανεμημένο σύστημα κράτησης ραντεβού νοσοκομείου σε Java: RMI + sockets, αρχιτεκτονική client/server τριών επιπέδων με GUI σε Swing.",
    },
    tags: ["JAVA", "RMI", "SOCKETS", "SWING"],
  },
  {
    slug: "playlist-ds",
    flagship: false,
    codename: "PLAYLIST-DS",
    title: "Playlist Manager",
    eyebrow: { en: "DATA STRUCTURES", el: "ΔΟΜΕΣ ΔΕΔΟΜΕΝΩΝ" },
    lang: "C",
    repo: "https://github.com/Robinwood717/playlist-ds",
    summary: {
      en: "Terminal music-playlist manager in C: doubly-linked list, history stack, and a shuffle algorithm.",
      el: "Διαχειριστής μουσικής playlist σε τερματικό, γραμμένος σε C: διπλά συνδεδεμένη λίστα, στοίβα ιστορικού και αλγόριθμος shuffle.",
    },
    tags: ["C", "LINKED-LIST", "STACK", "ALGORITHMS"],
  },
];

export const FLAGSHIP_SLUGS = PROJECTS.filter((p) => p.flagship).map((p) => p.slug);

export function getProject(slug) {
  return PROJECTS.find((p) => p.slug === slug);
}
