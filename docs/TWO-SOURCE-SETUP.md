# Two-source launch configuration

## Ukrainian seller submissions
- Homepage includes `SubmitDeal` and authenticated POST `/api/submit-deal`.
- Required hosting env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and server-only `SUPABASE_SERVICE_ROLE_KEY`. Never add the server-only key to GitHub or a `NEXT_PUBLIC_` variable.
- User must sign in using existing Supabase Auth UI. The server verifies the bearer token with Supabase Auth.
- Every submission is inserted into existing `public.public_deals` with `published=false`. Moderators must verify the source URL, condition, asking price, comparable price and expiry before approval.
- This is a limited beta intake, not a hardened anti-spam service: before broad promotion, add durable per-user/IP rate limiting, CAPTCHA, audit trail, and uniqueness constraint on normalized source URLs. Existing 3/day check is best-effort and not atomic.
- Submissions should be treated as untrusted data; never auto-publish.

## eBay candidate discovery
- `scripts/ebay-candidates.mjs` uses official Browse API OAuth client credentials.
- Set `EBAY_CLIENT_ID` and `EBAY_CLIENT_SECRET` in a private runtime and run `node scripts/ebay-candidates.mjs "iPhone 13"`.
- Results are USD, EBAY_US, unverified local JSON candidates. They do NOT automatically enter the UAH public feed.
- Before international listings go live, implement shipping, customs, FX conversion, condition normalization and independent comparison prices. Follow eBay API usage terms.

## Deployment acceptance tests
1. Verify deployment build succeeds and `/api/submit-deal` is reachable.
2. Anonymous POST returns 401, invalid origin returns 403.
3. Signed-in valid submission creates a draft only; unauthenticated feed does not show it.
4. Duplicate URL returns 409; a fourth draft in 24 hours returns 429 (non-atomic beta control).
5. Only after moderator approval does a verified current listing appear publicly.
6. No changes to any other Supabase tables are required.

**Not yet verified:** deployment env, live API tests, real eBay credentials, production data flow.
