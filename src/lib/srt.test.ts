import { test } from "node:test";
import assert from "node:assert";
import { parseSrt } from "./srt.ts";

test("parses ms times and joins multi-line cues", () => {
  const c = parseSrt("1\n00:00:00,000 --> 00:00:06,176\nRadek a\ndruhý\n\n2\n01:02:03,500 --> 01:02:04,000\nKonec\n");
  assert.strictEqual(c.length, 2);
  assert.deepStrictEqual(c[0], [0, 6.176, "Radek a druhý", 0]);
  assert.strictEqual(c[1]?.[0], 3723.5);
});
