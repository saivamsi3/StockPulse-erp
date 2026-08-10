# StockPulse ERP + CRM — Architecture

## Overview

A two-tier web application:

```
┌────────────────────┐        ┌────────────────────┐        ┌──────────────┐
│  React (Vite) SPA  │  HTTP  │  Express.js API    │   SQL  │  PostgreSQL  │
│  frontend :5173    │ ──────►│  backend  :5000    │ ──────►│  stockpulse  │
│                    │        │  /api/*            │        │              │
└────────────────────┘        └────────────────────┘        └──────────────┘
       JWT in Authorization header (Bearer token)
```

- **Frontend**: React 18 + Vite + React Router. Calls the API through a thin fetch
  client (`src/api/client.js`) that attaches the JWT and normalizes errors.
  In dev, Vite proxies `/api` to the backend, so no CORS is needed locally.
- **Backend**: Express 4 with a layered structure: routes → controllers →
  models (raw SQL over `pg` pool) + services (transactional business logic).
- **Database**: PostgreSQL. Schema + seed are plain SQL/JS scripts, not an ORM.

## Backend layout

```
src/
  app.js                  Express app, middleware wiring, route mounting
  server.js               Entry point (listens on PORT)
  config/env.js           Reads .env, fails fast on missing vars
  config/db.js            pg Pool (single shared connection pool)
  middleware/
    auth.js               JWT verification → req.user
    roleGuard.js          requireRole('Admin', ...)
    validate.js           express-validator result collector
    errorHandler.js       Uniform error JSON + pg error code mapping
  models/                 Raw SQL data access (one file per entity)
  services/
    stock.service.js      changeStock(): locked, transactional stock mutation
    challan.service.js    create draft / confirm / cancel (transactions)
  controllers/            Request handling, status codes
  routes/                 Route definitions + validation + role guards
  validators/             express-validator rule chains
  db/
    migrations.sql        Full schema (idempotent)
    runMigrations.js      Applies migrations.sql
    seed.js               Seeds 4 users + demo data
    setup.js / reset.js   Convenience runners
```

## Key business rules & how they're enforced

### 1. Challan confirmation is atomic (the primary evaluation point)

`challan.service.confirmChallan` runs inside a single DB transaction:

1. `BEGIN`
2. Read challan + line items. If not `Draft`, abort with `409`.
3. For each line item, `SELECT ... FOR UPDATE` on the product row.
   This **locks the row** so two concurrent confirms cannot both pass the
   stock check and oversell.
4. If any line's `current_stock < quantity`, throw `400` with a specific
   "insufficient stock" message. The whole transaction rolls back —
   **no partial deduction on any line**.
5. Deduct stock and write an `OUT` stock-movement row for every line
   (same transaction).
6. Mark challan `Confirmed`, `COMMIT`.

If any step fails, `ROLLBACK` reverts the stock changes and movement log
together, and the challan remains `Draft`.

### 2. Product snapshot on challan lines

`challan_items` stores `product_name`, `product_sku`, `unit_price` (and
`line_total`) at creation time, copied from the product. Later edits to the
product (rename, price change) do not affect historical challans. The detail
view always renders snapshot data.

### 3. Stock movements are an append-only audit log

Every stock change goes through `stock.service.changeStock`:
- Product creation with opening stock → `IN` ("Initial stock on product creation")
- Challan confirmation → `OUT` ("Sale via challan CHL-xxxx", linked via `challan_id`)
- Manual adjustment → `IN`/`OUT` with a user-provided reason

Rows record `quantity_changed`, `movement_type`, `reason`, `created_by`, `challan_id`, timestamp.

### 4. No negative stock anywhere

The `products.current_stock` column has a `CHECK (current_stock >= 0)`
constraint as a final safety net, and the service validates before writing.

## Auth & roles

- `POST /auth/login` → verifies bcrypt hash, returns JWT (payload: sub, role).
- Middleware chain: `requireAuth` (verifies JWT + user active) then
  `requireRole(...)` where restricted.
- Permission matrix (routes enforce these):

| Action                     | Admin | Sales | Warehouse | Accounts |
|----------------------------|:-----:|:-----:|:---------:|:--------:|
| View customers/products/challans |  ✓  |  ✓   |     ✓     |    ✓    |
| Create/edit customers      |   ✓   |  ✓   |     ✗     |    ✗    |
| Delete customer            |   ✓   |  ✓   |     ✗     |    ✗    |
| Add follow-up notes        |   ✓   |  ✓   |     ✗     |    ✗    |
| Create/edit products       |   ✓   |  ✗   |     ✓     |    ✗    |
| Adjust stock               |   ✓   |  ✗   |     ✓     |    ✗    |
| Delete product             |   ✓   |  ✗   |     ✗     |    ✗    |
| Create challan             |   ✓   |  ✓   |     ✗     |    ✗    |
| Confirm challan            |   ✓   |  ✓   |     ✓     |    ✗    |
| Cancel challan             |   ✓   |  ✓   |     ✗     |    ✗    |

## API conventions

- Success shape: `{ "success": true, "data": ... }`; list endpoints add
  `{ "data": [...], "pagination": { page, limit, total, totalPages } }`.
- Error shape: `{ "success": false, "error": { "code": <httpStatus>, "message": "...", "details": [...] } }`.
- HTTP status usage: `201` created, `200` success, `400` validation/business
  rejection, `401` auth, `403` forbidden role, `404` missing resource,
  `409` conflicting state (already confirmed/cancelled, duplicate key), `500` unexpected.
- Validation: `express-validator` on every mutating endpoint; the first failing
  rule produces a 400 with per-field details.

## Why raw SQL instead of an ORM

The two highest-risk requirements — transactional stock deduction and line-item
snapshots — are expressed most clearly and safely as explicit SQL inside a
`BEGIN/COMMIT/ROLLBACK` transaction with row locks. An ORM would obscure the
`FOR UPDATE` locking and the ordering guarantees we rely on.

## Known limitations

See README.md → "Known limitations".
