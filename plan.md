# Master Prompt: Build the Mini ERP + CRM Operations Portal (36-Hour Build)

You are an expert full-stack engineer. Build a complete, working **Mini ERP + CRM Operations Portal** for a wholesale/distribution company, using the exact tech stack, modules, and business logic below. Generate real, runnable code (not pseudocode) — actual files, actual folder structure, actual working logic — following the phased build order at the end so the output can be produced incrementally.

## Business Context
The company deals with customers, products, stock, purchase orders, sales challans, invoices, and basic CRM follow-ups. Internal teams (sales, warehouse, accounts) will use this system daily. The goal is not size or complexity for its own sake — it should demonstrate solid backend API design, database schema design, frontend UI, deployment readiness, and correct real-world business logic.

## Required Tech Stack
**Backend:** Node.js (JavaScript) + Express.js or NestJS + PostgreSQL + REST APIs + proper validation and error handling
**Frontend:** React (JavaScript) + HTML/CSS, responsive clean admin-style UI
**Deployment/DevOps:** AWS optional bonus; free-tier acceptable (Vercel/Netlify/Render for frontend; Render/Railway/Fly.io for backend; Supabase/Neon/Render Postgres for DB); environment variables for all config/secrets; documented server setup; GitHub repo with meaningful incremental commits; README with full setup instructions

## Core Modules & Business Logic

### 1. Authentication & Roles
- JWT-based login
- Roles: Admin, Sales, Warehouse, Accounts
- Role-based access control on relevant endpoints

### 2. Customer CRM Module
Fields: customer name, mobile number, email, business name, GST number (optional), customer type (Retail/Wholesale/Distributor), address, status (Lead/Active/Inactive), follow-up date, notes.
Features: add, edit, search, view customer detail page, add follow-up notes.

### 3. Product & Inventory Module
Fields: product name, SKU/code, category, unit price, current stock, minimum stock alert quantity, location/warehouse.
Features: add product, edit product.
Stock movement log must track: product, quantity changed, movement type (IN/OUT), reason, created by, timestamp.

### 4. Sales Challan Module (core module — most business logic risk)
Flow: sales user selects customer, adds multiple products with quantities, system auto-generates a challan number, saves as Draft or Confirmed.
Business logic (must be enforced server-side, inside a DB transaction):
- Confirming a challan reduces stock accordingly.
- Stock must never go negative — if insufficient stock on any line item, reject the whole confirmation with a proper error (no partial deduction).
- Challan must store a **product snapshot** (name, price, SKU at time of sale) on each line item, not just a product ID reference.
Challan fields: challan number, customer, products, total quantity, status (Draft/Confirmed/Cancelled), created by, created date.

## API Expectations
- Clean REST APIs, e.g. `POST /auth/login`, `GET /customers`
- Input validation on every endpoint
- Correct HTTP status codes, consistent error response shape
- Pagination and search/filter where relevant (customers, products)

## Deliverables
1. GitHub repository (proper incremental commits)
2. Live frontend URL (or local setup + screen recording if not deployed)
3. Live backend API URL (or local setup + screen recording if not deployed)
4. Test login credentials for all 4 roles
5. Postman collection covering every endpoint
6. README: server setup, env var management, local run instructions, deployment steps, assumptions made
7. Short architecture write-up
8. Known limitations / incomplete parts

## Out of Scope / Cut List (skip unless explicitly asked)
Do not build these unless requested — they are not required and would waste time in a 36-hour build:
- Purchase orders / invoices beyond what's listed above
- Bonus features: Docker, GitHub Actions CI/CD, PDF export, AWS S3 image upload
- Any UI polish beyond clean and usable
- Deployment, if time is short — local working setup + recording is an accepted substitute

---

## Phased Build Order (36 hours total)
Generate the project in this order. At the end of each phase, the code should be in a runnable, checkpointed state before moving to the next phase.

**Phase 0 — Setup & Schema (Hours 0–2)**
Project scaffold for backend (Node.js/Express or NestJS) and frontend (React, Vite recommended), PostgreSQL schema covering Users/Roles, Customers, Products, Stock Movements, Challans, Challan Items, `.env`/`.env.example` for both apps.
Checkpoint: both apps run locally with empty routes; DB migrations run clean.

**Phase 1 — Auth & Roles (Hours 2–6)**
Users table + bcrypt password hashing, `POST /auth/login` issuing JWT, auth middleware + role guard, seed script with one test user per role, frontend login page + protected route shell.
Checkpoint: can log in as each of the 4 roles and hit a protected test endpoint.

**Phase 2 — Customer CRM Module (Hours 6–12)**
Backend CRUD + search/pagination on customers, follow-up notes sub-resource. Frontend: customer list (search + pagination), add/edit form, detail page with notes.
Checkpoint: full add/edit/search/view/notes flow works from the UI.

**Phase 3 — Product & Inventory Module (Hours 12–18)**
Backend product CRUD, stock movement log table with auto-write on every stock change, low-stock flag logic. Frontend: product list with low-stock indicator, add/edit form, stock movement history view.
Checkpoint: can add/edit products and see stock levels + movement history in the UI.

**Phase 4 — Sales Challan Module (Hours 18–26, highest priority)**
Backend: challan + challan_items models with product snapshot fields, auto-generated challan number, `POST /challans` (Draft), `PUT /challans/:id/confirm` (transactional stock validation + deduction + movement log write, reject on insufficient stock), `PUT /challans/:id/cancel`. Frontend: create challan (select customer, add multiple products + qty), Draft/Confirm actions, challan list + detail view.
Checkpoint: confirming a challan deducts stock correctly, blocks over-selling with a clean error, and detail view shows snapshot data, not live product data.

**Phase 5 — API Hardening & Docs (Hours 26–30)**
Consistent status codes and error shape across all endpoints, validation review, full Postman collection, README (setup, env vars, run, deploy, assumptions).
Checkpoint: Postman collection runs top-to-bottom against a fresh seeded DB with no manual fixes.

**Phase 6 — Deployment (Hours 30–34)**
Deploy backend, DB, and frontend to free-tier hosts; smoke-test the full flow live. If time is short, skip deployment and note that a local walkthrough recording is the fallback.
Checkpoint: live URLs work end-to-end, or local fallback is clearly documented.

**Phase 7 — Final Polish & Submission (Hours 34–36)**
UI consistency pass, responsive check, re-verify all 4 role credentials on the final build, finalize README with architecture summary and known limitations, final commit/tag.
Checkpoint: every item in the Deliverables list above is ready to hand off.

---

## Instructions for Generation
- Work phase by phase in the order above. For each phase, output the actual file contents (paths + full code), not summaries.
- Enforce the negative-stock and snapshot rules in Phase 4 exactly as specified — this is the primary evaluation point of the whole build.
- Use environment variables for all secrets/config — never hardcode credentials.
- Keep code JavaScript only, no TypeScript, on both backend and frontend.
- After all phases, output the final README.md, the Postman collection JSON, and a short architecture + limitations summary.