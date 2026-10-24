import { test } from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";

test("Bhímova Gadá: titulky mají 23 bloků a končí v 131,094 s", () => {
  const d = JSON.parse(readFileSync("public/audio-texty/bhimova-gada.json", "utf8"));
  const cues = d.sections[0].cues;
  assert.equal(d.sections[0].n, 1);
  assert.equal(cues.length, 23);
  assert.equal(cues.at(-1)[1], 131.094);
  assert.ok(!cues.some((c: [number, number, string]) => c[2].includes("*")));
});
