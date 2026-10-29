# v1.7 Smart Travel implementation

Existing branch `design/jade-night-v1.7`, existing PR #1. No merge or production deployment is authorized. Free static architecture; no backend, billing, new project or OAuth scope.

## Data boundary

The master Sheet remains GET-only under `spreadsheets.readonly`. Existing required tabs and identifiers are retained. The metadata-driven batch additionally imports these optional tabs using their inspected, different headers:

| Tab | Header anchors / retained fields | Destination |
| --- | --- | --- |
| Decision Options | Decision, City, Category, Option, Est. PHP, Use in Budget?, Status, Δ vs Working, Pros, Cons, Price Status, Notes | `savedOptions` |
| Social Media | Platform, Post / Deliverable, Slide / Order, City, Location / Moment, Media Type, Shot / Content, Role, Status, Notes | `socialMedia` |
| Wulong Day Trip | Step, Approx Time, From, To, Transport, Est. Duration, Est. CNY, Status, Fallback / Risk, Notes | `wulong` |
| Shanghai, Chongqing, Chengdu, Beijing | Date / Day, Time, Activity, Area, Transport, Travel Time, Est. CNY, Booking?, Status, Notes | `cityPlans[city]` |

Metadata and bounded private reads were inspected through the existing connected account. No private row snapshot was written to this repository. Runtime app-origin authorization for the extended batch still needs owner-device verification. Missing or changed optional headers keep the previous optional data and report an import note; they do not destroy the required snapshot. Existing core schema failures still reject a refresh atomically.

All local additions live in `smartState` inside the existing `chinaCompanionPrivateV2` snapshot: ticket declarations, manual price updates, route references, conditions, accepted plans, notes, saved nearby choices/proposals, shots and stories. Sheet refresh retains this object. The existing complete private backup includes it and all new imported datasets. Restore merges missing progress and keeps current device choices and the loaded tracker. No credentials are added to the backup allowlist. Existing expense and checklist keys, Drive queue, reserved upload IDs and receipt code are retained.

## Navigation and activity details

Five primary tabs remain Today, Plan, Map, Talk and Wallet. Menu provides four groups and all secondary features. It uses a native modal dialog on compact layouts (focus containment, Escape, close/backdrop, focus return), with a persistent sidebar at 1100px and above.

Plan activity names and the next activity open Overview, Go, Do & Eat, Nearby and Vlog Kit. Completion stays a separate checkbox. History, admission, date, duration, booking requirements, source timestamps and private notes are separate fields. Some fields remain unknown where the source does not supply them.

Ticket states: Free, To Buy, Reserved / Unpaid, Paid, Not Required, Needs Verification. “Booked”, “Must Do” and “Planned” never infer payment. Explicit paid source evidence or an exact same-city paid budget item protects that payment. Local Paid requires a reference or an existing expense association and is labeled a local declaration. It never inserts an expense, changes actual totals, or checks off the visit. A master activity's overall estimated spend is not mislabeled as admission. Published/reference CNY and manual PHP estimates are separate from actual paid amounts. Existing Wallet paid-tracker reconciliation continues to prevent duplicate local spending.

Saved Options preserves historical labels, booked/pay-later records, saved budget selections, pros/cons and original differences. Computed price differences explain that historical options require repricing. Updated Information displays private manually checked references separately; Discover More is distinct and does not silently populate bookings.

## Routes and food

Origins: saved hotel, previous activity, explicit one-shot GPS, or manually named origin. AMap's documented HTTPS URI is used for final navigation. Route handoff is used only with known GCJ-02 endpoints. Raw browser GPS remains WGS-84 and is never silently treated as GCJ-02; otherwise the handoff searches the destination and asks the user to choose origin/mode in AMap. Real tracker coordinates generally do not include a coordinate-system declaration, so destination search is the normal safe fallback.

Walking, Bicycle, Metro, Bus, Train/HSR and DiDi cards show unknown fields explicitly. Users can save dated AMap route references without creating a live-routing claim. Changes of origin/destination invalidate matching manual references. A walking recommendation requires an actual walking-route distance **below** 2km, recent data, safe/scenic/practical conditions and suitable weather. Straight-line proximity, heavy luggage or steep terrain cannot trigger it. DiDi quotations are checked in DiDi; no unsupported DiDi deep link or fabricated fare is used.

Food comes from saved Food rows. Exact saved pairings and beef mentions are prioritized; same-city choices are not mislabeled as verified walking-distance recommendations. No fictional restaurant enters runtime recommendations. Nearby lists saved same-city options with route/time/cost caveats; Save for later and Propose after this stop preserve them locally. Proposals are reviewable in Offline Resources and do not automatically alter the schedule. Automatic geospatial nearby ranking and schedule-fit calculation remain limited by missing verified routing/opening data.

