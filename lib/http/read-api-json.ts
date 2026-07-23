/** Parse a fetch Response as JSON; surface plain-text/HTML error bodies clearly. */
export async function readApiJsonResponse(res: Response): Promise<{
  ok: boolean;
  status: number;
  data: Record<string, unknown>;
}> {
  const text = await res.text();
  if (!text.trim()) {
    return { ok: res.ok, status: res.status, data: {} };
  }
  try {
    const data = JSON.parse(text) as Record<string, unknown>;
    return { ok: res.ok, status: res.status, data };
  } catch {
    const snippet = text.replace(/\s+/g, " ").trim().slice(0, 240);
    return {
      ok: false,
      status: res.status,
      data: { error: snippet || `Request failed (${res.status})` },
    };
  }
}
