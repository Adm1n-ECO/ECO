# ECO Next Session Brief
## EternalCurrent.Online
**Last Updated:** April 10, 2026 — Session 10

---

## CURRENT STATUS — FULLY DEPLOYED + SESSION 10 COMPLETE

- **Phase 1:** ✅ Complete & Live
- **Phase 2:** ✅ Complete & Live
- **Stripe:** ✅ Live
- **Weekly Digest:** ✅ Live
- **Session 10:** ✅ Photo avatars (3 pages), theme selector swatches, wedding claim page, Isaiah → SystemAdmin

---

## SESSION START TEMPLATE

```
I'm Vikas Bakshi (STAR), founder of EternalCurrent.Online (ECO).
INFRA: Supabase prbeyvmsyxuiggqwiham · 104 members · 941 relationships · Namecheap · Adm1n-ECO/ECO.git · git push --force
EDGE FUNCTIONS (all live): claude-proxy · stripe-create-checkout · stripe-webhook · quest-generator · weekly-digest · pulse-generator
STRIPE (live): conductor price_1TKVWQ9AzGOao739NgU94gC2 · pro_conductor price_1TKVYU9AzGOao739sQbQxt6T · org_admin price_1TKVah9AzGOao739y5zja4UH
ISAIAH: IB-STAR platform_role=SystemAdmin (DB set) · auth_id still null · awaiting claim
BRAND: E=#00AAFF C=#00CC44 O=#FFF · Arial Black 900 · bg #080D14 · No forms ever
PHASE 3 roadmap: TRIBE-01 (tribal expansion) · ORG-01 (org admin dashboard) — confirm with Vikas
[Upload latest zip to continue]
```

---

## ⚠️ PERMANENT RULE — ZIP AND DEPLOY — READ AND FOLLOW EVERY SESSION

**Claude must follow this at the end of EVERY session, no exceptions:**

1. The zip export contains ONLY the files changed this session — never the full site.
2. Claude MUST end every session with an explicit list:
   ```
   FILES CHANGED THIS SESSION — copy only these from zip:
   - filename.html  (new / updated)
   - filename.js    (new / updated)
   ```
3. Vikas copies ONLY those listed files into Website\ — no other files are touched.
4. Run `deploy.bat` to push — never `git add -A`.

**Why:** The Claude container has no images/, textures/, or binary assets.
Extracting a full zip or running `git add -A` will delete those files from git.

**deploy.bat** is in the repo root — it only stages *.html *.js *.css docs\*.md
It will never stage or delete images/, textures/, or any binary files.

**Recovery if deletion happens:**
```
git checkout HEAD~1 -- images/
git checkout HEAD~1 -- textures/
git add images/ textures/
git commit --amend --no-edit
git push --force origin main
```

---

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
