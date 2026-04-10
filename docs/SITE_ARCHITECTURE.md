# ECO Site Architecture
## EternalCurrent.Online
**Last Updated:** April 10, 2026 — Fully Deployed

---

## INFRASTRUCTURE

| Resource | Value |
|---|---|
| Supabase Project | prbeyvmsyxuiggqwiham |
| DB Tables | 51 (public schema) |
| Members | 104 · all Living · all free_forever tier |
| Relationships | 923 |
| Hosting | Namecheap · eternalcurrent.online |
| Local path | C:\Users\vbaks\OneDrive\Documents\Websites\ECO\Website\ |
| GitHub live | Adm1n-ECO/ECO (git push --force required) |
| GitHub archive | Adm1n-ECO/ECO-archive (specs + assets) |
| SMTP | port 465 · noreply@eternalcurrent.online |
| AI model | claude-haiku-4-5-20251001 via claude-proxy |
| Storage | photos bucket · private |
| Auto-deploy | .cpanel.yml · GitHub push → cPanel live |
| pg_cron | ✅ enabled |
| pg_net | ✅ enabled |

---

## SHARED JS FILES

| File | Purpose |
|---|---|
| config.js | SUPABASE_URL, SUPABASE_ANON, CLAUDE_PROXY — single source of truth |
| eco-client.js | Shared Supabase client v3 · ecoAuthGuard() · iframe-safe |
| header.js | Universal nav injection · role-aware · URL detection · Change Password modal |
| filter-panel.js | Relationship type filter panel |
| nav.js | Legacy nav helper |
| theme-selector.js | Theme toggle (planned for all pages) |

**Required load order on every page:**
```html
<head>
  <script src="config.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="eco-client.js"></script>
</head>
<body>
  <div id="eco-header"></div>
  <!-- page content -->
  <script src="header.js"></script>
</body>
```

---

## EDGE FUNCTIONS

| Function | JWT | Secrets Required | Purpose |
|---|---|---|---|
| claude-proxy | false | CLAUDE_API_KEY | Claude API relay |
| stripe-create-checkout | true | STRIPE_SECRET_KEY | Stripe checkout session |
| stripe-webhook | false | STRIPE_SECRET_KEY · STRIPE_WEBHOOK_SECRET | Stripe lifecycle events |
| quest-generator | false | — | Auto-assign quests by response_rate |
| pulse-generator | — | — | Pulse cultural discovery |
| weekly-digest | false | SMTP_HOST · SMTP_USER · SMTP_PASS | Monday digest via Namecheap SMTP |

---

## ALL 25 PAGES

| Page | Auth | Purpose |
|---|---|---|
| index.html | No | Redirect to home.html |
| home.html | No | Landing page |
| network.html | No | Public network face · live stats · Sign In CTA |
| enter.html | No | Sign in · magic link · password reset |
| manifesto.html | No | ECO manifesto |
| eco_academic_review.html | No | Academic overview |
| milestone.html | No (view) / Yes (create) | Shareable milestone · ?s=[slug] |
| user.html | Yes | Dashboard · 3 tabs: Campfire · Stats · Prefs |
| member.html | Yes | Member profile · contribution roles · notes |
| globe.html | Yes | 3D migration globe · PNG export |
| globe-min.html | Yes | Minimal globe |
| confluence.html | Yes | Cultural meeting point · language tree |
| tree.html | Yes | Family tree |
| view-pro.html | Yes | 4-theme network visualization |
| view-currents.html | Yes | Animated currents · Capital Map overlay |
| visual-river.html | Yes | River visualization |
| map-pins.html | Yes | Places map · 7 heritage categories |
| photos.html | Yes | Photo library |
| ai-portal.html | Yes | AI conversation portal |
| data-tools.html | Yes | Admin data tools |
| language.html | Yes | Mentor-Apprentice language module |
| whatsapp-import.html | Yes | WhatsApp chat → family notes import |
| year-in-review.html | Yes | Annual year in review |
| theme-manager.html | Yes | Theme management |
| admin.html | SuperUser | 14-module admin panel |

---

## ADMIN PANEL MODULES (14)

Dashboard · Members · Relationships · Lynch Pin · Network Health · Missing Members · Pending · Banner · Vocabulary · AI · Config · Flags · Networks · Quests · Subscriptions · Pulse · Financials · Marketing · Outreach · Complaints · Group Stage (Tuckman) · Sync Engine · Site Testing · Feature Matrix · Whiteboard

---

## DATABASE — 51 TABLES

