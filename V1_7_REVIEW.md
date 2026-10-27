# v1.7 Modern Imperial China — Smart Travel review

**Design approved; production approval is conditional on all critical release gates. Existing PR #1 remains draft/unmerged. See [release QA and owner handoff](docs/RELEASE_QA.md).** Production stays at the existing URL on v1.6.1. This extends the existing branch; it does not rebuild the app.

## Open the interactive review

Download [imperial-china-review.html](docs/previews/imperial-china-review.html), then open the downloaded file in Chrome or Safari on your Mac. It is self-contained and needs no install, account or backend. Both phone frames scroll independently. All seven core screens and the new screens are clickable in matching Light/Dark modes. Old shared preview filenames are compatibility copies of the current review.

**The review contains fictional records, sample prices/routes and simulated conditions. It is not Shaun’s private/live itinerary.** It has isolated memory storage, blocked external network requests, disabled Google authorization, disabled GPS/microphone and external-link interception. Refreshing/reloading the review resets its temporary progress; the actual app saves progress privately on the device and in backups.

Try:

1. **Activity Details** → Yu Garden → Overview / Go / Do & Eat / Nearby / Vlog Kit.
2. Change a ticket to **Paid**, add a sample reference and save. No expense is created or visit checked off.
3. **Go** shows clearly simulated walking/metro references and an unquoted DiDi fare. Change the origin to see unknown routes rather than invented estimates.
4. Tick a Vlog Kit shot; open **Vlog Hub**, choose a date and switch YouTube / IG Stories.
5. **January 16 demo** → Scenic snow / No snow / Unverified. Compare Plan A/B/C. Apply Plan B, inspect the confirmation, cancel or confirm. Plan then shows the accepted city schedule. January 17 remains separate.
6. Open **Menu**, Saved Options, Offline Resources, the countdown and Chinese Address Card. Try both themes.

## Complete Light/Dark screenshots

| Core screen | iPhone viewport | Full content |
| --- | --- | --- |
| Home / Smart Today | [Home](docs/previews/review-home-light-dark.png) | [Full Home](docs/previews/full-home-light-dark.png) |
| Plan | [Plan](docs/previews/review-itinerary-light-dark.png) | [Full Plan](docs/previews/full-itinerary-light-dark.png) |
| Map | [Map](docs/previews/review-map-light-dark.png) | [Full Map](docs/previews/full-map-light-dark.png) |
| Talk | [Talk](docs/previews/review-translate-light-dark.png) | [Full Talk](docs/previews/full-translate-light-dark.png) |
| Wallet | [Wallet](docs/previews/review-wallet-light-dark.png) | [Full Wallet](docs/previews/full-wallet-light-dark.png) |
| Tickets / Hotels | [Tickets](docs/previews/review-bookings-light-dark.png) | [Full Tickets](docs/previews/full-bookings-light-dark.png) |
| Settings | [Settings](docs/previews/review-settings-light-dark.png) | [Full Settings](docs/previews/full-settings-light-dark.png) |

| New experience | Light/Dark review |
| --- | --- |
| Menu drawer | [Menu](docs/previews/review-menu-light-dark.png) |
| Activity overview / tickets | [Overview](docs/previews/review-activity-overview-light-dark.png) · [Full](docs/previews/full-activity-overview-light-dark.png) |
| Transport alternatives | [Go](docs/previews/review-activity-go-light-dark.png) · [Full](docs/previews/full-activity-go-light-dark.png) |
| Things to do / food | [Do & Eat](docs/previews/review-activity-do-light-dark.png) · [Full](docs/previews/full-activity-do-light-dark.png) |
| Nearby saved choices | [Nearby](docs/previews/review-activity-nearby-light-dark.png) · [Full](docs/previews/full-activity-nearby-light-dark.png) |
| Per-place scripts and shot lists | [Vlog Kit](docs/previews/review-activity-vlog-light-dark.png) · [Full](docs/previews/full-activity-vlog-light-dark.png) |
| Saved Options | [Options](docs/previews/review-options-light-dark.png) · [Full](docs/previews/full-options-light-dark.png) |
| Smart Plans | [Compare](docs/previews/review-smart-light-dark.png) · [Full](docs/previews/full-smart-light-dark.png) |
| Daily Vlog Hub | [Vlog Hub](docs/previews/review-vlog-light-dark.png) · [Full](docs/previews/full-vlog-light-dark.png) |
| Offline Resources | [Offline](docs/previews/review-resources-light-dark.png) · [Full](docs/previews/full-resources-light-dark.png) |
| Simulated snow / Plan A | [Snow](docs/previews/review-snow-plan-a-light-dark.png) |
| Plan confirmation | [Confirm](docs/previews/review-plan-confirm-light-dark.png) |
| Accepted local city schedule | [Applied Plan B](docs/previews/review-applied-city-plan-light-dark.png) |

