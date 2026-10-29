# Preview.8 acceptance checkpoint — 29 October 2026

**Release HOLD. PR #1 stays Draft/unmerged. Production v1.6.1 and frozen preview.6/preview.7 remain unchanged. Preview.8 publication requires separate owner approval.**

## Implemented changes

- Preserved the committed passive-checkpoint fix: opening any Home/hotel/checkout/Manila/Back Home view or cancelling verification does not persist a session or queue writes. The first explicit saved check/task starts its independent snapshot. Reopening it does not queue again. Re-saving an identical task creates no new revision; changing one task queues only that changed task. Initial intentional session creation includes its snapshot's stage/check/task records, preserving the existing synchronization protocol.
- Header magnifier and Menu Search open an accessible native dialog from all screens. The local index groups Features, Places & Activities and My Belongings. English, Chinese and Taglish synonyms navigate directly to existing screens/subviews. Inventory results reuse My Bags' filter, expand the correct bag and focus the item. Cached itinerary, hotels, saved landmarks, attractions, food and transportation references are searched offline. Queries/results are temporary, never stored or sent to a search provider. Only explicit user-visible fields are indexed; configuration, tokens, receipt links and arbitrary backup fields are excluded. Unsaved expense drafts and durable pending data remain intact.
- On iPhone/iPad, saved hotels, Map details and activity Go cards offer **Open in AMap App**. Text-only places use the official `iosamap://poi` search; known validated coordinate systems use `viewMap`. Deliberately chosen supported modes use `path`: driving 0, transit 1, walking 2, cycling 3. No navigation-start URI, automatic timeout or double-opening fallback. WGS-84 uses dev=1; GCJ-02 uses dev=0. Unknown/invalid systems use names; mixed endpoint systems do not share mislabeled coordinates. A separately labeled **Open AMap Website** link uses callnative=0. App language stays under the installed app's settings; Chinese place names/addresses are preserved. Installation detection and physical native handoff are not claimed.
- Runtime version, asset URLs and scope-specific cache advance together to `1.7.0-preview.8`. Fictional interactive reviews are rebuilt; Google access remains disabled there.

AMap primary references: [place search](https://lbs.amap.com/api/amap-mobile/guide/ios/search), [marker](https://lbs.amap.com/api/amap-mobile/guide/ios/marker), [route planning](https://lbs.amap.com/api/amap-mobile/guide/ios/route). Official route documentation supports named endpoints and retains app preferences; there is no app-language override in these links.

## Private recovery validation

The original phone backup, derivative recovery copy and manifest are present in the private Work workspace. Both SHA-256 hashes match the manifest. Both pass full backup validation. Deep comparison proves the derivative changes only the empty Home Packing session and its 13 unsent proposals (all without a remote base). All other JSON values are identical, including inventory, settings, other sessions/history, canonical records, pending/conflict state, itinerary, bookings, expenses, receipts and other progress. Recombining the retained removals reconstructs the complete original. Packing schema parses, inventory identities match, recovery pending/conflicts are zero.

A fresh connected read-only Sheet check still has 32 canonical/recovery records and no Home Packing rows. Normalized full-table aggregate comparisons match the previously verified Mac backup. No live writes or recovery restore occurred. Raw backups and identifiers remain outside Git/public artifacts. The original phone app and backup remain available; a recovery merge into the dirty installation is **not** a replacement and would retain its outbox. Explicit owner approval and independently verified original backup are required before applying recovery to a fresh isolated candidate installation.

## Verification and evidence boundaries

Local syntax and 138 Node regressions pass, including new search/navigation/focus/privacy, iPhone URI/coordinate handling, all checkpoint passive views and deliberate check/no-op queue coverage. Current full browser/rollback/account-smoke results must be read from exact-commit CI, not inferred from local Node tests. The local Chromium process is blocked by macOS Mach-service permissions; it is not used for Google sign-in.

Previously verified hosted preview.7 evidence remains valid for that candidate: legitimate isolated normal Chrome read-only import; both directions of the approved synthetic ITEM edits; stable IDs; offline pending status, saved draft and network-blocked hosted startup; reconnect/readback; isolated completed CHECK/SWEEP history import/correction and immutable snapshot after a bag move. Seven original ITEM records and unrelated data stayed unchanged. These are not physical iPhone or preview.8 authenticated passes.

Still required on the approved frozen preview.8: physical Safari/Home Screen identity/storage and safe recovery, actual native AMap, GPS, mic/audio, HEIC/private Drive, airplane-mode cold launch, real second-device convergence/conflicts and genuine authorization expiry. Fresh live checkpoint tests ordinarily include genuine inventory and need an additional bounded approval. Do not sync the 13 unexpected proposals or create new QA belongings under the existing two-item approval.

## Next authorized boundary

After exact-commit CI passes, prepare an additive acceptance path using the candidate SHA and request publication approval. No Cloud changes are proposed. Follow the consolidated physical checklist only after publication and recovery approvals. No production upgrade while mandatory gates remain open.
