import type {} from "./analytics";

export const QUEUE_KEY = "mhb_offline_ga_queue";
export const QUEUE_LIMIT = 200;
type Queued = { name: string; params: Record<string, unknown>; timestamp_ms: number };

const hasWindow = () => typeof window !== "undefined";
const canSend = () => hasWindow() && navigator.onLine !== false && typeof window.gtag === "function";

function read(): Queued[] {
  try {
    const v = JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
function write(q: Queued[]) {
  try {
    if (q.length) localStorage.setItem(QUEUE_KEY, JSON.stringify(q.slice(-QUEUE_LIMIT)));
    else localStorage.removeItem(QUEUE_KEY);
  } catch {
    // úložiště nedostupné
  }
}

/** Single entry point for every GA event; queues while offline or before gtag loads. */
export function sendEvent(name: string, params: Record<string, unknown> = {}) {
  if (!hasWindow()) return;
  if (canSend()) {
    flushQueue();
    window.gtag!("event", name, params);
    return;
  }
  write([...read(), { name, params, timestamp_ms: Date.now() }]);
}

let flushing = false;
export function flushQueue() {
  if (flushing || !canSend()) return;
  flushing = true;
  try {
    const q = read();
    if (!q.length) return;
    write([]);
    for (const e of q) {
      window.gtag!("event", e.name, { ...e.params, offline_recorded: true, offline_timestamp: e.timestamp_ms });
    }
  } finally {
    flushing = false;
  }
}

let started = false;
export function startOfflineQueue() {
  if (!hasWindow() || started) return;
  started = true;
  flushQueue();
  window.addEventListener("online", flushQueue);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") flushQueue();
  });
}
