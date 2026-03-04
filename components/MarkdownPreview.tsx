"use client";

import ReactMarkdown from "react-markdown";

export function MarkdownPreview({ content }: { content: string }) {
  return (
    <div className="prose dark:prose-invert max-w-none p-4 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900 min-h-[200px]">
      <ReactMarkdown>{content || "*No content yet*"}</ReactMarkdown>
    </div>
  );
}
