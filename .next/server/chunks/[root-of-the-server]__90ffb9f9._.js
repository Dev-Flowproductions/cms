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
;
;
;
;
const genAI = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GoogleGenerativeAI"](process.env.GEMINI_API_KEY);
async function POST(request) {
    // Auth check
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: "Unauthorized"
    }, {
        status: 401
    });
    // Validate input
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
    // Fetch the post + existing localization for context
    const { data: post } = await admin.from("posts").select("slug, content_type, primary_locale").eq("id", post_id).single();
    if (!post) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: "Post not found"
    }, {
        status: 404
    });
    const { data: existing } = await admin.from("post_localizations").select("title, excerpt, content_md, seo_title, seo_description, focus_keyword").eq("post_id", post_id).eq("locale", locale).maybeSingle();
    const keyword = focus_keyword ?? existing?.focus_keyword ?? post.slug.replace(/-/g, " ");
    // Create agent_run record
    const { data: run } = await admin.from("agent_runs").insert({
        post_id,
        locale,
        status: "running",
        model: "gemini-3.1-pro-preview",
        input: {
            post,
            existing,
            focus_keyword: keyword
        }
    }).select("id").single();
    const runId = run?.id;
    // Build the prompt
    const contentTypeGuide = {
        hero: "long-form pillar article (1500-2500 words), comprehensive coverage, multiple H2/H3 sections",
        hub: "cluster/supporting article (800-1200 words), focused on one sub-topic",
        hygiene: "concise FAQ or how-to (400-700 words), direct answers, snippet-optimised"
    };
    const prompt = `You are an expert content strategist and SEO copywriter. Generate a complete, publish-ready blog post optimised for SEO, AEO (Answer Engine Optimisation) and GEO (Generative Engine Optimisation).

POST CONTEXT:
- Focus keyword: "${keyword}"
- Content type: ${post.content_type} — ${contentTypeGuide[post.content_type] ?? "standard article"}
- Locale/language: ${locale}
- Slug: ${post.slug}
${existing?.title ? `- Existing title: ${existing.title}` : ""}
${existing?.content_md ? `- Existing draft (improve this):\n${existing.content_md.slice(0, 500)}...` : ""}

REQUIREMENTS:
1. SEO: Include focus keyword naturally in H1, first paragraph, at least 2 H2s, and meta description. Use semantic variants.
2. AEO: Include a FAQ section at the end with 3-5 direct questions & answers. Keep answers under 50 words each for snippet eligibility.
3. GEO: Mention at least 2 named entities (people, organisations, concepts) with accurate, citable facts. Use clear attribution language ("According to...", "Research by...").
4. Structure: Proper H2/H3 hierarchy. No orphan paragraphs. Include a clear intro, body sections, and conclusion.
5. Markdown only — use ## for H2, ### for H3, **bold** for key terms, no HTML.

Respond with a single valid JSON object (no markdown code fences) with exactly these fields:
{
  "title": "The display title (H1, include keyword)",
  "seo_title": "SEO title tag (50-60 chars, include keyword)",
  "seo_description": "Meta description (140-160 chars, include keyword, compelling CTA)",
  "focus_keyword": "${keyword}",
  "excerpt": "1-2 sentence teaser for listings (under 160 chars)",
  "content_md": "Full markdown content",
  "faq_blocks": [
    { "question": "...", "answer": "..." }
  ]
}`;
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-3.1-pro-preview"
        });
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        // Parse JSON — strip any accidental code fences
        const clean = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
        let generated;
        try {
            generated = JSON.parse(clean);
        } catch  {
            // Update run as failed
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
        // Build JSON-LD Article + FAQPage
        const faqJsonld = generated.faq_blocks?.length > 0 ? {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "Article",
                    "headline": generated.title,
                    "description": generated.seo_description,
                    "keywords": generated.focus_keyword
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
            "keywords": generated.focus_keyword
        };
        // Upsert the localization
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
            jsonld: faqJsonld
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
        // Mark run as done
        if (runId) {
            await admin.from("agent_runs").update({
                status: "done",
                output: generated
            }).eq("id", runId);
        }
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

//# sourceMappingURL=%5Broot-of-the-server%5D__90ffb9f9._.js.map