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
- Connected Drive metadata confirms the existing receipts folder is private. No actual app-created Drive receipt has been verified in this audit. This is not a successful live upload claim.

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
- The available Cloud Browser has no owner OAuth client ID, Picker key, project number, selected folder or Google session. App-origin consent, real receipt creation/readback, and genuine before/after Sheets refresh are not verified here. Connected-Drive folder metadata confirmed the existing destination is private, but that is not an app upload test.
- Native iPhone Safari, installation on an actual iPhone, airplane-mode restart on the device, microphone capture and audible English/Mandarin output cannot be certified from desktop Chrome or simulated speech tests.
- OSM tiles/geocoding, Google, online translation, voice recognition and transit information may be unavailable or incomplete in mainland China. Saved local records remain usable independently.

Do not label the app fully travel-ready until the real receipt, Google consent/sync and iPhone offline/audio checks pass. The exact owner setup/check sequence is in receipts-setup.md.

## Reference sources

- Picker origin/key/project setup: https://developers.google.com/workspace/drive/picker/guides/web-picker
- Drive upload and pre-generated IDs: https://developers.google.com/workspace/drive/api/guides/manage-uploads
- Visa Signature: https://www.bdo.com.ph/about-bdo/learn/news-and-features/bdo-visa-signature-launch-2025
- Diamond UnionPay fee: https://www.bdo.com.ph/personal/cards/credit-cards/fees-and-charges-update
- Wallet platform estimate: https://www.bdo.com.ph/personal/cards/credit-cards/cashless-payments-in-china
- GCash Global Pay: https://gcash.com/services/global-pay
