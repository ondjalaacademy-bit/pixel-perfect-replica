import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { formatDate, formatKz } from "@/lib/format";
import { AdminHeader, Panel, EmptyRow, StatusBadge, th, td } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_authenticated/admin/inscricoes")({ component: AdminRegistrations });

const STATUSES = ["pendente", "confirmada", "cancelada"] as const;

function AdminRegistrations() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("todas");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-registrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registrations")
        .select("*, courses(title), classes(name), payments(status)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function changeStatus(id: string, status: (typeof STATUSES)[number]) {
    const { error } = await supabase.from("registrations").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Estado atualizado.");
    qc.invalidateQueries({ queryKey: ["admin-registrations"] });
    qc.invalidateQueries({ queryKey: ["admin-overview"] });
  }

  const term = q.toLowerCase();
  const rows = (data ?? []).filter(
    (r: any) =>
      (filter === "todas" || r.status === filter) &&
      (!term || [r.full_name, r.email, r.registration_number, r.phone].some((v: string | null) => v?.toLowerCase().includes(term))),
  );

  return (
    <>
      <AdminHeader
        title="Inscrições"
        action={
          <div className="flex flex-wrap gap-2">
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="todas">Todas</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <Input className="w-60" placeholder="Pesquisar…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        }
      />
      <Panel>
        <table className="w-full text-left text-sm">
          <thead><tr><th className={th}>N.º</th><th className={th}>Aluno</th><th className={th}>Curso / Turma</th><th className={th}>Data</th><th className={th}>Valor</th><th className={th}>Pagamento</th><th className={th}>Estado</th></tr></thead>
          <tbody>
            {rows.map((r: any) => (
              <tr key={r.id} className="border-t border-border">
                <td className={`${td} font-mono text-xs`}>{r.registration_number}</td>
                <td className={td}><span className="font-medium">{r.full_name}</span><span className="block text-xs text-muted-foreground">{r.email} · {r.phone}</span></td>
                <td className={td}>{r.courses?.title}<span className="block text-xs text-muted-foreground">{r.classes?.name ?? "Sem turma"}</span></td>
                <td className={`${td} text-muted-foreground`}>{formatDate(r.created_at)}</td>
                <td className={td}>{formatKz(r.amount)}</td>
                <td className={td}>{r.payments?.length ? <StatusBadge status={r.payments[r.payments.length - 1].status} /> : <span className="text-xs text-muted-foreground">Sem comprovativo</span>}</td>
                <td className={td}>
                  <select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={r.status} onChange={(e) => changeStatus(r.id, e.target.value as any)}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {!isLoading && !rows.length && <EmptyRow cols={7} text="Nenhuma inscrição encontrada." />}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
