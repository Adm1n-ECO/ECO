import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const STRIPE_SECRET = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
const WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';

// Minimal Stripe signature verification
async function verifyStripeSignature(payload: string, sigHeader: string, secret: string): Promise<boolean> {
  const parts = sigHeader.split(',');
  const ts = parts.find(p => p.startsWith('t='))?.split('=')[1];
  const sig = parts.find(p => p.startsWith('v1='))?.split('=')[1];
  if (!ts || !sig) return false;
  const signed = `${ts}.${payload}`;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signed));
  const computed = Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2,'0')).join('');
  return computed === sig;
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const payload = await req.text();
  const sigHeader = req.headers.get('stripe-signature') ?? '';

  if (WEBHOOK_SECRET) {
    const valid = await verifyStripeSignature(payload, sigHeader, WEBHOOK_SECRET);
    if (!valid) return new Response('Invalid signature', { status: 400 });
  }

  let event;
  try { event = JSON.parse(payload); } catch { return new Response('Bad JSON', { status: 400 }); }

  const sbAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const obj = event.data?.object;

  if (event.type === 'checkout.session.completed') {
    const userId = obj.subscription_data?.metadata?.user_id ?? obj.metadata?.user_id;
    const tier   = obj.subscription_data?.metadata?.tier   ?? obj.metadata?.tier;
    const stripeSubId = obj.subscription;
    const custId = obj.customer;
    if (userId && tier) {
      await sbAdmin.from('user_subscriptions').update({
        tier,
        status: 'active',
        stripe_customer_id: custId,
        stripe_subscription_id: stripeSubId,
      }).eq('user_id', userId);
    }
  }

  else if (event.type === 'invoice.payment_succeeded') {
    const subId = obj.subscription;
    const periodEnd = obj.lines?.data?.[0]?.period?.end;
    if (subId) {
      await sbAdmin.from('user_subscriptions').update({
        status: 'active',
        current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        grace_period_end: null,
      }).eq('stripe_subscription_id', subId);
    }
  }

  else if (event.type === 'invoice.payment_failed') {
    const subId = obj.subscription;
    if (subId) {
      const graceEnd = new Date(Date.now() + 7 * 86400000).toISOString();
      await sbAdmin.from('user_subscriptions').update({
        status: 'grace',
        grace_period_end: graceEnd,
      }).eq('stripe_subscription_id', subId);
    }
  }

  else if (event.type === 'customer.subscription.deleted') {
    const subId = obj.id;
    if (subId) {
      await sbAdmin.from('user_subscriptions').update({
        status: 'cancelled',
        tier: 'free',
        stripe_subscription_id: null,
        current_period_end: null,
      }).eq('stripe_subscription_id', subId);
    }
  }

  else if (event.type === 'customer.subscription.updated') {
    // Handle plan changes (upgrade/downgrade)
    const subId = obj.id;
    const newPriceId = obj.items?.data?.[0]?.price?.id;
    if (subId && newPriceId) {
      const { data: tierRow } = await sbAdmin.from('subscription_tiers')
        .select('tier').eq('stripe_price_id', newPriceId).maybeSingle();
      if (tierRow?.tier) {
        await sbAdmin.from('user_subscriptions').update({
          tier: tierRow.tier,
          status: obj.status === 'active' ? 'active' : obj.status,
        }).eq('stripe_subscription_id', subId);
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
