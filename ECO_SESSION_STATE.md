# ECO — EternalCurrent.Online · Session State
**Last updated:** 2026-04-10 Session 10

---

## INFRASTRUCTURE

| Item | Value |
|---|---|
| Supabase project | prbeyvmsyxuiggqwiham |
| Members | 104 · 941 relationships |
| Hosting | Namecheap → eternalcurrent.online |
| GitHub | Adm1n-ECO/ECO.git · always `git push --force` |
| Local path | C:\Users\vbaks\OneDrive\Documents\Websites\ECO\Website\ |
| Deploy | .cpanel.yml auto-deploys GitHub→cPanel |

---

## AUTH ACCOUNTS (3 active)

| Email | Role | Profile |
|---|---|---|
| admin@eternalcurrent.online | Sovereign (Tier 0) | No profile · sovereign.html only |
| vikas@eternalcurrent.online | SystemAdmin | STAR (Vikas Bakshi) |
| mzremi@hotmail.com | Conductor | RRB-STAR (Reema Bakshi) |
| Isaiah Bakshi (IB-STAR) | SystemAdmin (pre-set) | Unclaimed — role set, awaits claim |

---

## ROLE HIERARCHY

| Tier | Role | Who | Access |
|---|---|---|---|
| 0 | Sovereign | admin@eternalcurrent.online | sovereign.html — role management only |
| 1 | SystemAdmin | Vikas Bakshi (STAR) | Full platform + admin panel |
| 2 | SuperUser | Nobody yet | Admin panel (not role management) |
| 3 | Conductor/etc | All members | Standard |

`platform_role` CHECK: SystemAdmin, SuperUser, NetworkOwner, Moderator, Keeper, Conductor, Scholar, Guest

---

## EDGE FUNCTIONS (all live)

- claude-proxy (verify_jwt:false) · CLAUDE_API_KEY
- stripe-create-checkout · STRIPE_SECRET_KEY
- stripe-webhook · STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET
- quest-generator
- pulse-generator
- weekly-digest · SMTP_HOST + SMTP_USER + SMTP_PASS · pg_cron Mondays 9am UTC

---

## STRIPE (live)

| Plan | Price ID | Monthly |
|---|---|---|
| conductor | price_1TKVWQ9AzGOao739NgU94gC2 | $5.99 |
| pro_conductor | price_1TKVYU9AzGOao739sQbQxt6T | $8.99 |
| org_admin | price_1TKVah9AzGOao739y5zja4UH | $14.99 |

---

## ALL PAGES (29 HTML files)

admin, ai-portal, claim, confluence, data-tools, eco_academic_review, enter,
globe, globe-min, home, household, index, join, language, manifesto, map-pins,
member, milestone, network, pet, photos, sovereign, theme-manager, tree, user,
view-currents, view-pro, visual-river, whatsapp-import, year-in-review

---

## THEME SYSTEM

- **4 themes:** Void (default/dark), Deep-Sea (mid-dark), Grove (light-green), Parchment (off-white)
- **theme.css** — root-level CSS variable file. Load in every page `<head>`
- **theme-selector.js** — floating ⬡ button bottom-right. Load before `</body>`
- **Storage key:** `eco_theme_v4` in localStorage (per-device)
- **data-theme="void"** on `<html>` in every page
- All pages use CSS variables: `var(--color-bg)`, `var(--color-text)`, `var(--color-accent-c)` etc.
- Never use `rgba(255,255,255,x)` as text color — use `var(--color-text-dim)` or `var(--color-text-mid)`

---

## DB SCHEMA — CRITICAL RULES

- `users` PK = `user_id` (TEXT, not `id`)
- `users.auth_id` = UUID linking to `auth.users`
- `users.birth_mm_yyyy` = "MM/YYYY" string (never include day)
- `users.passing_mm_yyyy` = "MM/YYYY" for passed members
- `users.platform_role` CHECK includes SystemAdmin now
- `relationships` cols: `subject_id`, `target_id`, `relation_type`, `tie_strength`
- `relation_type` CHECK (TitleCase): Parent, Child, Sibling, Spouse, Cousin, Friend, Grandparent, Grandchild, AuntUncle, NieceNephew, BioParent, BioChild, StepParent, StepChild, HalfSibling, Partner, BrotherInLaw, SisterInLaw, FatherInLaw, MotherInLaw, InLaw, SonInLaw, DaughterInLaw
- `tie_strength` CHECK: 'bonding' | 'bridging'
- `invite_status` CHECK: 'Not Sent' | 'Sent' | 'Accepted' | 'Declined'
- All inserts need `network_id = 'lightning-001'`
- `claim_profile(p_user_id, p_auth_id, p_email)` RPC — SECURITY DEFINER, links auth to profile
- All 104 lightning-001 members = Free_Forever tier for life

