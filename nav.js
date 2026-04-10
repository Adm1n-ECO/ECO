/**
 * ECO Auth Nav Widget v4
 * Requires: config.js + supabase-js CDN + eco-client.js (all in <head>)
 * Place <div id="eco-nav-auth"></div> in nav, then <script src="nav.js"> at end of body.
 */
(function () {
  if (window.__ECO_NAV_INIT__) return;
  window.__ECO_NAV_INIT__ = true;

  const style = document.createElement('style');
  style.textContent = `
    #eco-nav-auth { display:flex; align-items:center; }
    .eco-signin-btn {
      color:#00AAFF; font-family:Arial,Helvetica,sans-serif; font-size:13px;
      font-weight:600; border:1.5px solid #00AAFF; border-radius:20px;
      padding:5px 16px; text-decoration:none; white-space:nowrap;
      transition:background .2s,color .2s;
    }
    .eco-signin-btn:hover { background:#00AAFF; color:#080D14; }
    .eco-avatar {
      width:34px; height:34px; border-radius:50%;
      background:linear-gradient(135deg,#00AAFF,#00CC44);
      display:flex; align-items:center; justify-content:center;
      font-family:'Arial Black',Arial,sans-serif; font-weight:900;
      font-size:11px; color:#080D14; cursor:pointer;
      position:relative; user-select:none; flex-shrink:0;
    }
    .eco-avatar:hover { opacity:.85; }
    .eco-user-menu {
      position:absolute; top:calc(100% + 8px); right:0;
      background:#0E1520; border:1px solid rgba(0,170,255,0.2);
      border-radius:10px; overflow:hidden; min-width:160px;
      box-shadow:0 8px 32px rgba(0,0,0,0.7); display:none; z-index:99999;
    }
    .eco-user-menu.open { display:block; }
    .eco-user-menu a, .eco-user-menu button {
      display:block; width:100%; padding:10px 16px;
      color:rgba(255,255,255,0.8); font-size:13px;
      font-family:Arial,Helvetica,sans-serif; text-align:left;
      background:none; border:none; cursor:pointer;
      box-sizing:border-box; text-decoration:none; transition:background .15s;
    }
    .eco-user-menu a:hover, .eco-user-menu button:hover {
      background:rgba(0,170,255,0.08); color:#fff;
    }
    .eco-sep { height:1px; background:rgba(255,255,255,0.07); margin:2px 0; }
    .eco-signout { color:rgba(255,80,80,0.85) !important; }
    .eco-signout:hover { background:rgba(255,60,60,0.08) !important; color:#ff5050 !important; }
  `;
  document.head.appendChild(style);

  function initNav() {
    const slots = document.querySelectorAll('#eco-nav-auth');
    slots.forEach((s, i) => { if (i > 0) s.remove(); });
    let slot = document.getElementById('eco-nav-auth');
    if (!slot) {
      slot = document.createElement('div');
      slot.id = 'eco-nav-auth';
      slot.style.cssText = 'position:fixed;top:14px;right:20px;z-index:99998;';
      document.body.appendChild(slot);
    }
    const oldBtn = document.getElementById('btn-signin');
    if (oldBtn) oldBtn.style.display = 'none';

    const client = window.ecoSB;
    if (!client) {
      console.warn('[ECO nav] ecoSB not ready');
      return;
    }

    const render = async () => {
      slot = document.getElementById('eco-nav-auth');
      if (!slot) return;
      const { data:{ session } } = await client.auth.getSession();

      if (session?.user) {
        const oldPill = document.getElementById('btn-signin');
        if (oldPill) oldPill.style.display = 'none';

        const { data: profile } = await client
          .from('users').select('full_name')
          .eq('email', session.user.email).maybeSingle();

        const name = profile?.full_name || session.user.email || '';
        const initials = name.split(' ').filter(Boolean).slice(0,2)
          .map(w => w[0].toUpperCase()).join('');

        slot.innerHTML = `
          <div class="eco-avatar" id="_eco_av" title="${name}">
            ${initials}
            <div class="eco-user-menu" id="_eco_menu">
              <a href="/user.html">My Profile</a>
              <a href="/home.html">Home</a>
              <div class="eco-sep"></div>
              <button class="eco-signout" id="_eco_so">Sign Out</button>
            </div>
          </div>`;

        document.getElementById('_eco_av').addEventListener('click', e => {
          e.stopPropagation();
          document.getElementById('_eco_menu').classList.toggle('open');
        });
        document.addEventListener('click', () =>
          document.getElementById('_eco_menu')?.classList.remove('open'));
        document.getElementById('_eco_so').addEventListener('click', async () => {
          await client.auth.signOut();
          window.location.href = '/home.html';
        });
      } else {
        const onEnter = window.location.pathname.includes('enter.html');
        slot.innerHTML = onEnter ? '' :
          `<a href="/enter.html" class="eco-signin-btn">Sign In</a>`;
      }
    };

    render();
    client.auth.onAuthStateChange(() => render());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNav);
  } else {
    initNav();
  }
})();
