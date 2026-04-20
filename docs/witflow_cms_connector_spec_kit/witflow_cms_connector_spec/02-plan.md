# Plan

## Planning summary

Build a connector layer inside the existing CMS repo.

Do not start with a separate package. Do not start with a CLI. Do not restructure the whole publish system.

The first release should be a thin, practical layer on top of the current publish webhook and existing CMS API.

## Existing architecture constraints

The CMS already uses:
- Next.js App Router
- Supabase
- multi-tenant clients
- `POST /api/publish/[postId]`
- `/api/v1/sites/[siteId]/...` headless read endpoints
- webhook payload builders

The connector work must fit naturally into this architecture.

## Implementation strategy

### Phase 1, in-repo MVP
Goal: make integration generation and validation real inside the current CMS.

Deliver:
- new `site_integrations` table
- admin UI section
- Next.js kit generator
- schema/OpenAPI generation
- test delivery action
- publish flow support for integration modes

### Phase 2, internal runtime extraction
Goal: stop repeating generated logic inside templates.

Deliver:
- internal shared runtime used by the template generator
- tighter typing between payload schema and generator
- zip download support
- additional templates if needed

### Phase 3, external productisation
Goal: reusable package and optional CLI.

Deliver:
- extract shared runtime to package
- optional `npx` init flow
- optional Vercel starter

## Architecture decisions

## 1. Use pull-first for new integrations
Reason:
This keeps content canonical in the CMS and reduces custom ingestion logic on client websites.

Implication:
New generated Next.js kits should default to:
- validate webhook
- revalidate paths
- optionally fetch canonical post data from CMS API

Do not remove legacy full payload support.

## 2. Keep current publish route as the orchestrator
Reason:
The current CMS already publishes from `POST /api/publish/[postId]`.

Implication:
Do not create a second publish path.
Instead, add a connector resolver layer inside the existing publish logic.

Suggested flow:
1. Resolve client from post
2. Resolve active `site_integrations` record
3. If no active integration, use current legacy webhook behaviour
4. If active integration exists, branch by `integration_mode`
5. Send live or test event using shared delivery helper

## 3. Generate code from typed templates
Reason:
The real value is not another doc. It is exact files.

Implication:
Use template builders that take a connector profile and return strings for:
- route file
- helper file
- env file
- README
- test command

Do not hardcode snippets in JSX.

## 4. Prefer schema-first payload handling
Reason:
Webhook payloads and site read endpoints need to be understandable by humans and AI agents.

Implication:
Create central schema definitions and use them for:
- webhook validation
- OpenAPI examples
- generator output
- test payloads

## 5. Reuse current CMS API
Reason:
The CMS already has site-scoped read endpoints.

Implication:
Audit current endpoints first.
Only add missing routes if `pull_sync` needs additional post lookup or locale-specific fetches.

## Repo structure proposal

Add these folders inside the current CMS repo:

```text
app/
  api/
    admin/
      site-integrations/
        route.ts
        [id]/
          route.ts
          generate-kit/
            route.ts
          test/
            route.ts
          openapi/
            route.ts
          webhook-schema/
            route.ts

components/
  admin/
    site-integrations/
      site-integration-form.tsx
      site-integration-card.tsx
      generated-kit-panel.tsx
      validation-panel.tsx

lib/
  connect/
    types.ts
    schemas.ts
    defaults.ts
    resolver.ts
    delivery.ts
    validation.ts
    openapi.ts
    generators/
      nextjs/
        readme.ts
        route-template.ts
        helper-template.ts
        env-template.ts
        next-config-template.ts
```

If there is already an admin client detail page, place the UI there rather than inventing a new navigation surface.

## Database migration plan

### Migration 1
Create `site_integrations`.

### Migration 2
Optional only if needed, create `site_integration_events`.

### Migration 3
Backfill helper:
- for any client that already has webhook config, create no automatic migration to active profile unless clearly safe
- simpler and safer: leave existing clients on legacy behaviour until a connector profile is manually created

