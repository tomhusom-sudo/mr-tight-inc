# TODOS — Honest Tom's Dashboard

Items deferred from /autoplan review (2026-03-27).

## Phase 3 — Real-Time Prices
- [ ] Replace web-search cron with Yahoo Finance API or Alpha Vantage for automated price pulls
- [ ] Prices update on page load + every 30 min without Claude involvement
- [ ] Prices for non-tracked tickers (imported from CSV) also auto-refresh

## Phase 4 — Portfolio Enhancements
- [ ] Allocation pie/donut chart
- [ ] Sparklines (30-day) per holding
- [ ] Day change column ($ and %)
- [ ] Export to CSV

## CSV Import — Future Additions
- [ ] Schwab CSV format support (add if needed)
- [ ] portfolio.json server push after import (requires git commit workflow)
- [ ] Preview imported positions before confirming replace

## Other
- [ ] Google Cloud OAuth Client ID for contacts.html
- [ ] Replace dummy portfolio holdings with real Fidelity/Robinhood CSV data (now possible via Import CSV)

---

## Honest Tom's Market — Deferred Items

### P1 (Do before first payment)
- [ ] **Register SD LLC** — Register "Honest Tom's Market LLC" with SD Secretary of State (~$150,
  ~2 hrs). Stripe requires business entity for payouts; LLC protects personal assets; needed for
  future lease. Start at sdsos.gov before building the site.

### P2 (After first 20 customers)
- [ ] **Gym/Clinic Partnership Channel** — Approach one Aberdeen gym or fitness studio to display
  weekly Honest Tom's menu in their lobby. Offer members 10% off first order. Perfect customer
  overlap (health-motivated, active), zero cost. One conversation to set up.

- [ ] **Doctor/Clinic GLP-1 Referral Channel** — Ask one Aberdeen physician to mention Honest
  Tom's to patients starting Ozempic, Wegovy, or Mounjaro. A doctor recommendation is the
  highest-trust referral at this scale. Defer until site is live with real inventory to show.

- [ ] **Automate Balance Tracking** — Replace Phase 1 Google Sheets balance tracker with
  automated deduction (Stripe customer balance API or simple DB). Trigger: weekly orders hit 20+.
  Manual tracking breaks at scale. (human: ~1 day / CC: ~30 min)
