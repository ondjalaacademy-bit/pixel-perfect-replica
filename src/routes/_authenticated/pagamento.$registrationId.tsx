import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatKz } from "@/lib/format";
import { StatusBadge } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_authenticated/pagamento/$registrationId")({
  head: () => ({ meta: [{ title: "Pagamento da inscrição — Ondjala Academy" }, { name: "robots", content: "noindex" }] }),
  component: PaymentPage,
});

const MAX = 5 * 1024 * 1024;

function PaymentPage() {
  const { registrationId } = Route.useParams();
  const qc = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [reference, setReference] = useState("");
  const [sending, setSending] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["payment-page", registrationId],
    queryFn: async () => {
      const [reg, settings] = await Promise.all([
        supabase.from("registrations").select("id, user_id, registration_number, amount, status, courses(title), payments(id, status, created_at)").eq("id", registrationId).maybeSingle(),
        supabase.from("settings").select("*").eq("id", 1).maybeSingle(),
      ]);
      return { reg: reg.data as any, settings: settings.data };
    },
  });

  const reg = data?.reg;
  const s = data?.settings;
  const payments = [...(reg?.payments ?? [])].sort((a: any, b: any) => b.created_at.localeCompare(a.created_at));
  const last = payments[0];
  const canSend = !last || last.status === "falhado";

  async function submit() {
    if (!file || !reg) return toast.error("Escolhe o ficheiro do comprovativo.");
    if (file.size > MAX) return toast.error("O ficheiro não pode ter mais de 5 MB.");
    if (!/^(image\/|application\/pdf)/.test(file.type)) return toast.error("Envia uma imagem ou um PDF.");
    setSending(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
      const path = `${reg.user_id}/${reg.id}-${Date.now()}.${ext}`;
      const up = await supabase.storage.from("comprovativos").upload(path, file, { contentType: file.type });
      if (up.error) throw up.error;
      const ins = await supabase.from("payments").insert({
        registration_id: reg.id,
        amount: reg.amount,
        method: "transferencia",
        status: "pendente",
        proof_path: path,
        reference: reference.trim() || null,
      });
      if (ins.error) throw ins.error;
      toast.success("Comprovativo enviado. Vamos confirmar o teu pagamento em breve.");
      setFile(null);
      qc.invalidateQueries({ queryKey: ["payment-page", registrationId] });
      qc.invalidateQueries({ queryKey: ["my-registrations"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Não foi possível enviar o comprovativo.");
    } finally {
      setSending(false);
    }
  }

  return (
    <SiteLayout>
      <section className="section-y">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <p className="eyebrow">Pagamento</p>
          <h1 className="mt-3 text-3xl font-bold text-primary">Concluir a inscrição</h1>

          {isLoading && <p className="mt-6 text-sm text-muted-foreground">A carregar…</p>}
          {!isLoading && !reg && (
            <p className="mt-6 text-sm text-muted-foreground">Inscrição não encontrada. <Link to="/minha-conta" className="text-accent underline">Voltar à minha conta</Link></p>
          )}

          {reg && (
            <>
              <div className="mt-8 rounded-xl border border-border bg-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{reg.courses?.title}</p>
                    <p className="mt-1 font-mono text-sm">Inscrição n.º {reg.registration_number}</p>
                  </div>
                  <p className="font-display text-2xl font-extrabold text-primary">{formatKz(reg.amount)}</p>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-border bg-card p-6">
                <h2 className="font-bold text-primary">1. Faz a transferência</h2>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div><dt className="text-xs text-muted-foreground">Banco</dt><dd className="font-medium">{s?.bank_name || "A definir"}</dd></div>
                  <div><dt className="text-xs text-muted-foreground">Titular</dt><dd className="font-medium">{s?.account_holder || "A definir"}</dd></div>
                  <div className="sm:col-span-2"><dt className="text-xs text-muted-foreground">IBAN</dt><dd className="font-mono font-medium">{s?.iban || "A definir"}</dd></div>
                  <div className="sm:col-span-2"><dt className="text-xs text-muted-foreground">Descritivo</dt><dd className="font-mono font-medium">{reg.registration_number}</dd></div>
                </dl>
                {s?.payment_instructions && <p className="mt-4 text-sm text-muted-foreground">{s.payment_instructions}</p>}
              </div>

              <div className="mt-6 rounded-xl border border-border bg-card p-6">
                <h2 className="font-bold text-primary">2. Envia o comprovativo</h2>
                {last && (
                  <div className="mt-4 flex items-center gap-3 text-sm">
                    <span>Último envio:</span><StatusBadge status={last.status} />
                    {last.status === "pendente" && <span className="text-muted-foreground">Em análise pela equipa.</span>}
                    {last.status === "falhado" && <span className="text-muted-foreground">Foi rejeitado — envia um novo comprovativo.</span>}
                    {last.status === "pago" && <span className="text-muted-foreground">Pagamento confirmado.</span>}
                  </div>
                )}
                {canSend && (
                  <div className="mt-5 grid gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="proof">Comprovativo (imagem ou PDF, até 5 MB)</Label>
                      <Input id="proof" type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="ref">Referência da operação (opcional)</Label>
                      <Input id="ref" value={reference} onChange={(e) => setReference(e.target.value)} />
                    </div>
                    <Button disabled={sending} onClick={submit} className="bg-accent text-accent-foreground hover:bg-accent/90">
                      {sending ? "A enviar…" : "Enviar comprovativo"}
                    </Button>
                  </div>
                )}
              </div>
              <Button asChild variant="ghost" className="mt-6"><Link to="/minha-conta">Ir para a minha conta</Link></Button>
            </>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
