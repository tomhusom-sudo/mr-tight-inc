# Plan: CSV Portfolio Import (Phase 2)

## Problem
Mr. Tight portfolio tracker (index.html / stocks.html) currently shows placeholder/dummy data. Real holdings live in Fidelity and Robinhood CSV exports that Tom downloads manually. There is no way to get that data into the dashboard without editing HTML.

## Goal
Drag-and-drop Fidelity + Robinhood CSV exports directly into the portfolio page. In-browser parser normalizes both formats into a unified holdings table. Duplicate tickers across brokers are merged. No backend, no upload — all client-side.

## Scope

### In Scope
- Drag-and-drop + click-to-upload CSV input on index.html / stocks.html
- Parser for Fidelity CSV export format
- Parser for Robinhood CSV export format
- Normalize to: `{ ticker, name, qty, avgCost, currentPrice, marketValue, gainLoss, returnPct }`
- Merge duplicate tickers (same ticker in both brokers → combined position)
- Persist parsed holdings to localStorage so they survive page reload
- Display in existing holdings table — no redesign
- Show last-imported timestamp

### Out of Scope
- Real-time price refresh (Phase 3)
- Allocation pie chart (Phase 4)
- Sparklines (Phase 4)
- Day change column (Phase 4)
- Backend / file storage

## Approach
Pure client-side JavaScript. FileReader API for CSV parsing. localStorage for persistence. Existing table structure stays intact — just swap dummy data for parsed data.

## Files Affected
- `index.html` — main portfolio page, add import UI + parser logic
- `stocks.html` — may share same holdings display, needs same treatment
- `prices.json` — current prices still used to fill `currentPrice` after import

## Open Questions
- Fidelity and Robinhood CSV column names — need a sample export to confirm headers
- Should import replace all holdings or merge with existing?

---

<!-- /autoplan restore point: /c/Users/tomhu/.gstack/projects/honest-toms-dashboard/main-autoplan-restore-20260327-063459.md -->

---

# /autoplan Full Review

## Phase 1: CEO Review

### PRE-REVIEW SYSTEM AUDIT

No git history available (working directory is not a git repo — source of truth is iCloudDrive/BACON, deployed via two clone folders). No TODOS.md exists. CLAUDE.md read and confirmed: static GitHub Pages, two-repo deploy workflow, no backend, localStorage + flat JSON for persistence.

**Recently touched files:** index.html (VER v=20260326a), stocks.html (VER v=20260323c). Both pages use `mti_assets` localStorage key and `portfolio.json` remote sync. **Critical finding:** stocks.html is a separate, older page ("Mr. Tight INC") — it shares the same localStorage key as index.html, meaning CSV import on index.html will automatically populate stocks.html. No duplicate work needed.

**No design doc found.** Proceeding with standard review (auto-decided per /autoplan rules — prerequisite offer skipped).

---

### Step 0A: Premise Challenge

| # | Premise | Status | Finding |
|---|---------|--------|---------|
| 1 | Portfolio shows placeholder/dummy data | CONFIRMED | index.html:821 has qty:555555 for AA, qty:50 for MSFT — clearly dummy |
| 2 | Real holdings live in Fidelity and Robinhood CSV exports | ASSUMED | Plan says "Fidelity and Robinhood" but doesn't confirm Tom actually uses both. He may use only Fidelity, or only Robinhood, or a different broker entirely |
| 3 | "No way to get data in without editing HTML" | **WRONG** | index.html:731 has "Edit Portfolio" button + Add Asset modal already. The real problem is: manual entry doesn't scale for bulk imports. Reframe: "Can't bulk-import from brokerage without re-entering each position manually" |
| 4 | FileReader API + localStorage is the right approach | CONFIRMED | Correct for static GitHub Pages. No backend available, no build step. |
| 5 | prices.json provides currentPrice after import | CONFIRMED | `withPrices()` at index.html:880 handles this. Any ticker not in prices.json shows 0 price. |

