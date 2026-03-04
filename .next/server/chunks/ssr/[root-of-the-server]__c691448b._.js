module.exports = [
"[project]/app/[locale]/(admin)/admin/posts/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"4085ccf157ba5f88cc82d8729441d224b16cd3d2ab":"deletePost","40cb7ac79d62e6e80291d309da033a9a52e5125b17":"createPost","6002c0fa8558d1246ee28ae4e5ab6ead5795158f25":"updatePost","6072a9d62e07c9b35c4b4eed6a5ad8d96f4fc6556c":"uploadCoverImage","60cdf513920a5e481640bd8f9d000ec6b61c6148cb":"upsertLocalization"},"",""] */ __turbopack_context__.s([
    "createPost",
    ()=>createPost,
    "deletePost",
    ()=>deletePost,
    "updatePost",
    ()=>updatePost,
    "uploadCoverImage",
    ()=>uploadCoverImage,
    "upsertLocalization",
    ()=>upsertLocalization
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v3/external.js [app-rsc] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
const createPostSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    slug: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, hyphens only"),
    primary_locale: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        "pt",
        "en",
        "fr"
    ]),
    content_type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        "hero",
        "hub",
        "hygiene"
    ]),
    status: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
});
async function createPost(formData) {
    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getUser"])();
    if (!user) return {
        error: "Unauthorized"
    };
    const parsed = createPostSchema.safeParse({
        slug: formData.get("slug")?.toString().toLowerCase().trim(),
        primary_locale: formData.get("primary_locale") ?? "en",
        content_type: formData.get("content_type") ?? "hero",
        status: formData.get("status") ?? "idea"
    });
    if (!parsed.success) {
        return {
            error: parsed.error.flatten().fieldErrors?.slug?.[0] ?? "Invalid input"
        };
    }
    const { slug, primary_locale, content_type, status } = parsed.data;
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: existing } = await supabase.from("posts").select("id").eq("slug", slug).maybeSingle();
    if (existing) return {
        error: "Slug already in use"
    };
    const { data: post, error: postError } = await supabase.from("posts").insert({
        slug,
        primary_locale,
        content_type,
        status,
        author_id: user.id
    }).select("id").single();
    if (postError) return {
        error: postError.message
    };
    const { error: locError } = await supabase.from("post_localizations").insert({
        post_id: post.id,
        locale: primary_locale,
        title: "",
        excerpt: "",
        content_md: ""
    });
    if (locError) {
        await supabase.from("posts").delete().eq("id", post.id);
        return {
            error: locError.message
        };
    }
    return {
        success: true,
        postId: post.id
    };
}
const updatePostSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    slug: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).regex(/^[a-z0-9-]+$/).optional(),
    status: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    content_type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        "hero",
        "hub",
        "hygiene"
    ]).optional(),
    primary_locale: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        "pt",
        "en",
        "fr"
    ]).optional(),
    cover_image_path: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable().optional(),
    published_at: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable().optional(),
    scheduled_for: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable().optional()
});
async function updatePost(postId, formData) {
    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getUser"])();
    if (!user) return {
        error: "Unauthorized"
    };
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const slug = formData.get("slug")?.toString().toLowerCase().trim();
    if (slug) {
        const { data: existing } = await supabase.from("posts").select("id").eq("slug", slug).neq("id", postId).maybeSingle();
        if (existing) return {
            error: "Slug already in use"
        };
    }
    const updates = {};
    const optional = [
        "status",
        "content_type",
        "primary_locale",
        "cover_image_path",
        "published_at",
        "scheduled_for"
    ];
    for (const key of optional){
        const v = formData.get(key);
        if (v !== undefined && v !== null) {
            if (v === "" && (key === "published_at" || key === "scheduled_for")) updates[key] = null;
            else updates[key] = v;
        }
    }
    if (slug !== undefined) updates.slug = slug;
    const { error } = await supabase.from("posts").update(updates).eq("id", postId);
    if (error) return {
        error: error.message
    };
    return {
        success: true
    };
}
const localizationSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    locale: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        "pt",
        "en",
        "fr"
    ]),
    title: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    excerpt: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    content_md: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()
});
async function upsertLocalization(postId, formData) {
    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getUser"])();
    if (!user) return {
        error: "Unauthorized"
    };
    const parsed = localizationSchema.safeParse({
        locale: formData.get("locale"),
        title: formData.get("title") ?? "",
        excerpt: formData.get("excerpt") ?? "",
        content_md: formData.get("content_md") ?? ""
    });
    if (!parsed.success) return {
        error: "Invalid localization data"
    };
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { error } = await supabase.from("post_localizations").upsert({
        post_id: postId,
        locale: parsed.data.locale,
        title: parsed.data.title,
        excerpt: parsed.data.excerpt,
        content_md: parsed.data.content_md
    }, {
        onConflict: "post_id,locale"
    });
    if (error) return {
        error: error.message
    };
    return {
        success: true
    };
}
async function uploadCoverImage(postId, formData) {
    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getUser"])();
    if (!user) return {
        error: "Unauthorized"
    };
    const file = formData.get("file");
    if (!file?.size) return {
        error: "No file provided"
    };
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${postId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("covers").upload(path, file, {
        contentType: file.type,
        upsert: true
    });
    if (error) return {
        error: error.message
    };
    const { data: urlData } = supabase.storage.from("covers").getPublicUrl(path);
    const publicUrl = urlData.publicUrl;
    const { error: updateError } = await supabase.from("posts").update({
        cover_image_path: path
    }).eq("id", postId);
    if (updateError) return {
        error: updateError.message
    };
    return {
        success: true,
        path,
        publicUrl
    };
}
async function deletePost(postId) {
    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getUser"])();
    if (!user) return {
        error: "Unauthorized"
    };
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    // Verify ownership or admin role before deleting
    const { data: post } = await supabase.from("posts").select("author_id").eq("id", postId).maybeSingle();
    if (!post) return {
        error: "Post not found"
    };
    const isOwner = post.author_id === user.id;
    if (!isOwner) {
        // Check if user has admin role
        const { data: roleRow } = await supabase.from("user_roles").select("role_id").eq("user_id", user.id).eq("role_id", "admin").maybeSingle();
        if (!roleRow) return {
            error: "Forbidden"
        };
    }
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) return {
        error: error.message
    };
    return {
        success: true
    };
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    createPost,
    updatePost,
    upsertLocalization,
    uploadCoverImage,
    deletePost
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createPost, "40cb7ac79d62e6e80291d309da033a9a52e5125b17", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updatePost, "6002c0fa8558d1246ee28ae4e5ab6ead5795158f25", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(upsertLocalization, "60cdf513920a5e481640bd8f9d000ec6b61c6148cb", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(uploadCoverImage, "6072a9d62e07c9b35c4b4eed6a5ad8d96f4fc6556c", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deletePost, "4085ccf157ba5f88cc82d8729441d224b16cd3d2ab", null);
}),
"[project]/app/[locale]/(admin)/admin/posts/new/NewPostForm.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "NewPostForm",
    ()=>NewPostForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const NewPostForm = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call NewPostForm() from the server but NewPostForm is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/app/[locale]/(admin)/admin/posts/new/NewPostForm.tsx <module evaluation>", "NewPostForm");
}),
"[project]/app/[locale]/(admin)/admin/posts/new/NewPostForm.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "NewPostForm",
    ()=>NewPostForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const NewPostForm = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call NewPostForm() from the server but NewPostForm is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/app/[locale]/(admin)/admin/posts/new/NewPostForm.tsx", "NewPostForm");
}),
"[project]/app/[locale]/(admin)/admin/posts/new/NewPostForm.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f$new$2f$NewPostForm$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/app/[locale]/(admin)/admin/posts/new/NewPostForm.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f$new$2f$NewPostForm$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/app/[locale]/(admin)/admin/posts/new/NewPostForm.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f$new$2f$NewPostForm$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/app/[locale]/(admin)/admin/posts/new/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"40ebe1c3ca56d391392f6a1101ada304d090be0c7e":"$$RSC_SERVER_ACTION_0"},"",""] */ __turbopack_context__.s([
    "$$RSC_SERVER_ACTION_0",
    ()=>$$RSC_SERVER_ACTION_0,
    "default",
    ()=>NewPostPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$server$2f$react$2d$server$2f$getTranslations$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__getTranslations$3e$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/server/react-server/getTranslations.js [app-rsc] (ecmascript) <export default as getTranslations>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$server$2f$react$2d$server$2f$getLocale$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__getLocale$3e$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/server/react-server/getLocale.js [app-rsc] (ecmascript) <export default as getLocale>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/[locale]/(admin)/admin/posts/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f$new$2f$NewPostForm$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/[locale]/(admin)/admin/posts/new/NewPostForm.tsx [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
const $$RSC_SERVER_ACTION_0 = async function handleCreate(formData) {
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createPost"])(formData);
    if (result.error) return result;
    if (result.postId) {
        const locale = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$server$2f$react$2d$server$2f$getLocale$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__getLocale$3e$__["getLocale"])();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/${locale}/admin/posts/${result.postId}`);
    }
    return result;
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_0, "40ebe1c3ca56d391392f6a1101ada304d090be0c7e", null);
async function NewPostPage() {
    const t = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$server$2f$react$2d$server$2f$getTranslations$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__getTranslations$3e$__["getTranslations"])("admin");
    const tCommon = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$server$2f$react$2d$server$2f$getTranslations$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__getTranslations$3e$__["getTranslations"])("common");
    const tPost = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$server$2f$react$2d$server$2f$getTranslations$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__getTranslations$3e$__["getTranslations"])("post.status");
    const tContent = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$server$2f$react$2d$server$2f$getTranslations$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__getTranslations$3e$__["getTranslations"])("post.contentType");
    var handleCreate = $$RSC_SERVER_ACTION_0;
    const statusOptions = [
        "idea",
        "research",
        "draft",
        "optimize",
        "format",
        "review",
        "approved",
        "scheduled",
        "published",
        "archived"
    ];
    const contentTypes = [
        "hero",
        "hub",
        "hygiene"
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                className: "text-xl font-bold mb-6",
                children: t("newPost")
            }, void 0, false, {
                fileName: "[project]/app/[locale]/(admin)/admin/posts/new/page.tsx",
                lineNumber: 40,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f$new$2f$NewPostForm$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["NewPostForm"], {
                action: handleCreate,
                statusOptions: statusOptions.map((s)=>({
                        value: s,
                        label: tPost(s)
                    })),
                contentTypes: contentTypes.map((c)=>({
                        value: c,
                        label: tContent(c)
                    })),
                labels: {
                    slug: t("slug"),
                    primaryLocale: t("primaryLocale"),
                    contentType: t("contentType"),
                    status: t("status"),
                    submit: tCommon("submit")
                }
            }, void 0, false, {
                fileName: "[project]/app/[locale]/(admin)/admin/posts/new/page.tsx",
                lineNumber: 41,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/[locale]/(admin)/admin/posts/new/page.tsx",
        lineNumber: 39,
        columnNumber: 5
    }, this);
}
}),
"[project]/.next-internal/server/app/[locale]/(admin)/admin/posts/new/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/[locale]/(admin)/admin/posts/new/page.tsx [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/app/[locale]/(admin)/admin/posts/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f$new$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/[locale]/(admin)/admin/posts/new/page.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/[locale]/(admin)/admin/posts/actions.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
}),
"[project]/.next-internal/server/app/[locale]/(admin)/admin/posts/new/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/[locale]/(admin)/admin/posts/new/page.tsx [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/app/[locale]/(admin)/admin/posts/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "4085ccf157ba5f88cc82d8729441d224b16cd3d2ab",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deletePost"],
    "40cb7ac79d62e6e80291d309da033a9a52e5125b17",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createPost"],
    "40ebe1c3ca56d391392f6a1101ada304d090be0c7e",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f$new$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_0"],
    "6002c0fa8558d1246ee28ae4e5ab6ead5795158f25",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updatePost"],
    "6072a9d62e07c9b35c4b4eed6a5ad8d96f4fc6556c",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["uploadCoverImage"],
    "60cdf513920a5e481640bd8f9d000ec6b61c6148cb",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["upsertLocalization"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f$new$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f$new$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/[locale]/(admin)/admin/posts/new/page/actions.js { ACTIONS_MODULE0 => "[project]/app/[locale]/(admin)/admin/posts/new/page.tsx [app-rsc] (ecmascript)", ACTIONS_MODULE1 => "[project]/app/[locale]/(admin)/admin/posts/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f$new$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/[locale]/(admin)/admin/posts/new/page.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/[locale]/(admin)/admin/posts/actions.ts [app-rsc] (ecmascript)");
}),
"[project]/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/app/[locale]/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/[locale]/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/app/[locale]/(admin)/admin/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/[locale]/(admin)/admin/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/app/[locale]/(admin)/admin/posts/new/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/[locale]/(admin)/admin/posts/new/page.tsx [app-rsc] (ecmascript)"));
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__c691448b._.js.map