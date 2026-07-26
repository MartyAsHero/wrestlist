# Wrestlist — deployment guide

This is the full source code for Wrestlist. You don't need to write or edit any
code to get it live — just create three free accounts and copy a few values
between them. Budget about 30–45 minutes the first time.

**The three services:**
- **GitHub** — holds your code
- **Supabase** — your database + login system (email, Google, Discord)
- **Vercel** — hosts the actual website

---

## Step 1 — Put the code on GitHub

1. Go to [github.com](https://github.com) and create a free account (if you don't have one).
2. Click the **+** in the top right → **New repository**. Name it `wrestlist`, keep it **Public** or **Private** (either works), don't add a README, then **Create repository**.
3. On the new empty repo page, click **uploading an existing file**.
4. Open the `wrestlist-app` folder you downloaded from this chat, select **everything inside it** (not the folder itself — the files and subfolders like `app`, `components`, `supabase`, etc.), and drag them all into the GitHub upload box.
5. Scroll down and click **Commit changes**.

You now have the code on GitHub — Vercel will read from here every time you want to update the site later.

---

## Step 2 — Set up Supabase (your database + login system)

1. Go to [supabase.com](https://supabase.com) → sign up free → **New project**.
2. Name it `wrestlist`, set a database password (save it somewhere), pick the region closest to you, and create the project. Wait ~2 minutes for it to spin up.
3. In the left sidebar, click **SQL Editor** → **New query**.
4. Open `supabase/schema.sql` from your downloaded code, copy **all of it**, paste it into the SQL editor, and click **Run**. This creates all your tables, security rules, and loads the 2026 WWE/AEW catalog.
5. In the left sidebar, go to **Project Settings → API**. You'll need two values from this page in Step 4:
   - **Project URL**
   - **anon public** key

### Turning on Google and Discord login

Still in Supabase, go to **Authentication → Providers**:

**Google:**
1. Toggle Google on. Supabase shows you a **Callback URL** — copy it.
2. Go to [Google Cloud Console](https://console.cloud.google.com/) → create a project → **APIs & Services → Credentials → Create Credentials → OAuth client ID** → type **Web application**.
3. Paste Supabase's callback URL into **Authorized redirect URIs**.
4. Copy the **Client ID** and **Client Secret** Google gives you back into the matching fields in Supabase, then **Save**.

**Discord:**
1. Toggle Discord on in Supabase, copy its callback URL.
2. Go to [Discord Developer Portal](https://discord.com/developers/applications) → **New Application** → **OAuth2** tab.
3. Paste Supabase's callback URL into **Redirects**.
4. Copy the **Client ID** and **Client Secret** into Supabase, **Save**.

(Email/password login needs no extra setup — it works out of the box.)

---

## Step 3 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → sign up free (choose "Continue with GitHub" — this also connects the two automatically).
2. Click **Add New → Project**, find your `wrestlist` repo, click **Import**.
3. Before clicking Deploy, open **Environment Variables** and add the two values from Supabase Step 2.5:
   - `NEXT_PUBLIC_SUPABASE_URL` → your Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → your anon public key
4. Click **Deploy**. Wait a minute or two — Vercel will give you a live URL like `wrestlist-yourname.vercel.app`.

---

## Step 4 — Connect the last piece: redirect URLs

Go back to Supabase → **Authentication → URL Configuration** and add your new Vercel URL in two places:
- **Site URL**: `https://your-vercel-url.vercel.app`
- **Redirect URLs**: `https://your-vercel-url.vercel.app/auth/callback`

Without this step, Google/Discord sign-in will redirect back to a broken page.

---

## Step 5 — Test it

Visit your Vercel URL. Try:
- Browsing and filtering the catalog
- Signing up with an email
- Signing in with Google/Discord
- Adding something to your list, rating it, moving it between statuses

If sign-in redirects weirdly, double check Step 4 — that's the most common snag.

---

## Updating an already-deployed site (adding cover art + WWE/AEW tabs)

If you already ran the original `schema.sql` before this update, run one more
small script so your database matches the new code:

1. Supabase → **SQL Editor → New query**
2. Paste in `supabase/migration_add_cover_image.sql` and click **Run**
3. Re-upload the changed files to GitHub (or just re-upload the whole folder — GitHub will only update what changed) — Vercel will automatically redeploy

## About the cover art

Real WWE/AEW photos and logos are copyrighted (and often show real people), so
this site generates its own original poster art per entry instead — a simple
abstract design using each show's initials and its promotion's color. If you
ever get your own licensed photos (official press kits, your own photography,
etc.), you can override any entry's art by pasting an image URL into its
`cover_image_url` field in Supabase's Table Editor — the real image will
replace the generated poster automatically.

## Navigation

- **Browse** — everything, both promotions
- **WWE** / **AEW** — same catalog, pre-filtered to one federation
- **Schedule** — everything still upcoming in 2026, soonest first
- **My List** — your tracked shows, grouped by status

## What's already built

- Public catalog (`entries` table) — every 2026 WWE/AEW weekly show, PLE/PPV, documentary, and movie, filterable by promotion/category/status, with search
- Real accounts — email/password, Google, and Discord, via Supabase Auth
- Per-user tracking (`user_entries` table) — status, 0–10 rating, episode progress, all protected so people can only see and edit their own list
- A basic public profile row (`profiles` table) is created automatically per user — no UI for it yet, but it's there for when you want public profile pages later

## What's not built yet (future steps, not urgent)

- **Subscriptions** — add [Stripe](https://stripe.com) later; this mainly means a new `subscriptions` table plus a Stripe Checkout button and webhook. Happy to build this out whenever you're ready.
- **Ads** — usually just a script tag (e.g. Google AdSense) dropped into `app/layout.js` once your site has enough traffic to qualify.
- **Custom domain** (e.g. `wrestlist.com` instead of the `.vercel.app` one) — buy a domain anywhere (Namecheap, Google Domains, etc.) and attach it under your Vercel project's **Domains** tab.
- **Admin panel for adding new entries** — right now new shows/events get added by running SQL in Supabase directly. A simple admin form is a natural next build.
- **Images/posters** — currently text-only ticket-stub cards, by design (real WWE/AEW photos and logos are copyrighted, so any poster art would need to be original artwork).

## Updating the catalog later

To add a new event, go to Supabase → **Table Editor → entries → Insert row**, fill in the fields (see `supabase/schema.sql` for the pattern), and it appears on the site immediately — no redeploy needed.
