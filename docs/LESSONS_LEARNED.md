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
