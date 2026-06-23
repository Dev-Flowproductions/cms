"use client";

import type { PostStructureSection } from "@/lib/agent/post-structure-guide";

export function PostStructureGuide({
  sections,
  title,
  hint,
}: {
  sections: PostStructureSection[];
  title: string;
  hint?: string;
}) {
  return (
    <div
      className="rounded-2xl border p-4 space-y-4"
      style={{
        borderColor: "var(--adm-border-subtle)",
        background: "var(--adm-surface-high)",
      }}
    >
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--adm-primary)" }}>
          {title}
        </p>
        {hint && (
          <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--adm-on-variant)" }}>
            {hint}
          </p>
        )}
      </div>
      {sections.map((section) => (
        <div key={section.title}>
          <p className="text-xs font-semibold mb-2" style={{ color: "var(--adm-on-surface)" }}>
            {section.title}
          </p>
          <ul className="space-y-1.5">
            {section.items.map((item) => (
              <li
                key={item}
                className="text-xs leading-relaxed pl-3 relative before:content-['•'] before:absolute before:left-0"
                style={{ color: "var(--adm-on-variant)" }}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
