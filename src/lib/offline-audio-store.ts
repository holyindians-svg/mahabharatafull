/** Volitelné offline uložení MP3 audioknih v Cache API (jen v prohlížeči). */
import { audiobooks } from "@/data/audiobooks";

export const OFFLINE_AUDIO_CACHE = "mhb-offline-audio-v1";
export const QUOTA_MESSAGE =
  "V zařízení není dost volného místa pro uložení této audioknihy. Uvolněte místo v telefonu nebo smažte jiné stažené knihy a zkuste to znovu.";
const GENERIC_MESSAGE = "Stažení se nepodařilo. Zkontrolujte připojení k internetu a zkuste to znovu.";

export type OfflineStatus = "not_downloaded" | "downloading" | "downloaded" | "error";
export interface OfflineEntry {
  status: OfflineStatus;
  progress: number; // 0–100
  sizeMb: number;
  error?: string | undefined;
}
export type OfflineState = Record<string, OfflineEntry>;

const MB = 1024 * 1024;
const toMb = (b: number) => Math.round((b / MB) * 10) / 10;
const extraSources = new Map<string, { audioUrl: string; extras: string[] }>();
const urlFor = (bookId: string) => audiobooks[bookId]?.audioUrl ?? extraSources.get(bookId)?.audioUrl;
const extrasFor = (bookId: string) => extraSources.get(bookId)?.extras ?? [];
const allIds = () => [...Object.keys(audiobooks), ...extraSources.keys()];
export const hasOfflineSource = (bookId: string) => !!urlFor(bookId);
/** Registers a non-book recording (e.g. an insight article) plus its companion files (subtitles). */
export function registerOfflineSource(id: string, audioUrl: string, extras: string[] = []) {
  const prev = extraSources.get(id);
  if (prev && prev.audioUrl === audioUrl && prev.extras.join() === extras.join()) return;
  extraSources.set(id, { audioUrl, extras });
  if (!hasCache()) return;
  void caches.open(OFFLINE_AUDIO_CACHE).then(async (cache) => {
    const res = await cache.match(audioUrl);
    if (res) set(id, { status: "downloaded", progress: 100, sizeMb: toMb(Number(res.headers.get("x-size") ?? 0)) });
  }).catch(() => {});
}
const empty: OfflineEntry = { status: "not_downloaded", progress: 0, sizeMb: 0 };

let state: OfflineState = {};
const listeners = new Set<() => void>();
const controllers = new Map<string, AbortController>();
const objectUrls = new Map<string, string>();

function set(bookId: string, patch: Partial<OfflineEntry>) {
  state = { ...state, [bookId]: { ...(state[bookId] ?? empty), ...patch } };
  listeners.forEach((l) => l());
}
export const subscribe = (l: () => void) => (listeners.add(l), () => listeners.delete(l));
export const getState = () => state;
export const entryFor = (bookId: string) => state[bookId] ?? empty;
export const totalOfflineMb = (s: OfflineState = state) =>
  Math.round(Object.values(s).reduce((a, e) => a + (e.status === "downloaded" ? e.sizeMb : 0), 0) * 10) / 10;

const hasCache = () => typeof caches !== "undefined";
const isQuota = (e: unknown) =>
  !!e && typeof e === "object" && ((e as { name?: string }).name === "QuotaExceededError" || (e as { code?: number }).code === 22);

let loaded: Promise<void> | null = null;
/** Načte stav stažených knih z cache (volat po hydrataci). */
export function loadOfflineState() {
  if (!hasCache()) return Promise.resolve();
  loaded ??= (async () => {
    const cache = await caches.open(OFFLINE_AUDIO_CACHE);
    for (const id of Object.keys(audiobooks)) {
      const res = await cache.match(urlFor(id)!);
      if (res) set(id, { status: "downloaded", progress: 100, sizeMb: toMb(Number(res.headers.get("x-size") ?? 0)) });
    }
  })().catch(() => {});
  return loaded;
}

export async function downloadOfflineAudio(bookId: string) {
  const url = urlFor(bookId);
  if (!url || !hasCache() || entryFor(bookId).status === "downloading") return;
  const ctrl = new AbortController();
  controllers.set(bookId, ctrl);
  set(bookId, { status: "downloading", progress: 0, error: undefined });
  const cache = await caches.open(OFFLINE_AUDIO_CACHE);
  try {
    await navigator.storage?.persist?.().catch(() => false);
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
    const total = Number(res.headers.get("content-length") ?? 0);
    set(bookId, { sizeMb: toMb(total) });
    const est = await navigator.storage?.estimate?.().catch(() => undefined);
    if (est?.quota && total && est.quota - (est.usage ?? 0) < total) {
      throw Object.assign(new Error("quota"), { name: "QuotaExceededError" });
    }
    let received = 0;
    const counter = new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, c) {
        received += chunk.byteLength;
        if (total) set(bookId, { progress: Math.min(99, Math.floor((received / total) * 100)) });
        c.enqueue(chunk);
      },
    });
    await cache.put(
      url,
      new Response(res.body.pipeThrough(counter), {
        headers: { "content-type": res.headers.get("content-type") ?? "audio/mpeg", "x-size": String(total || received) },
      }),
    );
    for (const extra of extrasFor(bookId)) {
      const r = await fetch(extra, { signal: ctrl.signal });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      await cache.put(extra, r);
    }
    set(bookId, { status: "downloaded", progress: 100, sizeMb: toMb(total || received) });
  } catch (e) {
    await cache.delete(url).catch(() => false);
    for (const extra of extrasFor(bookId)) await cache.delete(extra).catch(() => false);
    if (ctrl.signal.aborted) set(bookId, { ...empty });
    else set(bookId, { status: "error", progress: 0, error: isQuota(e) ? QUOTA_MESSAGE : GENERIC_MESSAGE });
  } finally {
    controllers.delete(bookId);
  }
}

export function cancelOfflineDownload(bookId: string) {
  controllers.get(bookId)?.abort();
}

export async function removeOfflineAudio(bookId: string) {
  cancelOfflineDownload(bookId);
  const url = urlFor(bookId);
  if (url && hasCache()) {
    const cache = await caches.open(OFFLINE_AUDIO_CACHE);
    await cache.delete(url);
    for (const extra of extrasFor(bookId)) await cache.delete(extra);
  }
  const obj = objectUrls.get(bookId);
  if (obj) URL.revokeObjectURL(obj);
  objectUrls.delete(bookId);
  set(bookId, { ...empty });
}

export async function clearAllOfflineAudio() {
  controllers.forEach((c) => c.abort());
  if (hasCache()) await caches.delete(OFFLINE_AUDIO_CACHE);
  objectUrls.forEach((u) => URL.revokeObjectURL(u));
  objectUrls.clear();
  for (const id of Object.keys(state)) set(id, { ...empty });
}

/** ObjectURL stažené nahrávky, nebo null (pak se streamuje online). */
export async function getOfflineAudioUrl(audioUrl: string): Promise<string | null> {
  if (!hasCache()) return null;
  const bookId = allIds().find((id) => urlFor(id) === audioUrl);
  if (!bookId) return null;
  const cached = objectUrls.get(bookId);
  if (cached) return cached;
  try {
    const res = await (await caches.open(OFFLINE_AUDIO_CACHE)).match(audioUrl);
    if (!res) return null;
    const obj = URL.createObjectURL(await res.blob());
    objectUrls.set(bookId, obj);
    return obj;
  } catch {
    return null;
  }
}
