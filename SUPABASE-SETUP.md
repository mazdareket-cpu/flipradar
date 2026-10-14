# FlipRadar: Supabase authentication setup

1. In Supabase open **Project Settings → API Keys** (or **Connect**). Copy **Project URL** and **publishable key** (starts with `sb_publishable_`). Legacy `anon` public key can work if used in the publishable key variable.
2. In Netlify open **Site configuration → Environment variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = public publishable key
3. Trigger a **new deployment**; Next.js embeds `NEXT_PUBLIC_*` at build time.
4. In Supabase **Authentication → URL Configuration**, set **Site URL** to `https://flipradarua.netlify.app`; add `https://flipradarua.netlify.app/**` to Redirect URLs. Add the Netlify deploy preview URL pattern only if you trust it.
5. In **Authentication → Providers → Email**, confirm Email provider is enabled. Keep email confirmation on for public registration.
6. Test sign up with a test email, verify email, sign in, sign out.

## Current limits
- This adds real Supabase Auth login/signup, but no cloud storage of listings or trade records yet.
- Do not turn off RLS for convenience. Database tables and ownership policies must be reviewed before connecting data.
- Never put `service_role`, `sb_secret_*`, JWT signing secrets or database password in GitHub, chat, or `NEXT_PUBLIC_*` variables.
- This branch does not implement billing, Telegram delivery or third-party marketplace access.
