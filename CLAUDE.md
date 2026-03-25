# BACON — Project Notes

## Current Status (March 25, 2026)

The project is a personal dashboard hosted on **GitHub Pages** at `tomhusom-sudo/mr-tight-inc`. All pushes go through the working clone at `C:\Users\tomhu\AppData\Local\Temp\bacon_clone` — the iCloud BACON directory has a broken git index and cannot push directly.

### Live Pages
| File | Description |
|------|-------------|
| `dashboard.html` | Main hub — bento grid of all cards |
| `index.html` | Mr. Tight portfolio tracker (stocks/ETFs/crypto) |
| `timmy.html` | Timmy's Corner — Tom's tips + suggested reading |
| `music.html` | Music Picks — editable album picks with iTunes art |
| `rips_dip.html` | Rip's Dip — Pat Ripley's page (MN sports, fishing, crypto, First Ave bands) |
| `tommyschoice.html` | Tommy's Choice — featured pick with live news |
| `journal.html` | Daily Journal — notes + photos + map pin |
| `ainews.html` | AI News — live headlines and videos |
| `helmsdeep.html` | Helm's Deep — Brad's lair (MN sports, Burnsville Jags, etc.) |
| `research.html` | Research — earnings dates, analyst consensus |
| `weather.html` | Weather — 7-day forecast |
| `contacts.html` | Contacts |
| `sync.js` | GitHub Gist cross-device sync module |
| `prices.json` | Static price file — 8 tickers + index values + updated date |
| `favorite_stocks.txt` | Plain-text price list (gitignored in iCloud, committed in bacon_clone) |

---

## What We Built Today (March 25, 2026)

### 1. Rip's Dip Page (`rips_dip.html`)
New page for **Pat Ripley** — bass player from Minnesota, bandmate from Flat Buzz.
- **Live BTC + ETH prices** — fetched from Yahoo Finance via allorigins proxy, shows $ change and %
- **Minnesota Pro Sports** — clickable team cards: Vikings, Timberwolves, Wild, Twins, MN United, Lynx with direct links
- **MN Sports Headlines** — live ESPN RSS feed filtered to MN teams
- **Smallmouth Bass Fishing** — MN DNR links (regulations, Lake Finder), bass tips
- **Fishing Headlines** — live Google News RSS for MN bass fishing
- **First Ave & MN Bands** — curated list: Prince, Replacements, Hüsker Dü, Soul Asylum, Hold Steady, Atmosphere, Hippo Campus, Lizzo with descriptions + First Ave calendar link
- **MN Music Headlines** — live Google News RSS for First Ave/Minneapolis music
- Blue/water color palette (distinct from the green dashboard theme)
- Logo: `higgins.webp` (120px, rounded), falls back to 🎸 emoji

### 2. Dashboard Cards Added
- **Rip's Dip card** — links to `rips_dip.html`, uses `higgins.webp` logo
- **Schneider card** — Maintenance Technician card, full-width row (grid-column: 1/-1), gear+wrench SVG icon. Meant as a home for maintenance/system tools going forward.
- **Sync card** — moved to sit directly under Schneider card (Schneider is full-width, Sync flows below it)

### 3. Price Refreshes
Multiple price refreshes done today. Current `prices.json` values:
```
AA: $56.33 | MSFT: $372.74 | AMZN: $208.00 | BTC: $70,602
NVDA: $175.21 | VOO: $602.45 | VONG: $121.99 | EXE: $108.58
S&P 500: 6,578.47 (+0.34%) | DOW: 46,340.71 (+0.47%) | NASDAQ: 21,860.64 (+0.45%)
```

---

## Key Infrastructure

### Git Workflow
- **Never push from** `C:\Users\tomhu\iCloudDrive\BACON` — git index is broken there
- **Always push from** `C:\Users\tomhu\AppData\Local\Temp\bacon_clone`
- Workflow: edit files in iCloud BACON → `cp` to bacon_clone → commit + push from bacon_clone
- For price refreshes: write `prices.json` to iCloud BACON → `cp` to bacon_clone → bump VER → commit/push

