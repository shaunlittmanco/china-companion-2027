# v1.7 continuation report — 28 October 2026

## 28 October 2026 hosted acceptance — preview.7 fixes (release HOLD)

The owner-approved frozen preview.6 stage is published under acceptance/6d95030/; all production runtime hashes remain v1.6.1. Normal owner-controlled Chrome sign-in, real read-only import, selected-file consent, approved two-item app/Sheet readback, stable-ID edit/move and explicit app-versus-Sheet conflict passed. Real hosted-stage network-offline reload retained an approved QA draft; reconnect readback confirmed it once, with zero pending/conflicts. This is desktop DevTools network blocking, not physical airplane-mode cold launch or genuine OAuth expiry.

Two defects were reproduced during live testing:

- After a successful sync, an offline edit showed “Synced” while one durable record was pending. The summary and message now reflect the queue. A browser-adapter regression exercises legitimate simulated consent/readback, then an offline edit; it fails on the prior implementation and passes after the fix.
- Root and staged workers used one origin-wide cache cleanup prefix. A root worker update left the staged candidate with only three required cached files. In the isolated QA profile only, the obsolete root tab/worker was removed and the staged worker reinstalled; all 18 staged CORE entries were verified before the successful offline reload. New workers now use scope-specific cache keys and read only their own cache, preserving legacy and sibling caches. A failing-before unit regression and a same-origin browser lifecycle/rollback regression cover this.

Candidate runtime/assets/cache advance together to 1.7.0-preview.7. All 130 Node tests and syntax checks pass locally. Full current-head CI is required. The published frozen preview.6 stage is intentionally unchanged; publishing a revised staging path requires separate approval. No Google Cloud configuration change, new credentials, additional live identity, genuine record change or cleanup deletion occurred.

Outstanding: live preview.7 revalidation, real second device, genuine authorization expiry, safely isolated CHECK/SWEEP/Manila/Home, physical iPhone/PWA/HEIC/GPS/audio. Ordinary packing sessions include genuine inventory, so those live checkpoint tests were not started under the two-item approval. Keep PR Draft; do not merge or release.

## 28 October 2026 resume — preview.6 (release HOLD)

Runtime fix: receipt-session cancellation guard on the current branch. Version **1.7.0-preview.6**; asset URLs and worker cache advance together. The PR remains Draft/unmerged and public production remains v1.6.1. No release gate is waived.

### Confirmed defect and fix

A synthetic receipt readback paused during JSON decoding reproduced acceptance after Disconnect: the upload resolved as verified despite cancellation. The Drive client now rechecks its session after decoding, rejecting stale metadata and retaining local receipt bytes and the reserved ID for retry. One regression failed on the original code and passes after the fix. No uploader schema, credentials or production data changed. Fictional review bundles and the source rollback patch were refreshed.

### New evidence from this Mac Work run

- Syntax and **128/128 Node regression tests pass** on preview.6. An intermediate run caught three expected PWA assertions pinned to preview.5; those were updated with the new cache version and the complete suite rerun successfully.
- Actual preview.6 runtime assets were confirmed in the built-in browser. **168 DOM layout checks pass**: 12 screens × 2 themes × 7 widths (320, 375, 390, 430, 820, 1024, 1366), checking horizontal overflow, active page and theme. This is not a physical Safari/VoiceOver test or the complete CI browser interaction suite.
- Existing production Google configuration and folder selection persist. Production read-only refresh and owner-approved synthetic JPG/PNG/PDF uploads passed in the prior part of this same Work workflow. Drive metadata independently confirms the three identities, expected filenames/types and private sharing. These are v1.6.1 live results, not candidate-origin OAuth evidence.
- The backup download timeout was a browser event-detection failure: the file existed in Downloads and the app completed serialization. A private local copy validates, excludes Google auth configuration and retains the original snapshot, checklists and three verified QA receipt references. It restores into a separate local-origin candidate; a second restore adds zero entries. Exporting again preserves the snapshot, checklists, expenses and receipts exactly (creation timestamp excluded). No backup defect was reproduced.
- Connected read-only metadata/header checks confirm all supported tabs; seven packing starter ITEM IDs/Record IDs remain unique. Hotels inspection was explicitly owner-approved after automated review blocked the original broad read. No Sheet write occurred. These connector checks do not prove candidate-origin refresh.
- Owner approved cleanup only of the three synthetic QA expenses/files. All three matching Drive files were moved to recoverable Trash, and no matching file remains in the existing folder. One local entry was removed after owner handled the native confirmation; two local QA entries were still present at the last read. Do not call cleanup complete. A verified pre-cleanup backup is retained privately. No genuine record was deleted.
- Standalone Chromium remains blocked by the execution sandbox's Mach-service permissions. A separate WebKit launch also aborts. The exact-origin account helper therefore cannot run here. The regenerated rollback patch applies and its isolated baseline syntax/regression checks complete before the browser-stage failure. New full browser migration/rollback/forward evidence must come from exact-head CI; historical CI is not substituted for this candidate.

