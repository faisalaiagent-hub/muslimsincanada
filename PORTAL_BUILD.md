# MIC community portal — first build

Built October 18, 2026 in the existing Next.js/Supabase project. No production deployment or Facebook posts were made.

## Included

- Redesigned homepage, shared navigation/footer, responsive city illustration and mobile navigation.
- Live GTA directory: 126 existing mosque records, with published and validating states displayed separately.
- Complete city/category routes and rebuilt detail pages using the actual database fields (`jummah_time`, `prayer_times`, `facilities`, event `title` and `starts_at`).
- Search by name/address/city, city/category/status filters, list/grid views, and browser-local bookmarks.
- Fifteen attributed first-party resource links covering Canada, the United States and global services. These are resource pointers, not copied third-party directory databases or partnerships.
- MIC Facebook links to the owner-supplied page, sharing controls, and community participation guidance. The 13K follower figure is owner-provided, not an independently measured live count.
- Contribution form saved to the existing private `submission` table. Source URL, consent and field validation; size limit; honeypot; same-origin checks; per-email and hashed-network submission limits. Suggestions always enter `pending` status.
- Public-source attribution is projected server-side from the private source registry. Raw snapshots and operational registry data are not exposed.
- Source register, privacy explanation and community guidelines.

## Source collection

`npm run collect:sources` checks the selected first-party pages, respects robots restrictions, records fetch status/content hashes, and extracts upcoming JSON-LD Event candidates with explicit timezone offsets. It does not infer dates or scrape private social data.

`npm run collect:sources -- --queue` places new candidates into the existing private submission queue, using an import key to avoid repeated imports. It never publishes events. Avoid simultaneous queue-mode runs: deduplication is currently application-side rather than a database uniqueness constraint.

First run: 15 sources checked, 10 fetched, 5 restricted/unavailable, zero qualifying upcoming event candidates, zero queued records. See `data/source-reviews.json`. This is on-demand tooling; no recurring job has been installed. The public resource links were separately reviewed through their public pages; fetch restrictions do not imply the resource itself is invalid.

## Moderation and limitations

Review suggestions in Supabase's existing `submission` table. No public moderation dashboard has been added. Email addresses are not verified; `payload.email_verified` is explicitly false. Confirm submitter identity and source evidence manually before publication or granting organization access. Claim suggestions do not grant permissions. Email verification/delivery is a remaining implementation step, and no confirmation emails are claimed or sent.

The submission rate-limit check is durable but not an atomic database operation. Add an atomic database limiter and production abuse monitoring before promoting open submissions to a large audience. Network limits depend on Vercel's trusted forwarding header; local development uses a shared test bucket.

Business/event tables are currently empty. No synthetic events, reviews, organizations or activity counts have been created. No maps, user accounts, internal social feed, AI assistant, Facebook API ingestion or scheduled refreshes are claimed as complete.

Bookmarks stay on the current browser/device. Existing mosque coordinates are not promoted as precise map pins. Resource providers are independent and their service eligibility must be checked directly.

## Configuration

Existing environment variables remain private: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and server-only `SUPABASE_SERVICE_ROLE_KEY`. The latter is needed for submissions and controlled public attribution from the source registry.

Normal commands: `npm run dev`, `npm run build`, `npm run start`. In this OneDrive checkout, legacy build directories can be locked. Set `MIC_BUILD_DIR` to a fresh ignored `.next-portal-*` directory for isolated local checks; use the same value when starting the build. Webpack was used for validation because Turbopack's CSS worker failed in the restricted environment.

## Verification

- Production build passed with webpack; TypeScript passed.
- `npm run verify:portal` checked eight pages, foreign-origin rejection, unsafe URL rejection, consent and honeypot validation, private pending insertion, and public-read denial. The exact temporary test record was removed after verification.
- Browser checks confirmed save → Saved page → mosque detail navigation.
- Final production build passed in `.next-portal-release` using webpack. Browser checks at the narrow default viewport and at 1440 × 960 confirmed the corrected responsive homepage. City-filtered keyword search, list view, saved navigation, and real source attribution were verified against the final build. Preview image: `data/portal-preview.png`.

## Next milestones

1. Email verification, atomic submission limiting, and authenticated moderator UI.
2. Organizer/partner outreach through MIC's established channels; source-specific event feeds and structured import adapters.
3. Map discovery after coordinate validation, date filters and calendar exports as real events become available.
4. Claimed organization accounts, opt-in follows/digests, and city ambassadors.
5. Grounded Ask MIC after data coverage and provenance are sufficient.

Existing user edits in `HANDOFF.md` and `research/Competitive_UX_Benchmark.md` were preserved.

## Visual redesign — October 18, 2026

The portal now uses the approved red/green/white MIC emblem, a photography-led emerald hero, staggered photo discovery tiles, an editorial media section, and stronger visual branding across Search, Resources and Community. Mobile places the hero photograph before the headline.

