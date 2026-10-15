/** Nahrané audioknihy: jedna MP3 na knihu, oddíly jsou časové úseky v ní. */
import { times as adiTimes } from "./audiobook-times/adi-parva";

export interface AudioChapter {
  startTime: number;
  endTime: number;
}

export interface AudioBook {
  audioUrl: string;
  /** Číslo oddílu („Oddíl N“) → časový úsek v sekundách. */
  sections: Record<number, AudioChapter>;
  /** Titulky po oddílech (líně načítaný JSON z public/audio-texty). */
  cuesUrl?: string;
}

const toChapters = (t: Record<number, [number, number]>) =>
  Object.fromEntries(
    Object.entries(t).map(([n, [startTime, endTime]]) => [n, { startTime, endTime }]),
  ) as Record<number, AudioChapter>;

export const audiobooks: Record<string, AudioBook> = {
  "adi-parva": {
    audioUrl:
      "https://ckcnmvnjxziekezhzozh.supabase.co/storage/v1/object/public/audiobooks/MAHABHARATA/MB%201%20Kniha-pocatku.mp3",
    sections: toChapters(adiTimes),
    cuesUrl: "/audio-texty/adi-parva.json",
  },
};

export const audiobookFor = (slug: string): AudioBook | undefined => audiobooks[slug];

/** Titulek: [začátek, konec, text, nový odstavec 0/1]. */
export type Cue = [number, number, string, number];
const cueCache = new Map<string, Promise<Map<number, Cue[]>>>();
export function loadCues(url: string): Promise<Map<number, Cue[]>> {
  let p = cueCache.get(url);
  if (!p) {
    p = fetch(url)
      .then((r) => r.json() as Promise<{ sections: { n: number; cues: Cue[] }[] }>)
      .then((d) => new Map(d.sections.map((s) => [s.n, s.cues])));
    p.catch(() => cueCache.delete(url));
    cueCache.set(url, p);
  }
  return p;
}
