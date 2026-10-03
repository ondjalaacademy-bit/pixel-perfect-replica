import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatKz } from "@/lib/format";
import { AdminHeader, Panel, EmptyRow, Field, th, td } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_authenticated/admin/cursos")({ component: AdminCourses });

type Course = {
  id?: string;
  slug: string;
  title: string;
  area: string;
  short_description: string;
  description: string;
  objectives: string[];
  duration: string;
  modality: string;
  price: number;
  is_published: boolean;
  position: number;
};
type Mod = { id?: string; title: string; description: string };

const empty: Course = {
  slug: "", title: "", area: "", short_description: "", description: "", objectives: [],
  duration: "", modality: "Presencial", price: 0, is_published: true, position: 0,
};

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function AdminCourses() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*, course_modules(id, title, description, position)")
        .order("position");
      if (error) throw error;
      return data;
    },
  });
  const [editing, setEditing] = useState<{ course: Course; modules: Mod[] } | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!editing) return;
    const { course, modules } = editing;
    if (!course.title.trim()) { toast.error("Indica o nome do curso."); return; }
    setSaving(true);
    try {
      const payload = { ...course, objectives: course.objectives.map((o) => o.trim()).filter(Boolean), slug: course.slug || slugify(course.title), price: Number(course.price) };
      const { id, ...rest } = payload;
      const res = id
        ? await supabase.from("courses").update(rest).eq("id", id).select("id").single()
        : await supabase.from("courses").insert(rest).select("id").single();
      if (res.error) throw res.error;
      const courseId = res.data.id;
      const del = await supabase.from("course_modules").delete().eq("course_id", courseId);
      if (del.error) throw del.error;
      const mods = modules.filter((m) => m.title.trim()).map((m, i) => ({ course_id: courseId, position: i + 1, title: m.title, description: m.description }));
      if (mods.length) {
        const ins = await supabase.from("course_modules").insert(mods);
        if (ins.error) throw ins.error;
      }
      toast.success("Curso guardado.");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin-courses"] });
    } catch (e: any) {
      toast.error(e?.message?.includes("row-level") ? "Só administradores podem alterar cursos." : e?.message ?? "Erro ao guardar.");
    } finally {
      setSaving(false);
    }
  }

  const set = (patch: Partial<Course>) => editing && setEditing({ ...editing, course: { ...editing.course, ...patch } });

  return (
    <>
      <AdminHeader
        title="Cursos"
        description="Cria e edita os cursos, o programa e a visibilidade no site."
        action={<Button onClick={() => setEditing({ course: { ...empty, position: (data?.length ?? 0) + 1 }, modules: [] })}>Novo curso</Button>}
      />
      <Panel>
        <table className="w-full text-left text-sm">
          <thead><tr><th className={th}>Curso</th><th className={th}>Área</th><th className={th}>Duração</th><th className={th}>Preço</th><th className={th}>Visível</th><th className={th}></th></tr></thead>
          <tbody>
            {(data ?? []).map((c: any) => (
              <tr key={c.id} className="border-t border-border">
                <td className={td}><span className="font-medium">{c.title}</span><span className="block text-xs text-muted-foreground">/{c.slug}</span></td>
                <td className={td}>{c.area}</td>
                <td className={td}>{c.duration}</td>
                <td className={td}>{formatKz(c.price)}</td>
                <td className={td}>{c.is_published ? "Sim" : "Não"}</td>
                <td className={`${td} text-right`}>
                  <Button size="sm" variant="outline" onClick={() => setEditing({
                    course: { id: c.id, slug: c.slug, title: c.title, area: c.area, short_description: c.short_description, description: c.description, objectives: c.objectives ?? [], duration: c.duration, modality: c.modality, price: Number(c.price), is_published: c.is_published, position: c.position },
                    modules: [...(c.course_modules ?? [])].sort((a: any, b: any) => a.position - b.position).map((m: any) => ({ title: m.title, description: m.description })),
                  })}>Editar</Button>
                </td>
              </tr>
            ))}
            {!isLoading && !data?.length && <EmptyRow cols={6} text="Ainda não existem cursos." />}
          </tbody>
        </table>
      </Panel>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.course.id ? "Editar curso" : "Novo curso"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nome" className="sm:col-span-2"><Input value={editing.course.title} onChange={(e) => set({ title: e.target.value })} /></Field>
              <Field label="Endereço (slug)"><Input value={editing.course.slug} placeholder={slugify(editing.course.title)} onChange={(e) => set({ slug: slugify(e.target.value) })} /></Field>
              <Field label="Área"><Input value={editing.course.area} onChange={(e) => set({ area: e.target.value })} /></Field>
              <Field label="Duração"><Input value={editing.course.duration} onChange={(e) => set({ duration: e.target.value })} /></Field>
              <Field label="Modalidade"><Input value={editing.course.modality} onChange={(e) => set({ modality: e.target.value })} /></Field>
              <Field label="Preço (Kz)"><Input type="number" min={0} value={editing.course.price} onChange={(e) => set({ price: Number(e.target.value) })} /></Field>
              <Field label="Ordem"><Input type="number" value={editing.course.position} onChange={(e) => set({ position: Number(e.target.value) })} /></Field>
              <Field label="Descrição curta" className="sm:col-span-2"><Input value={editing.course.short_description} onChange={(e) => set({ short_description: e.target.value })} /></Field>
              <Field label="Descrição" className="sm:col-span-2"><Textarea rows={4} value={editing.course.description} onChange={(e) => set({ description: e.target.value })} /></Field>
              <Field label="Objetivos (um por linha)" className="sm:col-span-2">
                <Textarea rows={4} value={editing.course.objectives.join("\n")} onChange={(e) => set({ objectives: e.target.value.split("\n") })} />
              </Field>
              <div className="flex items-center gap-3 sm:col-span-2">
                <Switch checked={editing.course.is_published} onCheckedChange={(v) => set({ is_published: v })} />
                <span className="text-sm">Visível no site</span>
              </div>
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between">
                  <Label>Módulos do programa</Label>
                  <Button size="sm" variant="outline" onClick={() => setEditing({ ...editing, modules: [...editing.modules, { title: "", description: "" }] })}>Adicionar módulo</Button>
                </div>
                <div className="mt-3 space-y-3">
                  {editing.modules.map((m, i) => (
                    <div key={i} className="rounded-lg border border-border p-3">
                      <div className="flex gap-2">
                        <Input placeholder={`Módulo ${i + 1}`} value={m.title} onChange={(e) => { const mods = [...editing.modules]; mods[i] = { ...m, title: e.target.value }; setEditing({ ...editing, modules: mods }); }} />
                        <Button size="sm" variant="ghost" onClick={() => setEditing({ ...editing, modules: editing.modules.filter((_, j) => j !== i) })}>Remover</Button>
                      </div>
                      <Textarea className="mt-2" rows={2} placeholder="Descrição" value={m.description} onChange={(e) => { const mods = [...editing.modules]; mods[i] = { ...m, description: e.target.value }; setEditing({ ...editing, modules: mods }); }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 sm:col-span-2">
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

