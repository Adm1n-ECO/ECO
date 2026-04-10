# ECO — Agreed Decisions Log
Last updated: 2026-04-08

## Architecture Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| D-01 | No HTML form tags anywhere on platform | All input is conversational AI, tap/toggle, or file picker |
| D-02 | Arial Black 900 for all headings | Locked brand identity |
| D-03 | ECO wordmark: E=#00AAFF, C=#00CC44, O=#FFFFFF | Permanent, never change |
| D-04 | Dark void background #080D14 | ECO brand standard |
| D-05 | Tagline: "Only Yours. Forever." with period | Locked |
| D-06 | "You are not the product. You never will be." | Replaces all "your data" language |
| D-07 | Birth dates as MM/YYYY only — never include day | Privacy + enables milestone calculations |
| D-08 | Supabase Edge Function for Anthropic API key | Key never in client-side code |
| D-09 | `config.js` shared key file | One file to update for all pages |
| D-10 | Namecheap hosting (manual upload) for now | Vercel migration deferred |
| D-11 | GitHub: Adm1n-ECO/ECO-archive (private) | Push via `git push --force` |
| D-12 | Magic link auth only — no passwords | Two sequential prompts, no form tag |
| D-13 | Free_Forever tier for all 104 founding members | Lifetime commitment |
| D-14 | Relationships auto-derived from structure | parent_id + partner_id → all titles computed |
| D-15 | Relationship titles capitalized: Parent, Child, Sibling, Spouse, Cousin, Friend, Grandparent, Grandchild, AuntUncle, NieceNephew | Matches DB constraint |
| D-16 | Non-family connections (friends) in relationships table | relation_type = 'Friend' |
| D-17 | user.html is universal post-login landing page | All auth redirects go here |
| D-18 | Globe textures served locally from /textures/ | Never from CDN |
| D-19 | AI Story Session system prompt: "Tell me more about that" is banned | Varied questions required |
| D-20 | Visualization names: Network, River, The Funk, Currents | User-facing labels |
| D-21 | The Funk themes: Organic (leaves), Ripple (water), Circuit (PCB), Cosmos (space) | 4 distinct visual styles |
| D-22 | Currents styles: Energetic, Minimal, Current (ECO brand), Organic | Canvas-based fan layout |
| D-23 | Family left / extended network right | Split used in Ripple, Circuit, Cosmos, Currents |
| D-24 | Vercel migration planned — eliminates manual Namecheap uploads | Deferred to future session |
| D-25 | Religious institutions excluded as marketing channels | Secular cultural orgs preferred |

## Data Decisions

| # | Decision |
|---|----------|
| DD-01 | Primary table is `users` (not `members`) |
| DD-02 | Relationships table columns: `subject_id`, `target_id`, `relation_type` |
| DD-03 | Network ID: `lightning-001` for founding network |
| DD-04 | `visible_to` = 'all' (48 members) or 'network' (56 members) |
| DD-05 | Cultural vocabulary table: `cultural_vocab_library` |
| DD-06 | Center node for Currents viz found via `platform_role = NetworkOwner` |
| DD-07 | Excel import uses name-based matching — no user_id copy/paste |
