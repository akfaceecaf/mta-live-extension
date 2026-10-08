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
- `src/entrypoints/options/`: settings page. Currently has the "departing soon" threshold; picking the trains to track comes later. The toolbar icon opens it.

**Shared code in `src/lib/`** (import with the `@/` alias):
- `messaging.ts` defines the typed messages between contexts. To add one: add a variant to `Message`, add its response type to `MessageResponse`, and handle it in the `onMessage` switch in `background.ts`.
- `storage.ts` has typed helpers for `chrome.storage.local`. Use `watchItem` to react when settings change in another context.
- `settings.ts`: the `Settings` type, `DEFAULT_SETTINGS`, and the `useSettings()` hook. Settings are stored under the `settings` key and merged over the defaults, so adding a new setting needs only a new field and a default. Saving on the options page updates open popups immediately.
- `mta/feed.ts`: `fetchFeed(url)` decodes GTFS-Realtime protobuf with `gtfs-realtime-bindings`. The Metro-North feed is `VITE_MTA_MNR_FEED_URL` (see `.env.example`) and needs no API key. The real-time feed only has trip and stop IDs and delays. Station names, scheduled times, and peak/off-peak status come from MTA **static GTFS** data, which isn't integrated yet.
- `env.ts` gives typed access to `VITE_*` vars. These are built into the bundle, so they must never hold secrets.
- `trains/`: the **display model** the UI renders (`Trip`, `Departure` in `types.ts`), line names and colors (`lines.ts`), and time formatting (`format.ts`). The UI currently runs on **example data** from `mockTrip.ts` (Grand Central → New Haven, times relative to now). Real MTA data should be mapped into these same types, so components don't need to change.

**Planned WXT migration:** the `src/entrypoints/` layout follows WXT's naming conventions on purpose. Keep new entry points in that pattern. [README.md](README.md) lists the migration steps.

## UI design

**CSS system:** `src/styles/tokens.css` (design tokens) and `src/styles/base.css` (reset, typography, `.stack`/`.row`/`.label`/`.numeric`/`.badge` utilities). Each entry point's `style.css` `@import`s both. Rules:
- Use the **semantic** tokens (`--color-text`, `--color-departing-soon`, …) in components, not the raw palette or hard-coded values. A future LED "subway sign" mode should only need to override semantic tokens.
- Use px, not rem: in the content script, rem follows the host page's `<html>` font size.
- Tokens are declared on `:root, :host` so they work in both the options page and the Shadow DOM.
- **Host-page isolation:** `base.css` sets `:host { all: initial !important }` and applies typography to `:host > *`, not `:host`. The host element is in the page's own HTML, so rules like `* { font-family: x !important }` reach it and would otherwise be inherited by everything inside the shadow root. Don't move inherited styles back onto `:host`.
- **Font is Helvetica** (`--font-sans`), using the copy installed on the system. **Light mode only** for now. Don't add dark mode unless asked.

**Look and feel:** inspired by the MTA TrainTime app. Match its layout, typography, spacing, and colors, but **don't copy its assets or logo**. From the reference screenshot:
- Light-gray list background (`--color-surface-muted`) with white rounded train cards.
- Each card: bold departure time range with tabular numbers (`--text-lg`, `.numeric`) followed by the trip length in muted text, e.g. "(21 min)". Below that, a colored line badge (`.badge` with `--badge-color: var(--line-*)`), then "Off Peak" / "Peak" and "in N min" in small muted text. Track number at the top right.
- Required details per train: origin → destination, peak/off-peak, track, departure time (red, `--color-departing-soon`, if departing soon).

**In-page popup** (`src/entrypoints/content/`): white rounded card, 320px wide, top-right corner. On windows under 480px it stretches across the top.
- **Collapsible:** the hide button slides the popup off the right edge and leaves a blue tab at the screen edge. Clicking the tab brings it back. The collapsed state is saved with `useStoredState('ui.collapsed')`, so it's shared across tabs and survives reloads. The component renders nothing until the saved state loads, which avoids a flash of the wrong state.
- **Upcoming train:** a departure within the user's **"departing soon" setting** (`upcomingThresholdMin`, default **30 min**, range 1–120, set on the options page) shows its time and countdown in red. While one exists, the collapsed tab shakes briefly every 4s and shows a red dot. The dot is the cue that remains when the user has reduced motion turned on.
- **Layout:** header (origin → destination, hide button), departure cards (`components/DepartureCard.tsx`) on the gray list background, a "View N more" / "Show less" toggle, and a footer. **Compact by default:** only the next train shows, so the popup takes little screen space. "View more" expands to at most 5 departures, scrolling if needed. The expanded state is per page (not saved), so every page starts compact. Trains that have already left are dropped. `useNow()` re-renders at each minute boundary so countdowns stay current.
- State is driven by `data-collapsed` / `data-upcoming` attributes on `.mta-live`, so CSS handles all the visuals. The shake animates `translate` so it doesn't conflict with the slide, which animates `transform`.

## Revisit later

- **Collapsed tab design:** make it more obviously a *train* notification (the current blue tab with a chevron doesn't say "train"), and make it take up less of the screen.
