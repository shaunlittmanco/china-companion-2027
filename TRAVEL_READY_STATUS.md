# China Companion 2027 v1.6.1 validation status

This is an incremental update to the existing public app. The private master Sheet and existing private receipts folder are unchanged. No billing or paid runtime service is introduced.

## Receipt audit — 26 October 2026

- Reviewed this report and receipts-setup.md against the current v1.6 source before editing. The original 42 tests passed; the updated suite has **53 passing automated tests** with synthetic data/mocked Google responses.
- Receipt attachments remain optional. Saving, editing and deleting an expense without a receipt does not require OAuth configuration, internet, or IndexedDB. Backups containing no receipt files can also restore without IndexedDB.
- Added **Remove selected file**, which clears a new attachment choice without discarding transaction fields or an already-saved receipt.
- New receipt filenames include transaction date, city, merchant/description, CNY amount, payment-method tag and a stable unique expense ID, with the appropriate image/PDF extension. Missing CNY is explicitly labeled CNY-NA. Filename components are sanitized and limited by UTF-8 bytes so Chinese names cannot crowd out the unique suffix.
- Before an upload ID is reserved, queued names reflect edits and older unreserved names are upgraded on Retry. Once reserved, the existing file ID and name remain unchanged. No uploaded Drive files are renamed.
- A local queue-cleanup failure after verified upload retains the verified receipt link and reports the remaining local copy separately, instead of labeling the upload failed.
- Additional coverage: receipt-free operations with unavailable IndexedDB, attachment removal, receipt-free backup restore/export, filename fields and payment aliases, Chinese/unsafe/long names, stable suffixes, upload metadata, reserved-name preservation and local-cleanup failure.
- Updated asset versions/cache for the existing PWA. Storage keys, existing expenses, pending receipt blobs, saved filenames/IDs for reserved uploads, the private Sheet and the existing private folder are preserved.
- Connected Drive metadata confirms the existing receipts folder is private. The initial automated audit did not verify a real upload; subsequent live checks are recorded below.

## Live Google integration verification — 26 October 2026

- Completed app-origin Google Drive authorization and selected the existing private receipts folder through Google Picker. Its necessary-cookie prompt required owner interaction in Cloud Chrome; no global browser privacy settings were weakened.
- Saved one clearly labeled synthetic TEST expense with a 12,578-byte PNG. The Expense Log automatically uploaded it and displayed **Uploaded · verified in Drive** with its private receipt link.
- Independently fetched the actual uploaded file through the connected Drive service. Verified the exact generated filename, image/png MIME type, byte count, existing parent folder, private sharing state and owner-only permission. The filename included date, city, TEST merchant, CNY amount, payment method and the unique expense ID. This verifies one PNG upload; live PDF/HEIC uploads are not covered by this check.
- Completed app-origin Sheets authorization and an initial real refresh, followed by **Refresh now**. The successful-refresh timestamp advanced and the imported record counts remained consistent. The local TEST expense, amount, verified upload state and receipt link survived the refresh. No source Sheet edits were used for this test; its modification timestamp was unchanged before and after.
- Removed the synthetic Drive file using the connected Drive service and verified a subsequent direct file lookup returned NOT_FOUND. Removed the TEST expense through the app and confirmed the Expense Log was empty again. Existing folders and master Sheet were preserved.
- No credentials, tokens, private tracker records, destination IDs or receipt links are included in this report or committed configuration. Runtime Google configuration remains local to the browser.

## Implemented

- Receipt outbox in IndexedDB; expense-first save; pending/failed/uploading/verified states; resumable user retry with a persisted pre-generated Drive file ID; request coalescing; folder privacy checks; post-upload metadata verification; preserved legacy receipt links.
- Direct receipt connection and existing-folder selection from Wallet, retaining More settings. Picker explicitly sets the origin, compares OAuth project number, uses only drive.file, and reports missing configuration without exposing tokens.
- Expense date/time and time zone, city, merchant, category, CNY, estimated rate, fee breakdown, actual PHP override, edit/delete, paid-tracker association/exclusion, CSV and complete JSON backup/merge including pending receipt bytes.
- Existing Sheets GET-only sync retained. The mapper additionally exposes paid budget lines for explicit local reconciliation and preserves Chinese name/address/coordinate columns when present. Saved local map entries, expenses and checkmarks survive refreshes.
- Voice mode retains all four speed settings, adds source text and optional automatic typed playback, pauses on backgrounding/interrupted audio, and waits for completed playback before switching languages. No claim of uninterrupted iPhone interpretation.
- Saved place/Chinese address search, tracker hotels/attractions, itinerary map links, explicit optional OSM geocoding, GPS, and offline saved-address fallback. No native navigation, live transit routing, or offline street maps.
- One shared payment math implementation; issuer/platform fees separated; actual charged PHP overrides estimated totals without fees added twice. GCash uses the provider's quote, not a claimed live app rate. Defaults verified 23 Oct 2026: Visa Signature 1.70%; Diamond UnionPay retail 1.65%; linked foreign Visa wallets generally 3% platform estimate above CNY 200, editable for exemptions. No future promo or rebate is assumed.
- Existing PWA identity and production URL preserved; new assets are versioned and precached. Google responses and private receipt data are excluded from the service-worker cache.