### Cache Busting
- `var VER = 'v=YYYYMMDD[letter]'` at top of `index.html` and `dashboard.html`
- Current VER: `v=20260325c` (index.html) / `v=20260325a` (dashboard.html)
- Increment the letter suffix for each refresh on the same day

### prices.json Structure
```json
{
  "prices": { "AA": 0.00, "MSFT": 0.00, ... },
  "indices": {
    "NASDAQ": { "value": 0.00, "change": 0.00, "pct": 0.00 },
    "DOW":    { "value": 0.00, "change": 0.00, "pct": 0.00 },
    "S&P 500":{ "value": 0.00, "change": 0.00, "pct": 0.00 }
  },
  "updated": "Month DD, YYYY"
}
```

### Cross-Device Sync (`sync.js`)
- Uses a **private GitHub Gist** as backend (no server needed)
- Syncs: music picks, Timmy's tips, Timmy's articles
- Setup: enter GitHub PAT (gist scope only) in the Sync card modal → auto-finds or creates the Gist
- `findOrCreate()` searches user's gists for `bacon_dashboard.json` — same token on any device reconnects automatically
- **Note:** User needs to re-enter sync token — was discussed but not completed this session

### Live Data Sources
- **Stock/ETF prices**: Yahoo Finance via `https://api.allorigins.win/raw?url=` CORS proxy (+ corsproxy.io + codetabs fallbacks)
- **Crypto prices**: Same proxy → Yahoo Finance `BTC-USD`, `ETH-USD`
- **News/RSS**: allorigins → corsproxy.io → codetabs fallback chain (7s timeout each)
- **Weather**: Open-Meteo API (no key needed), location 45.4647/-98.4865 (Aberdeen, SD)
- **Album art**: iTunes Search API (`itunes.apple.com/search`) — cached to localStorage as `coverUrl`

---

## Image Assets
| File | Used In |
|------|---------|
| `lincoln.jpg` | Dashboard background |
| `guitar_lincoln.png` | Music Picks card + page background |
| `higgins.webp` | Rip's Dip logo |
| `rips_dip.png` | (also in repo, replaced by higgins.webp as logo) |
| `spackler.webp` | Helm's Deep card |
| `angry_lincoln.png` | Available, unused |
| `pyramid.png` | Available, unused |

---

## Dashboard Card Order (dashboard.html)
1. Mr. Tight (featured, span 2) + Tommy's Choice
2. News Feed + Research + Weather
3. AI News + Helm's Deep + Timmy's Corner
4. Daily Journal + Rip's Dip + Music Picks
5. Schneider (full width, span 3)
6. Sync

---

## Original Roadmap (still valid)
### Goal: Replace dummy holdings data with real Fidelity/Robinhood CSV imports
- **Phase 1** — CSV parser (Fidelity + Robinhood → common schema)
- **Phase 2** — In-browser drag-and-drop file import on `index.html`
- **Phase 3** — Replace manual price refresh with real API (Yahoo Finance / Alpha Vantage)
- **Phase 4** — Portfolio pie chart, sparklines per row, day change column, total day P&L
- **Phase 5** — localStorage persistence, manual field overrides, notes/tags per position

### Currently using dummy data for:
All holdings quantities and avg costs except **BTC: 0.5 BTC @ $54,846.21** (real)

---

## Conventions
- Dark theme: `#0a0e17` background, `#22c55e` / `#4ade80` green accent
- Font: Inter (body throughout), Rajdhani only in legacy stocks.html
- Gains: `#4ade80` green · Losses: `#f87171` red
- All prices USD, `tabular-nums` formatting
- Card style: `border-radius: 22px`, `rgba(255,255,255,0.04)` background, green border on active/hover
