-- ===== Enums =====
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'student');
CREATE TYPE public.registration_status AS ENUM ('pendente', 'confirmada', 'cancelada');
CREATE TYPE public.payment_status AS ENUM ('pendente', 'pago', 'falhado', 'reembolsado');

-- ===== updated_at helper =====
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ===== profiles =====
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  birth_date DATE,
  province TEXT,
  municipality TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ===== user_roles =====
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','staff'));
$$;

CREATE POLICY "profiles_select_own_or_staff" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "user_roles_select_own_or_staff" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()));

-- ===== courses =====
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  area TEXT NOT NULL,
  short_description TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  objectives TEXT[] NOT NULL DEFAULT '{}',
  duration TEXT NOT NULL DEFAULT '',
  modality TEXT NOT NULL DEFAULT '',
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'AOA',
  cover_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.courses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.courses TO authenticated;
GRANT ALL ON public.courses TO service_role;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "courses_public_read" ON public.courses FOR SELECT TO anon, authenticated
  USING (is_published OR public.is_staff(auth.uid()));
CREATE POLICY "courses_admin_write" ON public.courses FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER courses_set_updated_at BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== course_modules =====
CREATE TABLE public.course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  position INT NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.course_modules TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.course_modules TO authenticated;
GRANT ALL ON public.course_modules TO service_role;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "modules_public_read" ON public.course_modules FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "modules_admin_write" ON public.course_modules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ===== classes (turmas) =====
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE,
  schedule TEXT NOT NULL DEFAULT '',
  seats INT NOT NULL DEFAULT 30,
  seats_taken INT NOT NULL DEFAULT 0,
  is_open BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.classes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.classes TO authenticated;
GRANT ALL ON public.classes TO service_role;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "classes_public_read" ON public.classes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "classes_admin_write" ON public.classes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ===== registrations =====
CREATE SEQUENCE public.registration_number_seq START 1000;

