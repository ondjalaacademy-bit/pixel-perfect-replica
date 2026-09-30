import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ClipboardList,
  CreditCard,
  BarChart3,
  Settings,
  GraduationCap,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAdminOverview, updateRegistrationStatus } from "@/lib/admin.functions";
import { formatKz, formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [{ title: "Administração — Ondjala Academy" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminArea,
});

const menu = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: BookOpen, label: "Cursos" },
  { icon: GraduationCap, label: "Turmas" },
  { icon: Users, label: "Alunos" },
  { icon: ClipboardList, label: "Inscrições" },
  { icon: CreditCard, label: "Pagamentos" },
  { icon: BarChart3, label: "Relatórios" },
  { icon: Settings, label: "Configurações" },
];

function AdminArea() {
  const fetchOverview = useServerFn(getAdminOverview);
  const setStatus = useServerFn(updateRegistrationStatus);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => fetchOverview(),
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: (vars: { id: string; status: "pendente" | "confirmada" | "cancelada" }) =>
      setStatus({ data: vars }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-overview"] }),
  });

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/40 px-4">
        <div className="max-w-md rounded-xl border border-border bg-card p-8 text-center">
          <h1 className="text-xl font-bold text-primary">Acesso restrito</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            A tua conta não tem permissão para a área administrativa. A verificação é feita no
            servidor.
          </p>
          <Button asChild className="mt-6">
            <Link to="/minha-conta">Voltar à minha conta</Link>
          </Button>
        </div>
      </div>
    );
  }

  const stats = data?.stats;
  const cards = [
    { label: "Total de alunos", value: stats?.students ?? 0 },
    { label: "Total de inscrições", value: stats?.total ?? 0 },
    { label: "Inscrições pendentes", value: stats?.pending ?? 0 },
    { label: "Inscrições confirmadas", value: stats?.confirmed ?? 0 },
    { label: "Pagamentos pendentes", value: stats?.pendingPayments ?? 0 },
    { label: "Receita", value: formatKz(stats?.revenue ?? 0) },
  ];

  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar p-6 text-sidebar-foreground lg:flex">
        <Logo tone="light" />
        <nav className="mt-10 space-y-1">
          {menu.map((m) => (
            <span
              key={m.label}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                m.active
                  ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/60"
              }`}
            >
              <m.icon className="size-4" />
              {m.label}
            </span>
          ))}
        </nav>
        <Link
          to="/"
          className="mt-auto pt-8 text-xs text-sidebar-foreground/60 hover:text-sidebar-primary"
        >
          ← Voltar ao site
        </Link>
      </aside>

      <main className="flex-1 px-4 py-10 md:px-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Administração</p>
            <h1 className="mt-2 text-2xl font-bold text-primary">Dashboard</h1>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/minha-conta">Minha conta</Link>
          </Button>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <div key={c.label} className="rounded-xl border border-border bg-card p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {c.label}
              </p>
              <p className="mt-3 font-display text-2xl font-extrabold text-primary">
                {isLoading ? "—" : c.value}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-10 rounded-xl border border-border bg-card">
          <h2 className="border-b border-border px-6 py-4 text-sm font-bold text-primary">
            Inscrições recentes
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-6 py-3">N.º</th>
                  <th className="px-6 py-3">Aluno</th>
                  <th className="px-6 py-3">Curso</th>
                  <th className="px-6 py-3">Data</th>
                  <th className="px-6 py-3">Valor</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {(data?.registrations ?? []).map((r: any) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-6 py-3 font-mono text-xs">{r.registration_number}</td>
                    <td className="px-6 py-3">
                      <span className="font-medium text-foreground">{r.full_name}</span>
                      <span className="block text-xs text-muted-foreground">{r.email}</span>
                    </td>
                    <td className="px-6 py-3">{r.courses?.title}</td>
                    <td className="px-6 py-3 text-muted-foreground">{formatDate(r.created_at)}</td>
                    <td className="px-6 py-3">{formatKz(r.amount)}</td>
                    <td className="px-6 py-3">
                      <Badge variant="secondary">{r.status}</Badge>
                    </td>
                    <td className="px-6 py-3 text-right">
                      {r.status !== "confirmada" && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={mutation.isPending}
                          onClick={() => mutation.mutate({ id: r.id, status: "confirmada" })}
                        >
                          Confirmar
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {!isLoading && (data?.registrations ?? []).length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-muted-foreground">
                      Ainda não existem inscrições.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
