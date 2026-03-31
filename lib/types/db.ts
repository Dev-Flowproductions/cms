export type PostStatus =
  | "idea"
  | "research"
  | "draft"
  | "optimize"
  | "format"
  | "review"
  | "approved"
  | "scheduled"
  | "published"
  | "archived";

export type ContentType = "hero" | "hub" | "hygiene";

export type Locale = "pt" | "en" | "fr";

export interface BlogAuthor {
  id: string;
  user_id: string;
  display_name: string;
  job_title: string | null;
  bio: string | null;
  avatar_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface Post {
  id: string;
  slug: string;
  status: PostStatus;
  content_type: ContentType;
  primary_locale: Locale;
  author_id: string;
  /** Persona for byline HTML; null = use account profile. */
  byline_author_id?: string | null;
  cover_image_path: string | null;
  published_at: string | null;
  scheduled_for: string | null;
  created_at: string;
  updated_at: string;
  tags?: string[] | null;
  category?: string | null;
}

export interface PostLocalization {
  id: string;
  post_id: string;
  locale: Locale;
  title: string;
  excerpt: string;
  content_md: string;
  content_html: string | null;
  jsonld: unknown;
}

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  job_title: string | null;
  created_at: string;
}

export interface PostWithAuthor extends Post {
  profiles: Profile | null;
}

export interface PostWithLocalizations extends Post {
  post_localizations: PostLocalization[];
}
