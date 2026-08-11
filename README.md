<<<<<<< HEAD
# StockPulse ERP + CRM

A complete **Mini ERP + CRM Operations Portal** for a wholesale/distribution
company. Sales, warehouse, and accounts teams manage customers, products,
stock, and sales challans through a single web app.

- **Backend**: Node.js + Express.js + PostgreSQL (REST API, JWT auth, role-based access)
- **Frontend**: React 18 + Vite (responsive admin UI)
- **Language**: JavaScript only (both apps)

---

## Features

| Module | What you can do |
|---|---|
| **Auth & Roles** | JWT login; roles Admin, Sales, Warehouse, Accounts; role-guarded endpoints |
| **Customer CRM** | Add/edit/search customers, customer detail page, follow-up notes timeline, status/type filters, pagination |
| **Product & Inventory** | Product CRUD, opening-stock logging, manual stock adjustments, append-only stock movement history, low-stock indicators |
| **Sales Challan** | Create draft challans (multi-product), auto challan number, transactional confirm that deducts stock, oversell rejection with no partial deduction, line-item **product snapshots** (name/SKU/price at sale time), cancel |

See [docs/architecture.md](docs/architecture.md) for a deep dive.

---

## Tech stack

- Backend: Node.js ≥ 18, Express 4, `pg`, `bcryptjs`, `jsonwebtoken`, `express-validator`, `cors`, `dotenv`
- Frontend: React 18, Vite 5, React Router 6
- Database: PostgreSQL 14+

---

## Project structure

```
stockpulse-erp/
├── backend/
│   ├── .env.example            # copy to .env
│   ├── src/
│   │   ├── server.js / app.js  # entry points
│   │   ├── config/             # env + pg pool
│   │   ├── middleware/         # auth, role guard, validation, errors
│   │   ├── models/             # raw SQL data access
│   │   ├── services/           # transactional business logic (challans, stock)
│   │   ├── controllers/        # request handlers
│   │   ├── routes/             # API routes
│   │   ├── validators/         # express-validator chains
│   │   └── db/                 # migrations.sql, seed, setup/reset scripts
│   └── package.json
├── frontend/
│   ├── .env.example
│   ├── src/
│   │   ├── api/                # fetch client + per-module API wrappers
│   │   ├── context/            # AuthContext (JWT state)
│   │   ├── components/         # Layout, ProtectedRoute, tables, modals, badges
│   │   ├── pages/              # auth, dashboard, customers/, products/, challans/
│   │   └── styles/index.css
│   └── package.json
├── postman/
│   └── stockpulse-erp.postman_collection.json
├── docs/
│   └── architecture.md
└── README.md
```

---

## Local setup

### Prerequisites

- Node.js ≥ 18
- PostgreSQL 14+ running locally

### 1. Database

```bash
cd backend
cp .env.example .env       # Windows: copy .env.example .env
# edit .env → set DATABASE_URL to your Postgres connection
createdb stockpulse        # create the database (or via psql)
npm install
npm run db:setup           # runs migrations + seed in one step
```

`npm run db:setup` = `db:migrate` + `db:seed`. To wipe and start fresh:
`npm run db:reset && npm run db:setup`.

### 2. Backend

```bash
cd backend
npm install
npm run dev                # http://localhost:5000
```

Health check: `GET http://localhost:5000/health`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev                # http://localhost:5173
```

The Vite dev server proxies `/api` to `http://localhost:5000`, so no extra
config is needed locally. To point at a remote backend, set `VITE_API_URL`
in `frontend/.env`.

---

## Test login credentials (seeded)

Password for **all** accounts is `password123`:

| Role      | Email                       |
|-----------|-----------------------------|
| Admin     | `admin@stockpulse.com`      |
| Sales     | `sales@stockpulse.com`      |
| Warehouse | `warehouse@stockpulse.com`  |
| Accounts  | `accounts@stockpulse.com`   |

The login page has one-click buttons that prefill each account.

---

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | no | `development` / `production` |
| `PORT` | no | API port (default `5000`) |
| `DATABASE_URL` | yes | Postgres connection string, e.g. `postgres://user:pass@host:5432/db` |
| `JWT_SECRET` | yes | Long random string; never commit a real one |
| `JWT_EXPIRES_IN` | no | Token lifetime (default `8h`) |
| `CORS_ORIGINS` | no | Comma-separated allowed origins (default `http://localhost:5173`) |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL. Leave empty to use the dev proxy. |

---

## API overview

