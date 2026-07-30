/**
 * The "Phantom Panther" mark as a raw SVG string, for the generated app icons.
 *
 * The in-app component (components/ui/Logo.tsx) blurs the eye glow with
 * feGaussianBlur; resvg's filter support is uneven, so this version bakes the
 * glow as two scaled, faded copies of each eye. Geometry restated from
 * Logo.tsx — change one, change both.
 */

const HEAD =
  "32,56 23,50 17,38 14,24 17,8 25,17 32,14 39,17 47,8 50,24 47,38 41,50";

// Eye centroids, for scaling the glow copies about their own centre.
const EYES = [
  { pts: "22,30 29.5,32 23,35.5", cx: 24.83, cy: 32.5 },
  { pts: "42,30 34.5,32 41,35.5", cx: 39.17, cy: 32.5 },
];

const glow = (s: number, o: number) =>
  EYES.map(
    (e) =>
      `<g transform="translate(${e.cx} ${e.cy}) scale(${s}) translate(${-e.cx} ${-e.cy})" opacity="${o}">` +
      `<polygon points="${e.pts}" fill="#ccff00"/></g>`,
  ).join("");

/** @param inset fraction of the tile to leave as margin on each side (0–0.5). */
export function pantherSvg(inset = 0): string {
  const s = 1 - inset * 2;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<defs><linearGradient id="rim" x1="0" y1="0" x2="0.7" y2="1">` +
    `<stop offset="0" stop-color="#ccff00"/>` +
    `<stop offset="0.55" stop-color="#ccff00" stop-opacity="0.25"/>` +
    `<stop offset="1" stop-color="#ccff00" stop-opacity="0"/>` +
    `</linearGradient></defs>` +
    `<rect width="64" height="64" fill="#0e0e0e"/>` +
    `<g transform="translate(${32 * (1 - s)} ${32 * (1 - s)}) scale(${s})">` +
    `<polygon points="${HEAD}" fill="#161616"/>` +
    `<polygon points="${HEAD}" fill="none" stroke="url(#rim)" stroke-width="1.8" stroke-linejoin="bevel"/>` +
    glow(1.65, 0.16) +
    glow(1.3, 0.32) +
    EYES.map((e) => `<polygon points="${e.pts}" fill="#ccff00"/>`).join("") +
    `<polygon points="32,44 34.6,47 32,50 29.4,47" fill="#2c2c2c"/>` +
    `</g></svg>`
  );
}
