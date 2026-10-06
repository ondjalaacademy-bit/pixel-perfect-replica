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
}: {
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <Link to="/" className={cn("inline-flex items-center", className)} aria-label="Ondjala Academy">
      <img
        src={logoAsset.url}
        alt="Ondjala Academy"
        className={cn(
          "h-11 w-auto select-none",
          tone === "light" && "drop-shadow-[0_1px_10px_rgba(255,255,255,0.25)]",
        )}
        loading="eager"
        draggable={false}
      />
    </Link>
  );
}
