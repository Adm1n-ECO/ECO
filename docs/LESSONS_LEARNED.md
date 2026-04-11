# ECO Lessons Learned
## EternalCurrent.Online
**Last Updated:** April 10, 2026 — Session 9

---

## DATABASE

### Schema rules
- `users` PK = `user_id` (TEXT), not `id`. Always.
- `relationships` cols: subject_id, target_id, relation_type (TitleCase), tie_strength. NOT member_id_1/2.
- `relation_type` CHECK requires TitleCase: Parent, Child, Sibling, Spouse, Cousin, Friend, Grandparent, Grandchild, AuntUncle, NieceNephew. Lowercase silently fails.
- `birth_mm_yyyy` stored as string "MM/YYYY". Use `split('/')[1]` not numeric comparison.
- `cultural_vocab_library` is the correct table name (not `vocabulary_terms`).
- `languages_spoken` is ARRAY — always handle null with `|| []`.
- `contribution_roles` is ARRAY — `= ANY(contribution_roles)` in SQL.
- `platform_role` TEXT — use `.includes()` not strict equality.
- Never SELECT `auth_id` or `email` from users in client-side code.
- `subscription_tiers` PK = `tier` (text), not `id`.
- `milestones.slug` must be unique — always add random suffix when generating.
- `family_notes` table already existed — always check before CREATE TABLE.

### Safe user columns (client-side)
user_id, full_name, status, family_role, birth_mm_yyyy, birth_location, current_location, cultural_origin, languages_spoken, household_id, visible_to, platform_role, network_id, elder_mode, contribution_roles, created_at

### RLS
- Anon reads on `users` return only `visible_to = 'all'` members (48).
- Authenticated reads return all 104. Always use authenticated client for full lists.
- Never query `users_public` — RLS blocks network-visibility members.
- All new tables need `ALTER TABLE x ENABLE ROW LEVEL SECURITY` + policies.

### Migrations
- Always separate CREATE TABLE and CREATE POLICY — never combine.
- `ON CONFLICT DO NOTHING` is for INSERT, not CREATE TABLE syntax.
- Use `ADD COLUMN IF NOT EXISTS` for safe migrations on existing tables.
- Always verify table exists before creating: many tables were pre-built in earlier sessions.
- `contribution_role_nominations` (old) and `contribution_nominations` (Phase 2) both exist — use the Phase 2 one.

### Triggers
- Triggers for auto-approve (contribution_nominations) and count increment (sync_responses) use SECURITY DEFINER.
- BEFORE triggers must RETURN NEW, not RETURN NULL.

---

## AUTHENTICATION

- `ecoAuthGuard()` waits up to 2s for session — prevents sign-in flash.
- Magic link redirect: Supabase Site URL must be `https://eternalcurrent.online`.
- Password reset: detect `#type=recovery` hash → show reset state → clean URL.
- Admin: `admin@eternalcurrent.online` = password. `vikas@eternalcurrent.online` = magic link.

---

## STRIPE

- Per-user billing — NetworkOwner never billed on behalf of others.
- `stripe-create-checkout` needs `STRIPE_SECRET_KEY` secret.
- `stripe-webhook` needs both `STRIPE_SECRET_KEY` AND `STRIPE_WEBHOOK_SECRET`.
- `verify_jwt: false` on stripe-webhook — Stripe signs its own requests.
- Price IDs in `subscription_tiers.stripe_price_id` — PK is `tier` (text).

---

## SUPABASE CLI

- `npm install -g supabase` FAILS on Windows — use Scoop instead.
- Install Scoop first (PowerShell): `irm get.scoop.sh | iex`
- Then: `scoop bucket add supabase https://github.com/supabase/scoop-bucket.git`
- Then: `scoop install supabase`
- Must run `supabase login` before any deploy commands.
- Deploy: `supabase functions deploy [name] --project-ref prbeyvmsyxuiggqwiham`

---

## pg_cron / pg_net

- Must be enabled in Supabase Dashboard → Database → Extensions (cannot be done via SQL).
- `SELECT cron.schedule(...)` fails with "schema cron does not exist" if extension not enabled first.
- Both `pg_cron` AND `pg_net` must be enabled for HTTP-based scheduled jobs.
- Successful `cron.schedule()` returns `[{"schedule": 1}]` — that's the job ID.

---

## SMTP / EMAIL

- Supabase's configured SMTP is ONLY for auth system emails (magic links, password resets).
- For custom transactional emails (digest), use SMTP directly in Edge Functions.
- Namecheap SMTP: port 465 · TLS · host = mail.eternalcurrent.online.
- Deno SMTP library: `https://deno.land/x/smtp@v0.7.0/mod.ts`.
- Secrets needed: SMTP_HOST, SMTP_USER, SMTP_PASS (set per Edge Function).

---

## THREE.JS / GLOBE