All endpoints under `/api`. Auth: `Authorization: Bearer <token>`.

| Method | Path | Description |
|---|---|---|
| POST | `/auth/login` | Login → `{ token, user }` |
| GET | `/auth/me` | Current user |
| GET | `/customers?page=&limit=&search=&status=&customer_type=` | List/search customers |
| POST | `/customers` | Create customer |
| GET | `/customers/:id` | Customer detail |
| PUT | `/customers/:id` | Update customer |
| DELETE | `/customers/:id` | Delete customer (Admin/Sales) |
| GET | `/customers/:id/follow-ups` | Follow-up notes |
| POST | `/customers/:id/follow-ups` | Add follow-up note (Admin/Sales) |
| GET | `/products?page=&limit=&search=&category=&lowStock=` | List/search products |
| POST | `/products` | Create product (Admin/Warehouse) |
| GET | `/products/:id` | Product detail |
| PUT | `/products/:id` | Update product (Admin/Warehouse) |
| DELETE | `/products/:id` | Delete product (Admin) |
| POST | `/products/:id/stock` | Adjust stock IN/OUT (Admin/Warehouse) |
| GET | `/products/:id/movements` | Stock movement history |
| GET | `/products/categories` | Distinct categories |
| GET | `/challans?page=&limit=&search=&status=` | List challans |
| POST | `/challans` | Create draft challan (Admin/Sales) |
| GET | `/challans/:id` | Challan detail with line-item snapshots |
| PUT | `/challans/:id/confirm` | Confirm: deduct stock atomically (Admin/Sales/Warehouse) |
| PUT | `/challans/:id/cancel` | Cancel draft (Admin/Sales) |

A complete Postman collection covering every endpoint lives at
`postman/stockpulse-erp.postman_collection.json` (import into Postman, run
top-to-bottom against a fresh seeded DB).

---

## Key business rules

1. **No overselling** — confirming a challan validates and deducts stock inside
   a single transaction with row locks (`SELECT ... FOR UPDATE`). If any line
   lacks stock, the whole confirmation is rejected with a clear error and
   *no* stock is deducted anywhere.
2. **Product snapshots** — each challan line stores product name, SKU, and
   price at the time of sale, so historical challans stay correct even after
   product edits.
3. **Audit trail** — every stock change (opening stock, challan sale, manual
   adjustment) writes a `stock_movements` row with quantity, type, reason, user,
   and optional challan link.

---

## Deployment

### Backend (Render / Railway / Fly.io)

1. Push the repo to GitHub.
2. Create a Postgres database (Neon / Supabase / Render Postgres).
3. Set env vars on the host: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS` (your frontend URL), `NODE_ENV=production`, `PORT`.
4. Build command: `cd backend && npm install`
5. Start command: `node src/server.js`
6. Run `npm run db:setup` against the production DB once (or run migrations + seed in a one-off job).

### Frontend (Vercel / Netlify)

1. Framework preset: Vite.
2. Build command: `cd frontend && npm install && npm run build`
3. Publish directory: `frontend/dist`
4. Env var: `VITE_API_URL=https://your-backend.onrender.com/api`

## Assumptions made

- No TypeScript, no Docker, no CI/CD, no PDF/invoice export (explicitly out of scope per plan).
- Challans carry no monetary total beyond line totals; invoicing is out of scope.
- Cancelling an already-confirmed challan is blocked (would require a
  reverse-transaction policy decision) — only drafts can be cancelled.
- SKU is unique and immutable once created (edit screen disables it).
- `current_stock` for a new product is the "opening stock"; it is logged as an
  `IN` movement and stored once.
- JWT expires after 8h; users can log back in.

## Known limitations

- **Confirmed-challan cancellation** is intentionally not supported (see assumptions).
- No email/SMS notifications for follow-ups.
- No bulk import/export (CSV) of customers/products.
- Frontend is intentionally dependency-light (no UI kit); styling is hand-written CSS.
- No automated test suite checked in — verification was done via an end-to-end
  API script (24 assertions) covering auth, CRUD, and the challan
  confirm/oversell/snapshot rules.
- Pagination is server-side; UI uses simple prev/next paging.

## Notes

- The provided `backend/.env` contains a local-development-only JWT secret and
  a default local Postgres URL. For any non-local environment, create your own
  `.env` from `.env.example` and use real secrets.
=======
# StockPulse-erp
>>>>>>> 68df4803e323a4f645eefc0a32c0df22c4c0f6ab
