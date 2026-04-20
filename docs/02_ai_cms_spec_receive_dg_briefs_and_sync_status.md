# AI CMS speckit, receive DG briefs and sync status back

## Owner

Leandro

## Objective

Implement the AI CMS side of the DG integration.

**Implementation entrypoint in this repo:** [`DG_INTEGRATION.md`](./DG_INTEGRATION.md) (env vars, `cms_site_id` mapping, and pointers to the shared contract).

AI CMS must be able to:

- receive a structured article brief from DG
- validate the target CMS site
- create exactly one queued article job per `request_id`
- manage the article through its existing editorial lifecycle
- send canonical status updates back to DG

AI CMS remains the owner of drafting, review, quality gates, scheduling, and publishing.

---

## Product logic

The AI CMS already behaves like a multi-tenant editorial and publishing system, with clients, posts, localisations, review flow, scheduling, publishing, and site-based API routes. This integration should extend that model, not bypass it. fileciteturn0file15 fileciteturn0file9

DG is not sending a finished article. DG is sending a strategic brief that AI CMS must transform into a managed article workflow.

---

## Scope for this implementation

### In scope

- confirm or formalise stable `site` object if needed
- create DG article brief intake endpoint
- validate `cms_site_id`
- create queued article job or post record
- store DG origin metadata
- send status updates back to DG
- support idempotent behaviour by `request_id`

### Out of scope

- exposing DG internals in CMS UI beyond useful metadata
- fetching article performance into DG
- replacing the current CMS content generation system
- redesigning the whole CMS editorial flow

---

## Existing architecture context

AI CMS already supports multi-tenant content, localisations, review statuses, publish API, and site-based API semantics. The DG integration should fit that architecture. Do not add a DG-specific shortcut that bypasses normal post lifecycle rules. fileciteturn0file15 fileciteturn0file9

---

## Required changes

## 1. Stable site object

Before anything else, confirm that AI CMS has a stable object representing the publishing destination.

This might already be:

- `site`
- `client site`
- headless site config
- publishing destination

The integration must anchor on that object.

### Rule

If no such object currently exists, create one before implementing the DG intake flow.

DG must not connect to a user account.

---

## 2. Intake endpoint

Create a dedicated endpoint for DG brief intake.

### Endpoint

`POST /api/integrations/dg/article-briefs`

### Behaviour

1. verify bearer token
2. validate payload
3. verify `cms_site_id` exists and is allowed
4. check whether `request_id` already exists
5. if it exists, return the existing article record
6. if it does not exist, create a queued article job
7. return canonical success response
8. immediately or asynchronously send initial status webhook back to DG

---

## 3. Intake payload validation

Support the shared contract payload.

### Required fields

- `request_id`
- `dg_project_id`
- `cms_site_id`
- `brief_md`
- `language`

### Optional but expected

- `title`
- `primary_keyword`
- `secondary_keywords`
- `search_intent`
- `buyer_stage`
- `target_persona`
- `brand_tone`
- `country`
- `cta_goal`
- `requested_due_date`
- `suggested_sources`
- `metadata`

### Important

Use schema validation. Do not rely on loose object parsing.

---

## 4. Idempotency

Idempotency is mandatory.

### Rule

`request_id` must be unique for DG-originated article jobs.

If the same `request_id` is received again:

- do not create a second post or job
- return the existing `cms_article_id`
- return the current status

### Suggested persistence

Store the following on the post or a dedicated integration table:

- `request_id`, unique
- `dg_project_id`
- `dg_strategy_id`
- `dg_campaign_id`, nullable
- `cms_site_id`
- `source = dg`

---

## 5. Post creation model

Use the existing AI CMS editorial model.

### Recommended behaviour

When a valid brief arrives:

- create a post or article job in `queued` state
- attach the DG metadata
- store the original brief markdown
- map title and localisation fields as far as current CMS structure allows
- set the post to the target `site`
- let existing CMS generation or review flows pick it up

### Important

Do not bypass quality or review gates just because the source is DG.

DG-originated articles must still respect the AI CMS workflow.

---

## 6. Suggested data model changes

