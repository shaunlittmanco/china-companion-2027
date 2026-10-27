# v1.7 Modern Imperial China — design review

**Draft review only. Do not merge or deploy until Shaun approves the new design.**

The existing v1.7 branch and pull request are retained. Production remains v1.6.1 at the existing GitHub Pages URL. All preview records are fictional and never represent real bookings, addresses, expenses or private tracker data.

## Review the complete design

Download [imperial-china-review.html](docs/previews/imperial-china-review.html) and open it in a browser. It shows all seven screens simultaneously in Light and Dark Mode. Each phone scrolls independently. Additional controls show the Chinese Address Card, the pre-departure countdown and simulated offline quick access. The older `jade-night-review.html` filename remains a compatibility copy of this current review.

| Screen | First iPhone screen | Full content |
| --- | --- | --- |
| Home / Smart Today | [Light and Dark](docs/previews/review-home-light-dark.png) | [Full Home](docs/previews/full-home-light-dark.png) |
| Plan | [Light and Dark](docs/previews/review-itinerary-light-dark.png) | [Full Plan](docs/previews/full-itinerary-light-dark.png) |
| Map | [Light and Dark](docs/previews/review-map-light-dark.png) | [Full Map](docs/previews/full-map-light-dark.png) |
| Talk | [Light and Dark](docs/previews/review-translate-light-dark.png) | [Full Talk](docs/previews/full-translate-light-dark.png) |
| Wallet | [Light and Dark](docs/previews/review-wallet-light-dark.png) | [Full Wallet](docs/previews/full-wallet-light-dark.png) |
| Tickets | [Light and Dark](docs/previews/review-bookings-light-dark.png) | [Full Tickets](docs/previews/full-bookings-light-dark.png) |
| Settings | [Light and Dark](docs/previews/review-settings-light-dark.png) | [Full Settings](docs/previews/full-settings-light-dark.png) |

Additional states: [Chinese address](docs/previews/review-chinese-address-light-dark.png), [countdown](docs/previews/review-countdown-light-dark.png), [offline shortcuts](docs/previews/review-offline-light-dark.png). The original v1.6.1 [before/after comparison](docs/previews/review.html) is regenerated with the new theme.

## Design system

| Role | Color | Use |
| --- | --- | --- |
| Primary brand | Imperial Red `#B3262D` | Primary actions, selected dates, navigation accents, app icon |
| Decorative accent | Antique Gold `#C89A43` | Moon Gate frame, hairlines, lantern and lattice details |
| Strong accent | Deep Red `#7E1D25` | Home architectural welcome card, hover emphasis |
| Light background | Porcelain Ivory `#FAF7F1` | Light Mode page background with white cards |
| Dark background | Lacquer Black `#1B1D21` | Dark Mode page background with raised charcoal cards |
| Secondary accent | Jade Green `#087F70` | Restrained confirmation/connectivity cues and small logo detail |

The selected Moon Gate direction is implemented as a lightweight editable SVG emblem and matching PNG app icons, simplified for small screens. A lantern and architectural line drawing appear on Home. Quiet Chinese window-lattice ornaments, gold rules and restrained card details repeat across all seven experiences. Editorial serif headings pair with device-native sans-serif controls; Chinese text uses installed device font fallbacks. The app adds no network font service, paid API, subscription or backend.

Gold is decorative. Gold-colored status text uses darker brown on pale surfaces and a lighter gold on dark surfaces; body text and controls retain high contrast. Red occupies selected actions and one welcome card; most of each screen remains porcelain or charcoal. There are no decorative color gradients or cartoon illustrations.

Online map search and conversation-provider setup remain available in expandable sections, keeping immediate travel actions prominent. The same controls and opt-in choices are retained. Five main bottom tabs remain Today, Plan, Map, Talk and Wallet, with persistent header access to Tickets and Settings.

## Preserved behavior and data

- Read-only Sheets synchronization, existing OAuth client settings, scopes, fixed tracker ID and session handling are retained.
- Private Drive receipts, selected folder checks, local pending file storage, retry/idempotency and receipt filename behavior are retained.
- Translation, saved playback speed, opt-in online provider, microphone lifecycle, saved phrasebook and emergency phrases are retained.
- Existing maps, saved places, GPS, Chinese Address Cards and explicit HTTPS AMap handoff are retained. The review deliberately shows a labeled map placeholder because external requests are blocked.
- Currency estimates, expense creation/editing/export, backups, checkmarks and imported tracker records retain their existing behavior and storage keys.
- The theme preference key and presentation helper API are retained for compatibility. The browser/PWA theme colors and app icons are updated. The app-shell cache version advances to `china-companion-v1-7-preview-2`; private data and Google responses never enter that cache.

The synthetic downloadable previews use isolated memory-only storage. Their Content Security Policy blocks external requests, Google authorization is disabled, and microphone/location/external navigation actions are blocked. The offline review control simulates UI state; it is separate from the actual network-disabled PWA test.

## Validation

- All 61 existing unit/integration tests remain in place, covering receipts, read-only Sheets, expenses, backups, voice recovery, addresses, themes and offline behavior.
- Automated mobile checks cover all seven screens in both themes at widths 320, 375, 390, 430, 820, 1024 and 1366 px. They check overflow, navigation targets, representative contrast, reduced motion, theme persistence and byte-for-byte preservation of existing local records.
- Browser interactions check the large Chinese address dialog and focus return, conversion-to-expense entry, saving an expense, and a network-disabled PWA reload with saved hotel lookup.
- The complete review checks all seven screens in both themes, sampled visible heading/body/action text contrast of at least 4.5:1, disabled Google authorization, no script errors, extra states and wrapper widths 320–1040 px. It captures first-viewport and full-content comparisons.
- Chromium checks run locally; the PR's CI runs Chromium and WebKit. Inspect the current commit's CI result before merge. These are emulated browsers, not physical iPhones or iPads.
- Syntax and whitespace checks apply. No real Google-account test or private data is used for design previews.

Evidence: [mobile-results.json](docs/previews/mobile-results.json), [design-review-results.json](docs/previews/design-review-results.json).

## Still needs real iPhone / iPad / Mac checks

- Safari and installed PWA safe areas, keyboard, text zoom, VoiceOver, clipboard and device orientation.
- Actual English/Mandarin recognition and audible playback, chosen speech speed, background interruption and session recovery.
- Native AMap opening, exact destination/entrance selection, GPS alignment and actual routes.
- Airplane-mode launch/relaunch after normal use and after Safari restart or storage eviction.
- Real photo/HEIC/PDF selection, private Drive upload, offline queue recovery and expired Google-session reconnection without losing local records.
- Service reachability in mainland China. Google sync/uploads, live translation and street tiles depend on reachable external services.

Reliable offline street routing, background turn-by-turn guidance and uninterrupted simultaneous interpretation remain outside the guarantees of this static web app. Design approval does not certify those capabilities.

## Reproduce

Node 20+, `npm ci --ignore-scripts`, `npm run check`, `npm test`. Install development browsers using `npx playwright install --with-deps chromium webkit`, then run `TEST_WEBKIT=1 npm run test:mobile`, `node scripts/review-check.cjs` and `node scripts/design-review-check.cjs`.

To rebuild the bundled previews, use a separate clean v1.6.1 worktree and run `BASELINE_DIR=/absolute/path/to/baseline node scripts/build-review.cjs`, followed by `node scripts/build-design-review.cjs`. Use only the committed synthetic fixture. SVG sources are in `icons/moon-gate.svg` and `icons/imperial-app.svg`; no external image service is used by the app.
