module.exports = [
"[project]/lib/data/post-detail.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"404b039b6e4fa098ceffaa577c60fa9a70b842df98":"getPostWithLocalizations","406962fc21c78fd8adb5c36c8878bec38933927e8e":"getPublishedPostLocales","40859dbb53ff844dc582bc07bf3958361d499910b4":"getPostById","60575f715f0e73489198a4f97a15daaa7785afec30":"getPublishedPostBySlug"},"",""] */ __turbopack_context__.s([
    "getPostById",
    ()=>getPostById,
    "getPostWithLocalizations",
    ()=>getPostWithLocalizations,
    "getPublishedPostBySlug",
    ()=>getPublishedPostBySlug,
    "getPublishedPostLocales",
    ()=>getPublishedPostLocales
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
async function getPostById(id) {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data, error } = await supabase.from("posts").select("*, profiles(display_name)").eq("id", id).single();
    if (error) throw error;
    return data;
}
async function getPostWithLocalizations(id) {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: post, error: postError } = await supabase.from("posts").select("*, profiles(display_name)").eq("id", id).single();
    if (postError) throw postError;
    if (!post) return null;
    const { data: locs, error: locError } = await supabase.from("post_localizations").select("*").eq("post_id", id).order("locale");
    if (locError) throw locError;
    return {
        ...post,
        post_localizations: locs ?? []
    };
}
async function getPublishedPostBySlug(slug, locale) {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: post, error: postError } = await supabase.from("posts").select("id, slug, primary_locale, author_id, cover_image_path, published_at, profiles(display_name)").eq("slug", slug).eq("status", "published").or(`published_at.is.null,published_at.lte.${new Date().toISOString()}`).single();
    if (postError || !post) return null;
    const supabase2 = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    let localization = await getLocalizationByPostAndLocale(post.id, locale);
    if (!localization && post.primary_locale !== locale) {
        localization = await getLocalizationByPostAndLocale(post.id, post.primary_locale);
    }
    if (!localization) return null;
    return {
        post,
        localization
    };
}
async function getPublishedPostLocales(slug) {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: post } = await supabase.from("posts").select("id").eq("slug", slug).eq("status", "published").single();
    if (!post) return [];
    const { data: locs } = await supabase.from("post_localizations").select("locale").eq("post_id", post.id);
    return (locs ?? []).map((l)=>l.locale);
}
async function getLocalizationByPostAndLocale(postId, locale) {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data } = await supabase.from("post_localizations").select("*").eq("post_id", postId).eq("locale", locale).single();
    return data;
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    getPostById,
    getPostWithLocalizations,
    getPublishedPostBySlug,
    getPublishedPostLocales
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getPostById, "40859dbb53ff844dc582bc07bf3958361d499910b4", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getPostWithLocalizations, "404b039b6e4fa098ceffaa577c60fa9a70b842df98", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getPublishedPostBySlug, "60575f715f0e73489198a4f97a15daaa7785afec30", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getPublishedPostLocales, "406962fc21c78fd8adb5c36c8878bec38933927e8e", null);
}),
"[project]/app/[locale]/(admin)/admin/sources/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"00974097731fa82d08897eaef1c436651acb6a19cd":"getSourcesList","4035cfd28ae1a7541fcb2fafb2b84ee9cafe69ccee":"removeCitation","409e067179a1ddea3667ef50da3c6c3581cd5d87da":"createSource","60031cb0a2f7a71602cac1ae5b18a7eb19b0675106":"addCitation","6066539023e9cddd05773d7bcc120692efce0ea6cb":"getCitationsForPost"},"",""] */ __turbopack_context__.s([
    "addCitation",
    ()=>addCitation,
    "createSource",
    ()=>createSource,
    "getCitationsForPost",
    ()=>getCitationsForPost,
    "getSourcesList",
    ()=>getSourcesList,
    "removeCitation",
    ()=>removeCitation
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
async function getSourcesList() {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data, error } = await supabase.from("sources").select("id, url, title, publisher, created_at").order("created_at", {
        ascending: false
    });
    if (error) throw error;
    return data ?? [];
}
async function createSource(formData) {
    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getUser"])();
    if (!user) return {
        error: "Unauthorized"
    };
    const url = formData.get("url")?.toString()?.trim();
    if (!url) return {
        error: "URL is required"
    };
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { error } = await supabase.from("sources").insert({
        url,
        title: formData.get("title")?.toString()?.trim() || null,
        publisher: formData.get("publisher")?.toString()?.trim() || null,
        notes: formData.get("notes")?.toString()?.trim() || null,
        created_by: user.id
    });
    if (error) return {
        error: error.message
    };
    return {
        success: true
    };
}
async function getCitationsForPost(postId, locale) {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    let query = supabase.from("citations").select("id, source_id, locale, quote, claim, section_anchor, sources(url, title, publisher)").eq("post_id", postId);
    if (locale) query = query.eq("locale", locale);
    const { data, error } = await query.order("created_at", {
        ascending: false
    });
    if (error) throw error;
    return data ?? [];
}
async function addCitation(postId, formData) {
    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getUser"])();
    if (!user) return {
        error: "Unauthorized"
    };
    const sourceId = formData.get("source_id")?.toString();
    const locale = formData.get("locale")?.toString();
    if (!sourceId || !locale) return {
        error: "Source and locale required"
    };
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { error } = await supabase.from("citations").insert({
        post_id: postId,
        source_id: sourceId,
        locale,
        quote: formData.get("quote")?.toString()?.trim() || null,
        claim: formData.get("claim")?.toString()?.trim() || null,
        section_anchor: formData.get("section_anchor")?.toString()?.trim() || null
    });
    if (error) return {
        error: error.message
    };
    return {
        success: true
    };
}
async function removeCitation(citationId) {
    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getUser"])();
    if (!user) return {
        error: "Unauthorized"
    };
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { error } = await supabase.from("citations").delete().eq("id", citationId);
    if (error) return {
        error: error.message
    };
    return {
        success: true
    };
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    getSourcesList,
    createSource,
    getCitationsForPost,
    addCitation,
    removeCitation
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getSourcesList, "00974097731fa82d08897eaef1c436651acb6a19cd", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createSource, "409e067179a1ddea3667ef50da3c6c3581cd5d87da", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getCitationsForPost, "6066539023e9cddd05773d7bcc120692efce0ea6cb", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(addCitation, "60031cb0a2f7a71602cac1ae5b18a7eb19b0675106", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(removeCitation, "4035cfd28ae1a7541fcb2fafb2b84ee9cafe69ccee", null);
}),
"[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "EditPostForm",
    ()=>EditPostForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const EditPostForm = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call EditPostForm() from the server but EditPostForm is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx <module evaluation>", "EditPostForm");
}),
"[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "EditPostForm",
    ()=>EditPostForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const EditPostForm = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call EditPostForm() from the server but EditPostForm is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx", "EditPostForm");
}),
"[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f5b$id$5d2f$EditPostForm$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f5b$id$5d2f$EditPostForm$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f5b$id$5d2f$EditPostForm$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
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
    content_md: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    seo_title: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    seo_description: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    focus_keyword: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
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
        content_md: formData.get("content_md") ?? "",
        seo_title: formData.get("seo_title")?.toString() || undefined,
        seo_description: formData.get("seo_description")?.toString() || undefined,
        focus_keyword: formData.get("focus_keyword")?.toString() || undefined
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
        content_md: parsed.data.content_md,
        ...parsed.data.seo_title !== undefined && {
            seo_title: parsed.data.seo_title
        },
        ...parsed.data.seo_description !== undefined && {
            seo_description: parsed.data.seo_description
        },
        ...parsed.data.focus_keyword !== undefined && {
            focus_keyword: parsed.data.focus_keyword
        }
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
"[project]/app/[locale]/(admin)/admin/posts/[id]/ReviewChecklistBlock.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "ReviewChecklistBlock",
    ()=>ReviewChecklistBlock
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const ReviewChecklistBlock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call ReviewChecklistBlock() from the server but ReviewChecklistBlock is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/app/[locale]/(admin)/admin/posts/[id]/ReviewChecklistBlock.tsx <module evaluation>", "ReviewChecklistBlock");
}),
"[project]/app/[locale]/(admin)/admin/posts/[id]/ReviewChecklistBlock.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "ReviewChecklistBlock",
    ()=>ReviewChecklistBlock
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const ReviewChecklistBlock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call ReviewChecklistBlock() from the server but ReviewChecklistBlock is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/app/[locale]/(admin)/admin/posts/[id]/ReviewChecklistBlock.tsx", "ReviewChecklistBlock");
}),
"[project]/app/[locale]/(admin)/admin/posts/[id]/ReviewChecklistBlock.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f5b$id$5d2f$ReviewChecklistBlock$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/app/[locale]/(admin)/admin/posts/[id]/ReviewChecklistBlock.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f5b$id$5d2f$ReviewChecklistBlock$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/app/[locale]/(admin)/admin/posts/[id]/ReviewChecklistBlock.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f5b$id$5d2f$ReviewChecklistBlock$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/app/[locale]/(admin)/admin/posts/[id]/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"608d51822cc2cec154cac4d2470e850cc5129f9ae2":"$$RSC_SERVER_ACTION_2","60b1255423bbb3f8a11aba14cadb1d08857bad8d14":"$$RSC_SERVER_ACTION_1","60fa09b53ed27e2096a1e7755b50562d4ef7867fc9":"$$RSC_SERVER_ACTION_0"},"",""] */ __turbopack_context__.s([
    "$$RSC_SERVER_ACTION_0",
    ()=>$$RSC_SERVER_ACTION_0,
    "$$RSC_SERVER_ACTION_1",
    ()=>$$RSC_SERVER_ACTION_1,
    "$$RSC_SERVER_ACTION_2",
    ()=>$$RSC_SERVER_ACTION_2,
    "default",
    ()=>EditPostPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$app$2d$render$2f$encryption$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/app-render/encryption.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$server$2f$react$2d$server$2f$getTranslations$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__getTranslations$3e$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/server/react-server/getTranslations.js [app-rsc] (ecmascript) <export default as getTranslations>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2f$post$2d$detail$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/data/post-detail.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$sources$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/[locale]/(admin)/admin/sources/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f5b$id$5d2f$EditPostForm$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/[locale]/(admin)/admin/posts/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f5b$id$5d2f$ReviewChecklistBlock$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/[locale]/(admin)/admin/posts/[id]/ReviewChecklistBlock.tsx [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
const $$RSC_SERVER_ACTION_0 = async function handleUpdatePost($$ACTION_CLOSURE_BOUND, formData) {
    var [$$ACTION_ARG_0] = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$app$2d$render$2f$encryption$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["decryptActionBoundArgs"])("60fa09b53ed27e2096a1e7755b50562d4ef7867fc9", $$ACTION_CLOSURE_BOUND);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updatePost"])($$ACTION_ARG_0, formData);
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_0, "60fa09b53ed27e2096a1e7755b50562d4ef7867fc9", null);
const $$RSC_SERVER_ACTION_1 = async function handleUpsertLocalization($$ACTION_CLOSURE_BOUND, formData) {
    var [$$ACTION_ARG_0] = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$app$2d$render$2f$encryption$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["decryptActionBoundArgs"])("60b1255423bbb3f8a11aba14cadb1d08857bad8d14", $$ACTION_CLOSURE_BOUND);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["upsertLocalization"])($$ACTION_ARG_0, formData);
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_1, "60b1255423bbb3f8a11aba14cadb1d08857bad8d14", null);
const $$RSC_SERVER_ACTION_2 = async function handleUploadCover($$ACTION_CLOSURE_BOUND, formData) {
    var [$$ACTION_ARG_0] = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$app$2d$render$2f$encryption$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["decryptActionBoundArgs"])("608d51822cc2cec154cac4d2470e850cc5129f9ae2", $$ACTION_CLOSURE_BOUND);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["uploadCoverImage"])($$ACTION_ARG_0, formData);
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_2, "608d51822cc2cec154cac4d2470e850cc5129f9ae2", null);
async function EditPostPage({ params }) {
    const { id } = await params;
    const { roles } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireTeamMember"])();
    const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2f$post$2d$detail$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getPostWithLocalizations"])(id);
    if (!data) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notFound"])();
    const canReview = roles.includes("reviewer") || roles.includes("admin");
    const showChecklist = canReview && data.status === "review";
    const sources = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$sources$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSourcesList"])();
    const citations = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$sources$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCitationsForPost"])(id);
    const supabaseUrl = ("TURBOPACK compile-time value", "https://lltufugrmmzdagqypscg.supabase.co") ?? "";
    const t = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$server$2f$react$2d$server$2f$getTranslations$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__getTranslations$3e$__["getTranslations"])("admin");
    const tCommon = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$server$2f$react$2d$server$2f$getTranslations$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__getTranslations$3e$__["getTranslations"])("common");
    const tPost = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$server$2f$react$2d$server$2f$getTranslations$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__getTranslations$3e$__["getTranslations"])("post.status");
    const tContent = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$server$2f$react$2d$server$2f$getTranslations$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__getTranslations$3e$__["getTranslations"])("post.contentType");
    const statusOptions = [
        "draft",
        "published"
    ];
    const contentTypes = [
        "hero",
        "hub",
        "hygiene"
    ];
    const locales = [
        "pt",
        "en",
        "fr"
    ];
    var handleUpdatePost = $$RSC_SERVER_ACTION_0.bind(null, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$app$2d$render$2f$encryption$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["encryptActionBoundArgs"])("60fa09b53ed27e2096a1e7755b50562d4ef7867fc9", id));
    var handleUpsertLocalization = $$RSC_SERVER_ACTION_1.bind(null, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$app$2d$render$2f$encryption$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["encryptActionBoundArgs"])("60b1255423bbb3f8a11aba14cadb1d08857bad8d14", id));
    var handleUploadCover = $$RSC_SERVER_ACTION_2.bind(null, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$app$2d$render$2f$encryption$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["encryptActionBoundArgs"])("608d51822cc2cec154cac4d2470e850cc5129f9ae2", id));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                className: "text-xl font-bold mb-6",
                children: t("editPost")
            }, void 0, false, {
                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/page.tsx",
                lineNumber: 55,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f5b$id$5d2f$EditPostForm$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["EditPostForm"], {
                post: data,
                statusOptions: statusOptions.map((s)=>({
                        value: s,
                        label: tPost(s)
                    })),
                contentTypes: contentTypes.map((c)=>({
                        value: c,
                        label: tContent(c)
                    })),
                locales: locales,
                labels: {
                    slug: t("slug"),
                    status: t("status"),
                    primaryLocale: t("primaryLocale"),
                    contentType: t("contentType"),
                    coverImage: t("coverImage"),
                    publishedAt: t("publishedAt"),
                    scheduledFor: t("scheduledFor"),
                    title: t("title"),
                    excerpt: t("excerpt"),
                    content: t("content"),
                    save: tCommon("save"),
                    postSettings: t("editPostPage.postSettings"),
                    markdownHint: t("editPostPage.markdownHint"),
                    preview: t("editPostPage.preview")
                },
                updatePostAction: handleUpdatePost,
                upsertLocalizationAction: handleUpsertLocalization,
                uploadCoverAction: handleUploadCover,
                supabaseUrl: supabaseUrl,
                sources: sources,
                citations: citations
            }, void 0, false, {
                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/page.tsx",
                lineNumber: 56,
                columnNumber: 7
            }, this),
            showChecklist && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f5b$id$5d2f$ReviewChecklistBlock$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ReviewChecklistBlock"], {
                postId: id
            }, void 0, false, {
                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/page.tsx",
                lineNumber: 84,
                columnNumber: 25
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/page.tsx",
        lineNumber: 54,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/[locale]/(admin)/admin/review-queue/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"40277749419d7872b35226f85a37729b009399c36f":"approvePost","40914b1b2fa6458b426da61afce0f7af1584e1da80":"publishPost","40e7928795a0a2f841f06650912c31711986dfc5a9":"getReviewChecklist","60823feaaebe0de974e5805ec86472ee07339207ac":"rejectPost","70ac5edcad36a739d25a4e8aaaefc050dd4484a985":"saveReviewChecklist"},"",""] */ __turbopack_context__.s([
    "approvePost",
    ()=>approvePost,
    "getReviewChecklist",
    ()=>getReviewChecklist,
    "publishPost",
    ()=>publishPost,
    "rejectPost",
    ()=>rejectPost,
    "saveReviewChecklist",
    ()=>saveReviewChecklist
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
async function getReviewChecklist(postId) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireReviewer"])();
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data, error } = await supabase.from("review_checklists").select("*").eq("post_id", postId).is("locale", null).maybeSingle();
    if (error) throw error;
    return data;
}
async function saveReviewChecklist(postId, items, status) {
    const { user } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireReviewer"])();
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { error } = await supabase.from("review_checklists").upsert({
        post_id: postId,
        reviewer_id: user.id,
        locale: null,
        items,
        status,
        updated_at: new Date().toISOString()
    }, {
        onConflict: "post_id,locale"
    });
    if (error) throw error;
    return {
        success: true
    };
}
async function approvePost(postId) {
    const { user } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireReviewer"])();
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: checklist } = await supabase.from("review_checklists").select("status").eq("post_id", postId).is("locale", null).maybeSingle();
    if (!checklist || checklist.status !== "passed") {
        return {
            error: "Review checklist must be completed and passed before approving."
        };
    }
    const { error } = await supabase.from("posts").update({
        status: "approved"
    }).eq("id", postId).eq("status", "review");
    if (error) return {
        error: error.message
    };
    await supabase.from("audit_events").insert({
        post_id: postId,
        user_id: user.id,
        action: "approved",
        payload: {}
    });
    return {
        success: true
    };
}
async function rejectPost(postId, reason) {
    const { user } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireReviewer"])();
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { error } = await supabase.from("posts").update({
        status: "draft"
    }).eq("id", postId).eq("status", "review");
    if (error) return {
        error: error.message
    };
    await supabase.from("audit_events").insert({
        post_id: postId,
        user_id: user.id,
        action: "rejected",
        payload: {
            reason: reason ?? ""
        }
    });
    return {
        success: true
    };
}
async function publishPost(postId) {
    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getUser"])();
    if (!user) return {
        error: "Unauthorized"
    };
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: post } = await supabase.from("posts").select("status").eq("id", postId).single();
    if (!post) return {
        error: "Post not found"
    };
    if (post.status !== "approved") {
        return {
            error: "Post must be approved before publishing."
        };
    }
    const { error } = await supabase.from("posts").update({
        status: "published",
        published_at: new Date().toISOString()
    }).eq("id", postId);
    if (error) return {
        error: error.message
    };
    await supabase.from("audit_events").insert({
        post_id: postId,
        user_id: user.id,
        action: "published",
        payload: {}
    });
    return {
        success: true
    };
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    getReviewChecklist,
    saveReviewChecklist,
    approvePost,
    rejectPost,
    publishPost
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getReviewChecklist, "40e7928795a0a2f841f06650912c31711986dfc5a9", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(saveReviewChecklist, "70ac5edcad36a739d25a4e8aaaefc050dd4484a985", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(approvePost, "40277749419d7872b35226f85a37729b009399c36f", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(rejectPost, "60823feaaebe0de974e5805ec86472ee07339207ac", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(publishPost, "40914b1b2fa6458b426da61afce0f7af1584e1da80", null);
}),
"[project]/.next-internal/server/app/[locale]/(admin)/admin/posts/[id]/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/[locale]/(admin)/admin/posts/[id]/page.tsx [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/lib/data/post-detail.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE2 => \"[project]/app/[locale]/(admin)/admin/sources/actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE3 => \"[project]/app/[locale]/(admin)/admin/posts/actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE4 => \"[project]/app/[locale]/(admin)/admin/review-queue/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f5b$id$5d2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/[locale]/(admin)/admin/posts/[id]/page.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2f$post$2d$detail$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/data/post-detail.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$sources$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/[locale]/(admin)/admin/sources/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/[locale]/(admin)/admin/posts/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$review$2d$queue$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/[locale]/(admin)/admin/review-queue/actions.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
}),
"[project]/.next-internal/server/app/[locale]/(admin)/admin/posts/[id]/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/[locale]/(admin)/admin/posts/[id]/page.tsx [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/lib/data/post-detail.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE2 => \"[project]/app/[locale]/(admin)/admin/sources/actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE3 => \"[project]/app/[locale]/(admin)/admin/posts/actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE4 => \"[project]/app/[locale]/(admin)/admin/review-queue/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "00974097731fa82d08897eaef1c436651acb6a19cd",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$sources$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSourcesList"],
    "4035cfd28ae1a7541fcb2fafb2b84ee9cafe69ccee",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$sources$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["removeCitation"],
    "404b039b6e4fa098ceffaa577c60fa9a70b842df98",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2f$post$2d$detail$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getPostWithLocalizations"],
    "406962fc21c78fd8adb5c36c8878bec38933927e8e",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2f$post$2d$detail$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getPublishedPostLocales"],
    "40859dbb53ff844dc582bc07bf3958361d499910b4",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2f$post$2d$detail$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getPostById"],
    "4085ccf157ba5f88cc82d8729441d224b16cd3d2ab",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deletePost"],
    "409e067179a1ddea3667ef50da3c6c3581cd5d87da",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$sources$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createSource"],
    "40cb7ac79d62e6e80291d309da033a9a52e5125b17",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createPost"],
    "40e7928795a0a2f841f06650912c31711986dfc5a9",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$review$2d$queue$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getReviewChecklist"],
    "6002c0fa8558d1246ee28ae4e5ab6ead5795158f25",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updatePost"],
    "60031cb0a2f7a71602cac1ae5b18a7eb19b0675106",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$sources$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addCitation"],
    "60575f715f0e73489198a4f97a15daaa7785afec30",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2f$post$2d$detail$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getPublishedPostBySlug"],
    "6066539023e9cddd05773d7bcc120692efce0ea6cb",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$sources$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCitationsForPost"],
    "6072a9d62e07c9b35c4b4eed6a5ad8d96f4fc6556c",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["uploadCoverImage"],
    "608d51822cc2cec154cac4d2470e850cc5129f9ae2",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f5b$id$5d2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_2"],
    "60b1255423bbb3f8a11aba14cadb1d08857bad8d14",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f5b$id$5d2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_1"],
    "60cdf513920a5e481640bd8f9d000ec6b61c6148cb",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["upsertLocalization"],
    "60fa09b53ed27e2096a1e7755b50562d4ef7867fc9",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f5b$id$5d2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_0"],
    "70ac5edcad36a739d25a4e8aaaefc050dd4484a985",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$review$2d$queue$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["saveReviewChecklist"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f5b$id$5d2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f5b$id$5d2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$lib$2f$data$2f$post$2d$detail$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE2__$3d3e$__$225b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$sources$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE3__$3d3e$__$225b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE4__$3d3e$__$225b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$review$2d$queue$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/[locale]/(admin)/admin/posts/[id]/page/actions.js { ACTIONS_MODULE0 => "[project]/app/[locale]/(admin)/admin/posts/[id]/page.tsx [app-rsc] (ecmascript)", ACTIONS_MODULE1 => "[project]/lib/data/post-detail.ts [app-rsc] (ecmascript)", ACTIONS_MODULE2 => "[project]/app/[locale]/(admin)/admin/sources/actions.ts [app-rsc] (ecmascript)", ACTIONS_MODULE3 => "[project]/app/[locale]/(admin)/admin/posts/actions.ts [app-rsc] (ecmascript)", ACTIONS_MODULE4 => "[project]/app/[locale]/(admin)/admin/review-queue/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f5b$id$5d2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/[locale]/(admin)/admin/posts/[id]/page.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2f$post$2d$detail$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/data/post-detail.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$sources$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/[locale]/(admin)/admin/sources/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/[locale]/(admin)/admin/posts/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$review$2d$queue$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/[locale]/(admin)/admin/review-queue/actions.ts [app-rsc] (ecmascript)");
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
"[project]/app/[locale]/(admin)/admin/posts/[id]/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/[locale]/(admin)/admin/posts/[id]/page.tsx [app-rsc] (ecmascript)"));
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__a406fca2._.js.map