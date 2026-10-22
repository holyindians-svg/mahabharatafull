import { describe, it } from "node:test";
import { deepStrictEqual as eq } from "node:assert/strict";
import { highlightSegments } from "./entity-names";

const marked = (t: string, names: string[]) => highlightSegments(t, undefined, names).filter((p) => p.entity).map((p) => p.text);

describe("highlightSegments", () => {
  it("označí skloňovaný tvar i velká písmena", () => {
    eq(marked("Dal to Ardžunovi a ARDŽUNA děkoval.", ["Ardžuna"]), ["Ardžunovi", "ARDŽUNA"]);
  });
  it("krátké jméno neoznačí delší slovo", () => {
    eq(marked("Bhímovi a bhímasénovský", ["Bhíma"]), ["Bhímovi"]);
  });
  it("text bez jmen je jeden neoznačený úsek", () => {
    eq(highlightSegments("Prostý text.", undefined, ["Ardžuna"]), [{ text: "Prostý text.", entity: false }]);
  });
});
