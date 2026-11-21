import type { Cue } from "@/data/audiobooks";

const ts = (h: string, m: string, s: string, ms: string) => +h * 3600 + +m * 60 + +s + +ms / 1000;

/** Parses SRT text into cues [start, end, text, index] with millisecond precision. */
export function parseSrt(text: string): Cue[] {
  const out: Cue[] = [];
  for (const block of text.replace(/^\uFEFF/, "").replace(/\r/g, "").trim().split(/\n\s*\n/)) {
    const lines = block.split("\n");
    const i = lines.findIndex((l) => l.includes("-->"));
    if (i < 0) continue;
    const m = lines[i]!.match(/(\d+):(\d+):(\d+)[,.](\d+)\s*-->\s*(\d+):(\d+):(\d+)[,.](\d+)/);
    if (!m) continue;
    const body = lines.slice(i + 1).map((l) => l.trim()).filter(Boolean).join(" ");
    if (!body) continue;
    out.push([ts(m[1]!, m[2]!, m[3]!, m[4]!), ts(m[5]!, m[6]!, m[7]!, m[8]!), body, out.length]);
  }
  return out;
}
