# MuslimsInCanada.com — Phase 2: Product Strategy & Feature Architecture

*Built directly on the Phase 0 North Star and Phase 1 research. Every priority call below traces back to a specific Phase 1 finding — flagged inline so nothing here is arbitrary.*

---

## 1. Product Pillars

1. **Verified Trust, Not Just Listings.** Every mosque, business, and halal claim shows its provenance (source, last-verified date, certifying body where relevant). Directly answers the CBC halal-fraud finding and the Salatomatic-style trust collapse.
2. **Hybrid Freshness.** Automation where it's genuinely available (OSM + CRA seed the mosque/org layer) *plus* a first-class, well-moderated manual/community channel for everything automation can't reach (events, most businesses). Phase 1 proved pure automation isn't achievable yet — this pillar makes that explicit rather than overselling.
3. **City-Real, GTA-First.** Depth in one dense, validated market (Toronto CMA, 10.2% Muslim) before breadth — a real community hub, not a thin national shell.
4. **Inclusive by Design.** No madhhab, ethnic, or language bias — validated as necessary by the ethnic diversity data (South Asian 37.6%, Arab 32.2%, West Asian 13%, Black 11.6%).
5. **AI Grounded in What We Actually Know.** The one genuinely unoccupied niche found in Phase 1 (no competitor does local-civic AI) — but scoped honestly to the platform's real, still-thin data at launch.
6. **Free Community Value First.** No monetization pressure distorting trust in year one.

---

## 2. Complete Feature Inventory

| Domain | Features |
|---|---|
| **Mosque / Islamic education directory** | Mosque profiles (location, hours, Jumu'ah times, facilities, women's section flag), Islamic schools/Quran classes/hifz programs, source/freshness badges, "near me" |
| **Organizations** | Charity/nonprofit profiles seeded from CRA data, program listings, claim flow (Phase 2+) |
| **Business directory** | Business profiles, "Add Your Business," halal-status display (certifying body + date, not self-asserted), categories (restaurants, grocery, services, professional) |
| **Events** | Manual + community submission, iCal-opportunistic ingestion, calendar/map/filter views, auto-expiry after event date, RSVP/add-to-calendar, sharing |
| **Jobs** | Employer posting, job seeker discovery, category filters — **data-source-dependent, see MVP scope below** |
| **Community resources** | Newcomer resources, social services, funeral/janazah services, food banks — high alignment with the U of T research finding on newcomer needs |
| **AI assistant ("Ask MuslimsInCanada")** | Natural-language Q&A grounded only in verified platform data, cites sources/freshness, says "I don't know" rather than guessing |
| **Search & Maps** | Keyword + filter + map + "near me," natural-language query parsing |
| **Community/social** | Submission flows, corrections/reporting, light community posts — deliberately not a social feed |
| **Accounts** | Lightweight — see open decision below |
| **Admin & moderation** | Source health dashboard, submission queue, report handling, org/business claim review |
| **Data pipeline** | Source registry, OSM/CRA ingestion jobs, iCal pollers, dedup/entity-matching, freshness/confidence scoring |
| **Trust & provenance UI** | Freshness badges, "last verified," source links — cross-cutting, not a single feature |
| **SEO & sharing** | City/mosque/business/event pages built for search, share buttons everywhere |
| **Multilingual** | i18n framework from day one; live languages start EN (+FR strongly considered — see decisions) |
| **Notifications** | Deferred — explicitly listed as a later-phase feature in the original brief |

---

## 3. Feature Prioritization (MoSCoW)

