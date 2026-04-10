// ECO Weekly Digest Edge Function
// Uses Namecheap SMTP directly — no third-party email service needed
//
// Required secrets (set in Supabase Dashboard → Edge Functions → Secrets):
//   SMTP_HOST     = mail.eternalcurrent.online
//   SMTP_PORT     = 465
//   SMTP_USER     = noreply@eternalcurrent.online
//   SMTP_PASS     = your Namecheap email password
//
// Deploy: supabase functions deploy weekly-digest --project-ref prbeyvmsyxuiggqwiham

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SmtpClient } from 'https://deno.land/x/smtp@v0.7.0/mod.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SMTP_HOST = Deno.env.get('SMTP_HOST') || 'mail.eternalcurrent.online';
const SMTP_PORT = parseInt(Deno.env.get('SMTP_PORT') || '465');
const SMTP_USER = Deno.env.get('SMTP_USER') || 'noreply@eternalcurrent.online';
const SMTP_PASS = Deno.env.get('SMTP_PASS')!;

Deno.serve(async (_req) => {
  const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const weekOf = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const [
    { count: newNotes },
    { count: newPhotos },
    { count: newPins },
    { data: newMembers },
  ] = await Promise.all([
    sb.from('family_notes').select('id', { count: 'exact', head: true }).gte('created_at', since),
    sb.from('member_photos').select('id', { count: 'exact', head: true }).gte('created_at', since),
    sb.from('map_pins').select('id', { count: 'exact', head: true }).gte('created_at', since).eq('network_id', 'lightning-001'),
    sb.from('users').select('full_name').gte('created_at', since).eq('network_id', 'lightning-001').limit(5),
  ]);

  const hasActivity = (newNotes || 0) > 0 || (newPhotos || 0) > 0 || (newPins || 0) > 0 || (newMembers || []).length > 0;
  if (!hasActivity) return new Response(JSON.stringify({ sent: 0, reason: 'no activity' }), { status: 200 });

  const { data: recipients } = await sb
    .from('users').select('full_name,auth_id')
    .eq('network_id', 'lightning-001').eq('status', 'Living').limit(200);

  if (!recipients?.length) return new Response(JSON.stringify({ sent: 0 }), { status: 200 });

  const newMemberLine = (newMembers || []).length
    ? `<p style="margin:0 0 10px"><strong style="color:#00AAFF">New this week:</strong> ${(newMembers || []).map(m => m.full_name).join(', ')} joined.</p>` : '';

  const buildHtml = (firstName: string) => `<!DOCTYPE html>
<html><body style="background:#080D14;color:#E8F4F0;font-family:Arial,sans-serif;margin:0;padding:32px 24px;max-width:540px;">
  <div style="font-family:'Arial Black',Arial,sans-serif;font-weight:900;font-size:1.3rem;margin-bottom:4px">
    <span style="color:#00AAFF">E</span><span style="color:#00CC44">C</span><span style="color:#FFF">O</span>
  </div>
  <div style="font-size:11px;color:#3A5A54;letter-spacing:.12em;text-transform:uppercase;margin-bottom:20px">Week of ${weekOf}</div>
  <p style="font-size:15px;margin:0 0 18px">${firstName}, here's your network this week.</p>
  <div style="display:flex;gap:12px;margin-bottom:18px;flex-wrap:wrap">
    ${(newNotes || 0) > 0 ? `<div style="background:#0D1820;border:1px solid rgba(0,170,255,.2);border-radius:10px;padding:14px 18px;text-align:center"><div style="font-size:1.5rem;font-weight:900;color:#00AAFF">${newNotes}</div><div style="font-size:11px;color:#3A5A54;margin-top:3px">Notes</div></div>` : ''}
    ${(newPhotos || 0) > 0 ? `<div style="background:#0D1820;border:1px solid rgba(0,204,68,.2);border-radius:10px;padding:14px 18px;text-align:center"><div style="font-size:1.5rem;font-weight:900;color:#00CC44">${newPhotos}</div><div style="font-size:11px;color:#3A5A54;margin-top:3px">Photos</div></div>` : ''}
    ${(newPins || 0) > 0 ? `<div style="background:#0D1820;border:1px solid rgba(0,170,255,.2);border-radius:10px;padding:14px 18px;text-align:center"><div style="font-size:1.5rem;font-weight:900;color:#00AAFF">${newPins}</div><div style="font-size:11px;color:#3A5A54;margin-top:3px">Places</div></div>` : ''}
  </div>
  ${newMemberLine}
  <a href="https://eternalcurrent.online" style="display:inline-block;background:#00AAFF;color:#080D14;padding:11px 24px;border-radius:8px;font-weight:900;font-size:13px;text-decoration:none">Open ECO →</a>
  <div style="margin-top:28px;padding-top:16px;border-top:1px solid rgba(255,255,255,.06);font-size:11px;color:#3A5A54">EternalCurrent.Online · Only Yours. Forever.</div>
</body></html>`;

  const client = new SmtpClient();
  await client.connectTLS({ hostname: SMTP_HOST, port: SMTP_PORT, username: SMTP_USER, password: SMTP_PASS });

  let sent = 0;
  for (const r of recipients) {
    if (!r.auth_id) continue;
    try {
      const { data: authUser } = await sb.auth.admin.getUserById(r.auth_id);
      const email = authUser?.user?.email;
      if (!email) continue;
      const firstName = (r.full_name || '').split(' ')[0] || 'there';
      await client.send({
        from: `${FROM_NAME} <${SMTP_USER}>`,
        to: email,
        subject: `ECO · Week of ${weekOf}`,
        content: buildHtml(firstName),
        html: buildHtml(firstName),
      });
      sent++;
    } catch (_) { /* skip failed recipient */ }
  }

  await client.close();
  return new Response(JSON.stringify({ sent, week: weekOf }), { status: 200 });
});

const FROM_NAME = 'EternalCurrent';
