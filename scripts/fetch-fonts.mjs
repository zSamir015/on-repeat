// Downloads the static Inter TTFs that scripts/build-logo.mjs (Regular) and
// scripts/build-typeface.mjs (Light) outline. The files are not committed.
// Usage: npm run fonts
import { writeFileSync } from "node:fs";

const WEIGHTS = { 300: "Light", 400: "Regular" };

for (const [weight, name] of Object.entries(WEIGHTS)) {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=Inter:wght@${weight}`)).text();
  const url = css.match(/url\((https:[^)]+\.ttf)\)/)?.[1];
  if (!url) throw new Error(`No TTF for weight ${weight}`);
  const bytes = Buffer.from(await (await fetch(url)).arrayBuffer());
  writeFileSync(`scripts/Inter-${name}.ttf`, bytes);
  console.log(`Inter-${name}.ttf`, bytes.length);
}
