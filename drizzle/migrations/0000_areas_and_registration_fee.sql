CREATE TABLE public.areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  position integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.areas TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.areas TO authenticated;
GRANT ALL ON public.areas TO service_role;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY areas_public_read ON public.areas FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY areas_admin_write ON public.areas FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.courses ADD COLUMN area_id uuid REFERENCES public.areas(id) ON DELETE SET NULL;
ALTER TABLE public.courses ADD COLUMN registration_fee numeric NOT NULL DEFAULT 0;

INSERT INTO public.areas (slug, name, position) VALUES
  ('e-commerce','E-Commerce',1),('marketing','Marketing',2),('importacao','Importação',3),('inteligencia-artificial','Inteligência Artificial',4)
ON CONFLICT (slug) DO NOTHING;
UPDATE public.courses c SET area_id = a.id FROM public.areas a WHERE a.name = c.area AND c.area_id IS NULL;