Also: [Chinese address](docs/previews/review-chinese-address-light-dark.png), [countdown](docs/previews/review-countdown-light-dark.png), [offline quick access](docs/previews/review-offline-light-dark.png), and [v1.6.1 before/after](docs/previews/review.html).

## What changed

The Imperial Red, Antique Gold, Deep Red, Porcelain Ivory, Lacquer Black and restrained Jade palette remains. The selected Moon Gate, Chinese architecture, lanterns, lattice details and editorial headings continue across new screens.

- Five bottom tabs remain. A grouped Menu drawer adds secondary features, with a persistent sidebar on wide iPad/Mac windows.
- Tapping a place opens five activity sections, six separate ticket states, prices versus actual payments, source/verification labels, notes and checklists.
- Read-only sync additionally maps Decision Options, Social Media, Wulong Day Trip and the four city tabs using the inspected real headers. Missing/malformed optional tabs preserve their previous copies.
- Saved Options separates original quotes, budget selections, local source-checked updates, proposed discoveries and actual bookings.
- Walking/bicycle/metro/bus/HSR/DiDi comparisons accept dated references; a practical scenic walking route below 2 km can be recommended. Unavailable distances, times and fares remain unknown. Saved map addresses can open the same transport chooser.
- January 16 A/B/C uses source-linked snow/access evidence and explicit uncertainty. City fallback prefers saved unscheduled choices, labels new proposals separately, preserves evenings, avoids already scheduled days and protects reservations. Apply requires confirmation and saves locally only.
- Vlog Kit includes Quick Shoot / Full Vlog, English scripts, platform/framing/length labels, ambient sound and offline shot completion. Vlog Hub groups daily YouTube chapters and 2–5 raw IG Stories and retains imported Social Media ideas.
- Today adds Planning/Travel Mode, ticket context, daily local budget, remaining essential shots and conditional-plan notices. Travel Mode reduces the decorative hero in favor of next steps.
- Offline Resources and complete private backups include new local progress and imported datasets. Source refreshes retain overrides; restore keeps existing device choices.

## Preserved

OAuth settings/scopes, read-only Sheets, private Drive receipt destination/selection/upload/retry, queued receipt bytes and reserved IDs, expense history/math/reconciliation, bookings, maps/GPS, translations, speech speed, backups, themes and completion records remain. `receipts.js`, `receipt-store.js` and `jade-ui.js` are unchanged in this upgrade. No public private-data export, new Google project, folder, paid API, subscription, billing or server was introduced. PWA assets/cache advance together to preview.4; private Google responses remain excluded.

## Actual integration versus simulation

| Area | Verified / implemented | Limit |
| --- | --- | --- |
| Google data | Existing private workbook metadata, real headers and bounded rows inspected through connected read-only tools; extended mapper tested synthetically | New extended batch still needs app-origin account verification; earlier real Sheets/PNG receipt tests remain documented separately |
| Prices | Historical tracker references, timestamps/stale state, official links, local source-checked prices, throttled refresh limitation | No free live venue-pricing feed; demo ¥30 is explicitly synthetic |
| Routes | Supported AMap URI/search handoff; known coordinate systems respected; local route-reference comparison | No live in-app ETA, fare, routing or DiDi quotation. Sample numbers are demo only |
| Snow / access | Working A/B/C rules, dated observations, compare/cancel/confirm and local schedule overlay | No live mountain snow/closure feed and no January forecast months ahead |
| Other disruptions | Source-aware scenario advice | Complete automatic replacement schedules for every other day are not implemented |
| Place content | Researched scripts for Yu Garden, Mutianyu and Panda Base; imported tracker notes for other places | Other histories, prices, restaurant hours and exact nearby route fits need research; unknowns stay explicit |
| Offline | Real app-shell reload and saved data/checklists on the test browser | Not offline street tiles, live routing, arbitrary translation or Google uploads |

