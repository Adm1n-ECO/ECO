/* ============================================================
   EternalCurrent.Online — Theme Selector v4
   eco-theme-selector.js · ECO · 2026-03-26
   ============================================================
   4 themes from off-white (Parchment) to near-black (Void).
   Admin button floats at bottom: 20px, height 44px.
   Theme selector default: bottom: 20px.
   Theme selector with admin: bottom: 104px (20 + 44 + 40 buffer).

   Usage: <script src="eco-theme-selector.js"></script>
   Include in every HTML page before </body>.
   ============================================================ */

(function () {
  'use strict';

  /* ── Theme definitions ───────────────────────────────────── */
  var THEMES = [
    {
      id:    'parchment',
      name:  'Parchment',
      sub:   'Off-white · lightest',
      /* Swatch colors */
      bg:    '#F5F2EC',
      bar:   '#E8E4DC',
      dot:   '#006B62',
      line:  '#006B20'
    },
    {
      id:    'grove',
      name:  'Grove',
      sub:   'Sage green · 25% dark',
      bg:    '#C8DDD2',
      bar:   '#AECABC',
      dot:   '#004A44',
      line:  '#004A18'
    },
    {
      id:    'deep-sea',
      name:  'Deep Sea',
      sub:   'Ocean blue · 60% dark',
      bg:    '#0F3854',
      bar:   '#0A2840',
      dot:   '#00E5CC',
      line:  '#00E040'
    },
    {
      id:    'void',
      name:  'Void',
      sub:   'Near-black · brand default',
      bg:    '#070D14',
      bar:   '#040810',
      dot:   '#00E5CC',
      line:  '#00E040'
    }
  ];

  var DEFAULT_THEME = 'void';
  var STORAGE_KEY   = 'eco_theme_v4';

  /* Admin button geometry constants */
  var ADMIN_BOTTOM      = 20;   /* px — admin btn bottom offset */
  var ADMIN_HEIGHT      = 44;   /* px — admin btn height */
  var ADMIN_BUFFER      = 40;   /* px — space between admin and theme selector */
  var THEME_DEFAULT_BOT = 20;   /* px — theme selector default bottom */
  var THEME_ADMIN_BOT   = ADMIN_BOTTOM + ADMIN_HEIGHT + ADMIN_BUFFER; /* = 104px */

  var panelOpen = false;

  /* ── Read saved theme — falls back to page's own data-theme ─ */
  function getSavedTheme() {
    // Page default = what's already set on body or html
    var pageDefault = document.body.getAttribute('data-theme') ||
                      document.documentElement.getAttribute('data-theme') ||
                      DEFAULT_THEME;
    try {
      var t = localStorage.getItem(STORAGE_KEY);
      return THEMES.find(function (x) { return x.id === t; }) ? t : pageDefault;
    } catch (e) {
      return pageDefault;
    }
  }

  /* ── Apply theme to <html> and <body> ────────────────────── */
  function applyTheme(id) {
    document.documentElement.setAttribute('data-theme', id);
    document.body.setAttribute('data-theme', id);
    document.body.style.colorScheme = (id === 'void' || id === 'deep-sea') ? 'dark' : 'light';
    // Force the browser to recalculate CSS custom properties
    document.body.offsetHeight; // eslint-disable-line
    try { localStorage.setItem(STORAGE_KEY, id); } catch (e) {}
  }

  /* ── Build swatch HTML ───────────────────────────────────── */
  function swatchHTML(t) {
    return [
      '<div class="theme-swatch" aria-hidden="true">',
      '  <div style="position:absolute;inset:0;background:' + t.bg + '"></div>',
      '  <div style="position:absolute;bottom:0;left:0;right:0;height:9px;background:' + t.bar + '"></div>',
      '  <div style="position:absolute;top:5px;right:5px;width:8px;height:8px;border-radius:50%;background:' + t.dot + '"></div>',
      '  <div style="position:absolute;top:14px;left:5px;right:13px;height:2px;border-radius:1px;background:' + t.line + ';opacity:.5"></div>',
      '</div>'
    ].join('');
  }

  /* ── Build full selector HTML ────────────────────────────── */
  function buildSelector(currentId) {
    var optionsHTML = THEMES.map(function (t) {
      var isActive = t.id === currentId;
      return [
        '<div class="theme-option' + (isActive ? ' active' : '') + '"',
        '     data-theme-id="' + t.id + '"',
        '     role="option"',
        '     aria-selected="' + isActive + '"',
        '     tabindex="0">',
        '  ' + swatchHTML(t),
        '  <div class="theme-info">',
        '    <div class="theme-name">' + t.name + '</div>',
        '    <div class="theme-sub">' + t.sub + '</div>',
        '  </div>',
        '  <div class="theme-tick" aria-hidden="true">&#10003;</div>',
        '</div>'
      ].join('');
    }).join('');

    return [
      '<div class="theme-selector" id="eco-theme-selector" aria-label="Theme selector">',
      '  <div class="theme-panel hidden" id="eco-theme-panel" role="listbox" aria-label="Choose theme">',
      '    <div class="theme-panel-title">',
      '      Display Theme <span class="accent">&#xB7; ECO</span>',
      '    </div>',
      '    ' + optionsHTML,
      '  </div>',
      '  <button class="theme-toggle-btn" id="eco-theme-btn"',
      '          aria-label="Change display theme" aria-expanded="false"',
      '          aria-controls="eco-theme-panel">',
      '    &#9680;',
      '  </button>',
      '</div>'
    ].join('');
  }

  /* ── Toggle panel open/close ─────────────────────────────── */
  function togglePanel() {
    panelOpen = !panelOpen;
    var panel = document.getElementById('eco-theme-panel');
    var btn   = document.getElementById('eco-theme-btn');
    if (panel) panel.classList.toggle('hidden', !panelOpen);
    if (btn) {
      btn.classList.toggle('open', panelOpen);
      btn.setAttribute('aria-expanded', panelOpen ? 'true' : 'false');
    }
  }

  /* ── Select and apply a theme ────────────────────────────── */
  function selectTheme(id) {
    applyTheme(id);
    document.querySelectorAll('.theme-option').forEach(function (opt) {
      var isActive = opt.getAttribute('data-theme-id') === id;
      opt.classList.toggle('active', isActive);
      opt.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    /* Close panel */
    panelOpen = false;
    var panel = document.getElementById('eco-theme-panel');
    var btn   = document.getElementById('eco-theme-btn');
    if (panel) panel.classList.add('hidden');
    if (btn)   { btn.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
  }

  /* ── Admin button visibility ─────────────────────────────── */
  function initAdminBtn() {
    var adminBtn = document.querySelector('.admin-float-btn');
    if (!adminBtn) return;

    var isAdmin = false;
    try { isAdmin = localStorage.getItem('eco_is_admin') === 'true'; } catch (e) {}

    if (isAdmin) {
      adminBtn.classList.add('visible');
      pushThemeSelectorUp();
    }
  }

  /* ── Push theme selector above admin button ──────────────── */
  function pushThemeSelectorUp() {
    var sel = document.getElementById('eco-theme-selector');
    if (sel) {
      sel.style.bottom = THEME_ADMIN_BOT + 'px';
      sel.classList.add('admin-offset');
    }
  }

  /* ── Reset theme selector to default position ────────────── */
  function resetThemeSelectorPosition() {
    var sel = document.getElementById('eco-theme-selector');
    if (sel) {
      sel.style.bottom = THEME_DEFAULT_BOT + 'px';
      sel.classList.remove('admin-offset');
    }
  }

  /* ── Keyboard navigation within panel ───────────────────── */
  function handleKeyboard(e) {
    if (!panelOpen) return;
    var options = Array.from(document.querySelectorAll('.theme-option'));
    if (!options.length) return;

    var focused = document.activeElement;
    var idx = options.indexOf(focused);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      var next = options[idx + 1] || options[0];
      next.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      var prev = options[idx - 1] || options[options.length - 1];
      prev.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (idx >= 0) {
        e.preventDefault();
        selectTheme(focused.getAttribute('data-theme-id'));
      }
    } else if (e.key === 'Escape') {
      panelOpen = false;
      var panel = document.getElementById('eco-theme-panel');
      var btn   = document.getElementById('eco-theme-btn');
      if (panel) panel.classList.add('hidden');
      if (btn)   { btn.classList.remove('open'); btn.setAttribute('aria-expanded','false'); btn.focus(); }
    }
  }

  /* ── Init ────────────────────────────────────────────────── */
  function init() {
    var saved = getSavedTheme();
    applyTheme(saved);

    /* Inject selector */
    var wrap = document.createElement('div');
    wrap.innerHTML = buildSelector(saved);
    document.body.appendChild(wrap.firstElementChild || wrap);

    /* Toggle button */
    document.addEventListener('click', function (e) {
      var btn = document.getElementById('eco-theme-btn');
      if (btn && btn.contains(e.target)) {
        togglePanel();
        return;
      }
      /* Click outside → close */
      var sel = document.getElementById('eco-theme-selector');
      if (panelOpen && sel && !sel.contains(e.target)) {
        panelOpen = false;
        var panel = document.getElementById('eco-theme-panel');
        if (panel) panel.classList.add('hidden');
        if (btn) { btn.classList.remove('open'); btn.setAttribute('aria-expanded','false'); }
      }
    });

    /* Theme option click */
    document.addEventListener('click', function (e) {
      var opt = e.target.closest('.theme-option[data-theme-id]');
      if (opt) selectTheme(opt.getAttribute('data-theme-id'));
    });

    /* Keyboard */
    document.addEventListener('keydown', handleKeyboard);

    /* Admin button */
    initAdminBtn();
  }

  /* ── Boot ────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ── Public API ──────────────────────────────────────────── */
  window.ECOTheme = {
    /**
     * Show or hide the admin button.
     * Theme selector automatically repositioned with 40px buffer.
     * @param {boolean} visible
     */
    setAdminVisible: function (visible) {
      try { localStorage.setItem('eco_is_admin', visible ? 'true' : 'false'); } catch (e) {}
      var adminBtn = document.querySelector('.admin-float-btn');
      if (adminBtn) adminBtn.classList.toggle('visible', visible);
      if (visible) {
        pushThemeSelectorUp();
      } else {
        resetThemeSelectorPosition();
      }
    },

    /**
     * Programmatically apply a theme by id.
     * @param {string} id — 'parchment' | 'grove' | 'deep-sea' | 'void'
     */
    applyTheme: applyTheme,

    /**
     * Get the current active theme id.
     * @returns {string}
     */
    getTheme: function () {
      return document.documentElement.getAttribute('data-theme') || DEFAULT_THEME;
    },

    /** Available theme ids */
    themes: THEMES.map(function (t) { return t.id; })
  };

})();