---

## STORAGE BUCKETS

- `avatars` (public, 2MB) — user profile photos → `users.photo_id`
- `photos` (private) — network photos
- `pet-photos` (public, 5MB) — pet photos and pet post photos

---

## KEY TABLES ADDED THIS SESSION

- `pet_posts` — anyone in network can post on a pet's page
- `network_invites` — tracks guest sign-ups via join.html
- `system_config` — stores sovereign_auth_id, sovereign_email (no public read)

---

## PAGES BUILT THIS SESSION

| Page | Purpose |
|---|---|
| claim.html | Self-onboarding — find profile by name + relationships, set email+password |
| household.html | Guided 4-step wizard: partner, children, live-in family, pets |
| join.html?ref=[user_id] | Guest invite — search if already in network or create new |
| pet.html?id=[pet_id] | Pet profile — bio, photo, post feed (no AI) |
| sovereign.html | Tier 0 break-glass — role management, email-gated |

---

## BRAND (LOCKED — NEVER CHANGE)

- ECO wordmark: E=#00AAFF · C=#00CC44 · O=#FFF · Arial Black 900
- Background default: #080D14 (Void)
- Tagline: "Only Yours. Forever." (with period)
- No forms anywhere — ever
- No font sizes below 12px
- Current definition (bidirectional): energy flows into you AND out from you simultaneously

---

## JS RULES (every new page)

1. `config.js` + supabase CDN + `eco-client.js` in `<head>`
2. `const sb = window.ecoSB` at top of script (eco-client.js is synchronous, sets ecoSB before body script runs)
3. `header.js` at end of `<body>`
4. `theme-selector.js` before `</body>`
5. `data-theme="void"` on `<html>`
6. `<link rel="stylesheet" href="theme.css">` in `<head>`
7. No hardcoded `rgba(255,255,255,x)` as text color — use CSS vars
8. `network_id = 'lightning-001'` on all inserts
9. No forms — no `<form>` tags, no submit buttons

---

## WORKFLOW — CLAUDE vs MANUAL (SESSION 11 LOCKED)

### Claude does automatically (no action needed from Vikas):
- **All SQL** — schema, migrations, RLS policies, data — run directly via Supabase MCP
- **All HTML/JS/CSS** — built in session, exported in zip
- **SQL files** written to `sql/` folder for GitHub record
- **deploy.bat** — Vikas runs once at session end, everything goes to GitHub + cPanel

### Vikas does manually (copy/paste only):
- **Edge function source** — paste into Supabase Dashboard → Edge Functions → new function
- **Secrets** — paste into Supabase Dashboard → Edge Functions → Secrets
- **Run deploy.bat** — once per session at the end

### Never needed again:
- Copying individual files from zip
- Running SQL manually in Supabase editor
- Hunting for files in chat history
- FTP window
- cmd window (except deploy.bat)

### Edge function naming convention:
- `001_claude-proxy` · `002_stripe-create-checkout` · `003_stripe-webhook`
- `004_quest-generator` · `005_weekly-digest` · `006_pulse-generator` · `007_update-auth-email`
- New functions: next number in sequence, snake_case after prefix

### SQL naming convention:
- `001_pulse_migration` · `002_tek02_migration` · `003_tribe_schema`
- `004_org_schema` · `005_video_flag`
- New migrations: next number in sequence, snake_case description

## PENDING WORK

### Phase 3 (complete except SOV-01)
- TRIBE-01 ✅ SQL + tribe.html + header switcher
- ORG-01 ✅ SQL + org-admin.html + admin.html module
- GEDCOM-01 ✅ gedcom-export.html
- VIDEO-01 ✅ SQL + user.html video rendering
- OFF-01 ✅ service-worker.js registered via header.js
- VEND-01 ✅ 008_vendor-marketplace edge function
- SOV-01 Deferred — separate product, own repo when ready

### Known issues / next
- Continue theme color refinement per-page as members report issues
- Isaiah (IB-STAR) to be promoted to SystemAdmin once he claims his profile
- Deploy 008_vendor-marketplace edge function to Supabase Dashboard (manual step)

### Remaining planned features
- Annual Diaspora Report section on confluence.html
- Mobile globe bottom sheet (globe.html)
- Milestone QR code generation
- WhatsApp import improvements
- Language learning affiliate UI
- Stripe vendor tier price ID
- Org Admin billing/Stripe wiring
- JS/CSS folder restructure (dedicated session, high risk)
