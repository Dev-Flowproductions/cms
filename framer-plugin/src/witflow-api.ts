import type { CmsLocale } from "./storage"

export interface ApiPostListItem {
    id: string
    title: string
    slug: string
    excerpt: string
    coverImageUrl: string | null
    coverImageAlt: string | null
    locale: string
    translations?: Record<string, { title?: string; excerpt?: string; seoTitle?: string | null }>
}

export interface ApiPost extends ApiPostListItem {
    content: string
    seoTitle: string | null
    seoDescription: string | null
    structuredData?: unknown
    translations: Record<
        string,
        {
            title?: string
            excerpt?: string
            content?: string
            seoTitle?: string | null
            seoDescription?: string | null
        }
    >
}

export interface ApiPostsResponse {
    posts: ApiPostListItem[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

export class WitflowApiError extends Error {
    constructor(
        message: string,
        readonly status?: number
    ) {
        super(message)
        this.name = "WitflowApiError"
    }
}

function normalizeBaseUrl(baseUrl: string): string {
    return baseUrl.trim().replace(/\/+$/, "")
}

async function requestJson<T>(
    baseUrl: string,
    apiKey: string,
    path: string,
    signal?: AbortSignal
): Promise<T> {
    const url = `${normalizeBaseUrl(baseUrl)}${path}`
    const response = await fetch(url, {
        method: "GET",
        signal,
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${apiKey}`,
            "x-api-key": apiKey,
        },
    })

    const text = await response.text()
    let data: unknown = null
    try {
        data = text ? JSON.parse(text) : null
    } catch {
        data = null
    }

    if (!response.ok) {
        const errorMessage =
            data && typeof data === "object" && "error" in data && typeof (data as { error: unknown }).error === "string"
                ? (data as { error: string }).error
                : text || response.statusText
        throw new WitflowApiError(`CMS API error (${response.status}): ${errorMessage}`, response.status)
    }

    return data as T
}

export async function testConnection(
    baseUrl: string,
    siteId: string,
    apiKey: string,
    signal?: AbortSignal
): Promise<void> {
    await listPosts(baseUrl, siteId, apiKey, 1, 1, signal)
}

export async function listPosts(
    baseUrl: string,
    siteId: string,
    apiKey: string,
    page: number,
    limit: number,
    signal?: AbortSignal
): Promise<ApiPostsResponse> {
    const path = `/api/v1/sites/${encodeURIComponent(siteId)}/posts?status=published&page=${page}&limit=${limit}`
    return requestJson<ApiPostsResponse>(baseUrl, apiKey, path, signal)
}

export async function getPost(
    baseUrl: string,
    siteId: string,
    apiKey: string,
    slug: string,
    locale?: CmsLocale,
    signal?: AbortSignal
): Promise<ApiPost> {
    let path = `/api/v1/sites/${encodeURIComponent(siteId)}/posts/${encodeURIComponent(slug)}`
    if (locale) {
        path += `?locale=${encodeURIComponent(locale)}`
    }
    return requestJson<ApiPost>(baseUrl, apiKey, path, signal)
}

export async function fetchAllPublishedPosts(
    baseUrl: string,
    siteId: string,
    apiKey: string,
    signal?: AbortSignal,
    maxPages = 50
): Promise<ApiPost[]> {
    const posts: ApiPost[] = []
    let page = 1

    while (page <= maxPages) {
        const list = await listPosts(baseUrl, siteId, apiKey, page, 50, signal)
        const summaries = Array.isArray(list.posts) ? list.posts : []
        if (summaries.length === 0) break

        for (const summary of summaries) {
            if (!summary.slug) continue
            const full = await getPost(baseUrl, siteId, apiKey, summary.slug, undefined, signal)
            posts.push(full)
        }

        const totalPages = list.pagination?.totalPages ?? page
        if (page >= totalPages) break
        page += 1
    }

    return posts
}
