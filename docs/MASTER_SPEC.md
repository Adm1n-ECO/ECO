# EternalCurrent.Online (ECO) — Master Specification
# Last updated: 2026-04-07
# Source of truth for all Claude sessions
# Location in repo: docs/MASTER_SPEC.md

---

## IDENTITY
- Platform: EternalCurrent.Online (ECO)
- Parent brand: CRUNOD / LookMeUp.Online
- Founder: Vikas Bakshi (UserID: STAR) — vikas@eternalcurrent.online
- Co-founder: Isaiah Bakshi (son, College of San Mateo)
- Pilot network: lightning-001 — 104 members, Free_Forever tier

---

## PHILOSOPHY (locked — never change)

ECO is NOT a family platform. It is a network platform.
Connections include blood, chosen, and cultural relationships.
The word "family" is RETIRED from all UI language.
Use instead: network, people, connections, circle, your people.

Energy description (locked):
"Only energy — Compounding, Communicating, Conjoining"
- Compounding = Eternal
- Communicating = Current
- Conjoining = network

Bidirectional Current (locked):
Energy flows INTO you from your network AND OUT from you into theirs
simultaneously, always. Never described as one direction only.

Tagline (locked): "Only Yours. Forever."
Core promise (locked): "You are not the product. You never will be."

---

## LOCKED BRAND (never change any of these)

Colors:
- Background void: #080D14
- Electric Blue: #00AAFF  (E in wordmark)
- Go Green:      #00CC44  (C in wordmark)
- Full White:    #FFFFFF  (O in wordmark)

ECO wordmark: E=#00AAFF  C=#00CC44  O=#FFFFFF  Arial Black 900
This sequence is permanent. Never alter.

Typography: Arial Black 900 headings, Arial/Helvetica body
NO Google Fonts. NO serif fonts. Ever.

Globe arc colors:
- India origin:   amber   #FFB347
- Fiji origin:    teal    #00CED1
- Pakistan origin: purple #9B59B6
- Adopted:        blue    #00AAFF
- Unknown/null:   white   rgba(255,255,255,0.4)

Rules:
- No HTML forms anywhere — ever. All input is conversational AI,
  single tap/toggle, live search, or file picker.
- Globe textures always /textures/ local — never CDN
- Test with: python -m http.server 8080 — never file:// URLs

---

## TECH STACK

- Domain: Namecheap (registration + hosting — interim until Vercel)
- Hosting: Namecheap shared → Vercel (future migration)
- Auto-deploy: GitHub Actions push to main → FTP to Namecheap public_html
- GitHub: Adm1n-ECO/ECO (main branch, public repo)
- Framework: static HTML/CSS/JS now → Next.js (future)
- Database: Supabase — project prbeyvmsyxuiggqwiham (us-west-2)
  URL: https://prbeyvmsyxuiggqwiham.supabase.co
  Anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByYmV5dm1zeXh1aWdncXdpaGFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MTMxMDEsImV4cCI6MjA5MTA4OTEwMX0.n5b1Voj09n1xHgrTS72RXt1yupNgNnvcLOpEtXhKAeE
- AI: Claude API — claude-haiku-4-5-20251001, key stored as eco_claude_key
- Auth: Supabase Auth, magic link only (no passwords ever)
- Email template: ECO-branded, dark theme, configured in Supabase dashboard

---

## DATABASE — CURRENT STATE (verified 2026-04-07)

Tables:
  networks, users, relationships, pets, accomplishments,
  cultural_vocab_library, banner_statements, banner_impressions,
  waitlist, journeys, location_coords, milestones

Row counts:
  users:                  104
  relationships:          448
  cultural_vocab_library: 143 terms, 13 languages
  banner_statements:      15
  location_coords:        25
  pets:                   8
  journeys:               68
  accomplishments:        1
  milestones:             0 (table exists, no data yet)

users_public VIEW:
  Email and auth_id structurally excluded.
  Includes: birth_lat, birth_lon, current_lat, current_lon, languages_spoken

Triggers:
  trg_sync_user_coordinates (auto-resolves lat/lon on location save)
  trg_sync_journey_coordinates

Language distribution across 104 members:
  English(41), Hindi(32), Fijian Hindi(10), Gujarati(9), Urdu(9),
  Spanish(1), Punjabi(1) — 7 languages total

All 104 members:
  status = Living
  invite_status = 'Not Sent'
  tier = Free_Forever

