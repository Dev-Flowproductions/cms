module.exports = [
"[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PostsListClient",
    ()=>PostsListClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$navigation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/navigation.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$index$2e$react$2d$client$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/index.react-client.js [app-ssr] (ecmascript)");
"use client";
;
;
;
const STATUS_COLORS = {
    published: {
        bg: "rgba(34,211,160,0.1)",
        color: "var(--success)"
    },
    draft: {
        bg: "rgba(124,92,252,0.1)",
        color: "var(--accent)"
    },
    review: {
        bg: "rgba(251,191,36,0.1)",
        color: "#fbbf24"
    }
};
function PostsListClient({ initialPosts, statusFilter }) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$index$2e$react$2d$client$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("admin");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-4 flex gap-2 flex-wrap",
                children: [
                    {
                        key: undefined,
                        label: t("postsPage.filterAll")
                    },
                    ...[
                        "draft",
                        "review",
                        "published"
                    ].map((s)=>({
                            key: s,
                            label: s
                        }))
                ].map(({ key, label })=>{
                    const active = statusFilter === key;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$navigation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Link"], {
                        href: key ? `/admin/posts?status=${key}` : "/admin/posts",
                        className: "px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all",
                        style: {
                            background: active ? "var(--accent)" : "var(--surface-raised)",
                            color: active ? "white" : "var(--text-muted)",
                            border: active ? "none" : "1px solid var(--border)"
                        },
                        children: label
                    }, label, false, {
                        fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                        lineNumber: 37,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                lineNumber: 33,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-2xl overflow-hidden",
                style: {
                    border: "1px solid var(--border)"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    className: "w-full text-sm",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                style: {
                                    background: "var(--surface)",
                                    borderBottom: "1px solid var(--border)"
                                },
                                children: [
                                    t("slug"),
                                    t("status"),
                                    t("primaryLocale"),
                                    t("author"),
                                    t("table.updated"),
                                    ""
                                ].map((h, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider",
                                        style: {
                                            color: "var(--text-muted)"
                                        },
                                        children: h
                                    }, i, false, {
                                        fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                                        lineNumber: 62,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                                lineNumber: 60,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                            lineNumber: 59,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            children: initialPosts.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    colSpan: 6,
                                    className: "px-4 py-10 text-center text-sm",
                                    style: {
                                        color: "var(--text-faint)",
                                        background: "var(--surface)"
                                    },
                                    children: t("postsPage.noPosts")
                                }, void 0, false, {
                                    fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                                    lineNumber: 75,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                                lineNumber: 74,
                                columnNumber: 15
                            }, this) : initialPosts.map((post, idx)=>{
                                const statusStyle = STATUS_COLORS[post.status] ?? {
                                    bg: "var(--surface-raised)",
                                    color: "var(--text-muted)"
                                };
                                const author = Array.isArray(post.profiles) ? post.profiles[0]?.display_name : post.profiles?.display_name;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    style: {
                                        background: idx % 2 === 0 ? "var(--surface)" : "var(--surface-raised)",
                                        borderTop: "1px solid var(--border)"
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-3 font-mono text-xs",
                                            style: {
                                                color: "var(--text)"
                                            },
                                            children: post.slug
                                        }, void 0, false, {
                                            fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                                            lineNumber: 98,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-3",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "px-2 py-0.5 rounded-md text-xs font-semibold capitalize",
                                                style: {
                                                    background: statusStyle.bg,
                                                    color: statusStyle.color
                                                },
                                                children: post.status
                                            }, void 0, false, {
                                                fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                                                lineNumber: 102,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                                            lineNumber: 101,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-3 text-xs uppercase tracking-wider",
                                            style: {
                                                color: "var(--text-muted)"
                                            },
                                            children: post.primary_locale
                                        }, void 0, false, {
                                            fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                                            lineNumber: 109,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-3 text-sm",
                                            style: {
                                                color: "var(--text-muted)"
                                            },
                                            children: author ?? "—"
                                        }, void 0, false, {
                                            fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                                            lineNumber: 112,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-3 text-xs",
                                            style: {
                                                color: "var(--text-faint)"
                                            },
                                            children: new Date(post.updated_at).toLocaleDateString()
                                        }, void 0, false, {
                                            fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                                            lineNumber: 115,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-3",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$navigation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Link"], {
                                                href: `/admin/posts/${post.id}`,
                                                className: "text-xs font-semibold px-3 py-1.5 rounded-lg transition-all",
                                                style: {
                                                    background: "var(--surface-raised)",
                                                    color: "var(--accent)",
                                                    border: "1px solid var(--border)"
                                                },
                                                children: t("editPost")
                                            }, void 0, false, {
                                                fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                                                lineNumber: 119,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                                            lineNumber: 118,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, post.id, true, {
                                    fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                                    lineNumber: 91,
                                    columnNumber: 19
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                            lineNumber: 72,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                    lineNumber: 58,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                lineNumber: 54,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
        lineNumber: 31,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=app_%5Blocale%5D_%28admin%29_admin_posts_PostsListClient_tsx_218e36e9._.js.map