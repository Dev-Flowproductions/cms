/**
 * Brand Book type definitions
 * Auto-generated from domain analysis, used for content generation
 */

export interface BrandBook {
  // Core identity
  brandName: string;
  tagline: string | null;
  industry: string;
  niche: string;
  
  // Voice & Tone
  voiceAttributes: string[]; // e.g., ["professional", "innovative", "approachable"]
  toneDescription: string;
  writingStyle: string;
  
  // Audience
  targetAudience: {
    primary: string;
    secondary: string | null;
    demographics: string;
    painPoints: string[];
  };
  
  // Messaging
  uniqueValueProposition: string;
  keyMessages: string[];
  contentThemes: string[];
  topicsToAvoid: string[];
  
  // Competitors & Positioning
  competitors: string[];
  differentiators: string[];
  marketPosition: string;
  
  // Visual identity (described, not actual colors)
  visualIdentity: {
    colorPalette: string;
    aestheticStyle: string;
    imageStyle: string;
  };
  
  // Content guidelines
  contentGuidelines: {
    preferredFormats: string[];
    callToActionStyle: string;
    hashtagStrategy: string | null;
  };
  
  // Metadata
  generatedAt: string;
  sourceUrl: string;
  confidence: "high" | "medium" | "low";
}

export interface BrandBookGenerationResult {
  success: boolean;
  brandBook?: BrandBook;
  error?: string;
}
