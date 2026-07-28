// Runs in vitest's default node environment — this is a wiring/asset check,
// not a render test.
//
// A set piece is wired across four places that have no compile-time link to
// each other: the slug table in ProjectPage, two asset files under public/,
// a caption in each dictionary, and the poster generator's own list. Miss
// one and the failure is silent — a 404'd GLB just leaves the poster up, and
// a missing caption renders the raw key path as visible text. These assert
// the four stay in step.
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { en } from "../i18n/en.js";
import { el } from "../i18n/el.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..");

const source = fs.readFileSync(path.join(HERE, "ProjectPage.jsx"), "utf8");

// Pull the MODEL_BY_SLUG block and read each slug's two asset paths out of it.
const block = source.match(/const MODEL_BY_SLUG = \{([\s\S]*?)\n\};/);
const entries = [...(block?.[1] ?? "").matchAll(
  /"([\w-]+)":\s*\{\s*modelUrl:\s*"([^"]+)",\s*poster:\s*"([^"]+)",\s*\}/g
)].map(([, slug, modelUrl, poster]) => ({ slug, modelUrl, poster }));

describe("project set pieces are wired end to end", () => {
  it("finds the slug table and at least the two known set pieces", () => {
    expect(block).not.toBeNull();
    expect(entries.map((e) => e.slug).sort()).toEqual(["dlp-scanner", "mitm-lab"]);
  });

  it.each(entries)("$slug ships the GLB it points at", ({ modelUrl }) => {
    const file = path.join(ROOT, "public", modelUrl.replace(/^\//, ""));
    expect(fs.existsSync(file), `${modelUrl} is referenced but missing`).toBe(true);
    // A truncated or placeholder GLB would still "exist"; require real bytes
    // and the glTF magic.
    const buf = fs.readFileSync(file);
    expect(buf.length).toBeGreaterThan(1000);
    expect(buf.readUInt32LE(0)).toBe(0x46546c67);
  });

  it.each(entries)("$slug ships the poster it points at", ({ poster }) => {
    const file = path.join(ROOT, "public", poster.replace(/^\//, ""));
    expect(fs.existsSync(file), `${poster} is referenced but missing`).toBe(true);
    expect(fs.statSync(file).size).toBeGreaterThan(2000);
  });

  it.each(entries)("$slug has a caption in both dictionaries", ({ slug }) => {
    expect(typeof en.project.modelCaption[slug]).toBe("string");
    expect(typeof el.project.modelCaption[slug]).toBe("string");
    expect(en.project.modelCaption[slug].length).toBeGreaterThan(0);
    expect(el.project.modelCaption[slug].length).toBeGreaterThan(0);
  });

  it("keeps the poster generator's list covering every shipped model", () => {
    const gen = fs.readFileSync(path.join(ROOT, "scripts", "generate-model-posters.mjs"), "utf8");
    const slugs = [...gen.matchAll(/\{\s*slug:\s*"([\w-]+)"/g)].map((m) => m[1]);
    // Every poster referenced from a dossier must be regenerable.
    for (const { poster } of entries) {
      const slug = path.basename(poster, ".webp");
      expect(slugs, `${slug} has no entry in generate-model-posters.mjs`).toContain(slug);
    }
  });

  it("keeps the capture harness in step with the poster generator", () => {
    const gen = fs.readFileSync(path.join(ROOT, "scripts", "generate-model-posters.mjs"), "utf8");
    const harness = fs.readFileSync(path.join(ROOT, "scripts", "poster-capture.html"), "utf8");
    const genSlugs = [...gen.matchAll(/\{\s*slug:\s*"([\w-]+)"/g)].map((m) => m[1]).sort();
    const capSlugs = (harness.match(/const SLUGS = \[([^\]]*)\]/)?.[1] ?? "")
      .split(",")
      .map((s) => s.trim().replace(/"/g, ""))
      .filter(Boolean)
      .sort();
    // The generator composites whatever the harness captured; a slug in one
    // and not the other means a poster silently built from a stale render.
    expect(capSlugs).toEqual(genSlugs);
  });
});
