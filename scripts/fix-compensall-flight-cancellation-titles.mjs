/** Fix legacy titles on flight-cancellation and republish. */
import fs from "fs";

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

const postId = "8b011d9d-5bc1-4539-99e2-77838559602c";
const cmsUrl =
  process.env.CMS_PUBLISH_BASE_URL?.replace(/\/$/, "") ||
  process.env.SCHEDULER_APP_URL?.replace(/\/$/, "") ||
  "https://cms.witflow.co";

const titles = {
  en: {
    title: "Flight cancelled? You may be owed up to €600. Here's how to claim",
    excerpt:
      "Short-notice cancellations often trigger fixed compensation under EU261, on top of a refund or re-routing. Here is how to tell if your flight qualifies.",
  },
  pt: {
    title: "Voo cancelado? Pode ter direito a até 600 €. Saiba como reclamar",
    excerpt:
      "Cancelamentos de curta antecedência frequentemente dão direito a compensação fixa ao abrigo do EU261, para além de reembolso ou reencaminhamento.",
  },
  fr: {
    title: "Vol annulé ? Vous pouvez avoir droit à 600 €. Voici comment réclamer",
    excerpt:
      "Les annulations de dernière minute déclenchent souvent une indemnisation fixe au titre du EU261, en plus d'un remboursement ou d'un réacheminement.",
  },
};

const { createClient } = await import("@supabase/supabase-js");
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

for (const [locale, loc] of Object.entries(titles)) {
  await admin
    .from("post_localizations")
    .update({
      title: loc.title,
      excerpt: loc.excerpt,
      seo_title: loc.title.length > 60 ? `${loc.title.slice(0, 57)}...` : loc.title,
      seo_description: loc.excerpt,
    })
    .eq("post_id", postId)
    .eq("locale", locale);
}

const res = await fetch(`${cmsUrl}/api/publish/${postId}`, {
  method: "POST",
  headers: { "x-scheduler-internal": "1" },
});
console.log(res.status, await res.text());
