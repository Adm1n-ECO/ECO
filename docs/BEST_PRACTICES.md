# ECO Best Practices
## EternalCurrent.Online
**Last Updated:** April 10, 2026 — Session 9

---

## PAGE TEMPLATE (every new page)

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ECO · [Page Name]</title>
<script src="config.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="eco-client.js"></script>
<style>
:root{--blue:#00AAFF;--green:#00CC44;--bg:#080D14;--bg2:#0D1820;
  --border:rgba(0,170,255,.10);--white:#E8F4F0;--dim:#3A5A54;}
*{box-sizing:border-box;margin:0;padding:0;}
body{background:var(--bg);color:var(--white);font-family:Arial,Helvetica,sans-serif;min-height:100vh;}
.page{max-width:720px;margin:0 auto;padding:24px 20px 80px;}
.sec-label{font-size:10px;font-weight:700;letter-spacing:.12em;color:var(--dim);text-transform:uppercase;margin-bottom:6px;}
.sec-title{font-family:'Arial Black',Arial,sans-serif;font-weight:900;font-size:1.5rem;margin-bottom:20px;}
</style>
</head>
<body>
<div id="eco-header"></div>
<div class="page">
  <!-- content -->
</div>
<div class="toast" id="toast"></div>
<script>
const sb = window.ecoSB;
let _me = null;

(function waitForAuth(){
  if(!window.ecoSB){setTimeout(waitForAuth,50);return;}
  window.ecoSB.auth.getSession().then(({data:{session}})=>{
    if(session) initPage(session);
    else window.location.href='enter.html?next=[page].html';
  });
})();

async function initPage(session){
  const {data:me} = await sb.from('users')
    .select('user_id,full_name').eq('auth_id',session.user.id).maybeSingle();
  _me = me;
}

function showToast(msg, type){
  const t=document.getElementById('toast');
  t.textContent=msg; t.className='toast show'+(type?' '+type:'');
  setTimeout(()=>{t.className='toast';},2800);
}
</script>
<script src="header.js"></script>
</body>
</html>
```

---

## 8 JS RULES (non-negotiable)

1. config.js loads SUPABASE_URL/ANON — never hardcode in page
2. Load order in `<head>`: config.js → supabase CDN → eco-client.js
3. header.js at end of `<body>` only
4. No inline `const SUPABASE_URL = ...`
5. `DEV_MODE = false` before any production push
6. `GLOBE.gg` only after `initGlobe()` completes
7. No hardcoded nav HTML — header.js injects all nav
8. `waitAndLoad()` pattern for immediate init() calls

---

## CSS VARIABLES (copy to every page)

```css
:root{
  --blue:#00AAFF;    /* Electric Blue */
  --green:#00CC44;   /* Go Green */
  --bg:#080D14;      /* Void */
  --bg2:#0D1820;     /* Card background */
  --white:#E8F4F0;   /* Off-white */
  --border:rgba(0,170,255,.10);
  --dim:#3A5A54;     /* Muted text */
}
```

---

## TOAST (copy to every page)

```html
<div class="toast" id="toast"></div>
```
```css
.toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%);
  background:#0D1825;border:1px solid rgba(0,170,255,.3);border-radius:8px;
  padding:10px 22px;font-size:13px;color:#E8F4F0;z-index:9999;
  opacity:0;transition:opacity .2s;pointer-events:none;}
