# China Companion 2027 v1.7.1 — Travel Guide, Taglish vlog and Wallet FX

Owner-requested feature upgrade of existing application; no new backend, Cloud project, credentials, paid services or source Sheet write.

## Features

- **Overview:** richer four-city place descriptions, Chinese names, facts, what to expect, practical photo/shooting cues. Online Wikimedia Commons reference photos and file-level image attribution links; no personal photo upload. Photo service/network can be unavailable, so the saved offline text guide remains visible.
- **Go:** replaces six unsupported empty estimated-route cards with compact mode selector (Walk, Metro, Bus, Cycle, DiDi/Car, HSR), hotel/previous/manual/one-shot-GPS origin and existing reliable native AMap handoff. Manual reference can still be saved. In-app ETA, street routing, DiDi quotes, ticket prices and origin-specific journey duration are **not connected**. Does not fabricate a walkability ranking or route metrics; AMap website fallback is separately labeled and may stall.
- **Do & Eat:** selected place observations, 8 curated dish choices per city (32 total), Chinese name/description/food ingredient cautions, meat-first/solo-friendly preference, an explicit reusable Chinese request (copy/speak), Talk handoff, and existing saved restaurant entries separately labeled. Suggestions are dishes, not independently verified nearby restaurants, live menus or restaurant availability.
- **Nearby / Discover More:** curated ideas for Shanghai, Chongqing, Chengdu and Beijing; already-saved city choices separated. New ideas save to local savedNearby; no automatic itinerary, purchase or Sheet changes. There is **no true distance-based Nearby** or verified opening-hours/schedule fit.
- **Vlog:** Taglish contextual facts, short intro, extended narration prompt, closing, camera shots, sources; user-entered on-site experience and recommendations saved in local smartState.experiences and included in backup/sync merges, not posted externally; one special pure Chinese IG Story with private English gloss.
- **UX:** stable compact iPhone header; Travel Mode quick map/tickets/Talk/wallet shortcuts; Offline Travel Pack status and booking/time review checklist.
- **Wallet:** distinct GCash Alipay+, Alipay BDO Visa Signature physical/virtual, BDO Visa direct, WeChat Visa, UnionPay Diamond direct or conditional wallet, DiDi via selected wallet, and RMB cash. Live-keyless Frankfurter blended central-bank reference CNY/PHP queried on launch and reconnect, manually overridable, saved local last reference offline, historical daily lookup per expense date when online. PHP-only billing; method-specific published card fee assumptions: Visa 1.70%, UnionPay 1.65%, wallet 3% on full CNY amount when > ¥200 unless provider waiver; GCash separate service fee 0%. All are **estimates only**. GCash's actual FX quote, card-network rate, provider fees, applicable promotions/waivers and the final PHP posting are not available from this public rate API. Enter final PHP charge to override estimate with no double count. Same-reference comparison is not a ranking of actual provider quotes.

## Data and security

- No private personal records, receipt media, spreadsheet URLs, tokens, credential values or account identifiers are committed.
- Existing Google Sheet **read-only** flow and locally queued Packing Sync write restrictions are not altered; no new selected-file consent or write permission granted.
- No production user backups, localStorage, receipt IndexedDB, booked reservations or tracked expenses are cleared. Keep the original QA installation, verified recovery backup, and unsent accidental proposals intact.
- Reuse existing scope-qualified service worker with versioned assets for offline app shell; external photographs/FX/AMap/translations need internet. Production root must be validated after merge/deploy.

## Verification

- Node tests for 11 payment profiles, wallet CNY threshold, cached FX and provider response rejection, 4-city content, Chinese-only Story, offline journal merge.
- Existing exact-commit regression CI, simulated mobile Chromium/WebKit light/dark, PWA scope caching, rollback/forward state preservation and account smoke **must pass before merge**.
- Physical iPhone microphone/audio, online Commons availability in China, external FX availability in China and verified payment/receipt settlement are **not covered** by simulated tests. Do not claim them passed.

## Next nonblocking enhancements

- Actual AMap JS/SDK routing in-app needs verified legal/licensing/quotas and suitable account setup; preserve native handoff as fallback.
- A vetted photo asset pack stored locally for offline use would require permission/license and storage-budget decisions. External photo previews are online only.
- Additional place-specific sourced deep-dive history/long-form narration can expand the curated guide independently without modifying booking data.
- Actual geolocated nearby-ranked restaurant catalog needs reliable licensed POI dataset and availability verification.
