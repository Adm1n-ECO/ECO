import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // Only allow authenticated SystemAdmin / SuperUser callers
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })

    // Verify caller is admin
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )
    const { data: { user }, error: authErr } = await userClient.auth.getUser()
    if (authErr || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })

    const { data: caller } = await userClient.from('users').select('platform_role').eq('auth_id', user.id).maybeSingle()
    if (!caller || !['SystemAdmin','SuperUser'].includes(caller.platform_role)) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders })
    }

    const { auth_id, new_email } = await req.json()
    if (!auth_id || !new_email) return new Response(JSON.stringify({ error: 'auth_id and new_email required' }), { status: 400, headers: corsHeaders })

    // Use service role to update auth email
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    const { data, error } = await adminClient.auth.admin.updateUserById(auth_id, { email: new_email })
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders })

    // Also update users table email field if it exists
    await adminClient.from('users').update({ email: new_email }).eq('auth_id', auth_id)

    return new Response(JSON.stringify({ ok: true, user: data.user }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders })
  }
})
