import { Link } from "@tanstack/react-router";
import { Headphones } from "lucide-react";
import { cn } from "@/lib/utils";

interface EntityCardProps {
  to: string;
  params: Record<string, string>;
  image: string;
  overline?: string;
  title: string;
  sanskrit?: string;
  text: string;
  minutes?: number;
  tall?: boolean;
  className?: string;
}

export function EntityCard({
  to,
  params,
  image,
  overline,
  title,
  sanskrit,
  text,
  minutes,
  tall,
  className,
}: EntityCardProps) {
  return (
    <Link
      to={to}
      params={params}
      className={cn(
        "card-relief mythic-card group flex flex-col overflow-hidden transition-all duration-500 hover:-translate-y-1",
        tall && "mythic-card-portrait",
        className,
      )}
    >
      <div className={cn("mythic-frame grain relative overflow-hidden", tall ? "h-72" : "h-48")}>
        <img
          src={image}
          alt={title}
          loading="lazy"
          width={tall ? 302 : 452}
          height={tall ? 302 : 304}
          className="size-full object-cover transition-transform duration-1000 group-hover:scale-[1.045]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/25 to-transparent" />
        <div className="mythic-frame-line absolute inset-2.5 border border-primary/35" />
        {overline ? (
          <span className="absolute left-3 top-3 rounded-full border border-primary/40 bg-background/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-primary backdrop-blur">
            {overline}
          </span>
        ) : null}
      </div>

      <div className="relative flex flex-1 flex-col p-5 pt-4">
        <span className="absolute left-1/2 top-0 size-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-primary/60 bg-surface" />
        <h3 className="font-display text-lg leading-snug text-foreground transition-colors group-hover:text-primary">
          {title}
        </h3>
        {sanskrit ? <p className="mt-0.5 text-xs text-primary/80">{sanskrit}</p> : null}
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
      </div>
    </Link>
  );
}
