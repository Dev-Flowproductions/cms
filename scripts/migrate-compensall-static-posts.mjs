/**
 * Migrate Compensall legacy static blog guides into CMS-generated posts.
 *
 * For each legacy slug: create CMS post → AI-generate en/pt/fr → reuse legacy cover image → publish webhook.
 *
 * Usage:
 *   node scripts/migrate-compensall-static-posts.mjs
 *   node scripts/migrate-compensall-static-posts.mjs --slug=flight-cancellation
 *   node scripts/migrate-compensall-static-posts.mjs --dry-run
 */
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

const COMPENSALL_USER_ID = "bca30b9c-7a21-4b31-8375-95d4820b5ab7";
const COMPENSALL_DOMAIN = "https://www.compensall.com";
const LOCALES = ["en", "pt", "fr"];

const POST_SPECS = [
  {
    slug: "flight-cancellation",
    image: "/assets/blog/flight-cancellation.jpg",
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
  },
  {
    slug: "denied-boarding",
    image: "/assets/blog/denied-boarding.jpg",
    en: {
      title: "Denied boarding at the gate: your rights when the airline says no",
      excerpt:
        "Refused a seat despite a valid ticket? Involuntary denied boarding can trigger up to €600 in compensation plus care and re-routing.",
    },
    pt: {
      title: "Embarque recusado na porta: os seus direitos quando a companhia diz não",
      excerpt:
        "Recusado um lugar apesar de bilhete válido? Embarque recusado involuntário pode dar direito a até 600 € de compensação.",
    },
    fr: {
      title: "Embarquement refusé à la porte : vos droits quand la compagnie dit non",
      excerpt:
        "Refusé un siège malgré un billet valide ? L'embarquement refusé involontaire peut ouvrir droit à 600 € d'indemnisation.",
    },
  },
  {
    slug: "flight-delay",
    image: "/assets/blog/flight-delay.jpg",
    en: {
      title: "The 3-hour rule: when a delayed flight becomes a compensation claim",
      excerpt:
        "Not every delay pays out, but if you arrived 3+ hours late at your final destination, you may be entitled to up to €600 under EU261.",
    },
    pt: {
      title: "A regra das 3 horas: quando um voo atrasado se torna uma reclamação",
      excerpt:
        "Nem todos os atrasos pagam compensação, mas se chegou 3+ horas atrasado ao destino final, pode ter direito a até 600 €.",
    },
    fr: {
      title: "La règle des 3 heures : quand un vol retardé devient une réclamation",
      excerpt:
        "Tous les retards ne donnent pas droit à indemnisation, mais si vous êtes arrivé 3+ heures en retard, vous pouvez réclamer jusqu'à 600 €.",
    },
  },
  {
    slug: "missed-connection",
    image: "/assets/blog/missed-connection.jpg",
    en: {
      title: "Missed your connecting flight? You may still claim €600",
      excerpt:
        "Multi-leg trips confuse passengers and airlines alike. If both flights were on one booking and you arrived 3+ hours late, compensation may still apply.",
    },
    pt: {
      title: "Perdeu o voo de ligação? Ainda pode reclamar 600 €",
      excerpt:
        "Viagens com escalas confundem passageiros e companhias. Se ambos os voos estavam numa reserva e chegou 3+ horas atrasado, pode haver compensação.",
    },
    fr: {
      title: "Correspondance manquée ? Vous pouvez quand même réclamer 600 €",
      excerpt:
        "Les voyages multi-segments prêtent à confusion. Si les deux vols étaient sur une même réservation et que vous êtes arrivé 3+ heures en retard, une indemnisation peut s'appliquer.",
    },
  },
  {
    slug: "overbooking",
    image: "/assets/blog/overbooking.jpg",
    en: {
      title: "Overbooked flights: what airlines owe when there are no seats left",
      excerpt:
        "Airlines sell more tickets than seats on purpose. If you were bumped without volunteering, you may have a strong compensation claim.",
    },
    pt: {
      title: "Overbooking: o que as companhias devem quando não há lugares",
      excerpt:
        "As companhias vendem mais bilhetes do que lugares. Se foi recusado sem ter aceitado voluntariamente, pode ter uma reclamação forte.",
    },
    fr: {
      title: "Surbooking : ce que les compagnies doivent quand il n'y a plus de places",
      excerpt:
        "Les compagnies vendent plus de billets que de sièges. Si vous avez été refusé sans avoir accepté volontairement, vous pouvez avoir une réclamation solide.",
    },
  },
  {
    slug: "airline-strike",
    image: "/assets/blog/airline-strike.jpg",
    en: {
      title: "Airline strike: can you still claim compensation for a disrupted flight?",
      excerpt:
        "Strikes are the excuse airlines use most, but not every strike removes your right to compensation. Here is how courts draw the line.",
    },
    pt: {
      title: "Greve na companhia aérea: ainda pode reclamar compensação por um voo perturbado?",
      excerpt:
        "As greves são a desculpa mais usada pelas companhias, mas nem todas eliminam o direito à compensação. Veja como os tribunais decidem.",
    },
    fr: {
      title: "Grève aérienne : pouvez-vous encore réclamer une indemnisation pour un vol perturbé ?",
      excerpt:
        "Les grèves sont l'excuse la plus utilisée, mais toutes ne suppriment pas votre droit à indemnisation. Voici comment les tribunaux tranchent.",
    },
  },
  {
    slug: "passenger-rights",
    image: "/assets/blog/passenger-rights.jpg",
    en: {
      title: "EU air passenger rights explained: what airlines owe you when travel goes wrong",
      excerpt:
        "EC 261/2004 is the rulebook airlines hope you never read. Here is a plain-English guide to compensation, refunds, and care.",
    },
    pt: {
      title: "Direitos dos passageiros aéreos na UE explicados: o que as companhias devem quando algo corre mal",
      excerpt:
        "O Regulamento CE 261/2004 é a regra que as companhias preferem que não leia. Guia claro sobre compensação, reembolsos e assistência.",
    },
    fr: {
      title: "Droits des passagers aériens dans l'UE expliqués : ce que les compagnies doivent quand le voyage tourne mal",
      excerpt:
        "Le règlement CE 261/2004 est la règle que les compagnies préfèrent ignorer. Guide clair sur indemnisation, remboursements et assistance.",
    },
  },
  {
    slug: "passengers-with-disabilities",
    image: "/assets/blog/passengers-with-disabilities.jpg",
    en: {
      title: "Flying with a disability: assistance, accessibility, and compensation rights",
      excerpt:
        "EU law guarantees free assistance at every stage of your journey, and disability rights work alongside standard delay and cancellation claims.",
    },
    pt: {
      title: "Voar com deficiência: assistência, acessibilidade e direitos de compensação",
      excerpt:
        "A lei da UE garante assistência gratuita em todas as fases da viagem, e os direitos de deficiência coexistem com reclamações por atraso ou cancelamento.",
    },
    fr: {
      title: "Voyager avec un handicap : assistance, accessibilité et droits à indemnisation",
      excerpt:
        "Le droit de l'UE garantit une assistance gratuite à chaque étape du voyage, et les droits liés au handicap s'ajoutent aux réclamations pour retard ou annulation.",
    },
  },
];

