# Spec kit, headless blog integration for SEO-native websites

## Purpose

This spec defines how to connect the CMS app to client websites so each website can expose a native, SEO-ready blog under its own domain and path structure, such as `/blog` and `/blog/[slug]`, while keeping the CMS and website as separate applications.

The goal is speed, repeatability, and strong SEO performance. The CMS remains the content engine. The website remains the presentation layer. The blog must render as native pages on the website domain, not as an iframe, subdomain dependency, or external hosted experience.

## Core objective

Enable any new website, starting with Next.js websites, to activate a blog quickly by connecting to the CMS through a standard integration layer.

Expected result:

- Website homepage remains independent
- Blog lives inside the website URL structure
- CMS manages article content, SEO fields, and publishing state
- Website renders `/blog` and `/blog/[slug]` as native pages
- Search engines index content as part of the client domain
- Publishing and updates propagate quickly through webhook-based revalidation

## Non-negotiable requirements

### Business requirements

- The CMS and website must remain separate apps
- New client websites must be able to activate blog functionality quickly
- The integration must be reusable across multiple websites
- The first production-ready implementation must target Next.js websites
- The solution must support future expansion to other frameworks, but not at the cost of overengineering the first release

### SEO requirements

- Blog pages must live on the website's own domain and routes
- Blog index route must be `/blog`
- Blog article route must be `/blog/[slug]`
- Pages must be server-rendered or statically generated with revalidation
- Each page must expose proper metadata, canonical URL, and Open Graph data
- Articles must be crawlable as native HTML pages
- Blog URLs must be included in the website sitemap
- Internal linking must support SEO best practices
- Structured data should be included where relevant

### Technical requirements

- CMS must expose a stable content API
- Website must consume CMS content without direct database coupling
- Website must support webhook-triggered revalidation after publish, update, and unpublish events
- Multi-tenant separation must exist at CMS level
- Authentication between website and CMS must be secure
- Webhook communication must be signed and validated
- Failures in one website must not break the CMS or other websites

## Architecture decision

### Chosen approach

Build a headless blog integration with three layers:

1. CMS content API
2. Website-side native route module for Next.js
3. CMS-to-website webhook flow for revalidation

This is not a WordPress-style plugin in the first phase.

This is also not an embedded blog experience.

The website must render the blog natively under its own route structure using content fetched from the CMS.

### Why this approach

- Preserves SEO value on the client domain
- Keeps CMS and website decoupled
- Avoids creating framework-specific plugin chaos too early
- Enables a repeatable installation process
- Supports fast rollout to new client websites
- Fits well with Next.js server rendering and incremental revalidation

## High-level system design

### CMS responsibilities

The CMS is responsible for:

- storing blog content
- storing SEO metadata
- storing publish state
- exposing content by API
- separating content by website or tenant
- sending webhook events when content changes

### Website responsibilities

The website is responsible for:

- rendering `/blog`
- rendering `/blog/[slug]`
- styling and layout
- metadata rendering
- structured data output
- sitemap inclusion
- webhook endpoint for revalidation
- optional content caching on the website side

### What the CMS should not own

The CMS should not own:

- website layout
- front-end design system
- route ownership on the website
- full page composition beyond content fields

### What the website should not own

The website should not own:

- authoring logic
- editorial workflow
- publish state management
- the source-of-truth content database

## Content and tenancy model

Each client website must be represented as a separate site record in the CMS.

### CMS entities

#### Site

Represents one website connected to the CMS.

Suggested fields:

- `id`
- `name`
- `domain`
- `blogBasePath`, default `/blog`
- `apiKeyHash` or equivalent auth reference
- `webhookUrl`
- `webhookSecret`
- `status`
- `createdAt`
- `updatedAt`

#### Post

Suggested fields:

- `id`
- `siteId`
- `title`
- `slug`
- `excerpt`
- `content`, rich structured body or markdown source
- `coverImageUrl`
- `coverImageAlt`
- `authorId`
- `categoryIds`
- `tagIds`
- `seoTitle`
- `seoDescription`
- `canonicalUrl`, optional override
- `ogImageUrl`
- `schemaType`, optional
- `status`, draft, scheduled, published, archived
- `publishedAt`
- `updatedAt`

#### Author

Suggested fields:

- `id`
- `siteId` or global ownership rule
- `name`
- `slug`
- `bio`
- `avatarUrl`

#### Category

Suggested fields:

- `id`
- `siteId`
- `name`
- `slug`
- `description`

#### Tag

Suggested fields:

- `id`
- `siteId`
- `name`
- `slug`

## CMS API specification

The CMS must expose a versioned API. Use REST for speed unless there is a strong reason for GraphQL.

Recommended prefix:

- `/api/v1`

### Authentication

Use server-to-server authentication.

Preferred pattern:

- website stores `CMS_API_KEY`
- API key is scoped to one `siteId`
- CMS validates that requests only access that site's content

Never expose secret CMS keys directly to client-side browser code.

Use server-side fetches from Next.js.

### Endpoints

#### Get blog index posts

`GET /api/v1/sites/{siteId}/posts`

Query params:

