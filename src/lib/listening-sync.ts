export const LISTENING_ENDPOINT =
  "https://id-preview--01f7a48d-5fe5-48e1-9bfb-6249d113bcdf.lovable.app/api/public/listening";

export type ListeningStatus = "playing" | "paused" | "completed";
export interface ListeningPayload {
  book_title: string;
  listened_seconds: number;
  total_seconds: number;
  status: ListeningStatus;
  chapter: string;
}

type Send = (p: ListeningPayload) => void;

const defaultSend: Send = (p) => {
  try {
    void fetch(LISTENING_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // druhá aplikace nedostupná
  }
};

/** Průběžné odesílání nejvýš 1× za intervalMs; změny stavu se odešlou hned. */
export function createListeningSync(send: Send = defaultSend, intervalMs = 60_000) {
  let last = -Infinity;
  return {
    event(p: ListeningPayload, now: number) {
      last = now;
      send(p);
    },
    progress(p: ListeningPayload, now: number) {
      if (now - last < intervalMs) return false;
      last = now;
      send(p);
      return true;
    },
  };
}
