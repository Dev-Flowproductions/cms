import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MAX_BRAND_UPLOAD_BYTES, MAX_BRAND_UPLOAD_MB } from "@/lib/brand/brand-asset-limits";
import { buildCoverRefStoragePath, normalizeCoverRefFileExt } from "@/lib/brand/cover-ref-upload";

/** JSON only — large files go direct to Supabase Storage (bypasses platform body limits). */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  const rawExt = typeof body.ext === "string" ? body.ext : "jpg";
  const safeExt = normalizeCoverRefFileExt(rawExt);
  const path = buildCoverRefStoragePath(user.id, slot, safeExt);
  return NextResponse.json({ path });
}
