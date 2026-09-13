/**
 * Atmosférické fotografie z Unsplash.
 * Data jsou schválně oddělená od obrazovek – při napojení na databázi
 * se pouze vymění zdroj dat, komponenty zůstanou beze změny.
 */
const IDS = [
  "photo-1548013146-72479768bada",
  "photo-1564507592333-c60657eea523",
  "photo-1524492412937-b28074a5d7da",
  "photo-1585506942812-e72b29cef752",
  "photo-1533000971552-6a962ff0b9f9",
  "photo-1519681393784-d120267933ba",
  "photo-1506905925346-21bda4d32df4",
  "photo-1470071459604-3b5ec3a7fe05",
  "photo-1465101162946-4377e57745c3",
  "photo-1517824806704-9040b037703b",
  "photo-1516026672322-bc52d61a55d5",
  "photo-1561361058-c24cecae35ca",
  "photo-1477587458883-47145ed94245",
] as const;

/** Deterministický obrázek podle klíče – stejný záznam má vždy stejný obrázek. */
export function imageFor(key: string, width = 900, height = 700): string {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) % 100000;
  const id = IDS[hash % IDS.length];
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&h=${height}&q=80`;
}

export const HERO_IMAGE = `https://images.unsplash.com/${IDS[0]}?auto=format&fit=crop&w=1920&h=1080&q=85`;
