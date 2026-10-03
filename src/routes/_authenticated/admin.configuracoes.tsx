import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AdminHeader, Field } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_authenticated/admin/configuracoes")({ component: AdminSettings });

const blank = { bank_name: "", account_holder: "", iban: "", payment_instructions: "", contact_email: "", contact_phone: "", address: "" };

function AdminSettings() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => (await supabase.from("settings").select("*").eq("id", 1).maybeSingle()).data,
  });
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (data) setForm({ ...blank, ...Object.fromEntries(Object.keys(blank).map((k) => [k, (data as any)[k] ?? ""])) });
  }, [data]);

  async function save() {
    setSaving(true);
    const { error } = await supabase.from("settings").update(form).eq("id", 1);
    setSaving(false);
    if (error) { toast.error(error.message.includes("row-level") ? "Só administradores podem alterar as configurações." : error.message); return; }
    toast.success("Configurações guardadas.");
    qc.invalidateQueries({ queryKey: ["settings"] });
  }

  const f = (k: keyof typeof blank) => ({ value: form[k], onChange: (e: any) => setForm({ ...form, [k]: e.target.value }) });

  return (
    <>
      <AdminHeader title="Configurações" description="Dados bancários mostrados ao aluno no passo de pagamento e contactos da academia." />
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-bold text-primary">Dados para transferência</h2>
          <div className="mt-5 grid gap-4">
            <Field label="Banco"><Input {...f("bank_name")} /></Field>
            <Field label="Titular da conta"><Input {...f("account_holder")} /></Field>
            <Field label="IBAN"><Input {...f("iban")} placeholder="AO06 …" /></Field>
            <Field label="Instruções de pagamento"><Textarea rows={4} {...f("payment_instructions")} /></Field>
          </div>
        </section>
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-bold text-primary">Contactos</h2>
          <div className="mt-5 grid gap-4">
            <Field label="Email"><Input {...f("contact_email")} /></Field>
            <Field label="Telefone"><Input {...f("contact_phone")} /></Field>
            <Field label="Endereço"><Textarea rows={3} {...f("address")} /></Field>
          </div>
        </section>
      </div>
      <div className="mt-6 flex justify-end"><Button disabled={saving} onClick={save}>{saving ? "A guardar…" : "Guardar configurações"}</Button></div>
    </>
  );
}
