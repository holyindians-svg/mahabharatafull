/** Přesný čas běžící MP3 (publikovaný každý snímek), aby karaoke nečekalo na timeupdate. */
type L = () => void;
let now = -1;
const ls = new Set<L>();
export const clockGet = () => now;
export function clockPublish(t: number) {
  if (t === now) return;
  now = t;
  ls.forEach((l) => l());
}
export function clockSubscribe(l: L) {
  ls.add(l);
  return () => { ls.delete(l); };
}
