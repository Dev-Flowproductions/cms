import { NextRequest, NextResponse } from "next/server";

/**
 * Test webhook receiver — logs every incoming publish payload.
 * Use https://cms-seven-bay.vercel.app/api/test-webhook as the webhook URL
 * in the admin user management panel to verify the publish flow end-to-end.
 *
 * Returns the received payload back so you can inspect it in the browser's
 * network tab or in the admin publish error/success feedback.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const secret = req.headers.get("x-webhook-secret");

  console.log("[test-webhook] Received publish payload");
  console.log("[test-webhook] Secret header:", secret ?? "(none)");
  console.log("[test-webhook] Payload:", JSON.stringify(body, null, 2));

  return NextResponse.json({
    ok: true,
    message: "Test webhook received successfully",
    received_at: new Date().toISOString(),
    secret_header: secret ?? null,
    payload: body,
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Test webhook endpoint is live. Send a POST request to test publishing.",
    url: "/api/test-webhook",
  });
}
