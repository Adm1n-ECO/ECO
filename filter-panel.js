// ── ECO Relationship Filter Panel ─────────────────────────────
// Shared by view-currents.html and view-pro.html
// Call initFilterPanel(onChangeCallback) once after DOM ready.
// onChangeCallback receives the current Set of HIDDEN relation types.

const FILTER_GROUPS = {
  'IMMEDIATE': ['Spouse','Partner','Parent','Child','BioParent','BioChild','StepParent','StepChild'],
  'EXTENDED':  ['Sibling','HalfSibling','Grandparent','Grandchild','AuntUncle','NieceNephew','Cousin'],
  'IN-LAWS':   ['FatherInLaw','MotherInLaw','BrotherInLaw','SisterInLaw','InLaw'],
  'SOCIAL':    ['Friend']
};

const FILTER_LABELS = {
  Spouse:'Spouse', Partner:'Partner', Parent:'Parent', Child:'Child',
  BioParent:'Bio Parent', BioChild:'Bio Child',
  StepParent:'Step Parent', StepChild:'Step Child',
  Sibling:'Sibling', HalfSibling:'Half Sibling',
  Grandparent:'Grandparent', Grandchild:'Grandchild',
  AuntUncle:'Aunt / Uncle', NieceNephew:'Niece / Nephew', Cousin:'Cousin',
  FatherInLaw:'Father-in-Law', MotherInLaw:'Mother-in-Law',
  BrotherInLaw:'Brother-in-Law', SisterInLaw:'Sister-in-Law', InLaw:'In-Law',
  Friend:'Friend'
};

const PRESETS = {
  ALL:       null, // null = show everything
  IMMEDIATE: ['Spouse','Partner','Parent','Child','BioParent','BioChild','StepParent','StepChild'],
  EXTENDED:  ['Spouse','Partner','Parent','Child','BioParent','BioChild','StepParent','StepChild',
               'Sibling','HalfSibling','Grandparent','Grandchild','AuntUncle','NieceNephew','Cousin'],
  'IN-LAWS': ['FatherInLaw','MotherInLaw','BrotherInLaw','SisterInLaw','InLaw'],
  FRIENDS:   ['Friend'],
};

let _hiddenRels = new Set();
let _onFilterChange = null;
let _activePreset = 'ALL';

function initFilterPanel(onChangeCb) {
  _onFilterChange = onChangeCb;
  _injectStyles();
  _buildPanel();
  _bindNavButton();
}

function getHiddenRels() { return new Set(_hiddenRels); }

function _applyPreset(name) {
  _activePreset = name;
  document.querySelectorAll('.fp-preset').forEach(b => b.classList.toggle('active', b.dataset.preset === name));
  const show = PRESETS[name];
  _hiddenRels = new Set();
  if (show !== null) {
    // Hide everything NOT in the preset
    Object.values(FILTER_GROUPS).flat().forEach(t => { if (!show.includes(t)) _hiddenRels.add(t); });
  }
  // Sync checkboxes
  document.querySelectorAll('.fp-chk').forEach(cb => {
    cb.checked = !_hiddenRels.has(cb.dataset.rel);
  });
  _updateBadge();
  if (_onFilterChange) _onFilterChange(new Set(_hiddenRels));
}

function _toggleRel(type, checked) {
  if (checked) _hiddenRels.delete(type); else _hiddenRels.add(type);
  _activePreset = 'CUSTOM';
  document.querySelectorAll('.fp-preset').forEach(b => b.classList.toggle('active', b.dataset.preset === 'CUSTOM'));
  _updateBadge();
  if (_onFilterChange) _onFilterChange(new Set(_hiddenRels));
}

function _toggleGroup(groupName, checked) {
  FILTER_GROUPS[groupName].forEach(t => {
    if (checked) _hiddenRels.delete(t); else _hiddenRels.add(t);
    const cb = document.querySelector(`.fp-chk[data-rel="${t}"]`);
    if (cb) cb.checked = checked;
  });
  _activePreset = 'CUSTOM';
  document.querySelectorAll('.fp-preset').forEach(b => b.classList.toggle('active', b.dataset.preset === 'CUSTOM'));
  _updateBadge();
  if (_onFilterChange) _onFilterChange(new Set(_hiddenRels));
}

function _updateBadge() {
  const all = Object.values(FILTER_GROUPS).flat().length;
  const hidden = _hiddenRels.size;
  const visible = all - hidden;
  const btn = document.getElementById('fp-toggle-btn');
  if (btn) btn.textContent = `Filter [${visible}/${all}]`;
}

