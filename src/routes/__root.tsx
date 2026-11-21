import type { ErrorComponentProps } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AppShell } from "@/components/AppShell";
import { InsightProvider } from "@/components/InsightLinks";
import { startTextSync } from "@/lib/text-store";
import { registerPwa } from "@/lib/pwa-register";
import { startOfflineQueue } from "@/lib/offline-events";
import { initAnalytics, trackPageView, validId } from "@/lib/analytics";
import { getAnalyticsId } from "@/lib/analytics.functions";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-gilded">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Stránka nenalezena</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Tato část eposu zde není – zkuste se vrátit na úvodní obrazovku.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Zpět domů
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Stránku se nepodařilo načíst
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Něco se pokazilo. Zkuste to znovu nebo se vraťte na úvod.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Zkusit znovu
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Zpět domů
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Mahábhárata – vizuální encyklopedie eposu" },
      {
        name: "description",
        content:
          "Temně ladění encyklopedie Mahábháraty: 18 knih, desítky postav a magické astry s předčítáním.",
      },
      { property: "og:title", content: "Mahábhárata – vizuální encyklopedie eposu" },
      {
        property: "og:description",
        content: "18 knih, genealogie postav a božské zbraně indického eposu na jednom místě.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#12100c" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Mahábhárata" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/icon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Lora:ital,wght@0,400;0,500;0,600;1,400&display=swap",
      },
      { rel: "icon", type: "image/png", href: "/icon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="cs">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  useEffect(() => {
    registerPwa();
    return startTextSync();
  }, []);
  useEffect(() => {
    if (import.meta.env.DEV) return;
    let unsub: (() => void) | undefined;
    let cancelled = false;
    (async () => {
      const fallback = validId(import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY"]);
      const id = validId(await getAnalyticsId().catch(() => null)) ?? fallback;
      if (!id || cancelled) return;
      initAnalytics(id);
      startOfflineQueue();
      trackPageView(window.location.pathname);
      unsub = router.subscribe("onResolved", (e) => {
        if (e.pathChanged) trackPageView(e.toLocation.pathname);
      });
    })();
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, [router]);

  return (
    <QueryClientProvider client={queryClient}>
      <InsightProvider>
        <AppShell>
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </AppShell>
      </InsightProvider>
    </QueryClientProvider>
  );
}
