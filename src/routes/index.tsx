import { createFileRoute, Link } from "@tanstack/react-router";
import { ShoppingCart, Megaphone, Ship, Sparkles, BookOpen, Wrench, TrendingUp } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { CourseCard } from "@/components/courses/CourseCard";
import { Button } from "@/components/ui/button";
import { listCourses } from "@/lib/courses.functions";
import { CinematicHero } from "@/components/layout/CinematicHero";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ondjala Academy — Aprende. Inova. Transforma. Lidera o Futuro." },
      {
        name: "description",
        content:
          "Formação prática em E-Commerce, Marketing, Importação e Inteligência Artificial. Inscreve-te na Ondjala Academy.",
      },
      { property: "og:title", content: "Ondjala Academy — Formação que transforma" },
      {
        property: "og:description",
        content:
          "Formação prática para desenvolver competências, criar oportunidades e transformar conhecimento em resultados.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: () => listCourses(),
  component: Home,
});

const pilares = [
  { icon: ShoppingCart, title: "E-Commerce", slug: "e-commerce" },
  { icon: Megaphone, title: "Marketing", slug: "marketing" },
  { icon: Ship, title: "Importação", slug: "importacao" },
  { icon: Sparkles, title: "Inteligência Artificial", slug: "inteligencia-artificial" },
];

const valores = [
  { icon: BookOpen, title: "Conhecimento", text: "Conteúdo estruturado e relevante." },
  { icon: Wrench, title: "Prática", text: "Aprendizagem orientada para aplicação real." },
  {
    icon: TrendingUp,
    title: "Resultados",
    text: "Competências para transformar conhecimento em oportunidades.",
  },
];

function Home() {
  const courses = Route.useLoaderData();

  return (
    <SiteLayout>
      <CinematicHero />

      {/* Áreas de formação */}
      <section id="areas-formacao" className="section-y scroll-mt-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <p className="eyebrow">Áreas de formação</p>
          <h2 className="mt-3 max-w-xl text-3xl font-bold text-primary">
            Quatro pilares para construir o teu futuro profissional
          </h2>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {pilares.map((p) => (
              <Link
                key={p.slug}
                to="/cursos/$slug"
                params={{ slug: p.slug }}
                className="card-elevated block p-6"
              >
                <span className="grid size-11 place-items-center rounded-lg bg-accent-soft">
                  <p.icon className="size-5 text-accent" />
                </span>
                <h3 className="mt-5 text-base font-bold text-primary">{p.title}</h3>
                <span className="mt-2 inline-block text-sm text-muted-foreground">Ver programa</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Porquê */}
      <section className="section-y bg-muted/60">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="text-3xl font-bold text-primary">Por que estudar na Ondjala Academy?</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {valores.map((v) => (
              <div key={v.title} className="rounded-xl border border-border bg-card p-7">
                <v.icon className="size-6 text-accent" />
                <h3 className="mt-5 text-sm font-bold uppercase tracking-[0.12em] text-primary">
                  {v.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cursos */}
      <section className="section-y">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Cursos</p>
              <h2 className="mt-3 text-3xl font-bold text-primary">Próximas formações</h2>
            </div>
            <Button asChild variant="outline">
              <Link to="/cursos">Ver todos os cursos</Link>
            </Button>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {courses.map((c) => (
              <CourseCard
                key={c.id}
                slug={c.slug}
                title={c.title}
                shortDescription={c.short_description}
                duration={c.duration}
                modality={c.modality}
                price={c.price}
              />
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
