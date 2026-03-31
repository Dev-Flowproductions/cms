"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

const BRAND_VOICES = [
  { id: "professional", label: "Professional & Authoritative" },
  { id: "friendly", label: "Friendly & Approachable" },
  { id: "innovative", label: "Innovative & Forward-thinking" },
  { id: "luxurious", label: "Luxurious & Premium" },
  { id: "casual", label: "Casual & Conversational" },
];

async function saveBrandInfo(data: {
  domain: string;
  companyName: string;
  logoFile: File | null;
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string | null;
  fontStyle: string;
  brandVoice: string;
  brandGuidelinesText: string;
}) {
  const formData = new FormData();
  formData.append("domain", data.domain);
  formData.append("companyName", data.companyName);
  formData.append("primaryColor", data.primaryColor);
  formData.append("secondaryColor", data.secondaryColor);
  if (data.tertiaryColor) formData.append("tertiaryColor", data.tertiaryColor);
  formData.append("fontStyle", data.fontStyle);
  formData.append("brandVoice", data.brandVoice);
  if (data.brandGuidelinesText.trim()) {
    formData.append("brandGuidelinesText", data.brandGuidelinesText.trim());
  }
  if (data.logoFile) {
    formData.append("logo", data.logoFile);
  }

  const res = await fetch("/api/onboarding/brand", {
    method: "POST",
    body: formData,
  });
  return res.json() as Promise<{ error?: string }>;
}

