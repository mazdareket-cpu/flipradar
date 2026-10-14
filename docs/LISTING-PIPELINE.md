# Real listing pipeline: launch-critical
**Current database (2026-10-14): 0 deals, 0 live, 0 pending.** Never advertise a live automated OLX scanner.

## Ukraine — get actual supply
1. Invite real sellers/resellers to create an account and submit their real listing URL through /#submit-deal.
2. The POST /api/submit-deal route stores an unpublished draft in public_deals; it does not claim price verification.
3. A moderator opens Supabase Table Editor -> public_deals, validates the live source URL, price, product condition and independent market evidence, removes the internal [submission:...] marker from note, adjusts costs and expiry, then changes published to true.
4. Drafts must never be exposed through the public feed. Public SELECT RLS is published + unexpired only.
5. For 10–20 starter deals, partner submissions are much faster than waiting for an unsupported OLX search API. Do not manufacture examples.

## Europe — recurring eBay discovery
- Workflow .github/workflows/ebay-candidates.yml runs twice daily and on demand for DE/FR/IT/ES/NL/IE.
- Add GitHub Actions repository secrets EBAY_CLIENT_ID and EBAY_CLIENT_SECRET after obtaining official production access.
- Candidate JSON is uploaded as a private workflow artifact; this is NOT a public feed, NOT verified and NOT automatically published.
- EUR prices must never be displayed as UAH. Shipping, customs, taxes, FX, returns and market-reference prices need a separate review workflow.

## Critical pre-launch safety
- Add robust abuse prevention (CAPTCHA, atomic rate limiting, source URL deduplication constraint), admin review tooling and monitoring before opening submissions to large audiences.
- Verify Netlify production env vars, test signup, API submissions, RLS and mobile UX.
- Do not send service-role secrets in chat, screenshots, frontend or source control.
