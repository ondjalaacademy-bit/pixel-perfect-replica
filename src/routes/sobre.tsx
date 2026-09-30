import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre nós — Ondjala Academy" },
      {
        name: "description",
        content:
          "A Ondjala Academy forma pessoas em E-Commerce, Marketing, Importação e Inteligência Artificial com foco em prática e resultados.",
      },
      { property: "og:title", content: "Sobre nós — Ondjala Academy" },
      {
        property: "og:description",
        content: "Quem somos, o que fazemos e como formamos profissionais preparados para o futuro.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

function About() {
  return (
    <SiteLayout>
      <section className="border-b border-border bg-primary-soft">
        <div className="mx-auto max-w-3xl px-4 py-14 md:px-6 md:py-20">
          <p className="eyebrow">Sobre nós</p>
          <h1 className="mt-3 text-4xl font-bold text-primary">
            Formação que transforma conhecimento em resultados
          </h1>
        </div>
      </section>

      <section className="section-y">
        <div className="mx-auto max-w-3xl space-y-6 px-4 text-base leading-relaxed text-muted-foreground md:px-6">
          <p>
            A Ondjala Academy é uma academia de formação focada em competências digitais e de negócio.
            Trabalhamos com programas curtos, práticos e orientados para aplicação real, em quatro áreas:
            E-Commerce, Marketing, Importação e Inteligência Artificial.
          </p>
          <p>
            Cada curso combina fundamentos sólidos com exercícios sobre casos concretos, para que cada
            formando saia com algo construído — uma loja, uma campanha, um processo de importação ou um
            fluxo de trabalho apoiado por inteligência artificial.
          </p>
          <p className="font-display text-xl font-bold text-primary">
            Aprende. Inova. Transforma. Lidera o futuro.
          </p>
          <p className="rounded-xl border border-dashed border-border bg-muted/50 p-5 text-sm">
            Esta página está pronta para receber a história oficial, a missão e a equipa da Ondjala
            Academy — envia o texto e eu coloco aqui.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
