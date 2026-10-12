import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AdminHeader, Panel, EmptyRow, Field, th, td } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_authenticated/admin/areas")({ component: AdminAreas });

type Area = { id?: string; slug: string; name: string; description: string; position: number; is_published: boolean };

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function AdminAreas() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-areas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("areas").select("*, courses(id)").order("position");
      if (error) throw error;
      return data;
    },
  });
  const [editing, setEditing] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!editing) return;
    if (!editing.name.trim()) { toast.error("Indica o nome da área."); return; }
    setSaving(true);
    const { id, ...rest } = { ...editing, slug: editing.slug || slugify(editing.name) };
    const res = id ? await supabase.from("areas").update(rest).eq("id", id) : await supabase.from("areas").insert(rest);
    if (!res.error && id) await supabase.from("courses").update({ area: rest.name }).eq("area_id", id);
    setSaving(false);
    if (res.error) { toast.error(res.error.message); return; }
    toast.success("Área guardada.");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin-areas"] });
  }

  async function remove(a: any) {
    if (a.courses?.length) { toast.error("Move primeiro os cursos desta área para outra."); return; }
    if (!confirm(`Apagar a área "${a.name}"?`)) return;
    const { error } = await supabase.from("areas").delete().eq("id", a.id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin-areas"] });
  }

  const set = (p: Partial<Area>) => editing && setEditing({ ...editing, ...p });

  return (
    <>
      <AdminHeader
        title="Áreas de formação"
        description="Organiza os cursos por área. Ao clicar numa área no site, o visitante vê todas as formações dela."
        action={<Button onClick={() => setEditing({ slug: "", name: "", description: "", position: (data?.length ?? 0) + 1, is_published: true })}>Nova área</Button>}
      />
      <Panel>
        <table className="w-full text-left text-sm">
          <thead><tr><th className={th}>Área</th><th className={th}>Cursos</th><th className={th}>Ordem</th><th className={th}>Visível</th><th className={th}></th></tr></thead>
          <tbody>
            {(data ?? []).map((a: any) => (
              <tr key={a.id} className="border-t border-border">
                <td className={td}><span className="font-medium">{a.name}</span><span className="block text-xs text-muted-foreground">/cursos?area={a.slug}</span></td>
                <td className={td}>{a.courses?.length ?? 0}</td>
                <td className={td}>{a.position}</td>
                <td className={td}>{a.is_published ? "Sim" : "Não"}</td>
                <td className={`${td} whitespace-nowrap text-right`}>
                  <Button size="sm" variant="ghost" onClick={() => remove(a)}>Apagar</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditing({ id: a.id, slug: a.slug, name: a.name, description: a.description, position: a.position, is_published: a.is_published })}>Editar</Button>
                </td>
              </tr>
            ))}
            {!isLoading && !data?.length && <EmptyRow cols={5} text="Ainda não existem áreas." />}
          </tbody>
        </table>
      </Panel>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing?.id ? "Editar área" : "Nova área"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid gap-4">
              <Field label="Nome"><Input value={editing.name} onChange={(e) => set({ name: e.target.value })} /></Field>
              <Field label="Endereço (slug)"><Input value={editing.slug} placeholder={slugify(editing.name)} onChange={(e) => set({ slug: slugify(e.target.value) })} /></Field>
              <Field label="Descrição"><Textarea rows={3} value={editing.description} onChange={(e) => set({ description: e.target.value })} /></Field>
              <Field label="Ordem"><Input type="number" value={editing.position} onChange={(e) => set({ position: Number(e.target.value) })} /></Field>
              <div className="flex items-center gap-3"><Switch checked={editing.is_published} onCheckedChange={(v) => set({ is_published: v })} /><span className="text-sm">Visível no site</span></div>
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
