import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function RefreshButton({ className }: { className?: string }) {
  const [spinning, setSpinning] = useState(false);

  return (
    <button
      type="button"
      aria-label="Obnovit stránku"
      title="Obnovit stránku"
      onClick={() => {
        if (spinning) return;
        setSpinning(true);
        window.setTimeout(() => window.location.reload(), 250);
      }}
      className={cn(
        "group press grid min-h-11 min-w-11 place-items-center rounded-full border border-border bg-background/40 text-muted-foreground backdrop-blur-md hover:border-primary/40 hover:text-primary",
        className,
      )}
    >
      <RefreshCw
        className={cn(
          "size-5 transition-transform duration-500 group-hover:rotate-180",
          spinning && "animate-spin [animation-duration:400ms]",
        )}
      />
    </button>
  );
}
