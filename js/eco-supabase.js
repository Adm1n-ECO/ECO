// ============================================================
// EternalCurrent.Online — Supabase Client
// File: /js/eco-supabase.js
// Replaces: Apps Script Web App fetch() calls (now retired)
//
// USAGE: Add this script tag to any ECO page before page scripts:
//   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
//   <script src="/js/eco-supabase.js"></script>
//
// Then call the functions below directly in your page scripts.
// ============================================================

const ECO_SUPABASE_URL  = 'https://bmipnqgofezjcllhmczg.supabase.co';
const ECO_SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtaXBucWdvZmV6amNsbGhtY3pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNjIxMDksImV4cCI6MjA5MDgzODEwOX0._izGhqbWSzdF9HbafNjxLeCVtgVWojpSMIotXSJbH0k';

const ecoDb = supabase.createClient(ECO_SUPABASE_URL, ECO_SUPABASE_KEY);


// ============================================================
// GLOBE — globe-live.html
// Fetches all public profiles for arc rendering.
// Returns array of { user_id, full_name, birth_location,
//   current_location, cultural_origin, status }
// Globe color key: India=amber, Fiji=teal, Pakistan=purple
// ============================================================

async function ecoGetGlobeProfiles() {
  const { data, error } = await ecoDb
    .from('users_public')
    .select('user_id, full_name, birth_location, current_location, cultural_origin, status')
    .eq('network_id', 'lightning-001')
    .neq('status', 'Placeholder')
    .not('birth_location', 'is', null)
    .not('current_location', 'is', null);

  if (error) {
    console.error('[ECO] Globe profiles fetch failed:', error.message);
    return [];
  }
  return data;
}


// ============================================================
// GLOBE COLOR HELPER
// Maps cultural_origin to the locked brand arc colors.
// ============================================================

function ecoGlobeArcColor(cultural_origin) {
  const map = {
    'India':    '#FFB347', // amber
    'Fiji':     '#00CED1', // teal
    'Pakistan': '#9B59B6', // purple
    'Adopted':  '#00AAFF', // electric blue — ECO brand
  };
  return map[cultural_origin] || '#FFFFFF'; // white fallback
}


// ============================================================
// CONSTELLATION / NETWORK DIRECTORY — index.html
// Fetches full network member list for the constellation view
// and the network directory panel.
// Returns array of full users_public rows for lightning-001.
// ============================================================

async function ecoGetNetworkMembers() {
  const { data, error } = await ecoDb
    .from('users_public')
    .select('*')
    .eq('network_id', 'lightning-001')
    .order('last_name', { ascending: true });

  if (error) {
    console.error('[ECO] Network members fetch failed:', error.message);
    return [];
  }
  return data;
}


// ============================================================
// RELATIONSHIPS — constellation arc rendering
// Fetches all relationships for lightning-001.
// Returns array of { subject_id, target_id, relation_type, branch }
// ============================================================

async function ecoGetRelationships() {
  const { data, error } = await ecoDb
    .from('relationships')
    .select('subject_id, target_id, relation_type, branch')
    .eq('network_id', 'lightning-001');

  if (error) {
    console.error('[ECO] Relationships fetch failed:', error.message);
    return [];
  }
  return data;
}


// ============================================================
// BANNER STATEMENTS — index.html rotating banner
// Fetches all active founding statements in display order.
// ============================================================

async function ecoGetBannerStatements() {
  const { data, error } = await ecoDb
    .from('banner_statements')
    .select('statement_id, statement_text, display_order')
    .eq('status', 'Active')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('[ECO] Banner statements fetch failed:', error.message);
    return [];
  }
  return data;
}


// ============================================================
// BANNER IMPRESSION — log an engagement event
// Called when a visitor views or interacts with a statement.
// statement_id: UUID from banner_statements
// engaged: boolean — true if clicked/interacted, false if just viewed
// ============================================================

async function ecoLogBannerImpression(statement_id, engaged = false) {
  const { error } = await ecoDb
    .from('banner_impressions')
    .insert({ statement_id, engaged });

  if (error) {
    console.warn('[ECO] Banner impression log failed (non-critical):', error.message);
  }
}


// ============================================================
// CULTURAL VOCAB LIBRARY — confluence.html
// Fetches public global terms, optionally filtered by language.
// language: string or null for all languages
// ============================================================

