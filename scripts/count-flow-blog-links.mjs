const slug = "augmented-reality-marketing-2026";
const html = await fetch(`https://flowproductions.pt/en/blog?t=${Date.now()}`).then((r) => r.text());
const chunks = html.split(`href="/en/blog/${slug}"`);
let june23 = 0;
let june25 = 0;
let withCover = 0;
let gray = 0;
for (let i = 1; i < chunks.length; i++) {
  const c = chunks[i].slice(0, 800);
  if (c.includes("23 June 2026")) june23++;
  if (c.includes("25 June 2026")) june25++;
  if (c.includes("bg-gray-200")) gray++;
  else if (c.includes("_next/image") || c.includes("supabase.co")) withCover++;
}
console.log({ cards: chunks.length - 1, june23, june25, withCover, gray });
