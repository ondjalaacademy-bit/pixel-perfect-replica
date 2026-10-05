import type { ReactNode } from "react";
import { SiteLayout } from "./SiteLayout";

export function LegalPage({ eyebrow, title, updated, sections }: { eyebrow: string; title: string; updated: string; sections: { h: string; body: ReactNode }[] }) {
  return (
    <SiteLayout>
      <section className="border-b border-border bg-primary-soft">
        <div className="mx-auto max-w-3xl px-4 py-14 md:px-6 md:py-20">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-3 text-4xl font-bold text-primary">{title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">Última atualização: {updated}</p>
        </div>
      </section>
      <section className="section-y">
        <div className="mx-auto max-w-3xl space-y-8 px-4 md:px-6">
          {sections.map((s, i) => (
            <div key={s.h}>
              <h2 className="text-lg font-bold text-primary">{i + 1}. {s.h}</h2>
              <div className="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground">{s.body}</div>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
