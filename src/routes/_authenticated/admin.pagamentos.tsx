import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { formatDate, formatKz } from "@/lib/format";
import { AdminHeader, Panel, EmptyRow, StatusBadge, th, td } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_authenticated/admin/pagamentos")({ component: AdminPayments });

function AdminPayments() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("pendente");
  const [busy, setBusy] = useState<string | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*, registrations(id, registration_number, full_name, email, courses(title))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function openProof(path: string) {
    const { data, error } = await supabase.storage.from("comprovativos").createSignedUrl(path, 300);
    if (error || !data) return toast.error("Não foi possível abrir o comprovativo.");
    window.open(data.signedUrl, "_blank", "noopener");
  }

  async function decide(p: any, approve: boolean) {
    setBusy(p.id);
    const pay = await supabase
      .from("payments")
      .update(approve ? { status: "pago", paid_at: new Date().toISOString() } : { status: "falhado", paid_at: null })
      .eq("id", p.id);
    if (!pay.error && approve && p.registrations?.id) {
      const reg = await supabase.from("registrations").update({ status: "confirmada" }).eq("id", p.registrations.id);
      if (reg.error) toast.error(reg.error.message);
    }
    setBusy(null);
    if (pay.error) return toast.error(pay.error.message);
    toast.success(approve ? "Pagamento confirmado e inscrição confirmada." : "Pagamento rejeitado.");
    ["admin-payments", "admin-overview", "admin-registrations"].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
  }

  const rows = (data ?? []).filter((p: any) => filter === "todos" || p.status === filter);

  return (
    <>
      <AdminHeader
        title="Pagamentos"
        description="Comprovativos enviados pelos alunos. Ao confirmar, a inscrição fica confirmada."
        action={
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="pendente">Por rever</option>
            <option value="pago">Pagos</option>
            <option value="falhado">Rejeitados</option>
            <option value="todos">Todos</option>
          </select>
        }
      />
      <Panel>
        <table className="w-full text-left text-sm">
          <thead><tr><th className={th}>Inscrição</th><th className={th}>Aluno</th><th className={th}>Valor</th><th className={th}>Enviado</th><th className={th}>Comprovativo</th><th className={th}>Estado</th><th className={th}></th></tr></thead>
          <tbody>
            {rows.map((p: any) => (
              <tr key={p.id} className="border-t border-border">
                <td className={`${td} font-mono text-xs`}>{p.registrations?.registration_number}<span className="block font-sans text-muted-foreground">{p.registrations?.courses?.title}</span></td>
                <td className={td}>{p.registrations?.full_name}<span className="block text-xs text-muted-foreground">{p.registrations?.email}</span></td>
                <td className={td}>{formatKz(p.amount)}</td>
                <td className={`${td} text-muted-foreground`}>{formatDate(p.created_at)}{p.reference ? <span className="block text-xs">Ref.: {p.reference}</span> : null}</td>
                <td className={td}>{p.proof_path ? <Button size="sm" variant="link" className="h-auto p-0" onClick={() => openProof(p.proof_path)}>Ver ficheiro</Button> : "—"}</td>
                <td className={td}><StatusBadge status={p.status} /></td>
                <td className={`${td} whitespace-nowrap text-right`}>
                  {p.status === "pendente" && (
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" disabled={busy === p.id} onClick={() => decide(p, false)}>Rejeitar</Button>
                      <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={busy === p.id} onClick={() => decide(p, true)}>Confirmar</Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {!isLoading && !rows.length && <EmptyRow cols={7} text="Nenhum pagamento nesta lista." />}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
