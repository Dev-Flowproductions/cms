import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { runScheduler } from "@/lib/inngest/functions";

export const maxDuration = 300;

const handler = serve({
  client: inngest,
  functions: [runScheduler],
});

export async function GET(req: Request) {
  return handler.GET(req);
}

export async function POST(req: Request) {
  console.log("[inngest] Request received at", new Date().toISOString());
  return handler.POST(req);
}

export async function PUT(req: Request) {
  return handler.PUT(req);
}
