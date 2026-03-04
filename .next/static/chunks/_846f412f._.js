(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/[locale]/(admin)/admin/users/data:ecca2a [app-client] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"402fdfd96925c71836e30458c1a717694aaa2babc7":"deleteUser"},"app/[locale]/(admin)/admin/users/actions.ts",""] */ __turbopack_context__.s([
    "deleteUser",
    ()=>deleteUser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-client] (ecmascript)");
"use turbopack no side effects";
;
var deleteUser = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createServerReference"])("402fdfd96925c71836e30458c1a717694aaa2babc7", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findSourceMapURL"], "deleteUser"); //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYWN0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzZXJ2ZXJcIjtcblxuaW1wb3J0IHsgY3JlYXRlQWRtaW5DbGllbnQgfSBmcm9tIFwiQC9saWIvc3VwYWJhc2UvYWRtaW5cIjtcbmltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gXCJAL2xpYi9zdXBhYmFzZS9zZXJ2ZXJcIjtcbmltcG9ydCB7IHJlcXVpcmVBZG1pbiB9IGZyb20gXCJAL2xpYi9hdXRoXCI7XG5pbXBvcnQgeyB6IH0gZnJvbSBcInpvZFwiO1xuXG5leHBvcnQgdHlwZSBGcmVxdWVuY3kgPSBcImRhaWx5XCIgfCBcIndlZWtseVwiIHwgXCJiaXdlZWtseVwiIHwgXCJtb250aGx5XCI7XG5cbmNvbnN0IGNyZWF0ZVVzZXJTY2hlbWEgPSB6Lm9iamVjdCh7XG4gIGVtYWlsOiB6LnN0cmluZygpLmVtYWlsKCksXG4gIHBhc3N3b3JkOiB6LnN0cmluZygpLm1pbig4LCBcIlBhc3N3b3JkIG11c3QgYmUgYXQgbGVhc3QgOCBjaGFyYWN0ZXJzXCIpLFxuICBkaXNwbGF5X25hbWU6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgZG9tYWluOiB6LnN0cmluZygpLm1pbigxLCBcIkRvbWFpbiBpcyByZXF1aXJlZFwiKSxcbiAgZ2FfYXBpX2tleTogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxuICBnY2NfYXBpX2tleTogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxuICBmcmVxdWVuY3k6IHouZW51bShbXCJkYWlseVwiLCBcIndlZWtseVwiLCBcImJpd2Vla2x5XCIsIFwibW9udGhseVwiXSksXG59KTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVVzZXIoZm9ybURhdGE6IEZvcm1EYXRhKSB7XG4gIGF3YWl0IHJlcXVpcmVBZG1pbigpO1xuXG4gIGNvbnN0IHBhcnNlZCA9IGNyZWF0ZVVzZXJTY2hlbWEuc2FmZVBhcnNlKHtcbiAgICBlbWFpbDogZm9ybURhdGEuZ2V0KFwiZW1haWxcIik/LnRvU3RyaW5nKCkudHJpbSgpLFxuICAgIHBhc3N3b3JkOiBmb3JtRGF0YS5nZXQoXCJwYXNzd29yZFwiKT8udG9TdHJpbmcoKSxcbiAgICBkaXNwbGF5X25hbWU6IGZvcm1EYXRhLmdldChcImRpc3BsYXlfbmFtZVwiKT8udG9TdHJpbmcoKS50cmltKCkgfHwgdW5kZWZpbmVkLFxuICAgIGRvbWFpbjogZm9ybURhdGEuZ2V0KFwiZG9tYWluXCIpPy50b1N0cmluZygpLnRyaW0oKSxcbiAgICBnYV9hcGlfa2V5OiBmb3JtRGF0YS5nZXQoXCJnYV9hcGlfa2V5XCIpPy50b1N0cmluZygpLnRyaW0oKSB8fCB1bmRlZmluZWQsXG4gICAgZ2NjX2FwaV9rZXk6IGZvcm1EYXRhLmdldChcImdjY19hcGlfa2V5XCIpPy50b1N0cmluZygpLnRyaW0oKSB8fCB1bmRlZmluZWQsXG4gICAgZnJlcXVlbmN5OiBmb3JtRGF0YS5nZXQoXCJmcmVxdWVuY3lcIik/LnRvU3RyaW5nKCkgPz8gXCJ3ZWVrbHlcIixcbiAgfSk7XG5cbiAgaWYgKCFwYXJzZWQuc3VjY2Vzcykge1xuICAgIGNvbnN0IGZpcnN0RXJyb3IgPSBPYmplY3QudmFsdWVzKHBhcnNlZC5lcnJvci5mbGF0dGVuKCkuZmllbGRFcnJvcnMpWzBdPy5bMF07XG4gICAgcmV0dXJuIHsgZXJyb3I6IGZpcnN0RXJyb3IgPz8gXCJJbnZhbGlkIGlucHV0XCIgfTtcbiAgfVxuXG4gIGNvbnN0IHsgZW1haWwsIHBhc3N3b3JkLCBkaXNwbGF5X25hbWUsIGRvbWFpbiwgZ2FfYXBpX2tleSwgZ2NjX2FwaV9rZXksIGZyZXF1ZW5jeSB9ID0gcGFyc2VkLmRhdGE7XG4gIGNvbnN0IGFkbWluID0gY3JlYXRlQWRtaW5DbGllbnQoKTtcblxuICAvLyAxLiBDcmVhdGUgYXV0aCB1c2VyXG4gIGNvbnN0IHsgZGF0YTogYXV0aERhdGEsIGVycm9yOiBhdXRoRXJyb3IgfSA9IGF3YWl0IGFkbWluLmF1dGguYWRtaW4uY3JlYXRlVXNlcih7XG4gICAgZW1haWwsXG4gICAgcGFzc3dvcmQsXG4gICAgZW1haWxfY29uZmlybTogdHJ1ZSxcbiAgfSk7XG4gIGlmIChhdXRoRXJyb3IpIHJldHVybiB7IGVycm9yOiBhdXRoRXJyb3IubWVzc2FnZSB9O1xuICBjb25zdCB1c2VySWQgPSBhdXRoRGF0YS51c2VyLmlkO1xuXG4gIC8vIDIuIFVwc2VydCBwcm9maWxlIGRpc3BsYXkgbmFtZSBpZiBwcm92aWRlZFxuICBpZiAoZGlzcGxheV9uYW1lKSB7XG4gICAgYXdhaXQgYWRtaW4uZnJvbShcInByb2ZpbGVzXCIpLnVwZGF0ZSh7IGRpc3BsYXlfbmFtZSB9KS5lcShcImlkXCIsIHVzZXJJZCk7XG4gIH1cblxuICAvLyAzLiBBc3NpZ24gY29udHJpYnV0b3Igcm9sZVxuICBjb25zdCB7IGVycm9yOiByb2xlRXJyb3IgfSA9IGF3YWl0IGFkbWluXG4gICAgLmZyb20oXCJ1c2VyX3JvbGVzXCIpXG4gICAgLmluc2VydCh7IHVzZXJfaWQ6IHVzZXJJZCwgcm9sZV9pZDogXCJjb250cmlidXRvclwiIH0pO1xuICBpZiAocm9sZUVycm9yKSB7XG4gICAgLy8gUm9sbCBiYWNrOiBkZWxldGUgdGhlIGF1dGggdXNlclxuICAgIGF3YWl0IGFkbWluLmF1dGguYWRtaW4uZGVsZXRlVXNlcih1c2VySWQpO1xuICAgIHJldHVybiB7IGVycm9yOiByb2xlRXJyb3IubWVzc2FnZSB9O1xuICB9XG5cbiAgLy8gNC4gQ3JlYXRlIGNsaWVudHMgcm93XG4gIGNvbnN0IHsgZXJyb3I6IGNsaWVudEVycm9yIH0gPSBhd2FpdCBhZG1pbi5mcm9tKFwiY2xpZW50c1wiKS5pbnNlcnQoe1xuICAgIHVzZXJfaWQ6IHVzZXJJZCxcbiAgICBkb21haW4sXG4gICAgZ2FfYXBpX2tleTogZ2FfYXBpX2tleSA/PyBudWxsLFxuICAgIGdjY19hcGlfa2V5OiBnY2NfYXBpX2tleSA/PyBudWxsLFxuICAgIGZyZXF1ZW5jeSxcbiAgfSk7XG4gIGlmIChjbGllbnRFcnJvcikge1xuICAgIGF3YWl0IGFkbWluLmF1dGguYWRtaW4uZGVsZXRlVXNlcih1c2VySWQpO1xuICAgIHJldHVybiB7IGVycm9yOiBjbGllbnRFcnJvci5tZXNzYWdlIH07XG4gIH1cblxuICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCB1c2VySWQgfTtcbn1cblxuZXhwb3J0IHR5cGUgQ2xpZW50Um93ID0ge1xuICBpZDogc3RyaW5nO1xuICB1c2VyX2lkOiBzdHJpbmc7XG4gIGRvbWFpbjogc3RyaW5nO1xuICBnYV9hcGlfa2V5OiBzdHJpbmcgfCBudWxsO1xuICBnY2NfYXBpX2tleTogc3RyaW5nIHwgbnVsbDtcbiAgZnJlcXVlbmN5OiBGcmVxdWVuY3k7XG4gIGNyZWF0ZWRfYXQ6IHN0cmluZztcbiAgcHJvZmlsZXM6IHsgZGlzcGxheV9uYW1lOiBzdHJpbmcgfCBudWxsOyBpZDogc3RyaW5nIH0gfCBudWxsO1xuICBlbWFpbD86IHN0cmluZztcbn07XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsaXN0VXNlcnMoKTogUHJvbWlzZTxDbGllbnRSb3dbXT4ge1xuICBhd2FpdCByZXF1aXJlQWRtaW4oKTtcbiAgY29uc3QgYWRtaW4gPSBjcmVhdGVBZG1pbkNsaWVudCgpO1xuXG4gIC8vIFVzZSBhZG1pbiBjbGllbnQgc28gUkxTIGlzIGJ5cGFzc2VkIGFuZCBhdXRoLmFkbWluIGlzIGF2YWlsYWJsZVxuICBjb25zdCB7IGRhdGEsIGVycm9yIH0gPSBhd2FpdCBhZG1pblxuICAgIC5mcm9tKFwiY2xpZW50c1wiKVxuICAgIC5zZWxlY3QoXCJpZCwgdXNlcl9pZCwgZG9tYWluLCBnYV9hcGlfa2V5LCBnY2NfYXBpX2tleSwgZnJlcXVlbmN5LCBjcmVhdGVkX2F0LCBwcm9maWxlcyhpZCwgZGlzcGxheV9uYW1lKVwiKVxuICAgIC5vcmRlcihcImNyZWF0ZWRfYXRcIiwgeyBhc2NlbmRpbmc6IGZhbHNlIH0pO1xuICBpZiAoZXJyb3IpIHRocm93IGVycm9yO1xuXG4gIGNvbnN0IHJvd3MgPSAoZGF0YSA/PyBbXSkgYXMgQ2xpZW50Um93W107XG5cbiAgLy8gRmV0Y2ggZW1haWxzIHZpYSBhdXRoLmFkbWluIGluIHBhcmFsbGVsXG4gIGNvbnN0IGVtYWlsTWFwOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XG4gIGF3YWl0IFByb21pc2UuYWxsKFxuICAgIHJvd3MubWFwKGFzeW5jIChyKSA9PiB7XG4gICAgICBjb25zdCB7IGRhdGE6IHUgfSA9IGF3YWl0IGFkbWluLmF1dGguYWRtaW4uZ2V0VXNlckJ5SWQoci51c2VyX2lkKTtcbiAgICAgIGlmICh1Py51c2VyPy5lbWFpbCkgZW1haWxNYXBbci51c2VyX2lkXSA9IHUudXNlci5lbWFpbDtcbiAgICB9KVxuICApO1xuXG4gIHJldHVybiByb3dzLm1hcCgocikgPT4gKHsgLi4uciwgZW1haWw6IGVtYWlsTWFwW3IudXNlcl9pZF0gPz8gXCJcIiB9KSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRDbGllbnRTZXR0aW5ncyh1c2VySWQ6IHN0cmluZykge1xuICBjb25zdCBzdXBhYmFzZSA9IGF3YWl0IGNyZWF0ZUNsaWVudCgpO1xuICBjb25zdCB7IGRhdGEsIGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgIC5mcm9tKFwiY2xpZW50c1wiKVxuICAgIC5zZWxlY3QoXCJpZCwgZG9tYWluLCBnYV9hcGlfa2V5LCBnY2NfYXBpX2tleSwgZnJlcXVlbmN5XCIpXG4gICAgLmVxKFwidXNlcl9pZFwiLCB1c2VySWQpXG4gICAgLm1heWJlU2luZ2xlKCk7XG4gIGlmIChlcnJvcikgdGhyb3cgZXJyb3I7XG4gIHJldHVybiBkYXRhO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdXBkYXRlQ2xpZW50RnJlcXVlbmN5KHVzZXJJZDogc3RyaW5nLCBmcmVxdWVuY3k6IEZyZXF1ZW5jeSkge1xuICBjb25zdCBzdXBhYmFzZSA9IGF3YWl0IGNyZWF0ZUNsaWVudCgpO1xuICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgIC5mcm9tKFwiY2xpZW50c1wiKVxuICAgIC51cGRhdGUoeyBmcmVxdWVuY3ksIHVwZGF0ZWRfYXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSB9KVxuICAgIC5lcShcInVzZXJfaWRcIiwgdXNlcklkKTtcbiAgaWYgKGVycm9yKSByZXR1cm4geyBlcnJvcjogZXJyb3IubWVzc2FnZSB9O1xuICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH07XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWxldGVVc2VyKHVzZXJJZDogc3RyaW5nKSB7XG4gIGF3YWl0IHJlcXVpcmVBZG1pbigpO1xuICBjb25zdCBhZG1pbiA9IGNyZWF0ZUFkbWluQ2xpZW50KCk7XG4gIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IGFkbWluLmF1dGguYWRtaW4uZGVsZXRlVXNlcih1c2VySWQpO1xuICBpZiAoZXJyb3IpIHJldHVybiB7IGVycm9yOiBlcnJvci5tZXNzYWdlIH07XG4gIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiK1NBMElzQiJ9
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/[locale]/(admin)/admin/users/data:300a22 [app-client] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"40c90a2a661f050c6dce5c9a5e45c581fa0007a736":"createUser"},"app/[locale]/(admin)/admin/users/actions.ts",""] */ __turbopack_context__.s([
    "createUser",
    ()=>createUser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-client] (ecmascript)");
"use turbopack no side effects";
;
var createUser = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createServerReference"])("40c90a2a661f050c6dce5c9a5e45c581fa0007a736", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findSourceMapURL"], "createUser"); //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYWN0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzZXJ2ZXJcIjtcblxuaW1wb3J0IHsgY3JlYXRlQWRtaW5DbGllbnQgfSBmcm9tIFwiQC9saWIvc3VwYWJhc2UvYWRtaW5cIjtcbmltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gXCJAL2xpYi9zdXBhYmFzZS9zZXJ2ZXJcIjtcbmltcG9ydCB7IHJlcXVpcmVBZG1pbiB9IGZyb20gXCJAL2xpYi9hdXRoXCI7XG5pbXBvcnQgeyB6IH0gZnJvbSBcInpvZFwiO1xuXG5leHBvcnQgdHlwZSBGcmVxdWVuY3kgPSBcImRhaWx5XCIgfCBcIndlZWtseVwiIHwgXCJiaXdlZWtseVwiIHwgXCJtb250aGx5XCI7XG5cbmNvbnN0IGNyZWF0ZVVzZXJTY2hlbWEgPSB6Lm9iamVjdCh7XG4gIGVtYWlsOiB6LnN0cmluZygpLmVtYWlsKCksXG4gIHBhc3N3b3JkOiB6LnN0cmluZygpLm1pbig4LCBcIlBhc3N3b3JkIG11c3QgYmUgYXQgbGVhc3QgOCBjaGFyYWN0ZXJzXCIpLFxuICBkaXNwbGF5X25hbWU6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgZG9tYWluOiB6LnN0cmluZygpLm1pbigxLCBcIkRvbWFpbiBpcyByZXF1aXJlZFwiKSxcbiAgZ2FfYXBpX2tleTogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxuICBnY2NfYXBpX2tleTogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxuICBmcmVxdWVuY3k6IHouZW51bShbXCJkYWlseVwiLCBcIndlZWtseVwiLCBcImJpd2Vla2x5XCIsIFwibW9udGhseVwiXSksXG59KTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVVzZXIoZm9ybURhdGE6IEZvcm1EYXRhKSB7XG4gIGF3YWl0IHJlcXVpcmVBZG1pbigpO1xuXG4gIGNvbnN0IHBhcnNlZCA9IGNyZWF0ZVVzZXJTY2hlbWEuc2FmZVBhcnNlKHtcbiAgICBlbWFpbDogZm9ybURhdGEuZ2V0KFwiZW1haWxcIik/LnRvU3RyaW5nKCkudHJpbSgpLFxuICAgIHBhc3N3b3JkOiBmb3JtRGF0YS5nZXQoXCJwYXNzd29yZFwiKT8udG9TdHJpbmcoKSxcbiAgICBkaXNwbGF5X25hbWU6IGZvcm1EYXRhLmdldChcImRpc3BsYXlfbmFtZVwiKT8udG9TdHJpbmcoKS50cmltKCkgfHwgdW5kZWZpbmVkLFxuICAgIGRvbWFpbjogZm9ybURhdGEuZ2V0KFwiZG9tYWluXCIpPy50b1N0cmluZygpLnRyaW0oKSxcbiAgICBnYV9hcGlfa2V5OiBmb3JtRGF0YS5nZXQoXCJnYV9hcGlfa2V5XCIpPy50b1N0cmluZygpLnRyaW0oKSB8fCB1bmRlZmluZWQsXG4gICAgZ2NjX2FwaV9rZXk6IGZvcm1EYXRhLmdldChcImdjY19hcGlfa2V5XCIpPy50b1N0cmluZygpLnRyaW0oKSB8fCB1bmRlZmluZWQsXG4gICAgZnJlcXVlbmN5OiBmb3JtRGF0YS5nZXQoXCJmcmVxdWVuY3lcIik/LnRvU3RyaW5nKCkgPz8gXCJ3ZWVrbHlcIixcbiAgfSk7XG5cbiAgaWYgKCFwYXJzZWQuc3VjY2Vzcykge1xuICAgIGNvbnN0IGZpcnN0RXJyb3IgPSBPYmplY3QudmFsdWVzKHBhcnNlZC5lcnJvci5mbGF0dGVuKCkuZmllbGRFcnJvcnMpWzBdPy5bMF07XG4gICAgcmV0dXJuIHsgZXJyb3I6IGZpcnN0RXJyb3IgPz8gXCJJbnZhbGlkIGlucHV0XCIgfTtcbiAgfVxuXG4gIGNvbnN0IHsgZW1haWwsIHBhc3N3b3JkLCBkaXNwbGF5X25hbWUsIGRvbWFpbiwgZ2FfYXBpX2tleSwgZ2NjX2FwaV9rZXksIGZyZXF1ZW5jeSB9ID0gcGFyc2VkLmRhdGE7XG4gIGNvbnN0IGFkbWluID0gY3JlYXRlQWRtaW5DbGllbnQoKTtcblxuICAvLyAxLiBDcmVhdGUgYXV0aCB1c2VyXG4gIGNvbnN0IHsgZGF0YTogYXV0aERhdGEsIGVycm9yOiBhdXRoRXJyb3IgfSA9IGF3YWl0IGFkbWluLmF1dGguYWRtaW4uY3JlYXRlVXNlcih7XG4gICAgZW1haWwsXG4gICAgcGFzc3dvcmQsXG4gICAgZW1haWxfY29uZmlybTogdHJ1ZSxcbiAgfSk7XG4gIGlmIChhdXRoRXJyb3IpIHJldHVybiB7IGVycm9yOiBhdXRoRXJyb3IubWVzc2FnZSB9O1xuICBjb25zdCB1c2VySWQgPSBhdXRoRGF0YS51c2VyLmlkO1xuXG4gIC8vIDIuIFVwc2VydCBwcm9maWxlIGRpc3BsYXkgbmFtZSBpZiBwcm92aWRlZFxuICBpZiAoZGlzcGxheV9uYW1lKSB7XG4gICAgYXdhaXQgYWRtaW4uZnJvbShcInByb2ZpbGVzXCIpLnVwZGF0ZSh7IGRpc3BsYXlfbmFtZSB9KS5lcShcImlkXCIsIHVzZXJJZCk7XG4gIH1cblxuICAvLyAzLiBBc3NpZ24gY29udHJpYnV0b3Igcm9sZVxuICBjb25zdCB7IGVycm9yOiByb2xlRXJyb3IgfSA9IGF3YWl0IGFkbWluXG4gICAgLmZyb20oXCJ1c2VyX3JvbGVzXCIpXG4gICAgLmluc2VydCh7IHVzZXJfaWQ6IHVzZXJJZCwgcm9sZV9pZDogXCJjb250cmlidXRvclwiIH0pO1xuICBpZiAocm9sZUVycm9yKSB7XG4gICAgLy8gUm9sbCBiYWNrOiBkZWxldGUgdGhlIGF1dGggdXNlclxuICAgIGF3YWl0IGFkbWluLmF1dGguYWRtaW4uZGVsZXRlVXNlcih1c2VySWQpO1xuICAgIHJldHVybiB7IGVycm9yOiByb2xlRXJyb3IubWVzc2FnZSB9O1xuICB9XG5cbiAgLy8gNC4gQ3JlYXRlIGNsaWVudHMgcm93XG4gIGNvbnN0IHsgZXJyb3I6IGNsaWVudEVycm9yIH0gPSBhd2FpdCBhZG1pbi5mcm9tKFwiY2xpZW50c1wiKS5pbnNlcnQoe1xuICAgIHVzZXJfaWQ6IHVzZXJJZCxcbiAgICBkb21haW4sXG4gICAgZ2FfYXBpX2tleTogZ2FfYXBpX2tleSA/PyBudWxsLFxuICAgIGdjY19hcGlfa2V5OiBnY2NfYXBpX2tleSA/PyBudWxsLFxuICAgIGZyZXF1ZW5jeSxcbiAgfSk7XG4gIGlmIChjbGllbnRFcnJvcikge1xuICAgIGF3YWl0IGFkbWluLmF1dGguYWRtaW4uZGVsZXRlVXNlcih1c2VySWQpO1xuICAgIHJldHVybiB7IGVycm9yOiBjbGllbnRFcnJvci5tZXNzYWdlIH07XG4gIH1cblxuICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCB1c2VySWQgfTtcbn1cblxuZXhwb3J0IHR5cGUgQ2xpZW50Um93ID0ge1xuICBpZDogc3RyaW5nO1xuICB1c2VyX2lkOiBzdHJpbmc7XG4gIGRvbWFpbjogc3RyaW5nO1xuICBnYV9hcGlfa2V5OiBzdHJpbmcgfCBudWxsO1xuICBnY2NfYXBpX2tleTogc3RyaW5nIHwgbnVsbDtcbiAgZnJlcXVlbmN5OiBGcmVxdWVuY3k7XG4gIGNyZWF0ZWRfYXQ6IHN0cmluZztcbiAgcHJvZmlsZXM6IHsgZGlzcGxheV9uYW1lOiBzdHJpbmcgfCBudWxsOyBpZDogc3RyaW5nIH0gfCBudWxsO1xuICBlbWFpbD86IHN0cmluZztcbn07XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsaXN0VXNlcnMoKTogUHJvbWlzZTxDbGllbnRSb3dbXT4ge1xuICBhd2FpdCByZXF1aXJlQWRtaW4oKTtcbiAgY29uc3QgYWRtaW4gPSBjcmVhdGVBZG1pbkNsaWVudCgpO1xuXG4gIC8vIFVzZSBhZG1pbiBjbGllbnQgc28gUkxTIGlzIGJ5cGFzc2VkIGFuZCBhdXRoLmFkbWluIGlzIGF2YWlsYWJsZVxuICBjb25zdCB7IGRhdGEsIGVycm9yIH0gPSBhd2FpdCBhZG1pblxuICAgIC5mcm9tKFwiY2xpZW50c1wiKVxuICAgIC5zZWxlY3QoXCJpZCwgdXNlcl9pZCwgZG9tYWluLCBnYV9hcGlfa2V5LCBnY2NfYXBpX2tleSwgZnJlcXVlbmN5LCBjcmVhdGVkX2F0LCBwcm9maWxlcyhpZCwgZGlzcGxheV9uYW1lKVwiKVxuICAgIC5vcmRlcihcImNyZWF0ZWRfYXRcIiwgeyBhc2NlbmRpbmc6IGZhbHNlIH0pO1xuICBpZiAoZXJyb3IpIHRocm93IGVycm9yO1xuXG4gIGNvbnN0IHJvd3MgPSAoZGF0YSA/PyBbXSkgYXMgQ2xpZW50Um93W107XG5cbiAgLy8gRmV0Y2ggZW1haWxzIHZpYSBhdXRoLmFkbWluIGluIHBhcmFsbGVsXG4gIGNvbnN0IGVtYWlsTWFwOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XG4gIGF3YWl0IFByb21pc2UuYWxsKFxuICAgIHJvd3MubWFwKGFzeW5jIChyKSA9PiB7XG4gICAgICBjb25zdCB7IGRhdGE6IHUgfSA9IGF3YWl0IGFkbWluLmF1dGguYWRtaW4uZ2V0VXNlckJ5SWQoci51c2VyX2lkKTtcbiAgICAgIGlmICh1Py51c2VyPy5lbWFpbCkgZW1haWxNYXBbci51c2VyX2lkXSA9IHUudXNlci5lbWFpbDtcbiAgICB9KVxuICApO1xuXG4gIHJldHVybiByb3dzLm1hcCgocikgPT4gKHsgLi4uciwgZW1haWw6IGVtYWlsTWFwW3IudXNlcl9pZF0gPz8gXCJcIiB9KSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRDbGllbnRTZXR0aW5ncyh1c2VySWQ6IHN0cmluZykge1xuICBjb25zdCBzdXBhYmFzZSA9IGF3YWl0IGNyZWF0ZUNsaWVudCgpO1xuICBjb25zdCB7IGRhdGEsIGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgIC5mcm9tKFwiY2xpZW50c1wiKVxuICAgIC5zZWxlY3QoXCJpZCwgZG9tYWluLCBnYV9hcGlfa2V5LCBnY2NfYXBpX2tleSwgZnJlcXVlbmN5XCIpXG4gICAgLmVxKFwidXNlcl9pZFwiLCB1c2VySWQpXG4gICAgLm1heWJlU2luZ2xlKCk7XG4gIGlmIChlcnJvcikgdGhyb3cgZXJyb3I7XG4gIHJldHVybiBkYXRhO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdXBkYXRlQ2xpZW50RnJlcXVlbmN5KHVzZXJJZDogc3RyaW5nLCBmcmVxdWVuY3k6IEZyZXF1ZW5jeSkge1xuICBjb25zdCBzdXBhYmFzZSA9IGF3YWl0IGNyZWF0ZUNsaWVudCgpO1xuICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgIC5mcm9tKFwiY2xpZW50c1wiKVxuICAgIC51cGRhdGUoeyBmcmVxdWVuY3ksIHVwZGF0ZWRfYXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSB9KVxuICAgIC5lcShcInVzZXJfaWRcIiwgdXNlcklkKTtcbiAgaWYgKGVycm9yKSByZXR1cm4geyBlcnJvcjogZXJyb3IubWVzc2FnZSB9O1xuICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH07XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWxldGVVc2VyKHVzZXJJZDogc3RyaW5nKSB7XG4gIGF3YWl0IHJlcXVpcmVBZG1pbigpO1xuICBjb25zdCBhZG1pbiA9IGNyZWF0ZUFkbWluQ2xpZW50KCk7XG4gIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IGFkbWluLmF1dGguYWRtaW4uZGVsZXRlVXNlcih1c2VySWQpO1xuICBpZiAoZXJyb3IpIHJldHVybiB7IGVycm9yOiBlcnJvci5tZXNzYWdlIH07XG4gIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiK1NBbUJzQiJ9
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/[locale]/(admin)/admin/users/CreateUserForm.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CreateUserForm",
    ()=>CreateUserForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$users$2f$data$3a$300a22__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/app/[locale]/(admin)/admin/users/data:300a22 [app-client] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$index$2e$react$2d$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/index.react-client.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
