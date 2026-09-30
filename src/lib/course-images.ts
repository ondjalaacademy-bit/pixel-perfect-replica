import ecommerce from "@/assets/curso-ecommerce.jpg";
import marketing from "@/assets/curso-marketing.jpg";
import importacao from "@/assets/curso-importacao.jpg";
import ia from "@/assets/curso-ia.jpg";

const map: Record<string, string> = {
  "e-commerce": ecommerce,
  marketing: marketing,
  importacao: importacao,
  "inteligencia-artificial": ia,
};

export function courseImage(slug: string) {
  return map[slug] ?? ecommerce;
}