### Remaining mandatory gates and continuation

1. Confirm/remove only the two remaining approved local QA entries through the native browser confirmations; retain the verified backup. Drive Trash can restore the matching QA files if needed.
2. Run the unmodified exact-origin `scripts/account-qa.cjs` outside the execution sandbox, using the existing configuration and workbook. Local-origin backup/layout QA is not an OAuth acceptance environment.
3. Verify actual candidate read-only refresh of all supported tabs and the seven packing starters. Before `--packing-write`, obtain approval of one exact temporary packing-record plan, then separately complete file consent/Picker selection. No temporary Sheet writes have been authorized or made in this run.
4. Verify live app/Sheet stable-ID upserts/readback, independent CHECK/SWEEP/home, offline/expiry/retry and real two-device conflicts with unchanged unrelated tabs.
5. Complete physical iPhone/iPad/Mac checks in RELEASE_QA: candidate identity, Light/Dark/safe areas/keyboard/VoiceOver, actual HEIC, GPS/AMap, microphone/audio, offline cold launch, backup/restore and second-device convergence. Live snow/DiDi/routing are not claimed.
6. Check the final PR head's new CI and all critical account/device gates before merge/deploy. Production stays unchanged while any gate is open.

Private backups, records, IDs, receipt links, tokens and screenshots containing private trip data are intentionally excluded from GitHub. Current-head CI status is recorded in the PR after push.

# v1.7 continuation report — 27 October 2026

**Release decision: HOLD. v1.7 has not been merged or deployed.** The owner's approved design and conditional release authorization remain in effect, with the new packing/sync requirements as additional gates. No real-account or physical-device check has been marked passed.

## Resume audit — 27 October 2026, preview.5

Recovered the actual GitHub head `8d3dfc4bb0c95e8c168ad988c52407fd1e30f6e5`, its draft PR conversation and CI run `40464942295` (both jobs successful, logs reviewed). Existing implementation and private sources were retained. This resume does not redo prior development.

### Defects fixed in this resume

- Disconnect during response-body decoding could still import packing data and publish Synced. Reproduced with a blocked JSON response; the packing client now checks session generation again after decoding. Cancelled responses cannot save or report success.
- Duplicate CHECK rows for the same checkpoint/item and duplicate SWEEP rows for the same checkpoint/task passed parsing when their Record IDs differed, risking duplicate counts or silent replacement. Parsing now rejects these before imports/writes, preserving the previous snapshot and pending drafts. Different checkpoints remain independent; recovery proposals are separate.
- Editing a manually created CHECK/SWEEP could generate a second app-shaped Record ID. Encoding now reuses the existing checkpoint/item or checkpoint/task Record ID. A full synthetic add/edit/upsert/readback case confirms one record under each original ID.
- Candidate version, asset URLs and service-worker cache advanced together to **1.7.0-preview.5**, so an earlier candidate cache cannot retain the old packing client. Public interactive bundles were regenerated with synthetic data only. Visual layout is unchanged; existing screenshot gallery is retained.

The fix commit is `c50964e3ae9aa7a635dc9bfc7e5e17f579cd2fa1`. A follow-up checkpoint refreshes the rollback patch against that exact committed source and records verification.

Three new regression tests cover these failures. Current local result: **127/127**, syntax checks pass. Chromium rechecks cover 168 layout combinations, actual offline reload, full Light/Dark journey/demo interactions, expense and backup regressions. The committed candidate is then checked by the exact-origin smoke and isolated baseline upgrade/offline/rollback/forward procedure; consult the latest PR CI for final-commit Chromium/WebKit results. The exact committed preview.5 also passed `scripts/account-qa.cjs --smoke` and `scripts/release-check.cjs` locally, including the regenerated rollback patch. None is a live Google or physical-device pass.

