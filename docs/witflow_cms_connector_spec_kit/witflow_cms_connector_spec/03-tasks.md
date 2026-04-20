# Tasks

## Delivery rule

Complete phase 1 first. Do not start package extraction, CLI, or multi-framework support until phase 1 is working on a real site.

## Workstream 1, data model

### Task 1.1
Create migration for `site_integrations`.

Definition of done:
- table exists
- index on `client_id`
- partial unique active integration per client for phase 1
- timestamps and status fields included

### Task 1.2
Create types for `site_integrations`.

Definition of done:
- typed server-side model exists
- form model and DB model are separated if needed

### Task 1.3
Optional only if existing webhook log is not reusable
Create migration for `site_integration_events`.

Definition of done:
- test and live events can be stored with response metadata

## Workstream 2, internal connector core

### Task 2.1
Create `lib/connect/types.ts`.

Include:
- framework enum
- integration mode enum
- validation status enum
- generated kit types

Definition of done:
- all generator and delivery helpers use shared types

### Task 2.2
Create `lib/connect/schemas.ts`.

Include:
- webhook header schema
- webhook body schema
- test payload schema
- OpenAPI component schemas

Definition of done:
- schema source is central
- no duplicated payload shapes in route handlers

### Task 2.3
Create `lib/connect/delivery.ts`.

Responsibilities:
- build signed request body
- add webhook headers
- send POST
- capture response metadata
- support `test` and `live`

Definition of done:
- can deliver to a mocked endpoint
- supports legacy secret and HMAC

### Task 2.4
Create `lib/connect/resolver.ts`.

Responsibilities:
- resolve client integration
- choose legacy or connector path
- branch by integration mode

Definition of done:
- existing publish route can call resolver without big refactor

### Task 2.5
Create `lib/connect/validation.ts`.

Responsibilities:
- classify delivery result
- map status codes to simple admin messages

Definition of done:
- validation result includes status, code, body snippet, and display label

### Task 2.6
Create `lib/connect/openapi.ts`.

Responsibilities:
- generate OpenAPI JSON from current schemas and relevant endpoint metadata

Definition of done:
- returns valid JSON document for one connector profile

## Workstream 3, generator

### Task 3.1
Create generator folder structure.

Files:
- `lib/connect/generators/nextjs/readme.ts`
- `lib/connect/generators/nextjs/route-template.ts`
- `lib/connect/generators/nextjs/helper-template.ts`
- `lib/connect/generators/nextjs/env-template.ts`
- `lib/connect/generators/nextjs/next-config-template.ts`

Definition of done:
- one builder function returns all generated files

### Task 3.2
Generate Next.js route template.

Requirements:
- App Router style
- TypeScript
- `POST` handler
- raw body reading
- HMAC verification
- secret fallback support
- event switch for `post.published`, `post.updated`, `post.deleted`

Definition of done:
- generated route compiles in a plain Next.js app

### Task 3.3
Generate helper template.

Responsibilities:
- verify signature
- parse payload
- build revalidation paths
- fetch canonical post in `pull_sync` mode if needed

Definition of done:
- generated helper compiles and is used by route template

### Task 3.4
Generate environment template and next config snippet.

Definition of done:
- generated env keys match actual route/helper code
- generated next config snippet supports remote images

### Task 3.5
Generate README template.

Include:
- where to place files
- env setup
- how to deploy
- how to run curl test
- expected success response
- common errors

Definition of done:
- no prose fluff
- exact copy and paste instructions only

## Workstream 4, admin API

### Task 4.1
Create `POST /api/admin/site-integrations`.

Definition of done:
- admin can create connector profile

### Task 4.2
Create `PATCH /api/admin/site-integrations/[id]`.

Definition of done:
- admin can edit connector profile

### Task 4.3
Create `POST /api/admin/site-integrations/[id]/generate-kit`.

Response:
- generated file list
- summary
- copy blocks
- optional zip later

Definition of done:
- generator output is available to UI

### Task 4.4
Create `POST /api/admin/site-integrations/[id]/test`.

Definition of done:
- sends signed test payload to target webhook
- stores result
- returns simplified status for UI

### Task 4.5
Create `GET /api/admin/site-integrations/[id]/openapi`.

Definition of done:
- returns JSON
- includes webhook examples and auth info

### Task 4.6
Create `GET /api/admin/site-integrations/[id]/webhook-schema`.

Definition of done:
- returns JSON schema for webhook body

## Workstream 5, admin UI

### Task 5.1
Add connector profile section to existing admin/client page.

Fields:
- name
- framework
- integration mode
- webhook URL
- blog index path
- blog post path pattern
- locale mode
- revalidation strategy

Definition of done:
- admin can create and save profile from UI

### Task 5.2
Add secret management UI.

Actions:
- generate secret
- regenerate secret
- copy secret

Definition of done:
- secret flow is clear and safe

### Task 5.3
Add generated kit panel.

Actions:
- generate files
- copy file contents
- copy env block
- copy curl test

Definition of done:
- admin can hand exact artefacts to a developer or Cursor

### Task 5.4
Add validation panel.

Actions:
- send test
- show latest result
- show ready status

Definition of done:
- admin can see whether the target site is truly ready

### Task 5.5
Add advanced contract panel.

Actions:
- view OpenAPI JSON
- view webhook schema JSON

Definition of done:
- AI-agent-friendly contract is available in UI

## Workstream 6, publish flow integration

### Task 6.1
Update existing publish route to call connector resolver.

Definition of done:
- if no active profile exists, current behaviour is unchanged
- if active profile exists, integration mode is applied

### Task 6.2
Update scheduler / autopublish path if needed.

Definition of done:
- autopublish still works with active connector profile

### Task 6.3
Reuse current webhook payload builder where possible.

Definition of done:
- no duplicate payload assembly logic unless required by mode differences

## Workstream 7, missing CMS API support

### Task 7.1
Audit existing `/api/v1/sites/[siteId]/...` read endpoints.

Definition of done:
- document what already exists
- document what `pull_sync` still needs

### Task 7.2
Only if needed, add missing read endpoint(s).

Examples:
- post by id
- post by slug
- locale-aware published post lookup

Definition of done:
- `pull_sync` generated kit can fetch canonical published post cleanly

## Workstream 8, tests

### Task 8.1
Add unit tests for signing and verification.

Definition of done:
- valid signature passes
- invalid signature fails
- legacy secret fallback works

### Task 8.2
Add unit tests for generator output.

Definition of done:
- generated file paths are correct
- output contains required env vars
- mode-specific code is present

### Task 8.3
Add integration test for test delivery route.

Definition of done:
- mocked target endpoint receives signed test event
- result classification is correct

### Task 8.4
Add regression test for legacy publish path.

Definition of done:
- current webhook-only client still works

### Task 8.5
Manual test on a real Next.js site.

Definition of done:
- generated kit is copied into site
- env vars set
- test passes
- live publish revalidates content

## Workstream 9, polish

### Task 9.1
Add basic metrics tracking.

Track:
- generated kit count
- test pass count
- test fail count

Definition of done:
- internal visibility exists

### Task 9.2
Add download as zip if easy and low-risk.

Definition of done:
- admin can download generated kit as archive
- only do this after copy flow works

## Release checklist

- migration applied
- no publish regressions
- one real site validated
- UI copy checked
- all generator outputs reviewed
- internal team can use without external note-taking
