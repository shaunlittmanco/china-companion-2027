# v1.7 Jade Night — design review

**Preview branch only. Do not merge or deploy until the owner approves the preview.**

Production remains v1.6.1 at the existing GitHub Pages URL. This is an incremental presentation update to the existing application, with no new backend, Cloud project, billing or paid API. Preview content is fictional; it is not a tracker export or a real hotel reservation.

## Review the design

Download and open [the self-contained comparison](docs/previews/review.html) in a browser. It shows the original and proposed app at **390 × 844 CSS pixels**, with page and Light/Dark controls. Its storage is temporary memory and Google connection buttons are disabled. It cannot access the production site's local data. Do not use this fictional preview for actual travel directions.

Screenshots: [before Home](docs/previews/before-home-390.png), [Light Home](docs/previews/after-home-light-390.png), [Dark Home](docs/previews/after-home-dark-390.png), [Plan](docs/previews/after-itinerary-390.png), [Tickets/hotels](docs/previews/after-bookings-390.png), [hotel reference](docs/previews/after-hotels-390.png), [large Chinese address](docs/previews/after-address-390.png), [Wallet](docs/previews/after-wallet-390.png), [Talk](docs/previews/after-translate-390.png), [countdown](docs/previews/after-countdown-390.png), and [offline startup](docs/previews/after-offline-390.png).

## Proposed changes

- Jade Night palette, white cards, clearer type and spacing, consistent line icons, restrained gold architecture detail, reduced-motion support, keyboard focus, safe-area padding and readable Chinese font fallbacks. No external font service is needed by the app.
- Light is the default. Manual Light/Dark selection adds only `chinaCompanionThemeV1`; it does not migrate or remove any existing key. Theme is applied before the main UI loads.
- Five bottom tabs: Today, Plan, Map, Talk and Wallet. Persistent header buttons keep Tickets/hotels and Settings accessible on every page. Google setup messages now refer to Settings.
- Smart Today uses China local time, a departure countdown, the next unfinished future activity, a current/upcoming hotel card, upcoming bookings and offline reference shortcuts. It does not invent missing itinerary or address information. The planner and budget remain available below these cards.
- Chinese hotel and selected-place cards add Copy, Show Large and Open in AMap. The large-address dialog supports Escape, focus return and text selection if clipboard access is denied.
- AMap handoff uses the documented HTTPS search URI and an explicit external link. It sends the selected place's name/address/city only when tapped, never tokens. No API key is needed. Confirm the matching destination and choose the route in AMap.
- Wallet prioritizes conversion and expense history. Fee explanations, optional expense details and receipt setup/backup remain available in expandable sections. “Log this amount” only prepares an expense; it never saves automatically and will not replace an unfinished draft. Receipt attachments remain optional.
- Talk retains all four playback speeds, saved speed preference, microphone recovery and the existing opt-in online translation flow. Saved emergency phrases are added, with English and Chinese visible together.

## Validation

- All **53 original tests** retained; **8 added tests**, **61 total passing locally**. Existing test harness loads the new presentation helper; PWA assertions are updated to the preview asset/cache versions without weakening cache/privacy checks.
- Chromium: seven pages × two themes × widths **320, 375, 390, 430 and 820 px**; no page overflow. Checked navigation targets of at least 44 × 44 px, representative normal-text/button contrast of at least 4.5:1 and reduced-motion styling.
- Browser checks cover theme reload persistence, byte-for-byte preservation of existing snapshot/expense/checklist/speech preference values, Chinese address dialog/Escape/focus return, converter-to-expense prefilling and saving without a receipt.
- Actual offline browser test: service worker installed, browser network disabled, app reloaded, saved Chinese hotel data opened successfully. This is a browser test, not a physical iPhone airplane-mode certification.
- Chromium/WebKit checks are configured in the pull-request CI. Local WebKit could not launch because required system libraries could not be installed in this workspace; inspect the PR CI result before treating WebKit as verified.
- `npm run check` and `git diff --check`. No live Google credentials or private tracker data are used in tests or previews. Receipt/Sheet core behavior remains covered by the original suite; the successful live v1.6.1 integration is recorded separately in TRAVEL_READY_STATUS.md.

## Still requires a real device / outside a static app

- Real iPhone Safari/PWA safe-area, Dynamic Type/zoom, keyboard, screen reader, clipboard, microphone and audible language-voice checks. Linux WebKit emulation is not an iPhone.
- Native AMap opening and actual routing must be checked on the phone. This app does not offer reliable offline street maps, background navigation or live public-transport routing.
- Uninterrupted hands-free interpretation is not guaranteed on Safari. Arbitrary-sentence translation and speech recognition may require internet; installed device voices determine offline spoken playback.
- Google services, map tiles and online translation can be inaccessible in mainland China. Existing local plans, addresses, expense storage and the phrasebook remain the fallback; receipts upload only when a Google connection is available.
- This redesign has not been tested against the owner's real Google account at a new preview origin. Existing origin/configuration and scopes are unchanged; production rollout and on-device verification follow approval.

## Reproduce

Node 20+, `npm ci --ignore-scripts`, `npm run check`, `npm test`. For browser checks, `npx playwright install --with-deps chromium webkit`, then `TEST_WEBKIT=1 npm run test:mobile`. These install development tools only, not runtime services.

To regenerate the comparison and original screenshots, create a separate clean v1.6.1 worktree and set `BASELINE_DIR` to it when running `node scripts/build-review.cjs` and `node scripts/mobile-check.cjs`. Never use a signed-in browser profile or private backup as the fixture. Only synthetic screenshots are committed.

AMap URI reference: https://developer.amap.com/api/uri-api/guide/search/search
