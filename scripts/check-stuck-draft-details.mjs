import fs from "fs";

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const k = t.slice(0, i);
    let v = t.slice(i + 1);
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnv(".env.local");

const { createClient } = await import("@supabase/supabase-js");
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ids = [
  "e640cf82-c52e-449d-86b4-9f102043d9ca",
  "e610aa41-7e66-4a47-8200-b5a8ff8a3ffc",
  "f2048024-55d7-49a0-a1cd-04f590ef8fe2",
];

for (const id of ids) {
  const { data: post } = await sb.from("posts").select("*").eq("id", id).single();
  const { data: runs } = await sb
    .from("agent_runs")
    .select("id, locale, status, error, model, created_at, updated_at")
    .eq("post_id", id)
    .order("created_at", { ascending: false });
  const { data: locs } = await sb.from("post_localizations").select("*").eq("post_id", id);
  console.log("\n===", post?.slug, post?.status, "===");
  console.log("created", post?.created_at, "cover", post?.cover_image_path);
  console.log("agent_runs", runs);
  console.log("localizations", locs?.length ?? 0);
}
