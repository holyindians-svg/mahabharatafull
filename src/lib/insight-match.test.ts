import { test } from "node:test";
import assert from "node:assert";
import { buildInsightMatcher, splitInsights } from "./insight-match.ts";

const m = buildInsightMatcher([
  { slug: "maso", keywords: ["maso", "masa", "masem", "zvěřin"] },
  { slug: "pariksit", keywords: ["Paríkšit", "Takšak"] },
]);

test("skloňované tvary se najdou bez ohledu na velikost písmen", () => {
  const parts = splitInsights("Podávali ZVĚŘINU a král Paríkšitovi", m, new Set());
  assert.deepStrictEqual(parts.filter((p) => p.slug).map((p) => p.text), ["ZVĚŘINU", "Paríkšitovi"]);
});

test("stejný článek nejvýš jednou na odstavec", () => {
  const used = new Set<string>();
  const a = splitInsights("maso a masem", m, used);
  const b = splitInsights("další masa", m, used);
  assert.strictEqual(a.filter((p) => p.slug).length, 1);
  assert.strictEqual(b.filter((p) => p.slug).length, 0);
});

test("uprostřed slova se neshoduje", () => {
  assert.strictEqual(splitInsights("pomasovat", m, new Set()).filter((p) => p.slug).length, 0);
});
