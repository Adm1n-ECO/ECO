// Pulse Generator — nightly Edge Function
// Cards are permanent. System recycles high-wow cards. Never generates religion or politics.
// Schedule: 0 2 * * * (2am UTC daily)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';

const SYSTEM_PROMPT = `You are the cultural discovery engine for EternalCurrent.Online — a platform connecting families across geographies and generations.

Generate ONE surprising cultural discovery thread. Reveal an unexpected connection — an origin story, a shared word, a person whose roots surprise, a food or art form that traveled, parallel lives across cultures, a word that exists in multiple languages for the same feeling.

FRAMING RULES (permanent, never override):
- State the thread plainly. Two facts that coexist without one explaining the other.
- Never frame as pride, achievement, or representation.
- Never use: "breaking barriers", "pioneer for X community", "proud", "our people"
- The surprise IS the point. No lesson. No takeaway. No moral.
- HARD EXCLUDE: religion, religious figures, religious texts, political figures, political movements, wars framed politically, national pride narratives. These topics divide. Pulse only connects.

Good examples:
- A food that traveled from one continent to another and became unrecognizable as foreign
- A word that means the same thing in five languages that never met
- A musician, scientist, or athlete whose cultural origin is genuinely surprising
- A migration pattern that connected two groups no one thinks of as connected

Return ONLY valid JSON, no markdown, no preamble:
{
  "title": "Short surprising headline — max 12 words",
  "body": "Exactly two sentences. The thread. Plain and specific.",
  "search_query": "3-5 words for Wikipedia search",
  "cultural_tags": ["tag1", "tag2", "tag3"]
}`;

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  const CLAUDE_KEY = Deno.env.get('CLAUDE_API_KEY')!;

  try {
    // Get all active networks
    const { data: networks } = await supabase
      .from('users')
      .select('network_id')
      .not('network_id', 'is', null);

    const networkIds = [...new Set((networks || []).map((r: any) => r.network_id))];
    const results = [];
    const today = new Date().toISOString().split('T')[0];

    for (const networkId of networkIds) {

      // Skip if already served today
      const { data: todayCard } = await supabase
        .from('pulse_cards')
        .select('id')
        .eq('network_id', networkId)
        .eq('card_date', today)
        .maybeSingle();

      if (todayCard) { results.push({ networkId, status: 'already_served' }); continue; }

      // RESURFACE: check for high-wow cards not shown recently (>30 days ago or never resurfaced)
      // A card qualifies for resurfacing if wow_count >= 3 and last_shown < 30 days ago
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
      const { data: resurfaceCandidate } = await supabase
        .from('pulse_cards')
        .select('*')
        .eq('network_id', networkId)
        .gte('wow_count', 3)
        .or(`last_shown.is.null,last_shown.lt.${thirtyDaysAgo}`)
        .neq('card_date', today)
        .order('wow_count', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (resurfaceCandidate && Math.random() < 0.25) {
        // 25% chance to resurface a beloved card instead of generating new
        await supabase.from('pulse_cards').update({
          card_date: today,
          last_shown: today,
          resurface_count: resurfaceCandidate.resurface_count + 1
        }).eq('id', resurfaceCandidate.id);
        results.push({ networkId, status: 'resurfaced', title: resurfaceCandidate.title });
        continue;
      }

      // BUILD network cultural profile
      const { data: members } = await supabase
        .from('users')
        .select('birth_location, cultural_origin, languages_spoken, current_location')
        .eq('network_id', networkId)
        .not('status', 'eq', 'Passed');

      const origins = [...new Set((members || [])
        .flatMap((m: any) => [m.cultural_origin, m.birth_location])
        .filter(Boolean))].slice(0, 10);

      const languages = [...new Set((members || [])
        .flatMap((m: any) => Array.isArray(m.languages_spoken) ? m.languages_spoken : [])
        .filter(Boolean))].slice(0, 8);

      const locations = [...new Set((members || [])
        .map((m: any) => m.current_location)
        .filter(Boolean))].slice(0, 8);

      // Pull recent titles to avoid repetition
      const { data: recentCards } = await supabase
        .from('pulse_cards')
        .select('title')
        .eq('network_id', networkId)
        .order('card_date', { ascending: false })
        .limit(20);

      const recentTitles = (recentCards || []).map((c: any) => c.title).join(' | ');

      const userPrompt = `Network cultural profile:
Origins: ${origins.join(', ') || 'diverse global diaspora'}
Languages: ${languages.join(', ') || 'varied'}
Current locations: ${locations.join(', ') || 'global'}

Recent cards already shown (do not repeat these topics): ${recentTitles || 'none yet'}

Generate a discovery that connects naturally to this network's cultural threads.`;

      // GENERATE new card
      const aiRes = await fetch(ANTHROPIC_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 300,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userPrompt }]
        })
      });

      const aiData = await aiRes.json();
      const raw = aiData.content?.[0]?.text || '';

      let card;
      try {
        card = JSON.parse(raw.replace(/```json|```/g, '').trim());
      } catch {
        results.push({ networkId, status: 'parse_error', raw });
        continue;
      }

      const { error } = await supabase.from('pulse_cards').insert({
        network_id: networkId,
        card_date: today,
        title: card.title,
        body: card.body,
        search_query: card.search_query,
        cultural_tags: card.cultural_tags || [],
        generated_by: 'claude',
        last_shown: today,
        source: 'generated'
      });

      results.push({ networkId, status: error ? 'db_error' : 'ok', error, title: card.title });
    }

    return new Response(JSON.stringify({ ok: true, date: today, results }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
});
