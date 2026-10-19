declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let activeId: string | null = null;

export function validId(id: string | null | undefined): string | null {
  const v = (id ?? "").trim();
  return /^G-[A-Z0-9]+$/i.test(v) && v !== "G-XXXXXXXXXX" ? v : null;
}

export function initAnalytics(id: string) {
  if (typeof window === "undefined" || activeId) return;
  activeId = id;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag("set", "developer_id.dZjgwMW", true);
  window.gtag("js", new Date());
  window.gtag("config", id, { send_page_view: false });
}

export function trackPageView(path: string) {
  if (!activeId || !window.gtag) return;
  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}
