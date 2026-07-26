# Duli Interiors

India-focused interior design and project-management platform. Customers plan a
space, get AI-assisted room concepts, browse a curated product catalog, receive
a transparent estimate and a branded proposal, and track execution from brief to
handover — all in one place.

Built as a Next.js application backed by Supabase, with row-level security on
every table and a human review step before any AI concept reaches a customer.

## Features

**Marketing site**
- Animated landing pages, style quiz, idea gallery, pricing and partner programmes.

**Accounts & roles**
- Email/password and Google sign-in.
- Role-based access (customer, designer, vendor, contractor, sales, admin)
  enforced by Postgres row-level security.

**Project workspace**
- Rooms, measurements and photo/floor-plan uploads to private storage.
- 2D floor planner — trace rooms on a snap grid, drop doors and windows, and get
  live carpet-area totals.

**AI (human-reviewed)**
- Room analysis via Google Gemini. Every concept is clearly labelled and reviewed
  by staff before it is shared with a customer.

**Sourcing & quoting**
- Product catalog with vendor sourcing and add-to-project selections.
- Estimate builder seeded from the selections or the drawn floor plan, with
  GST-aware totals.
- Branded, print-ready proposal (save as PDF) including the room schedule and
  floor plan.

**Collaboration & operations**
- Consultations with list and calendar views, notifications, activity feed and
  comments.
- Admin review workflow, vendor portal and partner applications.

## Tech stack

- **Framework** — Next.js 14 (App Router), React 18, TypeScript
- **Styling** — Tailwind CSS with hand-written CSS, GSAP / Lenis motion
- **Backend** — Supabase (Postgres, Auth, Storage, row-level security)
- **AI** — Google Gemini (multimodal room analysis)
- **Email** — Resend (transactional)

## Getting started

### Prerequisites

- Node.js 18+
- A Supabase project (Postgres, Auth and Storage)

### 1. Install

```bash
npm install
```

### 2. Configure the environment

```bash
cp .env.example .env.local
```

Fill in the values — Supabase URL and keys, the Gemini key, and the Resend key.
`.env.local` is gitignored; never commit secrets.

### 3. Set up the database

In the Supabase SQL editor, run `supabase/apply_all.sql` (or the numbered files
in `supabase/migrations/` in order). This creates the schema, row-level-security
policies and helper functions.

### 4. Run

```bash
npm run dev
```

Then open http://localhost:3000.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Project structure

```
app/            Next.js routes
  (auth)/       sign in, register, password reset
  (app)/        authenticated workspace (dashboard, projects, catalog, …)
  admin/        staff review, users, catalog, vendors
  proposal/     standalone print-ready proposal
components/     shared UI and feature components
lib/            server actions, Supabase clients, services and domain logic
supabase/       SQL schema and migrations
public/         static assets (images, 3D models)
```

## Notes

- Pricing is a deterministic rule engine — never AI-generated.
- Every AI concept carries an "AI-generated design concept" label and is
  human-reviewed before it reaches a customer.

---

© Duli Interiors. All rights reserved.
