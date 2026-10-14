# FlipRadar seller submission and moderation — deployment

## Required Vercel (or Netlify) environment variables
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- SUPABASE_SERVICE_ROLE_KEY — secret, server-side only
- FLIPRADAR_ADMIN_USER_IDS — comma-separated Supabase Auth user UUIDs of trusted moderators (not emails). Find your user UUID in Supabase Dashboard → Authentication → Users. Do not share your service-role key.

## Workflow
1. User signs up and verifies email on the homepage.
2. User submits title, model, category, source, HTTPS URL, asking price and claimed reference price.
3. Server validates session and origin; honeypot reduces basic bots; PostgreSQL enforces atomic 3/24h limit and unique source URL.
4. Draft remains published=false and invisible to public feed.
5. Authorized moderator signs in on homepage, visits /admin, clicks **Оновити чернетки**, verifies source and independent price evidence, records costs and evidence, and approves.
6. Approved deal appears for 72h (3 days) after moderation approval in public feed. Moderator can reject and keep an audit placeholder.

## Security and known limitations
- Moderator authorization uses server-only allowlist of Supabase user UUIDs; never trust a frontend admin flag.
- The current moderation UI is an MVP. Rejected drafts remain visible to moderators and still occupy the submitter's daily quota for 24 hours.
- Honeypot and authenticated 3/day limits do NOT replace edge/IP rate limiting or CAPTCHA; add Cloudflare Turnstile and an atomic verification endpoint before high-traffic Instagram launch.
- Existing public_deals table only was modified; a unique index and restricted SECURITY DEFINER RPC were added.
- The RPC can only be executed by service_role. The API validates Supabase user token first.
- Never claim deals are independently verified until a moderator has actually inspected them.
- Verify the latest Vercel production deployment and test the moderation flow with a real account.
