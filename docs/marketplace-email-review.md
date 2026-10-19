# Marketplace moderator emails

Pending submissions, edits and resubmissions generate private review notices. Drafts do not. Recipients come only from server-side MIC_MARKETPLACE_MODERATORS; the application sends via RESEND_API_KEY with the verified signin@muslimsincanada.com sender. Never use NEXT_PUBLIC_ for either setting.

Review links carry HMAC capabilities in URL fragments, so they are excluded from HTTP access logs and referrers. The private notice binds a recipient, advertisement revision and 24-hour expiry. Links are read-only until an explicit same-origin confirmation POST. State and revision are checked atomically; an edit, withdrawal or moderation decision invalidates all previous links for that version. Current moderator allowlisting is checked on every use. Service-key rotation invalidates existing links.

The private submission channel mic-marketplace-review-email stores delivery attempts, never public listing fields. Existing RLS blocks direct client inserts for all mic-marketplace channels. Email delivery failure never rejects or loses an ad. Moderators can retry with Email review link from the pending-ad dashboard; attempts within 60 seconds are throttled, and successfully sent notices are not resent before their expiry. Provider acceptance does not guarantee delivery or inbox placement. Retry is manual; there is no scheduled email retry or digest yet.

Photos in moderator emails use private signed URLs lasting 24 hours; review-page photos use five-minute signed URLs. Email links grant their holder review authority: emails explicitly say not to forward.

Verification: scripts/verify-marketplace.mjs covers forged tokens, GET safety, inspect without mutation, explicit confirmation, foreign origins, expiry, replay, stale versions, requesting changes, owner isolation, photos, public projection, withdrawal and cleanup. Run test servers without RESEND_API_KEY to avoid sending fixture emails. The QA moderator address must only be enabled locally, never in production.
