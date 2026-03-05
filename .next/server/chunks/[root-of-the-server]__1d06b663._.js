module.exports = [
"[project]/.next-internal/server/app/api/agent/generate/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/supabase/server.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createClient",
    ()=>createClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createServerClient.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
;
;
async function createClient() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createServerClient"])(("TURBOPACK compile-time value", "https://lltufugrmmzdagqypscg.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsdHVmdWdybW16ZGFncXlwc2NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MTg1MTYsImV4cCI6MjA4ODE5NDUxNn0.np20_7lUS2FE8PVf9jxtVjOy2JGRF_qICypC1SReF9o"), {
        cookies: {
            getAll () {
                return cookieStore.getAll();
            },
            setAll (cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options })=>cookieStore.set(name, value, options));
                } catch  {
                // Called from Server Component; ignore
                }
            }
        }
    });
}
}),
"[project]/lib/supabase/admin.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createAdminClient",
    ()=>createAdminClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-route] (ecmascript) <locals>");
;
function createAdminClient() {
    const url = ("TURBOPACK compile-time value", "https://lltufugrmmzdagqypscg.supabase.co");
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
        throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.");
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(url, key, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}
}),
"[project]/lib/agent/instructions.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Gemini system instructions for blog post generation.
 *
 * This file defines the exact structure, tone, and rules Gemini must follow
 * when generating a blog post. Client website data, Google Analytics and
 * Search Console context are injected at generation time via buildPrompt().
 */ __turbopack_context__.s([
    "SYSTEM_INSTRUCTIONS",
    ()=>SYSTEM_INSTRUCTIONS,
    "buildPrompt",
    ()=>buildPrompt
]);
const SYSTEM_INSTRUCTIONS = `
You are an expert content strategist, SEO copywriter, and brand voice specialist.
Your job is to write complete, publish-ready blog posts for clients.

You always follow the EXACT post structure below — no exceptions.
You write in the client's brand voice, using their website and analytics data as context.
You never invent facts. If you mention a statistic or claim, it must be plausible and attributable.

════════════════════════════════════════
REQUIRED POST STRUCTURE (in this exact order)
════════════════════════════════════════

1. PUBLICATION DATE LINE
   A single line at the very top with the post creation date.
   Format: _Published on {MMMM D, YYYY}_
   (Use the date provided in the context. Italicised markdown.)

2. H1 — TITLE
   # {Title with focus keyword}
   - Must include the focus keyword naturally.
   - Compelling, clear, under 70 characters.
   - Do NOT repeat the date here.

3. COVER IMAGE PLACEHOLDER
   A markdown image placeholder so the CMS can inject the cover image:
   ![Cover image]({COVER_IMAGE_PLACEHOLDER})
   Use exactly this string — the CMS replaces it at render time.

4. INTRODUCTION PARAGRAPH
   - 2-3 sentences. Hook the reader immediately.
   - State the problem or opportunity the post addresses.
   - Mention the focus keyword in the first sentence.

5. SECTION 1 — H2 + BODY TEXT
   ## {First section heading}
   - 2-4 paragraphs of substantive content.
   - Use **bold** for key terms.
   - Include at least one named entity (person, org, concept) with a citable fact.

6. SECTION 2 — H2 + BODY TEXT
   ## {Second section heading}
   - 2-4 paragraphs. Different angle from section 1.
   - May include a short bullet list if it aids clarity.

7. SECTION 3 — H2 + BODY TEXT
   ## {Third section heading}
   - 2-4 paragraphs. Practical, actionable content.
   - Include at least one example relevant to the client's industry/domain.

8. FAQ SECTION — H2 + Q&A BLOCKS
   ## Frequently Asked Questions
   Use this exact format for each FAQ item:
   **Q: {question}**
   A: {answer under 60 words, direct, snippet-optimised}

   Include 3-5 FAQ items. Questions must be genuine search queries related to the focus keyword.

9. CONCLUSION — H2
   ## {Conclusion heading}
   - 1-2 paragraphs wrapping up the key points.
   - End with a clear call-to-action relevant to the client's business.

════════════════════════════════════════
WRITING RULES
════════════════════════════════════════

SEO:
- Focus keyword in: H1, first paragraph, at least 2 H2s, meta description.
- Use 3-5 semantic keyword variants throughout.
- Heading hierarchy: H1 → H2 → H3 only (no jumping levels).
- No keyword stuffing. Density ~1-2%.

AEO (Answer Engine Optimisation):
- FAQ answers must be direct and self-contained (answerable without reading the full post).
- Include at least one definition block: "**{Term}** is..." in the intro or section 1.
- Use clear, concise language — short sentences preferred.

GEO (Generative Engine Optimisation):
- Mention at least 2 named entities with accurate context.
- Use attribution language: "According to...", "Research by...", "As reported by...".
- Include at least one specific, verifiable fact or statistic.
- Content must be structured for citation — entity-rich, evidence-backed.

BRAND & TONE:
- Write in the language specified (locale).
- Match the client's tone from their website context.
- If the website is formal/corporate → professional tone.
- If the website is casual/personal → conversational tone.
- Never use filler phrases like "In today's fast-paced world" or "In conclusion, it's clear that".

MARKDOWN RULES:
- Use ## for H2, ### for H3.
- Use **bold** for key terms, *italic* for emphasis only.
- Use - for bullet lists, 1. for numbered steps.
- No raw HTML. No code blocks unless the post is technical.
- No horizontal rules (---) except between major structural breaks if needed.

════════════════════════════════════════
OUTPUT FORMAT
════════════════════════════════════════

Respond with a single valid JSON object — no markdown code fences, no preamble, no trailing text.

{
  "title": "Display title (H1 text, no # prefix)",
  "seo_title": "SEO title tag — 50-60 chars, includes focus keyword",
  "seo_description": "Meta description — 140-160 chars, includes keyword, ends with CTA",
  "focus_keyword": "the focus keyword used",
  "excerpt": "1-2 sentence teaser for listing pages — under 160 chars",
  "content_md": "Full markdown post following the structure above exactly",
  "faq_blocks": [
    { "question": "...", "answer": "..." }
  ]
}

The content_md field must follow the structure: date line → H1 → cover image → intro → 3× (H2 + body) → FAQ → conclusion.
`.trim();
const CONTENT_TYPE_GUIDE = {
    hero: "long-form pillar article (1500-2500 words) — comprehensive, authoritative, multiple H2/H3 sections",
    hub: "cluster/supporting article (800-1200 words) — focused on one specific sub-topic",
    hygiene: "concise FAQ or how-to (400-700 words) — direct answers, snippet-optimised, scannable"
};
function buildPrompt(post, client) {
    const lines = [];
    lines.push("═══════════════════════════════");
    lines.push("POST CONTEXT");
    lines.push("═══════════════════════════════");
    lines.push(`Focus keyword: "${post.focus_keyword}"`);
    lines.push(`Content type: ${post.content_type} — ${CONTENT_TYPE_GUIDE[post.content_type] ?? "standard article"}`);
    lines.push(`Language/locale: ${post.locale}`);
    lines.push(`Slug: ${post.slug}`);
    lines.push(`Publication date: ${post.publication_date}`);
    if (post.existing_title) lines.push(`Existing title (improve if needed): ${post.existing_title}`);
    if (post.existing_draft) {
        lines.push(`Existing draft (use as base, improve significantly):`);
        lines.push(post.existing_draft.slice(0, 800) + (post.existing_draft.length > 800 ? "..." : ""));
    }
    lines.push("");
    lines.push("═══════════════════════════════");
    lines.push("CLIENT CONTEXT");
    lines.push("═══════════════════════════════");
    if (client.domain) lines.push(`Website: ${client.domain}`);
    if (client.industry) lines.push(`Industry: ${client.industry}`);
    if (client.websiteSummary) {
        lines.push(`About the client's website:`);
        lines.push(client.websiteSummary);
    }
    if (client.gaTopPages?.length) {
        lines.push(`Top performing pages (from Google Analytics):`);
        client.gaTopPages.slice(0, 5).forEach((p)=>lines.push(`  - ${p}`));
    }
    if (client.gaTopKeywords?.length) {
        lines.push(`Top organic keywords (from Google Analytics):`);
        client.gaTopKeywords.slice(0, 10).forEach((k)=>lines.push(`  - ${k}`));
    }
    if (client.searchConsoleQueries?.length) {
        lines.push(`Top Search Console queries (use these as semantic variants and FAQ topics):`);
        client.searchConsoleQueries.slice(0, 10).forEach((q)=>lines.push(`  - ${q}`));
    }
    lines.push("");
    lines.push("Use the client context above to:");
    lines.push("- Match the tone and topics relevant to their industry and audience.");
    lines.push("- Reference their domain/business naturally where appropriate.");
    lines.push("- Use top Search Console queries as FAQ questions and semantic keyword variants.");
    lines.push("- Align content with their top-performing pages to build topical authority.");
    return lines.join("\n");
}
}),
"[project]/app/api/agent/generate/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/server.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/admin.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@google/generative-ai/dist/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$agent$2f$instructions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/agent/instructions.ts [app-route] (ecmascript)");
;
;
;
;
;
const genAI = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GoogleGenerativeAI"](process.env.GEMINI_API_KEY);
const MODEL = "gemini-3.1-pro-preview";
async function POST(request) {
    // Auth
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: "Unauthorized"
    }, {
        status: 401
    });
    let body;
    try {
        body = await request.json();
    } catch  {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Invalid JSON"
        }, {
            status: 400
        });
    }
    const { post_id, locale, focus_keyword } = body;
    if (!post_id || !locale) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "post_id and locale are required"
        }, {
            status: 400
        });
    }
    const admin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAdminClient"])();
    // Fetch post
    const { data: post } = await admin.from("posts").select("slug, content_type, primary_locale, author_id").eq("id", post_id).single();
    if (!post) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: "Post not found"
    }, {
        status: 404
    });
    // Fetch existing localization
    const { data: existing } = await admin.from("post_localizations").select("title, excerpt, content_md, seo_title, seo_description, focus_keyword").eq("post_id", post_id).eq("locale", locale).maybeSingle();
    const keyword = focus_keyword ?? existing?.focus_keyword ?? post.slug.replace(/-/g, " ");
    // Fetch client context (domain, GA/Search Console data)
    const { data: clientRow } = await admin.from("clients").select("domain, google_access_token, google_scope").eq("user_id", post.author_id).maybeSingle();
    // Build client context — GA/Search Console data will be fetched here in V2
    // For now we pass domain and leave analytics fields empty (populated once OAuth is connected)
    const clientCtx = {
        domain: clientRow?.domain ?? null,
        websiteSummary: null,
        industry: null,
        gaTopPages: null,
        gaTopKeywords: null,
        searchConsoleQueries: null
    };
    // Publication date
    const publicationDate = new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
    }).format(new Date());
    const postCtx = {
        slug: post.slug,
        content_type: post.content_type,
        locale,
        focus_keyword: keyword,
        publication_date: publicationDate,
        existing_title: existing?.title || null,
        existing_draft: existing?.content_md || null
    };
    // Log run
    const { data: run } = await admin.from("agent_runs").insert({
        post_id,
        locale,
        status: "running",
        model: MODEL,
        input: {
            postCtx,
            clientCtx
        }
    }).select("id").single();
    const runId = run?.id;
    try {
        const model = genAI.getGenerativeModel({
            model: MODEL,
            systemInstruction: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$agent$2f$instructions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SYSTEM_INSTRUCTIONS"]
        });
        const prompt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$agent$2f$instructions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildPrompt"])(postCtx, clientCtx);
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        // Strip accidental code fences
        const clean = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
        let generated;
        try {
            generated = JSON.parse(clean);
        } catch  {
            if (runId) await admin.from("agent_runs").update({
                status: "failed",
                error: "Invalid JSON from Gemini",
                output: {
                    raw: text
                }
            }).eq("id", runId);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Gemini returned invalid JSON. Try again."
            }, {
                status: 500
            });
        }
        // Build JSON-LD
        const jsonld = generated.faq_blocks?.length > 0 ? {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "Article",
                    "headline": generated.title,
                    "description": generated.seo_description,
                    "keywords": generated.focus_keyword,
                    "datePublished": new Date().toISOString()
                },
                {
                    "@type": "FAQPage",
                    "mainEntity": generated.faq_blocks.map((f)=>({
                            "@type": "Question",
                            "name": f.question,
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": f.answer
                            }
                        }))
                }
            ]
        } : {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": generated.title,
            "description": generated.seo_description,
            "keywords": generated.focus_keyword,
            "datePublished": new Date().toISOString()
        };
        // Save to DB
        const { error: upsertError } = await admin.from("post_localizations").upsert({
            post_id,
            locale,
            title: generated.title,
            excerpt: generated.excerpt,
            content_md: generated.content_md,
            seo_title: generated.seo_title,
            seo_description: generated.seo_description,
            focus_keyword: generated.focus_keyword,
            faq_blocks: generated.faq_blocks,
            jsonld
        }, {
            onConflict: "post_id,locale"
        });
        if (upsertError) {
            if (runId) await admin.from("agent_runs").update({
                status: "failed",
                error: upsertError.message
            }).eq("id", runId);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: upsertError.message
            }, {
                status: 500
            });
        }
        if (runId) await admin.from("agent_runs").update({
            status: "done",
            output: generated
        }).eq("id", runId);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: generated
        });
    } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        if (runId) await admin.from("agent_runs").update({
            status: "failed",
            error: msg
        }).eq("id", runId);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: msg
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1d06b663._.js.map