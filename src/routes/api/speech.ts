import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const BodySchema = z.object({
  /** Text k přečtení nahlas. */
  text: z.string().min(1).max(4000),
});

const GEMINI_MODEL = "google/gemini-2.5-pro-tts";
const FALLBACK_MODEL = "openai/gpt-4o-mini-tts";

/** Pokyn k výslovnosti — u Gemini se předává přímo v textu. */
const CZECH_DIRECTION =
  "Přečti následující text hlubokým, čistým mužským hlasem rodilého českého vypravěče. " +
  "Mluv souvisle, přirozeně a plynule, s nenucenou českou intonací, klidným důstojným tempem " +
  "a přirozenými pauzami pouze podle interpunkce. Nepoužívej velšský, anglický, ruský ani " +
  "ukrajinský přízvuk. Jednotlivé věty nesmí znít jako oddělená hlášení. " +
  "Jména čti v české podobě přesně tak, jak jsou napsaná. Text:";

const OPENAI_INSTRUCTIONS =
  "Use a deep, clean male narrator voice in fluent native Czech. Speak as one continuous " +
  "audiobook passage with natural Czech intonation, calm dignified pacing, and pauses only " +
  "where Czech punctuation requires them. Never use a Welsh, English, Russian, or Ukrainian " +
  "accent. Pronounce names exactly as written in Czech orthography.";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/audio/speech";

function geminiBody(text: string) {
  return {
    model: GEMINI_MODEL,
    stream_format: "sse",
    contents: [{ role: "user", parts: [{ text: `${CZECH_DIRECTION}\n\n${text}` }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: "Charon" } },
      },
    },
  };
}

function openaiBody(text: string) {
  return {
    model: FALLBACK_MODEL,
    input: text,
    voice: "onyx",
    instructions: OPENAI_INSTRUCTIONS,
    stream_format: "sse",
    response_format: "pcm",
  };
}

export const Route = createFileRoute("/api/speech")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return new Response("Hlasová služba není nastavená.", { status: 500 });
        }

        let body: z.infer<typeof BodySchema>;
        try {
          body = BodySchema.parse(await request.json());
        } catch {
          return new Response("Neplatný text.", { status: 400 });
        }

        const call = (payload: unknown) =>
          fetch(GATEWAY_URL, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            signal: request.signal,
          });

        let upstream: Response;
        try {
          upstream = await call(geminiBody(body.text));
          if (!upstream.ok || !upstream.body) {
            const detail = await upstream.text().catch(() => "");
            console.error("TTS gemini error", upstream.status, detail.slice(0, 300));
            // Jednorázový fallback, aby zvuk nikdy zcela nechyběl.
            if (upstream.status !== 402 && upstream.status !== 429) {
              upstream = await call(openaiBody(body.text));
            }
          }
        } catch (error) {
          if (request.signal.aborted) return new Response(null, { status: 499 });
          console.error("TTS fetch failed", error);
          return new Response("Hlas se nepodařilo získat.", { status: 502 });
        }

        if (!upstream.ok || !upstream.body) {
          const detail = await upstream.text().catch(() => "");
          console.error("TTS error", upstream.status, detail.slice(0, 500));
          const message =
            upstream.status === 429
              ? "Služba je momentálně přetížená. Zkuste to prosím za chvíli."
              : upstream.status === 402
                ? "Hlasový výstup vyžaduje doplnění kreditů."
                : upstream.status === 403
                  ? "Hlasový výstup není pro tento projekt povolený."
                  : "Hlas se nepodařilo získat.";
          const status = upstream.status === 429 ? 429 : upstream.status === 402 ? 402 : 502;
          return new Response(message, { status });
        }

        return new Response(upstream.body, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
