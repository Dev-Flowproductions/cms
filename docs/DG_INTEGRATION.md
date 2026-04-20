# DG ↔ AI CMS integration (this repository)

## Single source of truth

Before changing integration behaviour on either side, read and update the shared contract:

- **[`00_shared_integration_contract_dg_ai_cms.md`](./00_shared_integration_contract_dg_ai_cms.md)** — canonical API shapes, enums, idempotency, retries, and acceptance criteria for **both** DG and AI CMS.

AI CMS–specific implementation notes and checklist:

- **[`02_ai_cms_spec_receive_dg_briefs_and_sync_status.md`](./02_ai_cms_spec_receive_dg_briefs_and_sync_status.md)**

Do not diverge from `00_shared` in a PR without first changing that document.

## Site identity (`cms_site_id`)

There is no separate `sites` table. The stable publishing destination for DG is the **client (tenant) row** used everywhere else for headless API scoping:

- **`cms_site_id` in the contract = `public.clients.id` (UUID).**

DG stores this value on the project mapping; briefs are rejected with `SITE_NOT_FOUND` when no matching client exists.

In the **admin** UI, each client shows **Site ID** (with a copy control) on **Admin → User accounts** — both the account list and the per-user detail page — so operators can paste it into DG without opening Supabase.

**Payload quirks:** DG may send JSON `null` for optional string fields (e.g. `target_persona`, `brand_tone`, `country`, `search_intent`, `cta_goal`). The intake schema treats those as omitted.

**After a successful brief:** the CMS enqueues **`cms/dg-brief.run-generation`** on Inngest, which runs the same Gemini pipeline as **Generate** in the post editor, then sets the post to **`draft`** and sends a DG status webhook (canonical **`drafting`**). If Inngest enqueue fails, generation is attempted inline as a fallback (best-effort). Ensure Inngest is connected in production.

## Environment variables

| Variable | Purpose |
| -------- | ------- |
| `DG_INTEGRATION_BEARER_SECRET` | Shared secret: DG sends `Authorization: Bearer <value>` to `POST /api/integrations/dg/article-briefs`. |
| `DG_STATUS_WEBHOOK_URL` | Full URL of DG’s receiver for `POST /api/integrations/ai-cms/article-status` (CMS → DG). |
| `DG_STATUS_WEBHOOK_BEARER_SECRET` | Bearer token AI CMS sends so DG can verify inbound webhooks. |

See [`.env.example`](../.env.example) for placeholders.

Status webhooks are enqueued with [`inngest.send`](https://www.inngest.com/docs) and delivered by the `deliverDgStatusWebhook` function (`lib/inngest/dg-status-webhook.ts`), which performs up to six attempts with the contract’s backoff between tries (1m, 5m, 15m, 1h, 6h). Failed deliveries are stored on `dg_integration_records.last_webhook_error`.

## Related: Witflow site connector (not DG)

The **[`witflow_cms_connector_spec_kit/`](./witflow_cms_connector_spec_kit/)** specs describe the **customer website ↔ CMS** connector (kits, pull/push, guardrails). That is a separate product thread from **DG ↔ AI CMS**; the canonical DG contract remains `00_shared` plus `02_ai_cms` above.
