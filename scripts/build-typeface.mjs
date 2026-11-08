// Converts a TTF into the typeface JSON format read by three.js FontLoader / drei <Text3D>.
// Same conversion as three's TTFLoader, run offline so the app never fetches opentype at runtime.
// Usage: npm run typeface
import { readFileSync, writeFileSync } from "node:fs";
import opentype from "opentype.js";

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error("usage: build-typeface.mjs <font.ttf> <out.json>");
  process.exit(1);
}

const KEEP = new Set(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ÁÉÍÓÚÑÜáéíóúñü .,-'&!?:/"
);

const buffer = readFileSync(input);
const font = opentype.parse(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
const round = Math.round;
const scale = 100000 / ((font.unitsPerEm || 2048) * 72);
const glyphs = {};

for (const [unicode, index] of Object.entries(font.encoding.cmap.glyphIndexMap)) {
  const ch = String.fromCodePoint(Number(unicode));
  if (!KEEP.has(ch)) continue;
  const glyph = font.glyphs.get(index);
  let o = "";
  for (const c of glyph.path.commands) {
    const type = c.type.toLowerCase() === "c" ? "b" : c.type.toLowerCase();
    o += type + " ";
    if (c.x !== undefined) o += round(c.x * scale) + " " + round(c.y * scale) + " ";
    if (c.x1 !== undefined) o += round(c.x1 * scale) + " " + round(c.y1 * scale) + " ";
    if (c.x2 !== undefined) o += round(c.x2 * scale) + " " + round(c.y2 * scale) + " ";
  }
  glyphs[ch] = {
    ha: round(glyph.advanceWidth * scale),
    x_min: round((glyph.xMin ?? 0) * scale),
    x_max: round((glyph.xMax ?? 0) * scale),
    o,
  };
}

writeFileSync(
  output,
  JSON.stringify({
    glyphs,
    familyName: font.getEnglishName("fullName"),
    ascender: round(font.ascender * scale),
    descender: round(font.descender * scale),
    underlinePosition: font.tables.post.underlinePosition,
    underlineThickness: font.tables.post.underlineThickness,
    boundingBox: {
      xMin: font.tables.head.xMin,
      xMax: font.tables.head.xMax,
      yMin: font.tables.head.yMin,
      yMax: font.tables.head.yMax,
    },
    resolution: 1000,
  })
);
console.log(`${Object.keys(glyphs).length} glyphs -> ${output}`);
