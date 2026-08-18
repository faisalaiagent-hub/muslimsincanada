# MuslimsInCanada.com — Phase 3: Information Architecture, UX & Design System

*Built on the locked Phase 2 MVP scope: GTA-only, no-login lightweight submissions, halal claims always link to a certifying body, French and jobs deferred to Phase 2. This document specifies structure and design intent — it is not the built application (that's Phase 5+); it's the blueprint Phase 5 builds from.*

---

## 1. Complete Sitemap (MVP scope, architected for what's coming)

```
/ (homepage)
/toronto  /mississauga  /brampton  ... (city hub, one per launch city — Toronto + Peel first)
/toronto/mosques  /toronto/mosques/[slug]
/toronto/businesses  /toronto/businesses/[slug]
/toronto/events  /toronto/events/[slug]
/toronto/organizations  /toronto/organizations/[slug]
/toronto/resources  /toronto/resources/[slug]
/toronto/jobs  → "Coming soon" stub, route reserved not removed (Phase 2 feature)
/search
/map
/ask  (AI assistant)
/submit  (mosque / business / event / organization / correction — one flow, typed by content kind)
/claim/[type]/[slug]  → stub route reserved for Phase 2 claiming, not live at MVP
/about
/community-guidelines  (moderation policy, transparent to build trust)
/privacy  /terms
/admin  (internal, not publicly linked)
```

**Why routes are reserved even when the feature isn't live** (jobs, claiming): matches the Phase 2 architecture-protection principle — a URL structure that has to change later because it wasn't planned for is exactly the kind of MVP shortcut the North Star warns against.

## 2. Navigation Model

**Primary nav (persistent header):** City switcher (defaults to detected/selected city) — Mosques — Businesses — Events — Organizations — Resources — Ask AI — Submit (prominent, always-visible CTA).

**Mobile:** collapses to a bottom tab bar (Home / Search / Ask / Submit / Menu) — five-tab pattern chosen because "Submit" needs to stay one tap away everywhere, not buried in a hamburger menu, since community contribution is core infrastructure, not an edge-case feature.

**City hub as the real home**, not the national homepage: once a user has a city set, `/` effectively redirects/renders as their city hub. The national homepage is the entry point for new/undecided users only.

## 3. Homepage

Structure, top to bottom: hero with a single natural-language search bar ("Find a mosque, event, business, or resource near you...") — city selector immediately below it (Toronto, Mississauga, Brampton, "more cities coming" for anything outside the flagship launch) — "What's happening this week" (live events pulled from whichever city is selected) — three-up cards for Find a Mosque / Find Halal / Find an Event — a visible trust strip explaining the freshness/verification model in one line, since trust has to be sold on the homepage, not just delivered on detail pages — a closing "Add your mosque/business/event" CTA aimed at organizations and business owners specifically.

Deliberately **not** a national feed of everything — Phase 1 found that a thin, obviously-not-yet-complete national presence undermines trust faster than an honest "we're focused on the GTA right now" framing does.

## 4. City Hub (`/toronto`)

This is the page that has to feel like "my community," per the North Star. Sections: local search/filter bar — today/this-week event strip — mosque directory preview (with a "see all" to the full filtered list) — halal-verified business spotlight — organizations/resources preview — an honest, visible freshness indicator for the city as a whole (e.g., "X mosques verified, Y events this week, last data refresh: [date]") so the platform's own freshness claim is demonstrated, not just asserted.

## 5. Search & Maps

Single search bar handles both keyword and natural-language queries ("halal restaurants open now near Square One," "Jumu'ah after 1pm"). Results view: list + map side-by-side on desktop, toggle on mobile. Filters: category, distance, "open now," halal-certified (with certifier shown), free/paid (events), family-friendly, accessibility. Map uses clustering at city zoom, individual pins at neighbourhood zoom. "Near me" always asks for approximate location first, exact only if the user opts in — per the Phase 0 institutional-safety principle, precision should default to the minimum needed.

## 6. Mosque Page

Name, address, map, Jumu'ah/prayer times, facilities (parking, women's section, wheelchair access), source badge ("Seeded from OpenStreetMap + CRA charity records" or "Community-submitted" or "Organization-verified"), last-verified date, "Report incorrect info" always visible, "Is this your mosque? Claim it" (stub at MVP, routes to a waitlist/contact form until Phase 2 claiming ships).

## 7. Organization Page

Same provenance pattern as mosque pages. Shows CRA registration number where seeded from charity data (a real trust signal worth surfacing, not hiding), program/service listings, contact info, claim CTA (same MVP stub pattern).

## 8. Business Page

Name, category, address/map, hours, halal status **always rendered as a link to the certifying body + certificate date** — never a bare badge — directly implementing the locked Phase 2 decision. "Muslim-owned" shown only when the owner has voluntarily stated it (never inferred). Photos, "Add Your Business" and "Suggest a correction" both one tap away.

## 9. Event Page

