"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { generateClientSpecificInstructions } from "@/lib/agent/generate-client-instructions";
import type { Frequency } from "@/lib/scheduler/frequency";
import { z } from "zod";
import { getPublicAppBaseUrl } from "@/lib/public-app-url";
export type PostLocale = "en" | "pt" | "fr";

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  display_name: z.string().optional(),
  avatar_url: z.union([z.string().url(), z.literal("")]).optional(),
  bio: z.string().optional(),
  job_title: z.string().optional(),
  frequency: z.enum(["weekly", "biweekly", "monthly"]),
  domain: z.string().optional(),
  company_name: z.string().optional(),
  logo_url: z.union([z.string().url(), z.literal("")]).optional(),
  primary_color: z.string().optional(),
  secondary_color: z.string().optional(),
  tertiary_color: z.string().optional(),
  alternative_color: z.string().optional(),
  font_style: z.string().optional(),
  brand_voice: z.string().optional(),
  webhook_url: z.union([z.string().url(), z.literal("")]).optional(),
  webhook_secret: z.string().optional(),
  auto_publish: z.enum(["on", "off"]).optional(),
});

export async function createUser(formData: FormData) {
  await requireAdmin();

  const rawDomain = formData.get("domain")?.toString().trim();
  const normalizedDomain = rawDomain
    ? rawDomain.toLowerCase().replace(/^https?:\/\//, "")
    : null;

  const parsed = createUserSchema.safeParse({
    email: formData.get("email")?.toString().trim(),
    password: formData.get("password")?.toString(),
    display_name: formData.get("display_name")?.toString().trim() || undefined,
    avatar_url: formData.get("avatar_url")?.toString().trim() || undefined,
    bio: formData.get("bio")?.toString().trim() || undefined,
    job_title: formData.get("job_title")?.toString().trim() || undefined,
    frequency: formData.get("frequency")?.toString() ?? "weekly",
    domain: normalizedDomain ?? undefined,
    company_name: formData.get("company_name")?.toString().trim() || undefined,
    logo_url: formData.get("logo_url")?.toString().trim() || undefined,
    primary_color: formData.get("primary_color")?.toString() || undefined,
    secondary_color: formData.get("secondary_color")?.toString() || undefined,
    tertiary_color: formData.get("tertiary_color")?.toString() || undefined,
    alternative_color: formData.get("alternative_color")?.toString() || undefined,
    font_style: formData.get("font_style")?.toString().trim() || undefined,
    brand_voice: formData.get("brand_voice")?.toString() || undefined,
    webhook_url: formData.get("webhook_url")?.toString().trim() || undefined,
    webhook_secret: formData.get("webhook_secret")?.toString().trim() || undefined,
    auto_publish: formData.get("auto_publish")?.toString() || undefined,
  });

  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return { error: firstError ?? "Invalid input" };
  }

  const {
    email,
    password,
    display_name,
    avatar_url,
    bio,
    job_title,
    frequency,
    domain,
    company_name,
    logo_url,
    primary_color,
    secondary_color,
    tertiary_color,
    alternative_color,
    font_style,
    brand_voice,
    webhook_url,
    webhook_secret,
    auto_publish,
  } = parsed.data;

  const admin = createAdminClient();

  if (normalizedDomain) {
    const { data: taken } = await admin.from("clients").select("user_id").eq("domain", normalizedDomain).maybeSingle();
    if (taken) return { error: "Domain already in use" };
  }

  // 1. Create auth user
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (authError) return { error: authError.message };
  const userId = authData.user.id;

  // 2. Profile: display_name, avatar_url, bio, job_title
  const profilePayload: Record<string, string | null> = {};
  if (display_name != null) profilePayload.display_name = display_name || null;
  if (avatar_url != null) profilePayload.avatar_url = avatar_url || null;
  if (bio != null) profilePayload.bio = bio || null;
  if (job_title != null) profilePayload.job_title = job_title || null;
  if (Object.keys(profilePayload).length > 0) {
    await admin.from("profiles").update(profilePayload).eq("id", userId);
  }

  // 3. Assign contributor role
  const { error: roleError } = await admin
    .from("user_roles")
    .insert({ user_id: userId, role_id: "user" });
  if (roleError) {
    await admin.auth.admin.deleteUser(userId);
    return { error: roleError.message };
  }

  // 4. Create clients row with full config
  const clientPayload = {
    user_id: userId,
    domain: normalizedDomain,
    frequency,
    company_name: company_name || null,
    logo_url: logo_url || null,
    primary_color: primary_color || null,
    secondary_color: secondary_color || null,
    tertiary_color: tertiary_color || null,
    alternative_color: alternative_color || null,
    font_style: font_style || null,
    brand_voice: brand_voice || null,
    brand_name: company_name || null,
    brand_tone: brand_voice || null,
    webhook_url: webhook_url || null,
    webhook_secret: webhook_secret || null,
    auto_publish: auto_publish === "on",
  };
  const { error: clientError } = await admin.from("clients").insert(clientPayload);
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
  /** Stored value; may include legacy e.g. daily — use {@link normalizeFrequencyForUi} for pickers. */
  frequency: string;
  post_locale: PostLocale;
  created_at: string;
  webhook_url: string | null;
  webhook_secret: string | null;
  auto_publish: boolean;
  brand_name: string | null;
  brand_tone: string | null;
  brand_book: BrandBook | null;
  company_name: string | null;
  profiles: { display_name: string | null; avatar_url: string | null; bio: string | null; job_title: string | null; id: string } | { display_name: string | null; avatar_url: string | null; bio: string | null; job_title: string | null; id: string }[] | null;
  email?: string;
  last_generation_error?: string | null;
  last_generation_error_at?: string | null;
  last_post_generated_at?: string | null;
  logo_url?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  tertiary_color?: string | null;
  alternative_color?: string | null;
  font_style?: string | null;
  brand_voice?: string | null;
  custom_instructions?: string | null;
  instruction_reinforcement?: string | null;
};

