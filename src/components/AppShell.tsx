import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { BookOpen, Flame, Home, Menu, Search, Sparkles, Swords, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { parvas } from "@/data/parvas";
import { characters, characterGroups } from "@/data/characters";
import { astras } from "@/data/astras";

const nav = [
  { to: "/", label: "Domů", sanskrit: "Prārambha", icon: Home, badge: null as string | null },
  {
    to: "/knihy",
    label: "Knihy Mahábháraty",
    sanskrit: "18 Parv",
    icon: BookOpen,
    badge: String(parvas.length),
  },
  {
    to: "/postavy",
    label: "Genealogie a postavy",
    sanskrit: "Pātra",
    icon: Users,
    badge: String(characters.length),
  },
  {
    to: "/astry",
    label: "Zbraně a artefakty",
    sanskrit: "Astra",
    icon: Swords,
    badge: String(astras.length),
  },
  { to: "/hledat", label: "Hledat v textech", sanskrit: "Anveṣaṇa", icon: Search, badge: null },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto px-5 py-7">
      <Link to="/" onClick={onNavigate} className="group block">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full border border-primary/40 bg-primary/10">
            <Flame className="size-5 text-primary" />
          </span>
          <span>
            <span className="block font-display text-lg leading-tight text-gilded">
              Mahábhárata
            </span>
            <span className="block text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
              Encyklopedie
            </span>
          </span>
        </div>
      </Link>

      <div className="rule-gold" />

      <nav className="flex flex-col gap-1">
        {nav.map((item) => {
          const active =
            item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-primary/12 text-primary"
                  : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-foreground",
              )}
            >
              <Icon className={cn("size-4 shrink-0", active && "text-primary")} />
              <span className="min-w-0 flex-1">
                <span className="block truncate">{item.label}</span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {item.sanskrit}
                </span>
              </span>
              {item.badge ? (
                <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="rule-gold" />

      <div>
        <p className="mb-2 px-3 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Skupiny postav
        </p>
        <div className="flex flex-col gap-0.5">
          {characterGroups.map((g) => (
            <Link
              key={g.id}
              to="/postavy"
              search={{ group: g.id }}
              onClick={onNavigate}
              className="rounded-md px-3 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            >
              {g.title}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 px-3 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Vybrané knihy
        </p>
        <div className="flex flex-col gap-0.5">
          {parvas.slice(0, 6).map((p) => (
            <Link
              key={p.slug}
              to="/knihy/$slug"
              params={{ slug: p.slug }}
              onClick={onNavigate}
              className="truncate rounded-md px-3 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            >
              {p.order}. {p.sanskrit}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-auto rounded-lg border border-border bg-sidebar-accent/50 p-4">
        <Sparkles className="size-4 text-primary" />
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          100 000 dvojverší, 18 knih a rod, který se rozdělil sám v sobě.
        </p>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[288px_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-sidebar-border bg-sidebar lg:block">
        <SidebarContent />
      </aside>

      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-sidebar-border bg-sidebar/95 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur lg:hidden">
        <Link to="/" className="flex items-center gap-2">
          <Flame className="size-5 text-primary" />
          <span className="font-display text-base text-gilded">Mahábhárata</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Otevřít nabídku"
          className="rounded-md border border-border p-2 text-foreground"
        >
          <Menu className="size-5" />
        </button>
      </header>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Zavřít nabídku"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-xs border-r border-sidebar-border bg-sidebar pt-[env(safe-area-inset-top)]">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Zavřít nabídku"
              className="absolute right-3 top-4 z-10 rounded-md border border-border p-1.5 text-foreground"
            >
              <X className="size-4" />
            </button>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}

      <main className="min-w-0">{children}</main>
    </div>
  );
}
