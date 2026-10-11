# Where's My Train At?

A Chrome extension (beta) that shows upcoming Metro-North train times on any page. Unofficial: not affiliated with, endorsed by, or licensed by the MTA. Train data may not be real time, accurate, or complete.

**Stack:** React 19, TypeScript, Vite (no extension framework, on purpose, to learn how Chrome extensions work), Manifest V3.

## Privacy

Where's My Train At? collects no personal data. Your stations and settings are stored only in your browser (chrome.storage.local) and are never sent anywhere. The extension's only network request fetches public Metro-North train data, and it includes no information about you or the pages you visit.

## Getting started

```bash
npm install
cp .env.example .env   # optional, defaults are built in
npm run dev            # rebuilds dist/ on every save
```

Load it in Chrome:

1. Open `chrome://extensions` and turn on **Developer mode** (top right).
2. Click **Load unpacked** and select the `dist/` folder.
3. Click the extension's toolbar icon (or **Open settings** in the popup) and choose your route, e.g. New Haven → Grand Central.
4. Open any web page. A card with the next live train appears in the top-right corner. **View more** shows the following trains. The › button collapses it to a tab on the screen edge, and clicking the tab brings it back.

After a code change, `npm run dev` rebuilds automatically, but **Chrome doesn't reload it for you**:

- Content script or background changes: click the ↻ reload icon on the extension's card in `chrome://extensions`, then refresh the web page.
- Options page changes: refresh the options tab.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Watch mode build into `dist/` |
| `npm run build` | Production build into `dist/` |
| `npm run typecheck` | Type-check without building |
| `npm run gtfs:sync` | Refresh the MTA timetable snapshot |
| `npm run icons` | Regenerate the extension icon PNGs from `assets/icon.svg` |

## How it fits together

```
public/manifest.json          Tells Chrome what the extension contains (copied to dist/ as-is)
src/entrypoints/
  background.ts               Service worker: handles messages, makes network requests
  content/                    Injected into every web page: the on-screen train display
    index.tsx                   Mounts React inside a Shadow DOM (isolates CSS from the page)
    App.tsx, style.css
  options/                    Settings page (right-click the extension icon → Options, or click the icon)
src/styles/
  tokens.css                  Design tokens: colors, Helvetica type scale, spacing, motion
  base.css                    Reset, typography defaults, layout/text utility classes
src/lib/
  storage.ts                  Typed chrome.storage.local helpers (user data stays on this device)
  settings.ts                 User settings (e.g. "departing soon" minutes) with defaults
  useStoredState.ts           React hook: state saved in chrome.storage and synced across tabs
  useNow.ts                   React hook: current time, refreshed every minute
  trains/                     Display model, line colors, time formatting
  messaging.ts                Typed messages between content script and background
  mta/rail/                   Metro-North: feed decoding (gtfs-realtime-bindings + MTA track extension), timetable lookups, route matching
scripts/sync-gtfs.ts          Regenerates the timetable snapshot (npm run gtfs:sync)
  env.ts                      Typed access to VITE_* env vars
```

The **content script** runs inside other websites, so its network requests are subject to that site's rules. It asks the **background worker** to do the work through `chrome.runtime.sendMessage`. The background worker can call the MTA API directly because `manifest.json` grants it `host_permissions`.

There are two Vite configs because Chrome loads content scripts as classic scripts, not ES modules. `vite.content.config.ts` bundles the content script into one self-contained `content.js`. `vite.config.ts` builds everything else.

## Data source

Two MTA sources, neither needs an API key:

- **Live:** the Metro-North [GTFS-Realtime feed](https://api.mta.info/), which has predicted departure and arrival times and tracks for trains running in the next few hours. The background worker fetches it at most every 30 seconds.
- **Timetable:** MTA's static GTFS zip, used for station names, line names and peak/off-peak. `npm run gtfs:sync` turns it into a small `src/lib/mta/rail/static.json` that ships with the extension. Re-run it when MTA publishes a new schedule.

## Migrating to WXT later

The folder layout already matches [WXT](https://wxt.dev) conventions (`src/entrypoints/background.ts`, `content/`, `options/`). To migrate:

1. `npm i -D wxt`, add `wxt.config.ts` with `srcDir: 'src'` and `modules: ['@wxt-dev/module-react']`.
2. Move the `manifest.json` fields into `wxt.config.ts` (`manifest: { permissions, host_permissions }`). WXT generates the rest.
3. Wrap `background.ts` in `defineBackground(() => { ... })`.
4. Replace `content/index.tsx`'s manual Shadow DOM code with `defineContentScript` + `createShadowRootUi`.
5. Delete both Vite configs and `public/manifest.json`, and change the scripts to `wxt` / `wxt build`.
