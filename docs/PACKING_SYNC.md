# Packing & Bags — implementation and release checkpoint

This extends the existing app/PR, without changing production. The authoritative packing inventory is the existing private **Packing & Bags** tab, A:N, headers on row 3. The separate Packing & Requirements importer still supplies administrative preparation. No new workbook/tab is created, hidden or deleted. Public demo/fixtures contain fictional records only.

## Implemented

- Menu → My Trip → Packing & Bags, with My Bags and Packing Journey; five primary tabs retained.
- Check-in Luggage, Carry-on Luggage, Personal Item Bag and Unassigned remain distinct in master inventory and every checkpoint. Search, categories, quantities, optional measured/estimated weights, archive/restore and stable-ID bag transfers.
- Unknown allowances remain unknown. User references distinguish outbound/return allowances; they are not airline carriage approvals and do not automatically apply to domestic/intercity legs. Weights exclude the bag shell. Power-bank/spare-battery check-in conflicts block a verified-ready badge.
- Read-only Hotels dates/names drive independent arrival, checkout/sweep and transfer stages. Local additional/changed stays and room notes are supported. TBD is not a confirmed booking. Source reorder/name changes are matched to saved stay identities; completed snapshots stay immutable, with explicit corrections and alternate-snapshot recovery.
- Explicit arrival positions/room zones; fresh quantities and dispositions at each checkout; 13 room sweep areas, Checked/N/A; unresolved/critical/safety warnings and explicit noted completion overrides.
- Manual home departure, optional Manila baggage claim, manual Back Home with fresh per-bag checks, gifts/consumed/missing reconciliation, unpacking/laundry/gear/documents/receipts tasks and media dump/backup gates. The app never formats, deletes or uploads footage.
- Foreground Today shortcut/reminder using saved checkout time; no background push/geofence claim.
- Source ITEM IDs/Record IDs preserved. Source references survive metadata extension. Manually added ITEM rows receive deterministic provisional IDs and persist those IDs after an authorized write. Duplicate/invalid records fail closed.
- GET-only read import adds Packing & Bags alongside existing itinerary/finance/city imports. Successful imports cache locally; invalid packing schema preserves the previous packing copy with a warning. Fresh local edits are merged at response time. A read response missing a confirmed recovery revision is rejected as stale; confirmed canonical records that disappear become a visible Conflict instead of silently disappearing.
- Separately opt-in `drive.file` write client and existing-workbook Google Picker selection. Token is closure-memory only. The existing read-only client and receipt client remain separate. No new project, backend or paid service.
- Durable local coalesced outbox; explicit Synced / Pending Sync / Needs Sign-in / Sync Failed / Conflict status; last successful readback timestamp. Foreground open/focus/online/5-minute refresh when authorized. No popup from an automatic refresh, and no claimed closed-app push.
- Canonical ITEM/CHECK/SWEEP records are upserted by stable Record ID: existing rows use A4:N updates, new records use INSERT_ROWS append in this tab to avoid competing devices reserving the same empty row. Blank gaps block writes until the owner keeps records contiguous from row 4; read imports still work and no pending changes are lost. RAW values prevent formula execution. The app never writes other tabs, clears ranges or removes source/history rows.
- Before an upsert, append-only **CHECK / Sync recovery** rows are saved in the same private tab (`packing-sync-recovery` checkpoint, unique `REV-…` record IDs). These are revision/audit records, not duplicate ITEM inventories or hotel verifications. They retain competing app proposals across devices. Explicit resolution appends a revision identifying the reviewed branches. Recovery appends use INSERT_ROWS so gaps or later manual rows are not overwritten. Packing reads allow up to 10,000 grid rows; larger grids require a reviewed limit change. No journal pruning occurs; a full tab stops safely and requires extending existing rows.
- Reads before writing, a second preflight, confirmed recovery proposals and final readback. Expiry, rate/server/network failures retain pending changes. Ambiguous retries read stable IDs before sending another write. Both local and remote conflict records are retained; resolved versions remain in backup.
- Backups include dedicated records, sessions, outbox, recovery rows and alternatives; merge keeps completed history and exposes divergent pending drafts.

## Preview.5 follow-up

Disconnect is rechecked after response decoding, preventing a cancelled session from saving late data or reporting Synced. Duplicate checkpoint/item CHECK and checkpoint/task SWEEP identities fail closed even with different Record IDs. App edits reuse manually created CHECK/SWEEP IDs. Three regression cases cover cancellation, duplicate detection and full original-ID upsert/readback. Current suite: 127/127; live-account gates remain open.

