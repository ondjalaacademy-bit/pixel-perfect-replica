import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MapPin } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";

export const Route = createFileRoute("/contactos")({
  head: () => ({
    meta: [
      { title: "Contactos — Ondjala Academy" },
      {
        name: "description",
        content: "Fala com a equipa da Ondjala Academy sobre cursos, turmas e inscrições.",
      },
      { property: "og:title", content: "Contactos — Ondjala Academy" },
      { property: "og:description", content: "Fala connosco sobre cursos, turmas e inscrições." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Contacts,
});

function Contacts() {
  return (
    <SiteLayout>
      <section className="border-b border-border bg-primary-soft">
        <div className="mx-auto max-w-3xl px-4 py-14 md:px-6 md:py-20">
          <p className="eyebrow">Contactos</p>
          <h1 className="mt-3 text-4xl font-bold text-primary">Fala connosco</h1>
        </div>
      </section>

      <section className="section-y">
        <div className="mx-auto grid max-w-3xl gap-5 px-4 sm:grid-cols-3 md:px-6">
          {[
            { icon: Phone, label: "Telefone / WhatsApp", value: "A definir" },
            { icon: Mail, label: "Email", value: "A definir" },
            { icon: MapPin, label: "Endereço", value: "Luanda, Angola" },
          ].map((c) => (
            <div key={c.label} className="rounded-xl border border-border bg-card p-6">
              <c.icon className="size-5 text-accent" />
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {c.label}
              </p>
              <p className="mt-1 text-sm font-medium text-primary">{c.value}</p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-3xl rounded-xl border border-dashed border-border bg-muted/50 px-4 py-5 text-sm text-muted-foreground md:px-6">
          Ainda não tenho os contactos oficiais da Ondjala Academy. Envia o telefone, o email e o
          endereço reais e eu coloco-os aqui.
        </p>
      </section>
    </SiteLayout>
  );
}
