import { describe, it, expect } from "vitest";
import {
  NEON_HEX,
  NEON_RGB,
  VOID_HEX,
  GRIDLINE_HEX,
  ACCENT_MATERIALS,
  IDLE_ROTATION_SECONDS,
} from "./modelTheme";

describe("modelTheme", () => {
  it("exposes hex colors in #rrggbb form", () => {
    for (const hex of [NEON_HEX, VOID_HEX, GRIDLINE_HEX]) {
      expect(hex).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("keeps NEON_RGB numerically in sync with NEON_HEX", () => {
    const [r, g, b] = NEON_RGB.split(",").map((n) => parseInt(n.trim(), 10));
    const hexPairs = [NEON_HEX.slice(1, 3), NEON_HEX.slice(3, 5), NEON_HEX.slice(5, 7)];
    const [hr, hg, hb] = hexPairs.map((h) => parseInt(h, 16));
    expect([r, g, b]).toEqual([hr, hg, hb]);
  });

  it("lists at least one accent material as a non-empty string", () => {
    expect(Array.isArray(ACCENT_MATERIALS)).toBe(true);
    expect(ACCENT_MATERIALS.length).toBeGreaterThan(0);
    for (const name of ACCENT_MATERIALS) {
      expect(typeof name).toBe("string");
      expect(name.length).toBeGreaterThan(0);
    }
  });

  it("uses a single positive idle-rotation duration shared by every viewport", () => {
    expect(typeof IDLE_ROTATION_SECONDS).toBe("number");
    expect(IDLE_ROTATION_SECONDS).toBeGreaterThan(0);
  });
});
