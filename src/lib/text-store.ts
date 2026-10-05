/**
 * Chytrá synchronizace textů: knihy se ukládají do IndexedDB a ze serveru
 * se stahuje jen malý versions.json. Změněné knihy se dostahují na pozadí.
 */

export interface StoredBook {
  hash: string;
  paragraphs: string[];
}

type Versions = Record<string, { hash: string; sections: number }>;

const DB_NAME = "mahabharata-texty";
const STORE = "books";

function openDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

let dbPromise: Promise<IDBDatabase | null> | null = null;
const db = () => (dbPromise ??= openDb());

export async function getStoredBook(slug: string): Promise<StoredBook | null> {
  const d = await db();
  if (!d) return null;
  return new Promise((resolve) => {
    try {
      const req = d.transaction(STORE, "readonly").objectStore(STORE).get(slug);
      req.onsuccess = () => resolve((req.result as StoredBook | undefined) ?? null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function putStoredBook(slug: string, book: StoredBook): Promise<void> {
  const d = await db();
  if (!d) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = d.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(book, slug);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

let versionsPromise: Promise<Versions | null> | null = null;

async function fetchVersions(): Promise<Versions | null> {
  try {
    const res = await fetch(`/texty/versions.json?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as Versions;
  } catch {
    return null;
  }
}

/** Aktuální verze ze serveru (sdílené v rámci jedné synchronizace). */
export function currentVersions(): Promise<Versions | null> {
  return (versionsPromise ??= fetchVersions());
}

/** Stáhne knihu ze sítě a uloží ji. */
export async function downloadBook(slug: string, hash?: string): Promise<StoredBook | null> {
  try {
    const res = await fetch(`/texty/${slug}.json${hash ? `?h=${hash}` : ""}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { paragraphs?: string[] };
    if (!data.paragraphs?.length) return null;
    const book = { hash: hash ?? "", paragraphs: data.paragraphs };
    await putStoredBook(slug, book);
    return book;
  } catch {
    return null;
  }
}

const listeners = new Set<(slug: string) => void>();

export function onBookUpdated(fn: (slug: string) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

let syncing = false;

/** Porovná versions.json s uloženými knihami a dostáhne jen změněné. */
export async function syncBooks(): Promise<void> {
  if (syncing || typeof navigator === "undefined" || !navigator.onLine) return;
  syncing = true;
  try {
    versionsPromise = null;
    const versions = await currentVersions();
    if (!versions) return;
    for (const [slug, info] of Object.entries(versions)) {
      const stored = await getStoredBook(slug);
      if (!stored || stored.hash === info.hash) continue; // nestažené knihy se načtou až při otevření
      const fresh = await downloadBook(slug, info.hash);
      if (fresh) for (const fn of listeners) fn(slug);
    }
  } finally {
    syncing = false;
  }
}

export function startTextSync(): () => void {
  if (typeof document === "undefined") return () => {};
  const onVisible = () => {
    if (document.visibilityState === "visible") void syncBooks();
  };
  void syncBooks();
  document.addEventListener("visibilitychange", onVisible);
  window.addEventListener("online", onVisible);
  return () => {
    document.removeEventListener("visibilitychange", onVisible);
    window.removeEventListener("online", onVisible);
  };
}
