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
      // @ts-expect-error – dynamické cesty ke detailům jsou v projektu vždy platné
      to={to}
      params={params}
      className={cn(
        "card-relief group flex flex-col overflow-hidden rounded-xl transition-all duration-300 hover:-translate-y-1",
        className,
      )}
    >
      <div className={cn("grain relative overflow-hidden", tall ? "h-64" : "h-44")}>
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.07]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
        {overline ? (
          <span className="absolute left-3 top-3 rounded-full border border-primary/40 bg-background/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-primary backdrop-blur">
            {overline}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg leading-snug text-foreground transition-colors group-hover:text-primary">
          {title}
        </h3>
        {sanskrit ? <p className="mt-0.5 text-xs text-primary/80">{sanskrit}</p> : null}
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
        {minutes ? (
          <p className="mt-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            <Headphones className="size-3.5 text-primary" />
            {minutes} min předčítání
          </p>
        ) : null}
      </div>
    </Link>
  );
}