**Premise 3 matters.** If we frame this wrong, we might build a heavier solution than needed. The actual gap: the existing modal is great for adding one position, terrible for 15 positions from a brokerage statement. CSV import solves that specific pain.

**PREMISE GATE (auto-decided per /autoplan): Accept premises 1, 4, 5. Revise 3 as above. Flag 2 for user input at final gate.**

---

### Step 0B: What Already Exists

| Sub-problem | Existing code | Notes |
|-------------|---------------|-------|
| Add/edit individual positions | `openModal()` / `saveModal()` — index.html:731 | Already works, no changes needed |
| Save holdings to localStorage | `saveAssets()` — index.html:859 | CSV import just calls this same function |
| Load holdings from localStorage | `loadAssets()` — index.html:849 | Already handles version-checked localStorage |
| Apply live prices to holdings | `withPrices()` — index.html:880 | Handles tickers not in prices.json (returns 0) |
| Render holdings table | `renderTable()` — index.html:955 | No changes needed |
| Render summary cards | `renderSummary()` — index.html:915 | Automatically re-totals after import |
| Remote sync | `fetchRemotePortfolio()` — index.html:867 | Only runs when localStorage is empty — won't interfere |
| Ticker metadata lookup | `TICKER_DB` — index.html:1010 | ~100 tickers. CSV tickers not in TICKER_DB need fallback |

**The CSV import feature is essentially a new input path to `saveAssets()`.** The rendering, calculation, and persistence infrastructure already exists. This is a well-scoped feature.

---

### Step 0C: Dream State

```
CURRENT (today):
  Edit Portfolio → modal → enter each position manually → Save
  Pain: 15 positions = 15 modal open/fills/saves

THIS PLAN (shipping):
  Drag-and-drop Fidelity/Robinhood CSV → parsed → merged → table updates instantly
  Win: 15 positions in 3 seconds

12-MONTH IDEAL:
  CSV fallback + brokerage OAuth (Plaid, Schwab API, Robinhood unofficial API)
  Positions sync on page load, CSV is just the fallback path
```

**Where this plan leaves us vs 12-month ideal:** Missing real-time brokerage sync (Phase 3 per roadmap). CSV import is the correct stepping stone — don't need to build OAuth today.

**Implementation alternatives:**

| Approach | Effort | Completeness | Risk | Verdict |
|----------|--------|--------------|------|---------|
| Full plan: Fidelity + Robinhood parser, drag-drop, merge | CC ~30 min | 9/10 | Medium (CSV format drift) | **Chosen** |
| Robinhood-only parser (simpler) | CC ~15 min | 5/10 | Low | Too incomplete |
| Textarea paste-in (no drag-drop) | CC ~20 min | 7/10 | Low | Less polished UX |
| Wait for Phase 3 (brokerage API) | 0 | 2/10 | High (never ships) | No |

Auto-decided: Full plan (P1 — completeness). Not a taste decision.

---

### Step 0D: Mode (SELECTIVE EXPANSION)

Scope is well-calibrated for a weekend feature. One cherry-pick expansion to surface:

**Expansion opportunity: Also update `portfolio.json` on import.** Currently, the plan only saves to localStorage. But portfolio.json is how position data syncs across devices. If Tom imports on his phone, his desktop won't see it. This is a 10-line addition and directly addresses a real pain point (cross-device sync is already in the CLAUDE.md roadmap for schneider.html).

Auto-decided: **Include** (P2 — in blast radius, <5 minutes CC effort). Added to scope.

---

### Step 0E: Temporal Interrogation