## Remaining release gates

**No actual app-origin Google account read/write, physical iPhone, iPad or Mac acceptance is marked passed.** Connected-source inspection verified the existing tab and its seven starter identities without writing. That is not browser OAuth or two-way sync proof.

Google Sheets does not provide a transactional compare-and-swap for these row writes. The shared journal handles competing **app** proposals without silent loss; a human sorting/editing the same Sheet cells during the final upsert can still race the request. Preflight/readback detect observed changes, but cannot prove that an intermediate manual edit never occurred. Avoid manual editing/sorting during an active write. This limitation and actual two-device behavior need owner acceptance/testing before release; do not claim database-style transaction guarantees.

### Exact owner/account checks

Use the latest committed candidate, a private backup and `docs/RELEASE_QA.md`. Start the exact-origin isolated Mac helper with `node scripts/account-qa.cjs --packing-write` only when you are ready to authorize the test writes. The normal helper blocks all Sheets writes. Neither mode deploys the server; service workers remain disabled there.

1. Settings: enter/save the existing private workbook URL/ID on this device (not a new tracker); it is no longer embedded in public runtime/previews. Then use the existing OAuth web client ID, restricted Picker key and matching project number. Existing project must have Sheets, Drive and Picker enabled. Do not enter a client secret or create another project.
2. Read-only Connect Google/Refresh: verify all supported tabs and seven existing packing ITEM IDs. Confirm other records and expenses unchanged.
3. Packing Sync: read the file-access disclosure, check authorization, click Connect, complete Google consent and **select the configured existing workbook** in Picker. Selecting another file is rejected. This grants access to that whole selected file, not one tab; application writes remain tab-allowlisted. Receipt folder authorization is independent.
4. Only after explicitly authorizing reversible temporary QA records, use uniquely named/ID-tagged TEST items. Add in app → verify one canonical ITEM row, recovery records and confirmed timestamp; edit quantity/weight/bag/notes → same ITEM ID/row. Add a manual Sheet ITEM → refresh → appears once; IDs persist. Do not put fictional demo fixtures into the real workbook.
5. Test fresh per-hotel CHECK and SWEEP rows, independent next-hotel checks, souvenir future stages, final airport and home checks. Verify completed history remains unchanged after inventory/stay edits.
6. Offline edit → close/reopen → pending unchanged; reconnect/authorize → one canonical record after confirmation. Expire/revoke actual authorization → queue survives; retry twice without duplicates. Simulate lost connection after a write and confirm a read resolves it before resending.
7. On a second iPhone/iPad/Mac, connect the same workbook. Verify convergence. Edit the same item on both devices before syncing, including simultaneous requests: both proposals must be retained and a visible Conflict must require explicit choice. Do not mark real concurrency passed based on the synthetic test alone.
8. Export/restore private backup containing an unfinished sweep, completed history and pending writes; verify no receipt loss/expense duplication. Test physical Safari/PWA storage separately.
9. Verify other tabs, rows, IDs, finance totals and receipts have not changed. Preserve audit/recovery/history; cleanup only the specifically authorized TEST records with verified IDs. No blanket clear/delete.

### Automated evidence

`tests/packing.test.cjs` covers the model/codec/queue/auth failures, schema/ID guards, two simulated simultaneous writers, lost-response recovery, source reorder and completed-history retention. `tests/app.test.cjs` exercises the actual Menu, offline add/move, durable queue and independent per-bag checkout/sweep UI. The review and mobile scripts cover Light/Dark, widths and fictional interaction flows. Release-check verifies pending packing data through service-worker upgrade/offline/rollback/forward recovery. See latest CI and `RELEASE_QA.md` for actual execution results; automated simulations do not replace owner checks.

Official integration references: [per-file scopes](https://developers.google.com/workspace/sheets/api/scopes), [Google Picker](https://developers.google.com/workspace/drive/picker/guides/overview), [bounded table append](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets.values/append).

## 28 October read-only verification

Connected metadata/schema checks still confirm seven unique starter ITEM and Record IDs. No Sheet writes or candidate-origin two-way pass was produced. Preview.6 changes only the receipt response-session guard plus versioned assets/tests; packing source and protocol are unchanged. See the latest continuation report for current evidence and owner gates.


## Honest offline status

A durable pending queue always prevents a Synced summary, even if the latest completed network operation succeeded. Last successful readback time remains historical information. Offline edits remain pending through reload; reconnection reads before writing and verifies canonical identity afterward. A stale successful message must not describe a newer pending edit.
