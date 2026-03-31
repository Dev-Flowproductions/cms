import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractBrandGuidelinesText } from "@/lib/agent/extract-guidelines-text";
import { resolveGuidelinesBuffer } from "@/lib/agent/guidelines-upload";

const BUCKET = "brand-assets";

function isUserGuidelinesObjectPath(userId: string, path: string): boolean {
  if (!path || path.includes("..") || path.includes("//")) return false;
  return path.startsWith(`${userId}/guidelines-`);
}

async function removeStoragePath(admin: SupabaseClient, p: string | null | undefined) {
  if (!p?.trim()) return;
  await admin.storage.from(BUCKET).remove([p.trim()]);
}

/** Small JSON body `{ path }` — file already in Storage from browser upload. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { path?: string };
  try {
    body = (await request.json()) as { path?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const path = body.path?.trim() ?? "";
  if (!isUserGuidelinesObjectPath(user.id, path)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: clientRow, error: clientErr } = await admin
    .from("clients")
    .select("brand_guidelines_storage_path")
    .eq("user_id", user.id)
    .maybeSingle();

  if (clientErr || !clientRow) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const { data: fileBlob, error: dlErr } = await admin.storage.from(BUCKET).download(path);
  if (dlErr || !fileBlob) {
    return NextResponse.json(
      { error: dlErr?.message ?? "Could not read uploaded file from storage" },
      { status: 400 },
    );
  }

  const buf = Buffer.from(await fileBlob.arrayBuffer());
  const baseName = path.split("/").pop() ?? path;
  const declaredMime =
    typeof (fileBlob as Blob).type === "string" ? (fileBlob as Blob).type : "";
  const resolved = resolveGuidelinesBuffer(baseName, declaredMime, buf);
  if (!resolved.ok) {
    await removeStoragePath(admin, path);
    return NextResponse.json({ error: resolved.error }, { status: 400 });
  }

  const extractName =
    baseName && /\.(pdf|md|markdown|txt|text)$/i.test(baseName)
      ? baseName
      : `guidelines.${resolved.ext}`;

  const prevPath = clientRow.brand_guidelines_storage_path?.trim() || null;
  if (prevPath && prevPath !== path) {
    await removeStoragePath(admin, prevPath);
  }

  let extracted = "";
  try {
    extracted = await extractBrandGuidelinesText(buf, resolved.contentType, extractName);
  } catch (e) {
    console.warn("[finalize-guidelines] Extract failed:", e);
    extracted = "";
  }

  const { error } = await supabase
    .from("clients")
    .update({
      brand_guidelines_storage_path: path,
      brand_guidelines_text: extracted.trim() || null,
    })
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, path, extractedLength: extracted.length });
}
