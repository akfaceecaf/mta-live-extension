# MTA Live

A Chrome extension that shows a live display of upcoming Metro-North train times on any page.

**Stack:** React 19, TypeScript, Vite (no extension framework, on purpose, to learn how Chrome extensions work), Manifest V3.

## Getting started

```bash
npm install
cp .env.example .env   # optional, defaults are built in
npm run dev            # rebuilds dist/ on every save
```

Load it in Chrome:

1. Open `chrome://extensions` and turn on **Developer mode** (top right).
2. Click **Load unpacked** and select the `dist/` folder.
3. Open any web page. A small "MTA Live (connected)" box appears in the top-right corner.

After a code change, `npm run dev` rebuilds automatically, but **Chrome doesn't reload it for you**:

- Content script or background changes: click the ↻ reload icon on the extension's card in `chrome://extensions`, then refresh the web page.
- Options page changes: refresh the options tab.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Watch mode build into `dist/` |
| `npm run build` | Production build into `dist/` |
| `npm run typecheck` | Type-check without building |

## How it fits together

```
public/manifest.json          Tells Chrome what the extension contains (copied to dist/ as-is)
src/entrypoints/
  background.ts               Service worker: handles messages, makes network requests
  content/                    Injected into every web page: the on-screen train display
    index.tsx                   Mounts React inside a Shadow DOM (isolates CSS from the page)
    App.tsx, style.css
  options/                    Settings page (right-click the extension icon → Options, or click the icon)
src/lib/
  storage.ts                  Typed chrome.storage.local helpers (user data stays on this device)
  messaging.ts                Typed messages between content script and background
  mta/feed.ts                 Fetches and decodes MTA GTFS-Realtime (protobuf) feeds
  env.ts                      Typed access to VITE_* env vars
```

The **content script** runs inside other websites, so its network requests are subject to that site's rules. It asks the **background worker** to do the work through `chrome.runtime.sendMessage`. The background worker can call the MTA API directly because `manifest.json` grants it `host_permissions`.

There are two Vite configs because Chrome loads content scripts as classic scripts, not ES modules. `vite.content.config.ts` bundles the content script into one self-contained `content.js`. `vite.config.ts` builds everything else.

## Data source

Metro-North real-time data comes from the MTA's [GTFS-Realtime feed](https://api.mta.info/), which doesn't need an API key. The real-time feed only holds trip IDs and delays. Station names and scheduled times come from MTA's static GTFS data, which the MTA features will need to add.

## Migrating to WXT later

The folder layout already matches [WXT](https://wxt.dev) conventions (`src/entrypoints/background.ts`, `content/`, `options/`). To migrate:

1. `npm i -D wxt`, add `wxt.config.ts` with `srcDir: 'src'` and `modules: ['@wxt-dev/module-react']`.
2. Move the `manifest.json` fields into `wxt.config.ts` (`manifest: { permissions, host_permissions }`). WXT generates the rest.
3. Wrap `background.ts` in `defineBackground(() => { ... })`.
4. Replace `content/index.tsx`'s manual Shadow DOM code with `defineContentScript` + `createShadowRootUi`.
5. Delete both Vite configs and `public/manifest.json`, and change the scripts to `wxt` / `wxt build`.
