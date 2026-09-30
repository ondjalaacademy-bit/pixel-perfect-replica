import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  return createClient<Database>(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"]!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export type CourseRow = Database["public"]["Tables"]["courses"]["Row"];
export type ModuleRow = Database["public"]["Tables"]["course_modules"]["Row"];
export type ClassRow = Database["public"]["Tables"]["classes"]["Row"];

export const listCourses = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .order("position", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as CourseRow[];
});

export const getCourseBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => ({ slug: String(data.slug) }))
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: course, error } = await supabase
      .from("courses")
      .select("*")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!course) return null;

    const [{ data: modules }, { data: classes }] = await Promise.all([
      supabase.from("course_modules").select("*").eq("course_id", course.id).order("position"),
      supabase.from("classes").select("*").eq("course_id", course.id).order("start_date"),
    ]);

    return {
      course: course as CourseRow,
      modules: (modules ?? []) as ModuleRow[],
      classes: (classes ?? []) as ClassRow[],
    };
  });

export const getCourseById = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => ({ id: String(data.id) }))
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: course, error } = await supabase
      .from("courses")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!course) return null;
    const { data: classes } = await supabase
      .from("classes")
      .select("*")
      .eq("course_id", course.id)
      .order("start_date");
    return { course: course as CourseRow, classes: (classes ?? []) as ClassRow[] };
  });
