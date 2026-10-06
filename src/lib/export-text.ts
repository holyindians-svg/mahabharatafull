import type { BookText } from "@/data/book-text";

/** Odstavce z vět v rozsahu [from, to] (podle paragraphIndex). */
export function paragraphsOf(book: BookText, from = 0, to = book.segments.length - 1): string[] {
  const out: string[] = [];
  let lastP = -1;
  for (let i = from; i <= to && i < book.segments.length; i++) {
    const s = book.segments[i];
    if (!s) continue;
    const p = book.paragraphIndex[i] ?? i;
    if (p !== lastP || !out.length) {
      out.push(s);
      lastP = p;
    } else {
      out[out.length - 1] += ` ${s}`;
    }
  }
  return out;
}

export function fileSafe(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function downloadTxt(name: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileSafe(name)}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Vytiskne jen daný text (A4) — v dialogu lze zvolit „Uložit jako PDF“. */
export function printText(title: string, paragraphs: string[]) {
  document.getElementById("print-root")?.remove();
  const root = document.createElement("div");
  root.id = "print-root";
  const h = document.createElement("h1");
  h.textContent = title;
  root.appendChild(h);
  for (const p of paragraphs) {
    const heading = /^(oddíl|sekce)\s+\d+$/i.test(p.trim());
    const el = document.createElement(heading ? "h2" : "p");
    el.textContent = p.replace(/^\((.+)\)$/, "$1");
    root.appendChild(el);
  }
  document.body.appendChild(root);
  document.body.classList.add("printing");
  const prevTitle = document.title;
  document.title = title;
  const cleanup = () => {
    document.body.classList.remove("printing");
    root.remove();
    document.title = prevTitle;
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);
  setTimeout(() => window.print(), 50);
}