A fresh connected-account read-only metadata/range check confirms the existing Packing & Bags tab remains present/visible at its existing gid, with its original A3:N3 schema. The first populated records retain seven unique starter IDs; the current parser imports them as seven unique items with zero pending writes. No Sheet data was saved, edited, hidden or deleted. This connected-source check does not prove app-origin Google authorization or live bidirectional writes.

### Feature audit

| Feature | Implementation / automated evidence | Unverified acceptance |
| --- | --- | --- |
| Imperial Light/Dark; Today, Plan, Map, Talk, Wallet; expandable Menu | Existing UI retained; responsive, theme, navigation and storage checks | Physical iPhone/iPad/Mac keyboard, safe areas, VoiceOver |
| Activity/tickets/prices/status; Saved Options | Existing detail/evidence logic and no duplicate spending tests | Owner-source/account refresh; current venue data |
| AMap and transport comparisons | Existing handoffs and sourced-reference comparisons retained | Physical native-app/GPS; no integrated live routing/DiDi fares |
| January 16 Fairy Mountain/Wulong A/B/C | Existing evidence uncertainty, protected bookings, compare/cancel/apply tests | Actual conditions near travel; no live snow feed |
| YouTube Vlog Kit / IG Stories | Existing shot/script planning and offline progress tests | Physical device use |
| Read-only Sheets | Existing optional/core import mapper and GET-only regression tests | Actual candidate-origin owner OAuth/refresh |
| Expenses / Drive receipts | Existing uploader, outbox, expense math and backup tests retained | Real photo/HEIC/PDF, folder, expiry/retry/readback |
| Offline / backup / migration / rollback | Synthetic browser offline and data/receipt preservation procedure | Candidate physical PWA cold launch/storage recovery |
| My Bags / hotel check-in/out / room sweeps / Manila / Back Home | Existing permanent inventory and independent immutable history retained; three fixes above | Physical journey; live CHECK/SWEEP/back-home writes |
| Automatic packing synchronization | Separate opt-in file grant, durable queue, preflight/recovery/readback/conflict tests | Actual authorized Sheet ↔ app and second-device convergence |

### Current release decision and next action

**HOLD.** No live account write, temporary QA Sheet record, receipt upload, new permission, merge or production deployment was performed in this resume. `main` remains `89ab875d8d4f51286b1fd024cb2293c02f40c536`; eight live production runtime files were re-fetched and matched that baseline. The existing production URL remains v1.6.1. Production authorization is still conditional on the owner's unchanged gates.

Start the owner procedure in RELEASE_QA on this committed branch. First export a private production backup. On the Mac, use the isolated account helper for read-only Google refresh; only use `--packing-write` after explicitly authorizing uniquely tagged temporary QA records. The app explains that `drive.file` can edit the selected workbook, while application writes are restricted to Packing & Bags. Sign in and select the existing workbook yourself. Verify app→Sheet→readback, manual Sheet→app, stable IDs, independent CHECK/SWEEP/home records, offline/expiry/retries, conflicts and a second device. Do not clean up real records or publish private evidence.

Physical iPhone Safari/Home Screen checks and real photo/HEIC/PDF receipts still require owner participation. Mac helper service workers are blocked; it cannot pass physical PWA acceptance. The documented Safari override procedure remains conditional on proving the actual candidate worker/cache; if that cannot be proven, stop and retain the device gate. Do not test public v1.6.1 and label it preview.5.

Review: `docs/previews/imperial-china-review.html` is the actual self-contained interactive synthetic review. Download/open it in Safari/Chrome; Google access is disabled. It is not live sync or the private itinerary.

The exact durable commit is the latest branch/PR head; the PR update records it after committing. Keep PR #1 open/draft until all owner gates pass, then recheck that exact candidate's CI and authorization before merge/deploy.

## Existing work retained

The prior branch already contained Modern Imperial China Light/Dark, five primary tabs and Menu/sidebar, Smart Today, activity/ticket details, address cards/AMap handoff, saved options, January 16 A/B/C, vlog/Stories tools, offline references/backup, payment/expense tracking and the existing Drive receipt workflow. The previous 88-test CI and QA-tooling head were successful. This continuation extends that implementation rather than rebuilding it.

## Work completed in this continuation

The earlier packing work was partially written and unverified. It is now integrated into the existing app and covered by model, integration and browser tests:

- My Bags: three permanent luggage groups plus Unassigned, quantities, notes, optional unit weights, categories, search, archive/restore, stable-ID movement, source labels and explicit critical-item review. Allowances remain unknown unless supplied and do not constitute airline approval.
- Packing Journey: Hotels-derived arrivals/checkouts/transfers, source-change handling, room positions, fresh per-bag checkmarks, full room sweep, honest unresolved warnings/overrides, saved checkout reminders while foregrounded, added purchases and immutable completed history/corrections.
- Manila baggage collection and manually initiated Back Home: fresh per-bag verification, gifts/consumed/missing reconciliation, unpacking/gear/documents/receipts tasks and footage dump/verified-backup gate. No media deletion, formatting or upload.
- Existing dedicated tab import with preserved starter IDs/source references, safe legacy-to-seeded-ID migration, and no duplicate inventory migration. Packing & Requirements remains separate; other source tabs are not made writable.
- Opt-in `drive.file`/Google Picker authorization for the existing workbook, durable offline outbox, foreground refresh/retry, stable canonical upserts, shared private recovery revisions and explicit conflicts. New rows use INSERT_ROWS appends; blank gaps stop writes safely. Tokens are memory-only; application writes are tab/range allowlisted.
- Stale in-flight responses cannot replace confirmed edits; missing confirmed rows become conflicts; ambiguous write retries inspect stable IDs before retrying; independent concurrent additions and competing updates are tested synthetically.
- Private workbook configuration moved to a device-only Settings field. Existing OAuth/Picker configuration is retained. Historical git commits are not rewritten.
- Updated synthetic interactive Light/Dark demo, complete screenshots, owner-account launcher, release checklist and a reproducible rollback patch. Receipt uploader/outbox code and expense behavior are retained.

## Source commits created

These are GitHub commit IDs (the preview/report commit is the PR head linked from the PR conversation):

| Commit | Change |
| --- | --- |
| `eee33922e7ab45e4d36f894b2d1a65f165be9df2` | Packing inventory/journey and opt-in file-scoped sync |
| `46aa442961fe3a9550b0663e707c51c712724ce5` | Seeded-ID migration and staged/completed history preservation |
| `49ba6835f3c136ea9eff54d7ef824a103f403575` | Safe recovery-row insertion without overwriting later manual rows |
| `55635a487c8869da18cdfed79f3a213d45a2c23f` | Stale-response, missing-record and concurrent new-record protection |