## Automated checks

Run `npm ci --ignore-scripts`, `npm run check`, and `npm test` on Node 20+ (development verified on Node 24). No build step or runtime npm dependency is introduced.

Tests use synthetic data and mocked Google responses, actual IndexedDB transactions through fake-indexeddb, DOM integration through jsdom, and service-worker simulation. They cover file bytes surviving reopen, ID reservations, uncertain-upload recovery, permissions/expiry/offline preservation, no duplicate POST after success, CRUD, backup/restore with receipt bytes, CSV formula safety, financial calculations, old expense preservation, audio interruption, phrasebook directions and slow speed, offline itinerary maps, Sheets read-only errors, and PWA shell caching.

## Genuine checks still blocked or unavailable

- Cloud project/key restriction inspection: Cloud Console displays Site Unavailable in this browser. No repeated attempts or replacement project/client/key were made.
- Actual app-origin consent, PNG receipt creation/readback, manual Sheets refresh and test cleanup passed in Cloud Chrome as recorded above. The five-minute automatic timer, actual token expiration/recovery, live PDF/HEIC uploads and Google access during a real network outage were not exercised end-to-end in this live check; their synthetic coverage does not replace device testing.
- Native iPhone Safari, installation on an actual iPhone, airplane-mode restart on the device, microphone capture and audible English/Mandarin output cannot be certified from desktop Chrome or simulated speech tests.
- OSM tiles/geocoding, Google, online translation, voice recognition and transit information may be unavailable or incomplete in mainland China. Saved local records remain usable independently.

Do not label the app fully travel-ready until the remaining device, network and audio checks pass. The real PNG receipt and Google consent/manual sync checks passed in Cloud Chrome. The setup/check sequence is in receipts-setup.md.

## Reference sources

- Picker origin/key/project setup: https://developers.google.com/workspace/drive/picker/guides/web-picker
- Drive upload and pre-generated IDs: https://developers.google.com/workspace/drive/api/guides/manage-uploads
- Visa Signature: https://www.bdo.com.ph/about-bdo/learn/news-and-features/bdo-visa-signature-launch-2025
- Diamond UnionPay fee: https://www.bdo.com.ph/personal/cards/credit-cards/fees-and-charges-update
- Wallet platform estimate: https://www.bdo.com.ph/personal/cards/credit-cards/cashless-payments-in-china
- GCash Global Pay: https://gcash.com/services/global-pay

## v1.7 Smart Travel draft — 27 October 2026

The existing design branch now extends Modern Imperial China with Menu/sidebar, Activity Details/tickets, optional read-only tracker datasets, saved-option comparisons, conditional Plan A/B/C, local route/price references, Vlog Kit/Hub, daily Stories, Travel Mode and offline progress/backup support. See V1_7_REVIEW.md and docs/SMART_TRAVEL.md for screenshots, data boundaries and partial/live-provider limitations.

88 automated tests pass with synthetic data. Local Chromium covers 11 screens in two themes at seven widths, plus activity sections and actual offline PWA reload. PR CI additionally runs WebKit; the current result belongs in the PR. These checks do not certify a physical iPhone or the new batch under real app-origin OAuth.

The earlier v1.6.1 app-origin Sheets refresh and one PNG Drive upload verification above are historical verified checks, not a new live certification of every v1.7 feature. This upgrade retains receipt and authorization implementations and adds no permissions. No merge or production deployment is authorized or performed. Venue pricing, snow conditions and DiDi quotes are not live integrations; dates/sources and unknowns remain explicit. Other-day disruption planning is advice, not a full automatic schedule generator.


## Conditional release QA — 27 October 2026

Design is approved, but the owner’s PR conversation explicitly blocks merge/deployment until real app-origin Google account checks and physical iPhone checks pass. Those checks were not performed or marked passed. See docs/RELEASE_QA.md for exact acceptance cases and safe staging instructions.

Rechecked: 88 tests and syntax pass; local Chromium mobile checks pass; full bounded private workbook rows map through the extended mapper without warnings, including all seven added tabs (connector/component verification, not app-origin OAuth). Real Chromium service-worker upgrade, offline reload, pinned v1.6.1 rollback and forward recovery preserve synthetic legacy records, pending receipt bytes/reserved ID, notes and vlog progress. An isolated exact-origin account-QA launcher is provided; its network-blocked smoke test passes, but no live owner login has been performed. A source-only rollback patch has been prepared and apply-checked. Production application assets are unchanged by this QA follow-up.

Public Pages deployment metadata identifies successful production commit 89ab875d8d4f51286b1fd024cb2293c02f40c536. Eight live runtime files match that baseline byte-for-byte. Production remains v1.6.1; no new deployment or merge was performed. Public main metadata reports protection disabled and visible rulesets empty; detailed protection settings are unavailable to the integration (403). No permissions/protections changed. Main must not be merged merely because CI is green while owner/device gates remain open.
