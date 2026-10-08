# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

MTA Live is a Chrome extension (Manifest V3) that shows a collapsible box of upcoming Metro-North train times in the corner of whatever page is open. It is built for daily commuters who want upcoming trains on screen without opening the TrainTime app.

- **Scope now:** Metro-North rail only, Chrome only. Subway support and an LED "subway sign" display mode are planned for later. Don't build them unless asked.
- **No backend, no database, no auth.** The extension calls the MTA API directly. User data stays in `chrome.storage.local`.
- **Stack:** React 19, plain CSS, TypeScript, Vite. The user wants frameworks they already know. Only add another library or framework when it's truly needed or gives a big performance gain, and explain why first.
- **The user is learning Chrome extensions.** That's why the build is plain Vite set up by hand rather than an extension framework. When you change extension wiring (manifest, entry points, messaging), briefly explain how that part of Chrome extensions works.

## Commands

```bash
npm run dev        # watch-build both Vite configs into dist/ (runs in parallel via concurrently)
npm run build      # production build into dist/
npm run typecheck  # tsc --noEmit (TypeScript 7)
```

No test runner or linter is set up yet.

Loading the extension: `chrome://extensions` → Developer mode → **Load unpacked** → `dist/`. Watch mode rebuilds files, but Chrome doesn't hot-reload. After changing background or content-script code, reload the extension card and refresh the page.

## Architecture

**Two Vite builds output to the same `dist/` folder.** Both set `emptyOutDir: false`, and `npm run clean` wipes `dist/` first.
- [vite.config.ts](vite.config.ts) uses `root: src/entrypoints` and builds the options page (HTML) and `background.ts`. The output name `background.js` is kept unhashed on purpose because [public/manifest.json](public/manifest.json) refers to it by name.
- [vite.content.config.ts](vite.content.config.ts) builds the content script in library mode as one **IIFE** file, `content.js`. MV3 content scripts can't be ES modules, so this file can't split code into chunks or use dynamic imports. Library mode doesn't replace `process.env.NODE_ENV` on its own, so the config sets it manually with `define`.
- `public/manifest.json` is written by hand and copied as-is. A new entry point means updating both the manifest and the matching Vite config.

**Runtime contexts:**
- `src/entrypoints/content/`: injected into every page (`<all_urls>`). React mounts inside a **Shadow DOM** attached to `#mta-live-root`. Its CSS is imported with `?inline` and added to the shadow root as a `<style>` tag, so page styles and extension styles can't affect each other. Use `:host`-scoped CSS in this folder. Global stylesheets won't reach it.
- `src/entrypoints/background.ts`: MV3 service worker. Chrome can stop it at any time, so don't keep state in module variables. **All MTA network requests go here**, because `host_permissions` covers `api-endpoint.mta.info` and requests from the content script would be blocked by the host page's CORS rules.
- `src/entrypoints/options/`: settings page where the user picks the trains to track. The toolbar icon opens it.

**Shared code in `src/lib/`** (import with the `@/` alias):
- `messaging.ts` defines the typed messages between contexts. To add one: add a variant to `Message`, add its response type to `MessageResponse`, and handle it in the `onMessage` switch in `background.ts`.
- `storage.ts` has typed helpers for `chrome.storage.local`. Use `watchItem` to react when settings change in another context.
- `mta/feed.ts`: `fetchFeed(url)` decodes GTFS-Realtime protobuf with `gtfs-realtime-bindings`. The Metro-North feed is `VITE_MTA_MNR_FEED_URL` (see `.env.example`) and needs no API key. The real-time feed only has trip and stop IDs and delays. Station names, scheduled times, and peak/off-peak status come from MTA **static GTFS** data, which isn't integrated yet.
- `env.ts` gives typed access to `VITE_*` vars. These are built into the bundle, so they must never hold secrets.

**Planned WXT migration:** the `src/entrypoints/` layout follows WXT's naming conventions on purpose. Keep new entry points in that pattern. [README.md](README.md) lists the migration steps.

## UI design

- Design inspiration is the MTA TrainTime app: match its layout, typography, and colors, but **don't copy its assets or logo**.
- In-page box: rounded rectangle, white background. Each train shows: origin → destination, peak/off-peak, track, and departure time (red if departing soon).
