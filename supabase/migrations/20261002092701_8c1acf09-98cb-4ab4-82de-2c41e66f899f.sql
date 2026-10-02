INSERT INTO public.user_roles (user_id, role)
VALUES ('3aaa0f0a-8c2c-445a-9d42-1b01ac17c1a9', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;