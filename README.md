# INFLUUR — Influencer Intelligence Platform

Premium Influencer Discovery & CRM platform built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma, and Claude AI.

---

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + custom CSS variables |
| Database | PostgreSQL via Prisma |
| AI | Anthropic Claude (claude-sonnet-4-20250514) |
| Email | Resend |
| Auth | Instagram Graph API OAuth (mocked in prototype) |

---

## Project Structure

```
influur/
├── prisma/
│   └── schema.prisma              # Full DB schema
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout + nav
│   │   ├── page.tsx               # Hero search + analysis dashboard
│   │   ├── globals.css            # Design tokens + global styles
│   │   ├── influencer/
│   │   │   ├── login/page.tsx     # OAuth login flow
│   │   │   └── dashboard/page.tsx # Influencer studio (analytics + scheduler + AI)
│   │   ├── marketer/
│   │   │   └── dashboard/page.tsx # CRM + bulk outreach + AI strategist
│   │   └── api/
│   │       ├── search/analyze/    # Scraper mock → influencer profile
│   │       ├── auth/instagram/    # OAuth token exchange
│   │       ├── campaigns/send/    # Bulk email (Resend)
│   │       ├── posts/schedule/    # IG Graph API post scheduler
│   │       ├── saved-influencers/ # CRM CRUD
│   │       └── ai/chat/           # Claude AI (analyze/compose/caption/chat)
│   ├── lib/
│   │   ├── types.ts               # Shared TypeScript interfaces
│   │   └── mock-data.ts           # Seeded mock profiles + dashboard data
│   └── components/
│       └── ui/index.tsx           # Reusable UI primitives
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
├── package.json
└── .env.example
```

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env.local
# Fill in: DATABASE_URL, ANTHROPIC_API_KEY

# 3. Initialize database
npx prisma generate
npx prisma db push

# 4. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Hero search → type any handle → skeleton load → full analysis |
| `/influencer/login` | Mock Instagram OAuth flow |
| `/influencer/dashboard` | Analytics, auto-post scheduler, AI caption studio |
| `/marketer/dashboard` | CRM table, opt-in unlock, bulk outreach, AI strategist |

---

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/search/analyze` | Analyze influencer by handle/URL |
| `GET/POST` | `/api/auth/instagram` | OAuth initiate + token exchange |
| `GET/POST` | `/api/campaigns/send` | Send bulk email campaign |
| `GET/POST/DELETE` | `/api/posts/schedule` | Schedule / list / delete posts |
| `GET/POST/PATCH/DELETE` | `/api/saved-influencers` | CRM CRUD operations |
| `POST` | `/api/ai/chat` | Claude AI (mode: analyze/compose_email/suggest_caption/chat) |

---

## AI Features (Claude)

The `/api/ai/chat` route powers four distinct AI modes:

- **`analyze`** — Deep brand-fit analysis of an influencer profile: strengths, risks, budget, content ideas
- **`compose_email`** — Writes personalized outreach emails for bulk campaigns
- **`suggest_caption`** — Generates 3 caption variations (aspirational / humorous / storytelling) with hashtags
- **`chat`** — Free-form AI strategist / content coach chat with platform context

---

## Production Checklist

- [ ] Set `ANTHROPIC_API_KEY` in production env
- [ ] Configure real PostgreSQL (`DATABASE_URL`)
- [ ] Replace mock scraper in `/api/search/analyze` with real API (Apify, Phyllo, Modash)
- [ ] Set up real Instagram Graph API credentials
- [ ] Configure Resend with verified domain for email sending
- [ ] Add NextAuth.js or Clerk for real authentication
- [ ] Add Redis for rate limiting (replace in-memory map)
- [ ] Add Stripe for subscription billing

---

## Design System

The platform uses a premium dark-mode aesthetic:

- **Typography**: Cormorant Garamond (serif display) + DM Mono (data/UI)
- **Accent**: `#d4a847` amber — used for all primary highlights and CTAs
- **Surfaces**: 3-layer dark system (`#09090e` → `#111118` → `#17171f` → `#1e1e28`)
- **Motion**: CSS keyframe animations with staggered `animation-delay`
