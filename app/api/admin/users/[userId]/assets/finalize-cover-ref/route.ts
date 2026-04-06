import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUser, getUserRoles, hasAdminRole } from "@/lib/auth";
import { validateAndPersistCoverRef } from "@/lib/brand/finalize-cover-ref-server";

function isValidTargetUserId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id.trim());
}

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

  let body: { path?: string; slot?: number };
  try {
    body = (await request.json()) as { path?: string; slot?: number };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const path = body.path?.trim() ?? "";
  const slot = Number(body.slot);
  if (!path || (slot !== 1 && slot !== 2 && slot !== 3)) {
    return NextResponse.json({ error: "Invalid path or slot" }, { status: 400 });
  }

  const admin = createAdminClient();
  const result = await validateAndPersistCoverRef({
    admin,
    ownerUserId: targetId,
    path,
    slot,
    persist: async (patch) => {
      const { error } = await admin.from("clients").update(patch).eq("user_id", targetId);
      return { error };
    },
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ success: true, path });
}
