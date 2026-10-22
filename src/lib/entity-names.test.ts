import { describe, it } from "node:test";
import { deepStrictEqual as eq } from "node:assert/strict";
import { highlightSegments } from "./entity-names";

const marked = (t: string, names: string[]) => highlightSegments(t, names).filter((p) => p.entity).map((p) => p.text);

describe("highlightSegments", () => {
  it("označí skloňovaný tvar i velká písmena", () => {
    eq(marked("Dal to Ardžunovi a ARDŽUNA děkoval.", ["Ardžuna"]), ["Ardžunovi", "ARDŽUNA"]);
  });
  it("krátké jméno neoznačí delší slovo", () => {
    eq(marked("Bhímovi a bhímasénovský", ["Bhíma"]), ["Bhímovi"]);
  });
  it("text bez jmen je jeden neoznačený úsek", () => {
    eq(highlightSegments("Prostý text.", ["Ardžuna"]), [{ text: "Prostý text.", entity: false }]);
  });
});

describe("jen cílové jméno", () => {
  it("bez jména nic nesvítí", () => eq(marked("Ardžuna a Bhíma", []), []));
  it("svítí jen cíl, ne jiná jména", () => eq(marked("Ardžuna a Bhíma", ["Bhíma"]), ["Bhíma"]));
});
