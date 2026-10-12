import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { CourseCard } from "@/components/courses/CourseCard";
import { listAreas, listCourses } from "@/lib/courses.functions";

type Search = { area?: string };

export const Route = createFileRoute("/cursos/")({
  validateSearch: (s: Record<string, unknown>): Search =>
    typeof s.area === "string" && s.area ? { area: s.area } : {},
  head: () => ({
    meta: [
      { title: "Cursos — Ondjala Academy" },
      {
        name: "description",
        content:
          "Conhece os cursos da Ondjala Academy por área: E-Commerce, Marketing, Importação e Inteligência Artificial.",
      },
      { property: "og:title", content: "Cursos — Ondjala Academy" },
      {
        property: "og:description",
        content: "Formação prática em E-Commerce, Marketing, Importação e Inteligência Artificial.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async () => {
    const [courses, areas] = await Promise.all([listCourses(), listAreas()]);
    return { courses, areas };
  },
  component: CoursesPage,
});

function CoursesPage() {
  const { courses, areas } = Route.useLoaderData();
  const { area } = Route.useSearch();
  const current = areas.find((a) => a.slug === area);
  const shown = current ? courses.filter((c) => c.area_id === current.id) : courses;

  const chip = (active: boolean) =>
    `rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-card text-foreground hover:border-accent hover:text-accent"
    }`;

  return (
    <SiteLayout>
      <section className="border-b border-border bg-primary-soft">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
          <p className="eyebrow">{current ? "Área de formação" : "Catálogo"}</p>
          <h1 className="mt-3 text-4xl font-bold text-primary">{current ? current.name : "Cursos"}</h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            {current?.description ||
              "Programas práticos, com turmas presenciais e online, pensados para aplicar no dia seguinte."}
          </p>
        </div>
      </section>

      <section className="section-y">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <nav className="flex flex-wrap gap-2" aria-label="Filtrar por área">
            <Link to="/cursos" search={{}} className={chip(!current)}>Todas</Link>
            {areas.map((a) => (
              <Link key={a.id} to="/cursos" search={{ area: a.slug }} className={chip(current?.id === a.id)}>
                {a.name}
              </Link>
            ))}
          </nav>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((c) => (
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
          {!shown.length && (
            <p className="mt-10 text-center text-sm text-muted-foreground">
              Ainda não há formações publicadas nesta área. Volta em breve.
            </p>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
