import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { CourseCard } from "@/components/courses/CourseCard";
import { listCourses } from "@/lib/courses.functions";

export const Route = createFileRoute("/cursos/")({
  head: () => ({
    meta: [
      { title: "Cursos — Ondjala Academy" },
      {
        name: "description",
        content:
          "Conhece os cursos da Ondjala Academy: E-Commerce, Marketing, Importação e Inteligência Artificial.",
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
  loader: () => listCourses(),
  component: CoursesPage,
});

function CoursesPage() {
  const courses = Route.useLoaderData();

  return (
    <SiteLayout>
      <section className="border-b border-border bg-primary-soft">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
          <p className="eyebrow">Catálogo</p>
          <h1 className="mt-3 text-4xl font-bold text-primary">Cursos</h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Programas práticos, com turmas presenciais e online, pensados para aplicar no dia seguinte.
          </p>
        </div>
      </section>

      <section className="section-y">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:grid-cols-2 lg:grid-cols-3 md:px-6">
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
      </section>
    </SiteLayout>
  );
}
