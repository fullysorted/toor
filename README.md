# Toor — Event Companion Platform

White-label event companion for premium automotive events.
Built by Fully Sorted. First deployment: La Jolla Concours d'Elegance, April 24–26, 2026.

---

## Quick Deploy (3 steps)

### Step 1: Push to GitHub

1. Go to https://github.com/new
2. Name it `toor` (private repo is fine)
3. Don't add README or .gitignore (we have them)
4. Open your terminal in this `toor/` folder and run:

```bash
git init
git add .
git commit -m "Initial commit — Toor event companion platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/toor.git
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to https://vercel.com (sign in with GitHub)
2. Click "Add New Project"
3. Import your `toor` repo
4. Framework: Next.js (auto-detected)
5. Click "Deploy"
6. Your app is live at `toor-xxxxx.vercel.app` within ~60 seconds

### Step 3: Connect Neon Database (optional — app works without it using localStorage)

1. Go to https://neon.tech (create free account)
2. Create a new project called "toor"
3. Copy the connection string from the dashboard
4. In Vercel: Settings → Environment Variables → add `DATABASE_URL` with the connection string
5. Locally: paste it into `.env.local`
6. Run `npm run db:setup` to create tables and seed data

---

## Project Structure

```
toor/
├── app/
│   ├── layout.tsx          # Root layout — Google Fonts, meta tags
│   ├── globals.css         # Tailwind + CSS custom properties
│   ├── page.tsx            # Screen 1: Splash / Login
│   ├── profile/page.tsx    # Screen 2: Profile Setup
│   ├── home/page.tsx       # Screen 3: Weekend Hub
│   ├── navigate/page.tsx   # Screen 4: Tour d'Elegance
│   ├── connect/page.tsx    # Screen 5: Entrant Directory + Chat
│   ├── garage/page.tsx     # Screen 6: My Garage
│   ├── program/page.tsx    # Screen 7: Digital Program
│   └── admin/page.tsx      # Screen 8: Admin Panel
├── lib/
│   ├── store.ts            # Data layer — localStorage (swap for Neon in production)
│   ├── seed-data.ts        # All seed data — La Jolla 2026
│   └── db-setup.mjs        # Neon database schema + seeding script
├── package.json
├── tailwind.config.ts
└── .env.local              # DATABASE_URL goes here
```

## Architecture

- **Multi-tenant:** Every data key is scoped to `tenant_id`. One codebase serves unlimited events.
- **Branding as config:** CSS custom properties applied from `brand_config` on load. Zero hardcoded colors.
- **Three-level data model:** Platform → Tenant → User. Profiles are portable; entries are event-scoped.
- **localStorage now, Neon later:** The `lib/store.ts` API is the same either way — swap the backend, keep the UI.

## Admin Access

- URL: `/admin`
- Email: `admin@lajollaconcours.com`
- Password: `admin2026`

## Local Development

```bash
npm install
npm run dev
# Open http://localhost:3000
```

---

*Powered by Toor · A Fully Sorted Company*
