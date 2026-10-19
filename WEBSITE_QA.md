# Website QA — October 18, 2026

The user journey tested is discovery → search/filter → listing/source → save/share → optional area/location → contribution review, plus creator/news media.

## Confirmed and fixed
- Missing browser favicon: MIC PNG icon, Apple icon and conventional favicon endpoint added.
- Empty video cards on Vercel: official YouTube RSS requests intermittently return 404/500. All six channels now have validated, dated last-successful snapshots; cards retain real thumbnails and video links when direct requests fail.
- Feed updates no longer replace populated fallback entries with an empty prior client state. Saved-source dates and live-feed availability are visible.
- News RSS omits featured images for one publisher. The refresh process reads public sharing metadata from that publisher's article pages, with same-publisher HTTPS image validation.
- Broken remote images switch to an MIC illustration rather than displaying a broken-image placeholder.
- Feed-unavailable status is scoped to the page being viewed, so YouTube outages do not cause an unrelated newsroom warning.
- A six-hour GitHub source refresh retains successful entries when individual publishers fail. Website readers still attempt direct updates every five minutes. Scheduling/provider availability can delay updates; stored entries are not presented as a guaranteed latest upload.

## Verification evidence
- Baseline crawl: 404 distinct linked page URLs, six local image assets, zero HTTP failures and zero missing internal anchors. Includes directory detail pages, category pages, contribution links and navigation/query variants.
- Live contribution API: valid suggestion persisted as pending; anonymous access could not read it; wrong origin, unsafe source URL, missing consent and honeypot input rejected. Temporary QA record deleted and deletion verified.
- Geographic regression: both Stouffville masjids, multiple local food outlets, postal-area fallback, distance ordering, radius expansion and unresolved-coordinate exclusion passed.
- Device adapter: synthetic success, accuracy, permission denial, timeout and malformed coordinates passed. Actual device permission and physical GPS were not requested.
- Browser at 390px: actual creator thumbnails loaded; Omar Suleiman video played in YouTube's privacy-enhanced player; carousel pause worked; search returned one named result; saving survived page navigation; unsaving restored the empty state. Voices, search, saved and news pages had no horizontal overflow in the observed states.
- Snapshot validation rejects unsafe URLs and malformed source-check dates. Browser favicon, Apple icon and six populated creator thumbnail endpoints passed local integration checks.

## Practical limits
This is a bounded audit of observed flows, not a guarantee of zero bugs. Listing coverage is partial. External sites and media can change or fail; fallback/source labels preserve usability. GPS positioning depends on device/browser permissions. No real user's private data was submitted during testing.