const ADMIN_CLIENT_ROW_SELECT =
  "id, user_id, domain, google_access_token, google_refresh_token, google_scope, google_connected_at, frequency, post_locale, created_at, webhook_url, webhook_secret, auto_publish, brand_name, brand_tone, brand_book, company_name, logo_url, primary_color, secondary_color, tertiary_color, font_style, brand_voice, custom_instructions, instruction_reinforcement, last_generation_error, last_generation_error_at, last_post_generated_at, profiles(id, display_name, avatar_url, bio, job_title)";

export async function listUsers(): Promise<ClientRow[]> {
  await requireAdmin();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("clients")
    .select(ADMIN_CLIENT_ROW_SELECT)
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

/** Single client row for admin user detail page (by auth user_id). */
export async function getClientRowByUserId(userId: string): Promise<ClientRow | null> {
  await requireAdmin();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("clients")
    .select(ADMIN_CLIENT_ROW_SELECT)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as ClientRow;
  const { data: u } = await admin.auth.admin.getUserById(userId);
  return { ...row, email: u?.user?.email ?? "" };
}

export async function getClientSettings(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("id, domain, google_access_token, google_connected_at, frequency, last_post_generated_at, post_locale, webhook_url, webhook_secret, auto_publish, company_name, logo_url, primary_color, secondary_color, tertiary_color, alternative_color, font_style, brand_voice, config_pending_admin, last_generation_error, last_generation_error_at, cover_reference_image_1, cover_reference_image_2, cover_reference_image_3, brand_guidelines_storage_path, brand_guidelines_text")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Admin: list clients waiting for admin to set webhook (config_pending_admin or has domain but no webhook). */
export async function getClientsPendingWebhook(): Promise<Array<{ user_id: string; email: string; display_name: string | null }>> {
  await requireAdmin();
  const admin = createAdminClient();
  const { data: rows, error } = await admin
    .from("clients")
    .select("user_id, webhook_url, config_pending_admin, domain, profiles(display_name)")
    .not("domain", "is", null);
  if (error) throw error;
  const pending = (rows ?? []).filter(
    (r: { config_pending_admin?: boolean; webhook_url?: string | null }) =>
      r.config_pending_admin === true || !(r.webhook_url?.trim())
  );
  const emailMap: Record<string, string> = {};
  await Promise.all(
    pending.map(async (r: { user_id: string }) => {
      const { data: u } = await admin.auth.admin.getUserById(r.user_id);
      if (u?.user?.email) emailMap[r.user_id] = u.user.email;
    })
  );
  return pending.map((r: { user_id: string; profiles?: { display_name: string | null } | { display_name: string | null }[] }) => ({
    user_id: r.user_id,
    email: emailMap[r.user_id] ?? "",
    display_name: Array.isArray(r.profiles) ? r.profiles[0]?.display_name ?? null : (r.profiles as { display_name: string | null } | null)?.display_name ?? null,
  }));
}

/** Current user's profile (for dashboard author section). */
export async function getMyProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, bio, job_title")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Update current user's profile (display_name, avatar_url, bio, job_title). */
export async function updateProfile(
  userId: string,
  data: { display_name?: string | null; avatar_url?: string | null; bio?: string | null; job_title?: string | null }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) return { error: "Forbidden" };
  const { error } = await supabase.from("profiles").update(data).eq("id", userId);
  if (error) return { error: error.message };
  return { success: true };
}

/** Admin: get full client + profile for any user (for edit form). */
export async function getClientSettingsByAdmin(userId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const [clientRes, profileRes] = await Promise.all([
    admin.from("clients").select("id, user_id, domain, frequency, post_locale, webhook_url, webhook_secret, webhook_event_format, auto_publish, company_name, logo_url, primary_color, secondary_color, tertiary_color, alternative_color, font_style, brand_voice, cover_reference_image_1, cover_reference_image_2, cover_reference_image_3, brand_guidelines_storage_path, brand_guidelines_text").eq("user_id", userId).maybeSingle(),
    admin.from("profiles").select("id, display_name, avatar_url, bio, job_title").eq("id", userId).maybeSingle(),
  ]);
  if (clientRes.error) throw clientRes.error;
  if (profileRes.error) throw profileRes.error;
  return { client: clientRes.data, profile: profileRes.data };
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

export async function updateClientDomain(userId: string, domain: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) return { error: "Forbidden" };

  const normalized = domain.trim().toLowerCase().replace(/^https?:\/\//, "");
  if (!normalized) return { error: "Domain is required" };

  const admin = createAdminClient();
  const { data: taken } = await admin
    .from("clients")
    .select("user_id")
    .eq("domain", normalized)
    .maybeSingle();
  if (taken && taken.user_id !== userId) {
    return { error: "domain_taken" };
  }

  const { error } = await supabase
    .from("clients")
    .update({ domain: normalized, updated_at: new Date().toISOString() })
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
  data: { webhook_url: string | null; webhook_secret: string | null; webhook_event_format?: "spec" | "legacy" | null; auto_publish?: boolean }
) {
  await requireAdmin();
  const admin = createAdminClient();
  const payload: Record<string, unknown> = {
    ...data,
    updated_at: new Date().toISOString(),
    // Admin has finished config for this user (webhook set)
    config_pending_admin: data.webhook_url?.trim() ? false : undefined,
  };
  if (payload.config_pending_admin === undefined) delete payload.config_pending_admin;
  const { error } = await admin.from("clients").update(payload).eq("user_id", userId);
  if (error) return { error: error.message };
  return { success: true };
}

/** Regenerates and saves clients.custom_instructions for the given user.
 * @param forceRegenerate - if true, always overwrites; if false (default), only writes when instructions are currently null/empty.
 */
async function regenerateClientInstructions(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  forceRegenerate = false,
): Promise<{ error?: string }> {
  const { data: client, error: fetchError } = await admin
    .from("clients")
    .select("domain, company_name, brand_name, brand_tone, brand_book, primary_color, secondary_color, tertiary_color, alternative_color, font_style, brand_voice, logo_url, custom_instructions")
    .eq("user_id", userId)
    .maybeSingle();
  if (fetchError) return { error: fetchError.message };
  if (!client) return { error: "Client not found" };
  // Don't overwrite manually-edited instructions unless explicitly requested
  if (!forceRegenerate && (client as { custom_instructions?: string | null }).custom_instructions?.trim()) {
    return {};
  }
  const customInstructions = generateClientSpecificInstructions(client);
  const { error: updateError } = await admin
    .from("clients")
    .update({ custom_instructions: customInstructions.trim() || null, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (updateError) return { error: updateError.message };
  return {};
}

/** Admin: generate (or force-regenerate) client-specific instructions from current brand/client data. */
export async function createClientInstructions(userId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const result = await regenerateClientInstructions(admin, userId, true);
  if (result.error) return { error: result.error };
  return { success: true };
}

/** Admin: update brand/client-specific instructions (generated block — not optional editorial reinforcement). */
export async function updateClientInstructions(userId: string, content: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("clients")
    .update({ custom_instructions: content.trim() || null, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) return { error: error.message };
  return { success: true };
}

/** Admin: optional editorial reinforcement appended to client instructions at generation time. */
export async function updateInstructionReinforcementByAdmin(userId: string, content: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("clients")
    .update({ instruction_reinforcement: content.trim() || null, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function updateClientDomainByAdmin(userId: string, domain: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const normalized = domain.trim().toLowerCase().replace(/^https?:\/\//, "") || null;
  const { data: taken } = normalized
    ? await admin.from("clients").select("user_id").eq("domain", normalized).maybeSingle()
    : { data: null };
  if (taken && taken.user_id !== userId) return { error: "domain_taken" };
  const { error } = await admin
    .from("clients")
    .update({ domain: normalized, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) return { error: error.message };
  await regenerateClientInstructions(admin, userId, true);
  return { success: true };
}

export async function updateClientFrequencyByAdmin(userId: string, frequency: Frequency) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("clients")
    .update({ frequency, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function updateClientBrandByAdmin(
  userId: string,
  data: {
    company_name?: string | null;
    logo_url?: string | null;
    primary_color?: string | null;
    secondary_color?: string | null;
    tertiary_color?: string | null;
    alternative_color?: string | null;
    font_style?: string | null;
    brand_voice?: string | null;
  }
) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("clients")
    .update({ ...data, brand_name: data.company_name ?? undefined, brand_tone: data.brand_voice ?? undefined, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) return { error: error.message };
  await regenerateClientInstructions(admin, userId, true);
  return { success: true };
}

export async function updateProfileByAdmin(
  userId: string,
  data: { display_name?: string | null; avatar_url?: string | null; bio?: string | null; job_title?: string | null }
) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update(data).eq("id", userId);
  if (error) return { error: error.message };
  return { success: true };
}

export type InternalLinkEntry = { url: string; label?: string | null };

export async function updateClientInternalLinksByAdmin(userId: string, internal_links: InternalLinkEntry[]) {
  await requireAdmin();
  const admin = createAdminClient();
  const sanitized = internal_links
    .filter((l) => l?.url?.trim())
    .map((l) => ({ url: l.url.trim(), label: l.label?.trim() || null }));
  const { error } = await admin
    .from("clients")
    .update({ internal_links: sanitized, updated_at: new Date().toISOString() })
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
  
  const base = getPublicAppBaseUrl();
  if (!base) return { error: "NEXT_PUBLIC_APP_URL is not configured." };
  const response = await fetch(`${base}/api/brand-book`, {
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

/** Row shape for admin blog author UI */
export type AdminBlogAuthorRow = {
  id: string;
  user_id: string;
  display_name: string;
  job_title: string | null;
  bio: string | null;
  avatar_url: string | null;
  sort_order: number;
  created_at: string;
};

function normalizeAvatarUrlForAdmin(raw: string | null | undefined): string | null {
  const t = (raw ?? "").trim();
  if (!t) return null;
  try {
    new URL(t);
    return t;
  } catch {
    return null;
  }
}

export async function getBlogAuthorsForClientByAdmin(clientUserId: string): Promise<AdminBlogAuthorRow[]> {
  await requireAdmin();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("blog_authors")
    .select("id, user_id, display_name, job_title, bio, avatar_url, sort_order, created_at")
    .eq("user_id", clientUserId)
    .order("display_name", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as AdminBlogAuthorRow[]) ?? [];
}

export async function adminCreateBlogAuthorForClient(clientUserId: string, formData: FormData) {
  await requireAdmin();
  const display_name = formData.get("display_name")?.toString().trim() ?? "";
  if (!display_name) return { error: "Name is required" };
  if (display_name.length > 200) return { error: "Name is too long" };
  const job_title = formData.get("job_title")?.toString().trim() || null;
  const bio = formData.get("bio")?.toString().trim() || null;
  const avatar_url = normalizeAvatarUrlForAdmin(formData.get("avatar_url")?.toString());

  const admin = createAdminClient();
  const { error } = await admin.from("blog_authors").insert({
    user_id: clientUserId,
    display_name,
    job_title: job_title && job_title.length <= 200 ? job_title : null,
    bio: bio && bio.length <= 4000 ? bio : null,
    avatar_url,
  });
  if (error) return { error: error.message };
  return { ok: true as const };
}

export async function adminUpdateBlogAuthorForClient(
  clientUserId: string,
  authorId: string,
  formData: FormData
) {
  await requireAdmin();
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("blog_authors")
    .select("id")
    .eq("id", authorId)
    .eq("user_id", clientUserId)
    .maybeSingle();
  if (!existing) return { error: "Author not found" };

  const display_name = formData.get("display_name")?.toString().trim() ?? "";
  if (!display_name) return { error: "Name is required" };
  if (display_name.length > 200) return { error: "Name is too long" };
  const job_title = formData.get("job_title")?.toString().trim() || null;
  const bio = formData.get("bio")?.toString().trim() || null;
  const avatar_url = normalizeAvatarUrlForAdmin(formData.get("avatar_url")?.toString());

  const { error } = await admin
    .from("blog_authors")
    .update({
      display_name,
      job_title: job_title && job_title.length <= 200 ? job_title : null,
      bio: bio && bio.length <= 4000 ? bio : null,
      avatar_url,
    })
    .eq("id", authorId)
    .eq("user_id", clientUserId);
  if (error) return { error: error.message };
  return { ok: true as const };
}

export async function adminDeleteBlogAuthorForClient(clientUserId: string, authorId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("blog_authors").delete().eq("id", authorId).eq("user_id", clientUserId);
  if (error) return { error: error.message };
  return { ok: true as const };
}
