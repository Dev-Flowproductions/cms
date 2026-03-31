"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/lib/navigation";
import {
  createBlogAuthor,
  deleteBlogAuthor,
  updateBlogAuthor,
  type BlogAuthorRow,
  type ProfileByline,
} from "./actions";

const PROFILE_ROW_ID = "__profile";

const fieldClass =
  "adm-input-edge w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-[var(--adm-primary-container)]";
/** Matches admin profile / blog author edit layout */
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-widest";
const fieldWrap = { borderColor: "var(--adm-outline-variant)", background: "var(--adm-surface-highest)", color: "var(--adm-on-surface)" } as const;

function AuthorForm({
  author,
  onDone,
  onCancel,
}: {
  author?: BlogAuthorRow | null;
  onDone: () => void;
  onCancel?: () => void;
}) {
  const t = useTranslations("dashboard.blogAuthors");
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
      fd.append("blogAuthorId", author?.id ?? "new");
      if (avatarUrl.trim()) fd.append("replaceAvatarUrl", avatarUrl.trim());
      fd.append("file", file);
      const res = await fetch("/api/dashboard/blog-author-avatar", { method: "POST", body: fd });
      const data = (await res.json()) as { error?: string; avatarUrl?: string };
      if (!res.ok || data.error) {
        setErr(data.error ?? t("uploadFailed"));
        return;
      }
      if (data.avatarUrl) setAvatarUrl(data.avatarUrl);
    } catch {
      setErr(t("uploadFailed"));
    } finally {
      setUploadBusy(false);
    }
  }

  return (
    <form
      className="rounded-xl border p-4"
      style={{ borderColor: "var(--adm-outline-variant)", background: "var(--adm-surface-high)" }}
      action={(fd) => {
        setErr(null);
        startTransition(async () => {
          const res = author
            ? await updateBlogAuthor(author.id, fd)
            : await createBlogAuthor(fd);
          if ("error" in res && res.error) setErr(res.error);
          else onDone();
        });
      }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} style={{ color: "var(--adm-on-variant)" }} htmlFor="display_name">
            {t("displayName")} *
          </label>
          <input
            id="display_name"
            name="display_name"
            required
            maxLength={200}
            className={fieldClass}
            style={fieldWrap}
            defaultValue={author?.display_name ?? ""}
          />
        </div>
        <div className="space-y-2">
          <label className={labelClass} style={{ color: "var(--adm-on-variant)" }} htmlFor="avatar_url">
            {t("avatarUrl")}
          </label>
          <input type="hidden" name="avatar_url" value={avatarUrl} />
          <input
            id="avatar_url"
            type="url"
            placeholder="https://"
            className={fieldClass}
            style={fieldWrap}
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
                {t("uploadAvatarImage")}
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
                {t("removeAvatarImage")}
              </button>
            ) : null}
          </div>
        </div>
        <div>
          <label className={labelClass} style={{ color: "var(--adm-on-variant)" }} htmlFor="job_title">
            {t("jobTitle")}
          </label>
          <input
            id="job_title"
            name="job_title"
            maxLength={200}
            className={fieldClass}
            style={fieldWrap}
            defaultValue={author?.job_title ?? ""}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass} style={{ color: "var(--adm-on-variant)" }} htmlFor="bio">
            {t("bio")}
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            maxLength={4000}
            className={fieldClass}
            style={fieldWrap}
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
          {author ? t("save") : t("add")}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border px-5 py-2.5 text-sm font-semibold"
            style={{ borderColor: "var(--adm-outline-variant)", color: "var(--adm-on-variant)" }}
          >
            {t("cancel")}
          </button>
        )}
      </div>
    </form>
  );
}

