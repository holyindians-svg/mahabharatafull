ALTER TABLE public.insights ADD COLUMN IF NOT EXISTS srt_url text;
ALTER TABLE public.insights ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;
CREATE UNIQUE INDEX IF NOT EXISTS insights_slug_key ON public.insights(slug);
CREATE INDEX IF NOT EXISTS insights_sort_order_idx ON public.insights(sort_order, created_at);
COMMENT ON COLUMN public.insights.cues_url IS 'DEPRECATED: legacy JSON cues fallback; prefer srt_url';
CREATE POLICY "Insight subtitles are public" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'insights');