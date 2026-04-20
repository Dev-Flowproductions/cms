# Shared integration contract, DG ↔ AI CMS

## Purpose

This file is the single source of truth for the integration between DG and AI CMS.

DG owns strategy, article brief generation, orchestration context, and visibility of progress inside DG.

AI CMS owns the publishing destination, editorial lifecycle, article creation, review flow, scheduling, and publishing.

The integration goal is simple:

- DG decides what article should exist, and why.
- AI CMS decides how that article is produced, reviewed, and published.

This contract must be followed by both codebases.

---

## Scope for phase 1

Phase 1 covers:

- mapping a DG project to one AI CMS publishing destination
- sending article briefs from DG to AI CMS
- creating a queued article job in AI CMS
- sending status updates from AI CMS back to DG
- showing synced status inside DG

Phase 1 does not cover:

- article performance sync back into DG
- editing articles from DG
- multi-destination publishing per brief
- bi-directional content editing
- replacing existing CMS publishing flows

---

## Core architecture decision

The stable connection must be:

**DG project → AI CMS site**

Not:

- DG project → AI CMS user
- DG project → AI CMS author

Reason:

- users can change
- multiple users can manage one blog
- one client can have multiple sites
- the publishing destination must remain stable even if team members change

If AI CMS does not yet expose a stable `site` object, create or formalise one before proceeding.

---

## Canonical entities

### DG side

- `workspace`
- `client`
- `project`
- `strategy`
- `campaign`
- `article_brief`
- `cms_sync_record`

### AI CMS side

- `client`
- `site`
- `post`
- `post_localization`
- `review_checklist`
- `agent_run` if needed internally
- `dg_integration_record`

---

## Required mapping

Each DG project that wants blog generation must store a mapping to one AI CMS site.

### DG required fields

Add to DG project settings, or equivalent integration table:

- `cms_site_id` string, required for sending briefs
- `cms_client_id` string, optional but recommended
- `cms_connection_status` enum
- `cms_connection_label` string, optional display name
- `cms_last_sync_at` datetime, nullable
- `cms_api_base_url` string, if not global

### Suggested connection status enum

- `not_connected`
- `connected`
- `invalid`
- `revoked`

---

## Ownership rules

### DG owns

- article brief generation
- strategic context
- keyword and intent definition
- target persona and buying stage context
- decision to send brief to CMS
- visibility of CMS article progress in DG

### AI CMS owns

- site validation
- content production lifecycle
- drafting
- review
- SEO, AEO and GEO scoring
- scheduling
- publishing
- publish URL
- editorial failure state and failure reason

### Important rule

DG must never assume a brief became an article until AI CMS confirms receipt and returns a `cms_article_id`.

---

## Integration model

Use server-to-server API integration.

### Authentication for phase 1

Use a simple shared API key or bearer token between DG and AI CMS.

Recommended headers:

- `Authorization: Bearer <token>`
- `Content-Type: application/json`
- `X-Integration-Source: dg`
- `X-Request-Id: <uuid>`

For CMS → DG webhooks:

- `Authorization: Bearer <token>`
- `Content-Type: application/json`
- `X-Integration-Source: ai-cms`
- `X-Request-Id: <uuid>`

### Future

OAuth or signed webhooks can be added later, but phase 1 should stay simple.

---

## API contract

## 1. DG → AI CMS, create article job

### Endpoint

`POST /api/integrations/dg/article-briefs`

### Purpose

DG sends a structured article brief to AI CMS and asks it to create a queued article job under a mapped site.

### Request payload

```json
{
  "request_id": "uuid",
  "source": "dg",
  "dg_workspace_id": "uuid-or-string",
  "dg_client_id": "uuid-or-string",
  "dg_project_id": "uuid-or-string",
  "dg_strategy_id": "uuid-or-string",
  "dg_campaign_id": "uuid-or-string-or-null",
  "cms_site_id": "string",
  "title": "Working title for the article",
  "brief_md": "# Article brief\n...",
  "primary_keyword": "signal-led demand generation",
  "secondary_keywords": [
    "non-gated demand generation",
    "AEO",
    "GEO"
  ],
  "search_intent": "commercial",
  "buyer_stage": "consideration",
  "target_persona": "Marketing Director at a B2B SME",
  "brand_tone": "clear, practical, commercially intelligent",
  "language": "en",
  "country": "UK",
  "cta_goal": "book_call",
  "requested_due_date": "2026-04-24T12:00:00Z",
  "suggested_sources": [
    {
      "title": "Source title",
      "url": "https://example.com/source"
    }
  ],
  "metadata": {
    "channel_origin": "campaigns",
    "content_type": "blog_article",
    "priority": "normal"
  }
}
```

### Validation rules

AI CMS must reject the request with 4xx if any of the following are missing:

- `request_id`
- `dg_project_id`
- `cms_site_id`
- `brief_md`
- `language`

### Success response

```json
{
  "success": true,
  "cms_article_id": "uuid-or-string",
  "cms_site_id": "string",
  "status": "queued",
  "status_label": "Queued",
  "article_admin_url": "https://cms.example.com/en/admin/posts/123",
  "received_at": "2026-04-17T11:45:00Z"
}
```

