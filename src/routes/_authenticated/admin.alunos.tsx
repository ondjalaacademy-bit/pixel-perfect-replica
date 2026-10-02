import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/format";
import { AdminHeader, Panel, EmptyRow, th, td } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_authenticated/admin/alunos")({ component: AdminStudents });

function AdminStudents() {
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-students"],
    queryFn: async () => {
      const [profiles, regs] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("registrations").select("user_id"),
      ]);
      if (profiles.error) throw profiles.error;
      const counts: Record<string, number> = {};
      (regs.data ?? []).forEach((r) => (counts[r.user_id] = (counts[r.user_id] ?? 0) + 1));
      return profiles.data.map((p) => ({ ...p, registrations: counts[p.id] ?? 0 }));
    },
  });
  const term = q.toLowerCase();
  const rows = (data ?? []).filter((p) => !term || [p.full_name, p.email, p.phone].some((v) => v?.toLowerCase().includes(term)));

  return (
    <>
      <AdminHeader title="Alunos" description="Todos os utilizadores registados na plataforma." action={<Input className="w-64" placeholder="Pesquisar nome, email…" value={q} onChange={(e) => setQ(e.target.value)} />} />
      <Panel>
        <table className="w-full text-left text-sm">
          <thead><tr><th className={th}>Nome</th><th className={th}>Contactos</th><th className={th}>Localização</th><th className={th}>Inscrições</th><th className={th}>Registo</th></tr></thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className={`${td} font-medium`}>{p.full_name || "—"}</td>
                <td className={td}>{p.email}<span className="block text-xs text-muted-foreground">{p.phone || ""}{p.whatsapp ? ` · WhatsApp ${p.whatsapp}` : ""}</span></td>
                <td className={td}>{[p.municipality, p.province].filter(Boolean).join(", ") || "—"}</td>
                <td className={td}>{p.registrations}</td>
                <td className={`${td} text-muted-foreground`}>{formatDate(p.created_at)}</td>
              </tr>
            ))}
            {!isLoading && !rows.length && <EmptyRow cols={5} text="Nenhum aluno encontrado." />}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
