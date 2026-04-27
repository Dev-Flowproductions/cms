/**
 * Normalizes text used in raster cover prompts for on-image headlines:
 * European sentence case per segment, while keeping acronyms in ALL CAPS.
 */

/** Lowercase → canonical on-image spelling (ALL CAPS for letters; preserve digits e.g. B2B). */
const ACRONYM_BY_LOWER: Readonly<Record<string, string>> = {
  ai: "AI",
  ml: "ML",
  api: "API",
  seo: "SEO",
  aeo: "AEO",
  geo: "GEO",
  ux: "UX",
  ui: "UI",
  ar: "AR",
  vr: "VR",
  hr: "HR",
  pr: "PR",
  qa: "QA",
  cto: "CTO",
  ceo: "CEO",
  cfo: "CFO",
  cio: "CIO",
  cpo: "CPO",
  cmo: "CMO",
  coo: "COO",
  cms: "CMS",
  crm: "CRM",
  erp: "ERP",
  cta: "CTA",
  roi: "ROI",
  roas: "ROAS",
  kpi: "KPI",
  okr: "OKR",
  nlp: "NLP",
  llm: "LLM",
  llms: "LLMS",
  gpt: "GPT",
  gpu: "GPU",
  cdn: "CDN",
  ssl: "SSL",
  tls: "TLS",
  http: "HTTP",
  https: "HTTPS",
  json: "JSON",
  xml: "XML",
  sql: "SQL",
  aws: "AWS",
  gcp: "GCP",
  saas: "SAAS",
  iot: "IOT",
  nft: "NFT",
  dao: "DAO",
  defi: "DEFI",
  rag: "RAG",
  gdpr: "GDPR",
  soc: "SOC",
  iso: "ISO",
  sdk: "SDK",
  ide: "IDE",
  cli: "CLI",
  css: "CSS",
  html: "HTML",
  pdf: "PDF",
  csv: "CSV",
  cpu: "CPU",
  ram: "RAM",
  ssd: "SSD",
  hdd: "HDD",
  dns: "DNS",
  vpn: "VPN",
  lan: "LAN",
  wan: "WAN",
  wifi: "WIFI",
  nfc: "NFC",
  rfid: "RFID",
  oem: "OEM",
  smb: "SMB",
  sme: "SME",
  b2b: "B2B",
  b2c: "B2C",
  d2c: "D2C",
  c2c: "C2C",
  p2p: "P2P",
  mcp: "MCP",
  rpc: "RPC",
  jwt: "JWT",
  oauth: "OAUTH",
  oidc: "OIDC",
  sso: "SSO",
  mfa: "MFA",
  "2fa": "2FA",
  otp: "OTP",
  cve: "CVE",
  sla: "SLA",
  slo: "SLO",
  sli: "SLI",
  tldr: "TLDR",
  faq: "FAQ",
  eol: "EOL",
  eod: "EOD",
  yoy: "YOY",
  qbr: "QBR",
  rfc: "RFC",
  rfp: "RFP",
  rfi: "RFI",
  rfq: "RFQ",
  sku: "SKU",
  upc: "UPC",
  gtin: "GTIN",
  ean: "EAN",
  asn: "ASN",
};

function caseCore(core: string): string {
  if (!core) return core;
  const lower = core.toLowerCase();
  const mapped = ACRONYM_BY_LOWER[lower];
  if (mapped) return mapped;

  // Already all caps (letters and digits) — keep (e.g. B2B, unknown acronyms)
  if (core === core.toUpperCase() && /^[A-Z0-9]{2,12}$/.test(core)) {
    return core;
  }

  return core.charAt(0).toUpperCase() + core.slice(1).toLowerCase();
}

function applyToken(token: string): string {
  if (!token) return token;
  return token.split("-").map((seg) => applySegment(seg)).join("-");
}

function applySegment(segment: string): string {
  const m = segment.match(/^([^A-Za-z0-9]*)([A-Za-z0-9][A-Za-z0-9']*)([^A-Za-z0-9]*)$/);
  if (!m) return segment;
  const [, pre, core, post] = m;
  return pre + caseCore(core) + post;
}

/**
 * Applies per-word rules for the string embedded in the image prompt.
 * Hyphenated compounds split on `-` so each part is cased independently.
 */
export function applyCoverHeadlineCasing(headline: string): string {
  const t = headline.trim();
  if (!t) return t;
  return t.split(/\s+/).map(applyToken).join(" ");
}
