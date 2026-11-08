// Builds the On Repeat logo from Inter Regular outlines plus the two musical repeat signs.
// Writes the SVG files in public/brand, the favicon, and the geometry the React <Logo> draws.
// Usage: npm run logo
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import opentype from "opentype.js";

const RED = "#ee3a49";
const TEXT = "on repeat";
const EM = 100; // design unit: everything below is in hundredths of the type size
const TRACKING = -0.035; // em

// Repeat-sign geometry (em/100). Bars run from below the descender to cap height;
// the dots sit inside the x-height band, so they line up with the lowercase bodies.
const SIGN = {
  top: -76, // relative to baseline (y up is negative in SVG)
  bottom: 24,
  thick: 11,
  thin: 3.5,
  barGap: 5,
  dotGap: 6,
  dotR: 4.6,
  dotsY: [-39, -13],
  wordGap: 16,
};
const signWidth = SIGN.thick + SIGN.barGap + SIGN.thin + SIGN.dotGap + SIGN.dotR * 2;

const buf = readFileSync("scripts/Inter-Regular.ttf");
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));

const round = (n) => Math.round(n * 100) / 100;

// Manual layout: glyph advances + kerning pairs + tracking. (opentype.js' shaper chokes on
// some of Inter's GSUB lookups, and the logo needs no ligatures anyway.)
function layout(text, x0) {
  const scale = EM / font.unitsPerEm;
  const glyphs = [...text].map((ch) => font.charToGlyph(ch));
  const path = new opentype.Path();
  let x = x0;
  glyphs.forEach((g, i) => {
    path.extend(g.getPath(x, 0, EM));
    const kern = i < glyphs.length - 1 ? font.getKerningValue(g, glyphs[i + 1]) : 0;
    x += (g.advanceWidth + kern) * scale + (i < glyphs.length - 1 ? TRACKING * EM : 0);
  });
  return { path, width: x - x0 };
}
const wordWidth = layout(TEXT, 0).width;

/** Start sign ‖: drawn left-to-right from x. Returns rect/circle specs. */
function sign(x, kind) {
  const h = SIGN.bottom - SIGN.top;
  const parts = [];
  const bar = (bx, w) => parts.push({ t: "rect", x: round(bx), y: SIGN.top, w, h });
  const dots = (cx) => SIGN.dotsY.forEach((cy) => parts.push({ t: "dot", cx: round(cx), cy, r: SIGN.dotR }));
  if (kind === "start") {
    bar(x, SIGN.thick);
    bar(x + SIGN.thick + SIGN.barGap, SIGN.thin);
    dots(x + SIGN.thick + SIGN.barGap + SIGN.thin + SIGN.dotGap + SIGN.dotR);
  } else {
    dots(x + SIGN.dotR);
    bar(x + SIGN.dotR * 2 + SIGN.dotGap, SIGN.thin);
    bar(x + SIGN.dotR * 2 + SIGN.dotGap + SIGN.thin + SIGN.barGap, SIGN.thick);
  }
  return parts;
}

// Full lockup: ‖: on repeat :‖ — baseline at y = 0, viewBox shifted up by SIGN.top.
const wordX = signWidth + SIGN.wordGap;
const wordPath = layout(TEXT, wordX).path.toPathData(2);
const endX = wordX + wordWidth + SIGN.wordGap;
const fullWidth = round(endX + signWidth);
const fullParts = [...sign(0, "start"), ...sign(endX, "end")];

// Mark: ‖:‖ — thick, thin, dots, thin, thick (the "repeat both ways" sign).
// `heavy` is the small-size cut for favicons: fatter bars and dots so it survives 16px.
function buildMark(heavy = false) {
  const S = heavy ? { ...SIGN, thick: 17, thin: 8, barGap: 7, dotGap: 7, dotR: 7.5, dotsY: [-42, -10] } : SIGN;
  const h = S.bottom - S.top;
  const parts = [];
  let x = 0;
  const bar = (w) => {
    parts.push({ t: "rect", x: round(x), y: S.top, w, h });
    x += w;
  };
  bar(S.thick);
  x += S.barGap;
  bar(S.thin);
  x += S.dotGap;
  S.dotsY.forEach((cy) => parts.push({ t: "dot", cx: round(x + S.dotR), cy, r: S.dotR }));
  x += S.dotR * 2 + S.dotGap;
  bar(S.thin);
  x += S.barGap;
  bar(S.thick);
  return { parts, width: round(x) };
}
const { parts: markParts, width: markWidth } = buildMark();
const heavyMark = buildMark(true);
const height = SIGN.bottom - SIGN.top;

const toSvg = (parts, ink, accent) =>
  parts
    .map((p) =>
      p.t === "rect"
        ? `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" fill="${ink}"/>`
        : `<circle cx="${p.cx}" cy="${p.cy}" r="${p.r}" fill="${accent}"/>`
    )
    .join("");

const vb = (w, pad = 0) => `${-pad} ${SIGN.top - pad} ${w + pad * 2} ${height + pad * 2}`;

const fullSvg = (ink, accent) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb(fullWidth, 8)}" role="img" aria-label="On Repeat"><title>On Repeat</title>${toSvg(fullParts, ink, accent)}<path d="${wordPath}" fill="${ink}"/></svg>\n`;
const markSvg = (ink, accent, bg, mark = { parts: markParts, width: markWidth }, pad = 40) => {
  const size = height + pad * 2;
  const x0 = -pad + (size - mark.width) / 2;
  const bgRect = bg ? `<rect x="${-pad}" y="${SIGN.top - pad}" width="${size}" height="${size}" fill="${bg}"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${SIGN.top - pad} ${size} ${size}" role="img" aria-label="On Repeat"><title>On Repeat</title>${bgRect}<g transform="translate(${round(x0)} 0)">${toSvg(mark.parts, ink, accent)}</g></svg>\n`;
};

mkdirSync("public/brand", { recursive: true });
writeFileSync("public/brand/on-repeat-logo-black.svg", fullSvg("#000000", RED));
writeFileSync("public/brand/on-repeat-logo-white.svg", fullSvg("#ffffff", RED));
writeFileSync("public/brand/on-repeat-logo-mono.svg", fullSvg("#000000", "#000000"));
writeFileSync("public/brand/on-repeat-mark-black.svg", markSvg("#000000", RED));
writeFileSync("public/brand/on-repeat-mark-white.svg", markSvg("#ffffff", RED));
writeFileSync("public/brand/on-repeat-app-icon.svg", markSvg("#ffffff", RED, "#000000"));
writeFileSync("src/app/icon.svg", markSvg("#ffffff", RED, "#000000", heavyMark, 22));

writeFileSync(
  "src/components/brand/logo-geometry.ts",
  `// Generated by scripts/build-logo.mjs — do not edit by hand.
export const LOGO = ${JSON.stringify(
    { top: SIGN.top, height, fullWidth, markWidth, wordPath, full: fullParts, mark: markParts },
    null,
    1
  )} as const;
`
);

console.log({ fullWidth, markWidth, height, wordWidth: round(wordWidth) });
