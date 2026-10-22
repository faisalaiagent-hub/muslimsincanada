# MIC daily homepage pair

The homepage lead presents two different highlights, replacing the static welcome/photo hero. A compact search strip remains directly below it. News/talks use source thumbnails when available, and MIC guides/events use clearly labelled illustrative photos. Missing images use a branded illustration.

## Daily publishing

The existing GitHub editorial workflow refreshes feeds, then runs `node scripts/refresh-daily-highlights.mjs`. Extra overnight triggers cover midnight in both Toronto daylight and standard time; GitHub scheduling can be delayed. The six-hour refresh also retries if the overnight job fails. Generation is idempotent: once a valid pair exists for the Toronto calendar date, subsequent runs keep it unchanged. This workflow runs on GitHub, independently of the owner’s computer and the separate local marketing automation.

Sources: configured Muslim and mainstream RSS publishers, official YouTube channel snapshots, eligible public MIC events and original MIC guides. News must be published within three days, talks within fourteen days, and source snapshots checked within forty-eight hours. Future-dated items are excluded. Talks about reflection and everyday life receive preference, so the second slot offers variety alongside news. The weekday plan rotates news/talk, news/guide and talk/guide. Source preference also rotates. Eligible date-reviewed greetings or upcoming events can take one slot.

The generator does not repeat a URL from the previous seven editions and requires two distinct content types. If there are insufficient valid choices, it fails visibly in the workflow and retains the last successful, dated edition rather than inventing an item. The homepage identifies a delayed refresh. Expired event/greeting editions are not selected for the homepage.

## Events and greetings

The public `/api/highlights/events` route returns only already-public, published events with an organizer link. Only events after the edition’s calendar day and within thirty days are eligible. Stock event imagery is labelled as illustrative. Confirm event information with the organizer.

For a reviewed seasonal greeting or manually selected event, add a record to `data/daily-highlight-overrides.json` under `items` with: `kind` (`greeting` or `event`), `title`, `summary`, an existing internal MIC `url`, optional approved local `/media/` image, Gregorian `startsOn` and `endsOn` (`YYYY-MM-DD`), `expiresAt` (ISO timestamp after the final calendar day), `reviewedBy` and `reviewNote`. Include the date-confirmation source in the note. Islamic observance dates must be confirmed for the intended community; do not extrapolate moon-sighting dates or fabricate holidays. No greeting is seeded by default.

Changes are reviewed in Git and take effect before the next edition is locked. Replacing a published pair is a separate editorial correction, not an ordinary refresh. Review source titles and claims as quotations/attribution; the generator does not fact-check original reporting or reproduce full articles.

## Sharing

Each item has a dated MIC landing page, native Share/link-copy action, Copy post button, selectable prepared caption and a generated 1200 × 630 MIC sharing image. The original story/video remains one click away. Captions also save under `assets/social/daily-highlights/YYYY-MM-DD.md`. These are drafts; this workflow does not publish to Facebook, send email or submit group posts.

Edition history retains up to 120 days. Old pages are clearly dated. If longer-term retention becomes important, move the archive to durable content storage before the retention window is reached.

The server validates remote snapshots against known publisher hosts, YouTube URL patterns, supported internal paths, image hosts and dates. A bundled snapshot remains available if GitHub cannot be reached. Tests cover Toronto date boundaries, source/URL restrictions, repeats, distinct slots, event priority and sharing captions. A publishing workflow or full browser check must also confirm generated sharing images and mobile layout.
