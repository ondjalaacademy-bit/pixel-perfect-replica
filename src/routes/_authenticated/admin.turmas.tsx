import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDate } from "@/lib/format";
import { AdminHeader, Panel, EmptyRow, Field, th, td } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_authenticated/admin/turmas")({ component: AdminClasses });

type Klass = { id?: string; course_id: string; name: string; start_date: string; schedule: string; seats: number; is_open: boolean };

function AdminClasses() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-classes"],
    queryFn: async () => {
      const [classes, courses] = await Promise.all([
        supabase.from("classes").select("*, courses(title)").order("start_date", { ascending: true }),
        supabase.from("courses").select("id, title").order("position"),
      ]);
      if (classes.error) throw classes.error;
      return { classes: classes.data, courses: courses.data ?? [] };
    },
  });
  const [editing, setEditing] = useState<Klass | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!editing) return;
    if (!editing.course_id || !editing.name.trim()) return toast.error("Escolhe o curso e indica o nome da turma.");
    setSaving(true);
    const { id, ...rest } = editing;
    const payload = { ...rest, start_date: rest.start_date || null, seats: Number(rest.seats) };
    const res = id ? await supabase.from("classes").update(payload).eq("id", id) : await supabase.from("classes").insert(payload);
    setSaving(false);
    if (res.error) return toast.error(res.error.message.includes("row-level") ? "Só administradores podem alterar turmas." : res.error.message);
    toast.success("Turma guardada.");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin-classes"] });
  }

  return (
    <>
      <AdminHeader
        title="Turmas"
        description="Datas de início, horários e vagas de cada curso."
        action={<Button onClick={() => setEditing({ course_id: data?.courses[0]?.id ?? "", name: "", start_date: "", schedule: "", seats: 30, is_open: true })}>Nova turma</Button>}
      />
      <Panel>
        <table className="w-full text-left text-sm">
          <thead><tr><th className={th}>Turma</th><th className={th}>Curso</th><th className={th}>Início</th><th className={th}>Horário</th><th className={th}>Vagas</th><th className={th}>Estado</th><th className={th}></th></tr></thead>
          <tbody>
            {(data?.classes ?? []).map((k: any) => (
              <tr key={k.id} className="border-t border-border">
                <td className={`${td} font-medium`}>{k.name}</td>
                <td className={td}>{k.courses?.title}</td>
                <td className={td}>{formatDate(k.start_date)}</td>
                <td className={td}>{k.schedule || "—"}</td>
                <td className={td}>{k.seats_taken}/{k.seats}</td>
                <td className={td}>{k.is_open ? "Aberta" : "Fechada"}</td>
                <td className={`${td} text-right`}>
                  <Button size="sm" variant="outline" onClick={() => setEditing({ id: k.id, course_id: k.course_id, name: k.name, start_date: k.start_date ?? "", schedule: k.schedule, seats: k.seats, is_open: k.is_open })}>Editar</Button>
                </td>
              </tr>
            ))}
            {!isLoading && !data?.classes?.length && <EmptyRow cols={7} text="Ainda não existem turmas." />}
          </tbody>
        </table>
      </Panel>
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? "Editar turma" : "Nova turma"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid gap-4">
              <Field label="Curso">
                <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={editing.course_id} onChange={(e) => setEditing({ ...editing, course_id: e.target.value })}>
                  {data?.courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </Field>
              <Field label="Nome"><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Data de início"><Input type="date" value={editing.start_date} onChange={(e) => setEditing({ ...editing, start_date: e.target.value })} /></Field>
                <Field label="Vagas"><Input type="number" min={1} value={editing.seats} onChange={(e) => setEditing({ ...editing, seats: Number(e.target.value) })} /></Field>
              </div>
              <Field label="Horário"><Input value={editing.schedule} placeholder="Ex.: Sábados, 9h–13h" onChange={(e) => setEditing({ ...editing, schedule: e.target.value })} /></Field>
              <div className="flex items-center gap-3"><Switch checked={editing.is_open} onCheckedChange={(v) => setEditing({ ...editing, is_open: v })} /><span className="text-sm">Inscrições abertas</span></div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button>
                <Button disabled={saving} onClick={save}>{saving ? "A guardar…" : "Guardar"}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
