"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/lib/navigation";
import { useSearchParams } from "next/navigation";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";

type ShellSection = "dashboard" | "posts" | "users" | "review" | "sources" | "default";

function shellSection(pathname: string): ShellSection {
  if (pathname === "/admin") return "dashboard";
  if (pathname.startsWith("/admin/posts")) return "posts";
  if (pathname.startsWith("/admin/users")) return "users";
  if (pathname.startsWith("/admin/review-queue")) return "review";
  if (pathname.startsWith("/admin/sources")) return "sources";
  return "default";
}

type StatusTab = "draft" | "review" | "published";

function PostsStatusTabs({
  userId,
  currentStatus,
  allLabel,
  draftLabel,
  reviewLabel,
  publishedLabel,
}: {
  userId: string;
  currentStatus: string | null;
  allLabel: string;
  draftLabel: string;
  reviewLabel: string;
  publishedLabel: string;
}) {
  const base = `/admin/posts?user=${encodeURIComponent(userId)}`;
  const tabs: { status: StatusTab | null; label: string }[] = [
    { status: null, label: allLabel },
    { status: "draft", label: draftLabel },
    { status: "review", label: reviewLabel },
    { status: "published", label: publishedLabel },
  ];

  return (
    <>
      {tabs.map(({ status, label }) => {
        const href = status ? `${base}&status=${status}` : base;
        const active = (status === null && !currentStatus) || currentStatus === status;
        return (
          <Link
            key={label}
            href={href}
            className="font-['Inter',sans-serif] text-[10px] font-bold uppercase tracking-widest transition-colors"
            style={{
              color: active ? "var(--adm-on-surface)" : "var(--adm-on-variant)",
            }}
          >
            {label}
          </Link>
        );
      })}
    </>
  );
}

export function AdminTopBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("admin.shell");
  const tStatus = useTranslations("post.status");
  const section = shellSection(pathname);

  const postsUserId = section === "posts" ? searchParams.get("user")?.trim() : null;
  const postsStatus = section === "posts" ? searchParams.get("status")?.trim() ?? null : null;

  return (
    <header
      className="fixed right-0 top-0 z-40 flex h-14 w-full items-center justify-between gap-4 border-b px-4 backdrop-blur-xl sm:px-8 lg:left-64 lg:h-16 lg:w-[calc(100%-16rem)]"
      style={{
        background: "var(--adm-topbar-bg)",
        borderColor: "var(--adm-border-subtle)",
      }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-6 overflow-hidden">
        {section === "posts" && postsUserId && (
          <div className="hidden min-w-0 flex-wrap items-center gap-x-6 gap-y-2 md:flex">
            <PostsStatusTabs
              userId={postsUserId}
              currentStatus={postsStatus}
              allLabel={t("topAllStatuses")}
              draftLabel={tStatus("draft")}
              reviewLabel={tStatus("review")}
              publishedLabel={tStatus("published")}
            />
          </div>
        )}
      </div>

      <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
        <LocaleSwitcher variant="editorial" />
        <ThemeToggle
          className="!rounded-lg"
          style={{
            background: "var(--adm-surface-high)",
            border: "1px solid var(--adm-outline-variant)",
            color: "var(--adm-on-variant)",
          }}
        />
      </div>
    </header>
  );
}
