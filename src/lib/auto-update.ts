/**
 * Nainstalovaná aplikace (hlavně na telefonu) se po návratu z pozadí jen
 * „probudí“ a zůstane na staré verzi. Proto při každém otevření/návratu
 * zjistíme, zda server nemá novější verzi, a pokud ano, stránku obnovíme.
 */
async function fetchFingerprint(): Promise<string | null> {
  try {
    const res = await fetch(`/?_v=${Date.now()}`, {
      cache: "no-store",
      headers: { "cache-control": "no-cache" },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const assets = html.match(/\/assets\/[^"'\s>]+/g);
    return assets ? Array.from(new Set(assets)).sort().join("|") : null;
  } catch {
    return null;
  }
}

export function startAutoUpdate() {
  if (typeof window === "undefined") return () => {};
  let baseline: string | null = null;
  let checking = false;

  const check = async () => {
    if (checking || !navigator.onLine) return;
    checking = true;
    const current = await fetchFingerprint();
    checking = false;
    if (!current) return;
    if (baseline === null) baseline = current;
    else if (current !== baseline) window.location.reload();
  };

  const onVisible = () => {
    if (document.visibilityState === "visible") void check();
  };
  const onPageShow = (e: PageTransitionEvent) => {
    // Stránka obnovená ze „zmrazené“ paměti telefonu — vždy načíst znovu.
    if (e.persisted) window.location.reload();
    else void check();
  };

  void check();
  document.addEventListener("visibilitychange", onVisible);
  window.addEventListener("focus", onVisible);
  window.addEventListener("online", onVisible);
  window.addEventListener("pageshow", onPageShow);
  return () => {
    document.removeEventListener("visibilitychange", onVisible);
    window.removeEventListener("focus", onVisible);
    window.removeEventListener("online", onVisible);
    window.removeEventListener("pageshow", onPageShow);
  };
}
