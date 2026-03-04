/**
 * One-time seed: creates an admin user and an editor user in Supabase Auth,
 * then assigns roles. Run with: SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/seed-users.mjs
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env.
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

const ADMIN_EMAIL = 'admin@cms.local';
const ADMIN_PASSWORD = 'AdminPass123!';
const EDITOR_EMAIL = 'editor@cms.local';
const EDITOR_PASSWORD = 'EditorPass123!';

async function main() {
  let adminId;
  let editorId;

  const { data: existing } = await supabase.auth.admin.listUsers();
  const existingEmails = (existing?.users ?? []).map((u) => u.email);

  if (existingEmails.includes(ADMIN_EMAIL)) {
    adminId = existing.users.find((u) => u.email === ADMIN_EMAIL).id;
    console.log('Admin user already exists:', ADMIN_EMAIL);
  } else {
    const { data: admin, error: e1 } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: 'Admin User' },
    });
    if (e1) {
      console.error('Failed to create admin:', e1.message);
      process.exit(1);
    }
    adminId = admin.user.id;
    console.log('Created admin:', ADMIN_EMAIL);
  }

  if (existingEmails.includes(EDITOR_EMAIL)) {
    editorId = existing.users.find((u) => u.email === EDITOR_EMAIL).id;
    console.log('Editor user already exists:', EDITOR_EMAIL);
  } else {
    const { data: editor, error: e2 } = await supabase.auth.admin.createUser({
      email: EDITOR_EMAIL,
      password: EDITOR_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: 'Editor User' },
    });
    if (e2) {
      console.error('Failed to create editor:', e2.message);
      process.exit(1);
    }
    editorId = editor.user.id;
    console.log('Created editor:', EDITOR_EMAIL);
  }

  const { data: profiles } = await supabase.from('profiles').select('id').in('id', [adminId, editorId]);
  const profileIds = new Set((profiles ?? []).map((p) => p.id));
  if (!profileIds.has(adminId) || !profileIds.has(editorId)) {
    console.log('Waiting for profile trigger…');
    await new Promise((r) => setTimeout(r, 1000));
  }

  const { error: roleErr } = await supabase.from('user_roles').upsert(
    [
      { user_id: adminId, role_id: 'admin' },
      { user_id: editorId, role_id: 'editor' },
    ],
    { onConflict: 'user_id,role_id' }
  );
  if (roleErr) {
    console.error('Failed to assign roles:', roleErr.message);
    process.exit(1);
  }
  console.log('Assigned roles: admin -> admin, editor -> editor');
  console.log('\nLogin with:');
  console.log('  Admin:  ', ADMIN_EMAIL, '/', ADMIN_PASSWORD);
  console.log('  Editor: ', EDITOR_EMAIL, '/', EDITOR_PASSWORD);
}

main();
