"use client";

import { MarkdownPreview } from "@/components/MarkdownPreview";
import { previewFontFamily } from "@/lib/agent/post-structure-guide";

export type ClientBrandPreview = {
  company_name?: string | null;
  brand_name?: string | null;
  logo_url?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  font_style?: string | null;
};

export function BrandedMarkdownPreview({
  brand,
  content,
  coverImageUrl,
  title,
  excerpt,
}: {
  brand: ClientBrandPreview;
  content: string;
  coverImageUrl?: string | null;
  title?: string | null;
  excerpt?: string | null;
}) {
  const accent = brand.primary_color?.trim() || "#7c5cfc";
  const secondary = brand.secondary_color?.trim() || accent;
  const fontFamily = previewFontFamily(brand.font_style);
  const accountLabel = (brand.company_name ?? brand.brand_name)?.trim();

  return (
    <div className="space-y-2">
      {accountLabel && (
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--adm-on-variant)" }}>
          {brand.logo_url ? (
            <img
              src={brand.logo_url}
              alt=""
              className="h-6 w-auto max-w-[80px] object-contain rounded"
            />
          ) : (
            <span
              className="inline-block h-3 w-3 rounded-full shrink-0"
              style={{ background: accent }}
            />
          )}
          <span>
            Preview with <strong style={{ color: "var(--adm-on-surface)" }}>{accountLabel}</strong> branding
          </span>
        </div>
      )}
      <div
        style={
          {
            "--text": "#1a1a2e",
            "--text-muted": "#4a4a6a",
            "--text-faint": "#8888aa",
            "--surface-raised": "#ffffff",
            "--surface": "#f8f8fc",
            "--border": `${secondary}33`,
            "--accent": accent,
            fontFamily,
          } as React.CSSProperties
        }
      >
        <MarkdownPreview
          content={content}
          coverImageUrl={coverImageUrl}
          title={title}
          excerpt={excerpt}
        />
      </div>
    </div>
  );
}
