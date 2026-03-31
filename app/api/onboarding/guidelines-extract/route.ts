import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractBrandGuidelinesText } from "@/lib/agent/extract-guidelines-text";
import { resolveGuidelinesBuffer } from "@/lib/agent/guidelines-upload";
import { getMultipartBlob } from "@/lib/http/form-data";
import { MAX_BRAND_UPLOAD_BYTES, MAX_BRAND_UPLOAD_MB } from "@/lib/brand/brand-asset-limits";

/** Extract text from a guidelines file for onboarding preview (no DB write). */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      {
        error: `Could not read upload (body too large or broken). Max ${MAX_BRAND_UPLOAD_MB}MB; try a smaller file or compress the PDF.`,
      },
      { status: 413 },
    );
  }
  const blob = getMultipartBlob(formData, "file", "upload");
  if (!blob) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }
  if (blob.size > MAX_BRAND_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `File too large (max ${MAX_BRAND_UPLOAD_MB}MB)` },
      { status: 400 },
    );
  }

  const buf = Buffer.from(await blob.arrayBuffer());
  const uploadName = blob instanceof File ? blob.name : "";
  const resolved = resolveGuidelinesBuffer(uploadName, blob.type, buf);
  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: 400 });
  }

  const extractName =
    uploadName && /\.(pdf|md|markdown|txt|text)$/i.test(uploadName)
      ? uploadName
      : `guidelines.${resolved.ext}`;

  let text = "";
  try {
    text = await extractBrandGuidelinesText(buf, resolved.contentType, extractName);
  } catch (e) {
    console.warn("[onboarding/guidelines-extract]", e);
  }

  return NextResponse.json({ text: text.trim() });
}
