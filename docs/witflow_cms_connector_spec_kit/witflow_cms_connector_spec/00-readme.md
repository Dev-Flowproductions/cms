# WitFlow CMS connector spec kit

This spec kit defines how to turn the current CMS website connection flow into a productised integration layer.

Today, each website developer or AI agent reads webhook documentation and then implements a custom route by hand. The new goal is to replace documentation-led integration with generated, executable integration kits.

This kit is split into four working documents:

1. `01-specify.md`
2. `02-plan.md`
3. `03-tasks.md`
4. `04-guardrails.md`

## Delivery principle

Build this as an extension of the current CMS, not as a rewrite.

The current CMS already has:
- a publish flow
- structured webhooks
- a headless CMS API
- multi-tenant client handling

The connector layer must reuse those primitives.

## Target outcome

For the most common case, a Next.js website developer should be able to copy generated files into the site, set a few environment variables, deploy, and connect the site in minutes rather than hours.

## Phased rollout

### Phase 1, must ship first
- Connector profiles inside CMS
- Generated Next.js integration kit
- Machine-readable webhook schema
- Test and validation flow
- Pull-first integration mode using existing CMS API where possible
- Full backward compatibility with current webhook publishing

### Phase 2
- Internal reusable connector runtime inside the CMS repo
- Downloadable zip kits
- More framework templates
- Public integration manifest endpoint

### Phase 3
- Extract reusable package and CLI
- Optional Vercel starter / deploy flow

## Important architecture decision

Do not make full webhook payload push the preferred model for new integrations.

Keep existing webhook payload support for backward compatibility, but treat it as legacy-compatible.

For new integrations, prefer:
1. CMS publishes post
2. CMS sends signed event to site webhook
3. Site validates request
4. Site revalidates or runs a sync
5. Site pulls canonical content from the CMS API

This reduces custom parsing, makes retries simpler, and keeps the CMS as the source of truth.