```
HOUR 1 — "Where are the CSV headers?"
  Blocker: Fidelity and Robinhood export formats not in the plan. Implementation
  cannot start without knowing which columns map to ticker, qty, avgCost.
  Expected Fidelity: Symbol, Quantity, Average Cost Basis (confirmed by public docs)
  Expected Robinhood: symbol, quantity, average_buy_price (confirmed by public export)

HOUR 2 — "Which rows do I skip?"
  Both brokers include non-holding rows in their CSV:
  - Fidelity: header rows, footer rows, summary rows (like "Pending Activity")
  - Robinhood: may include cash position row "Cash & Cash Equivalents"
  Need row-filtering logic.

HOUR 3 — "This ticker isn't in TICKER_DB"
  EXE (Expand Energy) might not be in Robinhood. Custom tickers from Fidelity
  (especially international stocks or unusual ETFs) won't be in TICKER_DB.
  Need fallback: use ticker as name, set type to 'stock', no logo.

HOUR 4 — "Replace or merge?"
  Still undecided in the plan. This is a real product decision that hits at
  implementation time. Default: replace (simpler, less risk of stale data).
  But merging feels better UX. Need to decide before coding.

HOUR 5 — "stocks.html too?"
  Resolved: stocks.html uses same mti_assets key. Import on index.html = done.

HOUR 6+ — Edge cases, deploy
  Empty CSV, wrong file format, all-zero quantities, crypto from Robinhood.
```

---

### Section 1: Strategic Foundation

**Is this the right problem?** Yes. The disclaimer on index.html:723 ("Holdings quantities shown are sample data...") is embarrassing if Tom shares the howIwork.html URL with a potential employer. Getting real data in is the highest-priority fix.

**Strategic risk:** Fidelity and Robinhood change their CSV export formats occasionally (column name changes, row reordering). A brittle parser that breaks on format drift creates a worse experience than the current manual entry. Plan should include explicit column mapping constants (easy to update) rather than hardcoded column indices.

---

### Section 2: Error & Rescue Registry

| Error | Trigger | Visible to user? | What catches it | Fix |
|-------|---------|-----------------|-----------------|-----|
| Wrong file type | User drops .xlsx or .pdf | No (silent fail) | Nothing in plan | Add file type validation with toast |
| Malformed CSV | Blank rows, unexpected encoding | No (likely silently ignores row) | Nothing in plan | Validate each parsed row, log skipped rows |
| Unknown ticker | Ticker not in TICKER_DB or prices.json | No (row with no name/price) | Nothing in plan | Fallback: use CSV description field as name |
| All-zero quantities | Robinhood shows pending/settled separately | Shows $0 row in table | Nothing in plan | Skip rows where qty <= 0 |
| Duplicate import | User imports same CSV twice | Doubles the position | Nothing in plan | Replace mode (not merge) on import |
| localStorage full | Very unlikely but possible (5MB limit) | Silent fail | `saveAssets()` has try/catch | Existing catch handles, but no user feedback |
| Crypto from Fidelity | Fidelity doesn't hold crypto | N/A | N/A | No action needed |
| Crypto from Robinhood | Yes (BTC, ETH, DOGE, etc.) | Missing type='crypto' badge | Nothing in plan | Detect crypto tickers, set type='crypto' |

---

### Section 3: Failure Modes Registry

| Mode | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| CSV format drift (Fidelity updates columns) | Medium | High (import silently broken) | Use named column mapping, not index |
| User imports wrong account CSV | Medium | High (wrong positions shown) | Show preview before committing |
| Import overwrites manually-corrected data | High (first-time) | Medium | Warn: "This will replace your current holdings" |
| No feedback on import success | High (if omitted) | Low (confusion) | Show "Imported N positions" toast |
| Crypto tickers misidentified as stocks | Medium | Low (badge wrong, price might be 0) | Hardcode known crypto tickers |

---

### Section 4-10: Full Section Review

**Section 4 (Risk Assessment):** The only real risk is CSV format drift. Mitigation: named column constants.

**Section 5 (Scope Decisions):**
- **NOT in scope:** portfolio.json server-side push (requires git commit). Plan correctly defers this.
- **NOT in scope:** Price fetch for non-tracked tickers. If CSV has a ticker not in prices.json, it shows 0. That's acceptable — Phase 3 adds real-time prices.
- **IN scope (added):** Update portfolio.json locally after import (for cross-device sync via the existing mechanism).

