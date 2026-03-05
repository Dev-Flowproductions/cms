module.exports = [
"[externals]/tty [external] (tty, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tty", () => require("tty"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/node:path [external] (node:path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:path", () => require("node:path"));

module.exports = mod;
}),
"[externals]/node:path [external] (node:path, cjs) <export default as minpath>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "minpath",
    ()=>__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
}),
"[externals]/node:process [external] (node:process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:process", () => require("node:process"));

module.exports = mod;
}),
"[externals]/node:process [external] (node:process, cjs) <export default as minproc>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "minproc",
    ()=>__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$process__$5b$external$5d$__$28$node$3a$process$2c$__cjs$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$process__$5b$external$5d$__$28$node$3a$process$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:process [external] (node:process, cjs)");
}),
"[externals]/node:url [external] (node:url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:url", () => require("node:url"));

module.exports = mod;
}),
"[externals]/node:url [external] (node:url, cjs) <export fileURLToPath as urlToPath>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "urlToPath",
    ()=>__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$url__$5b$external$5d$__$28$node$3a$url$2c$__cjs$29$__["fileURLToPath"]
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$url__$5b$external$5d$__$28$node$3a$url$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:url [external] (node:url, cjs)");
}),
"[project]/components/MarkdownPreview.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MarkdownPreview",
    ()=>MarkdownPreview
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$markdown$2f$lib$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__Markdown__as__default$3e$__ = __turbopack_context__.i("[project]/node_modules/react-markdown/lib/index.js [app-ssr] (ecmascript) <export Markdown as default>");
"use client";
;
;
const COVER_PLACEHOLDER = "{COVER_IMAGE_PLACEHOLDER}";
function MarkdownPreview({ content, coverImageUrl }) {
    // Replace cover placeholder with real URL, or strip the entire image line
    const processedContent = content.replace(/!\[.*?\]\(\{COVER_IMAGE_PLACEHOLDER\}\)\n?/g, coverImageUrl ? `![Cover image](${coverImageUrl})\n` : "");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-[200px] markdown-preview",
        style: {
            background: "var(--surface-raised)",
            border: "1px solid var(--border)",
            borderRadius: "0.75rem",
            padding: "1.25rem",
            color: "var(--text)",
            fontSize: "0.9rem",
            lineHeight: "1.75"
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$markdown$2f$lib$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__Markdown__as__default$3e$__["default"], {
            components: {
                h1: ({ children })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        style: {
                            color: "var(--text)",
                            fontSize: "1.5rem",
                            fontWeight: 700,
                            marginBottom: "0.75rem",
                            marginTop: "1.25rem"
                        },
                        children: children
                    }, void 0, false, {
                        fileName: "[project]/components/MarkdownPreview.tsx",
                        lineNumber: 36,
                        columnNumber: 13
                    }, void 0),
                h2: ({ children })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        style: {
                            color: "var(--text)",
                            fontSize: "1.25rem",
                            fontWeight: 700,
                            marginBottom: "0.5rem",
                            marginTop: "1.25rem",
                            paddingBottom: "0.25rem",
                            borderBottom: "1px solid var(--border)"
                        },
                        children: children
                    }, void 0, false, {
                        fileName: "[project]/components/MarkdownPreview.tsx",
                        lineNumber: 41,
                        columnNumber: 13
                    }, void 0),
                h3: ({ children })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        style: {
                            color: "var(--text)",
                            fontSize: "1.05rem",
                            fontWeight: 600,
                            marginBottom: "0.4rem",
                            marginTop: "1rem"
                        },
                        children: children
                    }, void 0, false, {
                        fileName: "[project]/components/MarkdownPreview.tsx",
                        lineNumber: 46,
                        columnNumber: 13
                    }, void 0),
                p: ({ children })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            color: "var(--text-muted)",
                            marginBottom: "0.75rem"
                        },
                        children: children
                    }, void 0, false, {
                        fileName: "[project]/components/MarkdownPreview.tsx",
                        lineNumber: 51,
                        columnNumber: 13
                    }, void 0),
                strong: ({ children })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        style: {
                            color: "var(--text)",
                            fontWeight: 600
                        },
                        children: children
                    }, void 0, false, {
                        fileName: "[project]/components/MarkdownPreview.tsx",
                        lineNumber: 54,
                        columnNumber: 13
                    }, void 0),
                em: ({ children })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("em", {
                        style: {
                            color: "var(--text-muted)"
                        },
                        children: children
                    }, void 0, false, {
                        fileName: "[project]/components/MarkdownPreview.tsx",
                        lineNumber: 57,
                        columnNumber: 13
                    }, void 0),
                img: ({ src, alt })=>{
                    if (!src || src === COVER_PLACEHOLDER || src.includes("COVER_IMAGE_PLACEHOLDER")) return null;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                        src: src,
                        alt: alt ?? "",
                        style: {
                            width: "100%",
                            borderRadius: "0.75rem",
                            marginBottom: "1rem",
                            border: "1px solid var(--border)",
                            aspectRatio: "16/9",
                            objectFit: "cover"
                        }
                    }, void 0, false, {
                        fileName: "[project]/components/MarkdownPreview.tsx",
                        lineNumber: 62,
                        columnNumber: 15
                    }, void 0);
                },
                ul: ({ children })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                        style: {
                            color: "var(--text-muted)",
                            paddingLeft: "1.25rem",
                            marginBottom: "0.75rem",
                            listStyleType: "disc"
                        },
                        children: children
                    }, void 0, false, {
                        fileName: "[project]/components/MarkdownPreview.tsx",
                        lineNumber: 77,
                        columnNumber: 13
                    }, void 0),
                ol: ({ children })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ol", {
                        style: {
                            color: "var(--text-muted)",
                            paddingLeft: "1.25rem",
                            marginBottom: "0.75rem",
                            listStyleType: "decimal"
                        },
                        children: children
                    }, void 0, false, {
                        fileName: "[project]/components/MarkdownPreview.tsx",
                        lineNumber: 82,
                        columnNumber: 13
                    }, void 0),
                li: ({ children })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        style: {
                            marginBottom: "0.25rem"
                        },
                        children: children
                    }, void 0, false, {
                        fileName: "[project]/components/MarkdownPreview.tsx",
                        lineNumber: 87,
                        columnNumber: 13
                    }, void 0),
                blockquote: ({ children })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("blockquote", {
                        style: {
                            borderLeft: "3px solid var(--accent)",
                            paddingLeft: "1rem",
                            color: "var(--text-muted)",
                            fontStyle: "italic",
                            margin: "0.75rem 0"
                        },
                        children: children
                    }, void 0, false, {
                        fileName: "[project]/components/MarkdownPreview.tsx",
                        lineNumber: 90,
                        columnNumber: 13
                    }, void 0),
                code: ({ children, className })=>{
                    const isBlock = !!className;
                    return isBlock ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                        style: {
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            borderRadius: "0.5rem",
                            padding: "0.875rem",
                            overflowX: "auto",
                            marginBottom: "0.75rem"
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                            style: {
                                color: "var(--accent)",
                                fontFamily: "monospace",
                                fontSize: "0.8rem"
                            },
                            children: children
                        }, void 0, false, {
                            fileName: "[project]/components/MarkdownPreview.tsx",
                            lineNumber: 111,
                            columnNumber: 17
                        }, void 0)
                    }, void 0, false, {
                        fileName: "[project]/components/MarkdownPreview.tsx",
                        lineNumber: 103,
                        columnNumber: 15
                    }, void 0) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                        style: {
                            background: "var(--surface)",
                            color: "var(--accent)",
                            padding: "0.15rem 0.35rem",
                            borderRadius: "0.3rem",
                            fontFamily: "monospace",
                            fontSize: "0.82em"
                        },
                        children: children
                    }, void 0, false, {
                        fileName: "[project]/components/MarkdownPreview.tsx",
                        lineNumber: 116,
                        columnNumber: 15
                    }, void 0);
                },
                a: ({ children, href })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: href,
                        style: {
                            color: "var(--accent)",
                            textDecoration: "underline"
                        },
                        target: "_blank",
                        rel: "noopener noreferrer",
                        children: children
                    }, void 0, false, {
                        fileName: "[project]/components/MarkdownPreview.tsx",
                        lineNumber: 129,
                        columnNumber: 13
                    }, void 0),
                hr: ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("hr", {
                        style: {
                            borderColor: "var(--border)",
                            margin: "1rem 0"
                        }
                    }, void 0, false, {
                        fileName: "[project]/components/MarkdownPreview.tsx",
                        lineNumber: 133,
                        columnNumber: 21
                    }, void 0)
            },
            children: processedContent || "*No content yet*"
        }, void 0, false, {
            fileName: "[project]/components/MarkdownPreview.tsx",
            lineNumber: 33,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/MarkdownPreview.tsx",
        lineNumber: 21,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/[locale]/(admin)/admin/posts/[id]/CoverImageUpload.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CoverImageUpload",
    ()=>CoverImageUpload
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$navigation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/navigation.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
function CoverImageUpload({ postId, currentPath, supabaseUrl, uploadAction, focusKeyword, onCoverChange }) {
    const [uploading, setUploading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [generating, setGenerating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedFile, setSelectedFile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [previewUrl, setPreviewUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [success, setSuccess] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const fileRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$navigation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const storedUrl = currentPath ? `${supabaseUrl}/storage/v1/object/public/covers/${currentPath}` : null;
    const displayUrl = previewUrl ?? storedUrl;
    function handleFileChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedFile(file.name);
        setPreviewUrl(URL.createObjectURL(file));
        setError(null);
    }
    async function handleUpload() {
        if (!fileRef.current?.files?.[0]) {
            setError("Please choose a file first.");
            return;
        }
        const formData = new FormData();
        formData.append("file", fileRef.current.files[0]);
        setError(null);
        setUploading(true);
        const result = await uploadAction(formData);
        setUploading(false);
        if (result?.error) {
            setError(result.error);
            return;
        }
        const objectUrl = URL.createObjectURL(fileRef.current.files[0]);
        setPreviewUrl(objectUrl);
        onCoverChange?.(objectUrl);
        showSuccess();
        router.refresh();
    }
    async function handleGenerate() {
        const query = focusKeyword ?? "blog content technology";
        setError(null);
        setGenerating(true);
        try {
            const res = await fetch("/api/agent/cover", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    post_id: postId,
                    query
                })
            });
            const json = await res.json();
            if (!res.ok) {
                setError(json.error ?? "Failed to generate cover");
                return;
            }
            setPreviewUrl(json.publicUrl);
            onCoverChange?.(json.publicUrl);
            showSuccess();
            router.refresh();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Unknown error");
        } finally{
            setGenerating(false);
        }
    }
    function showSuccess() {
        setSuccess(true);
        setTimeout(()=>setSuccess(false), 3000);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-3",
        children: [
            displayUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative overflow-hidden rounded-xl",
                style: {
                    border: "1px solid var(--border)",
                    maxWidth: "320px",
                    aspectRatio: "16/9"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                    src: displayUrl,
                    alt: "Cover",
                    className: "w-full h-full object-cover"
                }, void 0, false, {
                    fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/CoverImageUpload.tsx",
                    lineNumber: 101,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/CoverImageUpload.tsx",
                lineNumber: 97,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all",
                        style: {
                            background: "var(--surface-raised)",
                            border: "1px solid var(--border)",
                            color: selectedFile ? "var(--text)" : "var(--text-muted)"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                width: "13",
                                height: "13",
                                viewBox: "0 0 16 16",
                                fill: "none",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        d: "M8 2v9M4 6l4-4 4 4",
                                        stroke: "currentColor",
                                        strokeWidth: "1.5",
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round"
                                    }, void 0, false, {
                                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/CoverImageUpload.tsx",
                                        lineNumber: 121,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        d: "M2 13h12",
                                        stroke: "currentColor",
                                        strokeWidth: "1.5",
                                        strokeLinecap: "round"
                                    }, void 0, false, {
                                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/CoverImageUpload.tsx",
                                        lineNumber: 122,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/CoverImageUpload.tsx",
                                lineNumber: 120,
                                columnNumber: 11
                            }, this),
                            selectedFile ? selectedFile : "Choose file",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                ref: fileRef,
                                type: "file",
                                accept: "image/*",
                                className: "sr-only",
                                onChange: handleFileChange
                            }, void 0, false, {
                                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/CoverImageUpload.tsx",
                                lineNumber: 125,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/CoverImageUpload.tsx",
                        lineNumber: 112,
                        columnNumber: 9
                    }, this),
                    selectedFile && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: handleUpload,
                        disabled: uploading,
                        className: "px-3 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-40",
                        style: {
                            background: "var(--accent)",
                            color: "white"
                        },
                        children: uploading ? "Uploading…" : "Upload"
                    }, void 0, false, {
                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/CoverImageUpload.tsx",
                        lineNumber: 136,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs",
                        style: {
                            color: "var(--text-faint)"
                        },
                        children: "or"
                    }, void 0, false, {
                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/CoverImageUpload.tsx",
                        lineNumber: 148,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: handleGenerate,
                        disabled: generating || uploading,
                        className: "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-40",
                        style: {
                            background: generating ? "var(--surface-raised)" : "linear-gradient(135deg, #7c5cfc, #a78bfa)",
                            color: generating ? "var(--text-muted)" : "white",
                            border: generating ? "1px solid var(--border)" : "none",
                            boxShadow: generating ? "none" : "0 0 16px rgba(124,92,252,0.25)"
                        },
                        children: generating ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    className: "animate-spin",
                                    width: "12",
                                    height: "12",
                                    viewBox: "0 0 24 24",
                                    fill: "none",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                        cx: "12",
                                        cy: "12",
                                        r: "10",
                                        stroke: "currentColor",
                                        strokeWidth: "3",
                                        strokeDasharray: "40",
                                        strokeDashoffset: "10"
                                    }, void 0, false, {
                                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/CoverImageUpload.tsx",
                                        lineNumber: 166,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/CoverImageUpload.tsx",
                                    lineNumber: 165,
                                    columnNumber: 15
                                }, this),
                                "Generating…"
                            ]
                        }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    width: "12",
                                    height: "12",
                                    viewBox: "0 0 24 24",
                                    fill: "none",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        d: "M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z",
                                        fill: "currentColor"
                                    }, void 0, false, {
                                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/CoverImageUpload.tsx",
                                        lineNumber: 173,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/CoverImageUpload.tsx",
                                    lineNumber: 172,
                                    columnNumber: 15
                                }, this),
                                "Generate cover"
                            ]
                        }, void 0, true)
                    }, void 0, false, {
                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/CoverImageUpload.tsx",
                        lineNumber: 151,
                        columnNumber: 9
                    }, this),
                    success && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs font-medium",
                        style: {
                            color: "var(--success)"
                        },
                        children: "✓ Saved"
                    }, void 0, false, {
                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/CoverImageUpload.tsx",
                        lineNumber: 181,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/CoverImageUpload.tsx",
                lineNumber: 110,
                columnNumber: 7
            }, this),
            focusKeyword && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs",
                style: {
                    color: "var(--text-faint)"
                },
                children: [
                    "Will search Unsplash for: ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            color: "var(--text-muted)"
                        },
                        children: focusKeyword
                    }, void 0, false, {
                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/CoverImageUpload.tsx",
                        lineNumber: 187,
                        columnNumber: 37
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/CoverImageUpload.tsx",
                lineNumber: 186,
                columnNumber: 9
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs",
                style: {
                    color: "var(--danger)"
                },
                children: error
            }, void 0, false, {
                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/CoverImageUpload.tsx",
                lineNumber: 192,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/CoverImageUpload.tsx",
        lineNumber: 94,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/[locale]/(admin)/admin/sources/data:bff175 [app-ssr] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"60031cb0a2f7a71602cac1ae5b18a7eb19b0675106":"addCitation"},"app/[locale]/(admin)/admin/sources/actions.ts",""] */ __turbopack_context__.s([
    "addCitation",
    ()=>addCitation
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-ssr] (ecmascript)");
"use turbopack no side effects";
;
var addCitation = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createServerReference"])("60031cb0a2f7a71602cac1ae5b18a7eb19b0675106", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findSourceMapURL"], "addCitation"); //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYWN0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzZXJ2ZXJcIjtcblxuaW1wb3J0IHsgY3JlYXRlQ2xpZW50IH0gZnJvbSBcIkAvbGliL3N1cGFiYXNlL3NlcnZlclwiO1xuaW1wb3J0IHsgZ2V0VXNlciB9IGZyb20gXCJAL2xpYi9hdXRoXCI7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRTb3VyY2VzTGlzdCgpIHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBhd2FpdCBjcmVhdGVDbGllbnQoKTtcbiAgY29uc3QgeyBkYXRhLCBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcbiAgICAuZnJvbShcInNvdXJjZXNcIilcbiAgICAuc2VsZWN0KFwiaWQsIHVybCwgdGl0bGUsIHB1Ymxpc2hlciwgY3JlYXRlZF9hdFwiKVxuICAgIC5vcmRlcihcImNyZWF0ZWRfYXRcIiwgeyBhc2NlbmRpbmc6IGZhbHNlIH0pO1xuICBpZiAoZXJyb3IpIHRocm93IGVycm9yO1xuICByZXR1cm4gZGF0YSA/PyBbXTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVNvdXJjZShmb3JtRGF0YTogRm9ybURhdGEpIHtcbiAgY29uc3QgdXNlciA9IGF3YWl0IGdldFVzZXIoKTtcbiAgaWYgKCF1c2VyKSByZXR1cm4geyBlcnJvcjogXCJVbmF1dGhvcml6ZWRcIiB9O1xuXG4gIGNvbnN0IHVybCA9IGZvcm1EYXRhLmdldChcInVybFwiKT8udG9TdHJpbmcoKT8udHJpbSgpO1xuICBpZiAoIXVybCkgcmV0dXJuIHsgZXJyb3I6IFwiVVJMIGlzIHJlcXVpcmVkXCIgfTtcblxuICBjb25zdCBzdXBhYmFzZSA9IGF3YWl0IGNyZWF0ZUNsaWVudCgpO1xuICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZS5mcm9tKFwic291cmNlc1wiKS5pbnNlcnQoe1xuICAgIHVybCxcbiAgICB0aXRsZTogZm9ybURhdGEuZ2V0KFwidGl0bGVcIik/LnRvU3RyaW5nKCk/LnRyaW0oKSB8fCBudWxsLFxuICAgIHB1Ymxpc2hlcjogZm9ybURhdGEuZ2V0KFwicHVibGlzaGVyXCIpPy50b1N0cmluZygpPy50cmltKCkgfHwgbnVsbCxcbiAgICBub3RlczogZm9ybURhdGEuZ2V0KFwibm90ZXNcIik/LnRvU3RyaW5nKCk/LnRyaW0oKSB8fCBudWxsLFxuICAgIGNyZWF0ZWRfYnk6IHVzZXIuaWQsXG4gIH0pO1xuICBpZiAoZXJyb3IpIHJldHVybiB7IGVycm9yOiBlcnJvci5tZXNzYWdlIH07XG4gIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldENpdGF0aW9uc0ZvclBvc3QocG9zdElkOiBzdHJpbmcsIGxvY2FsZT86IHN0cmluZykge1xuICBjb25zdCBzdXBhYmFzZSA9IGF3YWl0IGNyZWF0ZUNsaWVudCgpO1xuICBsZXQgcXVlcnkgPSBzdXBhYmFzZVxuICAgIC5mcm9tKFwiY2l0YXRpb25zXCIpXG4gICAgLnNlbGVjdChcImlkLCBzb3VyY2VfaWQsIGxvY2FsZSwgcXVvdGUsIGNsYWltLCBzZWN0aW9uX2FuY2hvciwgc291cmNlcyh1cmwsIHRpdGxlLCBwdWJsaXNoZXIpXCIpXG4gICAgLmVxKFwicG9zdF9pZFwiLCBwb3N0SWQpO1xuICBpZiAobG9jYWxlKSBxdWVyeSA9IHF1ZXJ5LmVxKFwibG9jYWxlXCIsIGxvY2FsZSk7XG4gIGNvbnN0IHsgZGF0YSwgZXJyb3IgfSA9IGF3YWl0IHF1ZXJ5Lm9yZGVyKFwiY3JlYXRlZF9hdFwiLCB7IGFzY2VuZGluZzogZmFsc2UgfSk7XG4gIGlmIChlcnJvcikgdGhyb3cgZXJyb3I7XG4gIHJldHVybiBkYXRhID8/IFtdO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWRkQ2l0YXRpb24ocG9zdElkOiBzdHJpbmcsIGZvcm1EYXRhOiBGb3JtRGF0YSkge1xuICBjb25zdCB1c2VyID0gYXdhaXQgZ2V0VXNlcigpO1xuICBpZiAoIXVzZXIpIHJldHVybiB7IGVycm9yOiBcIlVuYXV0aG9yaXplZFwiIH07XG4gIGNvbnN0IHNvdXJjZUlkID0gZm9ybURhdGEuZ2V0KFwic291cmNlX2lkXCIpPy50b1N0cmluZygpO1xuICBjb25zdCBsb2NhbGUgPSBmb3JtRGF0YS5nZXQoXCJsb2NhbGVcIik/LnRvU3RyaW5nKCk7XG4gIGlmICghc291cmNlSWQgfHwgIWxvY2FsZSkgcmV0dXJuIHsgZXJyb3I6IFwiU291cmNlIGFuZCBsb2NhbGUgcmVxdWlyZWRcIiB9O1xuXG4gIGNvbnN0IHN1cGFiYXNlID0gYXdhaXQgY3JlYXRlQ2xpZW50KCk7XG4gIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oXCJjaXRhdGlvbnNcIikuaW5zZXJ0KHtcbiAgICBwb3N0X2lkOiBwb3N0SWQsXG4gICAgc291cmNlX2lkOiBzb3VyY2VJZCxcbiAgICBsb2NhbGUsXG4gICAgcXVvdGU6IGZvcm1EYXRhLmdldChcInF1b3RlXCIpPy50b1N0cmluZygpPy50cmltKCkgfHwgbnVsbCxcbiAgICBjbGFpbTogZm9ybURhdGEuZ2V0KFwiY2xhaW1cIik/LnRvU3RyaW5nKCk/LnRyaW0oKSB8fCBudWxsLFxuICAgIHNlY3Rpb25fYW5jaG9yOiBmb3JtRGF0YS5nZXQoXCJzZWN0aW9uX2FuY2hvclwiKT8udG9TdHJpbmcoKT8udHJpbSgpIHx8IG51bGwsXG4gIH0pO1xuICBpZiAoZXJyb3IpIHJldHVybiB7IGVycm9yOiBlcnJvci5tZXNzYWdlIH07XG4gIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlbW92ZUNpdGF0aW9uKGNpdGF0aW9uSWQ6IHN0cmluZykge1xuICBjb25zdCB1c2VyID0gYXdhaXQgZ2V0VXNlcigpO1xuICBpZiAoIXVzZXIpIHJldHVybiB7IGVycm9yOiBcIlVuYXV0aG9yaXplZFwiIH07XG4gIGNvbnN0IHN1cGFiYXNlID0gYXdhaXQgY3JlYXRlQ2xpZW50KCk7XG4gIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oXCJjaXRhdGlvbnNcIikuZGVsZXRlKCkuZXEoXCJpZFwiLCBjaXRhdGlvbklkKTtcbiAgaWYgKGVycm9yKSByZXR1cm4geyBlcnJvcjogZXJyb3IubWVzc2FnZSB9O1xuICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH07XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6ImtUQThDc0IifQ==
}),
"[project]/app/[locale]/(admin)/admin/sources/data:5272d3 [app-ssr] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"4035cfd28ae1a7541fcb2fafb2b84ee9cafe69ccee":"removeCitation"},"app/[locale]/(admin)/admin/sources/actions.ts",""] */ __turbopack_context__.s([
    "removeCitation",
    ()=>removeCitation
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-ssr] (ecmascript)");
"use turbopack no side effects";
;
var removeCitation = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createServerReference"])("4035cfd28ae1a7541fcb2fafb2b84ee9cafe69ccee", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findSourceMapURL"], "removeCitation"); //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYWN0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzZXJ2ZXJcIjtcblxuaW1wb3J0IHsgY3JlYXRlQ2xpZW50IH0gZnJvbSBcIkAvbGliL3N1cGFiYXNlL3NlcnZlclwiO1xuaW1wb3J0IHsgZ2V0VXNlciB9IGZyb20gXCJAL2xpYi9hdXRoXCI7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRTb3VyY2VzTGlzdCgpIHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBhd2FpdCBjcmVhdGVDbGllbnQoKTtcbiAgY29uc3QgeyBkYXRhLCBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcbiAgICAuZnJvbShcInNvdXJjZXNcIilcbiAgICAuc2VsZWN0KFwiaWQsIHVybCwgdGl0bGUsIHB1Ymxpc2hlciwgY3JlYXRlZF9hdFwiKVxuICAgIC5vcmRlcihcImNyZWF0ZWRfYXRcIiwgeyBhc2NlbmRpbmc6IGZhbHNlIH0pO1xuICBpZiAoZXJyb3IpIHRocm93IGVycm9yO1xuICByZXR1cm4gZGF0YSA/PyBbXTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVNvdXJjZShmb3JtRGF0YTogRm9ybURhdGEpIHtcbiAgY29uc3QgdXNlciA9IGF3YWl0IGdldFVzZXIoKTtcbiAgaWYgKCF1c2VyKSByZXR1cm4geyBlcnJvcjogXCJVbmF1dGhvcml6ZWRcIiB9O1xuXG4gIGNvbnN0IHVybCA9IGZvcm1EYXRhLmdldChcInVybFwiKT8udG9TdHJpbmcoKT8udHJpbSgpO1xuICBpZiAoIXVybCkgcmV0dXJuIHsgZXJyb3I6IFwiVVJMIGlzIHJlcXVpcmVkXCIgfTtcblxuICBjb25zdCBzdXBhYmFzZSA9IGF3YWl0IGNyZWF0ZUNsaWVudCgpO1xuICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZS5mcm9tKFwic291cmNlc1wiKS5pbnNlcnQoe1xuICAgIHVybCxcbiAgICB0aXRsZTogZm9ybURhdGEuZ2V0KFwidGl0bGVcIik/LnRvU3RyaW5nKCk/LnRyaW0oKSB8fCBudWxsLFxuICAgIHB1Ymxpc2hlcjogZm9ybURhdGEuZ2V0KFwicHVibGlzaGVyXCIpPy50b1N0cmluZygpPy50cmltKCkgfHwgbnVsbCxcbiAgICBub3RlczogZm9ybURhdGEuZ2V0KFwibm90ZXNcIik/LnRvU3RyaW5nKCk/LnRyaW0oKSB8fCBudWxsLFxuICAgIGNyZWF0ZWRfYnk6IHVzZXIuaWQsXG4gIH0pO1xuICBpZiAoZXJyb3IpIHJldHVybiB7IGVycm9yOiBlcnJvci5tZXNzYWdlIH07XG4gIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldENpdGF0aW9uc0ZvclBvc3QocG9zdElkOiBzdHJpbmcsIGxvY2FsZT86IHN0cmluZykge1xuICBjb25zdCBzdXBhYmFzZSA9IGF3YWl0IGNyZWF0ZUNsaWVudCgpO1xuICBsZXQgcXVlcnkgPSBzdXBhYmFzZVxuICAgIC5mcm9tKFwiY2l0YXRpb25zXCIpXG4gICAgLnNlbGVjdChcImlkLCBzb3VyY2VfaWQsIGxvY2FsZSwgcXVvdGUsIGNsYWltLCBzZWN0aW9uX2FuY2hvciwgc291cmNlcyh1cmwsIHRpdGxlLCBwdWJsaXNoZXIpXCIpXG4gICAgLmVxKFwicG9zdF9pZFwiLCBwb3N0SWQpO1xuICBpZiAobG9jYWxlKSBxdWVyeSA9IHF1ZXJ5LmVxKFwibG9jYWxlXCIsIGxvY2FsZSk7XG4gIGNvbnN0IHsgZGF0YSwgZXJyb3IgfSA9IGF3YWl0IHF1ZXJ5Lm9yZGVyKFwiY3JlYXRlZF9hdFwiLCB7IGFzY2VuZGluZzogZmFsc2UgfSk7XG4gIGlmIChlcnJvcikgdGhyb3cgZXJyb3I7XG4gIHJldHVybiBkYXRhID8/IFtdO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWRkQ2l0YXRpb24ocG9zdElkOiBzdHJpbmcsIGZvcm1EYXRhOiBGb3JtRGF0YSkge1xuICBjb25zdCB1c2VyID0gYXdhaXQgZ2V0VXNlcigpO1xuICBpZiAoIXVzZXIpIHJldHVybiB7IGVycm9yOiBcIlVuYXV0aG9yaXplZFwiIH07XG4gIGNvbnN0IHNvdXJjZUlkID0gZm9ybURhdGEuZ2V0KFwic291cmNlX2lkXCIpPy50b1N0cmluZygpO1xuICBjb25zdCBsb2NhbGUgPSBmb3JtRGF0YS5nZXQoXCJsb2NhbGVcIik/LnRvU3RyaW5nKCk7XG4gIGlmICghc291cmNlSWQgfHwgIWxvY2FsZSkgcmV0dXJuIHsgZXJyb3I6IFwiU291cmNlIGFuZCBsb2NhbGUgcmVxdWlyZWRcIiB9O1xuXG4gIGNvbnN0IHN1cGFiYXNlID0gYXdhaXQgY3JlYXRlQ2xpZW50KCk7XG4gIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oXCJjaXRhdGlvbnNcIikuaW5zZXJ0KHtcbiAgICBwb3N0X2lkOiBwb3N0SWQsXG4gICAgc291cmNlX2lkOiBzb3VyY2VJZCxcbiAgICBsb2NhbGUsXG4gICAgcXVvdGU6IGZvcm1EYXRhLmdldChcInF1b3RlXCIpPy50b1N0cmluZygpPy50cmltKCkgfHwgbnVsbCxcbiAgICBjbGFpbTogZm9ybURhdGEuZ2V0KFwiY2xhaW1cIik/LnRvU3RyaW5nKCk/LnRyaW0oKSB8fCBudWxsLFxuICAgIHNlY3Rpb25fYW5jaG9yOiBmb3JtRGF0YS5nZXQoXCJzZWN0aW9uX2FuY2hvclwiKT8udG9TdHJpbmcoKT8udHJpbSgpIHx8IG51bGwsXG4gIH0pO1xuICBpZiAoZXJyb3IpIHJldHVybiB7IGVycm9yOiBlcnJvci5tZXNzYWdlIH07XG4gIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlbW92ZUNpdGF0aW9uKGNpdGF0aW9uSWQ6IHN0cmluZykge1xuICBjb25zdCB1c2VyID0gYXdhaXQgZ2V0VXNlcigpO1xuICBpZiAoIXVzZXIpIHJldHVybiB7IGVycm9yOiBcIlVuYXV0aG9yaXplZFwiIH07XG4gIGNvbnN0IHN1cGFiYXNlID0gYXdhaXQgY3JlYXRlQ2xpZW50KCk7XG4gIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oXCJjaXRhdGlvbnNcIikuZGVsZXRlKCkuZXEoXCJpZFwiLCBjaXRhdGlvbklkKTtcbiAgaWYgKGVycm9yKSByZXR1cm4geyBlcnJvcjogZXJyb3IubWVzc2FnZSB9O1xuICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH07XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6InFUQWtFc0IifQ==
}),
"[project]/app/[locale]/(admin)/admin/posts/[id]/CitationsBlock.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CitationsBlock",
    ()=>CitationsBlock
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$navigation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/navigation.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$sources$2f$data$3a$bff175__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/app/[locale]/(admin)/admin/sources/data:bff175 [app-ssr] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$sources$2f$data$3a$5272d3__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/app/[locale]/(admin)/admin/sources/data:5272d3 [app-ssr] (ecmascript) <text/javascript>");
"use client";
;
;
;
;
function CitationsBlock({ postId, currentLocale, sources, citations }) {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$navigation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [adding, setAdding] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    async function handleAdd(e) {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        formData.set("locale", currentLocale);
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$sources$2f$data$3a$bff175__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["addCitation"])(postId, formData);
        if (result.error) alert(result.error);
        else {
            setAdding(false);
            form.reset();
            router.refresh();
        }
    }
    async function handleRemove(id) {
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$sources$2f$data$3a$5272d3__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["removeCitation"])(id);
        if (result.error) alert(result.error);
        else router.refresh();
    }
    const source = (c)=>{
        const s = c.sources;
        return Array.isArray(s) ? s[0] : s;
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "border border-gray-200 dark:border-gray-700 rounded p-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "font-medium mb-4",
                children: "Citations"
            }, void 0, false, {
                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/CitationsBlock.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                className: "space-y-2 mb-4",
                children: citations.filter((c)=>c.locale === currentLocale).map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        className: "flex items-start justify-between gap-2 text-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                        href: source(c)?.url,
                                        target: "_blank",
                                        rel: "noopener noreferrer",
                                        className: "text-blue-600 dark:text-blue-400 hover:underline",
                                        children: source(c)?.title || source(c)?.url
                                    }, void 0, false, {
                                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/CitationsBlock.tsx",
                                        lineNumber: 64,
                                        columnNumber: 15
                                    }, this),
                                    c.claim && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-gray-600 dark:text-gray-400",
                                        children: c.claim
                                    }, void 0, false, {
                                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/CitationsBlock.tsx",
                                        lineNumber: 72,
                                        columnNumber: 27
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/CitationsBlock.tsx",
                                lineNumber: 63,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>handleRemove(c.id),
                                className: "text-red-600 dark:text-red-400 hover:underline",
                                children: "Remove"
                            }, void 0, false, {
                                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/CitationsBlock.tsx",
                                lineNumber: 74,
                                columnNumber: 13
                            }, this)
                        ]
                    }, c.id, true, {
                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/CitationsBlock.tsx",
                        lineNumber: 62,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/CitationsBlock.tsx",
                lineNumber: 60,
                columnNumber: 7
            }, this),
            !adding ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: ()=>setAdding(true),
                className: "text-sm text-blue-600 dark:text-blue-400 hover:underline",
                children: "+ Add citation"
            }, void 0, false, {
                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/CitationsBlock.tsx",
                lineNumber: 85,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                onSubmit: handleAdd,
                className: "space-y-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        name: "source_id",
                        required: true,
                        className: "w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "",
                                children: "Select source"
                            }, void 0, false, {
                                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/CitationsBlock.tsx",
                                lineNumber: 99,
                                columnNumber: 13
                            }, this),
                            sources.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: s.id,
                                    children: s.title || s.url
                                }, s.id, false, {
                                    fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/CitationsBlock.tsx",
                                    lineNumber: 101,
                                    columnNumber: 15
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/CitationsBlock.tsx",
                        lineNumber: 94,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        name: "claim",
                        placeholder: "Claim",
                        className: "w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
                    }, void 0, false, {
                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/CitationsBlock.tsx",
                        lineNumber: 104,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        name: "quote",
                        placeholder: "Quote",
                        className: "w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
                    }, void 0, false, {
                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/CitationsBlock.tsx",
                        lineNumber: 109,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        name: "section_anchor",
                        placeholder: "Section anchor (#h2-intro)",
                        className: "w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
                    }, void 0, false, {
                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/CitationsBlock.tsx",
                        lineNumber: 114,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "submit",
                                className: "px-3 py-1.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded text-sm",
                                children: "Add"
                            }, void 0, false, {
                                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/CitationsBlock.tsx",
                                lineNumber: 120,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setAdding(false),
                                className: "text-sm",
                                children: "Cancel"
                            }, void 0, false, {
                                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/CitationsBlock.tsx",
                                lineNumber: 121,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/CitationsBlock.tsx",
                        lineNumber: 119,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/CitationsBlock.tsx",
                lineNumber: 93,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/CitationsBlock.tsx",
        lineNumber: 58,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EditPostForm",
    ()=>EditPostForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MarkdownPreview$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/MarkdownPreview.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f5b$id$5d2f$CoverImageUpload$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/[locale]/(admin)/admin/posts/[id]/CoverImageUpload.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f5b$id$5d2f$CitationsBlock$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/[locale]/(admin)/admin/posts/[id]/CitationsBlock.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
function InputField({ label, hint, children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-baseline gap-2 mb-1.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "text-xs font-semibold uppercase tracking-wider",
                        style: {
                            color: "var(--text-muted)"
                        },
                        children: label
                    }, void 0, false, {
                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                        lineNumber: 60,
                        columnNumber: 9
                    }, this),
                    hint && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs",
                        style: {
                            color: "var(--text-faint)"
                        },
                        children: hint
                    }, void 0, false, {
                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                        lineNumber: 63,
                        columnNumber: 18
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, this),
            children
        ]
    }, void 0, true, {
        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
        lineNumber: 58,
        columnNumber: 5
    }, this);
}
const inputStyle = {
    background: "var(--surface-raised)",
    border: "1px solid var(--border)",
    color: "var(--text)",
    borderRadius: "0.75rem",
    padding: "0.625rem 0.875rem",
    width: "100%",
    fontSize: "0.875rem",
    outline: "none"
};
const focusStyle = {
    borderColor: "var(--accent)"
};
const blurStyle = {
    borderColor: "var(--border)"
};
function EditPostForm({ post, statusOptions, contentTypes, locales, labels, updatePostAction, upsertLocalizationAction, uploadCoverAction, supabaseUrl, sources, citations }) {
    const [postState, setPostState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useActionState"])(async (_, formData)=>updatePostAction(formData), null);
    const [locState, setLocState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useActionState"])(async (_, formData)=>upsertLocalizationAction(formData), null);
    const [activeLocale, setActiveLocale] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(post.primary_locale);
    const [isPending, startTransition] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTransition"])();
    const [coverUrl, setCoverUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(post.cover_image_path ? `${supabaseUrl}/storage/v1/object/public/covers/${post.cover_image_path}` : null);
    const locMap = new Map(post.post_localizations.map((l)=>[
            l.locale,
            l
        ]));
    const currentLoc = locMap.get(activeLocale) ?? {
        locale: activeLocale,
        title: "",
        excerpt: "",
        content_md: "",
        seo_title: null,
        seo_description: null,
        focus_keyword: null,
        faq_blocks: null
    };
    // Local draft state for all editable localization fields
    const [drafts, setDrafts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>Object.fromEntries(post.post_localizations.map((l)=>[
                l.locale,
                l
            ])));
    const draft = drafts[activeLocale] ?? currentLoc;
    function setField(field, value) {
        setDrafts((prev)=>({
                ...prev,
                [activeLocale]: {
                    ...prev[activeLocale] ?? currentLoc,
                    [field]: value
                }
            }));
    }
    // AI generation state
    const [generating, setGenerating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [genError, setGenError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [genSuccess, setGenSuccess] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    async function handleGenerate() {
        setGenerating(true);
        setGenError(null);
        setGenSuccess(false);
        try {
            const res = await fetch("/api/agent/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    post_id: post.id,
                    locale: activeLocale,
                    focus_keyword: draft.focus_keyword ?? undefined
                })
            });
            const json = await res.json();
            if (!res.ok) {
                setGenError(json.error ?? "Generation failed");
                return;
            }
            // Merge generated content into local draft state so the editor updates immediately
            startTransition(()=>{
                setDrafts((prev)=>({
                        ...prev,
                        [activeLocale]: {
                            ...prev[activeLocale] ?? currentLoc,
                            title: json.data.title,
                            excerpt: json.data.excerpt,
                            content_md: json.data.content_md,
                            seo_title: json.data.seo_title,
                            seo_description: json.data.seo_description,
                            focus_keyword: json.data.focus_keyword,
                            faq_blocks: json.data.faq_blocks
                        }
                    }));
            });
            setGenSuccess(true);
            // If the API auto-generated a cover image, update the preview immediately
            if (json.coverPublicUrl) {
                setCoverUrl(json.coverPublicUrl);
            }
            setTimeout(()=>setGenSuccess(false), 4000);
            router.refresh();
        } catch (e) {
            setGenError(e instanceof Error ? e.message : "Unknown error");
        } finally{
            setGenerating(false);
        }
    }
    const sectionStyle = {
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "1rem",
        padding: "1.5rem"
    };
    const sectionHeadingStyle = {
        color: "var(--accent)",
        fontSize: "0.65rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        marginBottom: "1rem"
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                style: sectionStyle,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: sectionHeadingStyle,
                        children: labels.postSettings
                    }, void 0, false, {
                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                        lineNumber: 203,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                        action: setPostState,
                        className: "space-y-5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "hidden",
                                name: "id",
                                value: post.id
                            }, void 0, false, {
                                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                lineNumber: 205,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(InputField, {
                                        label: labels.slug,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            name: "slug",
                                            defaultValue: post.slug,
                                            style: inputStyle,
                                            onFocus: (e)=>Object.assign(e.currentTarget.style, focusStyle),
                                            onBlur: (e)=>Object.assign(e.currentTarget.style, blurStyle)
                                        }, void 0, false, {
                                            fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                            lineNumber: 209,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                        lineNumber: 208,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(InputField, {
                                        label: labels.status,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                            name: "status",
                                            defaultValue: post.status,
                                            style: {
                                                ...inputStyle,
                                                cursor: "pointer"
                                            },
                                            onFocus: (e)=>Object.assign(e.currentTarget.style, focusStyle),
                                            onBlur: (e)=>Object.assign(e.currentTarget.style, blurStyle),
                                            children: statusOptions.map((o)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: o.value,
                                                    children: o.label
                                                }, o.value, false, {
                                                    fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                                    lineNumber: 222,
                                                    columnNumber: 43
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                            lineNumber: 217,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                        lineNumber: 216,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(InputField, {
                                        label: labels.contentType,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                            name: "content_type",
                                            defaultValue: post.content_type,
                                            style: {
                                                ...inputStyle,
                                                cursor: "pointer"
                                            },
                                            onFocus: (e)=>Object.assign(e.currentTarget.style, focusStyle),
                                            onBlur: (e)=>Object.assign(e.currentTarget.style, blurStyle),
                                            children: contentTypes.map((o)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: o.value,
                                                    children: o.label
                                                }, o.value, false, {
                                                    fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                                    lineNumber: 232,
                                                    columnNumber: 42
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                            lineNumber: 227,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                        lineNumber: 226,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(InputField, {
                                        label: labels.primaryLocale,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                            name: "primary_locale",
                                            defaultValue: post.primary_locale,
                                            style: {
                                                ...inputStyle,
                                                cursor: "pointer"
                                            },
                                            onFocus: (e)=>Object.assign(e.currentTarget.style, focusStyle),
                                            onBlur: (e)=>Object.assign(e.currentTarget.style, blurStyle),
                                            children: locales.map((l)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: l,
                                                    children: l
                                                }, l, false, {
                                                    fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                                    lineNumber: 242,
                                                    columnNumber: 37
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                            lineNumber: 237,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                        lineNumber: 236,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(InputField, {
                                        label: labels.publishedAt,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "datetime-local",
                                            name: "published_at",
                                            defaultValue: post.published_at ? new Date(post.published_at).toISOString().slice(0, 16) : "",
                                            style: inputStyle,
                                            onFocus: (e)=>Object.assign(e.currentTarget.style, focusStyle),
                                            onBlur: (e)=>Object.assign(e.currentTarget.style, blurStyle)
                                        }, void 0, false, {
                                            fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                            lineNumber: 247,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                        lineNumber: 246,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(InputField, {
                                        label: labels.scheduledFor,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "datetime-local",
                                            name: "scheduled_for",
                                            defaultValue: post.scheduled_for ? new Date(post.scheduled_for).toISOString().slice(0, 16) : "",
                                            style: inputStyle,
                                            onFocus: (e)=>Object.assign(e.currentTarget.style, focusStyle),
                                            onBlur: (e)=>Object.assign(e.currentTarget.style, blurStyle)
                                        }, void 0, false, {
                                            fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                            lineNumber: 256,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                        lineNumber: 255,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                lineNumber: 207,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(InputField, {
                                label: labels.coverImage,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f5b$id$5d2f$CoverImageUpload$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CoverImageUpload"], {
                                    postId: post.id,
                                    currentPath: post.cover_image_path,
                                    supabaseUrl: supabaseUrl,
                                    uploadAction: uploadCoverAction,
                                    focusKeyword: draft.focus_keyword ?? undefined,
                                    onCoverChange: setCoverUrl
                                }, void 0, false, {
                                    fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                    lineNumber: 266,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                lineNumber: 265,
                                columnNumber: 13
                            }, this),
                            postState?.error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm",
                                style: {
                                    color: "var(--danger)"
                                },
                                children: postState.error
                            }, void 0, false, {
                                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                lineNumber: 277,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "submit",
                                className: "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all",
                                style: {
                                    background: "var(--accent)",
                                    color: "white"
                                },
                                children: labels.save
                            }, void 0, false, {
                                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                lineNumber: 279,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                        lineNumber: 204,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                lineNumber: 202,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                style: sectionStyle,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between flex-wrap gap-3 mb-5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-2",
                                children: locales.map((l)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>setActiveLocale(l),
                                        className: "px-3 py-1.5 text-xs font-semibold uppercase rounded-lg transition-all",
                                        style: {
                                            background: activeLocale === l ? "var(--accent)" : "var(--surface-raised)",
                                            color: activeLocale === l ? "white" : "var(--text-muted)",
                                            border: activeLocale === l ? "none" : "1px solid var(--border)"
                                        },
                                        children: l
                                    }, l, false, {
                                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                        lineNumber: 294,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                lineNumber: 292,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3",
                                children: [
                                    genError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs",
                                        style: {
                                            color: "var(--danger)"
                                        },
                                        children: genError
                                    }, void 0, false, {
                                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                        lineNumber: 309,
                                        columnNumber: 26
                                    }, this),
                                    genSuccess && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs font-medium",
                                        style: {
                                            color: "var(--success)"
                                        },
                                        children: "✓ Generated"
                                    }, void 0, false, {
                                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                        lineNumber: 310,
                                        columnNumber: 28
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: handleGenerate,
                                        disabled: generating || isPending,
                                        className: "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50",
                                        style: {
                                            background: generating ? "var(--surface-raised)" : "linear-gradient(135deg, #7c5cfc, #a78bfa)",
                                            color: "white",
                                            border: generating ? "1px solid var(--border)" : "none",
                                            boxShadow: generating ? "none" : "0 0 20px rgba(124,92,252,0.3)"
                                        },
                                        children: generating ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                    className: "animate-spin",
                                                    width: "14",
                                                    height: "14",
                                                    viewBox: "0 0 24 24",
                                                    fill: "none",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                        cx: "12",
                                                        cy: "12",
                                                        r: "10",
                                                        stroke: "currentColor",
                                                        strokeWidth: "3",
                                                        strokeDasharray: "40",
                                                        strokeDashoffset: "10"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                                        lineNumber: 326,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                                    lineNumber: 325,
                                                    columnNumber: 19
                                                }, this),
                                                "Generating…"
                                            ]
                                        }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                    width: "14",
                                                    height: "14",
                                                    viewBox: "0 0 24 24",
                                                    fill: "none",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                        d: "M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z",
                                                        fill: "currentColor"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                                        lineNumber: 333,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                                    lineNumber: 332,
                                                    columnNumber: 19
                                                }, this),
                                                "Generate with AI"
                                            ]
                                        }, void 0, true)
                                    }, void 0, false, {
                                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                        lineNumber: 311,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                lineNumber: 308,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                        lineNumber: 291,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                        action: setLocState,
                        className: "space-y-5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "hidden",
                                name: "locale",
                                value: activeLocale
                            }, void 0, false, {
                                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                lineNumber: 343,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(InputField, {
                                label: "Focus keyword",
                                hint: "drives AI generation",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    name: "focus_keyword",
                                    value: draft.focus_keyword ?? "",
                                    onChange: (e)=>setField("focus_keyword", e.target.value),
                                    placeholder: "e.g. seo strategy 2025",
                                    style: inputStyle,
                                    onFocus: (e)=>Object.assign(e.currentTarget.style, focusStyle),
                                    onBlur: (e)=>Object.assign(e.currentTarget.style, blurStyle)
                                }, `kw-${activeLocale}`, false, {
                                    fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                    lineNumber: 347,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                lineNumber: 346,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(InputField, {
                                label: labels.title,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    name: "title",
                                    value: draft.title ?? "",
                                    onChange: (e)=>setField("title", e.target.value),
                                    style: inputStyle,
                                    onFocus: (e)=>Object.assign(e.currentTarget.style, focusStyle),
                                    onBlur: (e)=>Object.assign(e.currentTarget.style, blurStyle)
                                }, `title-${activeLocale}`, false, {
                                    fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                    lineNumber: 360,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                lineNumber: 359,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(InputField, {
                                label: labels.excerpt,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "excerpt",
                                    value: draft.excerpt ?? "",
                                    onChange: (e)=>setField("excerpt", e.target.value),
                                    rows: 2,
                                    style: {
                                        ...inputStyle,
                                        resize: "vertical"
                                    },
                                    onFocus: (e)=>Object.assign(e.currentTarget.style, focusStyle),
                                    onBlur: (e)=>Object.assign(e.currentTarget.style, blurStyle)
                                }, `excerpt-${activeLocale}`, false, {
                                    fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                    lineNumber: 370,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                lineNumber: 369,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-xl p-4 space-y-4",
                                style: {
                                    background: "rgba(124,92,252,0.05)",
                                    border: "1px solid rgba(124,92,252,0.15)"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs font-semibold uppercase tracking-wider",
                                        style: {
                                            color: "var(--accent)"
                                        },
                                        children: "SEO / AEO"
                                    }, void 0, false, {
                                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                        lineNumber: 385,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(InputField, {
                                        label: "SEO title",
                                        hint: "50-60 chars",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                name: "seo_title",
                                                value: draft.seo_title ?? "",
                                                onChange: (e)=>setField("seo_title", e.target.value),
                                                placeholder: "Keyword-rich title for search engines",
                                                style: inputStyle,
                                                onFocus: (e)=>Object.assign(e.currentTarget.style, focusStyle),
                                                onBlur: (e)=>Object.assign(e.currentTarget.style, blurStyle)
                                            }, `seo_title-${activeLocale}`, false, {
                                                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                                lineNumber: 389,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "mt-1 text-xs",
                                                style: {
                                                    color: (draft.seo_title?.length ?? 0) > 60 ? "var(--danger)" : "var(--text-faint)"
                                                },
                                                children: [
                                                    draft.seo_title?.length ?? 0,
                                                    " / 60"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                                lineNumber: 397,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                        lineNumber: 388,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(InputField, {
                                        label: "Meta description",
                                        hint: "140-160 chars",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                name: "seo_description",
                                                value: draft.seo_description ?? "",
                                                onChange: (e)=>setField("seo_description", e.target.value),
                                                placeholder: "Compelling description with keyword and CTA",
                                                rows: 2,
                                                style: {
                                                    ...inputStyle,
                                                    resize: "vertical"
                                                },
                                                onFocus: (e)=>Object.assign(e.currentTarget.style, focusStyle),
                                                onBlur: (e)=>Object.assign(e.currentTarget.style, blurStyle)
                                            }, `seo_desc-${activeLocale}`, false, {
                                                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                                lineNumber: 402,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "mt-1 text-xs",
                                                style: {
                                                    color: (draft.seo_description?.length ?? 0) > 160 ? "var(--danger)" : "var(--text-faint)"
                                                },
                                                children: [
                                                    draft.seo_description?.length ?? 0,
                                                    " / 160"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                                lineNumber: 411,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                        lineNumber: 401,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                lineNumber: 381,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(InputField, {
                                label: labels.content,
                                hint: labels.markdownHint,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "content_md",
                                    value: draft.content_md ?? "",
                                    onChange: (e)=>setField("content_md", e.target.value),
                                    rows: 16,
                                    style: {
                                        ...inputStyle,
                                        resize: "vertical",
                                        fontFamily: "monospace",
                                        fontSize: "0.8rem"
                                    },
                                    onFocus: (e)=>Object.assign(e.currentTarget.style, focusStyle),
                                    onBlur: (e)=>Object.assign(e.currentTarget.style, blurStyle)
                                }, `content-${activeLocale}`, false, {
                                    fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                    lineNumber: 419,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                lineNumber: 418,
                                columnNumber: 11
                            }, this),
                            draft.content_md && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-xl p-5",
                                style: {
                                    background: "var(--surface-raised)",
                                    border: "1px solid var(--border)"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs font-semibold uppercase tracking-wider mb-3",
                                        style: {
                                            color: "var(--text-muted)"
                                        },
                                        children: labels.preview
                                    }, void 0, false, {
                                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                        lineNumber: 435,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MarkdownPreview$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MarkdownPreview"], {
                                        content: draft.content_md,
                                        coverImageUrl: coverUrl
                                    }, void 0, false, {
                                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                        lineNumber: 438,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                lineNumber: 431,
                                columnNumber: 13
                            }, this),
                            draft.faq_blocks && draft.faq_blocks.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-xl p-4 space-y-3",
                                style: {
                                    background: "rgba(34,211,160,0.05)",
                                    border: "1px solid rgba(34,211,160,0.15)"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs font-semibold uppercase tracking-wider",
                                        style: {
                                            color: "var(--success)"
                                        },
                                        children: [
                                            "FAQ blocks (AEO · ",
                                            draft.faq_blocks.length,
                                            " items)"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                        lineNumber: 448,
                                        columnNumber: 15
                                    }, this),
                                    draft.faq_blocks.map((faq, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm font-medium",
                                                    style: {
                                                        color: "var(--text)"
                                                    },
                                                    children: [
                                                        "Q: ",
                                                        faq.question
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                                    lineNumber: 453,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm",
                                                    style: {
                                                        color: "var(--text-muted)"
                                                    },
                                                    children: [
                                                        "A: ",
                                                        faq.answer
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                                    lineNumber: 454,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, i, true, {
                                            fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                            lineNumber: 452,
                                            columnNumber: 17
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                lineNumber: 444,
                                columnNumber: 13
                            }, this),
                            locState?.error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm",
                                style: {
                                    color: "var(--danger)"
                                },
                                children: locState.error
                            }, void 0, false, {
                                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                lineNumber: 461,
                                columnNumber: 13
                            }, this),
                            locState?.success && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm font-medium",
                                style: {
                                    color: "var(--success)"
                                },
                                children: "Saved!"
                            }, void 0, false, {
                                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                lineNumber: 464,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "submit",
                                className: "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all",
                                style: {
                                    background: "var(--accent)",
                                    color: "white"
                                },
                                children: labels.save
                            }, void 0, false, {
                                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                                lineNumber: 467,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                        lineNumber: 342,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                lineNumber: 289,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$posts$2f5b$id$5d2f$CitationsBlock$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CitationsBlock"], {
                postId: post.id,
                currentLocale: activeLocale,
                sources: sources,
                citations: citations
            }, void 0, false, {
                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
                lineNumber: 476,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/EditPostForm.tsx",
        lineNumber: 199,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/[locale]/(admin)/admin/review-queue/data:e9d429 [app-ssr] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"40e7928795a0a2f841f06650912c31711986dfc5a9":"getReviewChecklist"},"app/[locale]/(admin)/admin/review-queue/actions.ts",""] */ __turbopack_context__.s([
    "getReviewChecklist",
    ()=>getReviewChecklist
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-ssr] (ecmascript)");
"use turbopack no side effects";
;
var getReviewChecklist = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createServerReference"])("40e7928795a0a2f841f06650912c31711986dfc5a9", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findSourceMapURL"], "getReviewChecklist"); //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYWN0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzZXJ2ZXJcIjtcblxuaW1wb3J0IHsgY3JlYXRlQ2xpZW50IH0gZnJvbSBcIkAvbGliL3N1cGFiYXNlL3NlcnZlclwiO1xuaW1wb3J0IHsgcmVxdWlyZVJldmlld2VyLCBnZXRVc2VyIH0gZnJvbSBcIkAvbGliL2F1dGhcIjtcblxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UmV2aWV3Q2hlY2tsaXN0KHBvc3RJZDogc3RyaW5nKSB7XG4gIGF3YWl0IHJlcXVpcmVSZXZpZXdlcigpO1xuICBjb25zdCBzdXBhYmFzZSA9IGF3YWl0IGNyZWF0ZUNsaWVudCgpO1xuICBjb25zdCB7IGRhdGEsIGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgIC5mcm9tKFwicmV2aWV3X2NoZWNrbGlzdHNcIilcbiAgICAuc2VsZWN0KFwiKlwiKVxuICAgIC5lcShcInBvc3RfaWRcIiwgcG9zdElkKVxuICAgIC5pcyhcImxvY2FsZVwiLCBudWxsKVxuICAgIC5tYXliZVNpbmdsZSgpO1xuICBpZiAoZXJyb3IpIHRocm93IGVycm9yO1xuICByZXR1cm4gZGF0YTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNhdmVSZXZpZXdDaGVja2xpc3QoXG4gIHBvc3RJZDogc3RyaW5nLFxuICBpdGVtczogQXJyYXk8eyBrZXk6IHN0cmluZzsgbGFiZWw6IHN0cmluZzsgcGFzc2VkOiBib29sZWFuOyBub3Rlcz86IHN0cmluZyB9PixcbiAgc3RhdHVzOiBcInBlbmRpbmdcIiB8IFwicGFzc2VkXCIgfCBcImZhaWxlZFwiXG4pIHtcbiAgY29uc3QgeyB1c2VyIH0gPSBhd2FpdCByZXF1aXJlUmV2aWV3ZXIoKTtcbiAgY29uc3Qgc3VwYWJhc2UgPSBhd2FpdCBjcmVhdGVDbGllbnQoKTtcbiAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2UuZnJvbShcInJldmlld19jaGVja2xpc3RzXCIpLnVwc2VydChcbiAgICB7XG4gICAgICBwb3N0X2lkOiBwb3N0SWQsXG4gICAgICByZXZpZXdlcl9pZDogdXNlci5pZCxcbiAgICAgIGxvY2FsZTogbnVsbCxcbiAgICAgIGl0ZW1zLFxuICAgICAgc3RhdHVzLFxuICAgICAgdXBkYXRlZF9hdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgIH0sXG4gICAgeyBvbkNvbmZsaWN0OiBcInBvc3RfaWQsbG9jYWxlXCIgfVxuICApO1xuICBpZiAoZXJyb3IpIHRocm93IGVycm9yO1xuICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH07XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhcHByb3ZlUG9zdChwb3N0SWQ6IHN0cmluZykge1xuICBjb25zdCB7IHVzZXIgfSA9IGF3YWl0IHJlcXVpcmVSZXZpZXdlcigpO1xuICBjb25zdCBzdXBhYmFzZSA9IGF3YWl0IGNyZWF0ZUNsaWVudCgpO1xuXG4gIGNvbnN0IHsgZGF0YTogY2hlY2tsaXN0IH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgIC5mcm9tKFwicmV2aWV3X2NoZWNrbGlzdHNcIilcbiAgICAuc2VsZWN0KFwic3RhdHVzXCIpXG4gICAgLmVxKFwicG9zdF9pZFwiLCBwb3N0SWQpXG4gICAgLmlzKFwibG9jYWxlXCIsIG51bGwpXG4gICAgLm1heWJlU2luZ2xlKCk7XG5cbiAgaWYgKCFjaGVja2xpc3QgfHwgY2hlY2tsaXN0LnN0YXR1cyAhPT0gXCJwYXNzZWRcIikge1xuICAgIHJldHVybiB7IGVycm9yOiBcIlJldmlldyBjaGVja2xpc3QgbXVzdCBiZSBjb21wbGV0ZWQgYW5kIHBhc3NlZCBiZWZvcmUgYXBwcm92aW5nLlwiIH07XG4gIH1cblxuICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgIC5mcm9tKFwicG9zdHNcIilcbiAgICAudXBkYXRlKHsgc3RhdHVzOiBcImFwcHJvdmVkXCIgfSlcbiAgICAuZXEoXCJpZFwiLCBwb3N0SWQpXG4gICAgLmVxKFwic3RhdHVzXCIsIFwicmV2aWV3XCIpO1xuICBpZiAoZXJyb3IpIHJldHVybiB7IGVycm9yOiBlcnJvci5tZXNzYWdlIH07XG5cbiAgYXdhaXQgc3VwYWJhc2UuZnJvbShcImF1ZGl0X2V2ZW50c1wiKS5pbnNlcnQoe1xuICAgIHBvc3RfaWQ6IHBvc3RJZCxcbiAgICB1c2VyX2lkOiB1c2VyLmlkLFxuICAgIGFjdGlvbjogXCJhcHByb3ZlZFwiLFxuICAgIHBheWxvYWQ6IHt9LFxuICB9KTtcblxuICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH07XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWplY3RQb3N0KHBvc3RJZDogc3RyaW5nLCByZWFzb24/OiBzdHJpbmcpIHtcbiAgY29uc3QgeyB1c2VyIH0gPSBhd2FpdCByZXF1aXJlUmV2aWV3ZXIoKTtcbiAgY29uc3Qgc3VwYWJhc2UgPSBhd2FpdCBjcmVhdGVDbGllbnQoKTtcblxuICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgIC5mcm9tKFwicG9zdHNcIilcbiAgICAudXBkYXRlKHsgc3RhdHVzOiBcImRyYWZ0XCIgfSlcbiAgICAuZXEoXCJpZFwiLCBwb3N0SWQpXG4gICAgLmVxKFwic3RhdHVzXCIsIFwicmV2aWV3XCIpO1xuICBpZiAoZXJyb3IpIHJldHVybiB7IGVycm9yOiBlcnJvci5tZXNzYWdlIH07XG5cbiAgYXdhaXQgc3VwYWJhc2UuZnJvbShcImF1ZGl0X2V2ZW50c1wiKS5pbnNlcnQoe1xuICAgIHBvc3RfaWQ6IHBvc3RJZCxcbiAgICB1c2VyX2lkOiB1c2VyLmlkLFxuICAgIGFjdGlvbjogXCJyZWplY3RlZFwiLFxuICAgIHBheWxvYWQ6IHsgcmVhc29uOiByZWFzb24gPz8gXCJcIiB9LFxuICB9KTtcblxuICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH07XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwdWJsaXNoUG9zdChwb3N0SWQ6IHN0cmluZykge1xuICBjb25zdCB1c2VyID0gYXdhaXQgZ2V0VXNlcigpO1xuICBpZiAoIXVzZXIpIHJldHVybiB7IGVycm9yOiBcIlVuYXV0aG9yaXplZFwiIH07XG4gIGNvbnN0IHN1cGFiYXNlID0gYXdhaXQgY3JlYXRlQ2xpZW50KCk7XG5cbiAgY29uc3QgeyBkYXRhOiBwb3N0IH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgIC5mcm9tKFwicG9zdHNcIilcbiAgICAuc2VsZWN0KFwic3RhdHVzXCIpXG4gICAgLmVxKFwiaWRcIiwgcG9zdElkKVxuICAgIC5zaW5nbGUoKTtcbiAgaWYgKCFwb3N0KSByZXR1cm4geyBlcnJvcjogXCJQb3N0IG5vdCBmb3VuZFwiIH07XG4gIGlmIChwb3N0LnN0YXR1cyAhPT0gXCJhcHByb3ZlZFwiKSB7XG4gICAgcmV0dXJuIHsgZXJyb3I6IFwiUG9zdCBtdXN0IGJlIGFwcHJvdmVkIGJlZm9yZSBwdWJsaXNoaW5nLlwiIH07XG4gIH1cblxuICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgIC5mcm9tKFwicG9zdHNcIilcbiAgICAudXBkYXRlKHsgc3RhdHVzOiBcInB1Ymxpc2hlZFwiLCBwdWJsaXNoZWRfYXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSB9KVxuICAgIC5lcShcImlkXCIsIHBvc3RJZCk7XG4gIGlmIChlcnJvcikgcmV0dXJuIHsgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfTtcblxuICBhd2FpdCBzdXBhYmFzZS5mcm9tKFwiYXVkaXRfZXZlbnRzXCIpLmluc2VydCh7XG4gICAgcG9zdF9pZDogcG9zdElkLFxuICAgIHVzZXJfaWQ6IHVzZXIuaWQsXG4gICAgYWN0aW9uOiBcInB1Ymxpc2hlZFwiLFxuICAgIHBheWxvYWQ6IHt9LFxuICB9KTtcblxuICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH07XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjhUQU1zQiJ9
}),
"[project]/app/[locale]/(admin)/admin/review-queue/data:82fb33 [app-ssr] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"70ac5edcad36a739d25a4e8aaaefc050dd4484a985":"saveReviewChecklist"},"app/[locale]/(admin)/admin/review-queue/actions.ts",""] */ __turbopack_context__.s([
    "saveReviewChecklist",
    ()=>saveReviewChecklist
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-ssr] (ecmascript)");
"use turbopack no side effects";
;
var saveReviewChecklist = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createServerReference"])("70ac5edcad36a739d25a4e8aaaefc050dd4484a985", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findSourceMapURL"], "saveReviewChecklist"); //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYWN0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzZXJ2ZXJcIjtcblxuaW1wb3J0IHsgY3JlYXRlQ2xpZW50IH0gZnJvbSBcIkAvbGliL3N1cGFiYXNlL3NlcnZlclwiO1xuaW1wb3J0IHsgcmVxdWlyZVJldmlld2VyLCBnZXRVc2VyIH0gZnJvbSBcIkAvbGliL2F1dGhcIjtcblxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UmV2aWV3Q2hlY2tsaXN0KHBvc3RJZDogc3RyaW5nKSB7XG4gIGF3YWl0IHJlcXVpcmVSZXZpZXdlcigpO1xuICBjb25zdCBzdXBhYmFzZSA9IGF3YWl0IGNyZWF0ZUNsaWVudCgpO1xuICBjb25zdCB7IGRhdGEsIGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgIC5mcm9tKFwicmV2aWV3X2NoZWNrbGlzdHNcIilcbiAgICAuc2VsZWN0KFwiKlwiKVxuICAgIC5lcShcInBvc3RfaWRcIiwgcG9zdElkKVxuICAgIC5pcyhcImxvY2FsZVwiLCBudWxsKVxuICAgIC5tYXliZVNpbmdsZSgpO1xuICBpZiAoZXJyb3IpIHRocm93IGVycm9yO1xuICByZXR1cm4gZGF0YTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNhdmVSZXZpZXdDaGVja2xpc3QoXG4gIHBvc3RJZDogc3RyaW5nLFxuICBpdGVtczogQXJyYXk8eyBrZXk6IHN0cmluZzsgbGFiZWw6IHN0cmluZzsgcGFzc2VkOiBib29sZWFuOyBub3Rlcz86IHN0cmluZyB9PixcbiAgc3RhdHVzOiBcInBlbmRpbmdcIiB8IFwicGFzc2VkXCIgfCBcImZhaWxlZFwiXG4pIHtcbiAgY29uc3QgeyB1c2VyIH0gPSBhd2FpdCByZXF1aXJlUmV2aWV3ZXIoKTtcbiAgY29uc3Qgc3VwYWJhc2UgPSBhd2FpdCBjcmVhdGVDbGllbnQoKTtcbiAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2UuZnJvbShcInJldmlld19jaGVja2xpc3RzXCIpLnVwc2VydChcbiAgICB7XG4gICAgICBwb3N0X2lkOiBwb3N0SWQsXG4gICAgICByZXZpZXdlcl9pZDogdXNlci5pZCxcbiAgICAgIGxvY2FsZTogbnVsbCxcbiAgICAgIGl0ZW1zLFxuICAgICAgc3RhdHVzLFxuICAgICAgdXBkYXRlZF9hdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgIH0sXG4gICAgeyBvbkNvbmZsaWN0OiBcInBvc3RfaWQsbG9jYWxlXCIgfVxuICApO1xuICBpZiAoZXJyb3IpIHRocm93IGVycm9yO1xuICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH07XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhcHByb3ZlUG9zdChwb3N0SWQ6IHN0cmluZykge1xuICBjb25zdCB7IHVzZXIgfSA9IGF3YWl0IHJlcXVpcmVSZXZpZXdlcigpO1xuICBjb25zdCBzdXBhYmFzZSA9IGF3YWl0IGNyZWF0ZUNsaWVudCgpO1xuXG4gIGNvbnN0IHsgZGF0YTogY2hlY2tsaXN0IH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgIC5mcm9tKFwicmV2aWV3X2NoZWNrbGlzdHNcIilcbiAgICAuc2VsZWN0KFwic3RhdHVzXCIpXG4gICAgLmVxKFwicG9zdF9pZFwiLCBwb3N0SWQpXG4gICAgLmlzKFwibG9jYWxlXCIsIG51bGwpXG4gICAgLm1heWJlU2luZ2xlKCk7XG5cbiAgaWYgKCFjaGVja2xpc3QgfHwgY2hlY2tsaXN0LnN0YXR1cyAhPT0gXCJwYXNzZWRcIikge1xuICAgIHJldHVybiB7IGVycm9yOiBcIlJldmlldyBjaGVja2xpc3QgbXVzdCBiZSBjb21wbGV0ZWQgYW5kIHBhc3NlZCBiZWZvcmUgYXBwcm92aW5nLlwiIH07XG4gIH1cblxuICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgIC5mcm9tKFwicG9zdHNcIilcbiAgICAudXBkYXRlKHsgc3RhdHVzOiBcImFwcHJvdmVkXCIgfSlcbiAgICAuZXEoXCJpZFwiLCBwb3N0SWQpXG4gICAgLmVxKFwic3RhdHVzXCIsIFwicmV2aWV3XCIpO1xuICBpZiAoZXJyb3IpIHJldHVybiB7IGVycm9yOiBlcnJvci5tZXNzYWdlIH07XG5cbiAgYXdhaXQgc3VwYWJhc2UuZnJvbShcImF1ZGl0X2V2ZW50c1wiKS5pbnNlcnQoe1xuICAgIHBvc3RfaWQ6IHBvc3RJZCxcbiAgICB1c2VyX2lkOiB1c2VyLmlkLFxuICAgIGFjdGlvbjogXCJhcHByb3ZlZFwiLFxuICAgIHBheWxvYWQ6IHt9LFxuICB9KTtcblxuICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH07XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWplY3RQb3N0KHBvc3RJZDogc3RyaW5nLCByZWFzb24/OiBzdHJpbmcpIHtcbiAgY29uc3QgeyB1c2VyIH0gPSBhd2FpdCByZXF1aXJlUmV2aWV3ZXIoKTtcbiAgY29uc3Qgc3VwYWJhc2UgPSBhd2FpdCBjcmVhdGVDbGllbnQoKTtcblxuICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgIC5mcm9tKFwicG9zdHNcIilcbiAgICAudXBkYXRlKHsgc3RhdHVzOiBcImRyYWZ0XCIgfSlcbiAgICAuZXEoXCJpZFwiLCBwb3N0SWQpXG4gICAgLmVxKFwic3RhdHVzXCIsIFwicmV2aWV3XCIpO1xuICBpZiAoZXJyb3IpIHJldHVybiB7IGVycm9yOiBlcnJvci5tZXNzYWdlIH07XG5cbiAgYXdhaXQgc3VwYWJhc2UuZnJvbShcImF1ZGl0X2V2ZW50c1wiKS5pbnNlcnQoe1xuICAgIHBvc3RfaWQ6IHBvc3RJZCxcbiAgICB1c2VyX2lkOiB1c2VyLmlkLFxuICAgIGFjdGlvbjogXCJyZWplY3RlZFwiLFxuICAgIHBheWxvYWQ6IHsgcmVhc29uOiByZWFzb24gPz8gXCJcIiB9LFxuICB9KTtcblxuICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH07XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwdWJsaXNoUG9zdChwb3N0SWQ6IHN0cmluZykge1xuICBjb25zdCB1c2VyID0gYXdhaXQgZ2V0VXNlcigpO1xuICBpZiAoIXVzZXIpIHJldHVybiB7IGVycm9yOiBcIlVuYXV0aG9yaXplZFwiIH07XG4gIGNvbnN0IHN1cGFiYXNlID0gYXdhaXQgY3JlYXRlQ2xpZW50KCk7XG5cbiAgY29uc3QgeyBkYXRhOiBwb3N0IH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgIC5mcm9tKFwicG9zdHNcIilcbiAgICAuc2VsZWN0KFwic3RhdHVzXCIpXG4gICAgLmVxKFwiaWRcIiwgcG9zdElkKVxuICAgIC5zaW5nbGUoKTtcbiAgaWYgKCFwb3N0KSByZXR1cm4geyBlcnJvcjogXCJQb3N0IG5vdCBmb3VuZFwiIH07XG4gIGlmIChwb3N0LnN0YXR1cyAhPT0gXCJhcHByb3ZlZFwiKSB7XG4gICAgcmV0dXJuIHsgZXJyb3I6IFwiUG9zdCBtdXN0IGJlIGFwcHJvdmVkIGJlZm9yZSBwdWJsaXNoaW5nLlwiIH07XG4gIH1cblxuICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgIC5mcm9tKFwicG9zdHNcIilcbiAgICAudXBkYXRlKHsgc3RhdHVzOiBcInB1Ymxpc2hlZFwiLCBwdWJsaXNoZWRfYXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSB9KVxuICAgIC5lcShcImlkXCIsIHBvc3RJZCk7XG4gIGlmIChlcnJvcikgcmV0dXJuIHsgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfTtcblxuICBhd2FpdCBzdXBhYmFzZS5mcm9tKFwiYXVkaXRfZXZlbnRzXCIpLmluc2VydCh7XG4gICAgcG9zdF9pZDogcG9zdElkLFxuICAgIHVzZXJfaWQ6IHVzZXIuaWQsXG4gICAgYWN0aW9uOiBcInB1Ymxpc2hlZFwiLFxuICAgIHBheWxvYWQ6IHt9LFxuICB9KTtcblxuICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH07XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IitUQW1Cc0IifQ==
}),
"[project]/app/[locale]/(admin)/admin/review-queue/constants.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_CHECKLIST_KEYS",
    ()=>DEFAULT_CHECKLIST_KEYS
]);
const DEFAULT_CHECKLIST_KEYS = [
    "credibility",
    "brand_voice",
    "entity_accuracy",
    "intent_completeness",
    "formatting"
];
}),
"[project]/app/[locale]/(admin)/admin/posts/[id]/ReviewChecklistBlock.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ReviewChecklistBlock",
    ()=>ReviewChecklistBlock
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$navigation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/navigation.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$review$2d$queue$2f$data$3a$e9d429__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/app/[locale]/(admin)/admin/review-queue/data:e9d429 [app-ssr] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$review$2d$queue$2f$data$3a$82fb33__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/app/[locale]/(admin)/admin/review-queue/data:82fb33 [app-ssr] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$review$2d$queue$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/[locale]/(admin)/admin/review-queue/constants.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$index$2e$react$2d$client$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/index.react-client.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
const CHECKLIST_MESSAGE_KEYS = {
    credibility: "credibility",
    brand_voice: "brandVoice",
    entity_accuracy: "entityAccuracy",
    intent_completeness: "intentCompleteness",
    formatting: "formatting"
};
function ReviewChecklistBlock({ postId }) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$index$2e$react$2d$client$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("admin");
    const tChecklist = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$index$2e$react$2d$client$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("checklist");
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$navigation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [items, setItems] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("pending");
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$review$2d$queue$2f$data$3a$e9d429__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["getReviewChecklist"])(postId).then((data)=>{
            if (data?.items && Array.isArray(data.items)) {
                setItems(data.items);
                setStatus(data.status ?? "pending");
            } else {
                setItems(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$review$2d$queue$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_CHECKLIST_KEYS"].map((key)=>({
                        key,
                        label: key,
                        passed: false,
                        notes: ""
                    })));
            }
            setLoading(false);
        });
    }, [
        postId
    ]);
    async function handleSave() {
        setSaving(true);
        const allPassed = items.every((i)=>i.passed);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$review$2d$queue$2f$data$3a$82fb33__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["saveReviewChecklist"])(postId, items, allPassed ? "passed" : "pending");
        setStatus(allPassed ? "passed" : "pending");
        setSaving(false);
        router.refresh();
    }
    function setItemPassed(index, passed) {
        setItems((prev)=>{
            const next = [
                ...prev
            ];
            next[index] = {
                ...next[index],
                passed
            };
            return next;
        });
    }
    function setItemNotes(index, notes) {
        setItems((prev)=>{
            const next = [
                ...prev
            ];
            next[index] = {
                ...next[index],
                notes
            };
            return next;
        });
    }
    if (loading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        className: "text-sm text-gray-500",
        children: "Loading checklist..."
    }, void 0, false, {
        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/ReviewChecklistBlock.tsx",
        lineNumber: 73,
        columnNumber: 23
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "border border-gray-200 dark:border-gray-700 rounded p-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "font-medium mb-4",
                children: t("checklist")
            }, void 0, false, {
                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/ReviewChecklistBlock.tsx",
                lineNumber: 77,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                className: "space-y-3",
                children: items.map((item, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        className: "flex items-start gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "checkbox",
                                checked: item.passed,
                                onChange: (e)=>setItemPassed(i, e.target.checked),
                                className: "mt-1"
                            }, void 0, false, {
                                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/ReviewChecklistBlock.tsx",
                                lineNumber: 81,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm",
                                        children: tChecklist(CHECKLIST_MESSAGE_KEYS[item.key] ?? item.key)
                                    }, void 0, false, {
                                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/ReviewChecklistBlock.tsx",
                                        lineNumber: 88,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        placeholder: "Notes",
                                        value: item.notes ?? "",
                                        onChange: (e)=>setItemNotes(i, e.target.value),
                                        className: "mt-1 w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
                                    }, void 0, false, {
                                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/ReviewChecklistBlock.tsx",
                                        lineNumber: 89,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/ReviewChecklistBlock.tsx",
                                lineNumber: 87,
                                columnNumber: 13
                            }, this)
                        ]
                    }, item.key, true, {
                        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/ReviewChecklistBlock.tsx",
                        lineNumber: 80,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/ReviewChecklistBlock.tsx",
                lineNumber: 78,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-2 text-sm text-gray-500",
                children: [
                    "Status: ",
                    status
                ]
            }, void 0, true, {
                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/ReviewChecklistBlock.tsx",
                lineNumber: 100,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: handleSave,
                disabled: saving,
                className: "mt-3 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded text-sm disabled:opacity-50",
                children: saving ? "Saving..." : t("save", {
                    ns: "common"
                })
            }, void 0, false, {
                fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/ReviewChecklistBlock.tsx",
                lineNumber: 101,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/[locale]/(admin)/admin/posts/[id]/ReviewChecklistBlock.tsx",
        lineNumber: 76,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__4c74d93e._.js.map