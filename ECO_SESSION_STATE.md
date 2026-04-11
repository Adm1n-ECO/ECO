# ECO — EternalCurrent.Online · Session State
**Last updated:** 2026-04-10 Session 10

---

## ⚠️ PERMANENT ZIP + DEPLOY RULE

Claude follows this every session without exception:
- Export zip contains ONLY files changed this session — never the full site
- End of session always includes an explicit: "FILES CHANGED THIS SESSION" list
- Vikas copies only those files into Website\ — nothing else is touched
- Use deploy.bat, never git add -A
- deploy.bat only stages: *.html *.js *.css docs\*.md ECO_SESSION_STATE.md
- images/ textures/ and all binary files are NEVER in the zip, NEVER staged


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

## PENDING WORK

### Phase 3 (not started)
TRIBE-01, ORG-01, GEDCOM-01, VEND-01, OFF-01, SOV-01, VIDEO-01

### Known issues / next
- Continue theme color refinement per-page as members report issues
- household.html — needs header.js nav link added
- join.html — needs nav link from member profile "Invite to network" button
- Admin → email update (auth email) requires Supabase dashboard — service role edge function not yet built
- Isaiah (IB-STAR) to be promoted to SystemAdmin once he claims his profile
