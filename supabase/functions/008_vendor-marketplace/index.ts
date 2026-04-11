// ECO Vendor Marketplace Edge Function (VEND-01)
// Matches network events to opted-in vendors by type and geography.
// Only surfaces vendors when: (1) event owner has opted in, (2) vendor is active subscriber.
// Never sends vendor info to users who have not opted in.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })

    const sb = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { event_id } = await req.json()
    if (!event_id) return new Response(JSON.stringify({ error: 'event_id required' }), { status: 400, headers: corsHeaders })

    // Fetch event — verify it exists and owner has opted in
    const { data: event } = await sb.from('events')
      .select('event_id, event_type, venue_city, vendor_opted_in, owner_id, network_id')
      .eq('event_id', event_id).maybeSingle()

    if (!event) return new Response(JSON.stringify({ error: 'Event not found' }), { status: 404, headers: corsHeaders })
    if (!event.vendor_opted_in) return new Response(JSON.stringify({ vendors: [], opted_in: false }), { headers: corsHeaders })

    // Map event type to vendor types
    const vendorTypeMap: Record<string, string[]> = {
      wedding:     ['photographer','videographer','wedding_coordinator','catering','florist','music_dj','hair_makeup','transportation','venue'],
      birthday:    ['catering','photographer','music_dj','venue'],
      graduation:  ['photographer','catering','venue'],
      anniversary: ['photographer','catering','venue'],
      baby_shower: ['catering','photographer','venue'],
      reunion:     ['catering','photographer','venue','transportation'],
      memorial:    ['catering','venue'],
      other:       ['photographer','catering','venue'],
    }
    const vendorTypes = vendorTypeMap[event.event_type] || ['photographer','catering','venue']

    // Find active vendors matching type and city
    const { data: vendors } = await sb.from('vendors')
      .select('vendor_id, vendor_type, business_name, geo_city, geo_state, network_rating, network_jobs')
      .in('vendor_type', vendorTypes)
      .eq('subscription_status', 'active')
      .eq('active', true)
      .eq('geo_city', event.venue_city || '')
      .order('network_rating', { ascending: false })
      .limit(10)

    // Log the connection
    if (vendors?.length) {
      await sb.from('event_vendor_connections').insert({
        event_id: event.event_id,
        owner_id: event.owner_id,
        vendor_type: vendorTypes.join(','),
        vendor_geo: event.venue_city || '',
        status: 'pending'
      })
    }

    return new Response(
      JSON.stringify({ vendors: vendors || [], opted_in: true, count: vendors?.length || 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders })
  }
})
