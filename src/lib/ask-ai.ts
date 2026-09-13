export interface AskAiOptions {
  question: string;
  context?: string;
  mode?: "ask" | "narrate";
  signal?: AbortSignal;
  /** Volá se postupně s narůstajícím textem odpovědi. */
  onText: (text: string) => void;
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
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, context, mode }),
    signal,
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
  return text;
}