Four Pexels stock photographs and a silent Toronto sunset clip are stored locally. Sources, licence and creator information are available at `/credits` and in `MEDIA_CREDITS.md`. These are illustrative images, not claimed MIC events, members or directory-place photos. The AI illustration generated before the user's request for web media is not used.

Decorative motion includes a slow image movement, floating sticker, rotating graphic and typographic ticker. A visible motion control pauses animations; reduced-motion device preferences disable them. Video is click-to-play, uses native controls, and is not autoplayed. Native seeking and real playback were verified.

Validation: production build and TypeScript passed; `npm run verify:visuals` passed five route checks, five image availability checks, approved-logo availability and byte-range video delivery. Browser checks confirmed desktop and mobile layouts, animation pause, and actual clip playback without media errors. Desktop/mobile preview images are under `data/portal-visual-redesign-*.png`. No production deployment was made.

## Community voices and newsroom (18 October 2026)
- Added homepage sections immediately below the hero/ticker, plus /voices and /news and navigation links.
- Six verified official YouTube channels: Let the Quran Speak (Canada), SeekersGuidance (Canada), Yaqeen / Omar Suleiman, Yasmin Mogahed, Jannah Institute / Haifaa Younis, Yasir Qadhi (US). Institutional channels explicitly attributed; Omar titles filtered by name. No invented follower counts.
- Direct public RSS feeds: https://www.muslimnetwork.tv/feed/ and https://muslimmatters.org/category/current-affairs/feed/. Reporting versus analysis labels, original article links, UTC publication dates, source/about links. No copied article text.
- Selection checked using official creator sites/Linktrees and publisher about pages. Other tested feeds that were blocked or over a year out of date were excluded.
- Next server-side 15-minute cache; visits trigger revalidation, not a scheduler. Eight-second timeout, bounded 3MB XML, no DOCTYPE/entities, restricted publisher URLs/images, plain-text titles, strict channel/video IDs, independent per-feed failure states. Empty feed/error retains direct source links. No credentials needed.
- Thumbnails are served from YouTube; players use youtube-nocookie and load only after a click. Individual publishers/YouTube control content and embedding availability. Direct watch links remain available.
- News images are remote publisher-feed images, with original CSS/SVG illustrations when absent. Do not treat publisher images as generally licensed MIC stock assets.
- Verify with node scripts/verify-editorial.mjs (Node 24). Validates all eight live feeds and unsafe XML/channel/URL rejection. Production build and desktop/mobile layout checked, including actual YouTube playback.

## Automatic editorial carousels (18 October 2026)
- Replaced the creator and news grids on the homepage, /voices and /news with horizontal carousels that move automatically, reverse at the ends, and support native touch scrolling, arrows and pause/resume. Motion pauses on hover/focus and stops when interacting with cards or playing a video. Reduced-motion preferences disable automatic movement. Animation is suspended in hidden tabs.
- Added /api/editorial (read-only, public feed content, no-store response). Shared server feed cache is now 5 minutes, superseding the 15-minute notes above; underlying publisher fetches are uncached inside that shared cache.
- EditorialLive checks on mount, every five minutes while visible, on tab return and on network reconnection. It updates cards without a page reload. Timers and requests clean up on navigation. Visible status shows the source-check timestamp in UTC. No keys or manual content entry needed.
- Existing loaded stories survive individual feed/network failures with a reconnecting label. Current YouTube playback is retained across content updates.
- This is automatic refresh for active readers and visitors, not an always-running ingestion scheduler while no one is using the portal. Publisher feed availability and publishing frequency still determine new content.
- Verified: production build, automatic rail movement in browser, pause stability, resume/next controls, desktop and 390px layout (no document overflow), public API with six creator and two publisher feeds, shared cache, and all three rendered carousel pages.

