# ECO Next Session Brief
## EternalCurrent.Online
**Last Updated:** April 10, 2026 — Session 11

---

## CURRENT STATUS — FULLY DEPLOYED + SESSION 10 COMPLETE

- **Phase 1:** ✅ Complete & Live
- **Phase 2:** ✅ Complete & Live
- **Stripe:** ✅ Live
- **Weekly Digest:** ✅ Live
- **Session 11:** ✅ Photo avatars (3 pages), theme selector swatches, wedding claim page, Isaiah → SystemAdmin

---

## SESSION START TEMPLATE

```
I'm Vikas Bakshi (STAR), founder of EternalCurrent.Online (ECO).
INFRA: Supabase prbeyvmsyxuiggqwiham · 108 members · 941 relationships · Namecheap · Adm1n-ECO/ECO.git · git push --force
EDGE FUNCTIONS (all live): claude-proxy · stripe-create-checkout · stripe-webhook · quest-generator · weekly-digest · pulse-generator
STRIPE (live): conductor price_1TKVWQ9AzGOao739NgU94gC2 · pro_conductor price_1TKVYU9AzGOao739sQbQxt6T · org_admin price_1TKVah9AzGOao739y5zja4UH
ISAIAH: IB-STAR platform_role=SystemAdmin (DB set) · auth_id still null · awaiting claim
BRAND: E=#00AAFF C=#00CC44 O=#FFF · Arial Black 900 · bg #080D14 · No forms ever
PHASE 3 roadmap: TRIBE-01 (tribal expansion) · ORG-01 (org admin dashboard) — confirm with Vikas
[Upload latest zip to continue]
```

---

## ⚠️ DEPLOYMENT RULE — READ BEFORE EVERY GIT PUSH

**Do NOT extract the full zip into Website\**
The container has no images/ or textures/ — full extract will delete them from git.

**Correct workflow every session:**
1. At session end Claude lists: `Files changed — copy only these from zip: [list]`
2. Copy ONLY those files into Website\
3. Run `deploy.bat` (not `git add -A`)

**deploy.bat** is in repo root — only stages html/js/css/docs, never binary assets.

---


## WORKFLOW — WHAT CLAUDE DOES vs WHAT VIKAS DOES

| Task | Who | How |
|---|---|---|
| SQL migrations | Claude | Via Supabase MCP — automatic, no paste needed |
| HTML/JS/CSS | Claude | Built in session · in zip |
| GitHub deploy | Vikas | Run deploy.bat once at session end |
| Edge function source | Vikas | Copy from zip → Supabase Dashboard → Edge Functions |
| Secrets | Vikas | Paste into Supabase Dashboard → Edge Functions → Secrets |
| SQL files on GitHub | Automatic | deploy.bat stages sql/*.sql every run |

**deploy.bat is now safe to run after full zip extract** — exclusions built in:
- Never stages images/ textures/ or binary files
- Detects placeholder edge functions and refuses to overwrite real source
- Re-stages deploy.bat itself after safety resets

## ACTIVE PAGES (26)

index · home · network · enter · manifesto · eco_academic_review · milestone
user · member · globe · globe-min · confluence · tree · view-pro · view-currents
visual-river · map-pins · photos · ai-portal · data-tools · language
whatsapp-import · year-in-review · theme-manager · admin · **sahiba-xavier-claim**

---

## PHASE 3 ROADMAP

| ID | Feature | Priority | Notes |
|---|---|---|---|
| TRIBE-01 | Tribal network expansion | High | California first · Graton Rancheria seeded · then Oklahoma |
| ORG-01 | Org Admin dashboard | High | Multi-network · org_subscriptions table ready |
| FOLDER-01 | Folder restructure | Medium | /images/ /css/ /js/ /sql/ — path updates across all pages |
| GEDCOM-01 | GEDCOM export | Medium | Standard format · interoperability |
| VEND-01 | Vendor marketplace | Medium | Language learning affiliate |
| OFF-01 | Offline-first mode | Medium | Service worker · IndexedDB |
| SOV-01 | On-premise mini-server | Low | Tribal sovereignty |

---

## KEY SCHEMA NOTES (prevent silent failures)

- `relationships` columns: `subject_id`, `target_id`, `relation_type` (NOT member_id_1/2)
- `relation_type` CHECK: Parent Child Sibling Spouse Cousin Friend Grandparent Grandchild AuntUncle NieceNephew — must be capitalised
- `users` PK: `user_id` · birth date: `birth_mm_yyyy` string "MM/YYYY"
- Photo join: `users.photo_id → photos.id → photos.public_url`
- RLS: anon reads return only `visible_to='all'` (48 members); auth returns all 104


## UPDATED SESSION START TEMPLATE (Session 12+)

```
I'm Vikas Bakshi (STAR), founder of EternalCurrent.Online (ECO).
INFRA: Supabase prbeyvmsyxuiggqwiham · 108 members · Namecheap · Adm1n-ECO/ECO.git
BRANCH: local=master · remote deploy=main · always: git push --force origin master:main
DEPLOY: deploy.bat only — extract full zip first, then run deploy.bat (safe — exclusions built in)
EDGE FUNCTIONS (all live): claude-proxy · stripe-create-checkout · stripe-webhook · quest-generator · weekly-digest · pulse-generator · update-auth-email
STRIPE (live): conductor price_1TKVWQ9AzGOao739NgU94gC2 · pro_conductor price_1TKVYU9AzGOao739sQbQxt6T · org_admin price_1TKVah9AzGOao739y5zja4UH
ISAIAH: IB-STAR platform_role=SystemAdmin (DB set) · auth_id null · awaiting claim
BRAND: E=#00AAFF C=#00CC44 O=#FFF · Arial Black 900 · bg #080D14 · No forms ever
HOUSEHOLDS: h_madanmbakhshi (STAR) · h_ramrakha (Arishma+Vipul) · h_asingh (Alvin+Preetina)
PHOTO NOTE: users.photo_id is a direct URL — never join to photos table for profile avatars
WORKFLOW: Claude runs all SQL via Supabase MCP directly · Vikas only: edge function source paste + secrets paste + deploy.bat
PHASE 3: COMPLETE (SOV-01 deferred) · All pages header-compliant · service-worker live · 008_vendor-marketplace deploy pending
[Upload latest ECO_Complete_Site.zip to continue]
```