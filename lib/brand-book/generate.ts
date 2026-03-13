import { GoogleGenerativeAI } from "@google/generative-ai";
import type { BrandBook, BrandBookGenerationResult } from "./types";

const BRAND_BOOK_PROMPT = `You are a brand strategist analyzing a company website to create a comprehensive brand book.

Analyze the provided website content and extract/infer the brand identity. Be thorough and professional.

Return ONLY valid JSON matching this exact structure (no markdown, no code fences):

{
  "brandName": "The proper brand name with correct capitalization",
  "tagline": "Their tagline/slogan if found, or null",
  "industry": "Main industry (e.g., 'Digital Marketing', 'Video Production')",
  "niche": "Specific niche within the industry",
  
  "voiceAttributes": ["3-5 adjectives describing brand voice"],
  "toneDescription": "2-3 sentences describing how they communicate",
  "writingStyle": "Formal/informal, technical/accessible, etc.",
  
  "targetAudience": {
    "primary": "Primary audience description",
    "secondary": "Secondary audience or null",
    "demographics": "B2B/B2C, company size, geography, etc.",
    "painPoints": ["3-5 problems their audience faces"]
  },
  
  "uniqueValueProposition": "What makes them unique in 1-2 sentences",
  "keyMessages": ["3-5 key messages they communicate"],
  "contentThemes": ["5-8 topics they should write about"],
  "topicsToAvoid": ["Topics that don't fit their brand"],
  
  "competitors": ["2-4 likely competitors based on their niche"],
  "differentiators": ["What sets them apart from competitors"],
  "marketPosition": "Premium/mid-market/budget, leader/challenger/niche",
  
  "visualIdentity": {
    "colorPalette": "Describe their color scheme (dark/light, primary colors)",
    "aestheticStyle": "Modern/classic, minimalist/bold, etc.",
    "imageStyle": "What kind of images fit their brand"
  },
  
  "contentGuidelines": {
    "preferredFormats": ["Blog posts", "Case studies", etc.],
    "callToActionStyle": "How they ask users to take action",
    "hashtagStrategy": "Relevant hashtags or null"
  },
  
  "confidence": "high/medium/low based on how much info was available"
}`;

async function fetchWebsiteContent(domain: string): Promise<string> {
  const urls = [
    `https://${domain}`,
    `https://${domain}/about`,
    `https://${domain}/about-us`,
    `https://${domain}/services`,
    `https://www.${domain}`,
  ];

  const contents: string[] = [];

  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; BrandBookBot/1.0)",
          Accept: "text/html",
        },
      });

      clearTimeout(timeout);

      if (response.ok) {
        const html = await response.text();
        const textContent = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 15000);

        if (textContent.length > 200) {
          contents.push(`--- Content from ${url} ---\n${textContent}`);
        }
      }
    } catch {
      // Skip failed URLs
    }
  }

  if (contents.length === 0) {
    throw new Error(`Could not fetch any content from ${domain}`);
  }

  return contents.join("\n\n").slice(0, 50000);
}

export async function generateBrandBook(domain: string): Promise<BrandBookGenerationResult> {
  if (!process.env.GEMINI_API_KEY) {
    return { success: false, error: "GEMINI_API_KEY not configured" };
  }

  try {
    console.log(`[brand-book] Fetching content from ${domain}...`);
    const websiteContent = await fetchWebsiteContent(domain);

    console.log(`[brand-book] Analyzing with Gemini...`);
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 4096,
      },
    });

    const prompt = `${BRAND_BOOK_PROMPT}

Website Domain: ${domain}

Website Content:
${websiteContent}

Generate the brand book JSON:`;

    let result;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        result = await model.generateContent(prompt);
        break;
      } catch (e) {
        console.log(`[brand-book] Gemini attempt ${attempts}/${maxAttempts} failed:`, e);
        if (attempts >= maxAttempts) throw e;
        await new Promise((r) => setTimeout(r, 2000 * attempts));
      }
    }

    if (!result) {
      return { success: false, error: "Failed to generate brand book after retries" };
    }

    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { success: false, error: "Invalid response format from Gemini" };
    }

    const parsed = JSON.parse(jsonMatch[0]);

    const brandBook: BrandBook = {
      brandName: parsed.brandName ?? domain,
      tagline: parsed.tagline ?? null,
      industry: parsed.industry ?? "Unknown",
      niche: parsed.niche ?? "Unknown",
      voiceAttributes: parsed.voiceAttributes ?? [],
      toneDescription: parsed.toneDescription ?? "",
      writingStyle: parsed.writingStyle ?? "",
      targetAudience: {
        primary: parsed.targetAudience?.primary ?? "",
        secondary: parsed.targetAudience?.secondary ?? null,
        demographics: parsed.targetAudience?.demographics ?? "",
        painPoints: parsed.targetAudience?.painPoints ?? [],
      },
      uniqueValueProposition: parsed.uniqueValueProposition ?? "",
      keyMessages: parsed.keyMessages ?? [],
      contentThemes: parsed.contentThemes ?? [],
      topicsToAvoid: parsed.topicsToAvoid ?? [],
      competitors: parsed.competitors ?? [],
      differentiators: parsed.differentiators ?? [],
      marketPosition: parsed.marketPosition ?? "",
      visualIdentity: {
        colorPalette: parsed.visualIdentity?.colorPalette ?? "",
        aestheticStyle: parsed.visualIdentity?.aestheticStyle ?? "",
        imageStyle: parsed.visualIdentity?.imageStyle ?? "",
      },
      contentGuidelines: {
        preferredFormats: parsed.contentGuidelines?.preferredFormats ?? [],
        callToActionStyle: parsed.contentGuidelines?.callToActionStyle ?? "",
        hashtagStrategy: parsed.contentGuidelines?.hashtagStrategy ?? null,
      },
      generatedAt: new Date().toISOString(),
      sourceUrl: domain,
      confidence: parsed.confidence ?? "medium",
    };

    console.log(`[brand-book] Generated brand book for ${brandBook.brandName}`);
    return { success: true, brandBook };
  } catch (error) {
    console.error("[brand-book] Generation failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
