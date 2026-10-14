# FlipRadar — Netlify launch checklist (Ukraine + EU)

## Deployment
- Connect GitHub repository mazdareket-cpu/flipradar to Netlify; build command: npm run build. Netlify's Next.js support should detect the framework.
- Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY from Supabase project settings.
- Configure SUPABASE_SERVICE_ROLE_KEY **only** as a server-side Netlify environment variable; do not commit it or prefix it NEXT_PUBLIC_. Treat this credential as highly privileged.
- Redeploy, inspect build logs, test signup/login and POST /api/submit-deal with a logged-in user. Test anonymous requests fail.
- Before promoting publicly, implement persistent rate limiting and bot protection for submissions; current limit is best-effort only.
- Confirm RLS allows anonymous SELECT only for published and unexpired public_deals; check drafts stay hidden.

## Ukraine
- Existing public_deals prices and UI use UAH. Accept manually verified Ukrainian seller submissions as unpublished drafts.
- Verify each listing, independent market comparison and estimated fees before moderator publication.
- Do not assume access to a general OLX listings API.

## EU
- Obtain eBay Developer production Browse API access.
- Store EBAY_CLIENT_ID and EBAY_CLIENT_SECRET in a private runner, not in client code.
- Run node scripts/ebay-candidates.mjs DE "iPhone 13" (or FR, IT, ES, NL, IE).
- Each market saves separate EUR candidates locally, unverified and unpublished.
- Current public_deals UI is UAH-only: do NOT publish EUR candidates into it. Implement currency-aware display, market segmentation, fee/shipping calculations and review before public EU launch.

## Current limitations
- No Netlify account connector is available in this workflow: deployment and environment variables cannot be verified or changed here.
- No live eBay API credentials were supplied; candidate discovery has not been run.
- No production build or browser smoke test has been performed here.
