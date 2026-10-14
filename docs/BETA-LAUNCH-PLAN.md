# FlipRadar public beta: launch priorities

## Data source status
- Official eBay Browse API candidate discovery is implemented in scripts/ebay-candidates.mjs, but not activated until EBAY_CLIENT_ID and EBAY_CLIENT_SECRET are configured. It targets EBAY_US in USD, and writes local UNVERIFIED candidate JSON only.
- OLX Partner API does not provide general search of other sellers' adverts. Do not misrepresent it as an available feed or bypass access restrictions.
- Do not copy USD prices into UAH-only public_deals. Add an explicitly reviewed FX/shipping/import-cost workflow before any cross-border offers.

## Activate eBay discovery
1. Obtain eBay developer production application credentials and confirm Browse API access.
2. Store EBAY_CLIENT_ID and EBAY_CLIENT_SECRET in a private execution environment (never NEXT_PUBLIC_ or GitHub files).
3. Run: node scripts/ebay-candidates.mjs "iPhone 13"
4. Review candidates/ebay-candidates.json. This is discovery only: candidates are NOT automatically published or verified.
5. Verify availability, seller, condition, comparable prices, currency conversion, shipping/customs, and source permissions before entering a deal for moderation.

## Fastest trustworthy Ukraine-first beta
1. Confirm Netlify deployment and NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
2. Recruit 3-5 opt-in local resellers to submit listing URLs and asking prices; validate each before publication.
3. Publish 10-20 current manually reviewed UAH deals, set short expirations and document reference-price evidence.
4. Test on mobile, empty/error states, public read access and blocked public writes.
5. Add seller submission form that creates pending drafts through a rate-limited server-side endpoint (never expose service credentials).
6. Add last-verified timestamp, report-stale action, transparent calculation and price comparison evidence.
7. Instrument anonymized conversion funnel: visit -> deal click -> return, and add a clear disclaimer about uncertainty.

Do not claim live automated OLX scanning or guaranteed profit until demonstrated.