export default function OnboardingBrandPage() {
  const t = useTranslations("onboarding.brand");
  const tStep = useTranslations("onboarding");
  const locale = useLocale();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const guidelinesFileRef = useRef<HTMLInputElement>(null);

  const [domain, setDomain] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#7c5cfc");
  const [secondaryColor, setSecondaryColor] = useState("#22d3a0");
  const [tertiaryColor, setTertiaryColor] = useState<string | null>("#f59e0b");
  const [fontStyle, setFontStyle] = useState("");
  const [brandVoice, setBrandVoice] = useState("professional");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brandGuidelinesText, setBrandGuidelinesText] = useState("");
  const [guidelinesExtracting, setGuidelinesExtracting] = useState(false);

  async function handleGuidelinesFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setGuidelinesExtracting(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/onboarding/guidelines-extract", {
        method: "POST",
        body: fd,
      });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? t("guidelinesExtractError"));
        return;
      }
      setBrandGuidelinesText(data.text ?? "");
    } catch {
      setError(t("guidelinesExtractError"));
    } finally {
      setGuidelinesExtracting(false);
    }
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!domain.trim() || !companyName.trim()) return;

    setLoading(true);
    setError(null);

    const result = await saveBrandInfo({
      domain: domain.trim(),
      companyName: companyName.trim(),
      logoFile,
      primaryColor,
      secondaryColor,
      tertiaryColor: tertiaryColor || null,
      fontStyle: fontStyle.trim() || "modern",
      brandVoice,
      brandGuidelinesText,
    });

    setLoading(false);

    if (result.error) {
      if (result.error === "domain_taken") {
        setError(t("errorDomainTaken"));
      } else {
        setError(result.error);
      }
      return;
    }

    router.push(`/${locale}/onboarding/google`);
  }

  const inputStyle = {
    background: "var(--surface-raised)",
    border: "1px solid var(--border)",
    color: "var(--text)",
  };

  return (
    <div className="w-full max-w-xl animate-slide-up">
      <p
        className="text-xs font-semibold uppercase tracking-widest text-center mb-8"
        style={{ color: "var(--text-faint)" }}
      >
        {tStep("stepOf", { current: 1, total: 2 })}
      </p>

      <div
        className="rounded-2xl p-8"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.3)",
        }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-2"
          style={{ color: "var(--accent)" }}
        >
          {t("eyebrow")}
        </p>
        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text)" }}>
          {t("title")}
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
          {t("subtitle")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Domain & Company Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
                {t("domainLabel")}
              </label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                required
                placeholder="yourdomain.com"
                className="w-full px-4 py-3 rounded-xl text-sm transition-all outline-none focus:ring-2 focus:ring-[var(--accent)]"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
                {t("companyNameLabel")}
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                placeholder="Your Company Name"
                className="w-full px-4 py-3 rounded-xl text-sm transition-all outline-none focus:ring-2 focus:ring-[var(--accent)]"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
              {t("logoLabel")}
            </label>
            <div
              className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all hover:border-[var(--accent)]"
              style={{ background: "var(--surface-raised)", border: "1px dashed var(--border)" }}
              onClick={() => fileInputRef.current?.click()}
            >
              {logoPreview ? (
                <img src={logoPreview} alt="Logo preview" className="w-16 h-16 object-contain rounded-lg" />
              ) : (
                <div
                  className="w-16 h-16 rounded-lg flex items-center justify-center"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                  </svg>
                </div>
              )}
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                  {logoPreview ? t("logoChange") : t("logoUpload")}
                </p>
                <p className="text-xs" style={{ color: "var(--text-faint)" }}>
                  {t("logoHint")}
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Colors */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
              {t("colorsLabel")}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0"
                  style={{ background: "transparent" }}
                />
                <div>
                  <p className="text-xs font-medium" style={{ color: "var(--text)" }}>{t("primaryColor")}</p>
                  <p className="text-xs font-mono" style={{ color: "var(--text-faint)" }}>{primaryColor}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0"
                  style={{ background: "transparent" }}
                />
                <div>
                  <p className="text-xs font-medium" style={{ color: "var(--text)" }}>{t("secondaryColor")}</p>
                  <p className="text-xs font-mono" style={{ color: "var(--text-faint)" }}>{secondaryColor}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
                <input
                  type="color"
                  value={tertiaryColor ?? "#f59e0b"}
                  onChange={(e) => setTertiaryColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0"
                  style={{ background: "transparent" }}
                />
                <div>
                  <p className="text-xs font-medium" style={{ color: "var(--text)" }}>{t("tertiaryColor")}</p>
                  <p className="text-xs font-mono" style={{ color: "var(--text-faint)" }}>{tertiaryColor ?? "—"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Font Style */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
              {t("fontStyleLabel")}
            </label>
            <input
              type="text"
              value={fontStyle}
              onChange={(e) => setFontStyle(e.target.value)}
              placeholder={t("fontStylePlaceholder")}
              className="w-full px-4 py-3 rounded-xl text-sm transition-all outline-none focus:ring-2 focus:ring-[var(--accent)]"
              style={inputStyle}
            />
          </div>

          {/* Brand guidelines: upload to fill, or type by hand */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
              {t("guidelinesLabel")}
            </label>
            <p className="text-xs mb-2" style={{ color: "var(--text-faint)" }}>
              {t("guidelinesHint")}
            </p>
            <div className="flex flex-wrap gap-2 mb-2">
              <button
                type="button"
                disabled={guidelinesExtracting}
                onClick={() => guidelinesFileRef.current?.click()}
                className="px-3 py-2 rounded-xl text-xs font-medium transition-all disabled:opacity-50"
                style={{
                  background: "var(--surface-raised)",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                }}
              >
                {guidelinesExtracting ? t("guidelinesExtracting") : t("guidelinesUpload")}
              </button>
              <input
                ref={guidelinesFileRef}
                type="file"
                accept=".pdf,.txt,.md,.markdown,.text,text/plain,text/markdown,application/pdf,application/x-pdf,application/octet-stream"
                onChange={handleGuidelinesFile}
                className="hidden"
              />
            </div>
            <textarea
              value={brandGuidelinesText}
              onChange={(e) => setBrandGuidelinesText(e.target.value)}
              rows={16}
              placeholder={t("guidelinesPlaceholder")}
              className="w-full min-h-[min(52vh,28rem)] resize-y rounded-xl px-4 py-4 text-sm transition-all outline-none focus:ring-2 focus:ring-[var(--accent)]"
              style={inputStyle}
            />
          </div>

          {/* Brand Voice */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
              {t("brandVoiceLabel")}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {BRAND_VOICES.map((voice) => (
                <button
                  key={voice.id}
                  type="button"
                  onClick={() => setBrandVoice(voice.id)}
                  className="px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left"
                  style={{
                    background: brandVoice === voice.id ? "var(--accent)" : "var(--surface-raised)",
                    color: brandVoice === voice.id ? "white" : "var(--text)",
                    border: `1px solid ${brandVoice === voice.id ? "var(--accent)" : "var(--border)"}`,
                  }}
                >
                  {voice.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div
              className="px-4 py-3 rounded-xl text-sm"
              style={{
                background: "rgba(255,92,106,0.08)",
                border: "1px solid rgba(255,92,106,0.25)",
                color: "var(--danger)",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !domain.trim() || !companyName.trim()}
            className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            style={{
              background: "var(--accent)",
              color: "white",
              boxShadow: loading ? "none" : "0 0 24px rgba(124,92,252,0.35)",
            }}
          >
            {loading ? t("saving") : t("continue")}
          </button>
        </form>
      </div>
    </div>
  );
}
