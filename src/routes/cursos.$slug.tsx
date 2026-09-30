import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CalendarDays, Clock, MapPin, Users, CheckCircle2 } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { getCourseBySlug } from "@/lib/courses.functions";
import { courseImage } from "@/lib/course-images";
import { formatKz, formatDate } from "@/lib/format";

export const Route = createFileRoute("/cursos/$slug")({
  loader: async ({ params }) => {
    const result = await getCourseBySlug({ data: { slug: params.slug } });
    if (!result) throw notFound();
    return result;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Curso não encontrado — Ondjala Academy" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.course.title} — Ondjala Academy`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.course.short_description },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.course.short_description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: CourseNotFound,
  errorComponent: CourseError,
  component: CourseDetail,
});

function CourseNotFound() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-primary">Curso não encontrado</h1>
        <p className="mt-3 text-muted-foreground">Este curso não existe ou já não está disponível.</p>
        <Button asChild className="mt-6">
          <Link to="/cursos">Ver todos os cursos</Link>
        </Button>
      </div>
    </SiteLayout>
  );
}

function CourseError() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-primary">Não foi possível carregar o curso</h1>
        <p className="mt-3 text-muted-foreground">Tenta novamente dentro de instantes.</p>
      </div>
    </SiteLayout>
  );
}

function CourseDetail() {
  const { course, modules, classes } = Route.useLoaderData();
  const nextClass = classes[0];
  const vagas = nextClass ? Math.max(nextClass.seats - nextClass.seats_taken, 0) : null;

  return (
    <SiteLayout>
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.2fr_1fr] md:px-6 md:py-20">
          <div>
            <p className="eyebrow">{course.area}</p>
            <h1 className="mt-3 font-display text-4xl font-extrabold">{course.title}</h1>
            <p className="mt-4 max-w-xl text-primary-foreground/75">{course.description}</p>

            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4 text-sm text-primary-foreground/80">
              <span className="inline-flex items-center gap-2">
                <Clock className="size-4 text-accent" /> {course.duration}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="size-4 text-accent" /> {course.modality}
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="size-4 text-accent" />
                Próxima turma: {formatDate(nextClass?.start_date ?? null)}
              </span>
              {vagas !== null && (
                <span className="inline-flex items-center gap-2">
                  <Users className="size-4 text-accent" /> {vagas} vagas disponíveis
                </span>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-background p-6 text-foreground shadow-lift">
            <img
              src={courseImage(course.slug)}
              alt={`Curso de ${course.title}`}
              loading="lazy"
              width={1280}
              height={800}
              className="h-40 w-full rounded-lg object-cover"
            />
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Investimento
            </p>
            <p className="font-display text-3xl font-extrabold text-primary">{formatKz(course.price)}</p>
            <Button
              asChild
              size="lg"
              className="mt-6 w-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Link to="/inscricao/$courseId" params={{ courseId: course.id }}>
                Inscrever-me agora
              </Link>
            </Button>
            {nextClass && (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                {nextClass.name} · {nextClass.schedule}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="section-y">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 md:grid-cols-[1.2fr_1fr] md:px-6">
          <div>
            <h2 className="text-2xl font-bold text-primary">Programa do curso</h2>
            <ol className="mt-6 space-y-4">
              {modules.map((m) => (
                <li key={m.id} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-start gap-4">
                    <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary-soft font-display text-sm font-bold text-primary">
                      {m.position}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-primary">{m.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <aside>
            <h2 className="text-2xl font-bold text-primary">Objetivos</h2>
            <ul className="mt-6 space-y-3">
              {course.objectives.map((o) => (
                <li key={o} className="flex gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent" />
                  {o}
                </li>
              ))}
            </ul>

            <h2 className="mt-10 text-2xl font-bold text-primary">Turmas</h2>
            <ul className="mt-6 space-y-3">
              {classes.map((t) => (
                <li key={t.id} className="rounded-xl border border-border bg-card p-5 text-sm">
                  <p className="font-semibold text-primary">{t.name}</p>
                  <p className="mt-1 text-muted-foreground">{t.schedule}</p>
                  <p className="mt-1 text-muted-foreground">
                    Início: {formatDate(t.start_date)} · {Math.max(t.seats - t.seats_taken, 0)} vagas
                  </p>
                </li>
              ))}
              {classes.length === 0 && (
                <li className="text-sm text-muted-foreground">Novas turmas em breve.</li>
              )}
            </ul>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
