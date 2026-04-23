# TextForge ⚡

> Turn any text into SEO blog posts and podcast scripts using AI — in under 10 seconds.

Live demo: [your-app.vercel.app](https://your-app.vercel.app)

---

## What It Does

- **Text → Blog Post** — Paste notes or ideas, get a full SEO-optimized article with H1/H2 structure, meta description, and keyword targeting
- **Text → Podcast Script** — Turn any content into a ready-to-record episode script with host dialogue, segment markers, and ad breaks
- **Monetized** — Stripe subscriptions built in (Free / Pro $19/mo / Business $79/mo)

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| AI | Anthropic Claude API |
| Payments | Stripe Subscriptions |
| Styling | Tailwind CSS |
| Deployment | Vercel |

---

## Local Setup

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/textforge.git
cd textforge
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env.local
```

Open `.env.local` and fill in:

```env
ANTHROPIC_API_KEY=sk-ant-...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_BUSINESS=price_...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Run dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Getting Your API Keys

### Anthropic
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. **API Keys → Create Key**
3. Copy the key starting with `sk-ant-...`

### Stripe
1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. **Developers → API Keys** → copy Secret key
3. **Products → Add Product:**
   - "TextForge Pro" → Recurring → $19/month → copy `price_...`
   - "TextForge Business" → Recurring → $79/month → copy `price_...`
4. **Developers → Webhooks → Add Endpoint:**
   - URL: `https://your-app.vercel.app/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`
   - Copy the `whsec_...` signing secret

---

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import repo
3. Add all environment variables from `.env.example`
4. Click **Deploy**

---

## Project Structure

```
textforge/
├── app/
│   ├── page.tsx                          # Landing page
│   ├── layout.tsx                        # Root layout + fonts
│   ├── globals.css                       # Global styles
│   ├── pricing/page.tsx                  # Pricing + Stripe checkout
│   ├── success/page.tsx                  # Post-payment success
│   ├── convert/
│   │   ├── blog/page.tsx                 # Blog converter UI
│   │   └── podcast/page.tsx              # Podcast converter UI
│   └── api/
│       ├── convert/
│       │   ├── blog/route.ts             # Claude blog API
│       │   └── podcast/route.ts          # Claude podcast API
│       └── stripe/
│           ├── checkout/route.ts         # Stripe checkout session
│           └── webhook/route.ts          # Stripe webhook handler
├── .env.example                          # Environment variable template
├── .gitignore
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## License

MIT — free to use, modify, and deploy commercially.
