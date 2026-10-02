import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { getAdminOverview } from "@/lib/admin.functions";
import { formatKz, formatDate } from "@/lib/format";
import { AdminHeader, Panel, StatusBadge, EmptyRow, th, td } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const fetchOverview = useServerFn(getAdminOverview);
  const { data, isLoading } = useQuery({ queryKey: ["admin-overview"], queryFn: () => fetchOverview() });
  const s = data?.stats;
  const cards = [
    { label: "Total de alunos", value: s?.students ?? 0 },
    { label: "Total de inscrições", value: s?.total ?? 0 },
    { label: "Inscrições pendentes", value: s?.pending ?? 0 },
    { label: "Inscrições confirmadas", value: s?.confirmed ?? 0 },
    { label: "Pagamentos pendentes", value: s?.pendingPayments ?? 0 },
    { label: "Receita", value: formatKz(s?.revenue ?? 0) },
  ];

  return (
    <>
      <AdminHeader
        title="Dashboard"
        action={
          <Button asChild size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/admin/pagamentos">Rever pagamentos</Link>
          </Button>
        }
      />
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{c.label}</p>
            <p className="mt-3 font-display text-2xl font-extrabold text-primary">{isLoading ? "—" : c.value}</p>
          </div>
        ))}
      </section>
      <Panel title="Inscrições recentes">
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              <th className={th}>N.º</th>
              <th className={th}>Aluno</th>
              <th className={th}>Curso</th>
              <th className={th}>Data</th>
              <th className={th}>Valor</th>
              <th className={th}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {(data?.registrations ?? []).slice(0, 8).map((r: any) => (
              <tr key={r.id} className="border-t border-border">
                <td className={`${td} font-mono text-xs`}>{r.registration_number}</td>
                <td className={td}>{r.full_name}</td>
                <td className={td}>{r.courses?.title}</td>
                <td className={`${td} text-muted-foreground`}>{formatDate(r.created_at)}</td>
                <td className={td}>{formatKz(r.amount)}</td>
                <td className={td}><StatusBadge status={r.status} /></td>
              </tr>
            ))}
            {!isLoading && (data?.registrations ?? []).length === 0 && <EmptyRow cols={6} text="Ainda não existem inscrições." />}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
