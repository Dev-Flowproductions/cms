import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  const supabase = await createClient();

  // Verify the caller is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only admins may push
  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();
  if (roleRow?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch the post + its active localization + the owner's client webhook config
  const admin = createAdminClient();
  const { data: post, error: postError } = await admin
    .from("posts")
    .select(`
      id, slug, author_id, status,
      post_localizations (
        locale, title, content, meta_description, json_ld
      ),
      cover_image_path
    `)
    .eq("id", postId)
    .single();

  if (postError || !post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // Fetch the author's client webhook config
  const { data: client, error: clientError } = await admin
    .from("clients")
    .select("webhook_url, webhook_secret, auto_publish, domain")
    .eq("user_id", post.author_id)
    .maybeSingle();

  if (clientError || !client) {
    return NextResponse.json({ error: "No client configuration found for this post's author." }, { status: 404 });
  }

  if (!client.webhook_url) {
    return NextResponse.json(
      { error: "This client has not configured a publish webhook URL. Ask them to add it in their account settings." },
      { status: 422 }
    );
  }

  // Build the cover image public URL if available
  let coverImageUrl: string | null = null;
  if (post.cover_image_path) {
    const { data: urlData } = admin.storage
      .from("post-images")
      .getPublicUrl(post.cover_image_path);
    coverImageUrl = urlData?.publicUrl ?? null;
  }

  // Determine primary localization (prefer 'pt', then 'en', then first)
  const localizations = post.post_localizations ?? [];
  const primary =
    localizations.find((l: { locale: string }) => l.locale === "pt") ??
    localizations.find((l: { locale: string }) => l.locale === "en") ??
    localizations[0];

  if (!primary) {
    return NextResponse.json({ error: "Post has no content." }, { status: 422 });
  }

  const payload = {
    event: "cms.post.published",
    post: {
      id: post.id,
      slug: post.slug,
      title: primary.title,
      content: primary.content,
      meta_description: primary.meta_description,
      json_ld: primary.json_ld,
      cover_image_url: coverImageUrl,
      locale: primary.locale,
      all_localizations: localizations,
    },
    timestamp: new Date().toISOString(),
  };

  // Mark as pending before attempting
  await admin
    .from("posts")
    .update({
      webhook_status: "pending",
      webhook_sent_at: new Date().toISOString(),
      webhook_error: null,
    })
    .eq("id", postId);

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (client.webhook_secret) {
      headers["x-webhook-secret"] = client.webhook_secret;
    }

    const response = await fetch(client.webhook_url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      const errorMsg = `Webhook responded with ${response.status}: ${body.slice(0, 200)}`;

      await admin
        .from("posts")
        .update({
          webhook_status: "failed",
          webhook_error: errorMsg,
        })
        .eq("id", postId);

      return NextResponse.json({ error: errorMsg }, { status: 502 });
    }

    // Success — also set post status to published
    await admin
      .from("posts")
      .update({
        status: "published",
        webhook_status: "success",
        webhook_sent_at: new Date().toISOString(),
        webhook_error: null,
      })
      .eq("id", postId);

    return NextResponse.json({ success: true, deliveredAt: new Date().toISOString() });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";

    await admin
      .from("posts")
      .update({
        webhook_status: "failed",
        webhook_error: errorMsg,
      })
      .eq("id", postId);

    return NextResponse.json({ error: errorMsg }, { status: 502 });
  }
}
