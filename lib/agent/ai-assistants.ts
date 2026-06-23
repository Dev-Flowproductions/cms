/** Stable ids stored in ai_token_usage.assistant */
export const AI_ASSISTANTS = [
  "post_writer",
  "post_translator",
  "quality_scorer",
  "quality_reviewer",
  "quality_reviser",
  "instruction_embedding",
  "cover_vision",
  "guidelines_vision",
  "cover_image",
  "author_localization",
] as const;

export type AiAssistantId = (typeof AI_ASSISTANTS)[number] | "other";

/** Infer assistant for rows recorded before the assistant column existed. */
export function resolveAssistantKey(assistant: string | null | undefined, operation: string): AiAssistantId {
  const key = assistant?.trim().toLowerCase();
  if (key && (AI_ASSISTANTS as readonly string[]).includes(key)) {
    return key as AiAssistantId;
  }
  switch (operation.trim().toLowerCase()) {
    case "chat":
      return "post_writer";
    case "vision":
      return "cover_vision";
    case "embedding":
      return "instruction_embedding";
    case "image":
      return "cover_image";
    default:
      return "other";
  }
}
