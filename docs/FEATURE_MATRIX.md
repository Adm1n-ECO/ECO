# ECO Feature Matrix
## EternalCurrent.Online
**Last Updated:** April 10, 2026 — Fully Deployed

---

## ✅ PHASE 1 — COMPLETE & LIVE

| ID | Feature | Notes |
|---|---|---|
| I-01 | Supabase DB migration | 51 tables · RLS on all |
| I-02 | Supabase Auth | Magic link + password · confirm email OFF |
| I-03 | eco-client.js v3 | iframe-safe · storageKey separation · ecoAuthGuard() |
| I-04 | header.js v3 | Role-aware nav · Change Password modal · URL detection |
| I-05 | config.js | Single source of truth for all constants |
| I-06 | Namecheap SMTP | port 465 · noreply@eternalcurrent.online |
| I-07 | GitHub → cPanel auto-deploy | .cpanel.yml · push → live |
| I-08 | ecoAuthGuard() | 2s patient wait · fixes sign-in flash |
| PG-01 | home.html | Landing page |
| PG-02 | user.html | 3-tab dashboard: Campfire · Stats · Prefs |
| PG-03 | enter.html | Sign in · magic link · password reset |
| PG-04 | admin.html | 14-module admin panel |
| PG-05 | confluence.html | Cultural meeting point · D3 language tree |
| PG-06 | data-tools.html | Admin data tools |
| PG-07 | photos.html | Photo library |
| PG-08 | map-pins.html | Places map · heritage categories |
| GL-01 | globe.html | 3D migration globe · PNG export |
| GL-02 | globe-min.html | Minimal globe embed |
| GL-03 | tree.html | Family tree |
| GL-04 | view-currents.html | Animated current viz · Capital Map overlay |
| GL-05 | view-pro.html | 4-theme network visualization |
| GL-06 | visual-river.html | River visualization |
| GL-07 | Mobile globe | Bottom sheet pattern · touch-first |
| NET-01 | network.html | Public landing · live stats · no auth |
| AUTH-FIX | Password reset | #type=recovery hash handler in enter.html |
| AI-01 | claude-proxy | Edge Function · claude-haiku-4-5-20251001 |
| AI-02 | AI Story Session | Inline chat modal · varied angle prompts |
| PULSE-01–02 | Pulse cultural discovery | pulse_cards · pulse_reactions |
| VOCAB-01–05 | Cultural vocabulary | 173 terms · 28 cultures |
| PHOTO-01–03 | Photo library | Storage bucket · tags · comments |
| FEED-01–03 | Network feed | Posts · prompt bar · reactions |
| QUEST-01–03 | Network Quests | 30 quests · auto-assignment Edge Function |
| LANG-01–02 | Language families | 52 nodes · D3 tree on confluence.html |
| REV-01–02 | Stripe billing | Tiers schema · checkout + webhook Edge Functions |
| MKT-01 | Waitlist AI flow | 5-step Claude conversation on enter.html |
| ADMIN-01 | Admin panel | 14 modules · all data panels · whiteboard |

---

## ✅ PHASE 2 — COMPLETE & LIVE

| ID | Feature | Page | Notes |
|---|---|---|---|
| GL-08 | Migration Map PNG Export | globe.html | ⬇ Share button · preserveDrawingBuffer |
| MAP-02 | Capital Network Map | view-currents.html | Bonding=gold · bridging=teal · tie_strength |
| TEK-02 | Heritage site map UI | map-pins.html | 7 categories · Keeper-only · color markers · filter bar |
| CR-02 | Contribution roles UI | member.html | Nominate · 3-validation auto-approve · DB trigger |
| LANG-03 | Mentor-Apprentice module | language.html | language_pairings · session logging |
| TUCK-01 | Tuckman tracker | admin.html (Group Stage) | network_tuckman · stage history |
| SE-01 | Synchronization Engine | admin.html (Sync Engine) | 4 challenge types · auto-complete trigger |
| MKT-02 | Milestone Experience | milestone.html | ?s=[slug] · guest reactions · view counter |
| FEAT-02 | WhatsApp import | whatsapp-import.html | Both WA formats · member mapping · batch insert |
| FEAT-03 | Year in Review | year-in-review.html | Year nav · stats · language bars · print |
| FEAT-01 | Weekly Digest | Edge Function | Namecheap SMTP · pg_cron Mondays 9am |

---

## ✅ STRIPE — LIVE

| Item | Status |
|---|---|
| Products created (3) | ✅ |
| Price IDs in DB | ✅ |
| STRIPE_SECRET_KEY secret | ✅ |
| STRIPE_WEBHOOK_SECRET secret | ✅ |
| Webhook registered (5 events) | ✅ |

---

## 📋 PHASE 3 — ROADMAP

| ID | Feature | Priority | Notes |
|---|---|---|---|
| TRIBE-01 | Tribal network expansion | High | California · Graton Rancheria · Oklahoma · multi-state |
| ORG-01 | Org Admin dashboard | High | Multi-network · org_subscriptions table ready |
| GEDCOM-01 | GEDCOM export | Medium | Standard family tree interoperability |
| VEND-01 | Vendor marketplace | Medium | Language learning affiliate · Phase 3 revenue |
| OFF-01 | Offline-first mode | Medium | Service worker · IndexedDB · tribal/remote use |
| SOV-01 | On-premise mini-server | Low | Tribal sovereignty · no cloud dependency |
| VIDEO-01 | Video in posts | Low | allow_video flag already in schema |
