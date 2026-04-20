import { getPublicAppBaseUrlOrLocalhost } from "@/lib/public-app-url";

/**
 * Calls `POST /api/publish/[postId]` with the scheduler internal header (no user session).
 * Same path as dashboard “approve” / server-side publish flows.
 */
export async function requestInternalPublishPost(
  postId: string,
): Promise<{ ok: true } | { ok: false; status: number; error?: string }> {
  const appUrl = getPublicAppBaseUrlOrLocalhost();
  try {
    const res = await fetch(`${appUrl}/api/publish/${postId}`, {
      method: "POST",
      headers: { "x-scheduler-internal": "1" },
      signal: AbortSignal.timeout(45_000),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      return {
        ok: false,
        status: res.status,
        error: body?.error ?? res.statusText,
      };
    }
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      status: 0,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}