| Feature | Priority | Phase | User value | Tech complexity | Data dependency | Moderation need | Privacy note |
|---|---|---|---|---|---|---|---|
| Mosque directory (OSM+CRA seeded) | **Must** | MVP | High | Medium | OSM, CRA (high-confidence) | Low (verify seed accuracy) | Standard |
| Freshness/provenance badges | **Must** | MVP | High | Low-Medium | — | — | — |
| Halal-verified business directory | **Must** | MVP | High (CBC-evidenced) | Low | Manual + certifier links | Medium (false-claim risk) | Standard |
| Community event submission + moderation | **Must** | MVP | High | Medium | Manual-first, iCal-opportunistic | **High** (real workload, not optional) | Standard |
| Search + map + "near me" | **Must** | MVP | High | Medium-High | — | — | Location precision care |
| City hub (GTA) | **Must** | MVP | High | Medium | — | — | — |
| Sharing (WhatsApp/social) | **Must** | MVP | Medium | Low | — | — | — |
| Basic admin/moderation dashboard | **Must** | MVP | — (internal) | Medium | — | — | — |
| AI assistant (narrow, GTA-only grounding) | **Should** | MVP-end / early Phase 2 | High (novel) | High | Depends on directory data existing first | Medium (must never fabricate) | Careful — see "near me" precision risk from Phase 0 |
| Organization profiles (seeded, unclaimed) | **Should** | MVP | Medium | Low-Medium | CRA seed | Low | Standard |
| Community resources (newcomer/social services) | **Should** | MVP | High (U of T research) | Low | Manual | Medium | Elevated — some services (e.g. shelters) may need reduced location precision |
| Organization claiming/verification flow | **Could** | Phase 2 | Medium | Medium | Requires accounts | Medium | Identity verification needed |
| Jobs vertical | **Could** | Phase 2 | Unproven (weak evidence) | Medium | **Unresolved — Indeed/LinkedIn closed, Job Bank Canada/Adzuna unresearched** | Low-Medium | Standard |
| Business claiming | **Could** | Phase 2 | Medium | Medium | Requires accounts | Low | Standard |
| Full accounts/personalization ("My Community") | **Could** | Phase 2/3 | Medium | Medium-High | — | Low | Elevated (preference data) |
| Notifications | **Could** | Phase 2/3 | Medium | Medium | — | Low | Consent-driven |
| French language | **Should** (bring forward if Montreal is next city) | Phase 2 | Medium (Quebec market) | Medium (i18n) | — | — | — |
| Additional languages (Arabic, Urdu, etc.) | Could | Phase 3 | High for newcomers | Medium-High | — | — | — |
| Community social features (posts, polls) | **Could** | Phase 3 | Medium | Medium | — | **High** | Standard, sectarian-conflict risk |
| Matrimonial, donations/payments, native mobile apps | **Future** | Explicitly deferred | — | High | — | High | High (financial/identity data) |
| US/North America expansion | **Future** | Post-GTA-proof | — | — | — | — | — |

---

## 4. MVP Definition

**In scope:** GTA-only launch. Mosque directory seeded from OSM + CRA (cross-referenced for legitimacy) with manual correction/claim-request open from day one. Halal-verified business directory where "halal" always links to a certifying body and certificate date rather than being self-asserted. Events via manual/community submission with iCal polling wherever a source happens to expose it, auto-expiring after the event date. Full-text + map + natural-language "near me" search. A single GTA city hub. A narrow AI assistant explicitly scoped to "what we've verified in the GTA so far," designed to say "I don't know" rather than invent. A real, staffed moderation queue — not a someday feature. A lightweight admin dashboard covering source health and the moderation queue. Sharing on every listing. SEO-structured pages for every mosque/business/event.

**Explicitly deferred out of MVP, with reasons tied to Phase 1 evidence:**
- **Jobs vertical** — the two obvious data sources are closed to a new entrant, and the underlying user pain point has the weakest direct evidence of anything in Phase 1. Revisit once Job Bank Canada/Adzuna are researched and/or real user demand is confirmed.
- **Organization/business claiming workflows** — profiles exist (seeded), but full claim-and-verify flows need accounts/identity verification, which is real scope; ship the seed data first, claiming in Phase 2.
- **Full personalization / "My Community"** — Phase 0 already flagged this as non-MVP; nothing in Phase 1 changes that.
- **Notifications, matrimonial, donations, native mobile apps** — all explicitly deferred in the original brief; nothing here argues for pulling any of them forward.
- **Languages beyond English at launch** — French is the strongest candidate to add early (large Muslim population in Montreal, likely the second city), but isn't required for a GTA-only MVP. Needs a decision below.

**Why this is defensible as an MVP and not a shortcut:** every deferred item is deferred for a *specific, evidenced* reason (closed data access, unproven demand, or explicit original scope), not because it was inconvenient to build. Everything kept in MVP maps to a Phase 1 finding with real evidence behind it.

---

## 5. Feature Dependencies (what blocks what)

