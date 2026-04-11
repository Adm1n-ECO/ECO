/**
 * ECO Header v3
 * Triangle is STATIC in headerHtml — always in DOM, never touched by auth.
 * Only _eco_tri_menu contents + _eco_auth slot change on auth state.
 * Requires: config.js → supabase-js CDN → eco-client.js in <head>
 * Usage: <div id="eco-header"></div> first in <body>, <script src="header.js"></script> last in <body>
 */
(function () {
  if (window.__ECO_HEADER_INIT__) return;
  window.__ECO_HEADER_INIT__ = true;

  const path = window.location.pathname.split('/').pop() || 'home.html';
  const isEnter = path === 'enter.html';

  // ── Page center nav links ─────────────────────────────────────────────────
  const PAGE_NAV = window.ECO_NAV_LINKS || (function () {
    if (path === 'home.html' || path === '')
      return [{label:'Home',href:'home.html',active:true},
              {label:'How It Works',href:'home.html#how-it-works'},
              {label:'Manifesto',href:'home.html#manifesto'}];
    if (path === 'confluence.html')
      return [{label:'Home',href:'home.html'},
              {label:'How It Works',href:'home.html#how-it-works'},
              {label:'The Confluence',href:'confluence.html',active:true}];
    if (path === 'globe.html') return [];
    if (path === 'enter.html') return [];
    const INNER = {
      'user.html':'My Network','tree.html':'Network Tree',
      'view-currents.html':'Currents','view-pro.html':'The Funk',
      'visual-river.html':'River View','data-tools.html':'Data Tools',
      'admin.html':'Admin','member.html':'Member',
      'ai-portal.html':'AI Portal','eco_academic_review.html':'Academic Review',
      'map-pins.html':'Map Pins','network-map.html':'Network Map','photos.html':'Photos',
      'household.html':'My Household','join.html':'Invite to Network',
      'pet.html':'Pet Profile','sovereign.html':'Sovereign',
      'tribe.html':'Tribal Networks','org-admin.html':'Org Admin','gedcom-export.html':'GEDCOM Export',
      'video-upload.html':'Share Video','journey-replay.html':'Journey Replay','tribe-onboard.html':'Tribal Networks',
    };
    if (INNER[path])
      return [{label:INNER[path],href:path,active:true}];
    return [];
  })();

  // ── Public nav (signed out dropdown) ─────────────────────────────────────
  const PUBLIC_NAV = [
    {label:'Home',href:'home.html'},
    {label:'How It Works',href:'home.html#how-it-works'},
    {label:'Manifesto',href:'home.html#manifesto'},
    {label:'The Confluence',href:'confluence.html'},
  ];

  // ── App nav (signed in dropdown) ─────────────────────────────────────────
  function appNav(isSuperUser) {
    return [
      {label:'My Network',href:'user.html'},
      {label:'My Household',href:'household.html'},
      {label:'Photos',href:'photos.html'},
      {label:'Globe',href:'globe.html'},
      {label:'Tree',href:'tree.html'},
      {label:'Currents',href:'view-currents.html'},
      {label:'The Funk',href:'view-pro.html'},
      {label:'River View',href:'visual-river.html'},
      {label:'Culture',href:'confluence.html'},
      ...(isSuperUser ? [{label:'⚙ Admin',href:'admin.html'}] : []),
    ];
  }

  // ── Styles ────────────────────────────────────────────────────────────────
  const css = `
    #eco-header-bar {
      position:fixed;top:0;left:0;right:0;z-index:9000;
      height:60px;background:rgba(8,13,20,0.96);
      backdrop-filter:blur(12px);
      border-bottom:1px solid rgba(0,170,255,0.12);
      display:flex;align-items:center;
      padding:0 24px;gap:0;
      font-family:Arial,Helvetica,sans-serif;
      box-sizing:border-box;
    }
    body { padding-top:60px !important; }
    .eco-hdr-logo {
      display:flex;align-items:center;gap:10px;
      text-decoration:none;flex-shrink:0;margin-right:24px;
    }
    .eco-hdr-logo img { height:44px;width:auto;border-radius:3px; }
    .eco-hdr-wm {
      font-family:'Arial Black',Arial,sans-serif;
      font-weight:900;font-size:26px;letter-spacing:.06em;line-height:1;
    }
    .eco-hdr-wm .e{color:#00AAFF}.eco-hdr-wm .c{color:#00CC44}.eco-hdr-wm .o{color:#fff}
    .eco-hdr-sub {
      font-family:'Arial Black',Arial,sans-serif;
      font-size:8px;font-weight:700;letter-spacing:.13em;line-height:1;
      white-space:nowrap;margin-top:3px;display:block;
    }
    .eco-hdr-sub .e{color:#00AAFF}.eco-hdr-sub .c{color:#00CC44}.eco-hdr-sub .o{color:#fff}
    .eco-hdr-links { display:flex;align-items:center;gap:6px;flex:1; }
    .eco-hdr-links a {
      color:rgba(255,255,255,0.65);font-size:13px;font-weight:500;
      text-decoration:none;padding:4px 10px;border-radius:6px;
      transition:color .15s,background .15s;white-space:nowrap;
    }
    .eco-hdr-links a:hover { color:#fff;background:rgba(255,255,255,0.06); }
    .eco-hdr-links a.active { color:#00AAFF; }
    .eco-hdr-right {
      display:flex;align-items:center;gap:10px;margin-left:auto;flex-shrink:0;
    }
    /* Triangle button — always visible */
    .eco-hdr-tri {
      cursor:pointer;padding:6px;display:flex;
      align-items:center;justify-content:center;
      position:relative;flex-shrink:0;
      border-radius:6px;transition:background .15s;
    }
    .eco-hdr-tri:hover { background:rgba(255,255,255,0.06); }
    .eco-tri-svg { display:block;width:26px;height:24px;overflow:visible; }
    .eco-hdr-tri-menu {
      position:absolute;top:calc(100% + 10px);right:0;
      background:#0D1825;border:1px solid rgba(0,170,255,0.18);
      border-radius:10px;overflow:hidden;min-width:190px;
      box-shadow:0 12px 40px rgba(0,0,0,0.8);display:none;z-index:9999;
    }
    .eco-hdr-tri-menu.open { display:block; }
    .eco-hdr-tri-menu a {
      display:block;padding:10px 18px;
      color:rgba(255,255,255,0.75);font-size:13px;
      text-decoration:none;transition:background .12s;
    }
    .eco-hdr-tri-menu a:hover { background:rgba(0,170,255,0.1);color:#fff; }
    .tri-label {
      display:block;padding:8px 18px 4px;
      font-size:10px;font-weight:700;letter-spacing:.1em;
      color:rgba(255,255,255,0.3);text-transform:uppercase;
    }
    .eco-hdr-tri-menu hr { border:none;border-top:1px solid rgba(255,255,255,0.07);margin:4px 0; }
    /* Sign In pill */
    .eco-hdr-signin {
      color:#00AAFF;font-size:13px;font-weight:600;
      border:1.5px solid #00AAFF;border-radius:20px;
      padding:5px 16px;text-decoration:none;white-space:nowrap;
      transition:background .2s,color .2s;flex-shrink:0;
    }
    .eco-hdr-signin:hover { background:#00AAFF;color:#080D14; }
    /* Avatar */
    .eco-hdr-avatar {
      width:34px;height:34px;border-radius:50%;
      background:linear-gradient(135deg,#00AAFF,#00CC44);
      display:flex;align-items:center;justify-content:center;
      font-family:'Arial Black',Arial,sans-serif;font-weight:900;
      font-size:11px;color:#080D14;cursor:pointer;
      position:relative;user-select:none;flex-shrink:0;
    }
    .eco-hdr-avatar:hover { opacity:.85; }
    .eco-hdr-user-menu {
      position:absolute;top:calc(100% + 10px);right:0;
      background:#0D1825;border:1px solid rgba(0,170,255,0.18);
      border-radius:10px;overflow:hidden;min-width:160px;
      box-shadow:0 12px 40px rgba(0,0,0,0.8);display:none;z-index:9999;
    }
    .eco-hdr-user-menu.open { display:block; }
    .eco-hdr-user-menu a, .eco-hdr-user-menu button {
      display:block;width:100%;padding:10px 18px;
      color:rgba(255,255,255,0.75);font-size:13px;
      font-family:Arial,Helvetica,sans-serif;text-align:left;
      background:none;border:none;cursor:pointer;
      box-sizing:border-box;text-decoration:none;transition:background .12s;
    }
    .eco-hdr-user-menu a:hover,.eco-hdr-user-menu button:hover {
      background:rgba(0,170,255,0.1);color:#fff;
    }
    .um-name {
      display:block;padding:10px 18px 6px;
      font-size:11px;font-weight:700;letter-spacing:.06em;
      color:rgba(255,255,255,0.4);text-transform:uppercase;
    }
    .eco-hdr-user-menu hr { border:none;border-top:1px solid rgba(255,255,255,0.07);margin:4px 0; }
    .eco-hdr-so { color:rgba(255,80,80,0.85) !important; }
    .eco-hdr-so:hover { color:#ff5050 !important;background:rgba(255,60,60,0.08) !important; }

    /* ── Mobile ≤640px ─────────────────────────────────────────────────── */
    @media(max-width:640px){
      #eco-header-bar{padding:0 14px;gap:0;}
      .eco-hdr-logo{margin-right:10px;}
      .eco-hdr-logo img{height:36px;}
      .eco-hdr-wm{font-size:20px;}
      .eco-hdr-sub{font-size:7px;}
      .eco-hdr-links{display:none;}
      .eco-hdr-right{gap:8px;}
      .eco-hdr-signin{padding:5px 12px;font-size:12px;}
    }
    /* ── Mobile ≤400px ─────────────────────────────────────────────────── */
    @media(max-width:400px){
      .eco-hdr-wm{font-size:18px;}
    }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ── Static header HTML — triangle is ALWAYS here ─────────────────────────
  const linksHtml = PAGE_NAV.map(l =>
    '<a href="' + l.href + '"' + (l.active ? ' class="active"' : '') + '>' + l.label + '</a>'
  ).join('');

  // Triangle built with DOM createElement to guarantee SVG namespace
  const headerHtml = [
    '<nav id="eco-header-bar">',
    '  <a class="eco-hdr-logo" href="home.html">',
    '    <img src="images/eco-logo.png" alt="ECO" onerror="this.style.display=\'none\'">',
    '    <div>',
    '      <div class="eco-hdr-wm"><span class="e">E</span><span class="c">C</span><span class="o">O</span></div>',
    '      <span class="eco-hdr-sub"><span class="e">Eternal</span><span class="c">Current</span><span class="o">.Online</span></span>',
    '    </div>',
    '  </a>',
    '  <div class="eco-hdr-links">' + linksHtml + '</div>',
    '  <div class="eco-hdr-right">',
    '    <div class="eco-hdr-tri" id="_eco_tri">',
    '      <div id="_eco_tri_icon" style="width:26px;height:24px;flex-shrink:0;"></div>',
    '      <div class="eco-hdr-tri-menu" id="_eco_tri_menu"></div>',
    '    </div>',
    '    <div id="_eco_auth"></div>',
    '  </div>',
    '</nav>',
  ].join('');

  // ── Build triangle via createElementNS (guaranteed SVG namespace) ────────
  function drawTriangle() {
    const wrap = document.getElementById('_eco_tri_icon');
    if (!wrap) return;
    const NS = 'http://www.w3.org/2000/svg';

    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', '26');
    svg.setAttribute('height', '24');
    svg.setAttribute('viewBox', '0 0 26 24');
    svg.style.cssText = 'display:block;overflow:visible;';

    function line(x1, y1, x2, y2, color) {
      const el = document.createElementNS(NS, 'line');
      el.setAttribute('x1', x1); el.setAttribute('y1', y1);
      el.setAttribute('x2', x2); el.setAttribute('y2', y2);
      el.setAttribute('stroke', color);
      el.setAttribute('stroke-width', '2');
      el.setAttribute('stroke-linecap', 'round');
      return el;
    }
    function dot(cx, cy, r, color) {
      const el = document.createElementNS(NS, 'circle');
      el.setAttribute('cx', cx); el.setAttribute('cy', cy);
      el.setAttribute('r', r); el.setAttribute('fill', color);
      return el;
    }

    svg.appendChild(line(13, 2, 1, 22, '#00AAFF'));
    svg.appendChild(line(13, 2, 25, 22, '#00CC44'));
    svg.appendChild(line(1, 22, 25, 22, '#ffffff'));
    svg.querySelector('line:last-child').setAttribute('stroke-opacity', '0.35');
    svg.appendChild(dot(13, 2, 2.5, '#ffffff'));
    svg.appendChild(dot(1, 22, 2.5, '#00AAFF'));
    svg.appendChild(dot(25, 22, 2.5, '#00CC44'));

    wrap.appendChild(svg);
  }

  // ── Fill triangle dropdown ────────────────────────────────────────────────
  function fillTriMenu(links, label) {
    const menu = document.getElementById('_eco_tri_menu');
    if (!menu) return;
    menu.innerHTML = '<span class="tri-label">' + label + '</span>'
      + links.map(l => '<a href="' + l.href + '">' + l.label + '</a>').join('')
      + '<hr><a href="enter.html" style="color:#00AAFF;font-weight:600;">Sign In →</a>';
  }

  function fillTriMenuSignedIn(links) {
    const menu = document.getElementById('_eco_tri_menu');
    if (!menu) return;
    menu.innerHTML = '<span class="tri-label">App</span>'
      + links.map(l => '<a href="' + l.href + '">' + l.label + '</a>').join('');
  }

  // ── Auth slot ─────────────────────────────────────────────────────────────
  function setAuthSignedOut() {
    const auth = document.getElementById('_eco_auth');
    if (!auth) return;
    auth.innerHTML = isEnter ? '' : '<a class="eco-hdr-signin" href="enter.html">Sign In</a>';
    fillTriMenu(PUBLIC_NAV, 'Navigate');
  }

  function setAuthSignedIn(name, isSuperUser) {
    const auth = document.getElementById('_eco_auth');
    if (!auth) return;
    const ini = name.split(' ').filter(Boolean).slice(0,2).map(w => w[0].toUpperCase()).join('');
    auth.innerHTML = [
      '<div class="eco-hdr-avatar" id="_eco_av" title="' + name + '">',
      ini,
      '  <div class="eco-hdr-user-menu" id="_eco_um">',
      '    <span class="um-name">' + name + '</span><hr>',
      '    <a href="user.html">My Network</a>',
      '    <a href="home.html">Home</a>',
      '    <button id="_eco_chpw">🔐 Change Password</button>',
      '    <button id="_eco_elder">🔡 Elder Mode</button><hr>',
      '    <button class="eco-hdr-so" id="_eco_so">Sign Out</button>',
      '  </div>',
      '</div>',
    ].join('');

    // If on home.html, inject My Network into center nav
    if (path === 'home.html' || path === '') {
      const links = document.querySelector('.eco-hdr-links');
      if (links && !links.querySelector('[href="user.html"]')) {
        const a = document.createElement('a');
        a.href = 'user.html'; a.textContent = 'My Network';
        links.appendChild(a);
      }
    }

    fillTriMenuSignedIn(appNav(isSuperUser));

    const closeAll = () => {
      document.getElementById('_eco_tri_menu')?.classList.remove('open');
      document.getElementById('_eco_um')?.classList.remove('open');
    };
    document.getElementById('_eco_av')?.addEventListener('click', e => {
      e.stopPropagation();
      const m = document.getElementById('_eco_um');
      const was = m?.classList.contains('open');
      closeAll(); if (!was) m?.classList.add('open');
    });
    document.getElementById('_eco_so')?.addEventListener('click', async () => {
      await window.ecoSB?.auth.signOut();
      window.location.href = 'home.html';
    });
    document.getElementById('_eco_elder')?.addEventListener('click', () => {
      closeAll();
      toggleElderMode();
    });
    document.getElementById('_eco_chpw')?.addEventListener('click', () => {
      closeAll();
      showPasswordModal();
    });
    document.addEventListener('click', closeAll);
  }

  // ── Elder Mode ────────────────────────────────────────────────────────────
  const ELDER_CSS = `
    /* Elder Mode — modest size increase for readability */
    body.eco-elder {
      font-size: 15px !important;
    }
    body.eco-elder p, body.eco-elder div, body.eco-elder span,
    body.eco-elder li, body.eco-elder td, body.eco-elder th {
      font-size: inherit;
      line-height: 1.65 !important;
    }
    body.eco-elder .fc-name, body.eco-elder .sec-title { font-size: 1.05rem !important; }
    body.eco-elder .fc-body, body.eco-elder .fc-meta { font-size: 14px !important; }
    body.eco-elder .stat-num { font-size: 1.5rem !important; }
    body.eco-elder .sec-label, body.eco-elder .stat-label { font-size: 12px !important; }
    body.eco-elder input, body.eco-elder textarea, body.eco-elder select {
      font-size: 14px !important;
      padding: 11px 14px !important;
    }
    body.eco-elder .tab-btn { font-size: 13px !important; }
    body.eco-elder .eco-header-bar { height: 60px !important; }
  `;

  let _elderStyleEl = null;

  function applyElderMode(on) {
    if (on) {
      document.body.classList.add('eco-elder');
      if (!_elderStyleEl) {
        _elderStyleEl = document.createElement('style');
        _elderStyleEl.id = 'eco-elder-css';
        _elderStyleEl.textContent = ELDER_CSS;
        document.head.appendChild(_elderStyleEl);
      }
      const btn = document.getElementById('_eco_elder');
      if (btn) btn.textContent = '🔡 Elder Mode ✓';
    } else {
      document.body.classList.remove('eco-elder');
      document.getElementById('eco-elder-css')?.remove();
      _elderStyleEl = null;
      const btn = document.getElementById('_eco_elder');
      if (btn) btn.textContent = '🔡 Elder Mode';
    }
  }

  async function toggleElderMode() {
    const isOn = document.body.classList.contains('eco-elder');
    const newState = !isOn;
    applyElderMode(newState);
    localStorage.setItem('eco-elder-mode', newState ? '1' : '0');
    // Persist to DB if we have a profile
    if (window.ecoSB && window._ecoUserId) {
      await window.ecoSB.from('users')
        .update({ elder_mode: newState })
        .eq('user_id', window._ecoUserId);
    }
  }

  // Restore elder mode on page load from localStorage (instant, no flash)
  if (localStorage.getItem('eco-elder-mode') === '1') {
    // Apply immediately before paint
    document.addEventListener('DOMContentLoaded', () => applyElderMode(true));
  }

  // ── Password Change Modal ─────────────────────────────────────────────────
  function showPasswordModal() {
    const existing = document.getElementById('_eco_pw_modal');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.id = '_eco_pw_modal';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;font-family:Arial,Helvetica,sans-serif;';
    overlay.innerHTML = `
      <div style="background:#0D1825;border:1px solid rgba(0,170,255,.22);border-radius:14px;width:100%;max-width:380px;padding:28px 24px;">
        <div style="font-family:'Arial Black',Arial,sans-serif;font-weight:900;font-size:1rem;color:#E8F4F0;margin-bottom:6px;">Change Password</div>
        <div style="font-size:12px;color:#5A8A80;margin-bottom:20px;">Enter a new password for your account.</div>
        <input id="_eco_pw_in" type="password" placeholder="New password (min 8 characters)"
          style="width:100%;background:#080D14;border:1px solid rgba(0,170,255,.22);border-radius:8px;padding:10px 14px;font-size:13px;color:#E8F4F0;outline:none;margin-bottom:10px;box-sizing:border-box;font-family:Arial,sans-serif;">
        <input id="_eco_pw_in2" type="password" placeholder="Confirm new password"
          style="width:100%;background:#080D14;border:1px solid rgba(0,170,255,.22);border-radius:8px;padding:10px 14px;font-size:13px;color:#E8F4F0;outline:none;margin-bottom:16px;box-sizing:border-box;font-family:Arial,sans-serif;">
        <div id="_eco_pw_msg" style="font-size:12px;min-height:18px;margin-bottom:12px;"></div>
        <div style="display:flex;gap:8px;">
          <button id="_eco_pw_save" style="flex:1;background:#00AAFF;color:#080D14;border:none;border-radius:8px;padding:10px;font-family:'Arial Black',Arial,sans-serif;font-weight:900;font-size:12px;cursor:pointer;">Save Password</button>
          <button id="_eco_pw_cancel" style="background:none;border:1px solid rgba(255,255,255,.12);color:#5A8A80;border-radius:8px;padding:10px 18px;font-size:12px;cursor:pointer;">Cancel</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    document.getElementById('_eco_pw_in').focus();
    document.getElementById('_eco_pw_cancel').onclick = () => overlay.remove();
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    document.getElementById('_eco_pw_save').onclick = async () => {
      const pw1 = document.getElementById('_eco_pw_in').value;
      const pw2 = document.getElementById('_eco_pw_in2').value;
      const msg = document.getElementById('_eco_pw_msg');
      const btn = document.getElementById('_eco_pw_save');
      if (pw1.length < 8) { msg.style.color='#ff6666'; msg.textContent='Password must be at least 8 characters.'; return; }
      if (pw1 !== pw2) { msg.style.color='#ff6666'; msg.textContent='Passwords do not match.'; return; }
      btn.textContent='Saving…'; btn.style.opacity='.6';

      try {
        // Race updateUser against a 8s timeout — magic link sessions can hang indefinitely
        const result = await Promise.race([
          window.ecoSB.auth.updateUser({ password: pw1 }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000))
        ]);

        if (result.error) throw result.error;

        msg.style.color='#00CC44';
        msg.textContent='✓ Password updated. You can now sign in with your new password.';
        btn.textContent='Done ✓'; btn.style.opacity='1';
        setTimeout(() => overlay.remove(), 2200);

      } catch(e) {
        // Timeout or session scope error — send password reset email instead
        btn.textContent='Save Password'; btn.style.opacity='1';

        if (e.message === 'timeout' || e.message?.includes('session') || e.message?.includes('token')) {
          // Get current user email and send reset link
          const { data: { session } } = await window.ecoSB.auth.getSession().catch(()=>({data:{session:null}}));
          const email = session?.user?.email;
          if (email) {
            await window.ecoSB.auth.resetPasswordForEmail(email, {
              redirectTo: 'https://eternalcurrent.online/enter.html?mode=reset'
            });
            msg.style.color='#00CC44';
            msg.textContent='✓ Password reset link sent to ' + email + '. Check your email.';
            btn.textContent='Email sent ✓';
          } else {
            msg.style.color='#ff6666';
            msg.textContent='Session expired. Please sign out and sign back in, then try again.';
          }
        } else {
          msg.style.color='#ff6666';
          msg.textContent = e.message || 'Something went wrong. Please try again.';
        }
      }
    };
  }

  // ── Triangle click ────────────────────────────────────────────────────────
  function bindTriangle() {
    document.getElementById('_eco_tri')?.addEventListener('click', e => {
      e.stopPropagation();
      const m = document.getElementById('_eco_tri_menu');
      const was = m?.classList.contains('open');
      document.getElementById('_eco_um')?.classList.remove('open');
      m?.classList.toggle('open', !was);
    });
  }

  // ── Inject ────────────────────────────────────────────────────────────────
  function inject() {
    document.querySelectorAll('#eco-nav-bar,#eco-header-bar').forEach(el => el.remove());
    let slot = document.getElementById('eco-header');
    if (!slot) {
      slot = document.createElement('div');
      document.body.insertBefore(slot, document.body.firstChild);
    }
    slot.innerHTML = headerHtml;
    drawTriangle();
    bindTriangle();
    renderAuth();
  }

  // ── Auth render ───────────────────────────────────────────────────────────
  // ── Auth render ───────────────────────────────────────────────────────────
  async function applySession(session) {
    const client = window.ecoSB;
    if (!client) return;
    try {
      if (session?.user) {
        const { data: p } = await client.from('users')
          .select('user_id,full_name,platform_role,elder_mode').eq('auth_id', session.user.id).maybeSingle();
        const name = (p?.full_name) || (session.user.email || '').split('@')[0] || 'You';
        if (p?.user_id) window._ecoUserId = p.user_id;
        // Restore elder mode from DB preference
        if (p?.elder_mode) applyElderMode(true);
        setAuthSignedIn(name, p?.platform_role === 'SuperUser' || p?.platform_role === 'SystemAdmin');
      } else {
        setAuthSignedOut();
      }
    } catch (e) {
      setAuthSignedOut();
    }
  }

  async function renderAuth() {
    // Wait for ecoSB to be ready — never show Sign In just because client isn't ready yet
    let client = window.ecoSB;
    if (!client) {
      let attempts = 0;
      await new Promise(resolve => {
        const check = () => {
          client = window.ecoSB;
          if (client || attempts++ > 20) resolve();
          else setTimeout(check, 50);
        };
        check();
      });
    }
    if (!client) { setAuthSignedOut(); return; }

    // Single resolution path: onAuthStateChange fires INITIAL_SESSION from localStorage
    // This is the most reliable path — catches persisted sessions without a separate getSession call
    let resolved = false;
    client.auth.onAuthStateChange((_event, session) => {
      resolved = true;
      applySession(session);
    });

    // Fallback: if onAuthStateChange hasn't fired within 800ms, call getSession directly
    // This covers edge cases where INITIAL_SESSION doesn't fire
    setTimeout(async () => {
      if (resolved) return;
      try {
        const { data: { session } } = await client.auth.getSession();
        applySession(session);
      } catch (e) {
        setAuthSignedOut();
      }
    }, 800);
  }

  // ── Run ───────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();


