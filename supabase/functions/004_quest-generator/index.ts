import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

// quest-generator: auto-assigns the next best quest for a network
// Trigger via cron or admin panel. Picks lowest response_rate active quest.
// Body: { network_id: string } — defaults to 'lightning-001'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });

  // Simple shared secret check (set QUEST_GENERATOR_SECRET in Supabase secrets)
  const secret = Deno.env.get('QUEST_GENERATOR_SECRET');
  if (secret) {
    const auth = req.headers.get('x-generator-secret');
    if (auth !== secret) return new Response('Unauthorized', { status: 401 });
  }

  const sbAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  let network_id = 'lightning-001';
  try {
    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      if (body.network_id) network_id = body.network_id;
    }
  } catch {}

  // Close current active assignment
  const { data: current } = await sbAdmin
    .from('quest_assignments')
    .select('id, quest_id')
    .eq('network_id', network_id)
    .eq('status', 'active')
    .maybeSingle();

  if (current) {
    await sbAdmin.from('quest_assignments')
      .update({ status: 'closed' })
      .eq('id', current.id);
    // Update response_rate on closed quest
    const { count } = await sbAdmin.from('quest_responses')
      .select('id', { count: 'exact', head: true })
      .eq('assignment_id', current.id);
    const { data: members } = await sbAdmin.from('users')
      .select('user_id', { count: 'exact', head: true })
      .eq('network_id', network_id)
      .eq('status', 'Living');
    const memberCount = (members as any)?.length || 87;
    const rate = count ? count / memberCount : 0;
    await sbAdmin.from('network_quests')
      .update({
        total_responses: count ?? 0,
        response_rate: rate,
        times_assigned: sbAdmin.rpc ? undefined : undefined // incremented below
      })
      .eq('id', current.quest_id);
  }

  // Pick next quest: lowest response_rate, not the one just closed, active=true
  const excludeId = current?.quest_id;
  let query = sbAdmin.from('network_quests')
    .select('id, title, prompt, quest_type')
    .eq('is_active', true)
    .order('response_rate', { ascending: true })
    .order('times_assigned', { ascending: true })
    .limit(10);

  const { data: candidates } = await query;
  const filtered = (candidates || []).filter((q: any) => q.id !== excludeId);

  if (!filtered.length) {
    return new Response(JSON.stringify({ error: 'No available quests' }), {
      status: 404, headers: { 'Content-Type': 'application/json' }
    });
  }

  const next = filtered[0];
  const today = new Date().toISOString().split('T')[0];
  const expires = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  const { data: assignment, error } = await sbAdmin.from('quest_assignments').insert({
    network_id,
    quest_id: next.id,
    assigned_date: today,
    expires_date: expires,
    status: 'active',
    response_count: 0
  }).select().single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }

  // Increment times_assigned
  await sbAdmin.rpc('increment_quest_assigned', { quest_id_input: next.id }).catch(() => {
    // rpc may not exist yet — silent fail, admin can increment manually
  });

  return new Response(JSON.stringify({
    assigned: { id: assignment.id, quest: next.title, date: today, expires }
  }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
});
