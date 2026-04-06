import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUser, getUserRoles, hasAdminRole } from "@/lib/auth";
import { MAX_BRAND_UPLOAD_BYTES, MAX_BRAND_UPLOAD_MB } from "@/lib/brand/brand-asset-limits";
import { buildCoverRefStoragePath, normalizeCoverRefFileExt } from "@/lib/brand/cover-ref-upload";

const BUCKET = "brand-assets";

function isValidTargetUserId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id.trim());
}

/** JSON + signed upload token — browser uploads direct to Storage (bypasses platform body limits). */
export async function POST(
  request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  const { userId: targetUserId } = await context.params;
  const targetId = targetUserId?.trim() ?? "";
  if (!targetId || !isValidTargetUserId(targetId)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  const sessionUser = await getUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const roles = await getUserRoles(sessionUser.id);
  if (!hasAdminRole(roles)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { slot?: number; ext?: string; sizeBytes?: number };
  try {
    body = (await request.json()) as { slot?: number; ext?: string; sizeBytes?: number };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const slot = Number(body.slot);
  if (slot !== 1 && slot !== 2 && slot !== 3) {
    return NextResponse.json({ error: "Invalid slot" }, { status: 400 });
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
    .eq("user_id", targetId)
    .maybeSingle();
  if (clientErr || !clientRow) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const rawExt = typeof body.ext === "string" ? body.ext : "jpg";
  const safeExt = normalizeCoverRefFileExt(rawExt);
  const path = buildCoverRefStoragePath(targetId, slot, safeExt);

  const { data: signData, error: signErr } = await admin.storage
    .from(BUCKET)
    .createSignedUploadUrl(path, { upsert: true });
  if (signErr || !signData?.token || !signData.path) {
    return NextResponse.json(
      { error: signErr?.message ?? "Could not create upload URL" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    path: signData.path,
    token: signData.token,
  });
}
