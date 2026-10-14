# FlipRadar 4.0–5.0: launch checklist

## What this branch actually delivers
- Smartphone/tech listing workspace with local storage, URL checks and CSV import/export.
- Comparable-item matching on normalized model + memory + condition.
- Median benchmark, price gap, estimated profit and conservative 3-comparable minimum.
- Watchlist rules stored in browser, risk warnings, editable cost assumption.
- Free/Pro/Hunter pricing presentation; **no live billing or access control**.

## CSV schema
`model,price,url,source,condition,memory,note`

Example (illustrative, NOT a live listing):
`iPhone 13,8000,https://example.com,manual,Б/в,128GB,Перевірити батарею`

Imported data must be legally sourced and checked for quality. Current CSV reader handles standard quoted fields on a single line; multiline quoted fields are not supported. All records are browser-local and can be lost if storage is cleared. Export a backup.

## Requirements before real 5.0 production
1. **Data access:** negotiate authorized listing feeds/partner agreements; OLX Partner API does not expose other users' listings. Do not bypass access controls or scrape contrary to terms.
2. **Server database:** provision a hosted database (e.g. Supabase/Postgres), create users, listings, normalized products, prices, watchlists, notification deliveries, plans and billing events. Use row-level security so users cannot read each other's watchlists.
3. **Authentication:** provider-backed login with verified email, session management and rate limiting. Never store passwords or payment tokens in localStorage.
4. **Ingestion:** signed/authorized source connectors, scheduled jobs, deduplication by source+listing ID, timestamps, validation and stale-data detection.
5. **Alerts:** opt-in Telegram bot, chat verification, delivery queue, retries and unsubscribe.
6. **Payments:** merchant onboarding and secure server-side checkout with monobank or another licensed provider. Verify provider webhook signatures, event idempotency and payment status before granting entitlements. Never activate Pro merely on client-side button click.
7. **Admin:** role-based dashboard, moderation, fraud reports, audit log, legal/privacy pages, backups, observability and budget limits.
8. **Testing:** automated tests for price math, feed import, account isolation, billing events, and Netlify preview build before launch.

## Security and product honesty
- Profit is an estimate and ignores liquidity, taxes and unobserved defects.
- A median of three samples is not a trustworthy market price without further checks.
- Do not market local watchlists as active monitoring or plan cards as functioning paid subscriptions.
- Do not put API tokens, webhook secrets or database service keys into GitHub or client code.

## Suggested staged release
- 4.0: manual/authorized-feed import, model normalization, conservative scoring.
- 4.1: reliable source ingestion and historical price tracking.
- 4.2: verified accounts and server-side Telegram alerts.
- 5.0: merchant onboarding, billing and subscription entitlements, then public launch.
