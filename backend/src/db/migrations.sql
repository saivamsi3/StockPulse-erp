-- =====================================================================
-- StockPulse ERP - PostgreSQL schema
-- Run with: npm run db:migrate
-- Re-runnable: uses CREATE TABLE IF NOT EXISTS and CREATE INDEX IF NOT EXISTS
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------
-- Users & Roles
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'Sales', 'Warehouse', 'Accounts')),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- Customers (CRM)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  mobile        VARCHAR(20),
  email         VARCHAR(255),
  business_name VARCHAR(255),
  gst_number    VARCHAR(50),
  customer_type VARCHAR(20) CHECK (customer_type IN ('Retail', 'Wholesale', 'Distributor')),
  address       TEXT,
  status        VARCHAR(20) NOT NULL DEFAULT 'Lead' CHECK (status IN ('Lead', 'Active', 'Inactive')),
  follow_up_date DATE,
  notes         TEXT,
  created_by    INTEGER REFERENCES users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Follow-up notes (sub-resource of customers)
CREATE TABLE IF NOT EXISTS follow_ups (
  id          SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  note        TEXT NOT NULL,
  created_by  INTEGER REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- Products & Inventory
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(255) NOT NULL,
  sku            VARCHAR(100) NOT NULL UNIQUE,
  category       VARCHAR(100),
  unit_price     NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  current_stock  INTEGER NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
  min_stock_alert INTEGER NOT NULL DEFAULT 0 CHECK (min_stock_alert >= 0),
  location       VARCHAR(255),
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- Challans
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS challans (
  id              SERIAL PRIMARY KEY,
  challan_number  VARCHAR(50) NOT NULL UNIQUE,
  customer_id     INTEGER NOT NULL REFERENCES customers(id),
  status          VARCHAR(20) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Confirmed', 'Cancelled')),
  total_quantity  INTEGER NOT NULL DEFAULT 0 CHECK (total_quantity >= 0),
  notes           TEXT,
  created_by      INTEGER REFERENCES users(id),
  confirmed_by    INTEGER REFERENCES users(id),
  confirmed_at    TIMESTAMPTZ,
  cancelled_by    INTEGER REFERENCES users(id),
  cancelled_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Challan line items with product snapshot (name, SKU, price at time of sale)
CREATE TABLE IF NOT EXISTS challan_items (
  id           SERIAL PRIMARY KEY,
  challan_id   INTEGER NOT NULL REFERENCES challans(id) ON DELETE CASCADE,
  product_id   INTEGER NOT NULL REFERENCES products(id),
  product_name VARCHAR(255) NOT NULL,
  product_sku  VARCHAR(100) NOT NULL,
  unit_price   NUMERIC(12, 2) NOT NULL,
  quantity     INTEGER NOT NULL CHECK (quantity > 0),
  line_total   NUMERIC(12, 2) NOT NULL
);

-- ---------------------------------------------------------------------
-- Stock movements (log of every stock change)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stock_movements (
  id               SERIAL PRIMARY KEY,
  product_id       INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity_changed INTEGER NOT NULL,
  movement_type    VARCHAR(5) NOT NULL CHECK (movement_type IN ('IN', 'OUT')),
  reason           VARCHAR(255) NOT NULL,
  created_by       INTEGER REFERENCES users(id),
  challan_id       INTEGER REFERENCES challans(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_customers_name        ON customers (name);
CREATE INDEX IF NOT EXISTS idx_customers_status      ON customers (status);
CREATE INDEX IF NOT EXISTS idx_customers_follow_up   ON customers (follow_up_date);
CREATE INDEX IF NOT EXISTS idx_follow_ups_customer   ON follow_ups (customer_id);
CREATE INDEX IF NOT EXISTS idx_products_name         ON products (name);
CREATE INDEX IF NOT EXISTS idx_products_category     ON products (category);
CREATE INDEX IF NOT EXISTS idx_stock_movements_prod  ON stock_movements (product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_time  ON stock_movements (created_at);
CREATE INDEX IF NOT EXISTS idx_challans_number       ON challans (challan_number);
CREATE INDEX IF NOT EXISTS idx_challans_customer     ON challans (customer_id);
CREATE INDEX IF NOT EXISTS idx_challans_status       ON challans (status);
CREATE INDEX IF NOT EXISTS idx_challan_items_challan ON challan_items (challan_id);
CREATE INDEX IF NOT EXISTS idx_challan_items_product ON challan_items (product_id);
