# LeadGen Intel — Lead Generation Intelligence Platform

A production-ready SaaS platform for discovering businesses and professionals in any geographic area, generating detailed lead reports with AI-powered scoring.

## Features

- 🔍 **Multi-Source Lead Discovery** — Google Places API with fallback demo mode
- 🌐 **Website Crawling & Enrichment** — Extract emails, social profiles, contact info
- 🧠 **AI Lead Scoring** — 0-100 score based on 6 weighted factors
- 📊 **Rich Dashboard** — Stats, charts, and recent search activity
- 📋 **Grid & Table Views** — Multiple ways to browse leads
- 📥 **Export** — CSV and JSON export with all lead fields
- 🔎 **Advanced Filters** — By rating, reviews, contact availability
- 📱 **Responsive Design** — Beautiful dark theme with glassmorphism
- 🔄 **Search History** — View, revisit, and re-export past searches
- ⚡ **Real-time Progress** — Live search progress tracking

## Quick Start

```bash
cd app-frontend
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

## Demo Mode

The platform works **out of the box** without any API keys. It generates realistic demo data for:
- Dentists, Restaurants, Real Estate Agents, Accountants, Interior Designers
- And any custom business category with AI-generated sample businesses

To enable live Google Places data, add your API key to `.env.local`:

```
GOOGLE_PLACES_API_KEY=your_key_here
```

## Architecture

```
src/
├── app/                    # Next.js 15 App Router
│   ├── page.tsx           # Dashboard
│   ├── search/            # New Search
│   ├── results/[id]/      # Search Results
│   ├── history/           # Search History
│   ├── settings/          # Settings & API Keys
│   └── api/               # API Routes
│       └── searches/      # Search CRUD + Export
├── components/
│   ├── layout/            # AppShell, Sidebar
│   ├── leads/             # LeadCard, LeadTable, LeadDetail, LeadScoreRing
│   └── search/            # SearchForm
└── lib/
    ├── services/          # Business logic
    │   ├── google-places.ts      # Google Places API + demo data
    │   ├── web-crawler.ts        # Website crawling & email extraction
    │   ├── search-orchestrator.ts # Search pipeline coordinator
    │   ├── scoring-engine.ts     # AI lead scoring
    │   └── export-service.ts     # CSV/JSON export
    └── types/             # TypeScript definitions
```

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/searches` | Create new search job |
| GET | `/api/searches` | List all search jobs |
| GET | `/api/searches/:id` | Get search job details |
| GET | `/api/searches/:id/results` | Get search results |
| POST | `/api/searches/:id/export` | Export results (CSV/JSON) |

## Lead Scoring

| Factor | Weight | Max Points |
|--------|--------|------------|
| Website Exists | 20% | 20 |
| Email Found | 25% | 25 |
| Phone Found | 15% | 15 |
| Rating ≥ 4.0 | 15% | 15 |
| Reviews ≥ 50 | 15% | 15 |
| Social Profiles | 10% | 10 |

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Fonts**: Inter + JetBrains Mono

## Phase 2 (Planned)

- [ ] Supabase PostgreSQL database persistence
- [ ] Supabase Auth (Admin + User roles)
- [ ] Stripe billing integration
- [ ] BullMQ job queue for async processing
- [ ] PDF export
- [ ] Excel export
- [ ] Public directory adapters (Yelp, Yellow Pages, etc.)
- [ ] Webhook notifications
