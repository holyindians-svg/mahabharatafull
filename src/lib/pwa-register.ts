/** Jediné místo, kde se registruje service worker (/sw.js) — jen v publikované aplikaci. */
function refused(): boolean {
  if (!import.meta.env.PROD) return true;
  try {
    if (window.self !== window.top) return true;
  } catch {
    return true;
  }
  const h = window.location.hostname;
  if (h.startsWith("id-preview--") || h.startsWith("preview--")) return true;
  const bad = ["lovableproject.com", "lovableproject-dev.com", "beta.lovable.dev"];
  if (bad.some((d) => h === d || h.endsWith(`.${d}`))) return true;
  if (new URLSearchParams(window.location.search).get("sw") === "off") return true;
  return false;
}

async function unregisterAppSw() {
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      regs
        .filter((r) => (r.active ?? r.installing ?? r.waiting)?.scriptURL.endsWith("/sw.js"))
        .map((r) => r.unregister()),
    );
  } catch {
    // nic
  }
}

export function registerPwa() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  if (refused()) {
    void unregisterAppSw();
    return;
  }
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
  if (document.readyState === "complete") {
    void navigator.serviceWorker.register("/sw.js").catch(() => {});
  }
}
