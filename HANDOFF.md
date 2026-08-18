# MuslimsInCanada.com — Handoff Log

Shared log between Cowork (research/architecture/content) and Claude Code (git/Vercel/deploy), both working out of this folder. Newest entry on top. Read this + `git log` before starting work each session.

---

### 2026-08-18 — Claude Code (Session 2 — Vercel Deploy Issue)
**Phase 5 BLOCKED on Vercel deployment.** Next.js 14 app fully scaffolded and code-complete; Vercel configuration still being tuned.

**What's built (code-complete):**
- ✅ **Homepage** (Phase 3 spec): city selector, email signup, hero CTA
- ✅ **Toronto city hub** (`/toronto`): dynamic page that queries live Supabase database for mosques, businesses, events  
- ✅ **Supabase integration**: `@supabase/supabase-js` installed, lazy-initialized client (deferred to runtime)
- ✅ **Empty-state UI**: city hub shows correct empty state when no listings exist (per Phase 4)
- ✅ **Local build**: `npm run build` succeeds locally; `.next` directory built correctly

**GitHub:**
- ✅ Code pushed: https://github.com/faisalaiagent-hub/muslimsincanada
- ✅ Latest commit: `537f5f6` (uses Vercel Next.js builder via vercel.json)

**Vercel Deployment Status:**
- ⚠️ **BLOCKED:** Build repeatedly fails with "No Output Directory named 'public' found"
- 🔧 **Current approach:** Using `@vercel/next` builder in vercel.json (latest commit 537f5f6)
- ⏳ **Waiting:** Next deployment should resolve with proper Next.js builder config
- 📍 **URLs not live yet** (returning 404) — will be live once build succeeds

**Next steps to unblock (for Claude Code Session 3):**
1. Check if latest Vercel deployment (commit 537f5f6 with @vercel/next builder) succeeded
2. If still failing: investigate Vercel build logs for actual error, may need to adjust Next.js config or try `outputDirectory: ".next/standalone"`
3. Once deployment is **Ready**: add Supabase env vars to Vercel Production settings:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
4. Redeploy and test city hub queries against live (empty) database

**For Cowork (blocked until Vercel is live):**
- Ingestion engine: seed OSM mosque records + CRA charity data for Toronto into the database
- Once data is in, city hub will automatically render real listings

---

### 2026-08-18 — Cowork
**Database is live.** Provisioned a dedicated Supabase project (`muslimsincanada`, region `ca-central-1` — Canadian data residency, on the free tier, $0/month) and applied the full Phase 4 schema directly.

**Connection details:**
```
Project ref: sbznvhucxzrbtssiafgp
Project URL: https://sbznvhucxzrbtssiafgp.supabase.co
Publishable/anon key: sb_publishable_vXuZZ_MkD0r4BeBTSCOnLA_6Ps4BNlJ
```
**Claude Code — you need to grab the `service_role` secret key yourself** from the Supabase dashboard (Project Settings → API → service_role key) — that key isn't exposed through my tools on purpose, and it's required for any server-side/admin writes that need to bypass Row Level Security (e.g., the moderation-approval step that promotes a `submission` row into a real `mosque`/`business`/`event` row).

**What's built (18 tables, PostGIS + pg_trgm enabled):**
- Geography: `country` → `province` → `city` → `neighbourhood`. Seeded: Canada, 4 provinces, 13 cities. `is_launched=true` for Toronto/Mississauga/Brampton (launch_order 1-3, per the locked Phase 2 sequencing); Montreal/Ottawa/Calgary/Edmonton/Vancouver/etc. seeded but `is_launched=false` for later phases.
- Content: `organization`, `mosque`, `business`, `event`, `resource` — each carries the shared provenance fields from Phase 4 (`source_id`, `data_snapshot_id`, `confidence_score`, `verification_status` enum, `claim_status` enum, `last_verified_at`).
- Trust: `certifying_body` (seeded with HMA, ISNA IHCA, IFANCA — the real bodies named in the Phase 1 halal research) + `halal_certification`, linked from `business`.
- Aggregation engine backbone: `source` (seeded with OSM Overpass + CRA T3010 registry rows) and `data_snapshot`.
- Cross-cutting: `verification` (history log), `report`, `claim`, `submission` (the no-login public contribution table), `event_log` (analytics).
- RLS is on everywhere it matters: public (anon key) can only `select` `verification_status = 'published'` rows, and can only `insert` into `submission`/`report`/`claim` — nothing else is publicly writable. All other writes need the service_role key, i.e. go through server-side code.

**Minor advisories, not urgent:** PostGIS's own `spatial_ref_sys` table (just EPSG coordinate-system reference data, not app data) doesn't have RLS enabled — cosmetic, Supabase's linter always flags this, safe to ignore. `postgis`/`pg_trgm` extensions installed in the `public` schema rather than a dedicated schema — standard Supabase default, low priority cleanup.

**Over to you, Claude Code:**
1. Scaffold the Next.js app in this repo (per Phase 4: Next.js on Vercel).
2. `npm install @supabase/supabase-js`, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as Vercel env vars (values above), plus `SUPABASE_SERVICE_ROLE_KEY` (server-only, get it from the dashboard as noted above).
3. Build the homepage + Toronto city hub first (per `research/Phase3_IA_UX.md` page specs) — there's no listing data yet (mosque/business/event tables are empty pending the ingestion engine), so these pages should render real empty-state UI against the live schema, not mock data, so the city's `is_launched` flag and the freshness-indicator pattern are real from the start.
4. Full schema is queryable directly — feel free to introspect it yourselfrather than relying only on this summary.

---

### 2026-08-18 — Cowork
Completed Phase 4 — dropped `research/Phase4_Architecture.md`. Stack: Next.js on Vercel, Postgres+PostGIS via Supabase, Claude API for extraction + AI assistant, pg_cron + Edge Functions for scheduled ingestion.

---

### 2026-08-18 — Cowork
Completed Phase 3 (`research/Phase3_IA_UX.md`), Phase 2 (`research/Phase2_Strategy.md` — MVP locked: GTA-only, no-login submissions, halal-certifier-link pattern, jobs+French deferred), and Phase 1 (`research/Phase1_Research.md` — OSM+CRA are the strong automation sources, Toronto CMA ~10.2% Muslim confirms GTA as flagship).

---

### 2026-08-17 — Claude Code
✅ git init, GitHub repo (https://github.com/faisalaiagent-hub/muslimsincanada), Vercel deploy, custom domain. Live: https://muslimsincanada.vercel.app | muslimsincanada.com (DNS added at Network Solutions — flagged earlier for Faisal to confirm that's the domain's actual registrar/DNS host, since it was described as Hostinger).
