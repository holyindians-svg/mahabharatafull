import { parvas } from "@/data/parvas";
import { characters, characterGroups } from "@/data/characters";
import { astras } from "@/data/astras";

/**
 * Sestaví textový korpus Mahábháraty z obsahu aplikace. Slouží jako zdroj,
 * do kterého se odesílají dotazy z vyhledávání a z prvků pod postavami.
 * Až bude nahrán plný text eposu, doplní se sem jako další sekce.
 */
export function buildCorpus(): string {
  const groupTitle = (id: string) =>
    characterGroups.find((g) => g.id === id)?.title ?? id;

  const parvaText = parvas
    .map(
      (p) =>
        `### ${p.order}. kniha — ${p.name} (${p.sanskrit})\n` +
        `Podtitul: ${p.subtitle}\n` +
        `Obsah: ${p.summary}\n` +
        `Události: ${p.events.join("; ")}\n` +
        `Odkaz v aplikaci: /knihy/${p.slug}`,
    )
    .join("\n\n");

  const characterText = characters
    .map(
      (c) =>
        `### ${c.name} (${c.sanskrit}) — ${c.epithet}\n` +
        `Skupina: ${groupTitle(c.group)}\n` +
        `Popis: ${c.description}\n` +
        `Vazby a role: ${c.relations.join("; ")}\n` +
        `Odkaz v aplikaci: /postavy/${c.slug}`,
    )
    .join("\n\n");

  const astraText = astras
    .map(
      (a) =>
        `### ${a.name} (${a.sanskrit}) — ${a.kind}\n` +
        `Božstvo: ${a.deity}\n` +
        `Držitelé: ${a.owners.join("; ")}\n` +
        `Účinek: ${a.effect}\n` +
        `Příběh: ${a.lore}\n` +
        `Odkaz v aplikaci: /astry/${a.slug}`,
    )
    .join("\n\n");

  return [
    "## KNIHY (PARVY)",
    parvaText,
    "## POSTAVY",
    characterText,
    "## ZBRANĚ A ARTEFAKTY (ASTRY)",
    astraText,
  ].join("\n\n");
}

export const SYSTEM_PROMPT = [
  "Jsi znalec indického eposu Mahábhárata a odpovídáš výhradně na základě přiloženého textu encyklopedie.",
  "Odpovídej vždy česky, plynulou spisovnou češtinou, jako rodilý mluvčí.",
  "Nikdy nepiš anglicky ani nemíchej jazyky; nepoužívej anglicismy — vždy uveď český výraz.",
  "Používej českou transkripci jmen (Ardžuna, Krišna, Judhišthira), ne anglický přepis.",
  "U jmen a pojmů uváděj v závorce originální sanskrtský název, pokud je v textu k dispozici.",
  "Pokud jsou přiloženy NALEZENÉ PASÁŽE Z ÁDI PARVY, vycházej přednostně z nich: vysvětli dotaz srozumitelně, shrň dění a smíš uvést jeden krátký přesný úryvek z pasáže v uvozovkách.",
  "Pokud pasáže dotaz nepokrývají nebo přiloženy nejsou, opři se o text encyklopedie.",
  "Drž se faktů z přiloženého textu. Pokud odpověď v textu není, řekni to krátce a nabídni, co text obsahuje.",
  "Neuváděj odkazy na soubory ani technické detaily. Nepoužívej nadpisy s mřížkami.",
  "Odpovídej stručně a věcně, obvykle dva až pět odstavců nebo krátký seznam.",
].join(" ");

/** Prompt pro předčítání: souvislý vyprávěcí text k jedné entitě. */
export const NARRATION_PROMPT = [
  "Jsi vypravěč indického eposu Mahábhárata.",
  "Na základě přiloženého textu encyklopedie napiš souvislé, plynulé předčítání k zadané položce.",
  "Piš výhradně česky, jako rodilý mluvčí, v epickém, ale srozumitelném tónu, bez nadpisů, bez odrážek a bez uvozovek.",
  "Nemíchej jazyky, nepoužívej anglická slova ani anglický přepis jmen; jména piš v české transkripci.",
  "U jmen uváděj v závorce sanskrtský název, pokud jej text zmiňuje.",
  "Text musí být vhodný k předčítání nahlas: celé věty, žádné zkratky ani technické poznámky.",
].join(" ");