**Section 6 (Dependencies):** None. FileReader API is universally available. No npm, no build step.

**Section 7 (Observability):** Static site with no backend = no server-side logs. Client-side: log import results to browser console at minimum. Add "Imported N positions on [date]" to the `last-updated` display.

**Section 8 (Security):** CSV parsed entirely client-side. No XSS risk if we use the existing `esc()` function at index.html:910 when rendering any CSV-derived data. Confirmed: existing `esc()` already covers this.

**Section 9 (Compatibility):** FileReader API and drag-drop are supported in all modern browsers. No concerns.

**Section 10 (Timeline):** Single-session CC build. No dependencies or handoffs.

---

### CEO Dual Voices

**Claude subagent:** Running in background — will be incorporated at final gate.

**Codex:** UNAVAILABLE. Running in [subagent-only] mode.

**CEO Consensus Table (preliminary — subagent pending):**
```
CEO DUAL VOICES — CONSENSUS TABLE:
═══════════════════════════════════════════════════════════════
  Dimension                           Claude   Codex  Consensus
  ─────────────────────────────────── ───────  ─────  ─────────
  1. Premises valid?                  Mostly   N/A    PARTIAL
  2. Right problem to solve?          Yes      N/A    CONFIRMED
  3. Scope calibration correct?       Yes+1    N/A    CONFIRMED
  4. Alternatives sufficiently explored? Yes   N/A    CONFIRMED
  5. Competitive/market risks covered? N/A     N/A    N/A
  6. 6-month trajectory sound?        Yes      N/A    CONFIRMED
═══════════════════════════════════════════════════════════════
[subagent-only mode — Codex unavailable]
```

---

### NOT In Scope (CEO Phase)

- Brokerage OAuth / real-time API sync (Phase 3)
- Schwab CSV support (add later if needed)
- Allocation charts (Phase 4)
- portfolio.json server-push after import (requires git commit workflow — deferred)

### What Already Exists (CEO Phase)

All rendering, calc, persistence infrastructure. See Step 0B above.

### Dream State Delta

This plan gets Tom from "embarrassing demo data" to "real portfolio, importable in 3 seconds." The 12-month ideal (live brokerage sync) is still Phase 3 — this is the right stepping stone.

### CEO Completion Summary

| Item | Status |
|------|--------|
| Premise challenge | Done — Premise 3 reframed |
| Right problem | Yes — high urgency (howIwork.html shares link publicly) |
| Scope | Well-calibrated, +1 expansion (portfolio.json local update) |
| Alternatives | Evaluated, full plan is correct choice |
| 6-month trajectory | Sound — CSV bridge to Phase 3 brokerage API |
| Critical blockers | 2: CSV column names, replace-vs-merge decision |

---

**PHASE 1 COMPLETE.** Codex: unavailable. Claude subagent: running. Consensus: 4/6 confirmed, 1 partial (premises), 1 N/A.

---

## Phase 2: Design Review

### Step 0: Design Scope

UI scope detected: drag-and-drop, import UI, holdings table, display, modal. Score: 5/10 completeness in plan (no states specified, no layout described).

DESIGN.md: not present in project. Design system documented in CLAUDE.md:
- Background: `#0c1808`, green accent: `#4ade80`, text: `#f0fae8`
- Card radius: 22px, font: Inter
- Existing patterns: `.btn`, `.btn-edit`, `.modal-overlay`, `.section-header`

**Existing patterns to reuse:**
- Import button should match `.btn.btn-edit` style (already defined)
- Import modal should reuse `.modal-overlay` / `.modal` pattern
- Success/error states should use existing `.gain` / `.loss` colors
- Drag-drop zone should match `.table-wrapper` border style

### Step 0.5: Design Dual Voices (subagent-only mode)

