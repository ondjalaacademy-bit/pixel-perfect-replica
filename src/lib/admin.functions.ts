import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Verificação de permissão feita no servidor — nunca no cliente. */
async function assertStaff(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId);
  if (error) throw new Error(error.message);
  const roles = (data ?? []).map((r: { role: string }) => r.role);
  if (!roles.includes("admin") && !roles.includes("staff")) {
    throw new Error("Sem permissão para aceder à área administrativa.");
  }
  return roles as string[];
}

export const getMyRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r: { role: string }) => r.role) as string[];
  });

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context);

    const { data: registrations, error } = await context.supabase
      .from("registrations")
      .select(
        "id, registration_number, full_name, email, status, amount, created_at, courses(title), classes(name)",
      )
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);

    const { data: payments } = await context.supabase.from("payments").select("status, amount");
    const { count: studentsCount } = await context.supabase
      .from("profiles")
      .select("id", { count: "exact", head: true });

    const rows = registrations ?? [];
    const pagos = (payments ?? []).filter((p: { status: string }) => p.status === "pago");

    return {
      registrations: rows,
      stats: {
        students: studentsCount ?? 0,
        total: rows.length,
        pending: rows.filter((r: { status: string }) => r.status === "pendente").length,
        confirmed: rows.filter((r: { status: string }) => r.status === "confirmada").length,
        pendingPayments: (payments ?? []).filter((p: { status: string }) => p.status === "pendente")
          .length,
        revenue: pagos.reduce((sum: number, p: { amount: number }) => sum + Number(p.amount), 0),
      },
    };
  });

export const updateRegistrationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status: "pendente" | "confirmada" | "cancelada" }) => data)
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { error } = await context.supabase
      .from("registrations")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