export function BlogAuthorsClient({
  profileByline,
  initialAuthors,
  embeddedInSettings = false,
}: {
  profileByline: ProfileByline | null;
  initialAuthors: BlogAuthorRow[];
  /** Omit intro + profile row; primary author is edited in Settings above */
  embeddedInSettings?: boolean;
}) {
  const t = useTranslations("dashboard.blogAuthors");
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddAuthor, setShowAddAuthor] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pendingDel, startDel] = useTransition();

  const refresh = () => router.refresh();

  const pName = profileByline?.display_name?.trim() ?? "";
  const pJob = profileByline?.job_title?.trim() ?? "";
  const pBio = profileByline?.bio?.trim() ?? "";
  const pAvatar = profileByline?.avatar_url?.trim() ?? "";

  if (embeddedInSettings) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-end">
          <button
            type="button"
            onClick={() => {
              setShowAddAuthor(true);
              setEditingId(null);
              setExpandedId(null);
            }}
            className="inline-flex shrink-0 items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
            style={{ background: "var(--adm-primary)" }}
          >
            {t("addNew")}
          </button>
        </div>

        {showAddAuthor ? (
          <div className="mb-2">
            <AuthorForm
              key="blog-author-new"
              onDone={() => {
                setShowAddAuthor(false);
                refresh();
              }}
              onCancel={() => setShowAddAuthor(false)}
            />
          </div>
        ) : null}

        {initialAuthors.length === 0 && !showAddAuthor ? (
          <p className="text-sm" style={{ color: "var(--adm-on-variant)" }}>
            {t("noExtraAuthors")}
          </p>
        ) : null}

        <ul className="space-y-4">
          {initialAuthors.map((a) => (
            <li key={a.id}>
              {editingId === a.id ? (
                <AuthorForm
                  key={a.id}
                  author={a}
                  onDone={() => {
                    setEditingId(null);
                    setExpandedId(null);
                    refresh();
                  }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div
                  className="overflow-hidden rounded-xl border"
                  style={{ borderColor: "var(--adm-outline-variant)", background: "var(--adm-surface-high)" }}
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--adm-interactive-hover)]"
                    aria-expanded={expandedId === a.id}
                    onClick={() => setExpandedId((id) => (id === a.id ? null : a.id))}
                  >
                    <span className="min-w-0 font-semibold" style={{ color: "var(--adm-on-surface)" }}>
                      {a.display_name}
                    </span>
                    <svg
                      className={`h-4 w-4 shrink-0 transition-transform ${expandedId === a.id ? "rotate-180" : ""}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                      style={{ color: "var(--adm-on-variant)" }}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                  {expandedId === a.id && (
                    <div
                      className="space-y-3 border-t px-4 py-4"
                      style={{ borderColor: "var(--adm-outline-variant)" }}
                    >
                      <div className="flex flex-wrap items-start gap-3">
                        {a.avatar_url?.trim() ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={a.avatar_url}
                            alt=""
                            className="h-14 w-14 shrink-0 rounded-full border object-cover"
                            style={{ borderColor: "var(--adm-outline-variant)" }}
                          />
                        ) : null}
                        <div className="min-w-0 flex-1 space-y-2">
                          {a.job_title?.trim() ? (
                            <p className="text-sm" style={{ color: "var(--adm-on-variant)" }}>
                              {a.job_title}
                            </p>
                          ) : null}
                          {a.avatar_url?.trim() ? (
                            <p className="break-all font-mono text-[11px]" style={{ color: "var(--adm-on-variant)" }}>
                              {a.avatar_url}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      {a.bio?.trim() ? (
                        <p className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: "var(--adm-on-surface)" }}>
                          {a.bio}
                        </p>
                      ) : (
                        <p className="text-sm italic" style={{ color: "var(--adm-on-variant)" }}>
                          {t("noBio")}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddAuthor(false);
                            setEditingId(a.id);
                            setExpandedId(null);
                          }}
                          className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
                          style={{ borderColor: "var(--adm-outline-variant)", color: "var(--adm-primary)" }}
                        >
                          {t("edit")}
                        </button>
                        <button
                          type="button"
                          disabled={pendingDel}
                          onClick={() => {
                            if (!confirm(t("confirmDelete", { name: a.display_name }))) return;
                            startDel(async () => {
                              await deleteBlogAuthor(a.id);
                              refresh();
                            });
                          }}
                          className="rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                          style={{ borderColor: "var(--adm-danger-outline, #f87171)", color: "var(--adm-error, #f87171)" }}
                        >
                          {t("delete")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <p className="max-w-2xl text-sm leading-relaxed" style={{ color: "var(--adm-on-variant)" }}>
        {t("intro")}
      </p>

      <section>
        <h2 className="mb-1 text-sm font-bold uppercase tracking-widest" style={{ color: "var(--adm-on-variant)" }}>
          {t("yourAuthors")}
        </h2>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--adm-on-variant)" }}>
          {t("authorListHeading", { count: 1 + initialAuthors.length })}
        </p>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-end">
          <button
            type="button"
            onClick={() => {
              setShowAddAuthor(true);
              setEditingId(null);
              setExpandedId(null);
            }}
            className="inline-flex shrink-0 items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
            style={{ background: "var(--adm-primary)" }}
          >
            {t("addNew")}
          </button>
        </div>

        {showAddAuthor ? (
          <div className="mb-4">
            <AuthorForm
              key="blog-author-new"
              onDone={() => {
                setShowAddAuthor(false);
                refresh();
              }}
              onCancel={() => setShowAddAuthor(false)}
            />
          </div>
        ) : null}

        {initialAuthors.length === 0 && !showAddAuthor ? (
          <p className="mb-3 text-sm" style={{ color: "var(--adm-on-variant)" }}>
            {t("noExtraAuthors")}
          </p>
        ) : null}
        <ul className="space-y-4">
          <li key={PROFILE_ROW_ID}>
            <div
              className="overflow-hidden rounded-xl border"
              style={{ borderColor: "var(--adm-outline-variant)", background: "var(--adm-surface-high)" }}
            >
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--adm-interactive-hover)]"
                aria-expanded={expandedId === PROFILE_ROW_ID}
                onClick={() => setExpandedId((id) => (id === PROFILE_ROW_ID ? null : PROFILE_ROW_ID))}
              >
                <span className="min-w-0 font-semibold" style={{ color: "var(--adm-on-surface)" }}>
                  {pName || t("unnamedAuthor")}
                </span>
                <svg
                  className={`h-4 w-4 shrink-0 transition-transform ${expandedId === PROFILE_ROW_ID ? "rotate-180" : ""}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                  style={{ color: "var(--adm-on-variant)" }}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {expandedId === PROFILE_ROW_ID && (
                <div
                  className="space-y-3 border-t px-4 py-4"
                  style={{ borderColor: "var(--adm-outline-variant)" }}
                >
                  <div className="flex flex-wrap items-start gap-3">
                    {pAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={pAvatar}
                        alt=""
                        className="h-14 w-14 shrink-0 rounded-full border object-cover"
                        style={{ borderColor: "var(--adm-outline-variant)" }}
                      />
                    ) : null}
                    <div className="min-w-0 flex-1 space-y-2">
                      {pJob ? (
                        <p className="text-sm" style={{ color: "var(--adm-on-variant)" }}>
                          {pJob}
                        </p>
                      ) : null}
                      {pAvatar ? (
                        <p className="break-all font-mono text-[11px]" style={{ color: "var(--adm-on-variant)" }}>
                          {pAvatar}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  {pBio ? (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: "var(--adm-on-surface)" }}>
                      {pBio}
                    </p>
                  ) : (
                    <p className="text-sm italic" style={{ color: "var(--adm-on-variant)" }}>
                      {t("noBio")}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Link
                      href="/dashboard/settings"
                      className="inline-flex rounded-lg border px-3 py-1.5 text-xs font-semibold"
                      style={{ borderColor: "var(--adm-outline-variant)", color: "var(--adm-primary)" }}
                    >
                      {t("editInSettings")}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </li>
          {initialAuthors.map((a) => (
            <li key={a.id}>
              {editingId === a.id ? (
                <AuthorForm
                  key={a.id}
                  author={a}
                  onDone={() => {
                    setEditingId(null);
                    setExpandedId(null);
                    refresh();
                  }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div
                  className="overflow-hidden rounded-xl border"
                  style={{ borderColor: "var(--adm-outline-variant)", background: "var(--adm-surface-high)" }}
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--adm-interactive-hover)]"
                    aria-expanded={expandedId === a.id}
                    onClick={() => setExpandedId((id) => (id === a.id ? null : a.id))}
                  >
                    <span className="min-w-0 font-semibold" style={{ color: "var(--adm-on-surface)" }}>
                      {a.display_name}
                    </span>
                    <svg
                      className={`h-4 w-4 shrink-0 transition-transform ${expandedId === a.id ? "rotate-180" : ""}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                      style={{ color: "var(--adm-on-variant)" }}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                  {expandedId === a.id && (
                    <div
                      className="space-y-3 border-t px-4 py-4"
                      style={{ borderColor: "var(--adm-outline-variant)" }}
                    >
                      <div className="flex flex-wrap items-start gap-3">
                        {a.avatar_url?.trim() ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={a.avatar_url}
                            alt=""
                            className="h-14 w-14 shrink-0 rounded-full object-cover border"
                            style={{ borderColor: "var(--adm-outline-variant)" }}
                          />
                        ) : null}
                        <div className="min-w-0 flex-1 space-y-2">
                          {a.job_title?.trim() ? (
                            <p className="text-sm" style={{ color: "var(--adm-on-variant)" }}>
                              {a.job_title}
                            </p>
                          ) : null}
                          {a.avatar_url?.trim() ? (
                            <p className="break-all font-mono text-[11px]" style={{ color: "var(--adm-on-variant)" }}>
                              {a.avatar_url}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      {a.bio?.trim() ? (
                        <p className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: "var(--adm-on-surface)" }}>
                          {a.bio}
                        </p>
                      ) : (
                        <p className="text-sm italic" style={{ color: "var(--adm-on-variant)" }}>
                          {t("noBio")}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddAuthor(false);
                            setEditingId(a.id);
                            setExpandedId(null);
                          }}
                          className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
                          style={{ borderColor: "var(--adm-outline-variant)", color: "var(--adm-primary)" }}
                        >
                          {t("edit")}
                        </button>
                        <button
                          type="button"
                          disabled={pendingDel}
                          onClick={() => {
                            if (!confirm(t("confirmDelete", { name: a.display_name }))) return;
                            startDel(async () => {
                              await deleteBlogAuthor(a.id);
                              refresh();
                            });
                          }}
                          className="rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                          style={{ borderColor: "var(--adm-danger-outline, #f87171)", color: "var(--adm-error, #f87171)" }}
                        >
                          {t("delete")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