### Error response example

```json
{
  "success": false,
  "error_code": "SITE_NOT_FOUND",
  "message": "The provided cms_site_id does not exist or is not available for DG integration."
}
```

---

## 2. AI CMS → DG, article status webhook

### Endpoint

`POST /api/integrations/ai-cms/article-status`

### Purpose

AI CMS notifies DG whenever the article moves through a major lifecycle state.

### Request payload

```json
{
  "event_id": "uuid",
  "event_type": "article.status_changed",
  "request_id": "uuid-from-original-request",
  "dg_project_id": "uuid-or-string",
  "dg_strategy_id": "uuid-or-string",
  "dg_campaign_id": "uuid-or-string-or-null",
  "cms_site_id": "string",
  "cms_article_id": "uuid-or-string",
  "status": "review",
  "status_label": "In review",
  "article_admin_url": "https://cms.example.com/en/admin/posts/123",
  "published_url": null,
  "error_code": null,
  "error_message": null,
  "updated_at": "2026-04-17T12:20:00Z"
}
```

### Status webhook triggers

Send webhook on:

- receipt and queue creation
- draft ready
- moved to review
- approved
- scheduled
- published
- failed

### Success response from DG

```json
{
  "success": true,
  "received": true
}
```

---

## Lifecycle status enum

This enum must be shared by both systems.

### Canonical statuses

- `queued`
- `drafting`
- `review`
- `approved`
- `scheduled`
- `published`
- `failed`

### Notes

- `queued` means the brief was accepted by AI CMS
- `drafting` means content generation is in progress
- `review` means draft exists and is waiting for human or workflow review
- `approved` means article passed review but is not yet live
- `scheduled` means article has a future publish time
- `published` means article is live and `published_url` should be set
- `failed` means the workflow stopped and needs intervention

Do not invent additional public statuses in one system only.

Internal statuses are allowed inside each app, but they must map to the canonical enum above before sync.

---

## Idempotency and retry rules

### DG → AI CMS

- DG must send a unique `request_id` per brief submission
- AI CMS must treat repeated `request_id` submissions as idempotent
- if the same `request_id` is received again, AI CMS must return the existing `cms_article_id` rather than creating duplicates

### AI CMS → DG

- AI CMS must send a unique `event_id` for each webhook event
- DG must ignore duplicate `event_id` values already processed

### Retry rules

- if a webhook fails with non-2xx, AI CMS should retry up to 5 times
- use backoff, for example 1 minute, 5 minutes, 15 minutes, 1 hour, 6 hours
- after final failure, AI CMS should store webhook delivery failure internally for manual inspection

---

## Data persistence requirements

## DG side persistence

Create a dedicated sync record table, or equivalent.

### Suggested table: `dg_article_cms_sync`

Fields:

- `id`
- `request_id`, unique
- `dg_project_id`
- `dg_strategy_id`
- `dg_campaign_id`, nullable
- `cms_site_id`
- `cms_article_id`, nullable until receipt
- `brief_title`
- `status`
- `article_admin_url`, nullable
- `published_url`, nullable
- `error_code`, nullable
- `error_message`, nullable
- `last_status_sync_at`, nullable
- `created_at`
- `updated_at`

## AI CMS side persistence

Store the DG origin on the post or in a dedicated integration table.

### Minimum required fields

- `request_id`, unique
- `dg_project_id`
- `dg_strategy_id`
- `dg_campaign_id`, nullable
- `cms_site_id`
- `cms_article_id`
- `last_webhook_status_sent`
- `last_webhook_sent_at`, nullable

---

## UI expectations

## DG UI

DG should show for each synced article:

- title
- mapped CMS site label
- current status
- last sync timestamp
- article admin link, if available
- published URL, if available
- failure message, if failed

## AI CMS UI

AI CMS should show on the post or job record:

- source = DG
- DG project reference
- original request id
- original brief metadata if useful

---

## Guardrails

- Do not break existing AI CMS article creation flows
- Do not break existing DG strategy or campaign flows
- Do not hardcode site ids, project ids, or tokens
- Do not use user id as the publishing anchor
- Do not let DG create content directly inside AI CMS database
- Do not share databases across apps for this integration
- Do not add fields or statuses on one side only without updating this contract

---

## Acceptance criteria

The contract is complete when all of the following are true:

1. A DG project can store one valid AI CMS site mapping.
2. DG can send a structured brief to AI CMS using the agreed endpoint.
3. AI CMS returns a valid `cms_article_id` and `queued` status.
4. AI CMS creates exactly one article job per unique `request_id`.
5. AI CMS can send canonical status updates back to DG.
6. DG stores and displays the latest status correctly.
7. A published article in AI CMS updates DG with `published` status and `published_url`.
8. Duplicate requests do not create duplicate articles.
9. Failed webhooks are retried.
10. No existing content or publishing flow is broken.

---

## Recommended implementation order

1. confirm or create stable `site` object in AI CMS
2. add DG project ↔ CMS site mapping
3. build DG → CMS create-brief endpoint flow
4. build CMS → DG status webhook flow
5. add sync record UI in DG
6. add source metadata UI in AI CMS
7. test end-to-end with one real mapped site

