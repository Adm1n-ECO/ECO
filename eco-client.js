/**
 * ECO Shared Supabase Client  v3
 * Must load in <head> after config.js and supabase-js CDN.
 * Creates window.ecoSB once — all pages and nav.js use this instance.
 * When running inside an iframe, uses a separate storageKey to prevent
 * localStorage auth lock contention with the parent page.
 */
(function() {
  if (window.ecoSB) return;
  try {
    const inIframe = window.self !== window.top;
    window.ecoSB = supabase.createClient(SUPABASE_URL, SUPABASE_ANON, {
      auth: {
        storage: window.localStorage,
        storageKey: inIframe ? 'eco-auth-iframe' : 'eco-auth-v1',
        persistSession: !inIframe,   // iframes don't need to persist session
        detectSessionInUrl: !inIframe,
        autoRefreshToken: !inIframe,
        // No flowType — uses default implicit flow, avoids PKCE lock conflicts
      }
    });
    console.log('[ECO] Supabase client ready');
  } catch(e) {
    console.error('[ECO] Client init failed:', e.message);
  }
})();

/**
 * ECO Auth Guard — patient session check
 * Waits up to 2s for session to load from localStorage before redirecting.
 * Use on all auth-gated pages instead of immediate getSession check.
 *
 * Usage: ecoAuthGuard(callback) — callback receives session when confirmed
 */
window.ecoAuthGuard = function(onSession) {
  let attempts = 0;
  const maxAttempts = 40; // 40 × 50ms = 2 seconds

  function check() {
    const client = window.ecoSB;
    if (!client) {
      if (attempts++ < maxAttempts) setTimeout(check, 50);
      else window.location.href = 'enter.html?next=' + encodeURIComponent(window.location.pathname.split('/').pop() + window.location.search);
      return;
    }
    client.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        onSession(session);
      } else if (attempts++ < maxAttempts) {
        // Session not in localStorage yet — give it more time
        setTimeout(check, 50);
      } else {
        // Confirmed no session after 2s — redirect
        window.location.href = 'enter.html?next=' + encodeURIComponent(window.location.pathname.split('/').pop() + window.location.search);
      }
    }).catch(() => {
      if (attempts++ < maxAttempts) setTimeout(check, 50);
      else window.location.href = 'enter.html';
    });
  }
  check();
};
