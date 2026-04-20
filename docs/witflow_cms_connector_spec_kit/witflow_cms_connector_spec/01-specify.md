# Specify

## Feature name

WitFlow CMS connector layer

## Problem

The current CMS can publish content to client websites, but every website connection still depends on documentation and custom implementation by a developer or AI agent.

That creates five problems:

1. Integration time is too slow
2. Each site implements the same logic differently
3. AI agents have to interpret prose instead of following executable patterns
4. Support cost rises with every new website
5. The CMS already has the right primitives, but they are not packaged as a product

## Current state

The CMS already includes:
- publish webhooks
- a headless CMS API
- multi-tenant client configuration
- publish and scheduler flows
- localisation and post models

The external site documentation currently expects the receiving site to:
- expose a POST endpoint
- validate secret or HMAC signature
- return 2xx
- revalidate pages or store content
- configure remote image handling when using Next.js

That means the current architecture is viable, but not productised.

## Goal

Create a connector layer inside the CMS that turns website integration into a generated, guided, testable flow.

## Primary users

### User 1, CMS admin / internal team
Needs to connect a client site quickly without rewriting instructions each time.

### User 2, website developer
Needs code that can be copied with minimal thinking.

### User 3, website dev AI agent
Needs exact files, exact environment variables, exact routes, exact payloads, and exact tests.

## Success criteria

### Business success
- Reduce time to first working website connection to under 15 minutes for standard Next.js sites
- Reduce repeated support questions around webhook setup
- Make integrations feel like a product capability, not a consulting task

### Product success
- A Next.js integration kit can be generated from the CMS UI
- A generated kit includes route file, helper file, env template, next.config snippet, and test command
- CMS can validate a configured integration before live publishing
- Existing clients continue to publish with no regression

### Technical success
- Existing `POST /api/publish/[postId]` keeps working
- Existing webhook payload contract remains supported
- New integrations can use revalidate or pull-sync mode
- Generated examples remain framework-specific and machine-readable

## Non-goals for phase 1
- Do not build a universal connector for every framework on day one
- Do not refactor the whole publish system
- Do not remove legacy webhook behaviour
- Do not build a full npm package first
- Do not build a public marketplace

## Product principles

1. Generated beats documented
2. Pull-first beats push-full for new builds
3. Backward compatibility is mandatory
4. One clear happy path beats many clever options
5. AI agents must receive exact implementation artefacts, not vague instructions

## Proposed MVP scope

### 1. Connector profile model
Add a first-class site integration record linked to a CMS client.

Each profile stores:
- id
- client_id
- name
- framework
- hosting_provider
- integration_mode
- webhook_url
- webhook_secret
- api_token or site token reference
- blog_index_path
- blog_post_path_pattern
- locale_mode
- revalidation_strategy
- image_host_mode
- status
- last_validation_at
- created_at
- updated_at

### 2. Generated integration kit
The CMS UI generates a framework-specific kit for the selected connector profile.

MVP framework:
- Next.js App Router on Vercel

Generated files:
- `README.md`
- `app/api/cms-webhook/route.ts`
- `lib/witflow-cms.ts`
- `.env.example`
- `next.config` snippet
- `curl` test example
- sample success response

### 3. Integration modes
Support these modes in the data model:

- `legacy_push_full`
- `revalidate_only`
- `pull_sync`

Behaviour:
- `legacy_push_full`: current behaviour, payload contains full post data and site may render/store it
- `revalidate_only`: webhook only signals post event, site revalidates pages and fetches content normally
- `pull_sync`: site validates event and actively fetches canonical post data from CMS API

For new generated kits, default to `pull_sync`.

### 4. Machine-readable contract
Expose and store:
- JSON schema for webhook payloads
- OpenAPI document for relevant read endpoints and webhook examples

This is needed for AI agents and future SDK/CLI work.

### 5. Validation flow
The CMS UI must support:
- generate secret
- show exact expected webhook URL
- send test payload
- show last response code and body
- verify endpoint reachability
- confirm whether integration is ready

### 6. Reuse existing CMS API
Do not invent a second content API.

Use the current site-scoped CMS API wherever possible.
Only add missing read endpoints if the current API does not expose enough data for `pull_sync`.

## User stories

### Story 1
As a CMS admin, I want to create a site integration profile for a client, so that the website connection is stored as structured product data.

### Story 2
As a CMS admin, I want to generate a Next.js integration kit, so that I can send exact files to a developer or Cursor.

### Story 3
As a website developer, I want to copy the generated files and set env values, so that I do not have to interpret long documentation.

### Story 4
As a website dev AI agent, I want a machine-readable webhook schema and exact file outputs, so that I can implement the connection deterministically.

### Story 5
As a CMS admin, I want to test the integration before publishing live content, so that I can detect wrong routes, wrong secrets, and broken site responses.

