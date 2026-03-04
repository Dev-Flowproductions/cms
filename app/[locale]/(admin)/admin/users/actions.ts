"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

export type Frequency = "daily" | "weekly" | "biweekly" | "monthly";

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  display_name: z.string().optional(),
  domain: z.string().min(1, "Domain is required"),
  ga_api_key: z.string().optional(),
  gcc_api_key: z.string().optional(),
  frequency: z.enum(["daily", "weekly", "biweekly", "monthly"]),
});

export async function createUser(formData: FormData) {
  await requireAdmin();

  const parsed = createUserSchema.safeParse({
    email: formData.get("email")?.toString().trim(),
    password: formData.get("password")?.toString(),
    display_name: formData.get("display_name")?.toString().trim() || undefined,
    domain: formData.get("domain")?.toString().trim(),
    ga_api_key: formData.get("ga_api_key")?.toString().trim() || undefined,
    gcc_api_key: formData.get("gcc_api_key")?.toString().trim() || undefined,
    frequency: formData.get("frequency")?.toString() ?? "weekly",
  });

  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return { error: firstError ?? "Invalid input" };
  }

  const { email, password, display_name, domain, ga_api_key, gcc_api_key, frequency } = parsed.data;
  const admin = createAdminClient();

  // 1. Create auth user
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (authError) return { error: authError.message };
  const userId = authData.user.id;

  // 2. Upsert profile display name if provided
  if (display_name) {
    await admin.from("profiles").update({ display_name }).eq("id", userId);
  }

  // 3. Assign contributor role
  const { error: roleError } = await admin
    .from("user_roles")
    .insert({ user_id: userId, role_id: "contributor" });
  if (roleError) {
    // Roll back: delete the auth user
    await admin.auth.admin.deleteUser(userId);
    return { error: roleError.message };
  }

  // 4. Create clients row
  const { error: clientError } = await admin.from("clients").insert({
    user_id: userId,
    domain,
    ga_api_key: ga_api_key ?? null,
    gcc_api_key: gcc_api_key ?? null,
    frequency,
  });
  if (clientError) {
    await admin.auth.admin.deleteUser(userId);
    return { error: clientError.message };
  }

  return { success: true, userId };
}

export type ClientRow = {
  id: string;
  user_id: string;
  domain: string;
  ga_api_key: string | null;
  gcc_api_key: string | null;
  frequency: Frequency;
  created_at: string;
  profiles: { display_name: string | null; id: string } | null;
  email?: string;
};

export async function listUsers(): Promise<ClientRow[]> {
  await requireAdmin();
  const admin = createAdminClient();

  // Use admin client so RLS is bypassed and auth.admin is available
  const { data, error } = await admin
    .from("clients")
    .select("id, user_id, domain, ga_api_key, gcc_api_key, frequency, created_at, profiles(id, display_name)")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const rows = (data ?? []) as ClientRow[];

  // Fetch emails via auth.admin in parallel
  const emailMap: Record<string, string> = {};
  await Promise.all(
    rows.map(async (r) => {
      const { data: u } = await admin.auth.admin.getUserById(r.user_id);
      if (u?.user?.email) emailMap[r.user_id] = u.user.email;
    })
  );

  return rows.map((r) => ({ ...r, email: emailMap[r.user_id] ?? "" }));
}

export async function getClientSettings(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("id, domain, ga_api_key, gcc_api_key, frequency")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateClientFrequency(userId: string, frequency: Frequency) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("clients")
    .update({ frequency, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteUser(userId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };
  return { success: true };
}
