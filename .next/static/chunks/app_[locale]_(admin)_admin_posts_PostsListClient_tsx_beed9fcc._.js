(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PostsListClient",
    ()=>PostsListClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$navigation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/navigation.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$index$2e$react$2d$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/index.react-client.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
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
function extractScore(locs, primaryLocale) {
    if (!(locs === null || locs === void 0 ? void 0 : locs.length)) return null;
    var _locs_find;
    const loc = (_locs_find = locs.find((l)=>l.locale === primaryLocale)) !== null && _locs_find !== void 0 ? _locs_find : locs[0];
    const s = loc === null || loc === void 0 ? void 0 : loc.seo_score;
    if (s && typeof s.seo === "number") return s;
    return null;
}
function StarMini(param) {
    let { score } = param;
    const filled = Math.round(score / 10 * 5);
    const color = score >= 9 ? "var(--success)" : score >= 7 ? "#f59e0b" : score >= 5 ? "#f97316" : "var(--danger)";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-0.5",
        children: [
            Array.from({
                length: 5
            }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                    width: "10",
                    height: "10",
                    viewBox: "0 0 24 24",
                    fill: i < filled ? color : "none",
                    stroke: color,
                    strokeWidth: "2.5",
                    style: {
                        opacity: i < filled ? 1 : 0.25
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        d: "M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"
                    }, void 0, false, {
                        fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                        lineNumber: 57,
                        columnNumber: 11
                    }, this)
                }, i, false, {
                    fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                    lineNumber: 52,
                    columnNumber: 9
                }, this)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-[10px] font-bold tabular-nums ml-0.5",
                style: {
                    color
                },
                children: score
            }, void 0, false, {
                fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                lineNumber: 60,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
        lineNumber: 50,
        columnNumber: 5
    }, this);
}
_c = StarMini;
function ScoreBadge(param) {
    let { score } = param;
    const avg = Math.round((score.seo + score.aeo + score.geo) / 3);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-1 min-w-[72px]",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between gap-1.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[9px] font-semibold uppercase tracking-wider w-6",
                        style: {
                            color: "var(--text-faint)"
                        },
                        children: "SEO"
                    }, void 0, false, {
                        fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                        lineNumber: 72,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StarMini, {
                        score: score.seo
                    }, void 0, false, {
                        fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                        lineNumber: 73,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                lineNumber: 71,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between gap-1.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[9px] font-semibold uppercase tracking-wider w-6",
                        style: {
                            color: "var(--text-faint)"
                        },
                        children: "AEO"
                    }, void 0, false, {
                        fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                        lineNumber: 76,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StarMini, {
                        score: score.aeo
                    }, void 0, false, {
                        fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                        lineNumber: 77,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                lineNumber: 75,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between gap-1.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[9px] font-semibold uppercase tracking-wider w-6",
                        style: {
                            color: "var(--text-faint)"
                        },
                        children: "GEO"
                    }, void 0, false, {
                        fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                        lineNumber: 80,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StarMini, {
                        score: score.geo
                    }, void 0, false, {
                        fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                        lineNumber: 81,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                lineNumber: 79,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-0.5 rounded px-1.5 py-0.5 text-[9px] font-bold text-center tabular-nums",
                style: {
                    background: avg >= 9 ? "rgba(34,211,160,0.12)" : avg >= 7 ? "rgba(245,158,11,0.12)" : "rgba(255,92,106,0.12)",
                    color: avg >= 9 ? "var(--success)" : avg >= 7 ? "#f59e0b" : "var(--danger)"
                },
                children: [
                    "avg ",
                    avg,
                    "/10"
                ]
            }, void 0, true, {
                fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                lineNumber: 83,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
        lineNumber: 70,
        columnNumber: 5
    }, this);
}
_c1 = ScoreBadge;
function PostsListClient(param) {
    let { initialPosts, statusFilter } = param;
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$index$2e$react$2d$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("admin");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                ].map((param)=>{
                    let { key, label } = param;
                    const active = statusFilter === key;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$navigation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Link"], {
                        href: key ? "/admin/posts?status=".concat(key) : "/admin/posts",
                        className: "px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all",
                        style: {
                            background: active ? "var(--accent)" : "var(--surface-raised)",
                            color: active ? "white" : "var(--text-muted)",
                            border: active ? "none" : "1px solid var(--border)"
                        },
                        children: label
                    }, label, false, {
                        fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                        lineNumber: 112,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                lineNumber: 108,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-2xl overflow-hidden",
                style: {
                    border: "1px solid var(--border)"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    className: "w-full text-sm",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                style: {
                                    background: "var(--surface)",
                                    borderBottom: "1px solid var(--border)"
                                },
                                children: [
                                    t("slug"),
                                    t("status"),
                                    t("primaryLocale"),
                                    t("author"),
                                    "Score",
                                    t("table.updated"),
                                    ""
                                ].map((h, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider",
                                        style: {
                                            color: "var(--text-muted)"
                                        },
                                        children: h
                                    }, i, false, {
                                        fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                                        lineNumber: 134,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                                lineNumber: 132,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                            lineNumber: 131,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            children: initialPosts.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    colSpan: 7,
                                    className: "px-4 py-10 text-center text-sm",
                                    style: {
                                        color: "var(--text-faint)",
                                        background: "var(--surface)"
                                    },
                                    children: t("postsPage.noPosts")
                                }, void 0, false, {
                                    fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                                    lineNumber: 146,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                                lineNumber: 145,
                                columnNumber: 15
                            }, this) : initialPosts.map((post, idx)=>{
                                var _post_profiles_, _post_profiles;
                                var _STATUS_COLORS_post_status;
                                const statusStyle = (_STATUS_COLORS_post_status = STATUS_COLORS[post.status]) !== null && _STATUS_COLORS_post_status !== void 0 ? _STATUS_COLORS_post_status : {
                                    bg: "var(--surface-raised)",
                                    color: "var(--text-muted)"
                                };
                                const author = Array.isArray(post.profiles) ? (_post_profiles_ = post.profiles[0]) === null || _post_profiles_ === void 0 ? void 0 : _post_profiles_.display_name : (_post_profiles = post.profiles) === null || _post_profiles === void 0 ? void 0 : _post_profiles.display_name;
                                const score = extractScore(post.post_localizations, post.primary_locale);
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    style: {
                                        background: idx % 2 === 0 ? "var(--surface)" : "var(--surface-raised)",
                                        borderTop: "1px solid var(--border)"
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-3 font-mono text-xs",
                                            style: {
                                                color: "var(--text)"
                                            },
                                            children: post.slug
                                        }, void 0, false, {
                                            fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                                            lineNumber: 165,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-3",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "px-2 py-0.5 rounded-md text-xs font-semibold capitalize",
                                                style: {
                                                    background: statusStyle.bg,
                                                    color: statusStyle.color
                                                },
                                                children: post.status
                                            }, void 0, false, {
                                                fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                                                lineNumber: 169,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                                            lineNumber: 168,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-3 text-xs uppercase tracking-wider",
                                            style: {
                                                color: "var(--text-muted)"
                                            },
                                            children: post.primary_locale
                                        }, void 0, false, {
                                            fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                                            lineNumber: 175,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-3 text-sm",
                                            style: {
                                                color: "var(--text-muted)"
                                            },
                                            children: author !== null && author !== void 0 ? author : "—"
                                        }, void 0, false, {
                                            fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                                            lineNumber: 178,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-3",
                                            children: score ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ScoreBadge, {
                                                score: score
                                            }, void 0, false, {
                                                fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                                                lineNumber: 183,
                                                columnNumber: 27
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs",
                                                style: {
                                                    color: "var(--text-faint)"
                                                },
                                                children: "—"
                                            }, void 0, false, {
                                                fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                                                lineNumber: 184,
                                                columnNumber: 27
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                                            lineNumber: 181,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-3 text-xs",
                                            style: {
                                                color: "var(--text-faint)"
                                            },
                                            children: new Date(post.updated_at).toLocaleDateString()
                                        }, void 0, false, {
                                            fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                                            lineNumber: 187,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-3",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$navigation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Link"], {
                                                href: "/admin/posts/".concat(post.id),
                                                className: "text-xs font-semibold px-3 py-1.5 rounded-lg transition-all",
                                                style: {
                                                    background: "var(--surface-raised)",
                                                    color: "var(--accent)",
                                                    border: "1px solid var(--border)"
                                                },
                                                children: t("editPost")
                                            }, void 0, false, {
                                                fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                                                lineNumber: 191,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                                            lineNumber: 190,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, post.id, true, {
                                    fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                                    lineNumber: 161,
                                    columnNumber: 19
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                            lineNumber: 143,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                    lineNumber: 130,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
                lineNumber: 129,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/[locale]/(admin)/admin/posts/PostsListClient.tsx",
        lineNumber: 106,
        columnNumber: 5
    }, this);
}
_s(PostsListClient, "h6+q2O3NJKPY5uL0BIJGLIanww8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$index$2e$react$2d$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c2 = PostsListClient;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "StarMini");
__turbopack_context__.k.register(_c1, "ScoreBadge");
__turbopack_context__.k.register(_c2, "PostsListClient");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_%5Blocale%5D_%28admin%29_admin_posts_PostsListClient_tsx_beed9fcc._.js.map