---

## PLATFORM ROLES

- SuperUser:        Full platform admin. ONLY vikas@eternalcurrent.online
                    and admin@eternalcurrent.online. Full data control.
- NetworkFounder:   First person who creates a network and invites others.
                    (formerly NetworkOwner — RENAME PENDING in schema)
- Moderator:        Permission overlay on Conductor account
- Keeper:           Permission overlay on Conductor account
- Conductor:        Standard authenticated member ($5.99/mo Phase 1)
- Scholar:          Contributor with attribution rights
- Guest:            Unauthenticated visitor

⚠️ PENDING: Rename platform_role enum value NetworkOwner → NetworkFounder
   and update STAR's record. First task next session.

Dev panel rule:
  Visible ONLY to SuperUser emails (vikas@ and admin@).
  For all others: not rendered, not hidden, completely absent from DOM.

---

## PAGES STATUS

| Page | URL | Supabase | Status |
|------|-----|----------|--------|
| index.html | / | No | Live — glass door, opens home.html |
| home.html | /home.html | No | Live — SPA (Home/HIW/Manifesto) |
| globe.html | /globe.html | Yes | Live — full globe visualization |
| confluence.html | /confluence.html | No | Live — vocab library hardcoded |
| landing.html | /landing.html | No | Live — earlier glass door |
| eco_academic_review.html | /eco_academic_review.html | No | Live |

---

## BUILD QUEUE (priority order for next session)

### Do first:
1. Schema: rename NetworkOwner → NetworkFounder in platform_role enum
   Update STAR record. Recreate users_public view.

### globe.html fixes:
2. Nav bar: match home.html header
   (logo image + ECO wordmark + EternalCurrent.Online tagline + backdrop blur)
3. Sign In button top-right: opens AI claim flow
4. Chord diagram: fix label clipping (increase outer radius padding)
5. Dev panel: gate to SuperUser emails only — absent from DOM for all others
6. Replace all "family" language → "network", "connections", "people"

### home.html:
7. Nav: replace single "Join Waitlist" CTA with two options:
   "Sign In" (links to globe.html AI flow) + "Join Waitlist"

### New pages:
8. User landing page — post-auth destination after magic link
   (See spec below)
9. login.html — ECO branded magic link entry

### Connections:
10. Auth wiring: signInWithOtp({email}) in AI claim flow
11. Waitlist insert + notify vikas@eternalcurrent.online
12. index.html: Supabase banner statements rotation
13. confluence.html: Supabase vocab library live data

### Phase 1 prep:
14. Mobile-responsive globe.html (bottom sheet pattern)
15. Admin page — SuperUser only, full data control
16. Milestone Experience feature build

---

## USER LANDING PAGE SPEC (post-auth)

Destination after magic link click. Separate file — not globe.html.

The WOW is TWO things together:
1. The globe showing the person's position in their network
2. The AI contextualizing what they're seeing in terms of their own story

Components:
- Identity header: name, role, cultural origin, languages they speak
- Globe component (WOW): full globe centered on their location,
  their connections highlighted, their arcs animated
- AI context panel: "Here is what this network looks like from where you stand"
  — how many people, how many countries, languages, their branch
- Accomplishments feed: visible immediately, no click needed
- Navigation: to vocab library, profile edit, settings

Language rules:
  NO "family" language anywhere on this page.
  Use: network, connections, people, circle.

---

## AI CLAIM FLOW LOGIC

Sign In clicked → AI opens immediately:
Prompt: "What name does your network know you by?"

Living member match found → "Are you [Nickname]?" or
  "Are you the [Name] from [City]?"
Multiple matches → list them, ask which one
Confirmed → "What languages do you speak?"
  → "To save your spot — what email should we send your link to?"
  → signInWithOtp({email})
  → "Your link is on its way. Your network is glad you're here."

Passed member → perspective offer ONLY — no claim, no "Passed" label:
  "[Name] — born [location]. Their story is part of this network.
   Would you like to see this network the way [FirstName] would have?"

Not in network →
  "We don't have you here yet. How are you connected to this network?"
  → collect connection description
  → "What's your email? [Founder name] will add you shortly."
  → insert waitlist record
  → notify vikas@eternalcurrent.online
  → "You're on your way in."

---

## MILESTONE EXPERIENCE FEATURE (designed, not built)

Reusable feature for life milestones: weddings, graduations,
births, memorials, reunions, milestone birthdays, immigration/citizenship.

