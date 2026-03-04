/**
 * Updates Supabase Auth URL config (Site URL + Redirect URLs) via Management API.
 * Run: SUPABASE_ACCESS_TOKEN=xxx node scripts/update-auth-urls.mjs
 * Get token: https://supabase.com/dashboard/account/tokens
 */
const PROJECT_REF = 'lltufugrmmzdagqypscg';
const SITE_URL = 'http://localhost:3000';
const REDIRECT_URLS = [
  'http://localhost:3000/**',
  'http://127.0.0.1:3000/**',
];

const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) {
  console.error('Set SUPABASE_ACCESS_TOKEN (Personal Access Token from https://supabase.com/dashboard/account/tokens)');
  process.exit(1);
}

async function main() {
  const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      site_url: SITE_URL,
      uri_allow_list: REDIRECT_URLS.join(','),
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    console.error('Management API error:', res.status, t);
    process.exit(1);
  }
  console.log('Auth URL config updated:');
  console.log('  Site URL:', SITE_URL);
  console.log('  Redirect URLs:', REDIRECT_URLS.join(', '));
}

main();
