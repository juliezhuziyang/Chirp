import fs from "fs";

const src = fs.readFileSync("src/lib/emotionInterpretation.ts", "utf8");

function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

const states = {};
const stateRe =
  /"([^"]+)":\s*\{\s*explanation:\s*"([^"]+)",\s*careAdvice:\s*\[([\s\S]*?)\]\s*,?\s*\}/g;
let m;
while ((m = stateRe.exec(src)) !== null) {
  const name = m[1];
  const explanation = m[2];
  const advice = [...m[3].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
  states[slug(name)] = { name, explanation, careAdvice: advice };
}

const dimRe = /return \{ label: "([^"]+)", description: "([^"]+)" \}/g;

function extractDims(startMarker, endMarker) {
  const start = src.indexOf(startMarker);
  const end = src.indexOf(endMarker);
  const chunk = src.slice(start, end);
  const dims = {};
  while ((m = dimRe.exec(chunk)) !== null) {
    dims[slug(m[1])] = { label: m[1], description: m[2] };
  }
  return dims;
}

const out = {
  states,
  valence: extractDims("export function interpretValence", "export function interpretArousal"),
  arousal: extractDims("export function interpretArousal", "export function interpretSocial"),
  social: extractDims("export function interpretSocial", "type Rule"),
  summary: "{{valence}}、{{arousal}}、{{social}}。",
};

fs.writeFileSync("src/i18n/locales/emotion.en.json", JSON.stringify(out, null, 2));
console.log("Generated emotion.en.json", Object.keys(states).length, "states");