Use the smallest safe change that fits the current schema.

### Option A, add DG origin fields directly to post

- `source_system` string
- `source_request_id` string unique nullable
- `source_project_id` string nullable
- `source_strategy_id` string nullable
- `source_campaign_id` string nullable

### Option B, preferred if you want better separation

Create a table like `external_article_sources` or `dg_integration_records`.

Suggested fields:

- `id`
- `cms_article_id`
- `source_system`, fixed `dg`
- `request_id`, unique
- `dg_project_id`
- `dg_strategy_id`
- `dg_campaign_id`, nullable
- `cms_site_id`
- `last_webhook_status_sent`, nullable
- `last_webhook_sent_at`, nullable
- `created_at`
- `updated_at`

---

## 7. Outbound webhook to DG

Create a service for sending status changes back to DG.

### Endpoint on DG

`POST /api/integrations/ai-cms/article-status`

### Event type

`article.status_changed`

### Send webhook on these transitions

- brief accepted and queued
- moved to drafting
- moved to review
- approved
- scheduled
- published
- failed

### Payload fields

- `event_id`
- `event_type`
- `request_id`
- `dg_project_id`
- `dg_strategy_id`
- `dg_campaign_id`
- `cms_site_id`
- `cms_article_id`
- `status`
- `status_label`
- `article_admin_url`
- `published_url`
- `error_code`
- `error_message`
- `updated_at`

---

## 8. Status mapping

AI CMS may have richer internal states, but DG must only receive canonical shared statuses.

### Canonical outgoing statuses

- `queued`
- `drafting`
- `review`
- `approved`
- `scheduled`
- `published`
- `failed`

### Rule

If your internal status names differ, add a mapping layer. Do not leak internal-only statuses to DG.

---

## 9. Webhook retry logic

Add retry logic for DG webhooks.

### Rules

- retry on non-2xx
- up to 5 attempts
- use backoff
- log failure after final retry

### Suggested retry schedule

- 1 minute
- 5 minutes
- 15 minutes
- 1 hour
- 6 hours

---

## 10. Error handling

Support at least these error cases:

- invalid token
- missing `cms_site_id`
- unknown `cms_site_id`
- invalid payload
- duplicate `request_id`
- CMS post creation failure
- webhook delivery failure

### Rule

Persist relevant integration errors. Do not rely only on transient logs.

---

## 11. CMS UI metadata

In the CMS admin area, show useful source metadata on DG-originated article jobs.

### Minimum metadata

- source system = DG
- source request id
- DG project id
- target site id
- current sync status if useful

This is helpful for debugging and support.

---

## 12. Suggested implementation tasks

### Task 1
Confirm or formalise stable `site` object for publishing destination.

### Task 2
Create DG intake schema and endpoint.

### Task 3
Implement idempotent lookup by `request_id`.

### Task 4
Create queued article job or post from incoming brief.

### Task 5
Persist DG origin metadata.

### Task 6
Implement DG status webhook sender with retries.

### Task 7
Add useful DG source visibility in CMS admin.

### Task 8
Add tests for duplicate requests and status sync.

---

## Acceptance criteria

1. AI CMS accepts valid DG briefs at the agreed endpoint.
2. AI CMS rejects invalid or unmapped site requests safely.
3. AI CMS creates exactly one article job per unique `request_id`.
4. The created article is linked to the correct CMS site.
5. DG metadata is stored with the article or integration record.
6. AI CMS sends canonical status updates to DG.
7. Published articles send `published_url` back to DG.
8. Failed articles send `failed` plus useful error information.
9. Existing CMS article creation and publishing flows keep working.

---

## Guardrails

- Do not bypass the normal CMS review and publish flow
- Do not anchor integration on user id
- Do not hardcode site ids, client ids, or tokens
- Do not create duplicate articles for repeated `request_id`
- Do not invent a DG-only status model that differs from the shared contract
- Do not break existing CMS API routes and site behaviour

---

## Definition of done

Done means AI CMS can receive one real DG brief for one real mapped site, create one queued article job, push lifecycle updates back to DG, and publish normally without any manual database intervention.