.toast.show{opacity:1;}
.toast.green{border-color:rgba(0,204,68,.4);color:#00CC44;}
```
```js
function showToast(msg, type){
  const t=document.getElementById('toast');
  t.textContent=msg; t.className='toast show'+(type?' '+type:'');
  setTimeout(()=>{t.className='toast';},2800);
}
```

---

## MEMBER SEARCH PATTERN

```html
<div style="position:relative;">
  <input id="search-input" placeholder="Search member…" autocomplete="off"
    oninput="suggestMember(this.value)">
  <div id="suggest-list" style="position:absolute;top:100%;left:0;right:0;
    background:#0D1825;border:1px solid rgba(0,170,255,.2);border-radius:8px;
    z-index:99;max-height:180px;overflow-y:auto;display:none;"></div>
  <input type="hidden" id="selected-member-id">
</div>
```
```js
function suggestMember(q){
  const list=document.getElementById('suggest-list');
  if(!q){list.style.display='none';return;}
  const hits=_allMembers.filter(m=>(m.full_name||'').toLowerCase().includes(q.toLowerCase())).slice(0,8);
  if(!hits.length){list.style.display='none';return;}
  list.style.display='block';
  list.innerHTML=hits.map(m=>`
    <div style="padding:9px 14px;font-size:13px;cursor:pointer;"
      onmouseenter="this.style.background='rgba(0,170,255,.1)'"
      onmouseleave="this.style.background=''"
      onclick="selectMember('${m.user_id}','${(m.full_name||'').replace(/'/g,"\\'")}')">
      ${m.full_name}
    </div>`).join('');
}
function selectMember(id, name){
  document.getElementById('selected-member-id').value=id;
  document.getElementById('search-input').value=name;
  document.getElementById('suggest-list').style.display='none';
}
```

---

## SUPABASE QUERY PATTERNS

```js
// Safe user fetch (never select auth_id or email)
const {data:me} = await sb.from('users')
  .select('user_id,full_name,contribution_roles,platform_role')
  .eq('auth_id', session.user.id).maybeSingle();

// All members (authenticated)
const {data:members} = await sb.from('users')
  .select('user_id,full_name,status,cultural_origin')
  .eq('network_id','lightning-001').eq('status','Living')
  .order('full_name').limit(200);

// Relationships
const {data:rels} = await sb.from('relationships')
  .select('subject_id,target_id,relation_type,tie_strength')
  .or(`subject_id.eq.${uid},target_id.eq.${uid}`);

// Insert always includes network_id
await sb.from('map_pins').insert({
  network_id: 'lightning-001',
  created_by: _me.user_id,
  // other fields
});
```

---

## ADMIN PANEL — ADDING A MODULE

```html
<!-- 1. Nav item -->
<div class="nav-item" onclick="showPanel('my-panel')" id="nav-my-panel">
  <span class="icon">🔧</span> My Panel
</div>

<!-- 2. Panel content -->
<div class="panel" id="panel-my-panel">
  <div class="panel-title">🔧 My Panel</div>
</div>
```
```js
// 3. Wire into showPanel()
if (id==='my-panel') loadMyPanel();

// 4. Load function
async function loadMyPanel(){ ... }
```

---

## MIGRATION SQL RULES

```sql
-- ✅ Safe column add
ALTER TABLE my_table ADD COLUMN IF NOT EXISTS new_col TEXT DEFAULT 'value';

-- ✅ Table creation (separate from policies)
CREATE TABLE IF NOT EXISTS my_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  network_id TEXT NOT NULL DEFAULT 'lightning-001',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read" ON my_table FOR SELECT USING (true);
CREATE POLICY "Insert" ON my_table FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ❌ Never: ON CONFLICT DO NOTHING in CREATE TABLE
-- ❌ Never: CREATE TABLE + CREATE POLICY in same statement
-- ❌ Never: hardcode UUIDs in data migrations
-- ✅ Always: check if table exists before creating
```

---

## SUPABASE CLI (Windows)

```bash
# Install (PowerShell, one-time)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Login (one-time per machine)
supabase login

# Deploy function
supabase functions deploy [function-name] --project-ref prbeyvmsyxuiggqwiham
```

---

## GIT WORKFLOW

```bash
# Always from C:\Users\vbaks\OneDrive\Documents\Websites\ECO\Website\
git add -A && git commit -m "description" && git push --force
```

`--force` is always required due to prior secret scanning history. Push triggers cPanel auto-deploy.

---

## SECURITY

- Never store `auth_id` or `email` in client-accessible code
- Never expose service role key in any HTML or JS
- Never commit API keys to GitHub
- All Stripe operations server-side only (Edge Functions)
- `verify_jwt: false` only for public webhooks and AI proxy
- Keeper-only content: filter client-side AND enforce via RLS
