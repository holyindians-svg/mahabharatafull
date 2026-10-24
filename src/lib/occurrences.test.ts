import { describe, it } from "node:test";
import { deepStrictEqual as eq } from "node:assert/strict";
import { matchesIn, nameMatcher } from "./occurrences";

const count = (name: string, text: string) => matchesIn(text, nameMatcher(name)).length;

describe("nameMatcher", () => {
  it("najde skloňované tvary Ardžuny", () => {
    eq(count("Ardžuna", "Ardžunovi dal luk a s Ardžunou šel Ardžuna."), 3);
  });
  it("nezávisí na velikosti písmen", () => {
    eq(count("Ardžuna", "ARDŽUNA přišel"), 1);
  });
  it("krátké jméno Bhíma nenajde nesouvisející slova", () => {
    eq(count("Bhíma", "Bhímovi a Bhímou, ale ne bhímasénovský obrázek"), 2);
  });
  it("vrací rozsah v původním textu", () => {
    const [m] = matchesIn("Král Ardžuna", nameMatcher("Ardžuna"));
    eq(m, [5, 12]);
  });
});

describe("namesMatcher (Bhímova Gadá)", () => {
  it("najde palcátem i Bhímasénovi", async () => {
    const { namesMatcher } = await import("./occurrences");
    const re = namesMatcher(["Bhíma", "Bhímaséna", "Gadá", "palcát"]);
    eq(matchesIn("Udeřil palcátem a Bhímasénovi se poklonili.", re).length, 2);
  });
});
