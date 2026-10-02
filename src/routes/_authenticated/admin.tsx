import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ClipboardList,
  CreditCard,
  BarChart3,
  Settings,
  GraduationCap,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { getMyRoles } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [{ title: "Administração — Ondjala Academy" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminLayout,
});

const menu = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { to: "/admin/cursos", icon: BookOpen, label: "Cursos" },
  { to: "/admin/turmas", icon: GraduationCap, label: "Turmas" },
  { to: "/admin/alunos", icon: Users, label: "Alunos" },
  { to: "/admin/inscricoes", icon: ClipboardList, label: "Inscrições" },
  { to: "/admin/pagamentos", icon: CreditCard, label: "Pagamentos" },
  { to: "/admin/relatorios", icon: BarChart3, label: "Relatórios" },
  { to: "/admin/configuracoes", icon: Settings, label: "Configurações" },
] as const;

function AdminLayout() {
  const fetchRoles = useServerFn(getMyRoles);
  const { data: roles, isLoading } = useQuery({ queryKey: ["my-roles"], queryFn: () => fetchRoles() });
  const isStaff = (roles ?? []).some((r) => r === "admin" || r === "staff");

  if (isLoading) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">A carregar…</div>;
  }

  if (!isStaff) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/40 px-4">
        <div className="max-w-md rounded-xl border border-border bg-card p-8 text-center">
          <h1 className="text-xl font-bold text-primary">Acesso restrito</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            A tua conta não tem permissão para a área administrativa.
          </p>
          <Button asChild className="mt-6">
            <Link to="/minha-conta">Voltar à minha conta</Link>
          </Button>
        </div>
      </div>
    );
  }

  const linkCls = "flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors";
  const inactive = "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground";
  const active = "bg-sidebar-accent font-semibold text-sidebar-accent-foreground";

  return (
    <div className="flex min-h-screen flex-col bg-muted/40 lg:flex-row">
      <aside className="flex shrink-0 flex-col bg-sidebar p-4 text-sidebar-foreground lg:w-64 lg:p-6">
        <div className="flex items-center justify-between">
          <Logo tone="light" />
          <Link to="/minha-conta" className="text-xs text-sidebar-foreground/70 lg:hidden">
            Minha conta
          </Link>
        </div>
        <nav className="mt-4 flex gap-1 overflow-x-auto lg:mt-10 lg:flex-col lg:overflow-visible">
          {menu.map((m) => (
            <Link
              key={m.to}
              to={m.to}
              activeOptions={{ exact: "exact" in m }}
              className={`${linkCls} ${inactive}`}
              activeProps={{ className: `${linkCls} ${active}` }}
            >
              <m.icon className="size-4" />
              {m.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto hidden flex-col gap-2 pt-8 text-xs lg:flex">
          <Link to="/minha-conta" className="text-sidebar-foreground/60 hover:text-sidebar-primary">
            Minha conta
          </Link>
          <Link to="/" className="text-sidebar-foreground/60 hover:text-sidebar-primary">
            ← Voltar ao site
          </Link>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-8 md:px-10 md:py-10">
        <Outlet />
      </main>
    </div>
  );
}