See [implementation and schema details](docs/SMART_TRAVEL.md) for evidence rules and exact limits.

## Validation and release gate

124 automated tests pass, including the original regression coverage updated for the intended Menu and cache-version changes. Tests cover optional tab mapping/GET-only sync, six ticket states, evidence/payment separation, quote comparisons, route freshness and the strict 2km rule, snow uncertainty/no-snow/closure, protected bookings, adjacent-day avoidance, explicit plan confirmation, offline checklist persistence, backup merge and existing receipt behavior.

Chromium checks cover 12 pages × 2 themes × 7 widths (320–1366 px), plus all five Activity Details sections at each width, unchanged existing local records, 44px visible navigation targets, reduced motion, theme persistence, contrast samples and actual network-disabled PWA reload. Complete review checks cover all core/new screens, both themes, sample contrasts, local interactions and independent isolated frames.

WebKit runs in PR CI on Ubuntu 24.04. This workspace could download WebKit but could not install its native system libraries; do not call local Chromium testing a physical Safari test. Current-commit CI status is reported in the PR.

Packing writes now require separate opt-in file authorization/Picker selection with the existing drive.file scope; no automatic consent is assumed. On the owner’s iPhone, verify the extended read-only import, actual Safari/PWA safe areas/keyboard/VoiceOver/clipboard, AMap/GPS handoffs, real English/Mandarin audio, airplane-mode cold launch/storage eviction, backup restore, real HEIC/PDF/photo uploads and Google session expiry. Also check iPad/Mac Safari and mainland-China service reachability.

**Recommendation: keep the PR in draft for design and real-device review. No merge or deployment has been performed.**

## Packing and synchronization continuation

The existing branch now includes permanent three-bag inventory plus Unassigned, independent hotel arrivals/checkouts/transfers and room sweeps, Manila baggage claim and manual Back Home verification. The existing dedicated tab is read-only imported; opt-in file-scoped writes use stable IDs, a durable pending queue, canonical upserts, shared recovery revisions, preflight/readback and explicit conflict resolution. Other tabs remain read-only; receipt code/schema stay unchanged. Public runtime/previews no longer embed the workbook ID; enter the existing private tracker URL/ID once in Settings, keeping existing OAuth/Picker configuration. This does not rewrite historical commits.

See [implementation and owner tests](docs/PACKING_SYNC.md) and [release gates](docs/RELEASE_QA.md). Automated simulations are separate from actual-account Google consent, cross-device sync, real HEIC/PDF uploads and physical Safari/PWA checks. Production stays v1.6.1 until those gates pass.

### Packing review screens

| Screen | Complete Light/Dark content |
| --- | --- |
| My Bags | [Permanent inventories](docs/previews/full-packing-bags-light-dark.png) |
| Home departure | [Initial per-bag pack](docs/previews/full-packing-home-light-dark.png) |
| Hotel arrival | [Positions and independent checks](docs/previews/full-packing-arrival-light-dark.png) |
| Hotel checkout | [Separate bags and room sweep](docs/previews/full-packing-storybook-light-dark.png) |
| Next hotel | [Fresh verification](docs/previews/full-packing-next-light-dark.png) |
| Beijing checkout | [Final hotel](docs/previews/full-packing-beijing-light-dark.png) |
| Manila | [Baggage collection](docs/previews/full-packing-airport-light-dark.png) |
| Back Home | [Reconciliation and media backup](docs/previews/full-packing-return-light-dark.png) |
