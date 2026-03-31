"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  adminCreateBlogAuthorForClient,
  adminUpdateBlogAuthorForClient,
  type AdminBlogAuthorRow,
} from "./actions";

const fieldClass =
  "adm-input-edge w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-[var(--adm-primary-container)]";
/** Matches profile author edit block in EditUserConfig */
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-widest";

export function AdminBlogAuthorForm({
  clientUserId,
  author,
  onDone,
  onCancel,
}: {
  clientUserId: string;
  author?: AdminBlogAuthorRow | null;
  onDone: () => void;
  onCancel?: () => void;
}) {
  const t = useTranslations("admin.usersPage.blogAuthors");
  const tFields = useTranslations("dashboard.blogAuthors");
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState(() => author?.avatar_url ?? "");
  const [uploadBusy, setUploadBusy] = useState(false);

  useEffect(() => {
    setAvatarUrl(author?.avatar_url ?? "");
  }, [author?.id, author?.avatar_url]);

  async function uploadAvatarFile(file: File) {
    setErr(null);
    setUploadBusy(true);
    try {
      const fd = new FormData();
      fd.append("action", "blogAuthorAvatar");
      fd.append("blogAuthorId", author?.id ?? "new");
      if (avatarUrl.trim()) fd.append("replaceAvatarUrl", avatarUrl.trim());
      fd.append("file", file);
      const res = await fetch(`/api/admin/users/${encodeURIComponent(clientUserId)}/assets`, {
        method: "POST",
        body: fd,
      });
      const data = (await res.json()) as { error?: string; avatarUrl?: string };
      if (!res.ok || data.error) {
        setErr(data.error ?? tFields("uploadFailed"));
        return;
      }
      if (data.avatarUrl) setAvatarUrl(data.avatarUrl);
    } catch {
      setErr(tFields("uploadFailed"));
    } finally {
      setUploadBusy(false);
    }
  }

  return (
    <form
      className="rounded-xl border p-4"
      style={{ borderColor: "var(--adm-border-subtle)", background: "var(--adm-surface-high)" }}
      action={(fd) => {
        setErr(null);
        startTransition(async () => {
          const res = author
            ? await adminUpdateBlogAuthorForClient(clientUserId, author.id, fd)
            : await adminCreateBlogAuthorForClient(clientUserId, fd);
          if ("error" in res && res.error) setErr(res.error);
          else onDone();
        });
      }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} style={{ color: "var(--adm-on-variant)" }} htmlFor="ba_display_name">
            {tFields("displayName")} *
          </label>
          <input
            id="ba_display_name"
            name="display_name"
            required
            maxLength={200}
            className={fieldClass}
            style={{
              borderColor: "var(--adm-outline-variant)",
              background: "var(--adm-surface-highest)",
              color: "var(--adm-on-surface)",
            }}
            defaultValue={author?.display_name ?? ""}
          />
        </div>
        <div className="space-y-2">
          <label className={labelClass} style={{ color: "var(--adm-on-variant)" }} htmlFor="ba_avatar_url">
            {tFields("avatarUrl")}
          </label>
          <input type="hidden" name="avatar_url" value={avatarUrl} />
          <input
            id="ba_avatar_url"
            type="url"
            placeholder="https://"
            className={fieldClass}
            style={{
              borderColor: "var(--adm-outline-variant)",
              background: "var(--adm-surface-highest)",
              color: "var(--adm-on-surface)",
            }}
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
          />
          <div className="flex flex-wrap items-center gap-2">
            {avatarUrl.trim() ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt=""
                className="h-10 w-10 rounded-full border object-cover"
                style={{ borderColor: "var(--adm-border-subtle)" }}
              />
            ) : null}
            <label className={uploadBusy ? "cursor-wait opacity-60" : "cursor-pointer"}>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                disabled={uploadBusy}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) void uploadAvatarFile(file);
                }}
              />
              <span
                className="inline-block rounded-lg px-3 py-1.5 text-xs font-semibold"
                style={{
                  background: "var(--adm-surface-highest)",
                  border: "1px solid var(--adm-border-subtle)",
                  color: "var(--adm-on-surface)",
                }}
              >
                {tFields("uploadAvatarImage")}
              </span>
            </label>
            {avatarUrl.trim() ? (
              <button
                type="button"
                disabled={uploadBusy}
                onClick={() => setAvatarUrl("")}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold"
                style={{ border: "1px solid var(--adm-border-subtle)", color: "var(--adm-on-variant)" }}
              >
                {tFields("removeAvatarImage")}
              </button>
            ) : null}
          </div>
        </div>
        <div>
          <label className={labelClass} style={{ color: "var(--adm-on-variant)" }} htmlFor="ba_job_title">
            {tFields("jobTitle")}
          </label>
          <input
            id="ba_job_title"
            name="job_title"
            maxLength={200}
            className={fieldClass}
            style={{
              borderColor: "var(--adm-outline-variant)",
              background: "var(--adm-surface-highest)",
              color: "var(--adm-on-surface)",
            }}
            defaultValue={author?.job_title ?? ""}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass} style={{ color: "var(--adm-on-variant)" }} htmlFor="ba_bio">
            {tFields("bio")}
          </label>
          <textarea
            id="ba_bio"
            name="bio"
            rows={4}
            maxLength={4000}
            className={fieldClass}
            style={{
              borderColor: "var(--adm-outline-variant)",
              background: "var(--adm-surface-highest)",
              color: "var(--adm-on-surface)",
            }}
            defaultValue={author?.bio ?? ""}
          />
        </div>
      </div>
      {err && (
        <p className="mt-3 text-sm" style={{ color: "var(--adm-error)" }}>
          {err}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          style={{ background: "var(--adm-primary-container)", boxShadow: "var(--adm-cta-glow-shadow)" }}
        >
          {author ? tFields("save") : t("addAuthor")}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border px-5 py-2.5 text-sm font-semibold"
            style={{ borderColor: "var(--adm-outline-variant)", color: "var(--adm-on-variant)" }}
          >
            {tFields("cancel")}
          </button>
        )}
      </div>
    </form>
  );
}
