import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileDown } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatKz, formatDate } from "@/lib/format";
import { downloadPdfReport } from "@/lib/pdf-report";
import { AdminHeader, Panel, EmptyRow, Field, th, td } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_authenticated/admin/relatorios")({ component: AdminReports });

function AdminReports() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reports", from, to],
    queryFn: async () => {
      let rq = supabase.from("registrations").select("id, registration_number, full_name, email, phone, course_id, status, amount, created_at, courses(title), classes(name)").order("created_at", { ascending: false });
      let pq = supabase.from("payments").select("registration_id, status, amount, created_at, paid_at, reference, registrations(registration_number, full_name, courses(title))").order("created_at", { ascending: false });
      if (from) { rq = rq.gte("created_at", from); pq = pq.gte("created_at", from); }
      if (to) { const end = `${to}T23:59:59`; rq = rq.lte("created_at", end); pq = pq.lte("created_at", end); }
      const [courses, regs, pays] = await Promise.all([supabase.from("courses").select("id, title").order("position"), rq, pq]);
      const regList = regs.data ?? [];
      const payList = pays.data ?? [];
      const regCourse: Record<string, string> = {};
      regList.forEach((r) => (regCourse[r.id] = r.course_id));
      const byCourse = (courses.data ?? []).map((c) => {
        const rs = regList.filter((r) => r.course_id === c.id);
        const revenue = payList.filter((p) => p.status === "pago" && regCourse[p.registration_id] === c.id).reduce((s, p) => s + Number(p.amount), 0);
        return { ...c, total: rs.length, confirmed: rs.filter((r) => r.status === "confirmada").length, pending: rs.filter((r) => r.status === "pendente").length, revenue };
      });
      return { byCourse, regs: regList, pays: payList };
    },
  });

  const rows = data?.byCourse ?? [];
  const totals = rows.reduce((a, c) => ({ total: a.total + c.total, confirmed: a.confirmed + c.confirmed, pending: a.pending + c.pending, revenue: a.revenue + c.revenue }), { total: 0, confirmed: 0, pending: 0, revenue: 0 });
  const period = from || to ? `Período: ${from ? formatDate(from) : "início"} a ${to ? formatDate(to) : "hoje"}` : "Todo o período";
  const stamp = new Date().toISOString().slice(0, 10);

  async function run(key: string, fn: () => Promise<void>) {
    setBusy(key);
    try { await fn(); } catch { toast.error("Não foi possível gerar o PDF."); } finally { setBusy(null); }
  }

  const exportSummary = () => run("resumo", () => downloadPdfReport({
    title: "Resumo de inscrições e receita por curso", subtitle: period,
    head: ["Curso", "Inscrições", "Confirmadas", "Pendentes", "Receita"],
    rows: rows.map((c) => [c.title, c.total, c.confirmed, c.pending, formatKz(c.revenue)]),
    foot: ["Total", totals.total, totals.confirmed, totals.pending, formatKz(totals.revenue)],
    fileName: `ondjala-resumo-${stamp}.pdf`,
  }));

  const exportRegs = () => run("inscricoes", () => downloadPdfReport({
    title: "Lista de inscrições", subtitle: period,
    head: ["N.º", "Aluno", "Contacto", "Curso", "Turma", "Data", "Valor", "Estado"],
    rows: (data?.regs ?? []).map((r: any) => [r.registration_number ?? "", r.full_name, `${r.email} ${r.phone ?? ""}`, r.courses?.title ?? "", r.classes?.name ?? "-", formatDate(r.created_at), formatKz(r.amount), r.status]),
    foot: ["", `${data?.regs.length ?? 0} inscrições`, "", "", "", "", "", ""],
    fileName: `ondjala-inscricoes-${stamp}.pdf`,
  }));

  const exportPays = () => run("pagamentos", () => {
    const pays = data?.pays ?? [];
    const paid = pays.filter((p) => p.status === "pago").reduce((s, p) => s + Number(p.amount), 0);
    return downloadPdfReport({
      title: "Lista de pagamentos", subtitle: period,
      head: ["Inscrição", "Aluno", "Curso", "Enviado", "Confirmado", "Referência", "Valor", "Estado"],
      rows: pays.map((p: any) => [p.registrations?.registration_number ?? "", p.registrations?.full_name ?? "", p.registrations?.courses?.title ?? "", formatDate(p.created_at), p.paid_at ? formatDate(p.paid_at) : "-", p.reference ?? "-", formatKz(p.amount), p.status]),
      foot: ["", "", "", "", "", "Total recebido", formatKz(paid), ""],
      fileName: `ondjala-pagamentos-${stamp}.pdf`,
    });
  });

  return (
    <>
      <AdminHeader title="Relatórios" description="Inscrições e receita por curso. Exporta em PDF." />

      <section className="mt-8 flex flex-wrap items-end gap-4 rounded-xl border border-border bg-card p-6">
        <Field label="De"><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
        <Field label="Até"><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></Field>
        {(from || to) && <Button variant="ghost" onClick={() => { setFrom(""); setTo(""); }}>Limpar</Button>}
        <div className="ml-auto flex flex-wrap gap-2">
          {[
            { k: "resumo", label: "Resumo por curso", fn: exportSummary },
            { k: "inscricoes", label: "Inscrições", fn: exportRegs },
            { k: "pagamentos", label: "Pagamentos", fn: exportPays },
          ].map((b) => (
            <Button key={b.k} variant="outline" disabled={isLoading || busy !== null} onClick={b.fn}>
              <FileDown className="size-4" /> {busy === b.k ? "A gerar…" : `PDF · ${b.label}`}
            </Button>
          ))}
        </div>
      </section>

      <Panel>
        <table className="w-full text-left text-sm">
          <thead><tr><th className={th}>Curso</th><th className={th}>Inscrições</th><th className={th}>Confirmadas</th><th className={th}>Pendentes</th><th className={th}>Receita</th></tr></thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className={`${td} font-medium`}>{c.title}</td><td className={td}>{c.total}</td><td className={td}>{c.confirmed}</td><td className={td}>{c.pending}</td><td className={td}>{formatKz(c.revenue)}</td>
              </tr>
            ))}
            {!isLoading && !rows.length && <EmptyRow cols={5} text="Sem dados." />}
            {!!rows.length && (
              <tr className="border-t-2 border-border font-bold text-primary">
                <td className={td}>Total</td><td className={td}>{totals.total}</td><td className={td}>{totals.confirmed}</td><td className={td}>{totals.pending}</td><td className={td}>{formatKz(totals.revenue)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
