import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateBrandBook } from "@/lib/brand-book/generate";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { userId, domain } = await req.json();

    if (!userId || !domain) {
      return NextResponse.json(
        { error: "userId and domain are required" },
        { status: 400 }
      );
    }

    console.log(`[brand-book API] Generating for ${domain} (user: ${userId})`);

    const result = await generateBrandBook(domain);

    if (!result.success || !result.brandBook) {
      return NextResponse.json(
        { error: result.error ?? "Failed to generate brand book" },
        { status: 500 }
      );
    }

    const admin = createAdminClient();
    const { error: updateError } = await admin
      .from("clients")
      .update({
        brand_book: result.brandBook,
        brand_name: result.brandBook.brandName,
        brand_tone: result.brandBook.voiceAttributes.join(", "),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("[brand-book API] Failed to save:", updateError);
      return NextResponse.json(
        { error: "Failed to save brand book" },
        { status: 500 }
      );
    }

    console.log(`[brand-book API] Saved brand book for ${result.brandBook.brandName}`);

    return NextResponse.json({
      success: true,
      brandBook: result.brandBook,
    });
  } catch (error) {
    console.error("[brand-book API] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}
