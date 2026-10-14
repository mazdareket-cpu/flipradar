# FlipRadar MVP

A Ukrainian-language Next.js prototype for tracking potential resale deals. It includes a working profit/ROI calculator, local browser persistence, manual deal entry, CSV import, filtering, and links to external OLX search pages.

## Current limits (important)
- This version does **not** scrape OLX or automatically ingest third-party listings.
- The included sample rows are marked DEMO and are not current offers or market price evidence.
- Data is stored in the current browser via `localStorage`; it is not synced across devices and has no user accounts.
- Payments, Telegram notifications, and external API integrations are not active.
- The “early access” CTA is a placeholder email link; replace it with a real signup/waitlist flow before public promotion.

## Run locally on Windows
1. Install Node.js LTS from https://nodejs.org/.
2. Extract the ZIP to a folder, open that folder in VS Code.
3. In VS Code choose Terminal → New Terminal.
4. Run:
   ```bash
   npm install
   npm run dev
   ```
5. Open http://localhost:3000.

## Deploy to Vercel
1. Create a new Git repository named `flipradar-mvp` and upload these files (do not overwrite the existing PromptStart project).
2. In Vercel choose Add New → Project and import the new repository.
3. Framework should be detected as Next.js. No environment variables are required for this prototype.
4. Deploy as a Preview first and test mobile layout, manual entry, calculator, CSV import and external search.
5. Promote to Production only after checking the preview.

Vercel CLI alternative, from the project directory after logging in and linking the *new* project:
```bash
npm install -g vercel
vercel login
vercel link
vercel deploy
```
Use `vercel deploy --prod` only after preview validation. Official Vercel docs: https://vercel.com/docs/projects/deploy-from-cli

## CSV format
UTF-8 CSV with a header row. Column order:
```csv
name,category,buy,sell,shipping,repair,fees,source,condition,note
"iPhone 13 128 GB",Смартфони,7000,8500,100,0,150,https://www.olx.ua/uk/,Б/в,"Перевірити Face ID"
```
The lightweight importer expects commas as separators and does not support every complex CSV quoting edge case; inspect imported rows.

## Data source integration plan
Before enabling automatic monitoring, choose a data source whose terms explicitly permit searching and displaying third-party public listings. OLX developer access requires app registration and approval; its FAQ indicates its API does not expose other users' ads in the way a general deal scanner needs. Do not bypass CAPTCHA, access controls or rate limits. Keep provider credentials server-side only.

## Next milestone
1. Interview 15–30 active resellers.
2. Confirm which category they will pay to monitor.
3. Pick a permitted listing data provider and confirm cost/coverage.
4. Add Supabase auth/database and a real waitlist/contact form.
5. Add Telegram notifications only after data refresh works reliably.
6. Add a payment provider and activate subscriptions only after verified payment webhooks.
