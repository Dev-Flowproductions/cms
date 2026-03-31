import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { MAX_BRAND_UPLOAD_BYTES, MAX_BRAND_UPLOAD_MB } from "@/lib/brand/brand-asset-limits";

function normalizeGuidelinesExt(raw: string): string | null {
  const e = raw.toLowerCase().replace(/^\./, "");
  if (e === "markdown") return "md";
  if (e === "text") return "txt";
  if (["pdf", "md", "txt"].includes(e)) return e;
  return null;
}

/** Small JSON body only — avoids platform request-body limits on large PDFs. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { ext?: string; sizeBytes?: number };
  try {
    body = (await request.json()) as { ext?: string; sizeBytes?: number };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const ext = normalizeGuidelinesExt(body.ext ?? "");
  if (!ext) {
    return NextResponse.json({ error: "Use PDF, TXT, or Markdown" }, { status: 400 });
  }

  const size = Number(body.sizeBytes);
  if (!Number.isFinite(size) || size <= 0) {
    return NextResponse.json({ error: "Invalid size" }, { status: 400 });
  }
  if (size > MAX_BRAND_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `File too large (max ${MAX_BRAND_UPLOAD_MB}MB)` },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const { data: clientRow, error: clientErr } = await admin
    .from("clients")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (clientErr || !clientRow) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const path = `${user.id}/guidelines-${Date.now()}.${ext}`;
  return NextResponse.json({ path });
}