// ── Network Switcher ─────────────────────────────────────────
async function ecoCheckNetworkSwitcher(userId) {
  if (!window.ecoSB || !userId) return;
  try {
    const { data } = await window.ecoSB.from('user_network_memberships')
      .select('network_id, networks(name)')
      .eq('user_id', userId).eq('status', 'active');
    if (!data || data.length < 1) return;
    const existing = document.getElementById('eco-network-switcher');
    if (existing) return;
    const wrap = document.createElement('div');
    wrap.id = 'eco-network-switcher';
    wrap.style.cssText = 'position:fixed;bottom:60px;right:16px;z-index:999;background:#0D1820;border:1px solid rgba(0,170,255,.3);border-radius:10px;padding:10px 14px;font-size:12px;font-family:Arial,Helvetica,sans-serif;';
    wrap.innerHTML = '<div style="color:rgba(255,255,255,.4);font-size:10px;font-weight:700;letter-spacing:.06em;margin-bottom:6px;">YOUR NETWORKS</div>'
      + '<div style="color:#00AAFF;font-weight:700;cursor:default;padding:3px 0;">lightning-001 (current)</div>'
      + data.map(m => '<div style="color:rgba(255,255,255,.6);cursor:pointer;padding:3px 0;" onclick="alert(\'Switching networks coming soon — ' + (m.networks?.name || m.network_id) + '\')">→ ' + (m.networks?.name || m.network_id) + '</div>').join('');
    document.body.appendChild(wrap);
  } catch(e) {}
}
window.ecoCheckNetworkSwitcher = ecoCheckNetworkSwitcher;

// ── Service Worker Registration ──────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .catch(err => console.warn('[ECO] SW registration failed:', err));
  });
}