## Nearby mosques and halal food (18 October 2026)
- Added /nearby with an image-led hero, optional device geolocation, manual Canadian city/neighbourhood/address/postal-code lookup, explicit area choice, category/keyword filters, 5/10/25/50/100km radius, straight-line distances, nearest-first ordering, paging, direct source/website links and destination directions.
- Added homepage image-led mosque/food entry cards and area form, a Near you desktop nav link, footer links and a discovery-page signpost.
- Uses the existing 126 public/validating MIC mosque records, decoding PostGIS EWKB coordinates into public listing lat/lon. No mosque source research records were bulk imported, and no Supabase rows were modified.
- Separately checked 50 HMA branch pages for basic factual outlet data. 44 branch addresses resolved from page contact fields; 39 could be matched to approximate OSM address coordinates through Photon. All 50 remain city/name browsable. Entries lacking coordinates are explicitly excluded from distance results. Certification is described as source-listed, not independently certified by MIC; no copied publisher descriptions, photos or reviews.
- data/nearby/food-places.json is the curated factual seed. public/data/nearby-food.json provides the attributed ODbL coordinate-derived extract, with per-record OSM source URLs. scripts/prepare-nearby-food.mjs and scripts/geocode-nearby-food.mjs reproduce source checks/geocoding (latter caches its limited public requests).
- /api/areas resolves manual searches via configurable MIC_PHOTON_URL (default public Photon server). No autocomplete, background GPS request, reverse-geocoding of personal coordinates, or persistence of typed area queries. User-specific area fetches use no-store. API has origin/body validation, eight-second upstream timeout, coordinate/country validation, bounded per-instance network cooldowns and explicit city-centre fallback for supported cities when upstream fails.
- Public Photon is a fair-use demo with no availability guarantee. Configure a hosted/private Photon service via MIC_PHOTON_URL for sustained high traffic. The current cooldown is per instance, not a distributed rate limit.
- Device location is requested only on button activation, stays in component memory, is not sent to MIC or geocoding services, and is removed by Clear location or page exit. Device accuracy and approximation labels are shown. The browser location provider has separate policies. Manual area queries go to Photon; privacy page explains this distinction.
- Canada-wide area lookup does not imply nationwide listing coverage. Outside covered radii, the UI shows an honest empty state and independent directory links. Generic category stock photos are labelled as illustrations of the category, not photos of each listing.
- Passed final production build, verify:nearby and verify:visuals. Browser verified homepage area journey, Mississauga and postal-code choices, food filter/radius, nearest-first results, Vancouver empty coverage, and mobile/desktop layouts without overflow. Actual device GPS permission was not requested during QA; pure coordinate/distance/decoder checks passed.

## Prominent mobile location service (18 October 2026)
- Added a sticky location bar immediately below the header across the portal, with a large Enable location button, loading state, permission/service errors and a manual-area fallback. Mobile navigation now links directly to Near you.
- Added a shared LocationProvider so a successful position persists in memory across client-side page navigation. Device coordinates are never sent to MIC endpoints, persisted in browser storage or put in URLs. Only a boolean session opt-out preference is retained in sessionStorage.
- First-time/prompt-state visitors must press the button and approve the browser prompt. Already-granted permission can obtain a position automatically on initial mount. Turning location off respects a session preference across reloads. Permission revocation clears the point. Existing permitted location refreshes when returning to a visible tab after one minute; no watchPosition/background tracking is used.
- Requests high accuracy with a 15-second timeout and at most a 60-second cached fix. Denial, timeout, unavailable/invalid coordinates and insecure contexts have clear fallback messages. Physical mobile browsers require HTTPS (localhost is a browser secure-context exception).
- Homepage now offers nearest mosque and food highlights within 25 km using the public /api/nearby listing endpoint. Personal coordinates remain client-side for ranking. Clicking Near me/Use my location switches the explorer to device position; manually chosen areas survive automatic location refreshes unless the user explicitly switches back to device location.
- Root layout provider, banner, homepage recommendations, nearby explorer and privacy copy updated. Food certainty/coverage/approximate straight-line labels remain intact.
- Passed production build, verify:nearby, and verify:location. Synthetic adapter tests cover precision options, success, denial, timeout, malformed position and nearest-first ranking; they do not request any person's actual coordinates. Browser verified location bar immediately visible at 390px, no horizontal overflow, and mobile Near you navigation. Public listing API and portal-page presence checks passed. Live device permission/GPS acceptance is left to the visitor; it was not exercised in automated browser QA.

## Stouffville nearby correction (18 October 2026)
- Removed the homepage one-mosque/one-food limit. It now shows four nearest entries in each photo-led category, counts, Show more, and a 5–100 km radius selector. Shared ranking is used by home recommendations and the explorer.
- Rechecked mosque street-address coordinates via Photon instead of relying on original imported points. Unresolved addresses are excluded from distance ranking. Added 35 York/Halton/Durham factual mosque listings from attributed research plus Darul Khair's official current prayer address at 86 Ringwood Drive, Unit 36. Darul Iman's official address is 1330 Castlemore Avenue.
- Added 12 owner-declared food locations, including Biggy’s Grill, The Zen and ShawarmaQueenz in Stouffville, Tahini’s Markham Highway 7, and seven Karahi Boys branches. Owner claims are labelled separately from HMA listings. No copied descriptions/reviews or database writes.
- Nearby data now contains 162 mosques and 62 food outlets; 134 mosque and 51 food coordinates resolve. This remains partial coverage, not an exhaustive live business search.
- Reproduction order: prepare-nearby-food.mjs, geocode-nearby-food.mjs, repair-nearby-mosques.mjs, then add-local-source-listings.mjs. The augmentation script must run last to retain official/owner additions. JSON caches limit repeated public geocoding requests. Both public data exports include OSM coordinate provenance.
- Full postal-code lookup rejects fuzzy matches with a different code. When the exact postal code is absent, it tries the matching first-three-character area and explicitly labels it a broader approximate postal area; it does not pretend to resolve the exact postal code.
- Regression checks cover both named mosques, multiple Stouffville food entries, sorting, radius expansion, unresolved-coordinate exclusion, postal-code matching and public API data. Device tests use synthetic positions; actual GPS permission is not requested during QA.
