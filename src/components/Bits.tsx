import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  sanskrit,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  sanskrit?: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <header className="mb-10">
      <p className="text-[11px] uppercase tracking-[0.3em] text-primary">{eyebrow}</p>
      <h1 className="mt-3 text-3xl leading-tight sm:text-4xl">
        <span className="text-gilded">{title}</span>
      </h1>
      {sanskrit ? (
        <p className="mt-1 font-display text-lg text-muted-foreground">{sanskrit}</p>
      ) : null}
      {description ? (
        <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
      {children}
      <div className="rule-gold mt-8" />
    </header>
  );
}

export function BackLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
    >
      <ArrowLeft className="size-4" />
      {children}
    </Link>
  );
}

export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-surface-2/70 px-3 py-1 text-xs text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mt-12", className)}>
      <h2 className="text-xl text-foreground">{title}</h2>
      <div className="rule-gold mt-3 mb-6" />
      {children}
    </section>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 lg:py-14">{children}</div>;
}
