import { createContext, useContext, useState, type ReactNode, type KeyboardEvent, type MouseEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { Sparkles } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { insightsQuery, useInsightMatcher } from "@/lib/insights";
import { splitInsights, type InsightPart } from "@/lib/insight-match";

const OpenCtx = createContext<(slug: string) => void>(() => {});

export function InsightProvider({ children }: { children: ReactNode }) {
  const [slug, setSlug] = useState<string | null>(null);
  const { data } = useQuery(insightsQuery());
  const insight = data?.find((i) => i.slug === slug);
  const intro = insight?.content.split(/\n\s*\n/).slice(0, 2).join("\n\n");
  return (
    <OpenCtx.Provider value={setSlug}>
      {children}
      <Sheet open={!!insight} onOpenChange={(o) => { if (!o) setSlug(null); }}>
        <SheetContent className="w-full overflow-y-auto border-amber-400/40 sm:max-w-md">
          {insight ? (
            <>
              <SheetHeader>
                <p className="text-xs uppercase tracking-[0.22em] text-primary">Zajímavosti a pochopení</p>
                <SheetTitle className="font-display text-xl leading-snug">{insight.title}</SheetTitle>
                <SheetDescription>{insight.short_summary}</SheetDescription>
              </SheetHeader>
              <div className="insight-prose mt-4 px-4 text-[15px]"><ReactMarkdown>{intro ?? ""}</ReactMarkdown></div>
              <div className="p-4">
                <Button asChild className="press min-h-11 w-full" onClick={() => setSlug(null)}>
                  <Link to="/zajimavosti/$slug" params={{ slug: insight.slug }}>
                    <Sparkles /> Přejít do sekce Zajímavosti a pochopení
                  </Link>
                </Button>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </OpenCtx.Provider>
  );
}

const stop = (e: MouseEvent | KeyboardEvent) => { e.stopPropagation(); };

/** One paragraph: each article linked at most once. */
export function InsightText({ text }: { text: string }) {
  const matcher = useInsightMatcher();
  return <InsightParts parts={splitInsights(text, matcher, new Set())} />;
}

/** Renders pre-split parts; callers create the per-paragraph `used` set inside render (StrictMode-safe). */
export function InsightParts({ parts }: { parts: InsightPart[] }) {
  const open = useContext(OpenCtx);
  if (parts.length === 1 && !parts[0]?.slug) return <>{parts[0]?.text}</>;
  return (
    <>
      {parts.map((p, i) => p.slug ? (
        <span key={i} role="button" tabIndex={0}
          onPointerDown={stop}
          onClick={(e) => { e.preventDefault(); stop(e); open(p.slug!); }}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); stop(e); open(p.slug!); } }}
          className="cursor-help underline decoration-amber-400/70 decoration-dotted underline-offset-4 hover:decoration-amber-400"
        >{p.text}<sup aria-hidden className="ml-0.5 text-[0.7em] text-amber-400">ⓘ</sup></span>
      ) : p.text)}
    </>
  );
}
