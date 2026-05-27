# Eventra 🎟️

**Create events. Sell tickets. Share the link.**

A mobile-first event ticketing platform built with Next.js 14, Supabase, and Stripe Payment Links. Organizers create events in 3 steps, get a shareable link, and attendees buy tickets directly via Stripe — no backend complexity required.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Auth & DB | Supabase (Postgres + Row Level Security) |
| Payments | Stripe Payment Links + Webhooks |
| Deployment | Vercel |

---

## Project Structure

```
eventra/
├── app/
│   ├── page.tsx                        # Landing page
│   ├── layout.tsx                      # Root layout + fonts
│   ├── globals.css                     # Global styles
│   ├── not-found.tsx                   # 404 page
│   ├── auth/
│   │   ├── login/page.tsx              # Sign in
│   │   ├── signup/page.tsx             # Sign up (role picker)
│   │   └── callback/route.ts          # OAuth callback
│   ├── organizer/
│   │   ├── dashboard/page.tsx          # Organizer home
│   │   └── events/
│   │       ├── create/page.tsx         # 3-step event wizard
│   │       └── [id]/
│   │           ├── edit/page.tsx       # Edit event
│   │           └── success/page.tsx    # Published confirmation + share
│   ├── events/
│   │   └── [slug]/page.tsx             # Public event page (the shareable link)
│   ├── browse/page.tsx                 # Public event discovery
│   └── api/
│       └── webhooks/stripe/route.ts   # Stripe webhook handler
├── components/
│   ├── events/
│   │   ├── BuyButton.tsx               # Redirects to Stripe
│   │   └── ShareButton.tsx             # Native share / copy
│   └── ui/
│       └── CopyButton.tsx              # Copy to clipboard
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # Browser Supabase client
│   │   ├── server.ts                   # Server Supabase client
│   │   └── types.ts                    # TypeScript DB types
│   └── utils.ts                        # Helpers (slugify, format, etc.)
├── middleware.ts                        # Auth route protection
└── supabase/
    └── migrations/
        ├── 001_initial.sql             # All tables + RLS policies
        └── 002_rpc.sql                 # increment_tickets_sold function
```

---

## Setup Guide

### 1. Clone and install

```bash
git clone <your-repo-url> eventra
cd eventra
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) → create a new project
2. Go to **SQL Editor** → paste and run `supabase/migrations/001_initial.sql`
3. Then run `supabase/migrations/002_rpc.sql`
4. Go to **Settings → API** → copy your Project URL and anon key

### 3. Set up Stripe

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Copy your **Publishable key** and **Secret key** from API Keys
3. For webhooks (optional but recommended for ticket tracking):
   - Go to **Webhooks → Add endpoint**
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`
   - Copy the **Signing secret**

### 4. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...   # only needed if using webhooks

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Add all your environment variables in the Vercel dashboard under **Settings → Environment Variables**.

Update `NEXT_PUBLIC_APP_URL` to your production URL (e.g. `https://eventra.vercel.app`).

---

## How it works

### For organizers

1. **Sign up** as an organizer
2. **Create event** — 3-step wizard: details → tickets → Stripe link
3. **Get shareable link** — e.g. `eventra.app/events/afro-jazz-night-a1b2c`
4. **Share** via WhatsApp, Instagram, email, anywhere

### For attendees

1. Open the shared link
2. See the beautiful event page
3. Tap **Buy ticket** → redirected to Stripe Checkout
4. Payment handled entirely by Stripe

### Stripe Payment Link flow

```
Attendee clicks "Buy ticket"
       ↓
Redirect to buy.stripe.com/... (organizer's Stripe link)
       ↓
Stripe Checkout (card, Apple Pay, Google Pay, etc.)
       ↓
Payment confirmed by Stripe
       ↓
(Optional) Stripe webhook → Eventra records registration
```

---

## Creating a Stripe Payment Link

1. Go to [dashboard.stripe.com/payment-links](https://dashboard.stripe.com/payment-links)
2. Click **New** → add your product (e.g. "Afro Jazz Night — General Admission")
3. Set the price (must match what you enter in Eventra)
4. Optionally: set quantity limits, add your logo/branding, customize success page
5. Click **Create link** → copy the URL → paste into Eventra

---

## Adding features

| Feature | How |
|---------|-----|
| Email confirmations | Use Resend + Supabase webhooks |
| QR code tickets | Generate QR from registration ID |
| Multiple ticket tiers | Add a `ticket_tiers` table |
| Event images | Add Supabase Storage + image upload UI |
| Attendee dashboard | Add `/attendee/tickets` page with registrations query |
| Analytics | Add `page_views` table or integrate PostHog |

---

## License

MIT