- `preserveDrawingBuffer: true` required for PNG export.
- Expose `window._ecoScene`, `window._ecoCam`, `window._ecoRen` for cross-function access.
- r128 only — no OrbitControls, no CapsuleGeometry (added r142+).
- Globe texture files served from `/textures/` — never CDN.

---

## JAVASCRIPT

### 8 rules (every page, every time)
1. SUPABASE_URL/ANON via config.js — never hardcode
2. Load order: config.js → supabase CDN → eco-client.js (all in `<head>`)
3. header.js at end of `<body>`
4. No inline `const SUPABASE_URL`
5. `DEV_MODE = false` before production
6. `GLOBE.gg` only after `initGlobe()`
7. No hardcoded nav HTML
8. `waitAndLoad()` pattern for immediate init() calls

### No forms rule
No `<form>` tags, no submit buttons, no labeled input fields — ever. Auth is the only exception.

---

## DEPLOYMENT

- Namecheap hosting — NOT Vercel. Local: `C:\Users\vbaks\OneDrive\Documents\Websites\ECO\Website\`
- GitHub: `Adm1n-ECO/ECO` (live). All pushes: `git push --force`.
- `.cpanel.yml` auto-deploys from GitHub → cPanel.
- After every session: git push → upload zip to Namecheap.

---

## WHATSAPP IMPORT

- Two WA export formats must both be handled:
  - Format 1 (US): `M/D/YY, H:MM AM – Name: message`
  - Format 2 (intl): `[DD/MM/YYYY, HH:MM:SS] Name: message`
- Filter out: `<Media omitted>`, system messages, lines < 15 chars.
- Batch insert chunks of 50 to avoid payload limits.
- `import_batch_id` (UUID) groups rows from one import for potential rollback.

---

## SESSION HISTORY

| Session | Outcome |
|---|---|
| S-01–04 | Infrastructure, DB, Auth, AI portal, entry portal |
| S-05 | Phase 1 complete |
| S-06–08 | Phase 2 complete |
| S-09 | Full production deployment: Stripe live, CLI deploy, pg_cron, all secrets |

---

## SESSION 10 (2026-04-10)

- **Canvas photo overlay**: `ctx.save()` + `ctx.arc()` clip + `ctx.drawImage()` + `ctx.restore()` is the correct pattern. Do not use `ctx.clip()` without save/restore — it leaks into subsequent draws.
- **SVG photo in D3**: Use `svgG.append('defs')` before node selection; `clipPath` elements need IDs sanitised with `/[^a-z0-9]/gi → '_'` because Supabase user_ids contain hyphens.
- **SVG photo in static SVG (visual-river)**: Insert `<defs>` as first child of `<g>` via `g.insertBefore(defs, g.firstChild)`. Use `svgEl('image')` with `href` (not `xlink:href`) for modern browsers.
- **theme-selector.js str_replace**: File uses escaped quote strings inside JS string concatenation. Python replace is more reliable than str_replace for these patterns.
- **Users query photo join**: `users.photo_id → photos.id → photos.public_url`. Always fetch photos in a single `in('id', photoIds)` batch, not per-member. Always guard: `if (photoIds.length)` before the join to avoid empty `.in()` errors.
- **Filter chips on visual-river**: `data-uid` attribute on each SVG `<g>` node is the bridge between JS filter state and DOM opacity. Set during `positionRow()`.

---

## CRITICAL DEPLOYMENT RULE (added 2026-04-10)

**NEVER extract the full zip into the Website\ folder.**

The Claude container does not have `images/`, `textures/`, or any binary assets. Extracting the full zip will delete those folders from git.

**Correct deploy workflow:**
1. Claude lists changed files at end of session
2. Vikas copies ONLY those files from the zip into Website\
3. Run `deploy.bat` (not `git add -A`)

**deploy.bat** is in the repo root — it only stages `*.html *.js *.css docs\*.md ECO_SESSION_STATE.md`. It will never touch images/ or textures/.

**If accidental deletion happens:**
```
git checkout HEAD~1 -- images/
git checkout HEAD~1 -- textures/
git add images/ textures/
git commit --amend --no-edit
git push --force origin main
```

**Claude must always end every session with:**
```
Files changed this session — copy only these from the zip:
[explicit list]
```

## SESSION 11 (2026-04-10)

- **header.js INNER map**: Always add new pages here — omitting them causes the back-nav label to be blank. Pages added: household.html, join.html, pet.html, sovereign.html.
- **member.html auth_id fetch**: Must include `auth_id` in the users select to detect unclaimed profiles. Used to conditionally show Invite button.
- **Invite button pattern**: Show only when `!isSelf && !m.auth_id`. Link to `join.html?ref=${_me.user_id}`. Green pill style matches brand.
- **Admin email update**: Two-step — update `users.email` via anon client first, then call `update-auth-email` edge function with service role. Always check `auth_id` exists before calling edge function.
- **update-auth-email edge function**: Requires `SUPABASE_SERVICE_ROLE_KEY` secret. Verify caller is SystemAdmin/SuperUser before allowing update. Returns `{ok:true}` on success.
- **Python replace for admin.html**: File contains multi-byte unicode (✓, …). Use Python `open().read().replace()` — str_replace tool fails on these files.

## SESSION 11 — REPO RESTRUCTURE

- **sql/ folder**: All SQL migrations now live in `sql/` with numeric prefix (001_, 002_…). Never in docs/ again.
- **supabase/functions/ numbered**: All edge functions now `001_claude-proxy`, `002_stripe-create-checkout` etc. Easy to find on GitHub — no scrolling chat.
- **4 functions have placeholder index.ts**: claude-proxy, stripe-create-checkout, stripe-webhook, quest-generator were deployed before source control. Retrieve from Supabase Dashboard and replace placeholder.
- **deploy.bat stages both**: `sql\*.sql` and `supabaseunctions\*\*.ts` — both land on GitHub automatically every deploy.
- **GitHub is the file store**: No more copy/paste from chat. After deploy, go to GitHub to find any SQL or edge function file.

## SESSION 11 — WORKFLOW LOCKED

- **CREATE POLICY IF NOT EXISTS is invalid Postgres syntax.** Always use DROP POLICY IF EXISTS + CREATE POLICY. Apply to every SQL file going forward.
- **Claude runs all SQL directly** via Supabase MCP (Supabase:execute_sql). No manual paste into SQL editor ever again.
- **Vikas manual actions reduced to two**: (1) edge function source paste into Supabase Dashboard, (2) secrets paste into Supabase Dashboard. That is all.
- **deploy.bat full-zip-safe**: git reset lines suppress all output with >nul 2>&1. deploy.bat re-stages itself after resets. Placeholder detection on 001-004 fires warnings but never blocks commit.
- **SQL naming**: NNN_description_snake_case.sql in sql/ folder. Next = 006.
- **Edge function naming**: NNN_function-name/ in supabase/functions/. Next = 008.
- **GitHub token ghp_*** stored in memory — Claude cannot push directly from web chat (api.github.com blocked by container proxy). deploy.bat remains the push mechanism.
- **Supabase MCP project_id**: prbeyvmsyxuiggqwiham — required on every Supabase:execute_sql call.

## SESSION 11 — GROUPS 2 3 4

- **confluence.html was truncated** in zip — missing closing script/body/html tags. Always check tail of large files: wc -l + tail -10 + check </body> count.
- **CREATE POLICY IF NOT EXISTS** invalid Postgres. Always DROP POLICY IF EXISTS first. Fixed in all SQL files going forward.
- **globe-min.html and index.html**: intentionally no header.js — embed page and splash redirect respectively. Do not add header to these.
- **GEDCOM 5.5.1**: birth date format = MON YYYY (JAN 1985 not 01/1985). Split birth_mm_yyyy on / then map to 3-letter month. Guard parseInt for month index.
- **service-worker.js**: never cache admin.html (contains sensitive data). Always network-first for supabase.co, anthropic.com, stripe.com.
- **Vendor marketplace**: always gate on vendor_opted_in before returning any vendor data. Log every connection to event_vendor_connections for audit.
- **user.html video**: add video_url and video_thumbnail to select alongside existing fields — additive, no existing logic changed.
- **Tribe switcher**: ecoCheckNetworkSwitcher() added to header.js — only renders if user has entries in user_network_memberships. Safe no-op for all current users.
- **Header audit pattern**: grep -rL header.js *.html — run at start of every session to catch regressions.

## SESSION 11 — FINAL FIXES + NEW PAGES

- **claim.html ?id= IIFE pattern**: wrap in async IIFE + 400ms delay to ensure ecoSB is ready before calling selectProfile(). Never call DB functions at module scope without a readiness check.
- **join.html suggest param**: decode URI component when reading ?suggest= — names with spaces will be URL-encoded.
- **Leaflet dark tiles**: use cartocdn.com dark_all tiles for ECO dark theme. Never use default OpenStreetMap tiles (too light).
- **Video upload**: always check network_settings.allow_video before showing upload UI. Use photos storage bucket with videos/ prefix path.
- **Mobile safe-area-inset-bottom**: use env(safe-area-inset-bottom, 0px) on floating buttons for iPhone notch/home bar.
- **theme-selector.js touch**: add passive:true to all touch event listeners to avoid janky scroll.
- **LookMeUp removal**: footer copyright lines only — no functional code. grep -ril lookmeup *.html before every release.
- **tribe-onboard.html**: uses waitAndLoad() pattern (not ecoAuthGuard) because page is public-facing — no auth required.