### Core (5)
| Table | Rows | Notes |
|---|---|---|
| networks | 1 | lightning-001 |
| users | 104 | PK: user_id (TEXT) · contribution_roles ARRAY · languages_spoken ARRAY |
| relationships | 923 | subject_id · target_id · relation_type (TitleCase) · tie_strength |
| family_notes | 0 | source: manual/whatsapp_import/ai_session · import_batch_id |
| waitlist | 0 | Interest capture for non-members |

### Cultural (8)
| Table | Rows | Notes |
|---|---|---|
| cultural_vocab_library | 173 | 28 cultures |
| vocab_overlaps | 22 | Cross-cultural vocabulary |
| language_families | 52 | D3 tree nodes |
| language_pairings | 0 | Mentor-apprentice pairs · sessions_count |
| journeys | 68 | Migration journeys |
| location_coords | 25 | Geocoded locations |
| heritage_items | 0 | TEK heritage sites |
| scholar_contributions | 0 | Scholar attributions |

### Content & Social (12)
| Table | Notes |
|---|---|
| banner_statements (15) | Rotating banner |
| banner_impressions | View tracking |
| feed_prompts (31) | Rotating prompt bar |
| network_posts | Member posts |
| network_post_hides/reactions | Post interactions |
| network_questions | Q&A |
| photos | Photo library |
| photo_tags/comments/hides | Photo interactions |
| milestones (2) | Shareable milestone pages · slug · guest_reactions JSONB |

### Engagement (10)
| Table | Notes |
|---|---|
| pulse_cards (1) | Cultural discovery prompts |
| pulse_reactions | Member responses |
| network_quests (30) | Quest definitions |
| quest_assignments (1) | Active quest tracking |
| quest_responses/reactions | Quest interactions |
| contribution_role_nominations | Legacy nominations |
| contribution_nominations | Phase 2 · 3-validation auto-approve trigger |
| network_tuckman | Tuckman stage history |
| sync_challenges | Collective challenges · auto-complete trigger |
| sync_responses | Challenge responses |

### Revenue (5)
| Table | Notes |
|---|---|
| subscription_tiers (6) | PK: tier (text) · stripe_price_id set |
| user_subscriptions (104) | All free_forever |
| subscription_sponsors | Sponsor relationships |
| org_subscriptions (1) | Institutional billing |
| digest_preferences | Email preferences |

### Admin (7)
| Table | Notes |
|---|---|
| admin_outreach_log | Outreach tracking |
| admin_complaints | Complaint management |
| feature_whiteboard | Idea board |
| content_filters | Content moderation |
| network_settings (1) | Network configuration |
| classroom_networks (1) | Edu pilot |
| student_journals | Edu pilot |

### Other (4)
| Table | Notes |
|---|---|
| pets (8) | Pet profiles |
| accomplishments (1) | Network achievements |

---

## PLATFORM ROLES

| Role | Notes |
|---|---|
| SuperUser | Full admin · Vikas + admin@eternalcurrent.online |
| NetworkOwner | Network moderation · NOT billing owner |
| Keeper | Heritage pins · Keeper-only map access · burial ground |
| Moderator | Permission layer on Conductor account |
| Conductor | Active contributor |
| Scholar | Subject matter expert · attribution as reciprocity |
| Guest | Read-only |

---

## SUBSCRIPTION TIERS

| Tier | Price | Stripe Price ID | Notes |
|---|---|---|---|
| free_forever | $0 | — | All 104 lightning-001 members · for life |
| free | $0 | — | Basic access |
| conductor | $5.99/mo | price_1TKVWQ9AzGOao739NgU94gC2 | Full platform · sponsor 3 |
| pro_conductor | $8.99/mo | price_1TKVYU9AzGOao739sQbQxt6T | Heritage · sponsor unlimited |
| org_admin | $14.99/mo | price_1TKVah9AzGOao739y5zja4UH | Multi-network |
| gifted | $0 to user | — | Sponsor-covered |

---

## KEY DESIGN RULES (non-negotiable)

1. **No forms** — ever. No `<form>` tags, no submit buttons, no labeled inputs.
2. **Invite-only** — no self-registration.
3. **Arial only** — no Google Fonts, no serif.
4. **Local textures** — `/textures/` never CDN.
5. **No API keys in HTML** — config.js has anon key only; all secrets in Edge Function secrets.
6. **git push --force** — always required due to secret scanning history.
7. **header.js injects all nav** — never hardcode nav HTML in any page.
8. **network_id = 'lightning-001'** — always include on all inserts.
