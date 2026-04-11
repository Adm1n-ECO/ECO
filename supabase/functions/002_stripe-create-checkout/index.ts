import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const STRIPE_SECRET = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
const SITE_URL = 'https://eternalcurrent.online';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type' } });

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization') ?? '';
    const sb = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: authErr } = await sb.auth.getUser();
    if (authErr || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const { tier } = await req.json();
    if (!tier) return new Response(JSON.stringify({ error: 'tier required' }), { status: 400 });

    // Get price ID from DB
    const sbAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    const { data: tierData } = await sbAdmin.from('subscription_tiers')
      .select('stripe_price_id, display_name').eq('tier', tier).single();
    if (!tierData?.stripe_price_id) return new Response(JSON.stringify({ error: 'No price ID for tier. Set stripe_price_id in subscription_tiers.' }), { status: 400 });

    // Get or create Stripe customer
    const { data: sub } = await sbAdmin.from('user_subscriptions')
      .select('stripe_customer_id').eq('user_id', user.id).maybeSingle();

    let customerId = sub?.stripe_customer_id;
    if (!customerId) {
      const custRes = await fetch('https://api.stripe.com/v1/customers', {
        method: 'POST',
        headers: { Authorization: `Bearer ${STRIPE_SECRET}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email: user.email ?? '', 'metadata[user_id]': user.id })
      });
      const cust = await custRes.json();
      customerId = cust.id;
      await sbAdmin.from('user_subscriptions').update({ stripe_customer_id: customerId }).eq('user_id', user.id);
    }

    // Create checkout session
    const params = new URLSearchParams({
      'customer': customerId,
      'mode': 'subscription',
      'line_items[0][price]': tierData.stripe_price_id,
      'line_items[0][quantity]': '1',
      'success_url': `${SITE_URL}/user.html?upgrade=success`,
      'cancel_url': `${SITE_URL}/user.html?upgrade=cancel`,
      'allow_promotion_codes': 'true',
      'subscription_data[metadata][user_id]': user.id,
      'subscription_data[metadata][tier]': tier,
    });

    const sessRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${STRIPE_SECRET}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });
    const session = await sessRes.json();
    if (session.error) return new Response(JSON.stringify({ error: session.error.message }), { status: 400 });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
