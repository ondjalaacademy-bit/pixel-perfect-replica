ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS proof_path text, ADD COLUMN IF NOT EXISTS notes text;

CREATE POLICY payments_insert_own ON public.payments FOR INSERT TO authenticated
WITH CHECK (
  status = 'pendente' AND paid_at IS NULL AND
  EXISTS (SELECT 1 FROM public.registrations r WHERE r.id = registration_id AND r.user_id = auth.uid() AND r.amount = payments.amount)
);

CREATE TABLE public.settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  bank_name text NOT NULL DEFAULT '',
  account_holder text NOT NULL DEFAULT '',
  iban text NOT NULL DEFAULT '',
  payment_instructions text NOT NULL DEFAULT '',
  contact_email text NOT NULL DEFAULT '',
  contact_phone text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.settings TO anon, authenticated;
GRANT UPDATE, INSERT ON public.settings TO authenticated;
GRANT ALL ON public.settings TO service_role;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY settings_read ON public.settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY settings_admin_write ON public.settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
INSERT INTO public.settings (id, payment_instructions) VALUES (1, 'Faz a transferência do valor da inscrição e indica o número da inscrição no descritivo. Depois envia o comprovativo.');

CREATE POLICY comprovativos_insert_own ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'comprovativos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY comprovativos_read_own_or_staff ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'comprovativos' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_staff(auth.uid())));