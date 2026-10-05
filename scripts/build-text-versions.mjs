// Vygeneruje public/texty/versions.json: { slug: { hash, sections } } pro chytrou synchronizaci.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dir = "public/texty";
const HEADING = /^[#*\s]*(oddíl|sekce)\s+([ivxlcdm]+|\d+)\.?[*\s]*$/iu;
const out = {};
for (const file of readdirSync(dir).sort()) {
  if (!file.endsWith(".json") || file === "versions.json") continue;
  const raw = readFileSync(join(dir, file));
  const data = JSON.parse(raw.toString("utf8"));
  const sections = (data.paragraphs ?? []).filter((p) => HEADING.test(String(p).trim())).length;
  out[file.replace(/\.json$/, "")] = {
    hash: createHash("sha256").update(raw).digest("hex").slice(0, 16),
    sections,
  };
}
writeFileSync(join(dir, "versions.json"), `${JSON.stringify(out, null, 2)}\n`);
console.log("versions.json:", Object.keys(out).join(", "));
