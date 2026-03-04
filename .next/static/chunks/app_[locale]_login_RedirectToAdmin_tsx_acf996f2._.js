(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/[locale]/login/RedirectToAdmin.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RedirectToAdmin
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
function RedirectToAdmin(param) {
    let { locale } = param;
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RedirectToAdmin.useEffect": ()=>{
            const segment = locale || "en";
            window.location.replace("".concat(window.location.origin, "/").concat(segment, "/admin"));
        }
    }["RedirectToAdmin.useEffect"], [
        locale
    ]);
    return null;
}
_s(RedirectToAdmin, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = RedirectToAdmin;
var _c;
__turbopack_context__.k.register(_c, "RedirectToAdmin");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_%5Blocale%5D_login_RedirectToAdmin_tsx_acf996f2._.js.map