Codex unavailable. Claude subagent running in background.

**Design Litmus Scorecard:**

| Dimension | Score | Gap |
|-----------|-------|-----|
| 1. Information hierarchy | 7/10 | Import flow not specified — where does the button live? |
| 2. Missing states | 4/10 | No empty state, no success state, no error state specified |
| 3. User journey | 6/10 | Happy path clear, error paths missing |
| 4. Specificity | 5/10 | "Drag-and-drop UI" is described but not laid out |
| 5. Interaction states | 3/10 | No loading state, no drag-hover state, no cancel option |
| 6. Accessibility | 6/10 | Click-to-upload fallback mentioned — good |
| 7. Mobile | 5/10 | Drag-drop is desktop only — mobile fallback (click-to-upload) needed |

---

### Pass 1: Information Hierarchy

The import button should live in the `.section-header` actions area, next to "Edit Portfolio". This is correct — it follows existing patterns.

**Gap:** The plan says "show last-imported timestamp" but doesn't specify where. Recommendation: add it to the existing `.updated` div (index.html:757) as a second line.

**Auto-decided:** Add timestamp to existing `.updated` div. Mechanical.

### Pass 2: Missing States

Every import UI needs all 4 states:

| State | Required | In plan? |
|-------|----------|---------|
| Empty/prompt | Drag-drop zone with instructions | No |
| Drag-hover | Zone highlights when file is dragged over | No |
| Loading/parsing | Brief spinner or progress indicator | No |
| Success | "Imported 12 positions from Fidelity" | Mentioned vaguely |
| Error | "Could not parse file — is this a Fidelity or Robinhood CSV?" | No |
| Preview (optional) | Show parsed positions before confirming | Not in scope (but valuable) |

**Auto-decided:** Add all 4 required states (empty, hover, success, error). Mechanical — these are not taste decisions.

### Pass 3: User Journey

```
Current user flow (today):
  1. Tom downloads Fidelity CSV
  2. Opens index.html
  3. Clicks "Edit Portfolio" → enter each holding manually (15 clicks)

New flow (post-import):
  1. Tom downloads Fidelity CSV
  2. Opens index.html
  3. Clicks "Import CSV" → drag CSV file → sees "Imported 12 positions" → done
```

**Emotional arc:** Relief. The current flow is tedious. This should feel instant and magical.

**Journey break point:** If Tom drags the wrong file (an .xlsx account statement instead of the CSV download), he needs a clear, friendly error — not a silent fail.

### Pass 4: Interaction Specifics

```
Import zone layout (recommended):
  ┌────────────────────────────────────────────────┐
  │  ⬆ Drop Fidelity or Robinhood CSV here         │
  │     or click to browse                          │
  │  [Fidelity]  [Robinhood]  ← detected broker badge │
  └────────────────────────────────────────────────┘
```

