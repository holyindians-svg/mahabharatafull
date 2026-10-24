export type CharacterGroupId =
  | "predci"
  | "ucitele"
  | "mudrci"
  | "panduovci"
  | "kauravove"
  | "bozske";

export interface CharacterGroup {
  id: CharacterGroupId;
  title: string;
  description: string;
}

export interface Character {
  slug: string;
  name: string;
  sanskrit: string;
  epithet: string;
  group: CharacterGroupId;
  description: string;
  relations: string[];
  image: string;
  audioMinutes: number;
  video?: string;
  storyTitle?: string;
  audioUrl?: string;
  cuesUrl?: string;
  keywords?: string[];
}

export interface Parva {
  slug: string;
  order: number;
  name: string;
  sanskrit: string;
  subtitle: string;
  summary: string;
  events: string[];
  characterSlugs: string[];
  image: string;
  audioMinutes: number;
}

export interface Astra {
  slug: string;
  name: string;
  sanskrit: string;
  deity: string;
  owners: string[];
  kind: string;
  effect: string;
  lore: string;
  power: number;
  image: string;
  audioMinutes: number;
  video?: string;
  storyTitle?: string;
  story?: string[];
  /** Namluvené vyprávění (MP3) a titulky pro karaoke. */
  audioUrl?: string;
  cuesUrl?: string;
  /** Klíčová slova pro výskyty v textu (výchozí: jméno). */
  keywords?: string[];
}
