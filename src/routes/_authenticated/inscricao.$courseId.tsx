import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCourseById } from "@/lib/courses.functions";
import { createRegistration } from "@/lib/registrations.functions";
import { formatKz, formatDate, PROVINCIAS } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/inscricao/$courseId")({
  head: () => ({
    meta: [{ title: "Inscrição — Ondjala Academy" }, { name: "robots", content: "noindex" }],
  }),
  component: RegistrationPage,
});

function RegistrationPage() {
  const { courseId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fetchCourse = useServerFn(getCourseById);
  const submit = useServerFn(createRegistration);

  const { data, isLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => fetchCourse({ data: { id: courseId } }),
  });

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    whatsapp: "",
    birthDate: "",
    province: "",
    municipality: "",
    classId: "",
  });

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const mutation = useMutation({
    mutationFn: () =>
      submit({
        data: {
          courseId,
          classId: form.classId || null,
          fullName: form.fullName,
          email: form.email || user?.email || "",
          phone: form.phone,
          whatsapp: form.whatsapp,
          birthDate: form.birthDate || null,
          province: form.province,
          municipality: form.municipality,
        },
      }),
    onSuccess: (res: any) => {
      toast.success("Inscrição registada. Falta apenas o pagamento.");
      if (res?.id) navigate({ to: "/pagamento/$registrationId", params: { registrationId: res.id } });
      else navigate({ to: "/minha-conta" });
    },
    onError: (err: any) => toast.error(err?.message ?? "Não foi possível concluir a inscrição."),
  });

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-2xl px-4 py-24 text-center text-muted-foreground">A carregar…</div>
      </SiteLayout>
    );
  }

  if (!data) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <h1 className="text-2xl font-bold text-primary">Curso não encontrado</h1>
          <Button asChild className="mt-6">
            <Link to="/cursos">Ver cursos</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  const { course, classes } = data;
  const selectedClass = classes.find((c) => c.id === form.classId);

  return (
    <SiteLayout>
      <section className="border-b border-border bg-primary-soft">
        <div className="mx-auto max-w-5xl px-4 py-12 md:px-6">
          <p className="eyebrow">Inscrição</p>
          <h1 className="mt-3 text-3xl font-bold text-primary">{course.title}</h1>
        </div>
      </section>

      <section className="section-y">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="mx-auto grid max-w-5xl gap-10 px-4 md:grid-cols-[1.4fr_1fr] md:px-6"
        >
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-primary">Dados do formando</h2>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="fullName">Nome completo</Label>
                <Input
                  id="fullName"
                  required
                  value={form.fullName}
                  onChange={(e) => set("fullName")(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.email || user?.email || ""}
                  onChange={(e) => set("email")(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  required
                  value={form.phone}
                  onChange={(e) => set("phone")(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={form.whatsapp}
                  onChange={(e) => set("whatsapp")(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="birthDate">Data de nascimento</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => set("birthDate")(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Província</Label>
                <Select value={form.province} onValueChange={set("province")}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Seleciona" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVINCIAS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="municipality">Município</Label>
                <Input
                  id="municipality"
                  value={form.municipality}
                  onChange={(e) => set("municipality")(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Turma</Label>
                <Select value={form.classId} onValueChange={set("classId")}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Seleciona a turma" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} · início {formatDate(t.start_date)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-xl border border-border bg-card p-6 shadow-soft">
            <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Resumo da inscrição
            </h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Curso</dt>
                <dd className="text-right font-medium text-foreground">{course.title}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Modalidade</dt>
                <dd className="text-right font-medium text-foreground">{course.modality}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Duração</dt>
                <dd className="text-right font-medium text-foreground">{course.duration}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Turma</dt>
                <dd className="text-right font-medium text-foreground">
                  {selectedClass ? selectedClass.name : "Por selecionar"}
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex items-end justify-between border-t border-border pt-5">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Valor da inscrição
              </span>
              <span className="font-display text-2xl font-extrabold text-primary">
                {formatKz(course.price)}
              </span>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={mutation.isPending}
              className="mt-6 w-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {mutation.isPending ? "A registar…" : "Continuar para pagamento"}
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              O pagamento (Multicaixa Express e Referência Multicaixa) será activado na próxima fase.
            </p>
          </aside>
        </form>
      </section>
    </SiteLayout>
  );
}
