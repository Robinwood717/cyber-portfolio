// Reconstructed stages of engagement IR-2506-RUNNER, driving the KillChain
// visualization. Order is the timeline of the attack; the final stage is the
// response. Redacted spans (▚) preserve the operational-security aesthetic
// carried over from the original case card.
export const KILL_CHAIN = [
  {
    id: "delivery",
    phase: "01",
    label: "DELIVERY",
    kind: "attack",
    summary: "Obfuscated PowerShell loader lands on the host.",
    detail:
      "An obfuscated PowerShell loader arrives and executes — the first foothold. Command-line telemetry is deliberately noisy to blend into normal admin activity.",
  },
  {
    id: "execution",
    phase: "02",
    label: "EXECUTION",
    kind: "attack",
    summary: "Loader runs, resolving its staged payload.",
    detail:
      "The loader decodes and runs in memory, reaching out to resolve a staged payload at ▚▚▚▚▚▚. Living-off-the-land binaries keep the footprint minimal.",
  },
  {
    id: "persistence",
    phase: "03",
    label: "PERSISTENCE",
    kind: "attack",
    summary: "Run-key + scheduled-task persistence established.",
    detail:
      "Persistence is planted across a Run-key and scheduled tasks (plus ▚▚▚▚), guaranteeing the implant survives reboot and user logoff.",
  },
  {
    id: "staging",
    phase: "04",
    label: "STAGING",
    kind: "attack",
    summary: "Payload staged for follow-on activity.",
    detail:
      "The follow-on payload is staged at ▚▚▚▚▚▚, positioned for later execution. This is the pivot point the response has to sever.",
  },
  {
    id: "detection",
    phase: "05",
    label: "DETECTION",
    kind: "defense",
    summary: "Live execution tracing maps the full chain.",
    detail:
      "Live execution tracing with Autoruns, Process Explorer, and TCPView builds a complete persistence map — every autorun key, scheduled task, and network path the implant depends on.",
  },
  {
    id: "eradication",
    phase: "06",
    label: "ERADICATION",
    kind: "defense",
    summary: "Root-cause removal. Zero reimage, zero data loss.",
    detail:
      "With the full kill chain mapped, the implant is removed at its root — every persistence mechanism severed at the source. Zero reimage. Zero data loss. Full chain documented.",
  },
];