Same branch: `design/jade-night-v1.7`. Same [PR #1](https://github.com/shaunlittmanco/china-companion-2027/pull/1), retained as draft. No main history reset, new repository, workbook, tab, project, backend or production deployment.

## Changed files

| Area | Files |
| --- | --- |
| Packing | `packing.js`, `packing-ui.js`, `packing-sync.js` |
| Existing integration | `app.js`, `sheet-sync.js`, `smart-travel.js`, `companion-ui.js`, `travel-data.js`, `index.html`, `styles.css`, `sw.js`, package metadata |
| Tests | `tests/packing.test.cjs`, existing app/mapper/PWA/UI regression tests |
| QA/preview tooling | review/fixture/mobile scripts, `scripts/account-qa.cjs`, `scripts/release-check.cjs`, `scripts/prepare-rollback.cjs` |
| Review artifacts | `docs/previews/imperial-china-review.html`, compatibility review copies, complete Light/Dark screenshots and result JSON |
| Release documentation | `docs/PACKING_SYNC.md`, `docs/RELEASE_QA.md`, this report, existing status/review documents, rollback patch |

The PR Files Changed view is the exact complete file list. The [interactive review source](previews/imperial-china-review.html) is self-contained; download/open it to interact. A Work preview is served at http://terminal.local:4173/ while the workspace is active. That is not a production deployment or real Google test environment.

## Test evidence and its limits

- `npm run check`: passed.
- `npm test`: **124/124 passed**, including the prior regression suite and new packing/queue/auth/conflict/migration/UI cases.
- Chromium: 12 screens × 2 themes × 7 widths = **168 layout combinations**, plus five activity sections at each width, navigation target/contrast/reduced-motion/storage checks and real offline app-shell reload.
- Review checks: complete core/new screens and fictional Home → Shanghai arrival → Toy Story-area checkout/sweep → next hotel → Beijing → MNL → Back Home, both themes, distinct bag groups and independent progress. Public data is fictional and external requests/auth are blocked.
- Release-check: actual isolated Chromium baseline → candidate → offline → rollback → offline → forward recovery; trip/expenses/OAuth settings, receipt bytes/reserved Drive ID, notes/vlog, bag inventory, independent checks and pending packing outbox preserved. Prepared rollback patch also runs the restored baseline syntax/tests.
- Exact-origin account-QA smoke: candidate Menu/Settings load in a fresh isolated context with all network requests blocked. **No Google login/write, installed PWA or physical device is certified by smoke.**
- WebKit is run by PR CI on Ubuntu 24.04. Local WebKit native libraries are unavailable. Consult the latest-head workflow linked in the PR for final CI results; desktop WebKit is not physical iPhone Safari.
- Connected read-only source inspection verified the dedicated tab's schema and **7 unique starter IDs → 7 items, no queued writes**. No live write or temporary test record was created by Work. This does not prove app-origin OAuth or bidirectional sync.
- Eight current live runtime files returned HTTP 200 and matched the pinned production baseline byte-for-byte. `main` still points to that baseline. Branch metadata reports protection disabled; detailed protection settings remain unavailable (403). No settings were changed.

## Google read/write and cross-device status

**Implemented; real-account verification blocked pending owner participation.** Read-only imports keep their established permission. Packing uses a separately initiated file grant/Picker choice under the existing `drive.file` scope. Google grants file access, not tab-only permission; the code restricts writes to Packing & Bags. The existing project must have Sheets, Drive and Picker available; no new paid infrastructure is needed.

Offline persistence, retry, expired authorization, duplicate prevention, simultaneous competing app writers, distinct new-record additions, conflicts and backups have automated coverage. **Actual iPhone ↔ iPad/Mac convergence and Google permission/write/readback are not tested.** Tokens do not survive reload; reconnect explicitly when needed. Closed apps do not receive live pushes.

Known limits: manual sorting/editing the same Sheet cells during the final request has no transactional compare-and-swap. The shared journal retains app proposals, while preflight/readback detect observed conflicts. Keep rows contiguous and avoid manual edits while a write is in flight. A removed recovery history blocks stale-response verification. Airline limits, live weather/snow/prices/DiDi/route times and mainland Google/provider reachability are not inferred or guaranteed. Optional non-outbound/return flight limits require separate verification.

## Exact remaining owner actions

1. Export the existing production app's complete private backup and retain original pending receipt files. Do not clear website data/uninstall the PWA.
2. Follow [safe exact-origin Mac account staging](RELEASE_QA.md). Enter/save the existing private tracker URL/ID locally, plus existing OAuth client ID, restricted Picker key and project number. Verify extended read-only refresh and all seven existing packing identities.
3. For explicitly authorized test writes, launch `node scripts/account-qa.cjs --packing-write`, review the in-app file-access disclosure, authorize and select the existing workbook in Picker. Verify app → Sheet, Sheet → app, same-ID edits/transfers, stage/sweep/home records, offline/expiry/retries and no unrelated changes. Use temporary QA records only after you explicitly authorize their unique IDs and cleanup; never load public demo fixtures into the real workbook.
4. Test a second iPhone/iPad/Mac on the same workbook, including simultaneous same-item edits, visible conflicts and explicit resolution. Verify actual canonical rows and private recovery records, not just a local Synced label.
5. Perform the physical iPhone Safari/Home Screen checklist in RELEASE_QA: safe areas, drawer/dialog focus and keyboard, packing stages/room sweeps, tickets/plans/vlog, AMap/GPS, Talk mic/audio, airplane-mode cold launch, pending packing/receipts and full backup restore. The Mac helper blocks service workers; it cannot satisfy physical PWA checks. Candidate response overrides only count when the candidate worker/full cache are independently verified; otherwise this gate stays blocked.
6. Verify actual photo/HEIC/PDF Drive uploads in the existing private folder, retries, true authorization expiry, one receipt ID/file per expense and no duplicate spend/data loss. Record results privately with candidate SHA/device/version; do not publish private rows, tokens or network HARs.
7. Return pass/fail evidence for the critical gates. Recheck latest-head CI and production/main identity before merging/deploying. No release while an owner/account/device gate remains open.

## Current production

- URL: https://shaunlittmanco.github.io/china-companion-2027/
- Version: **v1.6.1**
- Deployed commit: **`89ab875d8d4f51286b1fd024cb2293c02f40c536`**
- v1.7 deployed: **No**
- Rollback: prepared and tested in isolation; not executed on production. Restores v1.6.1 behavior with device-only private workbook configuration and retains private records/outboxes.

Continue from the current PR head and these documented gates; do not restart from the earlier approved demo or re-create packing/database resources.
