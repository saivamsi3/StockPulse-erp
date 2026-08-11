<p align="center">
  <br />
  <img src="https://img.shields.io/badge/StockPulse-ERP%20%26%20CRM-2b6cb0?style=for-the-badge" alt="StockPulse ERP + CRM" />
  <br />
  <br />
  A lightweight operations portal for wholesale and distribution teams.
  <br />
  Customers, inventory, stock movements, and sales challans in one place.
  <br />
</p>

<p align="center">
  <a href="#overview">Overview</a> ·
  <a href="#features">Features</a> ·
  <a href="#tech-stack">Tech Stack</a> ·
  <a href="#live-application">Live App</a> ·
  <a href="#quick-start">Quick Start</a> ·
  <a href="#api-summary">API</a> ·
  <a href="#deployment">Deployment</a>
</p>

<p align="center">
  <a href="backend/package.json"><img src="https://img.shields.io/badge/backend-Node.js%20%2B%20Express-339933?style=flat-square" alt="Backend" /></a>
  <a href="frontend/package.json"><img src="https://img.shields.io/badge/frontend-React%2018%20%2B%20Vite-61DAFB?style=flat-square" alt="Frontend" /></a>
  <a href="backend/src/db/migrations.sql"><img src="https://img.shields.io/badge/database-PostgreSQL-4169E1?style=flat-square" alt="Database" /></a>
  <a href="backend/src/middleware/auth.js"><img src="https://img.shields.io/badge/auth-JWT%20%2B%20RBAC-111827?style=flat-square" alt="Auth" /></a>
</p>

---

## Live Application

| Environment | URL |
| --- | --- |
| **Frontend** | https://stockpulse-erp-blue.vercel.app/login |
| **Backend** | https://stockpulse-erp.onrender.com |
| **API Docs** | [docs/api.md](docs/api.md) |

---

## Overview

StockPulse is built for the day-to-day workflow of a small ERP/CRM:

| Team | What they get |
| --- | --- |
| **Sales** | Manage customers, follow-ups, and sales challans |
| **Warehouse** | Manage products, stock levels, and inventory movements |
| **Accounts / Admin** | Role-based access to operational records |

Challan confirmation is transactional, so stock is never partially deducted.

---

## Features

| Area | Capabilities |
| --- | --- |
| **Authentication** | JWT login, current-user endpoint, role-protected routes |
| **Roles** | Admin, Sales, Warehouse, and Accounts permissions |
| **Customers** | Create, edit, search, filter, paginate, and view customer details |
| **Follow-ups** | Customer follow-up notes with timeline history |
| **Products** | Product CRUD, category filtering, low-stock indicators |
| **Inventory** | Opening stock, manual stock adjustments, append-only stock movements |
| **Challans** | Draft creation, multi-product line items, auto challan numbers |
| **Stock Safety** | Atomic confirmation, oversell rejection, row-level stock locking |
| **History Accuracy** | Product name, SKU, and price snapshots stored on challan lines |

> Read the deeper technical notes in [docs/architecture.md](docs/architecture.md).

---

## Tech Stack

| Layer | Tools |
| --- | --- |
| **Frontend** | React 18, Vite 5, React Router 6 |
| **Backend** | Node.js 18+, Express 4 |
| **Database** | PostgreSQL 14+ |
| **Auth** | JWT, bcryptjs |
| **Validation** | express-validator |
| **API Access** | REST endpoints under `/api` |

---

## Project Structure

```text
StockPulse-erp/
|-- backend/
|   |-- src/
|   |   |-- config/        # Environment and PostgreSQL pool
|   |   |-- controllers/   # Request handlers
|   |   |-- db/            # Migrations, seed, setup, reset scripts
|   |   |-- middleware/    # Auth, role guard, validation, errors
|   |   |-- models/        # SQL data access
|   |   |-- routes/        # REST routes
|   |   |-- services/      # Challan and stock business logic
|   |   |-- validators/    # express-validator schemas
|   |   |-- app.js
|   |   `-- server.js
|   `-- package.json
|-- frontend/
|   |-- src/
|   |   |-- api/           # Fetch client and API modules
|   |   |-- components/    # Shared UI components
|   |   |-- context/       # Auth and theme state
|   |   |-- pages/         # Dashboard, auth, customers, products, challans
|   |   `-- styles/
|   `-- package.json
|-- docs/
|   `-- architecture.md
|-- postman/
|   `-- stockpulse-erp.postman_collection.json
|-- plan.md
`-- README.md
```

---

## Quick Start

### Prerequisites

- **Node.js** 18 or newer
- **PostgreSQL** 14 or newer
- **npm**

### 1. Configure the Backend

```bash
cd backend
cp .env.example .env
npm install
```

Update `backend/.env` with your PostgreSQL connection:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/stockpulse
JWT_SECRET=replace-this-with-a-long-random-secret
```

