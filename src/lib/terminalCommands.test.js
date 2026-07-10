import { describe, it, expect } from "vitest";
import {
  COMMAND_NAMES,
  REGISTRY,
  parse,
  levenshtein,
  suggest,
  completeInput,
  runCommand,
} from "./terminalCommands";
import { PROJECTS, FLAGSHIP_SLUGS } from "../data/projects";

describe("parse", () => {
  it("lowercases and tokenizes", () => {
    expect(parse("  CAT   DLP-Scanner  ")).toEqual({
      name: "cat",
      args: ["dlp-scanner"],
    });
  });

  it("returns null for empty or whitespace input", () => {
    expect(parse("")).toBeNull();
    expect(parse("   ")).toBeNull();
    expect(parse(null)).toBeNull();
  });
});

describe("levenshtein", () => {
  it("computes edit distances", () => {
    expect(levenshtein("help", "help")).toBe(0);
    expect(levenshtein("help", "hlep")).toBe(2);
    expect(levenshtein("", "abc")).toBe(3);
    expect(levenshtein("kitten", "sitting")).toBe(3);
  });
});

describe("suggest", () => {
  it("suggests the nearest command for a typo", () => {
    expect(suggest("projcets")).toBe("projects");
    expect(suggest("hlep")).toBe("help");
    expect(suggest("sudp")).toBe("sudo");
  });

  it("resolves unique prefixes like a shell", () => {
    expect(suggest("who")).toBe("whoami");
    expect(suggest("exp")).toBe("experience");
  });

  it("returns null for gibberish instead of guessing", () => {
    expect(suggest("xyzzyqwertyuiop")).toBeNull();
  });
});

describe("completeInput", () => {
  it("completes a unique command name", () => {
    expect(completeInput("who")).toBe("whoami");
    expect(completeInput("ban")).toBe("banner");
  });

  it("appends a space for commands that take a slug", () => {
    expect(completeInput("op")).toBe("open ");
    expect(completeInput("ca")).toBe("cat ");
  });

  it("completes slug arguments for cat/man/open", () => {
    expect(completeInput("open dl")).toBe("open dlp-scanner");
    expect(completeInput("cat mi")).toBe("cat mitm-lab");
    expect(completeInput("man play")).toBe("man playlist-ds");
  });

  it("returns null when there is nothing better", () => {
    expect(completeInput("")).toBeNull();
    expect(completeInput("zzz")).toBeNull();
    expect(completeInput("open zzz")).toBeNull();
    expect(completeInput("theme extra")).toBeNull();
  });
});

describe("runCommand", () => {
  it("returns null for empty input", () => {
    expect(runCommand("")).toBeNull();
  });

  it("every registered command returns descriptor entries", () => {
    for (const { name, arg } of REGISTRY) {
      const input = arg ? `${name} ${FLAGSHIP_SLUGS[0]}` : name;
      const result = runCommand(input);
      expect(result, input).toBeTruthy();
      expect(Array.isArray(result.entries), input).toBe(true);
    }
  });

  it("is case-insensitive", () => {
    expect(runCommand("HELP").entries[0].kind).toBe("help");
  });

  it("help lists the full registry", () => {
    const help = runCommand("help").entries[0];
    expect(help.kind).toBe("help");
    expect(help.commands.map((c) => c.name)).toEqual(COMMAND_NAMES);
  });

  it("projects returns one dossier card per project", () => {
    const out = runCommand("projects").entries[0];
    expect(out.kind).toBe("projects");
    expect(out.items).toHaveLength(PROJECTS.length);
    expect(out.items[0]).toMatchObject({ slug: "dlp-scanner", flagship: true });
  });

  it("unknown command produces a designed error with a suggestion", () => {
    const out = runCommand("projcets").entries[0];
    expect(out).toMatchObject({
      kind: "error",
      variant: "command",
      input: "projcets",
      suggestion: "projects",
    });
  });

  it("unknown gibberish has no suggestion, and input stays plain data", () => {
    const out = runCommand("xkcdqzz").entries[0];
    expect(out.kind).toBe("error");
    expect(out.suggestion).toBeNull();
  });

  it("markup in input is carried as a plain string, never interpreted", () => {
    // Shell semantics: the first whitespace token is the command word.
    const out = runCommand('<img src=x onerror=alert(1)>').entries[0];
    expect(out.kind).toBe("error");
    expect(out.input).toBe("<img");
    expect(typeof out.input).toBe("string");
  });

  it("cat without a slug returns usage with the slug list", () => {
    const out = runCommand("cat").entries[0];
    expect(out.kind).toBe("usage");
    expect(out.usage).toBe("cat <slug>");
    expect(out.slugs).toEqual(PROJECTS.map((p) => p.slug));
  });

  it("cat with a bad slug suggests the nearest case file", () => {
    const out = runCommand("cat dlp").entries[0];
    expect(out).toMatchObject({
      kind: "error",
      variant: "slug",
      suggestion: "dlp-scanner",
      command: "cat",
    });
  });

  it("open on a flagship returns a navigate action", () => {
    const result = runCommand("open dlp-scanner");
    expect(result.action).toEqual({ type: "navigate", to: "/ops/dlp-scanner" });
    expect(result.entries[0].kind).toBe("lines");
  });

  it("open on a non-flagship links to the repo instead of navigating", () => {
    const result = runCommand("open playlist-ds");
    expect(result.action).toBeUndefined();
    const link = result.entries[0].lines.find((l) => l.href);
    expect(link.href).toContain("github.com");
  });

  it("man on a flagship includes the full sections", () => {
    const out = runCommand("man mitm-lab").entries[0];
    expect(out.kind).toBe("man");
    expect(out.project.overview).toBeTruthy();
    expect(out.project.architecture.length).toBeGreaterThan(0);
    expect(out.project.methodology.length).toBeGreaterThan(0);
  });

  it("man on a non-flagship falls back to the summary card with a note", () => {
    const result = runCommand("man playlist-ds");
    expect(result.entries[0].kind).toBe("lines");
    expect(result.entries[1].kind).toBe("cat");
  });

  it("clear and lang return their actions", () => {
    expect(runCommand("clear").action).toEqual({ type: "clear" });
    expect(runCommand("lang").action).toEqual({ type: "toggleLang" });
  });

  it("sudo is the designed denial beat", () => {
    expect(runCommand("sudo").entries[0].kind).toBe("denied");
  });

  it("skills exposes domain and tooling groups", () => {
    const out = runCommand("skills").entries[0];
    expect(out.groups[0].chipsKey).toBe("marquee.areas");
    expect(out.groups[1].chips).toContain("PYTHON");
    // Tags are deduplicated across projects.
    const chips = out.groups[1].chips;
    expect(new Set(chips).size).toBe(chips.length);
  });

  it("experience returns one row per engagement", () => {
    const out = runCommand("experience").entries[0];
    expect(out.kind).toBe("experience");
    expect(out.rows.length).toBeGreaterThan(0);
    expect(out.rows[0]).toHaveProperty("period");
    expect(out.rows[0]).toHaveProperty("role");
  });

  it("contact lists email, github, and linkedin", () => {
    const out = runCommand("contact").entries[0];
    expect(out.links.map((l) => l.label)).toEqual(["EMAIL", "GITHUB", "LINKEDIN"]);
    expect(out.links[0].href).toMatch(/^mailto:/);
  });
});
