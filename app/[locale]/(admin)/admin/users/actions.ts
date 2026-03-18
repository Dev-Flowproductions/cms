"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

export type Frequency = "daily" | "weekly" | "biweekly" | "monthly";
export type PostLocale = "en" | "pt" | "fr";

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  display_name: z.string().optional(),
  frequency: z.enum(["daily", "weekly", "biweekly", "monthly"]),
});

export async function createUser(formData: FormData) {
  await requireAdmin();

  const parsed = createUserSchema.safeParse({
    email: formData.get("email")?.toString().trim(),
    password: formData.get("password")?.toString(),
    display_name: formData.get("display_name")?.toString().trim() || undefined,
    frequency: formData.get("frequency")?.toString() ?? "weekly",
  });

  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return { error: firstError ?? "Invalid input" };
  }

  const { email, password, display_name, frequency } = parsed.data;
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
    .insert({ user_id: userId, role_id: "user" });
  if (roleError) {
    await admin.auth.admin.deleteUser(userId);
    return { error: roleError.message };
  }

  // 4. Create clients row — domain is null until onboarding completes
  const { error: clientError } = await admin.from("clients").insert({
    user_id: userId,
    domain: null,
    frequency,
  });
  if (clientError) {
    await admin.auth.admin.deleteUser(userId);
    return { error: clientError.message };
  }

  return { success: true, userId };
}

import type { BrandBook } from "@/lib/brand-book/types";

export type ClientRow = {
  id: string;
  user_id: string;
  domain: string | null;
  google_access_token: string | null;
  google_refresh_token: string | null;
  google_scope: string | null;
  google_connected_at: string | null;
  frequency: Frequency;
  post_locale: PostLocale;
  created_at: string;
  webhook_url: string | null;
  webhook_secret: string | null;
  auto_publish: boolean;
  brand_name: string | null;
  brand_tone: string | null;
  brand_book: BrandBook | null;
  company_name: string | null;
  profiles: { display_name: string | null; id: string } | { display_name: string | null; id: string }[] | null;
  email?: string;
  last_generation_error?: string | null;
  last_generation_error_at?: string | null;
  last_post_generated_at?: string | null;
};

export async function listUsers(): Promise<ClientRow[]> {
  await requireAdmin();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("clients")
    .select("id, user_id, domain, google_access_token, google_refresh_token, google_scope, google_connected_at, frequency, post_locale, created_at, webhook_url, webhook_secret, auto_publish, brand_name, brand_tone, brand_book, company_name, last_generation_error, last_generation_error_at, last_post_generated_at, profiles(id, display_name)")
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
    .select("id, domain, google_access_token, google_connected_at, frequency, post_locale, webhook_url, webhook_secret, auto_publish, company_name, logo_url, primary_color, secondary_color, font_style, brand_voice, last_generation_error, last_generation_error_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveOnboardingDomain(userId: string, domain: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("clients")
    .update({ domain: domain.trim() })
    .eq("user_id", userId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function saveGoogleTokens(
  userId: string,
  accessToken: string,
  refreshToken: string,
  scope: string
) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("clients")
    .update({
      google_access_token: accessToken,
      google_refresh_token: refreshToken,
      google_scope: scope,
      google_connected_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
  if (error) return { error: error.message };
  return { success: true };
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

export async function updateClientWebhook(
  userId: string,
  data: { webhook_url: string | null; webhook_secret: string | null; auto_publish: boolean }
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("clients")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function updateUserAutoPublish(userId: string, auto_publish: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("clients")
    .update({ auto_publish, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function updateUserWebhookByAdmin(
  userId: string,
  data: { webhook_url: string | null; webhook_secret: string | null }
) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("clients")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteUser(userId: string) {
  await requireAdmin();
  const admin = createAdminClient();

  // Delete in order: posts (author_id references profiles), then client, then user_roles, then auth user.
  // post_localizations cascade from posts. profiles cascade from auth.users.
  const { error: postsError } = await admin.from("posts").delete().eq("author_id", userId);
  if (postsError) return { error: `Failed to delete user posts: ${postsError.message}` };

  const { error: clientError } = await admin.from("clients").delete().eq("user_id", userId);
  if (clientError) return { error: `Failed to delete client: ${clientError.message}` };

  const { error: rolesError } = await admin.from("user_roles").delete().eq("user_id", userId);
  if (rolesError) return { error: `Failed to delete roles: ${rolesError.message}` };

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function updateClientPostLocale(userId: string, post_locale: PostLocale) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("clients")
    .update({ post_locale, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function updateClientBrand(
  userId: string,
  data: { brand_name: string | null; brand_tone: string | null }
) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("clients")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function regenerateBrandBook(userId: string, domain: string) {
  await requireAdmin();
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/brand-book`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, domain }),
  });

  if (!response.ok) {
    const data = await response.json();
    return { error: data.error ?? "Failed to regenerate brand book" };
  }

  return { success: true };
}

export async function updateBrandBook(userId: string, brandBook: BrandBook) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("clients")
    .update({
      brand_book: brandBook,
      brand_name: brandBook.brandName,
      brand_tone: brandBook.voiceAttributes.join(", "),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
  if (error) return { error: error.message };
  return { success: true };
}
