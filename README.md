# OneSearch Job

OneSearch Job is a web application that helps job candidates find relevant job openings by aggregating listings from multiple sources and ranking them based on a personalized relevance score.

## Features

- **User Profiles**: Create a profile with your job title, years of experience, skills, and preferred locations.
- **Job Aggregation**: Ingests jobs from Greenhouse, Lever, Ashby, and RemoteOK.
- **Client-Side Matching**: Computes a relevance score for each job using in-browser embeddings.
- **Daily Digests**: Receive a daily email with your top 10 job matches.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + React + TypeScript + TailwindCSS
- **Hosting**: Vercel
- **Auth & DB**: Supabase
- **Cron Jobs**: Vercel Cron
- **Email**: Brevo SMTP
- **Matching**: `onnxruntime-web` + `all-MiniLM-L6-v2`

## Getting Started

### 1. Set up your Supabase project

1.  Create a new project on [Supabase](https://supabase.com/).
2.  In the SQL Editor, run the schema from `/supabase/migrations/0001_init.sql`.
3.  Go to **Project Settings -> API** and get your **Project URL** and **anon key**.

### 2. Set up your environment variables

1.  Copy `.env.example` to `.env.local`.
2.  Fill in the values for `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3.  Set up an SMTP provider (like Brevo) and fill in the `SMTP_*` variables.
4.  Generate a secret token for the `ADMIN_TOKEN` variable.

### 3. Install dependencies and run the app

```bash
npm install
npm run dev
```

### 4. Seed the database

```bash
npm run seed:companies
npm run seed:remoteok
```

## Guest Mode

This application includes a Guest Mode that allows users to try the app without creating an account. To enable Guest Mode, set the following environment variable:

```
NEXT_PUBLIC_GUEST_MODE=true
```

When Guest Mode is enabled, user profiles are stored in `localStorage` instead of the database, and all authentication flows are bypassed.

### Guest Mode RLS Policies

To support Guest Mode, the following Row Level Security (RLS) policies have been added to the database:

-   **Read-only access to `jobs`:** Allows anonymous users to view job listings.
-   **Read-only access to `companies`:** Allows anonymous users to view company information.

## Deployment

This project is optimized for deployment on [Vercel](https://vercel.com/).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fonesearch-job)

## Phase 2 TODO

-   [ ] Integrate Google Programmable Search + Cloud Run extractor.
-   [ ] Add more ATS sources (Workable, Teamtailor).
-   [ ] Implement end-to-end tests.
-   [ ] Add more robust error handling and logging.
