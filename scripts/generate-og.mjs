// Generates public/og.png (1200x630), the social-share card.
// Run: node scripts/generate-og.mjs
//
// The card is composed here as SVG in the site's own visual language
// (void black, gridlines, neon shielded-prompt mark, terminal beat) and
// rasterized with resvg using the exact brand fonts, so link previews on
// LinkedIn / X / Slack carry the same identity as the site itself.

import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

const W = 1200;
const H = 630;
const NEON = "#10b981";

// 56px grid to match the hero's bg-grid-lines texture.
const gridLines = (() => {
  let d = "";
  for (let x = 56; x < W; x += 56) d += `M${x} 0V${H}`;
  for (let y = 56; y < H; y += 56) d += `M0 ${y}H${W}`;
  return d;
})();

// Corner brackets, the dossier framing device.
const bracket = (x, y, dx, dy) =>
  `<path d="M${x + dx * 28} ${y}H${x}V${y + dy * 28}" fill="none" stroke="${NEON}" stroke-opacity="0.5" stroke-width="3"/>`;

const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="0.32" cy="0.52" r="0.75">
      <stop offset="0" stop-color="${NEON}" stop-opacity="0.16"/>
      <stop offset="0.55" stop-color="${NEON}" stop-opacity="0.05"/>
      <stop offset="1" stop-color="${NEON}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="gridfade" cx="0.5" cy="0.5" r="0.72">
      <stop offset="0" stop-color="#ffffff" stop-opacity="1"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <mask id="gridmask">
      <rect width="${W}" height="${H}" fill="url(#gridfade)"/>
    </mask>
  </defs>

  <rect width="${W}" height="${H}" fill="#050505"/>
  <path d="${gridLines}" stroke="#1a1a1a" stroke-width="1" mask="url(#gridmask)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  ${bracket(40, 40, 1, 1)}
  ${bracket(W - 40, 40, -1, 1)}
  ${bracket(40, H - 40, 1, -1)}
  ${bracket(W - 40, H - 40, -1, -1)}

  <!-- window chrome tokens -->
  <text x="96" y="84" font-family="JetBrains Mono" font-size="19" fill="#ffffff" fill-opacity="0.35">anastasios@aegean: ~/secure-session</text>
  <text x="${W - 96}" y="84" text-anchor="end" font-family="JetBrains Mono" font-size="19" fill="#ffffff" fill-opacity="0.25">SESSION: TLS_1.3</text>

  <!-- shielded-prompt mark (LogoMark path at 24-unit viewBox, scaled 4x) -->
  <g transform="translate(96 132) scale(4)" stroke="${NEON}" fill="none" stroke-width="1.7">
    <path d="M4 5 L20 5 L20 14 Q20 18.5 12 21.5 Q4 18.5 4 14 Z" stroke-linejoin="round"/>
    <polyline points="9.4,9 12.8,12 9.4,15" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="13.8" y="10.6" width="2.4" height="3" fill="${NEON}" stroke="none"/>
  </g>

  <!-- terminal beat -->
  <text x="96" y="292" font-family="JetBrains Mono" font-weight="500" font-size="26" fill="${NEON}">&gt; access granted.</text>
  <rect x="388" y="270" width="14" height="26" fill="${NEON}"/>

  <!-- identity -->
  <text x="93" y="378" font-family="Space Grotesk" font-weight="700" font-size="76" letter-spacing="-1" fill="#ffffff">ANASTASIOS SOUMPAKIS</text>
  <text x="96" y="436" font-family="JetBrains Mono" font-weight="500" font-size="25" letter-spacing="7" fill="${NEON}" fill-opacity="0.9">SECURITY &amp; INFORMATION SYSTEMS ENGINEER</text>

  <!-- doctrine -->
  <text x="96" y="497" font-family="JetBrains Mono" font-size="21" fill="#ffffff" fill-opacity="0.5">Analyze first. Act second. Document everything.</text>

  <!-- footer tokens -->
  <text x="96" y="566" font-family="JetBrains Mono" font-size="19" fill="#ffffff" fill-opacity="0.4">github.com/Robinwood717</text>
  <text x="${W - 96}" y="566" text-anchor="end" font-family="JetBrains Mono" font-size="19" fill="#ffffff" fill-opacity="0.25">NODE: SAMOS.GR // 37.79N 26.70E</text>
</svg>`;

const resvg = new Resvg(svg, {
  fitTo: { mode: "width", value: W },
  font: {
    loadSystemFonts: false,
    fontFiles: [
      join(here, "fonts", "SpaceGrotesk-700.ttf"),
      join(here, "fonts", "JetBrainsMono-400.ttf"),
      join(here, "fonts", "JetBrainsMono-500.ttf"),
    ],
  },
});

const png = resvg.render().asPng();
const out = join(here, "..", "public", "og.png");
writeFileSync(out, png);
console.log(`og.png written: ${png.length} bytes (${W}x${H})`);
