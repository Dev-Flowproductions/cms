import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const k = t.slice(0, i);
    let v = t.slice(i + 1);
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnv(".env.local");
const key = process.env.GEMINI_API_KEY?.trim();
if (!key) {
  console.log("No GEMINI_API_KEY");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(key);
const modelName = process.env.GEMINI_TEXT_MODEL?.trim() || "gemini-3.1-flash-lite";
const model = genAI.getGenerativeModel({ model: modelName, systemInstruction: "Return valid JSON only." });
try {
  const result = await model.generateContent(
    'Write a short blog post JSON with keys title, slug, content_md, seo_title, seo_description, focus_keyword, faq_blocks, seo_score, cover_image_description. Topic: AI marketing.',
  );
  const text = result.response.text().trim();
  console.log(modelName, "OK", text.slice(0, 120));
} catch (err) {
  console.log(modelName, "FAIL", err instanceof Error ? err.message : err);
}