This avoids silent publishing changes.

## Publish resolver plan

Create `lib/connect/resolver.ts` with something like:

- `getActiveSiteIntegrationForClient(clientId)`
- `resolvePublishMode({ clientId })`

Modes:
- `legacy`
- `integration`

For `integration`:
- branch on `integration_mode`
- call shared delivery function

Shared delivery helper should:
- build headers
- sign body
- support test and live events
- store response metadata

## Generator plan

### Input
- connector profile
- CMS base URL
- site ID
- example paths
- framework

### Output
An object:

```ts
type GeneratedKit = {
  files: Array<{ path: string; content: string }>
  summary: {
    framework: string
    integrationMode: string
    envKeys: string[]
    testCommand: string
  }
}
```

### Templates for phase 1
Only generate for:
- Next.js App Router
- TypeScript
- Vercel-friendly defaults

### Generated route expectations
- uses `POST`
- reads raw request body
- verifies HMAC and legacy secret
- parses event safely
- revalidates blog paths
- can fetch from CMS API for `pull_sync`
- returns JSON success result

## Validation flow plan

### Reachability check
This is not the same as a live publish.

Validation action should:
1. build a test payload
2. send signed POST to configured webhook URL
3. capture status and response body
4. classify result:
   - success
   - auth failure
   - not found
   - method mismatch
   - server error
   - network failure

### UI messaging
Keep labels simple:
- Ready
- Needs secret fix
- Endpoint not found
- Server error
- Last test passed
- Last test failed

## OpenAPI plan

Use one internal builder that returns an OpenAPI document for:
- required CMS site read endpoints
- auth scheme
- webhook example bodies
- common response examples

Return JSON from:
- `GET /api/admin/site-integrations/[id]/openapi`

This should be enough for Cursor and future tooling.

## Security plan

### Secrets
- store generated webhook secret securely in DB
- never expose hashed tokens only if tokens are used for pull mode
- if a plain token must be shown, only show it once on creation or via explicit regenerate flow

### HMAC
Use the same signing contract as current webhook delivery.
Do not invent a new signature scheme.

### Access
Admin-only routes for generator, schema, and test actions.

## UI plan

Add the feature to the existing admin/client area.

### Section 1
Connector profile
- framework
- mode
- webhook URL
- paths
- secret management

### Section 2
Generated kit
- copy files
- copy env block
- copy curl test
- download all

### Section 3
Validation
- send test
- show latest result
- show ready status

### Section 4
Advanced
- OpenAPI JSON
- webhook schema JSON

## Testing plan

### Unit
- schema generation
- HMAC signing
- generator output
- path interpolation
- resolver mode selection

### Integration
- create connector profile
- generate Next.js kit
- run test against mocked endpoint
- publish through existing route with connector profile
- legacy client still publishes normally

### Regression
- scheduler autopublish still works
- current webhook clients still receive payloads
- current CMS API routes unchanged

## Rollout plan

### Step 1
Ship database + internal helpers behind no UI.

### Step 2
Ship admin UI and generator for internal use.

### Step 3
Test on one internal or low-risk client Next.js site.

### Step 4
Enable as preferred path for new Next.js client sites.

### Step 5
After stability, consider extracting shared runtime and CLI.

## Trade-offs

### Why not build CLI first
Because the missing value is inside the CMS workflow itself. A CLI without CMS-managed profiles still leaves the team juggling secrets, routes, and validation manually.

### Why not replace webhooks with polling
Because event-driven revalidation is still valuable. The problem is not webhooks. The problem is manual integration.

### Why not support WordPress immediately
Because framework breadth will slow delivery and produce weaker templates. One strong Next.js path first is the right move.

## Definition of done

Phase 1 is done when:
- admin can create connector profile
- admin can generate Next.js kit
- admin can send test delivery
- admin can see validation result
- publish route supports connector profile without breaking legacy mode
- one real Next.js site is connected using the generated kit