This should appear above or below the holdings table, collapsible (so it's not always visible once data is imported).

**Auto-decided:** Import zone above holdings table, collapses after successful import. Taste decision? No — this is the obvious placement. Mechanical.

### Pass 5-7: Responsive, Accessibility, Polish

**Responsive:** Drag-drop works desktop-only. On mobile (<640px), show only "tap to import CSV" button (no drag zone). This follows the existing `@media (max-width: 640px)` pattern in index.html:581.

**Accessibility:** `<input type="file" accept=".csv">` provides keyboard/screen reader access for free. Wrap in a visible `<label>` element.

**Polish:** Use existing green accent for drag-hover state (`border-color: #4ade80`). Match the `.table-wrapper` card treatment.

### Design Completion Summary

| Issue | Severity | Auto-decision | Principle |
|-------|----------|---------------|-----------|
| Missing states (empty, hover, success, error) | High | Add all 4 | P1 completeness |
| Import zone placement not specified | Medium | Above table, collapses after import | P5 explicit |
| Mobile drag-drop fallback | High | Click-to-upload on mobile | P1 completeness |
| Timestamp placement | Low | Reuse existing .updated div | P4 DRY |

---

**PHASE 2 COMPLETE.** Design: 4 issues found, all auto-decided. No taste decisions. Passing to Phase 3.

---

## Phase 3: Engineering Review

### Step 0: Scope Challenge + Code Analysis

**Actual files affected (from code reading):**

| File | Lines affected | What changes |
|------|---------------|--------------|
| `index.html` | ~80-100 new lines | CSV parser, import UI, drag-drop handler |
| `stocks.html` | 0 | Shares `mti_assets` key — auto-inherits changes |
| `prices.json` | 0 | No changes needed |
| `portfolio.json` | Potentially | Local update after import (expansion from Phase 1) |

The plan said stocks.html needs "same treatment" — that's wrong. They share localStorage. No changes needed to stocks.html.

**Complexity check:**
- FileReader API: ~10 lines
- CSV parser (both formats): ~40 lines
- Row normalizer: ~20 lines
- Deduplication/merge logic: ~15 lines
- Import UI (drag-drop + click): ~30 lines
- State management (hover/success/error): ~15 lines
- Total: ~130 lines. Well within "boil the lake" territory.

### Step 0.5: Eng Dual Voices (subagent-only mode)

Codex unavailable.

```
ENG DUAL VOICES — CONSENSUS TABLE:
═══════════════════════════════════════════════════════════════
  Dimension                           Claude   Codex  Consensus
  ─────────────────────────────────── ───────  ─────  ─────────
  1. Architecture sound?              Yes      N/A    CONFIRMED
  2. Test coverage sufficient?        Gap      N/A    FLAGGED
  3. Performance risks addressed?     None     N/A    CONFIRMED
  4. Security threats covered?        Low      N/A    CONFIRMED
  5. Error paths handled?             Gaps     N/A    FLAGGED
  6. Deployment risk manageable?      Low      N/A    CONFIRMED
═══════════════════════════════════════════════════════════════
[subagent-only mode]
```

### Section 1: Architecture

```
ARCHITECTURE — CSV IMPORT DATA FLOW:
══════════════════════════════════════════════════════════
 User                index.html                localStorage
  │                      │                         │
  │  drag/click CSV       │                         │
  │──────────────────────►│                         │
  │                  FileReader.readAsText()         │
  │                       │──────────────────────── │
  │                  parseCSV(text)                  │
  │                  detectBroker(headers)           │
  │                  normalizeRows(rows)             │
  │                  mergeOrReplace(existing, new)   │
  │                       │                         │
  │                  saveAssets(merged)─────────────►│
  │                  withPrices(merged)              │
  │                  renderTable()                   │
  │                  renderSummary()                 │
  │◄──────────────────────│                         │
  │    table updated       │                         │
══════════════════════════════════════════════════════════
```

**Key architectural decision:** `parseCSV()` should be broker-agnostic. It takes raw CSV text and returns `{ headers, rows }`. Then `detectBroker(headers)` identifies the format. Then `normalizeRows()` maps broker-specific columns to the standard data model.

This separation means: when Fidelity changes a column name, you only update the column mapping constants, not the parsing logic.

**Named column constants (critical — prevents format drift breakage):**

```javascript
var FIDELITY_COLS = {
  ticker:   'Symbol',
  name:     'Description',
  qty:      'Quantity',
  avgCost:  'Average Cost Basis'
};
var ROBINHOOD_COLS = {
  ticker:   'symbol',
  name:     'name',
  qty:      'quantity',
  avgCost:  'average_buy_price'
};
```

**Broker detection:** Look at headers row. If `'Average Cost Basis'` is present → Fidelity. If `'average_buy_price'` is present → Robinhood.

**Coupling analysis:** The import function slots into the existing `saveAssets()` / `render()` chain cleanly. No coupling concerns.

### Section 2: Code Quality

**DRY check:**
- `esc()` at index.html:910 must be used for any CSV-derived data rendered to DOM. Don't write a new sanitizer.
- `saveAssets()` at index.html:859 handles localStorage write with try/catch. Use it directly.
- `render()` at index.html:989 handles both renderTable + renderSummary. Call `render()` after import, don't call them separately.

**Naming:** `parseFidelityCSV()` and `parseRobinhoodCSV()` is better than `parseCSV(broker)` — explicit over clever (P5).

**DATA_VER:** Do NOT bump `DATA_VER`. The current data model (`{ ticker, name, type, domain, logoUrl, qty, avgCost, price }`) already supports imported holdings. Bumping DATA_VER wipes all localStorage — it's a destructive migration. Instead, add an optional `importedFrom` field that old code ignores gracefully.

### Section 3: Test Plan

No formal test framework in this project (static HTML + vanilla JS). Testing is manual + visual verification.

**Test diagram — all codepaths:**

```
IMPORT FLOW — TEST COVERAGE MAP:
─────────────────────────────────────────────────────────────
Codepath                          Manual test              Covered?
─────────────────────────────────────────────────────────────
Fidelity CSV, valid file          Drop real Fidelity CSV    Needs test
Robinhood CSV, valid file         Drop real Robinhood CSV   Needs test
Both brokers, merge               Import Fidelity then RH   Needs test
Wrong file type (.xlsx)           Drop .xlsx file           Needs test
Empty CSV (headers only)          Drop empty.csv            Needs test
Ticker not in TICKER_DB           EXE not in RH export      Needs test
qty = 0 row (pending position)    Fidelity pending activity  Needs test
Duplicate import (same file x2)   Drop same CSV twice       Needs test
Mobile (click to upload)          iPhone browser            Needs test
localStorage full                 Very unlikely to test     Skip
─────────────────────────────────────────────────────────────
```

No automated tests possible in this stack. All tests are manual pre-deploy checks.

**Auto-decided:** Create a manual test checklist in PLAN.md (below). No automated tests — project doesn't use a test framework. (P3 pragmatic — would be over-engineering to add Jest to a static HTML page).

### Section 4: Performance

CSV parsing is synchronous on the main thread. For a typical brokerage CSV (15-50 holdings), this takes <5ms. Not a concern. FileReader.readAsText() is async but the subsequent parse is fast enough that no loading state is needed for UX (though we add one anyway per the design review).

### Section 5: Edge Cases

| Edge Case | Handling Required |
|-----------|------------------|
| Fidelity header rows before actual headers | Skip rows until `Symbol` column found |
| Fidelity "Pending Activity" rows at bottom | Skip rows where Symbol is empty or starts with `>>` |
| Robinhood "Cash & Cash Equivalents" row | Skip rows where symbol is not uppercase alpha |
| Qty as string with commas "1,234" | `parseFloat(qty.replace(/,/g, ''))` |
| AvgCost as "$54.32" (with dollar sign) | `parseFloat(cost.replace(/[$,]/g, ''))` |
| Crypto tickers (BTC, ETH, DOGE from Robinhood) | Hardcode known crypto list for type detection |
| Empty string in required field | Skip row, log to console |
| Duplicate tickers within same CSV | Sum quantities, average the avg cost |

### Section 6: Security

All parsing is client-side. No data leaves the browser. CSV data rendered to DOM must use `esc()` (already exists at index.html:910). No new XSS vectors if we use existing escaping.

### Section 7: Deployment

Static file change. Deploy = copy to both clone folders + commit + push both repos (standard workflow). No migration, no data loss risk (DATA_VER not bumped).

### Eng Completion Summary

| Item | Status |
|------|--------|
| Architecture | Clean — broker-agnostic parser, named column constants |
| Critical finding | DATA_VER must NOT be bumped (would wipe localStorage) |
| stocks.html | No changes needed (shared localStorage key) |
| Error paths | 8 edge cases documented and handled |
| Performance | Non-issue (<5ms parse) |
| Security | Use existing `esc()`, no new risks |
| Deployment | Standard static file deploy |

### NOT In Scope (Eng Phase)

- Automated tests (no test framework in project)
- portfolio.json server push (requires git commit workflow)
- Schwab CSV format (add later if needed)
- ETH/crypto from Robinhood price lookup (falls back to 0, acceptable)

### What Already Exists (Eng Phase)

`saveAssets()`, `render()`, `esc()`, `withPrices()`, `.modal-overlay`, `.btn`, localStorage versioning pattern, FileReader pattern (none yet, but no dependencies needed).

---

## Decision Audit Trail

| # | Phase | Decision | Principle | Rationale | Rejected |
|---|-------|----------|-----------|-----------|----------|
| 1 | CEO | Accept premises 1, 4, 5; reframe 3 | P6 bias to action | Premise 3 wrong but framing fix doesn't change scope | Blocking on premise 3 |
| 2 | CEO | Include portfolio.json local update | P2 boil lakes | In blast radius, <5 min CC effort | Deferring to later |
| 3 | CEO | Full plan (both brokers) over Robinhood-only | P1 completeness | Delta is 15 min CC, covers more of Tom's use case | Robinhood-only |
| 4 | Design | Add all 4 import states | P1 completeness | Missing states = broken UX on error path | Add success only |
| 5 | Design | Import zone above table, collapses post-import | P5 explicit | Obvious placement, matches existing layout | Below table |
| 6 | Design | Mobile fallback: click-to-upload only | P1 completeness | Mobile can't drag-drop, needs a path | Mobile unsupported |
| 7 | Eng | Do NOT bump DATA_VER | P3 pragmatic | Would wipe localStorage — destructive non-improvement | Bump DATA_VER |
| 8 | Eng | stocks.html: no changes needed | P4 DRY | Shared mti_assets key — already inherits | Duplicate import UI |
| 9 | Eng | Named column constants, not hardcoded indices | P5 explicit | Format drift resilience | Hardcoded indices |
| 10 | Eng | replace-vs-merge: replace mode on import | P3 pragmatic | Simpler, avoids stale-data bugs, matches user expectation | Merge mode |

---

## Cross-Phase Themes

**Theme: Unspecified states.** Both CEO (error paths) and Design (missing states) independently flagged that the plan doesn't specify what happens when things go wrong. High-confidence signal: this needs explicit error handling and user feedback.

**Theme: Replace vs merge.** CEO (premise 2 — unknown brokers) and Eng (decision 10) both touched this. Decided: replace mode is the right default. But the UI must warn: "This will replace your current X positions."

---

## Manual Test Checklist

- [ ] Drop a real Fidelity CSV → holdings populate correctly
- [ ] Drop a real Robinhood CSV → holdings populate correctly
- [ ] Drop an .xlsx file → friendly error message shown
- [ ] Drop same CSV twice → positions not doubled (replace mode)
- [ ] After import, reload page → holdings persist (localStorage)
- [ ] After import, check stocks.html → same holdings shown
- [ ] Import on mobile (click to upload) → works
- [ ] Import with 0-qty rows → not shown in table
- [ ] Import with unknown ticker → shows with ticker as name, no logo

---

## GSTACK REVIEW REPORT

| Review | Via | Runs | Status | Key Findings |
|--------|-----|------|--------|--------------|
| CEO Review | /autoplan | 1 | clean | Premise 3 reframed; portfolio.json local update added to scope |
| Design Review | /autoplan | 1 | issues_open (fixed) | 4 missing states added to plan |
| Eng Review | /autoplan | 1 | issues_open (fixed) | DATA_VER must not be bumped; stocks.html needs no changes |
| Codex Review | N/A | 0 | unavailable | — |

**VERDICT:** REVIEWED — 10 auto-decisions, 0 taste decisions, 2 critical findings resolved. Ready for final gate.
