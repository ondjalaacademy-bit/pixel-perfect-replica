import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type RegistrationInput = {
  courseId: string;
  classId: string | null;
  fullName: string;
  email: string;
  phone: string;
  whatsapp: string;
  birthDate: string | null;
  province: string;
  municipality: string;
};

export const createRegistration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: RegistrationInput) => {
    if (!data.courseId) throw new Error("Curso em falta.");
    if (!data.fullName?.trim()) throw new Error("Nome completo obrigatório.");
    if (!data.email?.trim()) throw new Error("Email obrigatório.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { data: course, error: courseError } = await context.supabase
      .from("courses")
      .select("id, price")
      .eq("id", data.courseId)
      .maybeSingle();
    if (courseError) throw new Error(courseError.message);
    if (!course) throw new Error("Curso não encontrado.");

    const { data: registration, error } = await context.supabase
      .from("registrations")
      .insert({
        user_id: context.userId,
        course_id: course.id,
        class_id: data.classId,
        full_name: data.fullName.trim(),
        email: data.email.trim(),
        phone: data.phone ?? "",
        whatsapp: data.whatsapp ?? "",
        birth_date: data.birthDate || null,
        province: data.province ?? "",
        municipality: data.municipality ?? "",
        amount: course.price,
      })
      .select("id, registration_number")
      .single();
    if (error) throw new Error(error.message);

    await context.supabase.from("profiles").upsert({
      id: context.userId,
      full_name: data.fullName.trim(),
      email: data.email.trim(),
      phone: data.phone ?? "",
      whatsapp: data.whatsapp ?? "",
      birth_date: data.birthDate || null,
      province: data.province ?? "",
      municipality: data.municipality ?? "",
    });

    return registration;
  });

export const getMyRegistrations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("registrations")
      .select(
        "id, registration_number, status, amount, created_at, full_name, courses(title, slug), classes(name, start_date), payments(status, amount)",
      )
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });
