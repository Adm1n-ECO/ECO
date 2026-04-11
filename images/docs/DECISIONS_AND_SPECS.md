# ECO Decisions & Specifications
## EternalCurrent.Online
**Last Updated:** April 10, 2026 — Fully Deployed

---

## LOCKED BRAND (never change)

| Element | Value |
|---|---|
| E color | #00AAFF (Electric Blue) |
| C color | #00CC44 (Go Green) |
| O color | #FFFFFF |
| Font | Arial Black 900 headings · Arial/Helvetica 400–500 body |
| Background | #080D14 (Void) — never pure black |
| Card bg | #0D1820 |
| Current definition | Bidirectional — energy flows INTO you AND OUT simultaneously |
| Energy | "Only energy — Compounding, Communicating, Conjoining" |
| Tagline | "Only Yours. Forever." (period required) |
| Forms | Zero. Never. Not one `<form>` tag anywhere. |

---

## CORE PHILOSOPHY

- You are not a leaf on a tree — you are the center of a field of energy
- Serves any family whose story is too complex for a tree
- No religious framing
- "You are not the product. You never will be."
- Invite-only always

---

## STRIPE (live)

| Item | Value |
|---|---|
| Mode | Live |
| Billing model | Per-user · NetworkOwner never billed for others |
| conductor | $5.99/mo · price_1TKVWQ9AzGOao739NgU94gC2 |
| pro_conductor | $8.99/mo · price_1TKVYU9AzGOao739sQbQxt6T |
| org_admin | $14.99/mo · price_1TKVah9AzGOao739y5zja4UH |
| Webhook URL | prbeyvmsyxuiggqwiham.supabase.co/functions/v1/stripe-webhook |
| Webhook events | checkout.session.completed · invoice.payment_succeeded · invoice.payment_failed · customer.subscription.deleted · customer.subscription.updated |

### Billing principles
- Cancel anytime — no friction, no dark patterns
- Freeze (not delete) — data preserved, access suspended, resume anytime
- Delete: 30-day reversal window → data wiped, relationships anonymized, network structure survives
- Gifted/sponsored accounts: no badge, no label, identical experience
- Conductor: sponsor up to 3 · Pro Conductor: sponsor unlimited
- If sponsor cancels: sponsored user gets 30-day grace period

---

## CONTRIBUTION ROLES

| Role | Color | Emoji | Special access |
|---|---|---|---|
| Keeper | #F39C12 | 🔑 | burial_ground pins · Keeper-only map content |
| Scholar | #9B59B6 | 📚 | Attribution as reciprocity |
| Conductor | #00AAFF | ⚡ | Active contributor |
| Moderator | #00CC44 | 🛡 | Permission layer on Conductor |

- Nomination → 3 validations from different members (not self, not nominator)
- DB trigger auto-approves at 3 → appends to `users.contribution_roles` array
- Table: `contribution_nominations` (id, nominated_user_id, nominated_by, role, validations JSONB, validation_count, status)

---

## HERITAGE MAP CATEGORIES (TEK-02)

| Category | Emoji | Color | Keeper-only |
|---|---|---|---|
| general | 📍 | #00AAFF | No |
| ancestral_village | 🏡 | #F39C12 | No |
| migration_route | 🛤 | #00DDFF | No |
| sacred_site | 🌙 | #9B59B6 | Optional |
| cultural_landmark | 🏛 | #00CC44 | No |
| heritage_site | ⬡ | #E67E22 | No |
| burial_ground | ☽ | #8E44AD | Yes |

---

## CAPITAL NETWORK MAP (MAP-02)

| tie_strength | Type | Color |
|---|---|---|
| ≥ 7 | Bonding | #FFD700 (gold) |
| 3–6 | Bridging | #00DDFF (teal) |
| < 3 or null | Weak | #444455 (dim) |

Toggle: "⬡ Capital Map" in view-currents.html style bar. Legend shown when active.

---

## TUCKMAN STAGES (TUCK-01)

| Stage | Emoji | Color | Meaning |
|---|---|---|---|
| Forming | 🌱 | #00AAFF | Getting acquainted · polite · roles unclear |
| Storming | ⚡ | #FF6B35 | Conflict · different views surfacing |
| Norming | 🤝 | #F39C12 | Trust building · norms established |
| Performing | 🚀 | #00CC44 | Deep trust · high function · interdependent |

Recorded by SuperUser in Admin → Group Stage. History in `network_tuckman`.

---

## SYNCHRONIZATION ENGINE (SE-01)

| Challenge type | Meaning |
|---|---|
| collective | Everyone contributes one thing |
| individual | Each person at own pace |
| relay | Passed member to member |
| milestone | Celebrate shared achievement |

Auto-completes when `current_count >= target_count` (DB trigger on sync_responses).

---

## MILESTONE EXPERIENCE (MKT-02)

- URL: `milestone.html?s=[slug]`
- Slug: auto-generated from title + 4-char random suffix
- Reactions: 6 emoji · stored in `milestones.guest_reactions` JSONB
- Guest ID: localStorage `eco_guest_id` — no account required to react
- View counter incremented on load
- Public viewing (no auth) · create requires auth

---

## WEEKLY DIGEST (FEAT-01)

- Schedule: Every Monday 9am UTC (pg_cron job ID: 1)
- Skips weeks with zero activity
- Sends via Namecheap SMTP (SMTP_HOST · SMTP_USER · SMTP_PASS secrets)
- No external email service needed

---

## WHATSAPP IMPORT (FEAT-02)

- Supports both WA export formats (US: `M/D/YY, H:MM AM` and intl: `[DD/MM/YYYY, HH:MM:SS]`)
- File stays on device until user confirms import
- Batch insert chunks of 50 to `family_notes` with `source='whatsapp_import'`
- `import_batch_id` UUID groups rows from one session

---

## SESSION HISTORY

| Session | Date | Key Deliverables |
|---|---|---|
| S-01 | Early 2026 | Google Sheets → Supabase DB migration |
| S-02 | Early 2026 | Apps Script API |
| S-03 | Early 2026 | Claude AI portal |
| S-04 | Early 2026 | enter.html entry portal |
| S-05 | Apr 9, 2026 | Phase 1 complete: Stripe Edge Functions, Pulse, Admin 14 modules, user.html redesign, network.html |
| S-06 | Apr 9, 2026 | GL-08, MAP-02, TEK-02 |
| S-07 | Apr 9, 2026 | CR-02, LANG-03, TUCK-01 schema, SE-01 schema |
| S-08 | Apr 9, 2026 | Phase 2 complete: MKT-02, FEAT-01–03, all DB applied |
| S-09 | Apr 10, 2026 | Full deployment: Stripe live, weekly-digest deployed, all secrets set, pg_cron scheduled |

---

## SESSION 10 DECISIONS (2026-04-10)

### PHOTO AVATAR OVERLAY (VIZ-01)
- Pattern: fetch `users.photo_id` → join `photos.public_url` → preload into `_imgCache` (keyed by `user_id`)
- view-currents.html: `drawPhotoCircle(ctx,x,y,r,userId)` clips circular photo over canvas glow dot
- visual-river.html: SVG `<image>` + `<clipPath>` inside `nodeIsland()` — avatar positioned left of ellipse
- tree.html: D3 `<image>` + `<clipPath>` per node; `defs` injected into svgG; initials shown only when no photo
- Nodes without photos fall back to initials/default rendering — no empty circles

### VISUAL RIVER FILTER BAR (VIZ-02)
- Filter bar appears above info-bar, hidden until data loads
- Two chip groups: Generation (Eldest/Second/Third/Fourth/Youngest) + Cultural Origin (dynamic from DB)
- Multi-select: active chips dim non-matching nodes to 0.08 opacity
- No filter chips shown if no cultural_origin data exists in DB

### THEME SELECTOR (UI-01)
- Floating corner button, bottom-right (existing position unchanged)
- Panel: 4 swatches only — no theme name text, no sub-label, no tick mark
- Theme name shown as HTML `title` tooltip on hover only
- File: theme-selector.js

### WEDDING CLAIM PAGE (EVT-01)
- File: sahiba-xavier-claim.html
- Standalone page, no ECO nav header
- `?id=` param → skips search, shows pre-filled confirmation card with Guest badge
- No `?id=` → shows search step (fallback)
- If profile already claimed → redirects to enter.html
- Button copy: "Join the network" (not "Claim my profile")
- ECO wordmark + tagline in footer only

### ISAIAH SYSTEMADMIN (ROLE-01)
- IB-STAR platform_role updated to SystemAdmin in DB (migration applied 2026-04-10)
- auth_id still null — role is pre-set awaiting profile claim
- Once claimed, Isaiah has full admin panel access (not role management — that's Sovereign only)
