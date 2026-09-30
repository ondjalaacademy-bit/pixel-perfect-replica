import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

/**
 * Lockup tipográfico provisório da Ondjala Academy.
 * Assim que o ficheiro do logotipo oficial for carregado, basta substituir o
 * conteúdo deste componente por <img src={logo} ... /> — todas as páginas
 * usam este componente.
 */
export function Logo({
  className,
  tone = "dark",
}: {
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <Link to="/" className={cn("inline-flex items-center gap-3", className)} aria-label="Ondjala Academy">
      <span
        className={cn(
          "grid size-9 place-items-center rounded-lg font-display text-lg font-extrabold",
          tone === "dark" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground",
        )}
      >
        O
      </span>
      <span className="leading-none">
        <span
          className={cn(
            "block font-display text-base font-extrabold tracking-tight",
            tone === "dark" ? "text-primary" : "text-background",
          )}
        >
          ONDJALA
        </span>
        <span className="block text-[0.65rem] font-bold uppercase tracking-[0.3em] text-accent">
          Academy
        </span>
      </span>
    </Link>
  );
}
