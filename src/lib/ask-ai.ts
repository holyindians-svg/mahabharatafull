export interface AskAiOptions {
  question: string;
  context?: string | undefined;
  mode?: "ask" | "narrate" | undefined;
  signal?: AbortSignal | undefined;
  /** Volá se postupně s narůstajícím textem odpovědi. */
  onText: (text: string) => void;
}

/** Krátkodobá paměť odpovědí, aby se stejný dotaz neposílal dvakrát. */
const memory = new Map<string, string>();

function cacheKey(mode: string, question: string, context?: string) {
  return `mahabharata-ai:${mode}:${context ?? ""}:${question}`;
}

function readCache(key: string): string | null {
  const local = memory.get(key);
  if (local) return local;
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeCache(key: string, value: string) {
  memory.set(key, value);
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* paměť prohlížeče není k dispozici */
  }
}

/**
 * Odešle dotaz do textu Mahábháraty a streamuje odpověď.
 * Vyhazuje chybu s uživatelskou zprávou, pokud se to nepovede.
 */
export async function askAi({
  question,
  context,
  mode = "ask",
  signal,
  onText,
}: AskAiOptions): Promise<string> {
  const key = cacheKey(mode, question, context);
  const cached = readCache(key);
  if (cached) {
    onText(cached);
    return cached;
  }

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, context, mode }),
    signal: signal ?? null,
  });

  if (!response.ok || !response.body) {
    const message = await response.text().catch(() => "");
    throw new Error(message.trim() || "Odpověď se nepodařilo získat.");
  }


  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
    onText(text);
  }
  if (text.trim()) writeCache(key, text);
  return text;
}

