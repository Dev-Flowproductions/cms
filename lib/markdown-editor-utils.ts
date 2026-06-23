export type MarkdownEditResult = {
  value: string;
  selectionStart: number;
  selectionEnd: number;
};

export function applyWrap(
  text: string,
  selectionStart: number,
  selectionEnd: number,
  prefix: string,
  suffix: string,
  placeholder = "text"
): MarkdownEditResult {
  const selected = text.slice(selectionStart, selectionEnd);
  const inner = selected || placeholder;
  const insert = prefix + inner + suffix;
  const value = text.slice(0, selectionStart) + insert + text.slice(selectionEnd);
  const newStart = selectionStart + prefix.length;
  const newEnd = newStart + inner.length;
  return { value, selectionStart: newStart, selectionEnd: newEnd };
}

export function applyLinePrefix(
  text: string,
  selectionStart: number,
  selectionEnd: number,
  prefix: string,
  placeholder = "text"
): MarkdownEditResult {
  const lineStart = text.lastIndexOf("\n", selectionStart - 1) + 1;
  const lineEndRaw = text.indexOf("\n", selectionEnd);
  const lineEnd = lineEndRaw === -1 ? text.length : lineEndRaw;
  const line = text.slice(lineStart, lineEnd);
  const selectedInLine = text.slice(Math.max(selectionStart, lineStart), Math.min(selectionEnd, lineEnd));
  const body = selectedInLine.trim() || placeholder;
  const stripped = line.replace(/^#{1,6}\s+|^>\s+|^[-*]\s+|^\d+\.\s+/, "");
  const nextLine = prefix + (stripped.trim() || body);
  const value = text.slice(0, lineStart) + nextLine + text.slice(lineEnd);
  const newStart = lineStart + prefix.length;
  const newEnd = newStart + (selectedInLine.trim() || placeholder).length;
  return { value, selectionStart: newStart, selectionEnd: newEnd };
}

export function applyLink(
  text: string,
  selectionStart: number,
  selectionEnd: number,
  url: string,
  label?: string
): MarkdownEditResult {
  const selected = text.slice(selectionStart, selectionEnd).trim();
  const linkLabel = label?.trim() || selected || "link text";
  const safeUrl = url.trim() || "https://";
  const insert = `[${linkLabel}](${safeUrl})`;
  const value = text.slice(0, selectionStart) + insert + text.slice(selectionEnd);
  const urlStart = selectionStart + linkLabel.length + 3;
  const urlEnd = urlStart + safeUrl.length;
  return { value, selectionStart: urlStart, selectionEnd: urlEnd };
}

export function applyImage(
  text: string,
  selectionStart: number,
  selectionEnd: number,
  url: string,
  alt?: string
): MarkdownEditResult {
  const selected = text.slice(selectionStart, selectionEnd).trim();
  const altText = alt?.trim() || selected || "image description";
  const insert = `\n\n![${altText}](${url.trim()})\n\n`;
  const value = text.slice(0, selectionStart) + insert + text.slice(selectionEnd);
  const cursor = selectionStart + insert.length;
  return { value, selectionStart: cursor, selectionEnd: cursor };
}

export function insertSnippet(
  text: string,
  selectionStart: number,
  selectionEnd: number,
  snippet: string
): MarkdownEditResult {
  const value = text.slice(0, selectionStart) + snippet + text.slice(selectionEnd);
  const cursor = selectionStart + snippet.length;
  return { value, selectionStart: cursor, selectionEnd: cursor };
}
