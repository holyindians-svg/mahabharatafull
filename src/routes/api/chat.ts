import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  NARRATION_PROMPT,
  SYSTEM_PROMPT,
  buildCorpus,
} from "@/lib/mahabharata-context.server";
import { findEposPassages } from "@/lib/epos-search.server";

const BodySchema = z.object({
  /** Dotaz uživatele, nebo název položky pro předčítání. */
  question: z.string().min(1).max(2000),
  /** Volitelný kontext (postava / kniha / zbraň), ke které se dotaz vztahuje. */
  context: z.string().max(2000).optional(),
  /** "ask" = odpověď na dotaz, "narrate" = souvislé předčítání. */
  mode: z.enum(["ask", "narrate"]).default("ask"),
});

const MODEL = "gemini-2.5-flash";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["GOOGLE_API_KEY"];
        if (!apiKey) {
          return new Response("Chybí přístupový klíč ke službě.", { status: 500 });
        }

        let body: z.infer<typeof BodySchema>;
        try {
          body = BodySchema.parse(await request.json());
        } catch {
          return new Response("Neplatný dotaz.", { status: 400 });
        }

        const system = body.mode === "narrate" ? NARRATION_PROMPT : SYSTEM_PROMPT;

        // U dotazů prohledáme plný text eposu (knihy 1–18) a pasáže přiložíme.
        let passages = "";
        if (body.mode === "ask") {
          passages = await findEposPassages(
            body.context ? `${body.question} ${body.context}` : body.question,
            new URL(request.url).origin,
          );
        }

        const userParts = [
          passages
            ? `NALEZENÉ PASÁŽE Z PLNÉHO TEXTU MAHÁBHÁRATY (u každého bloku je uvedena kniha):\n${passages}`
            : "",
          "TEXT ENCYKLOPEDIE MAHÁBHÁRATY:",
          buildCorpus(),
          body.context ? `AKTUÁLNĚ ZOBRAZENÁ POLOŽKA:\n${body.context}` : "",
          body.mode === "narrate"
            ? `NAPIŠ PŘEDČÍTÁNÍ K: ${body.question}`
            : `DOTAZ: ${body.question}`,
        ]
          .filter(Boolean)
          .join("\n\n");

        let upstream: Response;
        try {
          upstream = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": apiKey,
              },
              body: JSON.stringify({
                systemInstruction: { parts: [{ text: system }] },
                contents: [{ role: "user", parts: [{ text: userParts }] }],
                generationConfig: {
                  temperature: 0.6,
                  maxOutputTokens: body.mode === "narrate" ? 1600 : 900,
                },
              }),
              signal: request.signal,
            },
          );
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") {
            return new Response(null, { status: 499 });
          }
          return new Response("Službu se nepodařilo oslovit.", { status: 502 });
        }

        if (!upstream.ok || !upstream.body) {
          const detail = await upstream.text().catch(() => "");
          console.error("Google API error", upstream.status, detail.slice(0, 500));
          const message =
            upstream.status === 429
              ? "Služba je momentálně přetížená. Zkuste to prosím za chvíli."
              : upstream.status === 400 || upstream.status === 403
                ? "Přístupový klíč ke službě není platný nebo nemá oprávnění."
                : "Odpověď se nepodařilo získat.";
          return new Response(message, { status: upstream.status === 429 ? 429 : 502 });
        }

        // Převedeme SSE z Gemini na čistý proud textu.
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        const reader = upstream.body.getReader();
        let buffer = "";

        const stream = new ReadableStream<Uint8Array>({
          async pull(controller) {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                controller.close();
                return;
              }
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() ?? "";
              let out = "";
              for (const line of lines) {
                if (!line.startsWith("data:")) continue;
                const payload = line.slice(5).trim();
                if (!payload || payload === "[DONE]") continue;
                try {
                  const json = JSON.parse(payload) as {
                    candidates?: { content?: { parts?: { text?: string }[] } }[];
                  };
                  for (const part of json.candidates?.[0]?.content?.parts ?? []) {
                    if (part.text) out += part.text;
                  }
                } catch {
                  // nekompletní úsek — ignorujeme
                }
              }
              if (out) {
                controller.enqueue(encoder.encode(out));
                return;
              }
            }
          },
          cancel(reason) {
            return reader.cancel(reason);
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
