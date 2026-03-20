/**
 * CMS Content API v1 response types (headless blog integration spec)
 */

export interface ApiAuthor {
  id: string;
  name: string;
  slug: string;
  jobTitle: string | null;
  bio: string | null;
  avatarUrl: string | null;
}

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface ApiPostListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  publishedAt: string | null;
  updatedAt: string;
  author: ApiAuthor | null;
  categories: ApiCategory[];
  seoTitle: string | null;
}

export interface ApiPost extends ApiPostListItem {
  content: string;
  seoDescription: string | null;
  canonicalUrl: string | null;
  ogImageUrl: string | null;
  structuredData: unknown;
  locale: string;
  translations: Record<string, { title: string; excerpt: string; content: string; seoTitle: string | null; seoDescription: string | null }>;
}

export interface ApiPostsResponse {
  posts: ApiPostListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiSitemapEntry {
  slug: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface ApiSitemapResponse {
  urls: ApiSitemapEntry[];
}
