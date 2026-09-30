DROP POLICY "courses_public_read" ON public.courses;

CREATE POLICY "courses_anon_read_published" ON public.courses FOR SELECT TO anon
  USING (is_published);

CREATE POLICY "courses_auth_read" ON public.courses FOR SELECT TO authenticated
  USING (is_published OR public.is_staff(auth.uid()));

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated, service_role;