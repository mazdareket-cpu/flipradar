# FlipRadar Ukraine-first automation and referral rollout

## Commission policy (updated 2026-10-15; proposal only)
- The platform fee is **1% of the contributor's gross seller-funded success reward**, NOT 1% of the product's price.
- Contributor receives the remaining **99%** of that reward.
- Example: seller-funded reward 500 UAH -> 495 UAH contributor, 5 UAH platform.
- Supersedes the earlier 85/15 draft. No fee is due for a click, a submitted deal, or an unverified sale.
- Implemented: shared calculation policy in lib/reward-policy.ts and an illustrative calculator in app/SubmitDeal.tsx.
- NOT implemented: seller opt-in and reward commitment, attribution, proof of sale, dispute window, cash collection, payouts, or actual account balances. No earnings should be advertised as payable.
- Before real payouts: obtain seller's explicit agreement and permitted attribution source; implement idempotent server-side transaction ledger, buyer/seller confirmation, fraud review, dispute/return policy and licensed payment rails, with legal/tax review for Ukraine.

## Ukraine-only supply sources
1. Existing authenticated user submissions -> private draft -> moderator checks live source, price, costs and condition -> 72h public listing.
2. Opt-in Ukrainian merchants provide a CSV/JSON feed or approved API access, including product ID, title, category, UAH price, HTTPS URL, stock/availability, update timestamp and rights to republish.
3. Prom.ua public API exposes **the connected merchant's own products**, not a general market search. Merchants must authorize access.
4. OLX Partner API allows management of authorized accounts' adverts, **not retrieval of other people's adverts** (OLX developer FAQ). Do not build an unauthorized sitewide OLX scraper.

## Next safe implementation milestones
- Seller connection and signed, authenticated partner-feed import; validate URLs and UAH currency, deduplicate by (merchant, external ID), and enforce freshness.
- Scheduled ingestion with bounded batch size, retry/backoff and an import log. New items must be private drafts, not automatically claimed as verified bargains.
- Automatic checks: domain allowlist, URL safety, price positive, availability, duplicate detection, model matching, suspicious price gaps. Flag for moderation.
- After a merchant has established a trustworthy feed, enable per-merchant auto-publication only with documented consent, minimum evidence and a manual kill switch.
- Refresh or unpublish stale products, respecting source update frequency and the 72h public listing policy.
- Referral tracking with random referral IDs, seller confirmation, dispute/return window, payout ledger and anti-fraud controls; integrate a licensed payment provider after legal/tax review.

## Implemented first integration stage
- Admin-only POST /api/admin/import-feed accepts 1–30 JSON items with title, model, category, source, source_url, asking_price, reference_price, optional currency=UAH.
- The /admin page has a JSON import form. Imported records remain unpublished and require moderator approval.
- Source URLs are deduplicated against the existing public_deals source_url unique index.
- Import is manual/batch for now; automatic scheduled fetching from seller feeds requires a seller-approved feed URL and access terms. The OLX Partner API requires seller authorization; this importer does not bypass it.

## Current state
- User-submitted listings and manual moderation are implemented.
- Public listings expire 72h after approval.
- The 99/1 reward split is communicated and calculated in the submission UI but **not yet executable**.
- Admin-initiated batch feed import is implemented. No unattended scheduled Ukrainian marketplace discovery, seller OAuth, referral attribution or commission collection is active.
