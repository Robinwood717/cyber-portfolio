import { describe, it, expect } from "vitest";
import { parseRepos, languageBreakdown, formatRelative } from "./useGithubActivity";

const DICT = {
  justNow: "just now",
  standby: "awaiting uplink",
  agoSuffix: "ago",
  units: { minute: "m", hour: "h", day: "d", month: "mo", year: "y" },
};

const DICT_EL = {
  justNow: "μόλις τώρα",
  standby: "αναμονή σύνδεσης",
  agoSuffix: "πριν",
  units: { minute: "λ", hour: "ω", day: "ημ", month: "μ", year: "ε" },
};

describe("parseRepos", () => {
  const payload = [
    { name: "old", language: "C", pushed_at: "2026-01-01T00:00:00Z", html_url: "u1" },
    { name: "fork", language: "Go", pushed_at: "2026-07-01T00:00:00Z", fork: true },
    { name: "new", language: "Python", pushed_at: "2026-07-01T00:00:00Z", html_url: "u2" },
    { name: "nolang", language: null, pushed_at: "2026-03-01T00:00:00Z", html_url: "u3" },
    { name: "mid1", language: "Java", pushed_at: "2026-05-01T00:00:00Z", html_url: "u4" },
    { name: "mid2", language: "Java", pushed_at: "2026-04-01T00:00:00Z", html_url: "u5" },
  ];

  it("drops forks, sorts by pushed_at desc, caps at four", () => {
    const repos = parseRepos(payload);
    expect(repos.map((r) => r.name)).toEqual(["new", "mid1", "mid2", "nolang"]);
  });

  it("substitutes N/A for a missing language", () => {
    const repos = parseRepos(payload);
    expect(repos.find((r) => r.name === "nolang").language).toBe("N/A");
  });

  it("tolerates a non-array payload", () => {
    expect(parseRepos(null)).toEqual([]);
    expect(parseRepos({ message: "rate limit exceeded" })).toEqual([]);
  });
});

describe("languageBreakdown", () => {
  it("counts languages, most common first", () => {
    const out = languageBreakdown([
      { language: "Python" },
      { language: "Java" },
      { language: "Python" },
      { language: "C" },
    ]);
    expect(out).toEqual([
      ["Python", 2],
      ["Java", 1],
      ["C", 1],
    ]);
  });
});

describe("formatRelative", () => {
  const now = new Date("2026-07-10T12:00:00Z").getTime();
  const at = (iso) => formatRelative(iso, DICT, "en", now);

  it("labels each magnitude with its short unit", () => {
    expect(at("2026-07-10T11:59:30Z")).toBe("just now");
    expect(at("2026-07-10T11:57:00Z")).toBe("3m ago");
    expect(at("2026-07-10T09:00:00Z")).toBe("3h ago");
    expect(at("2026-07-07T12:00:00Z")).toBe("3d ago");
    expect(at("2026-05-10T12:00:00Z")).toBe("2mo ago");
    expect(at("2024-07-10T12:00:00Z")).toBe("2y ago");
  });

  it("uses the Greek prefix form", () => {
    expect(formatRelative("2026-07-10T09:00:00Z", DICT_EL, "el", now)).toBe("πριν 3ω");
  });

  it("falls back to standby for invalid timestamps", () => {
    expect(formatRelative(null, DICT, "en", now)).toBe("awaiting uplink");
    expect(formatRelative("not-a-date", DICT, "en", now)).toBe("awaiting uplink");
  });

  it("clamps future timestamps to just now", () => {
    expect(at("2026-07-10T12:05:00Z")).toBe("just now");
  });
});
