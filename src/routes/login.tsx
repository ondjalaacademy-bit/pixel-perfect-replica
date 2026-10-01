import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

type LoginSearch = { next?: string };

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => {
    const next = search["next"];
    return typeof next === "string" ? { next } : {};
  },
  head: () => ({
    meta: [
      { title: "Entrar — Ondjala Academy" },
      { name: "description", content: "Acede à tua conta da Ondjala Academy." },
      { property: "og:title", content: "Entrar — Ondjala Academy" },
      { property: "og:description", content: "Acede à tua conta da Ondjala Academy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function safeNext(next?: string) {
  if (!next) return "/minha-conta";
  if (!next.startsWith("/") || next.startsWith("//")) return "/minha-conta";
  return next;
}

function LoginPage() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Sessão iniciada.");
        window.location.href = safeNext(next);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${safeNext(next)}`,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        if (data.session) {
          window.location.href = safeNext(next);
        } else {
          toast.success("Conta criada. Confirma o teu email para entrares.");
        }
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Não foi possível continuar.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Não foi possível entrar com o Google.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: safeNext(next) as string });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <Logo tone="light" />
        <div>
          <h2 className="font-display text-3xl font-extrabold leading-tight">
            Aprende. Inova. Transforma. Lidera o futuro.
          </h2>
          <p className="mt-4 max-w-sm text-sm text-primary-foreground/70">
            Entra na tua conta para acompanhares as tuas inscrições, turmas e pagamentos.
          </p>
        </div>
        <span className="text-xs text-primary-foreground/50">Ondjala Academy</span>
      </div>

      <div className="flex items-center justify-center px-4 py-14">
        <div className="w-full max-w-sm">
          <div className="lg:hidden">
            <Logo />
          </div>

          <h1 className="mt-8 text-2xl font-bold text-primary">
            {mode === "signin" ? "Entrar" : "Criar conta"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Acede à tua área de aluno."
              : "Cria a tua conta para te inscreveres num curso."}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {mode === "signup" && (
              <div>
                <Label htmlFor="fullName">Nome completo</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="mt-1.5"
                />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="password">Palavra-passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1.5"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {loading ? "A processar…" : mode === "signin" ? "Entrar" : "Criar conta"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> ou <span className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full" onClick={handleGoogle}>
            Continuar com o Google
          </Button>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "Ainda não tens conta?" : "Já tens conta?"}{" "}
            <button
              type="button"
              className="font-semibold text-accent hover:underline"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            >
              {mode === "signin" ? "Criar conta" : "Entrar"}
            </button>
          </p>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:text-primary">
              ← Voltar ao site
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
