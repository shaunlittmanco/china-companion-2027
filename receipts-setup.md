# China Companion v1.5: Private receipt uploads (setup required)

Current status: receipt upload UI and Drive Picker code have been added, but **live upload is not yet authorized or tested**. Do not assume that selecting a file is enough to back it up.

## Google Drive folder

A separate private folder named **China Trip 2027 - Receipts** has been created inside the existing **Travel Itinerary** folder, beside the China Trip Command Center 2027 Sheet. Select exactly that folder in Google Picker (not a finance or shared-expenses receipts folder). The folder ID is **not** stored in this public repository; only an explicit folder selection can grant `drive.file` access to it.

## Finish Google Cloud (no paid subscription required for initial setup)

Use the existing **China Companion 2027** Google Cloud project, and keep the original Sheets integration configured.

1. Enable **Google Drive API** and **Google Picker API** in APIs & Services → Library.
2. In Google Auth Platform → Data Access, add **https://www.googleapis.com/auth/drive.file**, keeping `spreadsheets.readonly` for the separate tracker read.
3. Create an API key in APIs & Services → Credentials. Restrict it:
   - Application restrictions: Websites / HTTP referrers: `https://shaunlittmanco.github.io/*`
   - API restrictions: Google Picker API (plus Google Drive API only if explicitly needed under your project configuration).
   - The key is public application configuration, not a Google OAuth client secret. Do not place confidential credentials in GitHub.
4. Find the **numeric Google Cloud project number** (not the project ID).
5. In the China Companion app → More → Receipt upload setup, enter the restricted Picker API key and numeric project number.
6. Tap **Choose Google Drive receipts folder**, authorize the additional `drive.file` scope, and select the exact China Trip 2027 - Receipts folder from Picker.
7. Under Wallet → Expense log, enter an expense, attach a JPG/PNG/WEBP/HEIC/PDF receipt no larger than 5 MB, then tap **Save expense**. Confirm the expense entry links to the new file in that private folder.

## How it works

- `receipts.js` stores OAuth access tokens only in memory, and never in localStorage, GitHub, or app data.
- The restricted Picker API key, numeric project number, and the explicitly selected folder ID are stored locally on the device; these are configuration values, not authentication secrets.
- Receipt bytes upload directly from the user's browser to the Google Drive API after the user authorizes `drive.file`. No app-server upload and no private public-GitHub storage.
- Google Sheets synchronization remains **read-only**. The expense itself is still kept **locally**, not appended to the Google Sheet.
- If there is an attached receipt and Drive upload fails, the expense is not saved; the form stays filled so the user can retry. To save offline without a receipt, remove the attachment.
- Receipt blobs are not stored in localStorage. Google Drive uploads require connectivity. Max file size is 5 MB; larger images must be compressed first.
- Removing an expense from the app does **not** delete the uploaded Drive file. This avoids accidental deletion of payment evidence.
- Test the Google Picker and OAuth flow on Safari/iPhone before relying on it while travelling in China. Google services may be unreachable in mainland China; maintain a photo/files backup.
- Google OAuth Testing mode may require periodic reauthorization. Drive access is separate from the Sheets read-only token and reauthorization may be needed after a reload.

## Verification still required

Cloud APIs and scope enabled; Picker key restrictions; first folder Picker selection; real receipt upload and readback; iPhone capture/photo flow; airplane-mode expense save (without receipt); Android/desktop behavior if needed; ensure storage quota and app consent screens behave as expected.

**Never mark uploads as complete without checking the resulting Google Drive file.**
