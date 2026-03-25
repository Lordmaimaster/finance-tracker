# Finance Tracker

Polished single-user financial tracking app built with React + Vite (frontend), Express + Node.js (backend), and PostgreSQL (database).

## Features

- Income/expense transactions with filters and CSV export
- Category management (income/expense/both)
- Monthly category budgets with progress indicators
- Dashboard with totals, trends, and category charts
- Recurring transactions with hourly auto-processing
- Light/dark mode and responsive layout

## Tech Stack

- Frontend: React, React Router, Tailwind CSS, Recharts, Axios
- Backend: Express, pg, node-cron, zod, json2csv
- Database: PostgreSQL

## Project Structure

- `client` - React app
- `server` - Express API
- `server/src/db/migrations.sql` - schema setup SQL

## Setup

1. Install dependencies:
   - `npm install`
2. Configure env files:
   - Copy `server/.env.example` to `server/.env`
   - Copy `client/.env.example` to `client/.env`
3. Create database:
   - Create PostgreSQL DB named `finance_tracker`
4. Run migrations + seed (writes schema from `server/src/db/migrations.sql` and inserts default categories):
   - `npm --prefix server run db:seed`
5. Start app (local development):
   - `npm run dev`

Frontend runs on `http://localhost:5173`, backend on `http://localhost:4000`.

## Staging (start backend + migrations)
1. Configure env vars for staging:
   - `server/.env`: set DB connection vars (or `DATABASE_URL`) and `PORT` for staging
   - `client/.env`: set `VITE_API_URL` to your staging API base (must include `/api`)
2. Migrate + seed the database (run once per staging environment / schema change):
   - `npm --prefix server run db:seed`
3. Start the staging backend server:
   - `npm --prefix server run start`

## Production (start backend + migrations)
1. Configure env vars for production:
   - `server/.env`: set DB connection vars (or `DATABASE_URL`) and `PORT` for production
   - `client/.env`: set `VITE_API_URL` to your production API base (must include `/api`)
2. Migrate + seed the database (run once per production environment / schema change):
   - `npm --prefix server run db:seed`
3. Start the production backend server:
   - `npm --prefix server run start`
4. Build the production frontend (served by your hosting provider):
   - `npm --prefix client run build`
   - Host `client/dist` with your web server/CDN (this repo does not include a production “serve client build” backend).

## API Endpoints

- `GET/POST /api/categories`
- `PUT/DELETE /api/categories/:id`
- `GET/POST /api/transactions`
- `PUT/DELETE /api/transactions/:id`
- `GET /api/transactions/export`
- `GET/POST /api/budgets`
- `GET /api/budgets/status`
- `GET/POST /api/recurring`
- `PUT/DELETE /api/recurring/:id`
- `GET /api/dashboard/summary`