- `status=published`
- `page`
- `limit`
- `category`
- `tag`
- `search`, optional
- `sort`, default newest first

Response should include:

- posts array
- pagination info

#### Get single post by slug

`GET /api/v1/sites/{siteId}/posts/{slug}`

Returns full post data required to render the article page.

#### Get categories

`GET /api/v1/sites/{siteId}/categories`

#### Get authors

`GET /api/v1/sites/{siteId}/authors`

#### Get sitemap post list

`GET /api/v1/sites/{siteId}/sitemap`

Returns lightweight URL records for sitemap generation.

Suggested fields:

- `slug`
- `updatedAt`
- `publishedAt`

#### Optional preview endpoint

`GET /api/v1/sites/{siteId}/posts/{slug}/preview`

Only if preview workflow is needed later.

## CMS response contract guidelines

### Blog index item must include

- `id`
- `title`
- `slug`
- `excerpt`
- `coverImageUrl`
- `coverImageAlt`
- `publishedAt`
- `updatedAt`
- `author`
- `categories`
- `seoTitle`, optional fallback logic allowed server-side in CMS only if clearly defined

### Single post must include

- all index fields
- full content body
- `seoTitle`
- `seoDescription`
- `canonicalUrl`, optional
- `ogImageUrl`
- structured data inputs if needed

### Content body format

Choose one of these and standardise it:

- markdown with frontmatter-derived fields
- portable rich-text JSON
- HTML generated by CMS

Recommendation:

Use structured rich content or markdown source, then render safely on the website.

Do not return unsafe raw HTML without sanitisation strategy.

## Next.js website implementation

The website must render blog pages natively.

### Required routes

Using App Router:

- `app/blog/page.tsx`
- `app/blog/[slug]/page.tsx`

Optional later:

- `app/blog/category/[slug]/page.tsx`
- `app/blog/tag/[slug]/page.tsx`

### Route behaviour

#### `/blog`

Must:

- fetch published posts for the current site
- render a paginated or limited blog index
- include SEO metadata for the blog landing page
- support internal links to article pages

#### `/blog/[slug]`

Must:

- fetch the post by slug from CMS
- return 404 if post not found or not published
- render article content server-side
- output metadata dynamically
- output structured data if enabled

### Rendering mode

Use one of these approaches:

- static generation with revalidation
- server-side rendering with caching

Recommended for marketing websites:

- static generation where reasonable
- revalidation on CMS webhook events

### Metadata handling

For each article page, generate:

- title
- meta description
- canonical URL
- Open Graph title
- Open Graph description
- Open Graph image
- article published time
- article modified time

Where supported, use Next.js metadata APIs.

### Sitemap integration

Website sitemap must include blog URLs.

Approach:

- website queries CMS sitemap endpoint
- merges CMS post URLs into its own sitemap generation

### Structured data

At minimum support `Article` schema when relevant.

Suggested fields:

- headline
- description
- image
- author
- datePublished
- dateModified
- mainEntityOfPage
- publisher if available

### Internal linking

Article pages should support:

- breadcrumb to blog index
- related articles, optional phase 2
- category links, optional phase 2

## Webhook and revalidation design

### Goal

When a post is published, updated, or unpublished in CMS, the website must refresh the affected blog pages without a full redeploy.

### Event types

CMS should send at least:

- `post.published`
- `post.updated`
- `post.unpublished`
- `post.deleted`, optional if distinct from unpublish

### Website endpoint

Add a secure endpoint on each website, for example:

- `POST /api/cms/revalidate`

This endpoint must:

- verify webhook signature
- parse event payload
- determine affected routes
- revalidate `/blog`
- revalidate `/blog/[slug]` for the affected article
- optionally revalidate category pages in later phases

### Webhook payload example

```json
{
  "event": "post.updated",
  "siteId": "site_123",
  "post": {
    "id": "post_456",
    "slug": "how-to-improve-aeo",
    "status": "published",
    "updatedAt": "2026-03-16T12:00:00Z"
  },
  "timestamp": "2026-03-16T12:00:05Z",
  "signatureVersion": "v1"
}
```

### Webhook security

Use HMAC signature validation.

Recommended headers:

- `x-cms-signature`
- `x-cms-timestamp`
- `x-cms-event`

The website must reject requests with:

- invalid signature
- stale timestamp
- unknown event type
- wrong site identifier

## Security requirements

- CMS API must require server-side auth
- Website must never expose secret CMS credentials in public client bundles
- Webhook secrets must be unique per site
- Rate limiting should exist at CMS API gateway where possible
- CMS responses must be scoped to authorised site only
- Logging must avoid secret leakage

## Caching strategy

### CMS side

- support cache-friendly response headers if possible
- keep published content fast to fetch

### Website side

- use Next.js caching and revalidation
- ensure publish/update flows invalidate cache quickly
- avoid stale article pages after publish for too long

## Error handling requirements

### Website behaviour

If CMS is temporarily unavailable:

- blog index may show fallback error state or cached content
- article route should fail gracefully
- existing statically generated pages should continue serving if possible

### CMS behaviour

- invalid site access must return 403 or 404 as appropriate
- missing content returns 404
- malformed requests return 400

