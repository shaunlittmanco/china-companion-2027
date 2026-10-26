# Receipt uploads in v1.6.1

The existing v1.5 integration has been hardened; the app and folder have not been rebuilt. App-side tests pass. **A genuine upload to the user's folder remains unverified** because this Cloud Browser has no saved OAuth/Picker configuration and Cloud Console returns “Site Unavailable”. Do not treat a local pending receipt as a Drive backup.

## Keep the existing private destination

Use **Travel Itinerary → China Trip 2027 - Receipts**, the existing private folder. The app never creates a folder or changes Drive sharing. Select it through Google Picker to grant `drive.file` access. Its ID is retained on the user's device, not embedded in the public repository. The app checks the selected folder's name, folder MIME type, private sharing state, and ability to add files before uploads.

## Exact owner actions in Safari

These steps verify existing setup, rather than creating replacement projects, clients or keys:

1. Open the existing **China Companion 2027** Google Cloud project. Keep billing disabled; do not start the free trial or buy quota.
2. Google Auth Platform → Data Access: retain `spreadsheets.readonly` and `drive.file`. Keep your existing Gmail test user. No full-Drive or Sheets-write scope is needed.
3. Google Auth Platform → Clients → existing **Web application**: verify the authorized JavaScript origin is `https://shaunlittmanco.github.io` (no repository path).
4. APIs & Services → Credentials → existing restricted Picker key:
   - Application restrictions → Websites: `https://shaunlittmanco.github.io/*` **and** `https://docs.google.com/*`.
   - API restrictions: Google Picker API and Google Drive API only. Keep the key restricted.
   - Use the numeric project number from this SAME project. The app checks that it matches the project-number prefix of the OAuth client ID. It cannot remotely inspect the key's project or restrictions.
5. In the production app → More, enter the existing public OAuth web client ID, restricted Picker key, and project number on your device. Do not send these values through chat. Never enter a client secret or access token.
6. Tap **Choose Google Drive receipts folder**, complete Google's account/consent flow, and select the existing private folder above. This opens OAuth directly from a user click before any asynchronous file-storage operation, to avoid the usual Safari popup-gesture problem. Picker includes its explicit origin.
7. Wallet → Expense log: save a small test expense with a photo or PDF. The expense saves locally first. Tap **Connect receipt uploads**, complete Drive consent if necessary, then **Retry upload** on the pending expense. Once the expense says **Uploaded · verified in Drive**, follow its link and confirm the correct file in the existing folder.
8. Check Sheets independently with **Connect Google → Refresh now**. Verify the last-refresh time and a known current itinerary/booking. Do not edit the Sheet for a test. Reconnect after reload or token expiry as required by the browser token model.

Google's Picker setup instructions: https://developers.google.com/workspace/drive/picker/guides/web-picker . The docs.google.com referrer entry is required by the current documentation because Picker runs in a Google-hosted iframe.

## What is saved where

- Expense metadata: the existing localStorage key, preserving old expenses and Drive links.
- Pending receipt bytes: a private IndexedDB outbox on the device. JPG/JPEG, PNG, WEBP, HEIC/HEIF and PDF are supported, up to 5 MB each.
- Google access tokens: memory only. They are sent only to Google's OAuth/Picker/Drive or Sheets endpoints. They are never included in backups or persisted.
- Restricted Picker key, OAuth client ID and numeric project number: device-local configuration only, excluded from backups.
- New expenses are never appended to the master Sheet. Sheets requests remain GET-only under the existing read-only token.

Storage is not encrypted by the app. Device/browser storage can be evicted, including Safari website data. Keep original photos and a complete private backup in Files.

## Optional receipts and automatic filenames

You can save an expense without any attachment or Google setup, including offline. Receipt-free expense save/edit/delete and receipt-free backup restore do not depend on IndexedDB. **Remove selected file** clears the file chooser without clearing the transaction; a previously saved receipt stays linked.

New upload names follow this pattern (synthetic example):

`2027-01-12_Shanghai_Test-Tea-Shop_CNY28.50_GCash-AlipayPlus_94a23b10-26df-4daa-9ba2-40fe8729e117.pdf`

- The date comes from the transaction's local date, not the date of a later retry.
- City and merchant/description retain supported Chinese text; unsafe filename characters are replaced.
- The CNY amount is shown to two decimal places. If it was not recorded, CNY-NA is used; no PHP-to-CNY amount is invented.
- Tags distinguish GCash/Alipay+, Alipay/BDO Visa virtual, BDO UnionPay Diamond, WeChat/Visa, and Cash. Older payment labels remain supported.
- The stable expense ID is the unique suffix. Components have byte limits so long names cannot remove it. Supported JPG/PNG/WEBP/HEIC/HEIF/PDF extensions are preserved without doubling the extension.
- Existing queued filenames may be refreshed from edited expense details only before a Drive file ID has been reserved. A reserved ID and its original name are kept together for retry/recovery. Existing uploaded files are not renamed.

If Drive has verified the receipt but the device cannot remove its queued copy, the app keeps the verified link and reports that the local copy remains. It does not tell you to upload a second copy.

## Safe upload and recovery

1. Save the expense first; queue its receipt blob locally.
2. When authorized and online, validate the existing private folder.
3. Allocate a Drive file ID and persist it before uploading. Double-clicks share one job. Web Locks additionally serialize the same expense across tabs where supported; the ID reservation is also transactional.
4. Check that ID before retrying. Create the file with that same ID, then GET its metadata to verify its parent, size, private state and expense association.
5. Link the verified Drive file to the expense before removing its local queued copy.

An interrupted or uncertain upload retains the reserved ID and local receipt, so retrying does not knowingly create a new file. If Drive is inaccessible, the expense and queued file stay local. If local storage is full, the app says what was not saved rather than claiming success. Deleting an expense never deletes a Drive file. Clearing local app data explicitly clears the local outbox as well.

## Backup and offline checks

**Download complete private backup** includes the trip snapshot, checkmarks, expenses, saved map addresses and pending receipt files, including reserved upload IDs. Restore merges expenses by ID, keeps existing entries and progress, and does not overwrite an already-loaded tracker. CSV is an expense report, not a receipt backup. Restore a complete JSON backup on a trusted device. Maximum complete-backup receipt payload is 100 MB; larger queues must be reduced by verified uploads first.

Before departure, load the PWA once online, sync the Sheet, save pending receipts, download a private backup, and test reopening in airplane mode. Google services may be unavailable in mainland China: offline use supports saved plans, expenses, receipt queue, addresses and phrase text. It does not provide offline Google sign-in/upload, street tiles, routing, or arbitrary-sentence translation. Speech recognition and language voices depend on the browser/device.