URL pattern: eternalcurrent.online/m/[slug]
milestones table: exists, no data yet

How it's created: AI conversation — no forms ever.
Delivery: QR code (client-side JS) + NFC tags for physical events

First prototype: Sahiba (SBM-ATM) + Xavier (XVR-SBM) wedding

Wedding visualization: two arc colors converge on event location
Memorial: perspective-switch to passed member's view

Guest feed: attendees post one message/memory during event
Vendor layer: Phase 2, founder opt-in only. Never unsolicited.

---

## REVENUE MODEL

Phase 1 (subscriptions):
  Conductor $5.99/mo, ConductorPro $8.99/mo,
  Student $3/mo, OrgAdmin $14.99/mo
  No auto-renewal fees. Freeze-not-delete on lapse.

Phase 2 (event commerce):
  Milestone vendor marketplace. Founder opts in.
  Vendor pays placement. Members never see unsolicited ads.

Phase 2 (contextual affiliates):
  Babbel language learning — triggered by vocab library engagement
  One suggestion per session, opt-in only, never in globe view.

---

## VOCABULARY LIBRARY — 143 TERMS

Languages: Hindi(30), English(14), Tamil(12), Bengali(12),
Italian(12), Gujarati(11), Marathi(11), Spanish(11), Punjabi(10),
Portuguese(9), Fijian Hindi(3), Urdu(4), Dominican Spanish(2)

Living-usage terms from ECO founding network:
  Jij, Jijiya, Ladkan (Fijian Hindi — Bakshi-Singh household)

Key cross-language clusters:
  Mama/Maama/Mamu: pan-South Asian maternal uncle term
  Dada collision: grandfather (Hindi) vs elder brother (Bengali/Marathi)

---

## NETWORK STRUCTURE — LIGHTNING-001 (locked, never alter)

Krishan + Leela Datta → Nirupma (Neeru), Babloo (BD-962), Anu
Madan + Nirupma → Vikas (STAR), Amit† (AB-STAR, deceased), Pragati
Narendra + Jaiwati Singh → Reema (RRB-STAR), Karishma, Seema
Ramesh Sewak = Jaiwati's BROTHER (not her child)
Isaiah (IB-STAR): adopted by Vikas + Reema; birth father = Amit†
Niti Vaid (NV-STAR) = Anu + Satish Vaid's daughter = Vikas's first cousin
Sahiba (SBM-ATM) = engaged to Xavier (XVR-SBM) — highest-leverage event
Birth dates: MM/YYYY only — NEVER include the day

---

## SESSION RULES (standing — apply every session)

1. Supabase MCP connected: query database directly.
   Never ask Vikas to paste SQL results.
2. Read docs/MASTER_SPEC.md from GitHub at session start.
   It is the source of truth. Memory is secondary.
3. Discuss before coding — confirm design before any file output.
4. No forms anywhere — ever.
5. No "family" language in UI — network, people, connections.
6. ECO wordmark: E=#00AAFF C=#00CC44 O=#FFFFFF always.
7. Only changed files updated — minimize token usage.
8. Design decisions locked before HTML is touched.
9. Birth dates MM/YYYY only — never the day.
10. After any schema change, verify with Supabase MCP query.

---

## LESSONS LEARNED

- Repeated corrections from building without full spec = double token cost.
  Fix: confirm spec in plain language before generating any file.
- MCP direct queries eliminate the copy-paste loop entirely.
- Long single sessions accumulate context. Short focused sessions
  with a clear objective stated at the start are more efficient.
- users_public view must be recreated (DROP + CREATE) when adding
  new columns to users table — Postgres cannot add columns to views in place.
- Supabase anon key is safe to embed in frontend JS.
  Service role key is never in any file.
- Windows Credential Manager caches GitHub credentials per account.
  Multiple GitHub accounts on one machine requires explicit URL credentials
  or Credential Manager cleanup between accounts.
- git config --global user.name / user.email must be set per account
  to avoid wrong contributor showing on commits.
- Empty folders are not committed by git. Workflow files must contain
  at least one file before git add will track the folder.
- GitHub Actions deploy.yml must be in .github/workflows/ directory.
  Easiest to create via GitHub UI (Add file → Create new file)
  rather than local filesystem.
- FTP deploy to Namecheap: server-dir should be public_html/ (relative)
  not /public_html/ (absolute) because FTP account root is /home/etermhtj.
