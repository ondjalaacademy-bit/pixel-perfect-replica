import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 md:flex-row md:items-start md:justify-between md:px-6">
        <div className="max-w-xs">
          <Logo tone="light" />
          <p className="mt-4 text-sm text-primary-foreground/70">
            Aprende. Inova. Transforma. Lidera o futuro.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 text-sm">
          <div>
            <p className="mb-3 font-semibold">Plataforma</p>
            <ul className="space-y-2 text-primary-foreground/70">
              <li>
                <Link to="/cursos" className="hover:text-accent">
                  Cursos
                </Link>
              </li>
              <li>
                <Link to="/sobre" className="hover:text-accent">
                  Sobre nós
                </Link>
              </li>
              <li>
                <Link to="/contactos" className="hover:text-accent">
                  Contactos
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-3 font-semibold">Conta</p>
            <ul className="space-y-2 text-primary-foreground/70">
              <li>
                <Link to="/login" className="hover:text-accent">
                  Entrar
                </Link>
              </li>
              <li>
                <Link to="/minha-conta" className="hover:text-accent">
                  Minha conta
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 py-5 text-center text-xs text-primary-foreground/60">
        © {new Date().getFullYear()} Ondjala Academy. Todos os direitos reservados.
      </div>
    </footer>
  );
}
