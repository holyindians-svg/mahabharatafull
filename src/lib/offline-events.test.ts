import { test } from "node:test";
import { deepStrictEqual, strictEqual } from "node:assert";

const store = new Map<string, string>();
const listeners: Record<string, (() => void)[]> = {};
const sent: unknown[][] = [];
const nav = { onLine: false };
Object.assign(globalThis, {
  localStorage: {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => store.set(k, v),
    removeItem: (k: string) => store.delete(k),
  },
  document: { visibilityState: "visible", addEventListener: () => {} },
  window: { gtag: (...a: unknown[]) => sent.push(a), addEventListener: (n: string, f: () => void) => (listeners[n] ??= []).push(f) },
});
Object.defineProperty(globalThis, "navigator", { value: nav, configurable: true });

const { sendEvent, startOfflineQueue, QUEUE_KEY } = await import("./offline-events");

test("offline event is stored, not sent", () => {
  sendEvent("audio_play", { audio_title: "Kniha počátku" });
  strictEqual(sent.length, 0);
  const q = JSON.parse(store.get(QUEUE_KEY)!);
  strictEqual(q[0].name, "audio_play");
  strictEqual(typeof q[0].timestamp_ms, "number");
});

test("queue keeps only the last 200 events", () => {
  for (let i = 0; i < 250; i++) sendEvent("page_view", { i });
  const q = JSON.parse(store.get(QUEUE_KEY)!);
  strictEqual(q.length, 200);
  deepStrictEqual(q.at(-1).params, { i: 249 });
});

test("going online sends the queue with offline markers and clears it", () => {
  store.set(QUEUE_KEY, JSON.stringify([{ name: "audio_complete", params: { audio_title: "X" }, timestamp_ms: 123 }]));
  startOfflineQueue();
  strictEqual(sent.length, 0);
  nav.onLine = true;
  listeners["online"]!.forEach((f) => f());
  deepStrictEqual(sent, [["event", "audio_complete", { audio_title: "X", offline_recorded: true, offline_timestamp: 123 }]]);
  strictEqual(store.has(QUEUE_KEY), false);
});