function _buildPanel() {
  const panel = document.createElement('div');
  panel.id = 'fp-panel';

  let html = `<div class="fp-header"><span>FILTER RELATIONSHIPS</span><button class="fp-close" onclick="document.getElementById('fp-panel').classList.remove('open')">✕</button></div>`;

  // Presets
  html += `<div class="fp-section-title">PRESETS</div><div class="fp-presets">`;
  ['ALL','IMMEDIATE','EXTENDED','IN-LAWS','FRIENDS','CUSTOM'].forEach(p => {
    html += `<button class="fp-preset${p==='ALL'?' active':''}" data-preset="${p}" onclick="_applyPreset('${p}')">${p}</button>`;
  });
  html += `</div>`;

  // Groups
  Object.entries(FILTER_GROUPS).forEach(([group, types]) => {
    html += `<div class="fp-group-header">
      <span>${group}</span>
      <label class="fp-group-toggle">
        <input type="checkbox" checked onchange="_toggleGroup('${group}',this.checked)"> All
      </label>
    </div>`;
    types.forEach(t => {
      html += `<label class="fp-row">
        <input type="checkbox" class="fp-chk" data-rel="${t}" checked onchange="_toggleRel('${t}',this.checked)">
        <span>${FILTER_LABELS[t]||t}</span>
      </label>`;
    });
  });

  panel.innerHTML = html;
  document.body.appendChild(panel);
}

function _bindNavButton() {
  // Wait for nav to exist
  function tryBind() {
    const nav = document.getElementById('nav') || document.getElementById('ui-nav');
    if (!nav) { setTimeout(tryBind, 100); return; }
    const btn = document.createElement('button');
    btn.id = 'fp-toggle-btn';
    btn.className = 'fp-nav-btn';
    btn.textContent = 'Filter [21/21]';
    btn.onclick = () => document.getElementById('fp-panel').classList.toggle('open');
    // Insert before nav-r if exists, else append
    const navR = nav.querySelector('.nav-r');
    if (navR) nav.insertBefore(btn, navR); else nav.appendChild(btn);
  }
  tryBind();
}

function _injectStyles() {
  const s = document.createElement('style');
  s.textContent = `
    #fp-panel {
      position:fixed; top:60px; right:-300px; width:280px;
      height:calc(100vh - 60px); background:#0a0f1a;
      border-left:1px solid rgba(0,170,255,0.15);
      z-index:8000; transition:right .25s ease;
      display:flex; flex-direction:column;
      font-family:Arial,Helvetica,sans-serif;
      overflow-y:auto;
    }
    #fp-panel.open { right:0; }
    .fp-header { display:flex; justify-content:space-between; align-items:center;
      padding:12px 14px; border-bottom:1px solid rgba(0,170,255,0.1);
      font-size:9px; font-weight:900; letter-spacing:.12em; color:#3A5A54;
      font-family:'Arial Black',Arial,sans-serif; flex-shrink:0; }
    .fp-close { background:none; border:none; color:#3A5A54; cursor:pointer;
      font-size:14px; padding:0 4px; }
    .fp-close:hover { color:#00AAFF; }
    .fp-section-title { padding:10px 14px 4px;
      font-size:8px; font-weight:900; letter-spacing:.14em;
      color:#3A5A54; font-family:'Arial Black',Arial,sans-serif; flex-shrink:0; }
    .fp-presets { display:flex; flex-wrap:wrap; gap:5px; padding:4px 14px 10px;
      border-bottom:1px solid rgba(255,255,255,0.06); flex-shrink:0; }
    .fp-preset { padding:4px 10px; border:1px solid #2a3550;
      background:rgba(255,255,255,.04); color:#6b7280; border-radius:4px;
      cursor:pointer; font-size:9px; font-weight:700;
      letter-spacing:.08em; font-family:'Arial Black',Arial,sans-serif;
      transition:all .15s; }
    .fp-preset.active { background:rgba(0,170,255,.18); border-color:#00AAFF; color:#00AAFF; }
    .fp-group-header { display:flex; justify-content:space-between; align-items:center;
      padding:10px 14px 4px;
      font-size:8px; font-weight:900; letter-spacing:.14em;
      color:#00CC44; font-family:'Arial Black',Arial,sans-serif; }
    .fp-group-toggle { display:flex; align-items:center; gap:5px;
      font-size:9px; color:#4a5568; cursor:pointer; font-weight:400; font-family:Arial,sans-serif; }
    .fp-row { display:flex; align-items:center; gap:8px;
      padding:5px 14px 5px 20px; cursor:pointer;
      font-size:11px; color:#8899aa; transition:color .1s; }
    .fp-row:hover { color:#e0e8ff; }
    .fp-row input[type=checkbox] { accent-color:#00AAFF; width:13px; height:13px; flex-shrink:0; }
    .fp-group-toggle input[type=checkbox] { accent-color:#00CC44; width:12px; height:12px; }
    .fp-nav-btn { padding:4px 10px; border:1px solid #2a3550;
      background:rgba(255,255,255,.04); color:#6b7280; border-radius:4px;
      cursor:pointer; font-size:9px; font-weight:700;
      letter-spacing:.08em; font-family:'Arial Black',Arial,sans-serif;
      transition:all .15s; white-space:nowrap; }
    .fp-nav-btn:hover { border-color:#00AAFF; color:#00AAFF; }
  `;
  document.head.appendChild(s);
}
