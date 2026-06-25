const slug = "augmented-reality-marketing-2026";
const html = await fetch("https://flowproductions.pt/en/blog").then((r) => r.text());

// Pull JSON-ish blobs containing the slug
const blobRe = /(\{[^{}]{0,800}augmented-reality-marketing-2026[^{}]{0,800}\})/g;
let m;
let i = 0;
while ((m = blobRe.exec(html)) !== null && i < 10) {
  i++;
  console.log(`\n--- blob ${i} ---`);
  console.log(m[1].slice(0, 500));
}

// Search for internalId / entryId patterns
for (const pat of ["entryId", "internalId", "webhookId", "cmsPostId", "publishedAt", "createdAt"]) {
  const re = new RegExp(`${pat}[^,\\}]{0,80}`, "g");
  const hits = html.match(re)?.filter((h) => h.includes("2026") || h.includes("c74e24c7")) ?? [];
  if (hits.length) console.log(pat, hits.slice(0, 5));
}