- The **AI assistant** cannot ship credibly before the directory + search index have real data in them — sequenced after the mosque/business/event data model is live, not built in parallel from zero.
- **Organization/business claiming** depends on accounts existing, which depends on an auth decision (see below) — don't build claiming UI before that's settled.
- The **jobs vertical** is blocked on resolving the data-source question (Job Bank Canada/Adzuna feasibility) — don't schedule engineering time against it until that's answered.
- **Moderation tooling** must exist *before* community submission opens publicly, not after — Phase 1 found every real competitor's failure mode was stale/wrong data, and open submission without moderation would recreate that immediately.
- **Freshness/provenance UI** is a cross-cutting data-model requirement, not a bolt-on feature — it has to be designed into the schema from the first migration (see architecture protection below), or retrofitting it later touches every table.

---

## 6. Protecting the Long-Term Architecture from MVP Shortcuts

These are the specific places an MVP-speed build could quietly foreclose the long-term vision — each one gets called out explicitly so it isn't cut without a conscious decision:

- **Geography model must be Country → Province → City → Neighbourhood from the first schema migration**, even though only GTA content exists at launch. Hardcoding "Canada-only" or "GTA-only" anywhere in the data model breaks the North America roadmap silently.
- **Every content record needs source/provenance/confidence/last-verified fields from day one**, even for the majority of MVP content that's manually entered — retrofitting provenance onto existing rows later is real, avoidable pain.
- **i18n framework in place from day one**, even with only English (and possibly French) strings live — no hardcoded English text in templates.
- **Organization/business data model should support "unclaimed" as a first-class state from the start**, even though the claim *flow* ships in Phase 2 — so seeded CRA/OSM profiles don't need a schema change to become claimable later.
- **Moderation/reporting data model designed for the real categories now** (spam, closed business, incorrect prayer time, scam, inappropriate content) even if only a subset of moderation *tooling* ships at MVP.
- **AI assistant's grounding mechanism must be architected to expand its data scope over time** (more cities, more categories) without a rebuild — narrow MVP scope should be a runtime constraint, not a hardcoded limitation.

---

## 7. Roadmap

**MVP (Phase 5–6 build):** GTA-only. Mosque/org directory (OSM+CRA seeded), halal-verified business directory, community-submitted events, search/maps, narrow AI assistant, moderation, basic admin, sharing, SEO pages.

**Phase 2 (post-MVP validation):** Organization/business claiming and verification, jobs vertical (pending data-source resolution), French language, expand AI assistant scope, second city (Montreal is the strongest candidate per Phase 1 demographics), lightweight accounts/notifications, deeper analytics.

**Phase 3:** Additional GTA-tier cities (Calgary, Edmonton, Ottawa, Vancouver per Phase 1 CMA ranking), more languages (Arabic, Urdu — both well-evidenced by the language-at-home data), full personalization/"My Community," native mobile app evaluation, community social features (with sectarian-conflict moderation designed in from the start, not retrofitted).

**Future / North America expansion:** US market entry once the Canadian model is proven, matrimonial/donations/financial features (each requiring their own trust/compliance work), deeper monetization exploration.

This sequencing keeps the "digital home for Canada's Muslim community" vision intact — nothing here removes a long-term capability, it just orders when each one gets built, and ties every ordering decision to a specific piece of Phase 1 evidence rather than a guess.

---

## Decisions Requiring Your Approval

1. **MVP scope as defined above** — specifically, are you comfortable deferring the jobs vertical entirely out of MVP given the weak data-source and evidence situation?
2. **Accounts/auth approach for MVP** — full user accounts from day one, or a lighter no-login submission model (email-verified submissions only) with real accounts arriving in Phase 2 alongside claiming? This materially affects MVP build time.
3. **Halal verification model** — MVP shows certifying-body links only (never asserts halal status itself), consistent with the CBC-investigation risk flagged in Phase 1. Confirm this is the right level of caution, or if you want a heavier/lighter verification posture.
4. **French at MVP or Phase 2?** — Given Montreal's strong Muslim population (8.7% of CMA) is the likely second city, is French worth building into the MVP launch, or should it wait for Phase 2 alongside the Montreal expansion?
5. **GTA launch sequencing** — all of the GTA at once, or Toronto-proper first with Peel Region (Mississauga/Brampton) following shortly after, given Peel is likely the single densest sub-market?

Once these are settled, Phase 3 (information architecture, UX, and the actual sitemap/design system) is next.