async function ecoGetVocabLibrary(language = null) {
  let query = ecoDb
    .from('cultural_vocab_library')
    .select('vocab_id, term, language, cultural_origin, definition, usage_example')
    .eq('visible_to', 'all')
    .is('network_id', null)
    .eq('reviewed', true)
    .order('language', { ascending: true })
    .order('term',     { ascending: true });

  if (language) {
    query = query.eq('language', language);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[ECO] Vocab library fetch failed:', error.message);
    return [];
  }
  return data;
}


// ============================================================
// VOCAB LANGUAGES — confluence.html language filter
// Returns array of distinct language values in the library.
// ============================================================

async function ecoGetVocabLanguages() {
  const { data, error } = await ecoDb
    .from('cultural_vocab_library')
    .select('language')
    .eq('visible_to', 'all')
    .is('network_id', null)
    .eq('reviewed', true);

  if (error) {
    console.error('[ECO] Vocab languages fetch failed:', error.message);
    return [];
  }

  // Return unique sorted language values
  return [...new Set(data.map(r => r.language))].sort();
}


// ============================================================
// WAITLIST SIGNUP — index.html pre-launch capture
// Inserts a new waitlist entry.
// entry: { email, name, network_interest, referral_user_id }
// ============================================================

async function ecoJoinWaitlist(entry) {
  const { error } = await ecoDb
    .from('waitlist')
    .insert({
      email:            entry.email            || null,
      name:             entry.name             || null,
      network_interest: entry.network_interest || null,
      referral_user_id: entry.referral_user_id || null,
      status:           'Pending'
    });

  if (error) {
    console.error('[ECO] Waitlist insert failed:', error.message);
    return { success: false, message: error.message };
  }
  return { success: true };
}


// ============================================================
// SINGLE PROFILE — detail panel / perspective switching
// Fetches one member's full public profile by user_id.
// Used when a visitor clicks a node to view from that
// member's perspective.
// ============================================================

async function ecoGetProfile(user_id) {
  const { data, error } = await ecoDb
    .from('users_public')
    .select('*')
    .eq('user_id', user_id)
    .single();

  if (error) {
    console.error('[ECO] Profile fetch failed:', error.message);
    return null;
  }
  return data;
}


// ============================================================
// JOURNEYS — location history for a single member
// Used in profile panels and future migration arc rendering.
// ============================================================

async function ecoGetJourneys(person_id) {
  const { data, error } = await ecoDb
    .from('journeys')
    .select('journey_id, location_name, category, reason, year')
    .eq('person_id', person_id)
    .eq('visible_to', 'all')
    .order('year', { ascending: true });

  if (error) {
    console.error('[ECO] Journeys fetch failed:', error.message);
    return [];
  }
  return data;
}


// ============================================================
// PETS — for a single owner
// ============================================================

async function ecoGetPets(owner_id) {
  const { data, error } = await ecoDb
    .from('pets')
    .select('pet_id, name, type, status, bio, photo_id')
    .eq('owner_id', owner_id)
    .eq('visible_to', 'all');

  if (error) {
    console.error('[ECO] Pets fetch failed:', error.message);
    return [];
  }
  return data;
}


// ============================================================
// ACCOMPLISHMENTS — network feed
// Fetches shared accomplishments for the network feed.
// ============================================================

async function ecoGetAccomplishments() {
  const { data, error } = await ecoDb
    .from('accomplishments')
    .select('accomplishment_id, subject_name, subject_user_id, title, description, organization_or_venue, location, date_mm_yyyy, accomplishment_type, currents')
    .eq('network_id', 'lightning-001')
    .eq('share_with_network', true)
    .eq('status', 'Active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[ECO] Accomplishments fetch failed:', error.message);
    return [];
  }
  return data;
}


// ============================================================
// SMOKE TEST — run in browser console to verify connection
// Open browser console on any ECO page and call: ecoSmokeTest()
// ============================================================

async function ecoSmokeTest() {
  console.log('[ECO] Running smoke test...');

  const profiles    = await ecoGetGlobeProfiles();
  const members     = await ecoGetNetworkMembers();
  const rels        = await ecoGetRelationships();
  const banners     = await ecoGetBannerStatements();
  const vocab       = await ecoGetVocabLibrary();
  const languages   = await ecoGetVocabLanguages();

  console.table({
    'Globe profiles':      profiles.length,
    'Network members':     members.length,
    'Relationships':       rels.length,
    'Banner statements':   banners.length,
    'Vocab terms':         vocab.length,
    'Vocab languages':     languages.length,
  });

  console.log('[ECO] Smoke test complete. Expected: ~55 globe profiles, 104 members, 448 rels, 15 banners, 36 vocab, 4 languages.');
  return { profiles, members, rels, banners, vocab, languages };
}
