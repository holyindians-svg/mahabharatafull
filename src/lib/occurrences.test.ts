import { describe, expect, it } from "bun:test";
import { matchesIn, nameMatcher } from "./occurrences";

const count = (name: string, text: string) => matchesIn(text, nameMatcher(name)).length;

describe("nameMatcher", () => {
  it("najde skloňované tvary Ardžuny", () => {
    expect(count("Ardžuna", "Ardžunovi dal luk a s Ardžunou šel Ardžuna.")).toBe(3);
  });
  it("nezávisí na velikosti písmen", () => {
    expect(count("Ardžuna", "ARDŽUNA přišel")).toBe(1);
  });
  it("krátké jméno Bhíma nenajde nesouvisející slova", () => {
    expect(count("Bhíma", "Bhímovi a Bhímou, ale ne bhímasénovský obrázek")).toBe(2);
  });
  it("vrací rozsah v původním textu", () => {
    const [m] = matchesIn("Král Ardžuna", nameMatcher("Ardžuna"));
    expect(m).toEqual([5, 12]);
  });
});