const dryRun = process.argv.includes("--dry-run");
const slugFilter = process.argv.find((a) => a.startsWith("--slug="))?.split("=")[1];

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const cmsUrl =
  process.env.CMS_PUBLISH_BASE_URL?.replace(/\/$/, "") ||
  process.env.SCHEDULER_APP_URL?.replace(/\/$/, "") ||
  "https://cms.witflow.co";

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const { createClient } = await import("@supabase/supabase-js");
const { executeAgentGeneratePost } = await import("../lib/agent/execute-generate-post.ts");
const { flushAiTokenUsageWrites } = await import("../lib/agent/token-usage.ts");

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function topicForLocale(spec, locale) {
  const loc = spec[locale];
  return [
    `TOPIC LOCK: Write a Compensall guide specifically about "${loc.title}".`,
    `Use this exact title (or a very close SEO variant) in the generated JSON title field.`,
    `Context: ${loc.excerpt}`,
    "Focus on EU regulation EC 261/2004 / EU261 flight passenger compensation rights.",
    "Do NOT write about a different subject.",
  ].join(" ");
}

async function uploadLegacyCover(postId, imagePath) {
  const imageUrl = `${COMPENSALL_DOMAIN}${imagePath}`;
  const res = await fetch(imageUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch legacy cover ${imageUrl}: HTTP ${res.status}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  const coverPath = `${postId}/cover-legacy.jpg`;
  const { error: uploadErr } = await admin.storage
    .from("covers")
    .upload(coverPath, buffer, { contentType: "image/jpeg", upsert: true });
  if (uploadErr) throw new Error(`Cover upload failed: ${uploadErr.message}`);
  await admin.from("posts").update({ cover_image_path: coverPath }).eq("id", postId);
  const { data: urlData } = admin.storage.from("covers").getPublicUrl(coverPath);
  return urlData?.publicUrl ?? coverPath;
}

async function publishPost(postId) {
  const publishUrl = `${cmsUrl}/api/publish/${postId}`;
  const res = await fetch(publishUrl, {
    method: "POST",
    headers: { "x-scheduler-internal": "1" },
    signal: AbortSignal.timeout(120_000),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Publish failed (${res.status}): ${text.slice(0, 500)}`);
  }
  return text;
}

async function ensurePostRow(spec) {
  const { data: existing } = await admin
    .from("posts")
    .select("id, slug, status, webhook_status")
    .eq("slug", spec.slug)
    .eq("author_id", COMPENSALL_USER_ID)
    .maybeSingle();

  if (existing?.status === "published" && existing.webhook_status === "success") {
    return { postId: existing.id, skipped: true };
  }

  if (existing) {
    return { postId: existing.id, skipped: false };
  }

  const { data: bylineRows } = await admin
    .from("blog_authors")
    .select("id")
    .eq("user_id", COMPENSALL_USER_ID);
  const byline_author_id =
    bylineRows && bylineRows.length > 0
      ? bylineRows[Math.floor(Math.random() * bylineRows.length)].id
      : null;

  const { data: post, error } = await admin
    .from("posts")
    .insert({
      slug: spec.slug,
      primary_locale: "en",
      content_type: "hero",
      status: "draft",
      author_id: COMPENSALL_USER_ID,
      ...(byline_author_id ? { byline_author_id } : {}),
    })
    .select("id")
    .single();

  if (error || !post) throw new Error(error?.message ?? "Failed to create post");
  return { postId: post.id, skipped: false };
}

async function migrateOne(spec) {
  console.log(`\n=== ${spec.slug} ===`);
  if (dryRun) {
    console.log("dry-run: would migrate", spec.slug);
    return { slug: spec.slug, ok: true, dryRun: true };
  }

  const { postId, skipped } = await ensurePostRow(spec);
  if (skipped) {
    console.log("Already published — skipping", spec.slug, postId);
    return { slug: spec.slug, ok: true, skipped: true, postId };
  }

  console.log("Post ID:", postId);

  for (const locale of LOCALES) {
    console.log(`Generating ${locale}...`);
    const result = await executeAgentGeneratePost({
      postId,
      locale,
      focusKeyword: topicForLocale(spec, locale),
    });
    await flushAiTokenUsageWrites();
    if (!result.ok) {
      throw new Error(`${locale} generation failed: ${result.error}`);
    }
    console.log(`  ${locale} OK — ${result.data.title.slice(0, 72)}...`);

    const loc = spec[locale];
    await admin
      .from("post_localizations")
      .update({
        title: loc.title,
        excerpt: loc.excerpt,
        seo_title: loc.title.length > 60 ? loc.title.slice(0, 57) + "..." : loc.title,
        seo_description: loc.excerpt,
      })
      .eq("post_id", postId)
      .eq("locale", locale);
  }

  console.log("Uploading legacy cover...");
  const coverUrl = await uploadLegacyCover(postId, spec.image);
  console.log("Cover:", coverUrl);

  console.log("Publishing...");
  await publishPost(postId);
  console.log("Published", spec.slug);

  const { data: finalPost } = await admin
    .from("posts")
    .select("status, webhook_status")
    .eq("id", postId)
    .single();
  return { slug: spec.slug, ok: true, postId, status: finalPost?.status, webhook: finalPost?.webhook_status };
}

const specs = slugFilter ? POST_SPECS.filter((s) => s.slug === slugFilter) : POST_SPECS;
if (!specs.length) {
  console.error("No matching post specs for slug filter:", slugFilter);
  process.exit(1);
}

console.log(`Migrating ${specs.length} Compensall guide(s) via ${cmsUrl}`);

const results = [];
for (const spec of specs) {
  try {
    results.push(await migrateOne(spec));
  } catch (err) {
    console.error(`FAILED ${spec.slug}:`, err instanceof Error ? err.message : err);
    results.push({ slug: spec.slug, ok: false, error: err instanceof Error ? err.message : String(err) });
  }
}

console.log("\n=== Summary ===");
for (const r of results) {
  console.log(r.ok ? `OK  ${r.slug}` : `ERR ${r.slug}: ${r.error}`);
}

if (results.some((r) => !r.ok)) process.exit(1);
