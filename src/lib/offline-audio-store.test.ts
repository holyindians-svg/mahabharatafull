import { test, beforeEach } from "node:test";
import { strictEqual, ok } from "node:assert";

const stores = new Map<string, Map<string, Response>>();
const cacheOf = (n: string) => {
  if (!stores.has(n)) stores.set(n, new Map());
  const m = stores.get(n)!;
  return {
    match: async (u: string) => m.get(u)?.clone(),
    put: async (u: string, r: Response) => {
      if ((globalThis as { failQuota?: boolean }).failQuota) {
        await r.arrayBuffer();
        throw Object.assign(new Error("full"), { name: "QuotaExceededError" });
      }
      m.set(u, new Response(await r.arrayBuffer(), { headers: r.headers }));
    },
    delete: async (u: string) => m.delete(u),
  };
};
Object.assign(globalThis, {
  caches: { open: async (n: string) => cacheOf(n), delete: async (n: string) => stores.delete(n) },
});
const MB = 1024 * 1024;
globalThis.fetch = (async () =>
  new Response(new Uint8Array(3 * MB), { headers: { "content-length": String(3 * MB) } })) as typeof fetch;

const s = await import("./offline-audio-store");
const id = "adi-parva";

beforeEach(async () => {
  (globalThis as { failQuota?: boolean }).failQuota = false;
  await s.clearAllOfflineAudio();
});

test("download reaches 100 % and records size in MB", async () => {
  await s.downloadOfflineAudio(id);
  const e = s.entryFor(id);
  strictEqual(e.status, "downloaded");
  strictEqual(e.progress, 100);
  strictEqual(e.sizeMb, 3);
  strictEqual(s.totalOfflineMb(), 3);
});

test("QuotaExceededError ends in error with Czech message and no stored file", async () => {
  (globalThis as { failQuota?: boolean }).failQuota = true;
  await s.downloadOfflineAudio(id);
  const e = s.entryFor(id);
  strictEqual(e.status, "error");
  ok(e.error?.includes("není dost volného místa"));
  strictEqual(s.totalOfflineMb(), 0);
});

test("remove and clear free the space", async () => {
  await s.downloadOfflineAudio(id);
  await s.removeOfflineAudio(id);
  strictEqual(s.entryFor(id).status, "not_downloaded");
  strictEqual(s.totalOfflineMb(), 0);
  await s.downloadOfflineAudio(id);
  await s.clearAllOfflineAudio();
  strictEqual(s.totalOfflineMb(), 0);
});
