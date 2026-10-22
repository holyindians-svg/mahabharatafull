/** Jeden sdílený přehrávač krátkých úryvků (věta z nahrávky) na stránkách entit. */
type Listener = (id: string | null) => void;
let audio: HTMLAudioElement | null = null;
let current: string | null = null;
let stopAt = Infinity;
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((l) => l(current));

function el() {
  if (!audio) {
    audio = new Audio();
    audio.preload = "none";
    audio.addEventListener("timeupdate", () => { if (audio && audio.currentTime >= stopAt) stopSnippet(); });
    audio.addEventListener("ended", stopSnippet);
    audio.addEventListener("error", stopSnippet);
  }
  return audio;
}

/** Volat synchronně v onClick (iOS user gesture). */
export function playSnippet(id: string, url: string, start: number, end: number) {
  window.speechSynthesis?.cancel();
  const a = el();
  if (a.src !== url) a.src = url;
  stopAt = end;
  a.currentTime = start;
  current = id;
  emit();
  a.play().catch(stopSnippet);
}

export function stopSnippet() {
  audio?.pause();
  current = null;
  stopAt = Infinity;
  emit();
}

export function onSnippet(l: Listener) {
  listeners.add(l);
  return () => { listeners.delete(l); };
}
