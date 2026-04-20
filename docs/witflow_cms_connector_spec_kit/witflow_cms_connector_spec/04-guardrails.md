# Guardrails

## Non-negotiables

1. Do not break any current working publish flow
2. Do not remove legacy webhook support
3. Do not invent a second CMS content API if the current one is sufficient
4. Do not hardcode client IDs, site IDs, URLs, or secrets
5. Do not move fast by creating hidden technical debt in the publish path
6. Do not widen scope to many frameworks before Next.js works properly
7. Do not replace exact generated artefacts with more documentation

## Scope guardrails

### In scope for phase 1
- connector profile model
- Next.js integration kit generation
- schema/OpenAPI output
- test delivery and validation
- publish resolver integration
- minimal missing CMS API support for pull-sync

### Out of scope for phase 1
- npm package extraction
- CLI
- WordPress template
- Astro template
- Nuxt template
- Vercel deploy button flow
- public integration marketplace
- full partner portal

## Architecture guardrails

### 1. Extend, do not rewrite
The current CMS already has:
- publish route
- webhook payload logic
- site-scoped API
- multi-tenant client handling

Work with those.

### 2. Prefer thin layers
Add a connector resolver and generator layer.
Do not refactor half the repo.

### 3. Keep source of truth clear
For new integrations, the CMS remains the source of truth for post content.
Do not make client sites the primary content store unless that is explicitly required later.

### 4. Keep contracts typed
Payloads, headers, and generated files should come from shared typed schema definitions.
Do not duplicate shapes across UI, routes, and generator templates.

### 5. Keep generated output deterministic
Given the same connector profile, generator output should be stable.
Do not include random variations in code generation.

## UI guardrails

- Use simple language
- No long explanatory essays in the UI
- Prioritise copy buttons and exact outputs
- Show validation clearly
- Show errors in plain English

## Security guardrails

- Never expose server-only keys to client code
- Never log secrets in plain text in browser-visible output
- If API tokens are used, store hashes where possible
- Use constant-time comparison for signature checks
- Keep admin-only actions protected

## Testing guardrails

- No release without regression testing on legacy publish path
- No release without one real Next.js site validation
- No release if scheduler/autopublish is untested

## Code quality guardrails

- Keep new code isolated under `lib/connect` and related admin routes/components
- Avoid touching unrelated generation, scoring, or onboarding logic
- Reuse existing helpers before introducing new abstractions
- Use clear file names and small modules

## Product guardrails

The purpose of this feature is to make integration faster, more productised, and easier for AI agents.

If a proposed change:
- adds more manual interpretation
- increases custom per-site work
- makes generated output less exact
- or risks current publishing stability

then it is the wrong change.

## Final rule

The generated integration kit must become the default way a human developer or Cursor implements a website connection for the CMS.

If the team still has to write a custom explanation for each new site, this feature has failed.
