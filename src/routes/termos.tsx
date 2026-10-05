import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/LegalPage";

const desc = "Condições de utilização da plataforma de cursos e inscrições da Ondjala Academy.";
export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de uso — Ondjala Academy" },
      { name: "description", content: desc },
      { property: "og:title", content: "Termos de uso — Ondjala Academy" },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <LegalPage
      eyebrow="Informação legal"
      title="Termos de uso"
      updated="Outubro de 2026"
      sections={[
        { h: "Aceitação", body: <p>Ao criar conta ou fazer uma inscrição na plataforma da Ondjala Academy, aceitas estes termos. Se não concordares, não utilizes a plataforma.</p> },
        { h: "Conta de utilizador", body: <p>És responsável pela veracidade dos dados que forneces e pela confidencialidade da tua palavra-passe. Avisa-nos de imediato se suspeitares de uso indevido da tua conta.</p> },
        { h: "Inscrições", body: <p>A inscrição num curso fica pendente até à confirmação do pagamento pela nossa equipa. As vagas de cada turma são limitadas e atribuídas por ordem de confirmação.</p> },
        { h: "Pagamentos", body: <><p>Os preços são apresentados em kwanzas (AOA). O pagamento é feito por transferência bancária, com envio do comprovativo na plataforma.</p><p>Comprovativos falsos ou ilegíveis podem levar à anulação da inscrição.</p></> },
        { h: "Cancelamentos e reembolsos", body: <p>Pedidos de cancelamento devem ser feitos pelos nossos contactos antes do início da turma. As condições de reembolso são comunicadas caso a caso.</p> },
        { h: "Alterações aos cursos", body: <p>A Ondjala Academy pode ajustar datas, horários, formadores ou conteúdos por razões de organização, informando os alunos inscritos com antecedência.</p> },
        { h: "Propriedade intelectual", body: <p>Os materiais dos cursos destinam-se ao uso pessoal do aluno. Não é permitida a sua reprodução ou distribuição sem autorização escrita.</p> },
        { h: "Conduta", body: <p>Espera-se respeito pelos formadores e colegas. Comportamentos abusivos podem levar à suspensão da conta sem reembolso.</p> },
        { h: "Lei aplicável", body: <p>Estes termos regem-se pela lei da República de Angola.</p> },
        { h: "Contacto", body: <p>Para dúvidas, consulta a página de <Link to="/contactos" className="text-accent underline">contactos</Link>. Lê também a nossa <Link to="/privacidade" className="text-accent underline">política de privacidade</Link>.</p> },
      ]}
    />
  ),
});
