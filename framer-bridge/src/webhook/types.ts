import type { CmsLocale } from "../config.js";

export type WebhookEvent =
  | "post.published"
  | "post.updated"
  | "post.unpublished"
  | "post.deleted"
  | "cms.post.published"
  | "cms.post.updated"
  | "cms.post.deleted"
  | "";

export interface LocaleContent {
  title?: string;
  excerpt?: string;
  content_md?: string;
  seo_title?: string;
  meta_description?: string;
  json_ld?: unknown;
}

export interface WebhookPost {
  id: string;
  slug?: string;
  status?: string;
  updatedAt?: string;
  locale?: string;
  cover_image_url?: string | null;
  cover_image_alt?: string | null;
  title?: string;
  excerpt?: string;
  content_md?: string;
  seo_title?: string;
  meta_description?: string;
  json_ld?: unknown;
  translations?: Partial<Record<CmsLocale, LocaleContent | null>>;
}

export interface WebhookEnvelope {
  event?: WebhookEvent | string;
  siteId?: string;
  timestamp?: string;
  signatureVersion?: string;
  post?: WebhookPost;
}

export const UPSERT_EVENTS = new Set<string>([
  "post.published",
  "post.updated",
  "cms.post.published",
  "cms.post.updated",
  "",
]);

export const DELETE_EVENTS = new Set<string>([
  "post.deleted",
  "post.unpublished",
  "cms.post.deleted",
]);

export interface ResolvedLocaleContent {
  locale: CmsLocale;
  title: string;
  excerpt: string;
  contentMd: string;
  seoTitle: string;
  metaDescription: string;
  coverImageUrl: string | null;
  coverImageAlt: string;
}