## Installation flow for a new website

This must become the standard internal process.

### Step 1

Create a site in CMS with:

- domain
- blog base path, default `/blog`
- webhook URL
- webhook secret
- API credentials

### Step 2

Add website environment variables:

- `CMS_API_BASE_URL`
- `CMS_SITE_ID`
- `CMS_API_KEY`
- `CMS_WEBHOOK_SECRET`

### Step 3

Install or copy the reusable Next.js blog module

This module should include:

- blog index page
- blog article page
- CMS fetch helpers
- metadata helpers
- webhook revalidation endpoint
- sitemap integration helper

### Step 4

Connect website deployment environment and confirm:

- `/blog` loads
- article route loads
- sitemap contains blog URLs
- webhook revalidation works

## Reusable module requirements

A reusable internal package or starter module should be created for Next.js.

Suggested module responsibilities:

- `getPosts()`
- `getPostBySlug(slug)`
- `getCategories()`
- `getSitemapEntries()`
- metadata mapping utilities
- content rendering utilities
- webhook verification helper

This should reduce setup time for new websites.

## Suggested folder structure for Next.js websites

```text
app/
  blog/
    page.tsx
    [slug]/
      page.tsx
  api/
    cms/
      revalidate/
        route.ts
lib/
  cms/
    client.ts
    posts.ts
    metadata.ts
    webhooks.ts
    types.ts
```

## Suggested folder structure for CMS app

```text
src/
  modules/
    sites/
    posts/
    authors/
    categories/
    tags/
    webhooks/
  api/
    v1/
      sites/
        [siteId]/
          posts/
          categories/
          authors/
          sitemap/
```

## Acceptance criteria

The first version is complete only when all criteria below pass.

### CMS acceptance criteria

- site-based content isolation works
- published posts can be fetched by site and slug
- API responses include required SEO fields
- sitemap endpoint returns published blog URLs only
- webhook sender works on publish and update events
- webhook signatures are valid and documented

### Website acceptance criteria

- `/blog` renders native blog index under site domain
- `/blog/[slug]` renders native article page under site domain
- article page metadata is correct
- article page is server-rendered or statically generated with revalidation
- sitemap includes blog URLs
- 404 behaviour works for unknown slug
- webhook revalidation refreshes content after CMS publish/update

### SEO acceptance criteria

- blog pages are crawlable HTML pages
- canonical URLs are correct
- metadata is unique per article
- Open Graph image is present when available
- structured data validates for article pages
- no iframe or external-domain blog dependency exists

## Delivery phases

### Phase 1, foundation

- define data model
- build CMS API endpoints
- build Next.js blog routes
- implement server-side fetch layer
- implement metadata mapping

### Phase 2, revalidation and sitemap

- implement CMS webhook sender
- implement website revalidation endpoint
- implement sitemap integration
- verify publish/update propagation

### Phase 3, polish and reuse

- extract reusable Next.js integration module
- improve error handling
- add category and tag support if needed
- create internal setup checklist

### Phase 4, optional future enhancements

- preview mode
- scheduled publishing support
- related posts
- author pages
- additional framework adapters, Astro, other React-based stacks, etc.

## Guardrails for implementation

- do not couple website directly to CMS database
- do not expose CMS secrets in browser code
- do not build iframe-based embedding
- do not redirect users to an external blog host
- do not overengineer a universal plugin before Next.js integration is stable
- do not let CMS take over website layout responsibility

## Task breakdown for development

### CMS tasks

1. Create `Site`, `Post`, `Author`, `Category`, and `Tag` entities or align existing models
2. Implement multi-tenant site scoping
3. Build `GET /sites/{siteId}/posts`
4. Build `GET /sites/{siteId}/posts/{slug}`
5. Build `GET /sites/{siteId}/categories`
6. Build `GET /sites/{siteId}/authors`
7. Build `GET /sites/{siteId}/sitemap`
8. Implement API authentication and site scoping
9. Implement webhook event sender on publish and update
10. Implement HMAC signing for webhook payloads
11. Document response payloads

### Website tasks

1. Create `/blog` route
2. Create `/blog/[slug]` route
3. Build CMS fetch client using server-side environment variables
4. Build metadata mapping utilities
5. Render article content safely
6. Add article schema output
7. Add sitemap integration using CMS sitemap endpoint
8. Create `/api/cms/revalidate` endpoint
9. Verify signature validation and route revalidation
10. Test 404 and CMS outage handling

### QA tasks

1. Test content retrieval for one site and ensure no cross-site leakage
2. Test publish flow and webhook-triggered refresh
3. Test metadata output in page source
4. Test sitemap contains published blog URLs
5. Test article route indexing readiness using rendered HTML
6. Test webhook rejection for invalid signature

## Definition of done

This project is done when a new Next.js website can be connected to the CMS, expose a native blog under `/blog`, publish CMS-managed articles to `/blog/[slug]`, and meet the SEO, routing, security, and revalidation requirements defined in this document without custom one-off engineering for each site.

## Recommended next document

Create a second companion file with exact API contracts and example request and response payloads.

That second file should remove ambiguity between the CMS and website implementation teams.
