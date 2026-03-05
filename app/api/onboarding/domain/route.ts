import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const domain = body?.domain?.toString().trim().toLowerCase().replace(/^https?:\/\//, "");

  if (!domain) {
    return NextResponse.json({ error: "Domain is required" }, { status: 400 });
  }

  // Check if another client already registered this domain
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("clients")
    .select("user_id")
    .eq("domain", domain)
    .maybeSingle();

  if (existing && existing.user_id !== user.id) {
    return NextResponse.json(
      { error: "domain_taken" },
      { status: 409 }
    );
  }

  const { error } = await supabase
    .from("clients")
    .update({ domain })
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
