const slug = "augmented-reality-marketing-2026";
const html = await fetch(`https://flowproductions.pt/en/blog?t=${Date.now()}`).then((r) => r.text());

// Extract each card block around AR links
const re = /<a class="group block" href="([^"]*augmented-reality[^"]*)"[^>]*>([\s\S]*?)<\/a>/g;
let m;
let i = 0;
while ((m = re.exec(html)) !== null) {
  i++;
  const href = m[1];
  const inner = m[2].slice(0, 600);
  const hasCover = inner.includes("supabase.co") || inner.includes("_next/image");
  const hasGray = inner.includes("bg-gray-200");
  const dateMatch = inner.match(/(\d{1,2} June 2026)/);
  console.log(`\n=== Card ${i} ===`);
  console.log("href:", href);
  console.log("date:", dateMatch?.[1] ?? "?");
  console.log("cover:", hasCover, "gray:", hasGray);
}

console.log("\nTotal AR card links:", i);