## Conditional plans

January 16 is a complete local recommendation/compare/confirm workflow. Ground coverage, active snowfall, park access, road safety, visibility, transport and practical time/cost are separate observations with a source and timestamp. No forecast is generated months ahead. Before Jan 13, stale/future evidence, wrong-area evidence or missing observations produce Plan C. Fresh evidence can suggest A for scenic ground snow with open/safe/practical access, or B for poor coverage, closure, poor visibility or unsuitable transport.

Plan A uses the saved mountain schedule and never adds Three Natural Bridges. Plan B takes up to two unscheduled saved city stops (or clearly labeled new proposals from the user’s brief if saved choices are exhausted) plus a lunch/transfer/rest buffer, retaining original evening items. All existing itinerary days are excluded from candidate suggestions; Jan 17 is unchanged. The drone show remains conditional. Protected paid/ticketed/confirmed reservation conflicts or absent unscheduled alternatives block Plan B application. Confirmation is required inside the app; cancel has no effect. Acceptance saves a local overlay, never edits the master or books tickets. Changes to the source day or adjacent Jan 17 schedule invalidate the overlay; a newly protected conflicting booking also prevents it from hiding that reservation.

Other scenarios (Shanghai rain, Great Wall visibility, drone cancellation, delayed transfers, closure, overruns and missed reservations) provide source-aware advice. They do not yet generate and apply complete day-specific replacement schedules. This is an explicit partial implementation, not live automated itinerary management.

## Vlog workflow

Vlog Hub is in Menu, with YouTube and IG Stories inside. Date/city/activity chapters and remaining essential shots support the longer YouTube edit. IG has two essential and three optional raw Stories across the whole day, with vertical framing and natural short captions. Social Media import retains all saved carousel and cover ideas.

Per-place Quick Shoot has four essential shots; Full Vlog has eight ordered shots covering arrival, establishing view, walking POV, medium/detail, main highlight, ambient sound, food/experience and reaction. Platform, framing, clip duration and Must/Optional are explicit. Checklists and notes persist offline, separately from visit completion. Both-platform shots suggest a short vertical take if landscape cropping would fail. No media uploads or posting are introduced.

Concise sourced English history/scripts are bundled for Yu Garden, Mutianyu and Chengdu Panda Base. Other places get clearly identified observational prompts until researched; the app does not manufacture histories or dates. There is no paid AI generation.

## Freshness and free-service limitations

- Sheets retains its existing five-minute authorized checks while open.
- Opening a place reevaluates cached price freshness. Manual Refresh Prices/Conditions is throttled for 60 seconds and reports the actual provider/offline limitation without changing `verifiedAt`.
- No reliable CORS-accessible free venue-pricing, mountain snow/closure or DiDi quote integration has been connected. Users follow official sources and record dated observations/references. “Refresh” does not mean these sites were fetched or independently verified.
- Route references expire for recommendation purposes after 24 hours; price references show stale after seven days. Snow evidence uses a 24-hour maximum and a Jan 13–16 decision window. These are conservative app rules, not guarantees of safe conditions.
- Source-checked manual prices retain their applicability, confidence and source; they never overwrite tracker historical prices or actual payment.
- Generic city weather or snowfall probability cannot prove mountain ground snow. No background scheduled condition checks are configured; suggested recheck windows are guidance shown in the app.
- In-app street routing, offline street tiles, background guidance, native turn-by-turn and uninterrupted simultaneous translation remain outside the static app's guarantees.

## Sources consulted

- AMap URI route specification: https://lbs.amap.com/api/uri-api/guide/travel/route
- Shanghai municipal tourism, Yu Garden: https://www.meet-in-shanghai.net/en/huangpu-district/yu-garden-182016/
- Beijing municipal government, Mutianyu: https://english.beijing.gov.cn/travellinginbeijing/attractions/202603/t20260325_4566115.html
- Chengdu Panda Base introduction: https://www.panda.org.cn/en/about/introduction/
- Official Wulong announcements entry point: https://cqwl.gov.cn/

## Physical-device and live-account checks

Before production approval, test actual iPhone Safari/PWA install, safe areas, keyboard, zoom, VoiceOver, drawer focus and clipboard; native AMap destination/mode selection and one-shot GPS; speech recognition/voices/background interruptions; airplane-mode relaunch, storage eviction and backup restore; actual photo/HEIC/PDF upload and Google-session recovery. Verify the extended read-only batch on the existing account, then confirm private saved options, city plans and Social Media imports without changing the Sheet. Exercise existing Google connection/key restrictions, not new projects/scopes. iPad/Mac Safari also needs real hardware checks. Mainland-China reachability remains unverified.
