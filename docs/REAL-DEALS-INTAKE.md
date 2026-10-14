# FlipRadar — safe real-deal intake checklist

The public feed is already wired in `app/PublicDeals.tsx` to `public.public_deals`. Never insert invented deals or scrape sites without checking their access rules.

## First live listing
1. Find an actual active listing from a source permitting your intended use; record its HTTPS URL, exact title/model, asking price, condition, and observation time.
2. Independently check comparable sold/market listings and record the basis for the reference price. Estimate delivery, repair, platform and transaction costs.
3. In Supabase SQL Editor, insert the verified listing with `published=false` first. Inspect it, then explicitly approve with `published=true` and a short expiry (e.g. 24 hours). Do not use browser-side admin credentials.
4. Confirm the listing appears in the public feed and expires from public visibility as expected. Check the outgoing URL.
5. Before automated ingestion: implement a server-only authenticated moderation/import route, URL deduplication, source permissions and rate limiting. Do not expose service-role credentials to the client.

## Deployment validation
Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in the deployment environment, then redeploy. These must be public/publishable values, **not** secret/service-role keys. Confirm live browser requests succeed.

## Read-only access smoke test
From an unauthenticated browser, the feed should return only `published=true` and `expires_at > now()` records. Anonymous INSERT/UPDATE/DELETE must fail. The UI should show a truthful empty state when there are no verified records.

Only `public.public_deals` is used. Do not modify any other tables.
