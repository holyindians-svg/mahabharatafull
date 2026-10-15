// Jednorázově: node scripts/build-audiobook-srt.mjs <soubor.srt> <slug>
// Rozdělí titulky podle „Oddíl N.“ → public/audio-texty/<slug>.json + časy do src/data/audiobook-times/<slug>.ts
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const [src, slug = "adi-parva"] = process.argv.slice(2);
const raw = readFileSync(src, "utf8").replace(/\r/g, "");
const toSec = (s) => {
  const [h, m, rest] = s.split(":");
  const [sec, ms] = rest.split(",");
  return Math.round((+h * 3600 + +m * 60 + +sec + +ms / 1000) * 1000) / 1000;
};
const cues = [];
for (const block of raw.split(/\n\s*\n/)) {
  const lines = block.trim().split("\n");
  const ti = lines.findIndex((l) => l.includes("-->"));
  if (ti < 0) continue;
  const [a, b] = lines[ti].split("-->").map((x) => toSec(x.trim()));
  const text = lines.slice(ti + 1).join(" ").replace(/\s+/g, " ").trim();
  if (text) cues.push({ s: a, e: b, t: text });
}
const sections = [];
let cur = null;
for (const c of cues) {
  const m = /^Oddíl (\d+)\.$/.exec(c.t);
  if (m) {
    if (cur && sections.length === 0 && !cur.n) cur.n = +m[1];
    else {
      cur = { n: +m[1], cues: [] };
      sections.push(cur);
    }
  } else if (!cur) {
    cur = { n: 0, cues: [] };
    sections.push(cur);
  }
  cur.cues.push(c);
}
// úvod „Kniha počátků.“ patří k od. 1
if (sections[0]?.n === 0 && sections[1]?.n === 1) {
  sections[1].cues.unshift(...sections[0].cues);
  sections.shift();
}
const out = sections.map((sec) => {
  let prevEnd = null;
  const list = sec.cues.map((c, i) => {
    const prev = sec.cues[i - 1];
    const para = i === 0 || (prevEnd !== null && c.s - prevEnd > 0.8 && /[.!?“"»]$/.test(prev.t)) ? 1 : 0;
    prevEnd = c.e;
    return [c.s, c.e, c.t, para];
  });
  return { n: sec.n, startTime: list[0][0], endTime: list[list.length - 1][1], cues: list };
});
mkdirSync("public/audio-texty", { recursive: true });
writeFileSync(`public/audio-texty/${slug}.json`, JSON.stringify({ sections: out }));
mkdirSync("src/data/audiobook-times", { recursive: true });
const times = out.map((s) => `  ${s.n}: [${s.startTime}, ${s.endTime}],`).join("\n");
writeFileSync(
  `src/data/audiobook-times/${slug}.ts`,
  `// Vygenerováno scripts/build-audiobook-srt.mjs — číslo oddílu → [začátek, konec] v sekundách.\nexport const times: Record<number, [number, number]> = {\n${times}\n};\n`,
);
console.log(out.length, "oddílů", out[1]?.n, out[1]?.startTime, out.at(-1).endTime);
