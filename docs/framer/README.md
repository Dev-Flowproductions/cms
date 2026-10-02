# Witflow × Framer — short onboarding

1. **Plugin** — In Framer, add the Witflow CMS Managed Collection plugin → enter CMS base URL, Site ID, API key, default locale → Save → **Sync now** (primary content path under fallback A).
2. **Local CMS** — Plugin needs HTTPS to the CMS (e.g. `cloudflared tunnel --url http://localhost:3000`). Do not use `http://localhost` as CMS base URL in the plugin.
3. **Bridge** (optional while fallback A) — Deploy/run `framer-bridge` for webhook contract tests; collection write via Server API is **not** reliable for Dev plugin Managed Collections.
4. **CMS Admin** — Webhook URL may point at bridge `…/webhook` for future dual-write; same webhook secret as bridge env.
5. **Publish / dual-write** — **Validated: fallback A** — details in [VALIDATION.md](./VALIDATION.md).

Localization: enable pt/en/fr (or matching codes) in the Framer project. Connector health: `GET /health` reports `phase: 3`.
