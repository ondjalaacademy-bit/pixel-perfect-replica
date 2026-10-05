import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/LegalPage";

const desc = "Como a Ondjala Academy recolhe, usa e protege os teus dados pessoais.";
export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de privacidade — Ondjala Academy" },
      { name: "description", content: desc },
      { property: "og:title", content: "Política de privacidade — Ondjala Academy" },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <LegalPage
      eyebrow="Informação legal"
      title="Política de privacidade"
      updated="Outubro de 2026"
      sections={[
        { h: "Quem somos", body: <p>A Ondjala Academy é responsável pelo tratamento dos dados pessoais recolhidos nesta plataforma, nos termos da Lei n.º 22/11 de Proteção de Dados Pessoais de Angola.</p> },
        { h: "Dados que recolhemos", body: <p>Nome completo, email, telefone, WhatsApp, data de nascimento, província e município, curso e turma escolhidos, e os comprovativos de pagamento que envias.</p> },
        { h: "Para que usamos", body: <p>Para gerir a tua conta e inscrições, confirmar pagamentos, comunicar contigo sobre os cursos e cumprir obrigações legais. Não vendemos os teus dados.</p> },
        { h: "Quem tem acesso", body: <p>Apenas tu e a equipa autorizada da Ondjala Academy. Os comprovativos de pagamento são guardados de forma privada e só são vistos pela equipa que os valida.</p> },
        { h: "Conservação", body: <p>Guardamos os dados enquanto a tua conta estiver ativa e pelo período exigido por lei para fins fiscais e contabilísticos.</p> },
        { h: "Os teus direitos", body: <p>Podes pedir acesso, correção ou eliminação dos teus dados, bem como opor-te ao seu tratamento, através dos nossos <Link to="/contactos" className="text-accent underline">contactos</Link>.</p> },
        { h: "Segurança", body: <p>Usamos ligações cifradas e controlo de acessos por perfil para proteger a informação.</p> },
        { h: "Cookies", body: <p>Usamos apenas o armazenamento necessário para manter a tua sessão iniciada.</p> },
        { h: "Alterações", body: <p>Esta política pode ser atualizada. A data no topo indica a versão em vigor. Consulta também os <Link to="/termos" className="text-accent underline">termos de uso</Link>.</p> },
      ]}
    />
  ),
});
