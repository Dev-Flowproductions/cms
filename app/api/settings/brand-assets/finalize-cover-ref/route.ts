import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateAndPersistCoverRef } from "@/lib/brand/finalize-cover-ref-server";

/** JSON only — file already in Storage from browser upload. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    ownerUserId: user.id,
    path,
    slot,
    persist: async (patch) => {
      const { error } = await supabase.from("clients").update(patch).eq("user_id", user.id);
      return { error };
    },
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ success: true, path });
}
