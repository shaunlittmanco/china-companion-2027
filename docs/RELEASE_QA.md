# v1.7 release gate — BLOCKED pending owner/account/device checks

## Current checkpoint — preview.7, HOLD

Live hosted preview.6 tests found a stale Synced badge for offline queued edits and shared cache cleanup across worker scopes. Both have failing-before regression coverage and are fixed in preview.7. Local syntax and 130 Node tests pass; exact-head full CI and hosted preview.7 revalidation remain mandatory. Cache names now use `cc27:<registration-scope>:v1-7-preview-7`; do not expect or clear origin-wide legacy caches. Dedicated QA storage remains mandatory because private localStorage/IndexedDB still share an origin.

The immutable preview.6 stage passed actual Google read-only/two-way ITEM readback and desktop network-offline queue/reload/reconnect, after repairing only its QA-profile cache conflict. Those results do not validate the revised candidate, actual second-device synchronization, physical airplane-mode/PWA cold launch, HEIC or genuine expiry. Root production stays v1.6.1. A revised staging publication needs owner approval. Historical evidence follows.

## Latest checkpoint — preview.6

See the 28 October resume in V1_7_CONTINUATION_REPORT.md. Current suite: 128/128; actual built-in-browser DOM layout matrix: 168 passing checks. Private backup export/restore/repeated-restore round trip passed. A receipt session-cancellation defect is fixed in preview.6. Exact-origin live candidate Google sync, actual HEIC, physical devices and current-head full browser CI remain required. Historical preview.5 results below are retained as history. Use cache `china-companion-v1-7-preview-6` and preview.6 assets when checking the current candidate.