CREATE TABLE public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_number TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE RESTRICT,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  whatsapp TEXT NOT NULL DEFAULT '',
  birth_date DATE,
  province TEXT NOT NULL DEFAULT '',
  municipality TEXT NOT NULL DEFAULT '',
  status public.registration_status NOT NULL DEFAULT 'pendente',
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.registrations TO authenticated;
GRANT ALL ON public.registrations TO service_role;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "registrations_select_own_or_staff" ON public.registrations FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "registrations_insert_own" ON public.registrations FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "registrations_update_staff" ON public.registrations FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER registrations_set_updated_at BEFORE UPDATE ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.set_registration_number()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.registration_number IS NULL OR NEW.registration_number = '' THEN
    NEW.registration_number := 'OA-' || to_char(now(), 'YYYY') || '-' ||
      lpad(nextval('public.registration_number_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER registrations_number BEFORE INSERT ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.set_registration_number();

ALTER TABLE public.registrations ALTER COLUMN registration_number DROP NOT NULL;

-- ===== payments =====
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'AOA',
  method TEXT NOT NULL DEFAULT 'pendente',
  status public.payment_status NOT NULL DEFAULT 'pendente',
  reference TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments_select_own_or_staff" ON public.payments FOR SELECT TO authenticated
  USING (
    public.is_staff(auth.uid())
    OR EXISTS (SELECT 1 FROM public.registrations r WHERE r.id = registration_id AND r.user_id = auth.uid())
  );
CREATE POLICY "payments_staff_write" ON public.payments FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER payments_set_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== Seed: cursos =====
INSERT INTO public.courses (slug, title, area, short_description, description, objectives, duration, modality, price, position) VALUES
('e-commerce', 'E-Commerce', 'E-Commerce',
 'Cria, gere e escala a tua loja online do zero até às primeiras vendas.',
 'Um programa prático onde aprendes a estruturar um negócio digital: escolha de produto, construção da loja online, logística, atendimento e estratégias de venda adaptadas ao mercado angolano.',
 ARRAY['Criar uma loja online funcional','Selecionar produtos com procura real','Gerir stock, entregas e atendimento','Aumentar as vendas com funis simples'],
 '8 semanas', 'Presencial e Online', 85000, 1),
('marketing', 'Marketing', 'Marketing',
 'Domina marketing digital, redes sociais e campanhas que geram resultados.',
 'Aprende a construir marca, produzir conteúdo, gerir redes sociais e lançar campanhas pagas com orçamento controlado, medindo cada resultado.',
 ARRAY['Definir posicionamento e público-alvo','Produzir conteúdo consistente','Criar campanhas pagas eficazes','Medir e otimizar resultados'],
 '6 semanas', 'Presencial e Online', 75000, 2),
('importacao', 'Importação', 'Importação',
 'Importa com segurança: fornecedores, custos, transporte e desalfandegamento.',
 'Um curso completo sobre importação para Angola: pesquisa e negociação com fornecedores, cálculo de custos reais, modalidades de transporte, documentação e processo alfandegário.',
 ARRAY['Encontrar e validar fornecedores','Calcular o custo real de importação','Escolher o transporte adequado','Tratar documentação e alfândega'],
 '6 semanas', 'Presencial e Online', 90000, 3),
('inteligencia-artificial', 'Inteligência Artificial', 'Inteligência Artificial',
 'Usa ferramentas de IA para produzir mais, melhor e em menos tempo.',
 'Formação prática em inteligência artificial aplicada ao trabalho e ao negócio: automação de tarefas, criação de conteúdo, análise de dados e uso responsável das ferramentas.',
 ARRAY['Dominar as principais ferramentas de IA','Automatizar tarefas repetitivas','Criar conteúdo e imagens com IA','Aplicar IA na análise de dados'],
 '8 semanas', 'Presencial e Online', 95000, 4);

-- ===== Seed: módulos =====
INSERT INTO public.course_modules (course_id, position, title, description)
SELECT c.id, m.position, m.title, m.description FROM public.courses c
JOIN (VALUES
 ('e-commerce',1,'Fundamentos do comércio digital','Modelos de negócio, mercado e oportunidades.'),
 ('e-commerce',2,'Escolha de produto e fornecedores','Como validar procura e margem.'),
 ('e-commerce',3,'Construção da loja online','Plataformas, catálogo, pagamentos e entregas.'),
 ('e-commerce',4,'Vendas e atendimento','Funis, redes sociais e experiência do cliente.'),
 ('marketing',1,'Marca e posicionamento','Identidade, proposta de valor e público.'),
 ('marketing',2,'Conteúdo e redes sociais','Planeamento, produção e calendário editorial.'),
 ('marketing',3,'Tráfego pago','Campanhas em Meta e Google com orçamento real.'),
 ('marketing',4,'Métricas e otimização','KPIs, relatórios e decisões baseadas em dados.'),
 ('importacao',1,'Introdução à importação','Cadeia logística e intervenientes.'),
 ('importacao',2,'Fornecedores e negociação','Pesquisa, verificação e contratos.'),
 ('importacao',3,'Custos e transporte','Incoterms, frete aéreo e marítimo.'),
 ('importacao',4,'Documentação e alfândega','Processos, taxas e desalfandegamento.'),
 ('inteligencia-artificial',1,'Fundamentos de IA','O que é, como funciona e limites.'),
 ('inteligencia-artificial',2,'Ferramentas essenciais','Assistentes, imagem, voz e vídeo.'),
 ('inteligencia-artificial',3,'Automação de processos','Fluxos de trabalho e produtividade.'),
 ('inteligencia-artificial',4,'IA aplicada ao negócio','Casos práticos e uso responsável.')
) AS m(slug, position, title, description) ON m.slug = c.slug;

-- ===== Seed: turmas =====
INSERT INTO public.classes (course_id, name, start_date, schedule, seats, seats_taken)
SELECT c.id, t.name, t.start_date::date, t.schedule, t.seats, t.seats_taken FROM public.courses c
JOIN (VALUES
 ('e-commerce','Turma A - Manhã','2026-11-02','Seg a Qua, 09h00-12h00',30,12),
 ('e-commerce','Turma B - Pós-laboral','2026-11-16','Ter e Qui, 18h00-21h00',30,7),
 ('marketing','Turma A - Pós-laboral','2026-11-09','Seg e Qua, 18h00-21h00',30,15),
 ('importacao','Turma A - Sábados','2026-11-07','Sábados, 09h00-13h00',25,9),
 ('inteligencia-artificial','Turma A - Pós-laboral','2026-11-23','Ter e Qui, 18h00-21h00',25,5)
) AS t(slug, name, start_date, schedule, seats, seats_taken) ON t.slug = c.slug;