Create the database if it does not exist yet:

```bash
createdb stockpulse
```

Run migrations and seed data:

```bash
npm run db:setup
```

To reset everything during development:

```bash
npm run db:reset
npm run db:setup
```

### 2. Start the Backend

```bash
cd backend
npm run dev
```

- Backend URL: `http://localhost:5000`
- Health check: `GET http://localhost:5000/health`

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

- Frontend URL: `http://localhost:5173`

During local development, Vite proxies `/api` requests to `http://localhost:5000`.

---

## Seeded Login Accounts

All seeded users use the same password: `password123`

| Role | Email |
| --- | --- |
| **Admin** | `admin@stockpulse.com` |
| **Sales** | `sales@stockpulse.com` |
| **Warehouse** | `warehouse@stockpulse.com` |
| **Accounts** | `accounts@stockpulse.com` |

---

## Environment Variables

### Backend

Create `backend/.env` from `backend/.env.example`.

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `NODE_ENV` | No | `development` | Runtime environment |
| `PORT` | No | `5000` | API server port |
| `DATABASE_URL` | Yes | Local Postgres example | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Example only | Secret used to sign JWTs |
| `JWT_EXPIRES_IN` | No | `8h` | Token lifetime |
| `CORS_ORIGINS` | No | `http://localhost:5173` | Comma-separated allowed origins |

### Frontend

Create `frontend/.env` from `frontend/.env.example`.

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Backend base URL. Leave empty locally to use the Vite proxy. |

For deployment, set `VITE_API_URL` to your backend API base URL, for example:

```env
VITE_API_URL=https://your-backend.example.com/api
```

---

## API Summary

All API routes are mounted under `/api`. Protected routes expect:

```http
Authorization: Bearer <token>
```

### Auth

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/auth/login` | Login and receive `{ token, user }` |
| `GET` | `/auth/me` | Get the current authenticated user |

### Customers

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/customers` | List customers with search, filters, and pagination |
| `POST` | `/customers` | Create a customer |
| `GET` | `/customers/:id` | Get customer details |
| `PUT` | `/customers/:id` | Update a customer |
| `DELETE` | `/customers/:id` | Delete a customer |
| `GET` | `/customers/:id/follow-ups` | List customer follow-ups |
| `POST` | `/customers/:id/follow-ups` | Add a follow-up note |

### Products and Inventory

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/products` | List products with search, filters, and pagination |
| `POST` | `/products` | Create a product |
| `GET` | `/products/:id` | Get product details |
| `PUT` | `/products/:id` | Update a product |
| `DELETE` | `/products/:id` | Delete a product |
| `POST` | `/products/:id/stock` | Adjust product stock |
| `GET` | `/products/:id/movements` | View stock movement history |
| `GET` | `/products/categories` | List available product categories |

### Challans

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/challans` | List challans with search, status filter, and pagination |
| `POST` | `/challans` | Create a draft challan |
| `GET` | `/challans/:id` | Get challan details with line items |
| `PUT` | `/challans/:id/confirm` | Confirm challan and deduct stock atomically |
| `PUT` | `/challans/:id/cancel` | Cancel a draft challan |

> Import [postman/stockpulse-erp.postman_collection.json](postman/stockpulse-erp.postman_collection.json) into Postman for a ready-to-run API collection.

---

## Business Rules

1. Challan confirmation uses a database transaction.
2. Stock rows are locked during confirmation to prevent race conditions.
3. If any challan line does not have enough stock, confirmation fails completely.
4. Confirmed challans deduct stock and create stock movement records.
5. Challan line items store product snapshots, preserving historical names, SKUs, and prices.
6. Confirmed challans cannot be cancelled in the current workflow.

---

## Useful Scripts

### Backend

| Command | Description |
| --- | --- |
| `npm run dev` | Start the API with Node watch mode |
| `npm start` | Start the API normally |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed default users and sample data |
| `npm run db:setup` | Run migrations and seed data |
| `npm run db:reset` | Reset database tables |

### Frontend

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Build the production frontend |
| `npm run preview` | Preview the production build locally |

---

## Deployment

### Backend

Suitable hosts include **Render**, **Railway**, **Fly.io**, or any Node.js host with PostgreSQL access.

Required production environment variables:

```env
NODE_ENV=production
DATABASE_URL=postgres://user:password@host:5432/database
JWT_SECRET=your-long-production-secret
CORS_ORIGINS=https://your-frontend-domain.com
```

Typical commands:

```bash
npm install
npm start
```

Run `npm run db:setup` once against the production database before first use.

### Frontend

Suitable hosts include **Vercel**, **Netlify**, or any static hosting provider.

```bash
npm install
npm run build
```

Publish directory:

```text
frontend/dist
```

---

## License

No license file is currently included. Add one before distributing this project publicly.
