export const LISTENING_ENDPOINT =
  "https://project--01f7a48d-5fe5-48e1-9bfb-6249d113bcdf-dev.lovable.app/api/public/listening";

export type ListeningStatus = "playing" | "paused";
export interface ListeningPayload {
  book_title: string;
  listened_seconds: number;
  total_seconds: number | null;
  status: ListeningStatus;
  chapter: string;
}

type Send = (p: ListeningPayload) => void;

let deviceSessionId: string | undefined;

/** Read browser storage lazily so importing this module remains SSR-safe. */
export function getListeningSessionId(
  storage: Pick<Storage, "getItem" | "setItem">,
  makeId: () => string = () => `sess_${crypto.randomUUID()}`,
): string {
  try {
    const existing = storage.getItem("audiobook_session_id");
    if (existing) return existing;
  } catch {
    // Storage may be disabled; retain an in-memory ID instead.
  }
  const id = makeId();
  try {
    storage.setItem("audiobook_session_id", id);
  } catch {
    // Playback must work even when storage is unavailable.
  }
  return id;
}

const defaultSend: Send = (p) => {
  try {
    if (!deviceSessionId) {
      try {
        deviceSessionId = getListeningSessionId(window.localStorage);
      } catch {
        deviceSessionId = `sess_${crypto.randomUUID()}`;
      }
    }
    void fetch(LISTENING_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...p, session_id: deviceSessionId }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // druhá aplikace nedostupná
  }
};

/** Průběžné odesílání nejvýš 1× za intervalMs; změny stavu se odešlou hned. */
export function createListeningSync(send: Send = defaultSend, intervalMs = 10_000) {
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