Title, date/time, location (or "online"), category tags, family-friendly/gender-specific flags where organizers specify them, source (organizer-submitted / community-submitted / iCal-ingested), add-to-calendar, share buttons, and **automatic removal from active listings after the event date** — archived, not deleted, so the freshness signal stays honest without losing data.

## 10. Resource Page

Newcomer resources, social services, funeral/janazah services, food banks — same card pattern as businesses but no halal-status field; instead a "service area" and "who this is for" field, reflecting the U of T research finding that these are often navigated informally and need clearer framing than a typical directory listing.

## 11. AI Assistant (`/ask`)

Chat-style interface, but every answer is required to show its grounding: which listings it drew from, their freshness date, and a source link. When the platform's data can't answer a question, it says so explicitly rather than guessing — this is a hard product requirement, not a nice-to-have, per the North Star's "AI never invents" principle. At MVP, the assistant's own UI should be honest about scope (e.g., a visible note: "I can currently answer questions about Toronto and Peel Region") rather than presenting itself as a general Muslim-world AI — directly addressing the Phase 0 tension about thin-data credibility.

## 12. Submission Flow (`/submit`)

One entry point, first question is "what are you adding?" (mosque / business / event / organization / correction to something existing) — branches into a short, specific form per type. No account required (per the locked no-login MVP decision) — email verification only, to keep a minimal anti-spam floor without account-creation friction. Every submission enters the moderation queue before going live; the submitter sees a clear "pending review" state, not silence.

## 13. Admin Experience (internal, `/admin`)

Source health (OSM/CRA sync status, last successful run), moderation queue (submissions, reports, flagged content), a simple "at a glance" freshness dashboard per city. Kept deliberately minimal at MVP — full admin tooling per the original brief's spec (organizations/businesses/events sub-dashboards, analytics) is real scope, sequenced into Phase 2 rather than gold-plated before there's real data flowing through it.

## 14. Mobile & Accessibility

Mobile-first responsive layout throughout (bottom tab nav as noted above). WCAG 2.1 AA as the baseline target: sufficient color contrast, keyboard navigation, screen-reader labels on all interactive elements (especially map/filter controls, which are the easiest to get wrong), touch targets sized for real thumbs, text resizing support. RTL layout support is architected into the CSS/component layer now (even though Arabic isn't a live MVP language) so adding Arabic in Phase 3 of the roadmap doesn't require a redesign — the same "don't foreclose the future" principle applied to layout, not just data.

---

## 15. Design System

**Tone:** modern, warm, trustworthy — explicitly *not* a generic "mosque website" aesthetic (ornate arches, green-and-gold clichés). Think closer to a well-designed Canadian civic-tech or local-news product than a religious-institution website — because the brand promise is "reliable community infrastructure," not "Islamic aesthetic showcase."

**Typography:** a clean, highly legible sans-serif for UI text (system font stack is fine at MVP — no need to license anything bespoke yet), with enough weight range to distinguish headings/body/metadata clearly. Arabic-script readiness means choosing a typeface stack now that has a matching Arabic companion available later, rather than picking something that'll need replacing.

**Color:** a neutral, warm-toned base (off-white/warm-grey backgrounds rather than stark white) with a single confident accent color used consistently for primary actions and trust indicators — avoid the trap of using green purely because "Islamic," and instead let the accent color be a deliberate brand choice. Status colors (fresh/verified = calm green, needs-verification = amber, expired/stale = muted red) should be distinct from the brand accent so they read as *status*, not decoration.

**Core components:** listing cards (mosque/business/event/org share a common card shell with type-specific fields), freshness badge (small, consistent, always shows a relative date — "verified 3 days ago" beats a raw timestamp), source-provenance chip (distinct visual treatment from the freshness badge — they answer different questions: "is this current" vs. "where did this come from"), filter bar (collapsible on mobile), map component with clustering, a single shared submission-form pattern reused across mosque/business/event/org submission, and a moderation-queue list component for admin.

**Trust & freshness indicators, as a system, not a one-off:** every content type gets the same three visual signals in the same position — source, last-verified date, and (where applicable) certifying-body link. Consistency here is what makes the trust story legible across the whole platform rather than feeling bolted onto individual pages.

---

## How This Supports the Community Flywheel

The submission flow being one tap away everywhere (not buried) is what lets "more sources → more information" actually start turning without waiting for the automation engine alone to carry it. The city hub's visible freshness indicator turns the platform's core differentiator into something a visitor can *see*, which is what turns a one-time visitor into a returning one. The claim-stub pattern on mosque/org/business pages (even before claiming is live) signals to organizations from day one that this is a platform designed for them to eventually own their presence on, which matters for the "more organizations" leg of the flywheel well before that feature ships. The AI assistant's honesty about its own scope protects trust during the exact period — thin early data — when it would be easiest to damage it by overpromising.

---

Next is Phase 4: the actual technical and data architecture (database schema, ingestion pipeline design, AI grounding architecture, search/geo architecture, security). That's where the OSM/CRA ingestion engine from Phase 1 becomes a real system design.
