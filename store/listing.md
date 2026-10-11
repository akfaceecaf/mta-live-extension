# Chrome Web Store listing: Where's My Train At?

Answers for the Chrome Developer Dashboard, ready to paste. Written for **v0.0.2 beta**, the build that fetches train data through the Cloudflare Worker relay (MTA developer terms Item 1). Before submitting, replace `<worker>` with the deployed worker URL.

## Package

- Version: `0.0.2` (`version_name`: `0.0.2 beta`)
- Upload: zip of `dist/` after `npm run clean && npm run build`

## Store listing

**Name**

```
Where's My Train At?
```

**Summary** (≤132 chars, same as the manifest `description`)

```
BETA · Upcoming Metro-North train times in a small popup on any page. Unofficial; not affiliated with the MTA.
```

**Category:** Productivity
**Language:** English

**Description**

```
BETA: this is an early test version, so expect rough edges.

Where's My Train At? shows your upcoming Metro-North trains in a small, collapsible popup on any tab you're viewing: departure time, trip length, track, peak/off-peak, and a countdown. Trains leaving soon turn red.

How to use
1. Click the extension icon in your Chrome toolbar.
2. Pick your From and To stations, and set how many minutes ahead a train counts as "departing soon."
3. Open any page. A collapsible popup shows the upcoming trains for your route. Hide it to a small tab on the edge of the screen, and click the tab to bring it back.

Privacy
• No account, no tracking. Your route and settings stay in your browser only.
• Train data is retrieved from MTA's public Metro-North GTFS feeds.

Disclaimer
This is an unofficial app. It is not affiliated with, endorsed by, or licensed by the Metropolitan Transportation Authority (MTA) or Metro-North Railroad. Train information comes from MTA's public data feeds and may not be real time, accurate, or complete. Check official MTA sources before you travel.
```

**Graphics**

- Store icon 128×128: `public/icons/icon-128.png`
- Screenshots (at least 1, 1280×800 or 640×400): popup on a page, expanded "View more" list, settings page
- Small promo tile 440×280 (required)

## Privacy practices

**Single purpose**

```
Shows upcoming Metro-North train departures for the user's chosen route in a small popup on the page they're viewing.
```

**Permission justification: `storage`**

```
Saves the user's From/To stations, "departing soon" minutes, and whether the popup is collapsed, locally on the device so settings persist and stay in sync across tabs.
```

**Host permission justification: `https://<worker>.workers.dev/*`**

```
Fetches Metro-North train times (MTA's public GTFS-Realtime feed, relayed by the developer's server) from the background service worker. No user data is sent.
```

**Content script on all sites (`<all_urls>`)**

```
Shows the train-times popup on whatever page the user is viewing. It renders its own UI in an isolated Shadow DOM and does not read, collect, or change page content.
```

Broad host access triggers an in-depth review, so expect it to take several days.

**Remote code:** No, I am not using remote code.

```
All JavaScript is included in the package. The only network response is protobuf train data, which is parsed as data and never executed.
```

**Data usage:** check none of the data categories. Check all three certifications:
- I do not sell or transfer user data to third parties, outside of the approved use cases
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose
- I do not use or transfer user data to determine creditworthiness or for lending purposes

**Privacy policy URL:** `https://github.com/akfaceecaf/mta-live-extension#privacy` (the README's Privacy section has this text):

```
Where's My Train At? collects no personal data. Your stations and settings are stored only in your browser (chrome.storage.local) and are never sent anywhere. The extension's only network request fetches public Metro-North train data, and it includes no information about you or the pages you visit.
```

## Distribution

- Visibility: Unlisted
- Regions: United States
- Pricing: Free
