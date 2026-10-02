import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatKz } from "@/lib/format";
import { AdminHeader, Panel, EmptyRow, th, td } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_authenticated/admin/relatorios")({ component: AdminReports });

function AdminReports() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const [courses, regs, pays] = await Promise.all([
        supabase.from("courses").select("id, title").order("position"),
        supabase.from("registrations").select("id, course_id, status"),
        supabase.from("payments").select("registration_id, status, amount"),
      ]);
      const regCourse: Record<string, string> = {};
      (regs.data ?? []).forEach((r) => (regCourse[r.id] = r.course_id));
      return (courses.data ?? []).map((c) => {
        const rs = (regs.data ?? []).filter((r) => r.course_id === c.id);
        const revenue = (pays.data ?? [])
          .filter((p) => p.status === "pago" && regCourse[p.registration_id] === c.id)
          .reduce((s, p) => s + Number(p.amount), 0);
        return {
          ...c,
          total: rs.length,
          confirmed: rs.filter((r) => r.status === "confirmada").length,
          pending: rs.filter((r) => r.status === "pendente").length,
          revenue,
        };
      });
    },
  });
  const totals = (data ?? []).reduce((a, c) => ({ total: a.total + c.total, confirmed: a.confirmed + c.confirmed, revenue: a.revenue + c.revenue }), { total: 0, confirmed: 0, revenue: 0 });

  return (
    <>
      <AdminHeader title="Relatórios" description="Inscrições e receita por curso." />
      <Panel>
        <table className="w-full text-left text-sm">
          <thead><tr><th className={th}>Curso</th><th className={th}>Inscrições</th><th className={th}>Confirmadas</th><th className={th}>Pendentes</th><th className={th}>Receita</th></tr></thead>
          <tbody>
            {(data ?? []).map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className={`${td} font-medium`}>{c.title}</td><td className={td}>{c.total}</td><td className={td}>{c.confirmed}</td><td className={td}>{c.pending}</td><td className={td}>{formatKz(c.revenue)}</td>
              </tr>
            ))}
            {!isLoading && !data?.length && <EmptyRow cols={5} text="Sem dados." />}
            {!!data?.length && (
              <tr className="border-t-2 border-border font-bold text-primary">
                <td className={td}>Total</td><td className={td}>{totals.total}</td><td className={td}>{totals.confirmed}</td><td className={td}></td><td className={td}>{formatKz(totals.revenue)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
