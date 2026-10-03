import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getMyRegistrations } from "@/lib/registrations.functions";
import { getMyRoles } from "@/lib/admin.functions";
import { formatKz, formatDate } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/minha-conta")({
  head: () => ({ meta: [{ title: "Minha conta — Ondjala Academy" }, { name: "robots", content: "noindex" }] }),
  component: StudentArea,
});

function statusTone(status: string) {
  if (status === "confirmada") return "bg-success text-success-foreground";
  if (status === "cancelada") return "bg-destructive text-destructive-foreground";
  return "bg-warning text-warning-foreground";
}

function StudentArea() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fetchRegistrations = useServerFn(getMyRegistrations);
  const fetchRoles = useServerFn(getMyRoles);

  const { data: registrations, isLoading } = useQuery({
    queryKey: ["my-registrations"],
    queryFn: () => fetchRegistrations(),
  });
  const { data: roles } = useQuery({ queryKey: ["my-roles"], queryFn: () => fetchRoles() });

  const isStaff = (roles ?? []).some((r) => r === "admin" || r === "staff");

  return (
    <SiteLayout>
      <section className="border-b border-border bg-primary-soft">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-12 md:px-6">
          <div>
            <p className="eyebrow">Área do aluno</p>
            <h1 className="mt-3 text-3xl font-bold text-primary">
              Olá, {registrations?.[0]?.full_name ?? user?.email ?? "aluno"}
            </h1>
          </div>
          <div className="flex gap-3">
            {isStaff && (
              <Button asChild variant="outline">
                <Link to="/admin">Área administrativa</Link>
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/" });
              }}
            >
              Terminar sessão
            </Button>
          </div>
        </div>
      </section>

      <section className="section-y">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="text-xl font-bold text-primary">As minhas inscrições</h2>

          {isLoading && <p className="mt-6 text-sm text-muted-foreground">A carregar…</p>}

          {!isLoading && (registrations?.length ?? 0) === 0 && (
            <div className="mt-6 rounded-xl border border-dashed border-border bg-muted/50 p-8 text-center">
              <p className="text-sm text-muted-foreground">Ainda não tens nenhuma inscrição.</p>
              <Button asChild className="mt-5 bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to="/cursos">Explorar cursos</Link>
              </Button>
            </div>
          )}

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {(registrations ?? []).map((r: any) => {
              const payment = r.payments?.[r.payments.length - 1];
              return (
                <article key={r.id} className="rounded-xl border border-border bg-card p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-lg font-bold text-primary">
                        {r.courses?.title ?? "Curso"}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Inscrição n.º {r.registration_number}
                      </p>
                    </div>
                    <Badge className={statusTone(r.status)}>{r.status}</Badge>
                  </div>

                  <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-xs text-muted-foreground">Turma</dt>
                      <dd className="font-medium text-foreground">{r.classes?.name ?? "A definir"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Início</dt>
                      <dd className="font-medium text-foreground">
                        {formatDate(r.classes?.start_date ?? null)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Data da inscrição</dt>
                      <dd className="font-medium text-foreground">{formatDate(r.created_at)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Pagamento</dt>
                      <dd className="font-medium text-foreground">
                        {payment?.status ?? "pendente"} · {formatKz(r.amount)}
                      </dd>
                    </div>
                  </dl>
                  {r.status !== "cancelada" && payment?.status !== "pago" && (
                    <Button asChild size="sm" className="mt-5 bg-accent text-accent-foreground hover:bg-accent/90">
                      <Link to="/pagamento/$registrationId" params={{ registrationId: r.id }}>
                        {payment?.status === "pendente" ? "Ver estado do pagamento" : "Pagar / enviar comprovativo"}
                      </Link>
                    </Button>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
