// Generates PNG favicon fallbacks from public/favicon.svg.
// Run: node scripts/generate-icons.mjs
//
// - favicon-32.png: classic tab icon for browsers that ignore SVG favicons
// - apple-touch-icon.png (180x180): iOS home screen; rendered over a
//   full-bleed square because iOS applies its own corner mask, and a
//   transparent-cornered source would leave dark notches.

import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = join(here, "..", "public");
const svg = readFileSync(join(publicDir, "favicon.svg"), "utf8");

function render(source, size, outName) {
  const png = new Resvg(source, {
    fitTo: { mode: "width", value: size },
    font: { loadSystemFonts: false },
  })
    .render()
    .asPng();
  writeFileSync(join(publicDir, outName), png);
  console.log(`${outName}: ${size}x${size}, ${png.length} bytes`);
}

render(svg, 32, "favicon-32.png");

// Full-bleed variant: solid void square behind the mark.
const fullBleed = svg.replace(
  /<svg([^>]*)>/,
  '<svg$1><rect width="32" height="32" fill="#050505"/>'
);
render(fullBleed, 180, "apple-touch-icon.png");
