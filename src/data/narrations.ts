import { characterGroups, characters, getCharacter } from "./characters";
import { parvas } from "./parvas";
import { astras } from "./astras";

/**
 * Statická (trvalá) zásoba předčítaných textů a odpovědí.
 * Texty se skládají výhradně z obsahu, který aplikace už má v sobě —
 * žádné síťové volání, žádný API klíč, vždy stejný výsledek.
 */

const groupTitle = (id: string) => characterGroups.find((g) => g.id === id)?.title ?? id;

const list = (items: string[]) => {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} a ${items[items.length - 1]}`;
};

function characterNarration(slug: string): string | null {
  const c = getCharacter(slug);
  if (!c) return null;
  const relatedParvas = parvas.filter((p) => p.characterSlugs.includes(c.slug));
  const relatedAstras = astras.filter((a) => a.owners.includes(c.name));

  const paragraphs: string[] = [];
  paragraphs.push(
    `${c.name} (${c.sanskrit}), zvaný ${c.epithet.toLowerCase()}, patří do skupiny ${groupTitle(
      c.group,
    ).toLowerCase()}. ${c.description}`,
  );
  paragraphs.push(
    `Jeho místo v příběhu určují především tyto vazby: ${list(c.relations)}. Právě z nich vyrůstá vše, co ${c.name} v eposu koná, i to, čemu se nedokáže vyhnout.`,
  );
  if (relatedAstras.length) {
    paragraphs.push(
      relatedAstras
        .map((a) => `${a.name} (${a.sanskrit}), ${a.kind.toLowerCase()} spojený s božstvem ${a.deity}: ${a.effect}`)
        .join(" "),
    );
  }
  if (relatedParvas.length) {
    paragraphs.push(
      `V eposu vystupuje v těchto knihách: ${list(
        relatedParvas.map((p) => `${p.order}. kniha ${p.name} — ${p.subtitle.toLowerCase()}`),
      )}.`,
    );
    const first = relatedParvas[0]!;
    paragraphs.push(`${first.summary}`);
  }
  return paragraphs.join("\n\n");
}

function parvaNarration(slug: string): string | null {
  const p = parvas.find((x) => x.slug === slug);
  if (!p) return null;
  const people = p.characterSlugs
    .map((s) => getCharacter(s))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  const paragraphs = [
    `${p.order}. kniha Mahábháraty, ${p.name} (${p.sanskrit}) — ${p.subtitle}.`,
    p.summary,
    `Nejdůležitější události: ${p.events.join(". ")}.`,
  ];
  if (people.length) {
    paragraphs.push(
      `Vystupují zde zejména: ${list(people.map((c) => `${c.name} (${c.epithet.toLowerCase()})`))}.`,
    );
  }
  return paragraphs.join("\n\n");
}

function astraNarration(slug: string): string | null {
  const a = astras.find((x) => x.slug === slug);
  if (!a) return null;
  return [
    `${a.name} (${a.sanskrit}) je ${a.kind.toLowerCase()} náležející božstvu ${a.deity}.`,
    `Účinek: ${a.effect}`,
    a.lore,
    a.owners.length
      ? `Zbraň drželi nebo ovládali: ${list(a.owners)}. Její síla se v eposu hodnotí stupněm ${a.power} z deseti.`
      : `Její síla se v eposu hodnotí stupněm ${a.power} z deseti.`,
    ...(a.story ? [a.storyTitle ?? "", ...a.story] : []),
  ].filter(Boolean).join("\n\n");
}

export type NarrationKind = "character" | "parva" | "astra";

/** Hotový text předčítání pro danou položku, nebo null (pak se použije dotaz do textu). */
export function narrationFor(kind: NarrationKind, slug: string): string | null {
  if (kind === "character") return characterNarration(slug);
  if (kind === "parva") return parvaNarration(slug);
  return astraNarration(slug);
}

/** Hotová odpověď na klikací vazbu pod postavou. */
export function relationAnswers(slug: string): Record<string, string> {
  const c = getCharacter(slug);
  if (!c) return {};
  const out: Record<string, string> = {};
  for (const r of c.relations) {
    const others = characters.filter(
      (o) => o.slug !== c.slug && new RegExp(o.name, "i").test(r),
    );
    const paragraphs = [
      `${r} — tato vazba patří k postavě ${c.name} (${c.sanskrit}), kterou epos nazývá ${c.epithet.toLowerCase()}.`,
      c.description,
    ];
    for (const o of others) {
      paragraphs.push(`${o.name} (${o.sanskrit}) — ${o.epithet}. ${o.description}`);
    }
    if (!others.length) {
      paragraphs.push(
        `Ostatní role a vazby téže postavy: ${list(c.relations.filter((x) => x !== r))}.`,
      );
    }
    out[r] = paragraphs.filter(Boolean).join("\n\n");
  }
  return out;
}

/** Uložená odpověď pro dotaz z vyhledávání, pokud dotaz míří na známou položku. */
export function storedAnswerForQuery(query: string): string | null {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  const q = norm(query);
  if (q.length < 3) return null;

  const exact = <T extends { name: string; sanskrit: string; slug: string }>(items: T[]) =>
    items.find((i) => norm(i.name) === q || norm(i.sanskrit) === q);

  const c = exact(characters);
  if (c) return characterNarration(c.slug);
  const a = exact(astras);
  if (a) return astraNarration(a.slug);
  const p = exact(parvas);
  if (p) return parvaNarration(p.slug);
  return null;
}
