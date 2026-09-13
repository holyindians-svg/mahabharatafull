import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const BodySchema = z.object({
  /** Text k přečtení nahlas. */
  text: z.string().min(1).max(4000),
});

const MODEL = "openai/gpt-4o-mini-tts";

const INSTRUCTIONS =
  "Mluv česky, mužským vyprávěcím hlasem. Klidné, důstojné tempo epického vypravěče. " +
  "Sanskrtská jména vyslovuj zřetelně.";

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

        let upstream: Response;
        try {
          upstream = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: MODEL,
              input: body.text,
              voice: "onyx",
              instructions: INSTRUCTIONS,
              stream_format: "sse",
              response_format: "pcm",
            }),
            signal: request.signal,
          });
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
