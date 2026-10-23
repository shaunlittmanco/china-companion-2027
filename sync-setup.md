# Private Google Sheets synchronization

App-side integration is implemented. Google Cloud web client creation and the real OAuth sign-in test are still pending: the development browser could not reach Google Cloud Console. Do not mistake mapper/API simulations for a completed OAuth test.

## Existing deployment

Keep the current GitHub Pages site and existing private spreadsheet. No backend, paid service, API key, client secret, service account, public CSV endpoint, or published spreadsheet is required. Do not enable billing or purchase quota. The app makes two read requests per refresh and checks every five minutes while visible and authorized.

## Finish the existing Google Cloud project

1. Select the existing **China Companion 2027** project. Keep Google Sheets API enabled. Do not create another project.
2. Google Auth Platform → Data Access: add only `https://www.googleapis.com/auth/spreadsheets.readonly`. Keep the current owner Gmail test user. The scope can read all spreadsheets accessible to that account; the app itself uses only the existing fixed tracker ID.
3. Clients → Create client → **Web application**. Set the authorized JavaScript origin to `https://shaunlittmanco.github.io` (origin only, no trailing path). Google Identity Services uses the popup token flow; no redirect URI or client secret is needed by this app.
4. Copy only the public client ID ending in `.apps.googleusercontent.com` into the existing app under More → Google OAuth setup. It is stored on that device only. Never enter, commit, or share a client secret, password, access token, or refresh token.
5. Click **Connect Google** and sign in with the account that owns the existing tracker. The owner must complete Google's consent. Declining consent leaves the existing offline snapshot intact.

## Behavior and limits

- Google Identity Services issues short-lived access tokens kept only in closure memory. They are used only in Authorization headers for GET requests to the Google Sheets API. Reloading the app or expiry requires a user click on Connect Google; there is no automatic token renewal or unattended closed-app sync on GitHub Pages.
- Refresh checks occur every five minutes while visible, on focus, when returning to the page, and when connectivity returns. Checks are throttled and overlapping requests coalesce. No background consent popup is opened.
- A successful read validates all required tabs/headers and replaces one local snapshot atomically. A failed read, expired token, denied permission, malformed response, or failed local save leaves the prior snapshot intact. Storage is localStorage, unencrypted, on that browser origin. Avoid shared devices and use a trusted device passcode.
- Local expense entries and completed activities are separate from tracker reads and never sent back. Existing matching activity IDs are retained so checkmarks survive the first sync and source row insertion/reordering.
- Disconnect removes the in-memory session but retains offline data. Revoke Google access additionally requests Google grant revocation when a live token exists. Without a live token, use Google Account → third-party connections. Clear imported trip and expenses removes local trip data, expenses, checklist and client configuration, and cancels in-flight sync.
- Offline use requires opening the app successfully once, caching the shell and loading/importing a trip snapshot. Service worker caches only explicit public shell assets. Google/API responses are excluded. Safari can evict website storage; keep a private JSON backup.
- Google may be unreachable in mainland China. Refresh before departure and confirm offline availability. Offline caching does not provide offline Google sign-in or live data updates.
- Standard Sheets API usage is free within quota. This implementation adds no billing dependency. Never opt into paid quota or any paid cloud service for this integration.

## Validation

Run `node --test tests/sheet-sync.test.cjs` and `node --check app.js`, `node --check sheet-sync.js`, `node --check sw.js`.

A private, read-only connector read was used to validate the mapper against the current tracker layout; no private fixture is in this repository. Automated tests use synthetic data and cover mapping, exact financial parsing, stable identifiers, consent scope, expiry, request coalescing, GET-only API access, retries/cooldown, permission errors, storage errors, disconnect races, and service-worker isolation.

Still required after Cloud setup: authorize on the actual Pages origin; verify last-refresh status and current tracker items, switch browser/device offline and reload, confirm the snapshot and local expenses survive, then reconnect and refresh. Verify missing consent and expired access preserve the snapshot. Do not claim the integration fully connected until those live checks pass.