const inputBase = {
    background: "var(--surface-raised)",
    border: "1px solid var(--border)",
    color: "var(--text)",
    borderRadius: "12px",
    padding: "10px 14px",
    fontSize: "13px",
    width: "100%",
    outline: "none"
};
function Field(param) {
    let { label, name, type = "text", required = false, placeholder } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                htmlFor: name,
                className: "block text-xs font-semibold uppercase tracking-widest mb-1.5",
                style: {
                    color: "var(--text-muted)"
                },
                children: [
                    label,
                    required && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            color: "var(--accent)"
                        },
                        children: " *"
                    }, void 0, false, {
                        fileName: "[project]/app/[locale]/(admin)/admin/users/CreateUserForm.tsx",
                        lineNumber: 41,
                        columnNumber: 22
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/[locale]/(admin)/admin/users/CreateUserForm.tsx",
                lineNumber: 35,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                id: name,
                name: name,
                type: type,
                required: required,
                placeholder: placeholder,
                autoComplete: "off",
                style: inputBase,
                onFocus: (e)=>{
                    e.currentTarget.style.borderColor = "var(--accent)";
                    e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-glow)";
                },
                onBlur: (e)=>{
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.boxShadow = "none";
                }
            }, void 0, false, {
                fileName: "[project]/app/[locale]/(admin)/admin/users/CreateUserForm.tsx",
                lineNumber: 43,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/[locale]/(admin)/admin/users/CreateUserForm.tsx",
        lineNumber: 34,
        columnNumber: 5
    }, this);
}
_c = Field;
function CreateUserForm(param) {
    let { onSuccess, onCancel } = param;
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$index$2e$react$2d$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("admin.usersPage");
    const tSettings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$index$2e$react$2d$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("settings");
    const tCommon = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$index$2e$react$2d$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("common");
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [frequency, setFrequency] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("weekly");
    const formRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const FREQUENCY_OPTIONS = [
        {
            value: "daily",
            label: tSettings("frequency.daily")
        },
        {
            value: "weekly",
            label: tSettings("frequency.weekly")
        },
        {
            value: "biweekly",
            label: tSettings("frequency.biweekly")
        },
        {
            value: "monthly",
            label: tSettings("frequency.monthly")
        }
    ];
    async function handleSubmit(e) {
        e.preventDefault();
        if (!formRef.current) return;
        setLoading(true);
        setError(null);
        const fd = new FormData(formRef.current);
        fd.set("frequency", frequency);
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$users$2f$data$3a$300a22__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["createUser"])(fd);
        setLoading(false);
        if (result.error) {
            setError(result.error);
            return;
        }
        onSuccess();
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-2xl p-6 mb-8",
        style: {
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between mb-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs font-semibold uppercase tracking-widest mb-0.5",
                                style: {
                                    color: "var(--accent)"
                                },
                                children: t("createForm.eyebrow")
                            }, void 0, false, {
                                fileName: "[project]/app/[locale]/(admin)/admin/users/CreateUserForm.tsx",
                                lineNumber: 109,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-base font-bold",
                                style: {
                                    color: "var(--text)"
                                },
                                children: t("createForm.title")
                            }, void 0, false, {
                                fileName: "[project]/app/[locale]/(admin)/admin/users/CreateUserForm.tsx",
                                lineNumber: 115,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/[locale]/(admin)/admin/users/CreateUserForm.tsx",
                        lineNumber: 108,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: onCancel,
                        className: "text-xs px-3 py-1.5 rounded-xl transition-all",
                        style: {
                            color: "var(--text-muted)",
                            border: "1px solid var(--border)"
                        },
                        children: tCommon("cancel")
                    }, void 0, false, {
                        fileName: "[project]/app/[locale]/(admin)/admin/users/CreateUserForm.tsx",
                        lineNumber: 119,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/[locale]/(admin)/admin/users/CreateUserForm.tsx",
                lineNumber: 107,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                ref: formRef,
                onSubmit: handleSubmit,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                label: tCommon("email"),
                                name: "email",
                                type: "email",
                                required: true,
                                placeholder: t("createForm.emailPlaceholder")
                            }, void 0, false, {
                                fileName: "[project]/app/[locale]/(admin)/admin/users/CreateUserForm.tsx",
                                lineNumber: 132,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                label: tCommon("password"),
                                name: "password",
                                type: "password",
                                required: true,
                                placeholder: t("createForm.passwordPlaceholder")
                            }, void 0, false, {
                                fileName: "[project]/app/[locale]/(admin)/admin/users/CreateUserForm.tsx",
                                lineNumber: 133,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                label: t("createForm.displayName"),
                                name: "display_name",
                                placeholder: t("createForm.displayNamePlaceholder")
                            }, void 0, false, {
                                fileName: "[project]/app/[locale]/(admin)/admin/users/CreateUserForm.tsx",
                                lineNumber: 134,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                label: t("createForm.domain"),
                                name: "domain",
                                required: true,
                                placeholder: t("createForm.domainPlaceholder")
                            }, void 0, false, {
                                fileName: "[project]/app/[locale]/(admin)/admin/users/CreateUserForm.tsx",
                                lineNumber: 135,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/[locale]/(admin)/admin/users/CreateUserForm.tsx",
                        lineNumber: 131,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4",
                        style: {
                            background: "var(--surface-raised)",
                            border: "1px solid var(--border)"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[10px] font-semibold uppercase tracking-widest mb-3",
                                        style: {
                                            color: "var(--text-faint)"
                                        },
                                        children: t("createForm.integrations")
                                    }, void 0, false, {
                                        fileName: "[project]/app/[locale]/(admin)/admin/users/CreateUserForm.tsx",
                                        lineNumber: 144,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-3",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                            label: tSettings("gaApiKey"),
                                            name: "ga_api_key",
                                            placeholder: t("createForm.apiKeyPlaceholder")
                                        }, void 0, false, {
                                            fileName: "[project]/app/[locale]/(admin)/admin/users/CreateUserForm.tsx",
                                            lineNumber: 151,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/[locale]/(admin)/admin/users/CreateUserForm.tsx",
                                        lineNumber: 150,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/[locale]/(admin)/admin/users/CreateUserForm.tsx",
                                lineNumber: 143,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col justify-end",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-3",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                        label: tSettings("gccApiKey"),
                                        name: "gcc_api_key",
                                        placeholder: t("createForm.apiKeyPlaceholder")
                                    }, void 0, false, {
                                        fileName: "[project]/app/[locale]/(admin)/admin/users/CreateUserForm.tsx",
                                        lineNumber: 156,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/[locale]/(admin)/admin/users/CreateUserForm.tsx",
                                    lineNumber: 155,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/[locale]/(admin)/admin/users/CreateUserForm.tsx",
                                lineNumber: 154,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/[locale]/(admin)/admin/users/CreateUserForm.tsx",
                        lineNumber: 139,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs font-semibold uppercase tracking-widest mb-2",
                                style: {
                                    color: "var(--text-muted)"
                                },
                                children: [
                                    tSettings("postingFrequency"),
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            color: "var(--accent)"
                                        },
                                        children: "*"
                                    }, void 0, false, {
                                        fileName: "[project]/app/[locale]/(admin)/admin/users/CreateUserForm.tsx",
                                        lineNumber: 167,
                                        columnNumber: 45
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/[locale]/(admin)/admin/users/CreateUserForm.tsx",
                                lineNumber: 163,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-2 sm:grid-cols-4 gap-2",
                                children: FREQUENCY_OPTIONS.map((opt)=>{
                                    const active = frequency === opt.value;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>setFrequency(opt.value),
                                        className: "px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                        style: {
                                            background: active ? "rgba(124,92,252,0.12)" : "var(--surface-raised)",
                                            border: active ? "1px solid rgba(124,92,252,0.4)" : "1px solid var(--border)",
                                            color: active ? "var(--accent)" : "var(--text-muted)",
                                            boxShadow: active ? "0 0 12px rgba(124,92,252,0.1)" : "none"
                                        },
                                        children: opt.label
                                    }, opt.value, false, {
                                        fileName: "[project]/app/[locale]/(admin)/admin/users/CreateUserForm.tsx",
                                        lineNumber: 173,
                                        columnNumber: 17
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/app/[locale]/(admin)/admin/users/CreateUserForm.tsx",
                                lineNumber: 169,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/[locale]/(admin)/admin/users/CreateUserForm.tsx",
                        lineNumber: 162,
                        columnNumber: 9
                    }, this),
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-4 px-4 py-3 rounded-xl text-sm",
                        style: {
                            background: "rgba(255,92,106,0.08)",
                            border: "1px solid rgba(255,92,106,0.25)",
                            color: "var(--danger)"
                        },
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/app/[locale]/(admin)/admin/users/CreateUserForm.tsx",
                        lineNumber: 193,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "submit",
                                disabled: loading,
                                className: "flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50",
                                style: {
                                    background: "var(--accent)",
                                    color: "white",
                                    boxShadow: loading ? "none" : "0 0 20px rgba(124,92,252,0.3)"
                                },
                                children: loading ? t("creating") : t("createAccount")
                            }, void 0, false, {
                                fileName: "[project]/app/[locale]/(admin)/admin/users/CreateUserForm.tsx",
                                lineNumber: 206,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: onCancel,
                                className: "px-5 py-2.5 rounded-xl text-sm font-semibold",
                                style: {
                                    border: "1px solid var(--border)",
                                    color: "var(--text-muted)"
                                },
                                children: tCommon("cancel")
                            }, void 0, false, {
                                fileName: "[project]/app/[locale]/(admin)/admin/users/CreateUserForm.tsx",
                                lineNumber: 218,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/[locale]/(admin)/admin/users/CreateUserForm.tsx",
                        lineNumber: 205,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/[locale]/(admin)/admin/users/CreateUserForm.tsx",
                lineNumber: 129,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/[locale]/(admin)/admin/users/CreateUserForm.tsx",
        lineNumber: 99,
        columnNumber: 5
    }, this);
}
_s(CreateUserForm, "CZGI00FSDMNXBVKR5rJL6eR5EWc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$index$2e$react$2d$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$index$2e$react$2d$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$index$2e$react$2d$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c1 = CreateUserForm;
var _c, _c1;
__turbopack_context__.k.register(_c, "Field");
__turbopack_context__.k.register(_c1, "CreateUserForm");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UsersClient",
    ()=>UsersClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$users$2f$data$3a$ecca2a__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/app/[locale]/(admin)/admin/users/data:ecca2a [app-client] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$users$2f$CreateUserForm$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/[locale]/(admin)/admin/users/CreateUserForm.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$index$2e$react$2d$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/index.react-client.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
function UsersClient(param) {
    let { initialUsers, initialError } = param;
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$index$2e$react$2d$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("admin.usersPage");
    const tSettings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$index$2e$react$2d$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("settings.frequency");
    const tCommon = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$index$2e$react$2d$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("common");
    const [users, setUsers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialUsers);
    const [showForm, setShowForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [deletingId, setDeletingId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialError);
    const [isPending, startTransition] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTransition"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const FREQUENCY_LABELS = {
        daily: tSettings("daily"),
        weekly: tSettings("weekly"),
        biweekly: tSettings("biweekly"),
        monthly: tSettings("monthly")
    };
    function handleSuccess() {
        setShowForm(false);
        startTransition(()=>{
            router.refresh();
        });
    }
    async function handleDelete(userId, email) {
        if (!confirm(t("confirmDelete", {
            email
        }))) return;
        setDeletingId(userId);
        setError(null);
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$users$2f$data$3a$ecca2a__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["deleteUser"])(userId);
        setDeletingId(null);
        if (result.error) {
            setError(result.error);
            return;
        }
        setUsers((prev)=>prev.filter((u)=>u.user_id !== userId));
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "max-w-5xl",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between mb-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs font-semibold uppercase tracking-widest mb-1",
                                style: {
                                    color: "var(--accent)"
                                },
                                children: "Admin"
                            }, void 0, false, {
                                fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
                                lineNumber: 55,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-2xl font-bold tracking-tight",
                                style: {
                                    color: "var(--text)"
                                },
                                children: t("title")
                            }, void 0, false, {
                                fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
                                lineNumber: 61,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-1 text-sm",
                                style: {
                                    color: "var(--text-muted)"
                                },
                                children: t("subtitle")
                            }, void 0, false, {
                                fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
                                lineNumber: 64,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
                        lineNumber: 54,
                        columnNumber: 9
                    }, this),
                    !showForm && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setShowForm(true),
                        className: "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all",
                        style: {
                            background: "var(--accent)",
                            color: "white",
                            boxShadow: "0 0 20px rgba(124,92,252,0.3)"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                width: "14",
                                height: "14",
                                viewBox: "0 0 14 14",
                                fill: "none",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    d: "M7 1v12M1 7h12",
                                    stroke: "currentColor",
                                    strokeWidth: "1.8",
                                    strokeLinecap: "round"
                                }, void 0, false, {
                                    fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
                                    lineNumber: 79,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
                                lineNumber: 78,
                                columnNumber: 13
                            }, this),
                            t("createAccount")
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
                        lineNumber: 69,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
                lineNumber: 53,
                columnNumber: 7
            }, this),
            showForm && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b$locale$5d2f28$admin$292f$admin$2f$users$2f$CreateUserForm$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CreateUserForm"], {
                onSuccess: handleSuccess,
                onCancel: ()=>setShowForm(false)
            }, void 0, false, {
                fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
                lineNumber: 88,
                columnNumber: 9
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-6 px-4 py-3 rounded-xl text-sm",
                style: {
                    background: "rgba(255,92,106,0.08)",
                    border: "1px solid rgba(255,92,106,0.25)",
                    color: "var(--danger)"
                },
                children: error
            }, void 0, false, {
                fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
                lineNumber: 96,
                columnNumber: 9
            }, this),
            users.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col items-center justify-center py-20 rounded-2xl text-center",
                style: {
                    border: "1.5px dashed var(--border)",
                    background: "var(--surface)"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-12 h-12 rounded-2xl flex items-center justify-center mb-4",
                        style: {
                            background: "rgba(124,92,252,0.1)",
                            border: "1px solid rgba(124,92,252,0.2)"
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            width: "22",
                            height: "22",
                            viewBox: "0 0 22 22",
                            fill: "none",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                    cx: "11",
                                    cy: "8",
                                    r: "3.5",
                                    stroke: "var(--accent)",
                                    strokeWidth: "1.6"
                                }, void 0, false, {
                                    fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
                                    lineNumber: 119,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    d: "M3 19c0-4.418 3.582-8 8-8s8 3.582 8 8",
                                    stroke: "var(--accent)",
                                    strokeWidth: "1.6",
                                    strokeLinecap: "round"
                                }, void 0, false, {
                                    fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
                                    lineNumber: 120,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
                            lineNumber: 118,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
                        lineNumber: 114,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm font-medium mb-1",
                        style: {
                            color: "var(--text)"
                        },
                        children: t("empty")
                    }, void 0, false, {
                        fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
                        lineNumber: 123,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs",
                        style: {
                            color: "var(--text-muted)"
                        },
                        children: t("emptyHint")
                    }, void 0, false, {
                        fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
                        lineNumber: 126,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
                lineNumber: 110,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-2xl overflow-hidden",
                style: {
                    border: "1px solid var(--border)",
                    background: "var(--surface)"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    className: "min-w-full text-sm",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                style: {
                                    borderBottom: "1px solid var(--border)"
                                },
                                children: [
                                    t("colUser"),
                                    t("colDomain"),
                                    t("colFrequency"),
                                    t("colGaKey"),
                                    t("colGccKey"),
                                    t("colCreated"),
                                    ""
                                ].map((h, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest",
                                        style: {
                                            color: "var(--text-muted)"
                                        },
                                        children: h
                                    }, i, false, {
                                        fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
                                        lineNumber: 147,
                                        columnNumber: 19
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
                                lineNumber: 137,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
                            lineNumber: 136,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            children: users.map((u, i)=>{
                                const isLast = i === users.length - 1;
                                const profileData = Array.isArray(u.profiles) ? u.profiles[0] : u.profiles;
                                const displayName = profileData === null || profileData === void 0 ? void 0 : profileData.display_name;
                                var _ref;
                                const initial = ((_ref = displayName !== null && displayName !== void 0 ? displayName : u.email) !== null && _ref !== void 0 ? _ref : "?")[0].toUpperCase();
                                const isDeleting = deletingId === u.user_id;
                                var _FREQUENCY_LABELS_u_frequency;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    style: {
                                        borderBottom: isLast ? "none" : "1px solid var(--border-subtle)",
                                        transition: "background 0.15s"
                                    },
                                    onMouseEnter: (e)=>{
                                        e.currentTarget.style.background = "var(--surface-raised)";
                                    },
                                    onMouseLeave: (e)=>{
                                        e.currentTarget.style.background = "transparent";
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-6 py-4",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2.5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold uppercase flex-shrink-0",
                                                        style: {
                                                            background: "rgba(124,92,252,0.12)",
                                                            border: "1px solid rgba(124,92,252,0.2)",
                                                            color: "var(--accent)"
                                                        },
                                                        children: initial
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
                                                        lineNumber: 181,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            displayName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-xs font-semibold",
                                                                style: {
                                                                    color: "var(--text)"
                                                                },
                                                                children: displayName
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
                                                                lineNumber: 193,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-xs",
                                                                style: {
                                                                    color: "var(--text-muted)"
                                                                },
                                                                children: u.email
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
                                                                lineNumber: 197,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
                                                        lineNumber: 191,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
                                                lineNumber: 180,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
                                            lineNumber: 179,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-6 py-4",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs font-mono",
                                                style: {
                                                    color: "var(--text)"
                                                },
                                                children: u.domain
                                            }, void 0, false, {
                                                fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
                                                lineNumber: 204,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
                                            lineNumber: 203,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-6 py-4",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                                                style: {
                                                    background: "rgba(124,92,252,0.1)",
                                                    color: "var(--accent)"
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "w-1.5 h-1.5 rounded-full",
                                                        style: {
                                                            background: "var(--accent)"
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
                                                        lineNumber: 213,
                                                        columnNumber: 25
                                                    }, this),
                                                    (_FREQUENCY_LABELS_u_frequency = FREQUENCY_LABELS[u.frequency]) !== null && _FREQUENCY_LABELS_u_frequency !== void 0 ? _FREQUENCY_LABELS_u_frequency : u.frequency
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
                                                lineNumber: 209,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
                                            lineNumber: 208,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-6 py-4",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs font-mono",
                                                style: {
                                                    color: u.ga_api_key ? "var(--text-muted)" : "var(--text-faint)"
                                                },
                                                children: u.ga_api_key ? "".concat(u.ga_api_key.slice(0, 8), "…") : "—"
                                            }, void 0, false, {
                                                fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
                                                lineNumber: 218,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
                                            lineNumber: 217,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-6 py-4",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs font-mono",
                                                style: {
                                                    color: u.gcc_api_key ? "var(--text-muted)" : "var(--text-faint)"
                                                },
                                                children: u.gcc_api_key ? "".concat(u.gcc_api_key.slice(0, 8), "…") : "—"
                                            }, void 0, false, {
                                                fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
                                                lineNumber: 223,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
                                            lineNumber: 222,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-6 py-4 text-xs whitespace-nowrap",
                                            style: {
                                                color: "var(--text-muted)"
                                            },
                                            children: new Date(u.created_at).toLocaleDateString(undefined, {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric"
                                            })
                                        }, void 0, false, {
                                            fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
                                            lineNumber: 227,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-6 py-4",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>{
                                                    var _u_email;
                                                    return handleDelete(u.user_id, (_u_email = u.email) !== null && _u_email !== void 0 ? _u_email : u.user_id);
                                                },
                                                disabled: isDeleting || isPending,
                                                className: "text-xs font-semibold transition-colors disabled:opacity-40",
                                                style: {
                                                    color: "var(--text-muted)"
                                                },
                                                onMouseEnter: (e)=>{
                                                    e.currentTarget.style.color = "var(--danger)";
                                                },
                                                onMouseLeave: (e)=>{
                                                    e.currentTarget.style.color = "var(--text-muted)";
                                                },
                                                children: isDeleting ? "…" : tCommon("delete")
                                            }, void 0, false, {
                                                fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
                                                lineNumber: 233,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
                                            lineNumber: 232,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, u.id, true, {
                                    fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
                                    lineNumber: 166,
                                    columnNumber: 19
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
                            lineNumber: 157,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
                    lineNumber: 135,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
                lineNumber: 131,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/[locale]/(admin)/admin/users/UsersClient.tsx",
        lineNumber: 51,
        columnNumber: 5
    }, this);
}
_s(UsersClient, "xvuEDaJDVuAkEjS9dl/R4oqtGYo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$index$2e$react$2d$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$index$2e$react$2d$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$index$2e$react$2d$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTransition"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = UsersClient;
var _c;
__turbopack_context__.k.register(_c, "UsersClient");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

// This file must be bundled in the app's client layer, it shouldn't be directly
// imported by the server.
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    callServer: null,
    createServerReference: null,
    findSourceMapURL: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    callServer: function() {
        return _appcallserver.callServer;
    },
    createServerReference: function() {
        return _client.createServerReference;
    },
    findSourceMapURL: function() {
        return _appfindsourcemapurl.findSourceMapURL;
    }
});
const _appcallserver = __turbopack_context__.r("[project]/node_modules/next/dist/client/app-call-server.js [app-client] (ecmascript)");
const _appfindsourcemapurl = __turbopack_context__.r("[project]/node_modules/next/dist/client/app-find-source-map-url.js [app-client] (ecmascript)");
const _client = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react-server-dom-turbopack/client.js [app-client] (ecmascript)"); //# sourceMappingURL=action-client-wrapper.js.map
}),
]);

//# sourceMappingURL=_846f412f._.js.map