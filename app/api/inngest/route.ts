import type { NextRequest } from "next/server";
import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { runScheduler } from "@/lib/inngest/functions";
import { deliverDgStatusWebhook } from "@/lib/inngest/dg-status-webhook";
import { dgBriefRunGeneration } from "@/lib/inngest/dg-brief-generate";

export const maxDuration = 300;

const handler = serve({
  client: inngest,
  functions: [runScheduler, deliverDgStatusWebhook, dgBriefRunGeneration],
});

type RouteContext = { params: Promise<Record<string, string>> };

export async function GET(req: NextRequest, context: RouteContext) {
  return handler.GET(req, context);
}

export async function POST(req: NextRequest, context: RouteContext) {
  console.log("[inngest] Request received at", new Date().toISOString());
  return handler.POST(req, context);
}

export async function PUT(req: NextRequest, context: RouteContext) {
  return handler.PUT(req, context);
}
