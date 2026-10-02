import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

export function AdminHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="eyebrow">Administração</p>
        <h1 className="mt-2 text-2xl font-bold text-primary">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </header>
  );
}

export function Panel({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <section className="mt-8 rounded-xl border border-border bg-card">
      {title && <h2 className="border-b border-border px-6 py-4 text-sm font-bold text-primary">{title}</h2>}
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}

export const th = "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground";
export const td = "px-4 py-3 align-top";

export function EmptyRow({ cols, text }: { cols: number; text: string }) {
  return (
    <tr>
      <td colSpan={cols} className="px-6 py-10 text-center text-sm text-muted-foreground">
        {text}
      </td>
    </tr>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "confirmada" || status === "pago"
      ? "bg-success text-success-foreground"
      : status === "cancelada" || status === "falhado"
        ? "bg-destructive text-destructive-foreground"
        : status === "reembolsado"
          ? "bg-muted text-muted-foreground"
          : "bg-warning text-warning-foreground";
  return <Badge className={tone}>{status}</Badge>;
}
