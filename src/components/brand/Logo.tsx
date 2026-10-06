import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import logoAsset from "@/assets/ondjala-logo.png.asset.json";

/**
 * Logotipo oficial da Ondjala Academy (fundo transparente, servido pela CDN).
 * `tone="light"` é usado sobre o azul-marinho do rodapé — a imagem é a mesma,
 * com uma sombra branca subtil para manter a legibilidade.
 */
export function Logo({
  className,
  tone = "dark",
  size = "md",
}: {
  className?: string;
  tone?: "dark" | "light";
  size?: "md" | "lg";
}) {
  return (
    <Link to="/" className={cn("inline-flex items-center", className)} aria-label="Ondjala Academy">
      <img
        src={logoAsset.url}
        alt="Ondjala Academy"
        className={cn(
          "w-auto select-none",
          size === "lg" ? "h-16" : "h-11",
          tone === "light" && "drop-shadow-[0_1px_10px_rgba(255,255,255,0.25)]",
        )}
        loading="eager"
        draggable={false}
      />
    </Link>
  );
}
