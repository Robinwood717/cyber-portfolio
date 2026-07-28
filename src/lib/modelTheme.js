// Shared palette for the 3D set pieces. Mirrors tailwind.config.js
// (`theme.extend.colors.neon`, `void`, `gridline`) and the raw values used
// throughout index.css / LivingBackground / CustomCursor — kept as plain
// hex/rgb here because three.js materials want primitives, not CSS.
// If the brand accent ever changes, update tailwind.config.js AND this file.
export const NEON_HEX = "#10b981";
export const NEON_RGB = "16, 185, 129";
export const VOID_HEX = "#050505";
export const GRIDLINE_HEX = "#1a1a1a";

// Material names (from each model's .mtl, preserved through the
// gltf-transform optimize pass with `--palette false`) that should read as
// "energized" — boosted emissive so the accent glows against the matte
// gunmetal/dark_panel base, echoing the neon text-shadow treatment used on
// .cursor-dot / the terminal prompt elsewhere on the site.
export const ACCENT_MATERIALS = ["neon_emerald", "emerald_dim", "core_glass", "energy_field"];

// One idle-rotation speed for every 3D set piece. The three viewports never
// share a viewport (Command Center / project dossier / contact footer), so
// there is no reason for them to drift apart — a single shared constant
// keeps the "calm, procedural" read intentional rather than three near-
// identical magic numbers that just look like unrelated guesses.
export const IDLE_ROTATION_SECONDS = 30;
