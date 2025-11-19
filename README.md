# OneSearch Job

OneSearch Job is a production-quality web app that helps candidates find relevant job opportunities by aggregating from multiple sources, computing client-side match scores using embeddings, and sending a daily top-10 digest.

## Overview & Features

- **Multi-Source Aggregation**: Ingests jobs from stable Tier A sources (Greenhouse, Lever, RemoteOK) and high-volume Tier B sources (LinkedIn, Naukri, Instahyre, Indeed).
- **Semantic Search**: Uses OpenAI's `text-embedding-3-large` to provide highly relevant job matches based on semantic similarity.
- **Weighted Ranking**: Ranks jobs using a weighted formula that considers title similarity, skills match, location preference, and more.
- **Hardened Scraping**: Tier B sources are accessed via a hardened scraping layer with proxy rotation, user-agent switching, and graceful error handling.
- **Feature-Flagged Connectors**: Each high-risk data source can be enabled or disabled individually via environment variables.
- **Modern Frontend**: Built with Next.js 14, TypeScript, and TailwindCSS, with a clean, responsive UI.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + React + TypeScript + TailwindCSS
- **Hosting**: Vercel (Hobby)
- **Auth + DB**: Supabase (Free Tier with pgvector)
- **Embeddings**: OpenAI `text-embedding-3-large`
- **Scraping**: Playwright with Stealth
- **Email**: Brevo SMTP (Free Plan)
- **CI/CD**: GitHub Actions

## Getting Started

### 1. Set up Supabase

1.  Create a new project on [Supabase](https://supabase.com/).
2.  In your project's SQL Editor, run the contents of the migration files in the `/supabase/migrations` directory in order, starting with `0001_init.sql`.
3.  Go to **Project Settings -> API** to find your Supabase URL and `anon` key.
4.  Go to **Project Settings -> Database -> Password** to get your database password, which is part of the `SUPABASE_SERVICE_ROLE_KEY`.

### 2. Set up Environment Variables

Copy the `.env.example` file to `.env.local` and fill in the required values:

```bash
cp .env.example .env.local
```

See the `.env.example` file for a detailed explanation of each variable.

### 3. Install Dependencies and Run

```bash
pnpm install
pnpm dev
```

The application will be available at `http://localhost:3000`.

## Ingestion Pipeline

The ingestion pipeline is managed by a cron job located at `/app/api/cron/ingest/route.ts`. You can trigger it manually by sending a POST request to this endpoint.

### Configuration

The ingestion pipeline is highly configurable via environment variables. You can enable or disable individual data sources, set rate limits, and configure proxy settings. See the `.env.example` file for more details.

## Operational Runbook

- **Monitoring**: The health of the Tier B scrapers can be monitored by observing the logs for 403/429 errors and the overall success rate of the ingestion cron job.
- **Kill Switches**: Each Tier B connector can be disabled immediately by setting its corresponding `ENABLE_*` environment variable to `false`.
- **Proxy Management**: Ensure your proxy pool is healthy and has a sufficient number of IP addresses to avoid being blocked.

## Phase 2 Roadmap

- **Advanced Filtering**: Add more sophisticated filtering options to the UI, such as salary range, company size, and more.
- **User Dashboard**: Create a dashboard where users can track their applications and manage their job matches.
- **Observability**: Implement a proper observability stack with structured logging and monitoring to track the health of the ingestion pipeline.