Design approval is complete. Production deployment is conditionally authorized by [the owner’s PR #1 authorization](https://github.com/shaunlittmanco/china-companion-2027/pull/1#issuecomment-6433127953), **only after all critical checks truly pass**. Do not merge based on CI alone. This report does not mark physical devices or live account flows passed.

The previously approved Imperial design and original v1.7 features are preserved. Subsequent owner instructions add Packing & Bags, hotel-to-hotel/return-home checks and opt-in bidirectional packing sync as mandatory release gates. Runtime assets now include those additions. Recheck the latest PR head and CI before release. See [Packing implementation and account checklist](PACKING_SYNC.md).

## Current production and evidence — 27 October 2026

- URL: https://shaunlittmanco.github.io/china-companion-2027/
- Current successful Pages deployment: `89ab875d8d4f51286b1fd024cb2293c02f40c536` (v1.6.1), deployment `7323826018`, successful 26 October 2026. Public deployment/status metadata was read; the legacy Pages-build endpoint returned 404 and was not treated as proof of failure.
- Eight live runtime files (index, app, service worker, mapper, receipt uploader, outbox, payment/backup helper and manifest) returned HTTP 200 and matched the pinned v1.6.1 source byte-for-byte.
- A read-only live browser check also confirmed `app.js?v=1.6.1`, seven legacy navigation tabs and no candidate Menu.
- PR #1 remains draft/unmerged. `main` remains at the pinned production commit.
- Public branch metadata reports `protected: false`; visible repository rulesets are empty. Detailed branch-protection settings require administration access and returned 403 to this integration. No protections/permissions were changed. Human release gates must still be enforced.

| Release gate | Evidence available | Status |
| --- | --- | --- |
| Latest source / CI | Prior 88-test CI passed; packing continuation adds model, queue/concurrency and actual UI integration tests | Use the latest-head CI linked in PR body |
| Extended Sheets from actual app origin, owner account | Full bounded connected-workbook rows mapped successfully, all seven added tabs present, no import warnings; GET-only tests pass | **BLOCKED: owner app-origin OAuth/refresh not performed** |
| Real photo/HEIC/PDF + Drive destination/retries/expiry | Existing uploader/outbox and mocked integration suite pass; prior v1.6.1 PNG test is historical only | **BLOCKED: v1.7 owner-device/live-account cases not performed** |
| Physical iPhone Safari/PWA, navigation, audio, GPS, offline and restore | Chromium/WebKit emulation passes; no physical iPhone was available to Work | **BLOCKED: physical device cases below** |
| Packing inventory / journey / two-way sync | Implemented with synthetic queue, independent-stage and competing-app revision tests; existing seven starter IDs verified read-only | **BLOCKED: actual owner file consent/read-write, two-device and physical workflow tests** |
| PWA / schema / preservation | Real Chromium baseline → candidate → rollback → candidate cycle passes, including offline reloads and stored receipt bytes/IDs | Automated migration passed; physical cold launch still required |
| Rollback / limitations | Pinned rollback patch prepared and apply-check passes; provider/mainland limits below | Prepared, not executed on production |

Packing writes require separate explicit file authorization/Picker selection using `drive.file`; this is the existing receipt scope but expands the selected files the app can edit. Google cannot restrict this grant to a tab. App writes are allowlisted to Packing & Bags. No new project, folder, backend, billing or paid service is introduced. No private snapshot, token, key, account cookie, receipt link or receipt file is part of the repo/test artifacts.

## Preview.5 resume result

Recovered GitHub head and prior successful CI; fixed late-disconnect response handling, duplicate checkpoint identities and manual CHECK/SWEEP ID reuse. Current syntax and **127/127** automated tests pass locally. Asset/cache versions advance together to preview.5. The continuation report records the feature audit and remaining owner steps. Exact committed preview.5 account smoke and regenerated-patch upgrade/offline/rollback/forward checks passed locally on `c50964e3ae9aa7a635dc9bfc7e5e17f579cd2fa1`. The follow-up commit includes that regenerated rollback patch. Fresh connected read-only packing schema/starter-ID inspection also passes; no write was made. Re-run/check latest-head CI after this checkpoint; no live Google or physical-device gate is waived.

## What was actually rechecked

`npm run check` and the original 88 regression tests plus new packing/sync/UI tests are run against this candidate; **124/124 tests pass locally**; consult the latest-head workflow for CI. Local Chromium mobile checks pass again. Existing current-application CI also passed WebKit; the follow-up workflow reruns both engines and adds the two QA scripts below.

`node scripts/release-check.cjs` runs a real Chromium service-worker transition using an isolated synthetic profile. It extracts the pinned baseline from git, serves both versions at the same loopback origin and verifies:

1. v1.6.1 → v1.7 activation retains legacy trip/expenses/checkmarks, existing configuration, saved address and uploaded-receipt reference.
2. A pending PDF’s exact bytes, original filename and pre-reserved Drive ID survive.
3. Paid tracker spending is not counted twice.
4. New notes/shot progress, permanent packing inventory, independent checkpoint verification and pending packing writes survive actual offline reload.
5. Restoring v1.6.1, then offline reloading it, does not delete legacy records or the new v1.7 progress.
6. Forward recovery to v1.7 restores usable notes/shot checklists with the same pending receipt.

All remote APIs are blocked in this test. It verifies browser/storage behavior, not live Google access, genuine HEIC/PDF uploads, physical Safari, or mainland connectivity.

## Safe owner-account staging on the Mac

A live account test must use candidate code at the existing authorized HTTPS origin. The downloadable design demo disables Google and cannot satisfy this gate. A localhost/different-origin sign-in is also not an equivalent test of the existing OAuth setup.

From a checkout of the latest PR branch on your Mac, with Node 20+:

```sh
git switch design/jade-night-v1.7
git pull --ff-only
npm ci --ignore-scripts --no-audit --no-fund
npx playwright install chromium
node scripts/account-qa.cjs
```

The helper opens a **fresh isolated browser** at the existing HTTPS app URL but supplies committed candidate static files only to that browser. It rejects locally modified runtime files. The public server and normal Safari/Chrome/PWA storage remain untouched. Existing Sheets GET responses and live Google OAuth/Drive responses are not mocked or logged. Non-GET Sheets requests are blocked by default. The explicit `--packing-write` launch option permits only the configured workbook’s Packing & Bags RAW upserts and recovery-row append requests; in-app file consent and Picker selection are still required. Use it only for owner-authorized records/test writes; see PACKING_SYNC.md. It starts with no production cookies, tokens or private data; enter existing public app configuration locally and sign in yourself.

This is an account-flow staging method, not a public QA deployment. **Service workers are disabled in this helper. It does not satisfy iPhone, installed-PWA, offline cold-launch or migration sign-off.** Its temporary local data is discarded when the browser closes; export a QA backup first if you need to retain results. Actual TEST files uploaded to Drive remain in the existing private folder. Do not upload real sensitive documents as test material.

`node scripts/account-qa.cjs --smoke` was verified without network access: exact origin, candidate marker, Menu and Settings load. **That smoke run did not sign into Google.** If Google rejects the automated browser, stop and record the failure; do not bypass a security warning or change OAuth origins/scopes.

### Owner account acceptance

Record the candidate commit, device/browser version, date and pass/fail for each case. Keep private proof and configuration on your device/existing private Drive; do not put tokens, network HAR files, receipts or private tracker rows in the public PR.

- [ ] Menu → Settings: save the existing private tracker URL/ID locally, then use the existing public OAuth client ID, restricted Picker key and project number. Confirm consent only requests the existing Sheets read-only / `drive.file` permissions.
- [ ] Connect Google → Refresh now. Verify successful timestamp plus Master Itinerary, Decision Options, Social Media, Wulong and all four city plans. Confirm known Working/Booked/Backup labels and historical prices remain intact; saved budget choices are unchanged.
- [ ] Refresh again. Confirm existing local notes/checkmarks/expenses persist and the app sends only GET requests to Sheets. Do not edit the master to manufacture a test.
- [ ] Select the existing private receipts folder. Save clearly labeled TEST expenses using non-sensitive photo, HEIC and PDF files. Verify exact uploaded files, private destination, unique IDs, byte counts and filenames in Drive. A local Pending label is not a verified upload.
- [ ] Create a TEST pending receipt while offline. Reconnect and Retry twice. Verify one Drive file/ID and one expense, not duplicate spending. Match an already-paid tracker entry and confirm it is excluded from additional spending.
- [ ] Let actual Google authorization expire, then retry/refresh and reconnect. Check pending bytes/IDs, amount, receipt link and snapshot survive. A mocked clock/expiry change is not real end-to-end expiry evidence.
- [ ] Clean up only clearly labeled TEST entries/files after verifying results, keeping a private backup first. Never delete existing bookings, records or receipts.

## Physical iPhone candidate procedure and acceptance

Work has no access to your physical iPhone. The candidate is not published at a staging URL. Do not test the public v1.6.1 page or a simulated phone preview and call it v1.7 physical-device QA.

For pre-merge testing without changing the public server, an owner with a Mac can use Safari’s documented **remote Web Inspector + Response Local Overrides**:

1. Save a complete private backup from the existing production app in Files. Keep original receipt media. Do not uninstall the existing PWA or clear website data.
2. Connect the iPhone to the Mac. Enable Safari Web Inspector on the iPhone and developer features in Mac Safari. Select the actual iPhone Safari page or Home Screen web app in Safari’s Develop menu.
3. Map Response Local Overrides to the committed candidate’s runtime files at the **same existing app URL**, preserving correct MIME types. Override the root document and `index.html`, plus styles, all JS files, manifest, service worker and icons listed in the candidate `sw.js` CORE array. Match version query strings too. Keep all security/cross-origin protections enabled; do not override Google requests.
4. Reload while inspecting and verify the actual candidate Menu/Activity/Vlog screens and versioned preview.5 assets. A v1.6.1 UI means the override did not take; stop rather than marking a result passed.
5. For the PWA/cold-launch case, independently verify that the active worker and **complete** cached shell are the v1.7 candidate (`china-companion-v1-7-preview-5`). Merely seeing overrides while Inspector is open is insufficient. Service-worker interception/cache priming through remote overrides is **not certified by Work**. If the device cannot actually cache/run the candidate, the cold-launch gate remains blocked and a separately verified staging environment is needed before merge.
6. Perform the checks below while the confirmed candidate is active. For offline cold launch, close Inspector and all app views, enable airplane mode with Wi-Fi off, then open the Home Screen app. Verify v1.7 screens/progress actually load. Reopening the online page without overrides may load production again; confirm the version for every result.
7. Remove local overrides after the session and return to the normal public version. Do not clear storage to remove the override. Check the private backup and pending receipt references remain available.

This owner-operated override session can temporarily change that device’s cached app version; it is not a server deployment or an assertion that every Safari version supports the procedure. Stop if candidate worker/cache identity cannot be verified. A separate test device is preferable when available; buying a device or service is not required.

Official reference: [WebKit Local Overrides](https://webkit.org/web-inspector/local-overrides/) (effective only while Inspector is open) and [remote iOS inspection](https://webkit.org/web-inspector/enabling-web-inspector/) (including Home Screen apps).

- [ ] Install/open the confirmed candidate as a Home Screen app; portrait/landscape, safe areas, bottom nav and keyboard leave all actions reachable. Check focus/VoiceOver, drawer close and focus return, large address/copy.
- [ ] Activity Details: all five sections, local ticket evidence/expense association, actual vs reference prices, saved choices and historical labels. Paid does not complete the visit or add spending.
- [ ] Smart Plans: compare A/B, cancel without a change, confirm a local B schedule, inspect Jan 17 and protected reservations, then restore the master schedule locally. In October, the actual decision should be **C / uncertain**; do not change the device clock to fabricate January evidence. Snow/no-snow rules are separately covered by automated/demo tests.
- [ ] Vlog Kit/Hub: Quick/Full, YouTube/IG, two essential plus three optional Stories, shot completion across navigation, relaunch and offline use.
- [ ] AMap/GPS: explicitly grant/deny location, override with hotel/manual origin, copy a real Chinese address and confirm the correct destination/mode in native AMap. No fabricated ETA/fare or coordinate-system assumption.
- [ ] Talk: actual English/Mandarin capture and audible translated playback; slow/replay settings; pause on leaving/backgrounding/interruption. Record Safari requiring a restart/tap rather than calling it uninterrupted interpretation.
- [ ] Real iPhone photo/HEIC/PDF picker, offline pending retry and live authorization recovery as above.
- [ ] Airplane-mode **cold launch** of the verified candidate: saved itinerary/hotels/addresses, notes, local plan, shot progress, expenses and pending receipts persist. Street tiles, arbitrary translation and Google upload are expected to require internet.
- [ ] Export a private QA backup with pending test receipt bytes; restore it and restore a second time. Existing entries/progress stay, no duplicate expense/count, same reserved receipt IDs. Keep originals until verified.

Repeat relevant Safari layout/navigation checks on the real iPad and Mac. Do not substitute desktop WebKit emulation for iPhone evidence.

## Limitations remain explicit

Live venue ticket prices, DiDi quotations, in-app routing/ETA and mountain snow/access feeds are not connected. Manual source-checked references and stale/unknown states remain. No January snow forecast is claimed in October. AMap is an external handoff when used; offline street routing/background guidance are not guaranteed. Talk remains browser-dependent beta. Google, map tiles, translation and voice services may be unreachable in mainland China; a real mainland network check is still unverified. These limitations are not converted to “passed live integrations.”

## Prepared rollback — not executed on production

[rollback-v1.6.1.patch](qa/rollback-v1.6.1.patch) restores the pinned baseline’s runtime files/manifest/icons and service worker. It contains only public source/assets, not user data. The patch also restores the baseline package/lockfile, regression tests and CI, removing v1.7-only test cases so the rollback can pass the appropriate baseline suite. Its `git apply --check` passes on the candidate; application plus baseline syntax/regression validation in an isolated copy also passes. The actual browser rollback/forward cycle above also passes. New v1.7 JS files may remain unused; no localStorage, IndexedDB, Google data or uploaded Drive files are deleted by the patch.

If a later authorized production release needs rollback, start from a clean checkout, prepare a separate rollback branch/worktree and a new normal commit, preserving history:

```sh
git switch -c rollback/v1.7-to-v1.6.1 main
git apply --check docs/qa/rollback-v1.6.1.patch
git apply docs/qa/rollback-v1.6.1.patch
git add index.html styles.css app.js sheet-sync.js receipts.js receipt-store.js travel-data.js sw.js manifest.webmanifest icons package.json package-lock.json .github/workflows/test.yml tests
git commit -m "Restore v1.6.1 runtime while preserving private device data"
```

Recheck the exact production head and patch before applying; it must fail safely if runtime files changed. Run validation, review/merge the rollback normally, monitor the existing Pages environment, then verify runtime fingerprints and online/offline recovery. Do not force-push/reset main, clear website data, recreate Google resources, or re-upload all receipts. Keep a v1.7 private backup: an old-version backup export does not include the newer progress fields even though existing stored fields survive the tested rollback.

## Final release decision

**HOLD. No merge/deployment.** Owner-account results and physical iPhone results are not present. Once those exact-candidate results are supplied, resolve any failures, rerun full latest-head CI, re-read this authorization and current PR head, then release only if every mandatory gate is satisfied. Keep a record of the merged/deployed SHA, Pages status/URL and post-deploy smoke checks. Approval of the design alone is not release sign-off.

## Additional physical Packing acceptance

- [ ] My Bags shows the three distinct luggage groups plus Unassigned in both themes; add/archive/restore/move preserves identity and contents. Confirm actual per-leg airline limits independently.
- [ ] Home → Central Shanghai arrival → Toy Story checkout and full room sweep → next hotel: same inventory, fresh checks every time, useful item locations, collapsed bags retain progress. Missing/critical items never show verified-ready.
- [ ] New souvenir appears in future stages, not completed history. Changed hotel/date/room preserves history.
- [ ] Beijing → MNL baggage claim → manually started Back Home: fresh per-bag checks, gifts distinct from missing, unpacking tasks and dump-location/backup gate. No media is modified.
- [ ] On physical iPhone, airplane-mode cold launch after edits restores pending sync and unfinished room sweep. Restore the private full backup and verify existing expenses/receipts remain intact.
- [ ] With owner-authorized file access, second-device convergence/conflict resolution and exact Sheet readback pass. Until then, bidirectional sync remains unverified for release.

The prepared rollback restores v1.6.1 behavior with one privacy compatibility change: its Sheets client reads the existing `chinaCompanionSheetIdV1` device setting rather than embedding a private workbook identifier. The old static tracker link becomes the generic Google Sheets entrypoint. Reproduce the patch with `node scripts/prepare-rollback.cjs` after committing runtime/test changes. Historical commits are not rewritten.

The continuation report and exact source commits are in [V1_7_CONTINUATION_REPORT.md](V1_7_CONTINUATION_REPORT.md). Current Chromium matrix is 12 screens × 2 themes × 7 widths. CI additionally exercises WebKit. Real account/write/physical-device gates remain open.
