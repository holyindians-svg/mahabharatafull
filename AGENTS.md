<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- The clean reading experience reuses the canonical full-book text loaders and section parser; never duplicate translated book content into UI modules, so future books appear from the same data source.
- Book texts sync via IndexedDB + public/texty/versions.json (regenerate with `node scripts/build-text-versions.mjs` after changing texts); only changed books re-download, so no forced reloads.
- Service worker is vite-plugin-pwa generateSW, registered only from src/lib/pwa-register.ts (never in dev/preview); HTML NetworkFirst, /texty not cached by SW.
- Text export (TXT/PDF) uses src/lib/export-text.ts with the shared book loaders; PDF is window.print with #print-root and @media print A4 rules.
- Audiobook section times/cues are generated from SRT by scripts/build-audiobook-srt.mjs into src/data/audiobook-times/<slug>.ts and public/audio-texty/<slug>.json; sections match by the number in their title so text parsing changes can't shift timings.
- Immersive audiobook readers control the existing mounted AudioPlayer through its handle and playback callbacks; never create or remount audio for a view change, so playback stays uninterrupted.
- Inline and immersive karaoke share KaraokeText and the canonical cue loader; keep section-relative timing and bounded seek arithmetic in reader-time for consistent controls.
- Google Analytics initializes only from the root component useEffect (prod only), ID via server fn; keeps SSR clean and dev traffic out.