### Story 6
As a product team, we want to preserve current publishing for existing clients, so that this feature does not break working flows.

## Acceptance criteria

### Functional
- Admin can create, edit, and disable a connector profile
- Admin can generate a Next.js integration kit from that profile
- Admin can copy or download the generated kit
- Admin can trigger a test delivery from the CMS
- Test delivery stores response status and metadata
- Publish flow can route through connector profile if present
- Existing legacy webhook config still works if no connector profile is active

### Technical
- Generated route validates webhook requests with secret and HMAC
- Generated route supports `post.published`, `post.updated`, and `post.deleted`
- Generated route supports revalidation of blog index and blog post pages
- Generated helper supports pull-sync from CMS API
- OpenAPI and JSON schema artefacts are versioned
- No working current publish flow is removed

### UX
- UI uses simple labels and avoids technical overload
- Happy path can be followed without reading an external document
- Generated code is concise and production-safe

## Data model proposal

### New table: `site_integrations`

Columns:
- `id uuid primary key`
- `client_id uuid not null`
- `name text not null`
- `framework text not null`
- `hosting_provider text null`
- `integration_mode text not null`
- `webhook_url text null`
- `webhook_secret text null`
- `api_token_hash text null`
- `blog_index_path text default '/blog'`
- `blog_post_path_pattern text default '/blog/[slug]'`
- `locale_mode text default 'none'`
- `revalidation_strategy text default 'path'`
- `image_host_mode text default 'explicit'`
- `is_active boolean default true`
- `last_validation_status text null`
- `last_validation_code integer null`
- `last_validation_body text null`
- `last_validation_at timestamptz null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Indexes:
- index on `client_id`
- unique partial index on `(client_id)` where `is_active = true` for phase 1

### Optional new table: `site_integration_events`
Use only if current webhook logging is not suitable.

Columns:
- `id uuid primary key`
- `site_integration_id uuid not null`
- `kind text not null` (`test`, `live`, `validation`)
- `event text not null`
- `request_payload jsonb not null`
- `response_status integer null`
- `response_body text null`
- `success boolean not null default false`
- `created_at timestamptz not null default now()`

## API proposal

### Internal admin routes
- `POST /api/admin/site-integrations`
- `PATCH /api/admin/site-integrations/[id]`
- `POST /api/admin/site-integrations/[id]/generate-kit`
- `POST /api/admin/site-integrations/[id]/test`
- `GET /api/admin/site-integrations/[id]/openapi`
- `GET /api/admin/site-integrations/[id]/webhook-schema`

### Publish flow integration
Existing:
- `POST /api/publish/[postId]`

Required behaviour:
- if active `site_integrations` exists for the client, use its mode and configuration
- else keep current legacy path

### Optional phase 2 public helper route
- `GET /api/v1/sites/[siteId]/integration-manifest`

This should not be phase 1 mandatory.

## Generated Next.js kit contract

### Files
- `app/api/cms-webhook/route.ts`
- `lib/witflow-cms.ts`
- `.env.example`
- `README.md`

### Required environment variables
- `CMS_WEBHOOK_SECRET`
- `CMS_SITE_ID`
- `CMS_API_BASE_URL`
- `CMS_API_TOKEN`
- `CMS_BLOG_INDEX_PATH`
- `CMS_BLOG_POST_PATH_PATTERN`

### Required route behaviour
- accept `POST`
- read raw body
- verify HMAC or legacy secret
- parse event
- on published/updated/deleted, revalidate blog paths
- in `pull_sync` mode, fetch post from CMS API if needed
- return 200 or 204 on success
- return 401 on invalid auth
- return 405 on unsupported methods if applicable

## OpenAPI scope

The OpenAPI output does not need to cover the whole CMS.

For phase 1 it only needs:
- relevant site read endpoints
- auth headers
- webhook example payloads
- response examples
- schema version

## Reporting

Track at minimum:
- number of generated kits
- number of test deliveries
- pass / fail rate
- average time from profile creation to first successful validation

## Risks

### Risk 1
Trying to build SDK, CLI, UI wizard, public manifest, and multi-framework support all at once.

Mitigation:
Ship Next.js-only MVP first.

### Risk 2
Breaking live publishing while adding new routing logic.

Mitigation:
Keep current publish flow and legacy config as fallback path.

### Risk 3
Creating a generated kit that is still too generic.

Mitigation:
Generate framework-specific files with real paths and env names.

### Risk 4
Adding too many new APIs before checking what the current CMS API already supports.

Mitigation:
Audit current `/api/v1/sites/[siteId]/...` endpoints first, then add only missing endpoints.

## Definition of success

A user can go from:
- creating a connector profile
- generating a kit
- giving it to Cursor or a developer
- testing the webhook
- validating the site
- publishing content live

without needing a custom integration document.
