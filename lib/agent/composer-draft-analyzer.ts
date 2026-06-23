import type { Locale } from "@/lib/types/db";
import { FAQ_HEADING_BY_LOCALE } from "@/lib/agent/faq-heading";

function wordCount(md: string): number {
  const t = md.trim();
  return t ? t.split(/\s+/).length : 0;
}

function introBlock(md: string): string {
  return md.split(/^##\s/m)[0]?.trim() ?? "";
}

function hasIntro(md: string): boolean {
  const intro = introBlock(md);
  return intro.length > 40 && !intro.startsWith("#");
}

function h2Count(md: string): number {
  return (md.match(/^##\s/gm) ?? []).length;
}

function hasFaqSection(md: string, locale: Locale): boolean {
  const heading = FAQ_HEADING_BY_LOCALE[locale] ?? FAQ_HEADING_BY_LOCALE.en;
  return new RegExp(`^${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "im").test(md);
}

function hasBoldDefinition(md: string): boolean {
  return /\*\*[^*]+\*\*/.test(introBlock(md));
}

function hasQuestionH2(md: string): boolean {
  return /^##\s+.*\?/m.test(md);
}

function hasConclusion(md: string): boolean {
  const sections = md.split(/^##\s/m).slice(1);
  if (sections.length < 2) return false;
  const last = sections[sections.length - 1]?.trim() ?? "";
  return last.length > 80;
}

const TIPS: Record<
  Locale,
  {
    addTitle: string;
    startIntro: string;
    writeIntro: string;
    boldDefinition: string;
    addH2s: string;
    questionH2: string;
    addFaq: (heading: string) => string;
    wordCountLow: (count: number) => string;
    wordCountMid: string;
    addConclusion: string;
    looksGood: string;
  }
> = {
  en: {
    addTitle: "Add a post title — it is stored separately from the markdown body.",
    startIntro: "Start with 2–3 intro sentences before your first ## heading.",
    writeIntro: "Your intro is short — add 2–3 sentences with a data-backed claim.",
    boldDefinition: "Bold the main term in the intro (**term**) so readers and search engines spot it.",
    addH2s: "Add ## H2 sections — aim for at least two body sections before the FAQ.",
    questionH2: "Include at least one question-style ## heading with a direct 40–60 word answer.",
    addFaq: (h) => `Add a FAQ section with H2 “${h}” and exactly 5 Q&As.`,
    wordCountLow: (n) => `You are at ${n} words — hero posts usually need 800+ words.`,
    wordCountMid: "Good progress — keep expanding body sections and the FAQ before optimizing.",
    addConclusion: "Finish with a ## conclusion section: 2 paragraphs and a specific CTA.",
    looksGood: "Structure looks solid — run Optimize before publishing to score SEO, AEO, and GEO.",
  },
  pt: {
    addTitle: "Adicione um título — ele fica separado do corpo em markdown.",
    startIntro: "Comece com 2–3 frases de introdução antes do primeiro ##.",
    writeIntro: "A introdução está curta — acrescente 2–3 frases com uma afirmação com dados.",
    boldDefinition: "Coloque o termo principal a negrito na intro (**termo**).",
    addH2s: "Adicione secções ## — pelo menos duas antes das FAQ.",
    questionH2: "Inclua pelo menos um ## em forma de pergunta com resposta directa (40–60 palavras).",
    addFaq: (h) => `Adicione FAQ com H2 “${h}” e exactamente 5 perguntas e respostas.`,
    wordCountLow: (n) => `Tem ${n} palavras — artigos hero costumam ter 800+ palavras.`,
    wordCountMid: "Bom progresso — continue a expandir o corpo e as FAQ antes de optimizar.",
    addConclusion: "Termine com ## conclusão: 2 parágrafos e um CTA concreto.",
    looksGood: "A estrutura está sólida — execute Optimizar antes de publicar.",
  },
  fr: {
    addTitle: "Ajoutez un titre — il est stocké séparément du corps markdown.",
    startIntro: "Commencez par 2–3 phrases d'intro avant le premier ##.",
    writeIntro: "L'intro est courte — ajoutez 2–3 phrases avec une affirmation appuyée par des données.",
    boldDefinition: "Mettez le terme clé en gras dans l'intro (**terme**).",
    addH2s: "Ajoutez des sections ## — au moins deux avant la FAQ.",
    questionH2: "Incluez au moins un ## en forme de question avec une réponse directe (40–60 mots).",
    addFaq: (h) => `Ajoutez une FAQ avec H2 « ${h} » et exactement 5 Q&R.`,
    wordCountLow: (n) => `Vous êtes à ${n} mots — les articles hero visent 800+ mots.`,
    wordCountMid: "Bon progrès — développez le corps et la FAQ avant d'optimiser.",
    addConclusion: "Terminez par une ## conclusion : 2 paragraphes et un CTA précis.",
    looksGood: "La structure est solide — lancez Optimiser avant de publier.",
  },
};

/** Instant, deterministic tips that update on every keystroke. */
export function analyzeComposerDraft(locale: Locale, title: string, content: string): string[] {
  const m = TIPS[locale] ?? TIPS.en;
  const tips: string[] = [];
  const wc = wordCount(content);
  const faqLabel = (FAQ_HEADING_BY_LOCALE[locale] ?? FAQ_HEADING_BY_LOCALE.en).replace(/^##\s*/, "");

  if (!title.trim()) tips.push(m.addTitle);

  if (wc === 0) {
    tips.push(m.startIntro);
    return tips.slice(0, 4);
  }

  if (!hasIntro(content)) tips.push(m.writeIntro);
  else if (!hasBoldDefinition(content)) tips.push(m.boldDefinition);

  const h2s = h2Count(content);
  if (h2s < 2) tips.push(m.addH2s);
  else if (!hasQuestionH2(content)) tips.push(m.questionH2);

  if (!hasFaqSection(content, locale)) tips.push(m.addFaq(faqLabel));
  else if (!hasConclusion(content)) tips.push(m.addConclusion);

  if (wc < 400) tips.push(m.wordCountLow(wc));
  else if (wc < 800) tips.push(m.wordCountMid);

  if (tips.length === 0) tips.push(m.looksGood);

  return tips.slice(0, 4);
}
