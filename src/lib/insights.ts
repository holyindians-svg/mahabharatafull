import { queryOptions, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { buildInsightMatcher } from "@/lib/insight-match";

export interface Insight {
  id: string; slug: string; title: string; short_summary: string; content: string;
  keywords: string[]; audio_url: string | null; srt_url: string | null; cues_url: string | null;
  sort_order: number; created_at: string;
}

export const insightsQuery = () => queryOptions({
  queryKey: ["insights"],
  queryFn: async (): Promise<Insight[]> => {
    const { data, error } = await supabase.from("insights").select("*").order("sort_order").order("created_at");
    if (error) throw error;
    return data ?? [];
  },
  staleTime: 30 * 60_000,
  retry: 1,
});

/** Non-blocking: text renders plainly until articles load (or offline). */
export function useInsightMatcher() {
  const { data } = useQuery(insightsQuery());
  return useMemo(() => buildInsightMatcher(data ?? []), [data]);
}

/** Subtitle source: SRT from the row, legacy JSON cues as fallback. */
export const insightCuesUrl = (i: Pick<Insight, "srt_url" | "cues_url">) => i.srt_url || i.cues_url || null;
