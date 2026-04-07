"use client";

import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

const AUTHOR_DIV_RE =
  /<div[^>]*(?:\bid\s*=\s*["']author-block["']|\sclass\s*=\s*["'][^"']*author-block[^"']*["'])[^>]*>[\s\S]*?<\/div>/gi;

const ABOUT_AUTHOR_SECTION_RE =
  /\n{0,2}#{1,3}\s*(?:Sobre o autor|About the author|À propos de l'auteur)\s*\n[\s\S]*$/i;

function stripAuthorHtml(md: string): string {
  return md.replace(AUTHOR_DIV_RE, "").replace(ABOUT_AUTHOR_SECTION_RE, "").trim();
}

export function MarkdownPreview({
  content,
  coverImageUrl,
  title,
  excerpt,
}: {
  content: string;
  coverImageUrl?: string | null;
  title?: string | null;
  excerpt?: string | null;
}) {
  const cleanContent = stripAuthorHtml(content);

  return (
    <div
      className="markdown-preview"
      style={{
        background: "var(--surface-raised)",
        border: "1px solid var(--border)",
        borderRadius: "0.75rem",
        overflow: "hidden",
        color: "var(--text)",
        fontSize: "0.9rem",
        lineHeight: "1.75",
      }}
    >
      {/* Cover image */}
      {coverImageUrl && (
        <img
          src={coverImageUrl}
          alt={title ?? "Cover image"}
          style={{
            width: "100%",
            display: "block",
            aspectRatio: "16/9",
            objectFit: "cover",
          }}
        />
      )}

      <div style={{ padding: "1.25rem" }}>
        {/* Title */}
        {title && (
          <h1
            style={{
              color: "var(--text)",
              fontSize: "1.6rem",
              fontWeight: 800,
              lineHeight: 1.25,
              marginBottom: excerpt ? "0.5rem" : "1rem",
              marginTop: 0,
            }}
          >
            {title}
          </h1>
        )}

        {/* Excerpt */}
        {excerpt && (
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "1rem",
              lineHeight: 1.6,
              marginBottom: "1.25rem",
              marginTop: 0,
              fontStyle: "italic",
            }}
          >
            {excerpt}
          </p>
        )}

        {/* Divider between header and body when both title and content exist */}
        {(title || excerpt) && cleanContent && (
          <hr style={{ borderColor: "var(--border)", margin: "0 0 1rem 0" }} />
        )}

        <ReactMarkdown
          rehypePlugins={[rehypeRaw]}
          components={{
            h1: ({ children }) => (
              <h1 style={{ color: "var(--text)", fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem", marginTop: "1.25rem" }}>
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 style={{ color: "var(--text)", fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem", marginTop: "1.25rem", paddingBottom: "0.25rem", borderBottom: "1px solid var(--border)" }}>
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 style={{ color: "var(--text)", fontSize: "1.05rem", fontWeight: 600, marginBottom: "0.4rem", marginTop: "1rem" }}>
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p style={{ color: "var(--text-muted)", marginBottom: "0.75rem" }}>{children}</p>
            ),
            strong: ({ children }) => (
              <strong style={{ color: "var(--text)", fontWeight: 600 }}>{children}</strong>
            ),
            em: ({ children }) => (
              <em style={{ color: "var(--text-muted)" }}>{children}</em>
            ),
            img: ({ src, alt }) => {
              const srcStr = typeof src === "string" ? src : "";
              if (!srcStr || srcStr.includes("COVER_IMAGE_PLACEHOLDER")) return null;
              return (
                <img
                  src={srcStr}
                  alt={alt ?? ""}
                  style={{
                    width: "100%",
                    borderRadius: "0.75rem",
                    marginBottom: "1rem",
                    border: "1px solid var(--border)",
                    aspectRatio: "16/9",
                    objectFit: "cover",
                  }}
                />
              );
            },
            ul: ({ children }) => (
              <ul style={{ color: "var(--text-muted)", paddingLeft: "1.25rem", marginBottom: "0.75rem", listStyleType: "disc" }}>
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol style={{ color: "var(--text-muted)", paddingLeft: "1.25rem", marginBottom: "0.75rem", listStyleType: "decimal" }}>
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li style={{ marginBottom: "0.25rem" }}>{children}</li>
            ),
            blockquote: ({ children }) => (
              <blockquote style={{
                borderLeft: "3px solid var(--accent)",
                paddingLeft: "1rem",
                color: "var(--text-muted)",
                fontStyle: "italic",
                margin: "0.75rem 0",
              }}>
                {children}
              </blockquote>
            ),
            code: ({ children, className }) => {
              const isBlock = !!className;
              return isBlock ? (
                <pre style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.5rem",
                  padding: "0.875rem",
                  overflowX: "auto",
                  marginBottom: "0.75rem",
                }}>
                  <code style={{ color: "var(--accent)", fontFamily: "monospace", fontSize: "0.8rem" }}>
                    {children}
                  </code>
                </pre>
              ) : (
                <code style={{
                  background: "var(--surface)",
                  color: "var(--accent)",
                  padding: "0.15rem 0.35rem",
                  borderRadius: "0.3rem",
                  fontFamily: "monospace",
                  fontSize: "0.82em",
                }}>
                  {children}
                </code>
              );
            },
            a: ({ children, href }) => (
              <a href={href} style={{ color: "var(--accent)", textDecoration: "underline" }} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
            hr: () => <hr style={{ borderColor: "var(--border)", margin: "1rem 0" }} />,
          }}
        >
          {cleanContent || "*No content yet*"}
        </ReactMarkdown>
      </div>
    </div>
  );
}
