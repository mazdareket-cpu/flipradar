# Public Deals launch (curated beta)

1. In Supabase Dashboard → SQL Editor → New query, paste and run `supabase/public_deals.sql` from this branch. This creates a public read-only table with RLS. No user can publish from the browser.
2. Confirm Netlify already has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Merge the PR and deploy.
3. In Supabase SQL Editor, add one **real, independently checked** listing using a query like below, replacing ALL placeholder values with facts (do not run as-is):

```sql
insert into public.public_deals
(title, model, category, source, source_url, asking_price, reference_price, estimated_costs, condition, note, observed_at, expires_at, published)
values
('REAL LISTING TITLE', 'iPhone 13 128GB', 'Смартфони', 'SOURCE', 'https://example.com/real-listing', 7500, 9500, 500, 'Б/в', 'State checked manually; comparable pricing reviewed', now(), now() + interval '24 hours', true);
```

4. Open the public site and confirm listing and outbound link. The deal expires automatically from the feed after the expiry time.
5. For public beta, manually curate 10–20 genuine listings daily with a dated comparison basis and avoid posting private seller information.
6. Next: build a secure server-side moderation/import tool, feed deduplication, price reference methodology and authorized feed ingestion. There is currently **no automatic marketplace scanning**, and there should be no claims otherwise.

Security: public roles have SELECT only and only on published, unexpired records. Use the Supabase SQL Editor (admin) for publishing. Never publish service role keys.
