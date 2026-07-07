import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createAgentLlmBundle } from "@/lib/agent/text-llm";
import { regeneratePostCover } from "@/lib/agent/regenerate-post-cover";

/** Ops endpoint: generate cover for a post and optionally republish webhook. Bearer CRON_SECRET. */
export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { postId?: string; republish?: boolean };
  try {
    body = (await req.json()) as { postId?: string; republish?: boolean };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.postId?.trim()) {
    return NextResponse.json({ error: "postId is required" }, { status: 400 });
  }

  let llm: ReturnType<typeof createAgentLlmBundle>;
  try {
    llm = createAgentLlmBundle();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "AI not configured";
    return NextResponse.json({ error: msg }, { status: 503 });
  }

  try {
    const result = await regeneratePostCover(createAdminClient(), llm, body.postId.trim(), {
      republish: body.republish !== false,
      logLabel: "[internal/regenerate-cover]",
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Cover regeneration failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
