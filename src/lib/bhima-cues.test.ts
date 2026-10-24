import { test } from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";

test("Bhímaséna: titulky mají 23 bloků a končí v 134,788 s", () => {
  const d = JSON.parse(readFileSync("public/audio-texty/bhima.json", "utf8"));
  const cues = d.sections[0].cues;
  assert.equal(cues.length, 23);
  assert.equal(cues.at(-1)[1], 134.788);
  assert.ok(!cues.some((c: [number, number, string]) => c[2].includes("*")));
});
