const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const SEED_PASSWORD = 'password123';

const users = [
  { name: 'Admin User', email: 'admin@stockpulse.com', role: 'Admin' },
  { name: 'Sales User', email: 'sales@stockpulse.com', role: 'Sales' },
  { name: 'Warehouse User', email: 'warehouse@stockpulse.com', role: 'Warehouse' },
  { name: 'Accounts User', email: 'accounts@stockpulse.com', role: 'Accounts' },
];

const customers = [
  {
    name: 'Rajesh Traders',
    mobile: '9876543210',
    email: 'rajesh@rajeshtraders.com',
    business_name: 'Rajesh Traders Pvt Ltd',
    gst_number: '27AAPFR2339F1Z5',
    customer_type: 'Wholesale',
    address: '14, Gandhi Market, Mumbai, MH 400001',
    status: 'Active',
    follow_up_date: null,
    notes: 'Key wholesale buyer, prefers credit terms.',
  },
  {
    name: 'Meena Stores',
    mobile: '9988776655',
    email: 'meena@meenastores.in',
    business_name: 'Meena Stores',
    gst_number: '',
    customer_type: 'Retail',
    address: '22, MG Road, Pune, MH 411001',
    status: 'Lead',
    follow_up_date: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
    notes: 'Asked for a price list, follow up.',
  },
  {
    name: 'Kaveri Distributors',
    mobile: '9123456780',
    email: 'info@kaveridist.com',
    business_name: 'Kaveri Distribution Network',
    gst_number: '33ABCDE1234F1Z2',
    customer_type: 'Distributor',
    address: '5, Industrial Estate, Coimbatore, TN 641001',
    status: 'Active',
    follow_up_date: null,
    notes: 'Distributes to 40+ retail shops.',
  },
  {
    name: 'Sunny Hardware',
    mobile: '9090909090',
    email: 'sunny@sunnyhardware.com',
    business_name: 'Sunny Hardware & Tools',
    gst_number: '',
    customer_type: 'Retail',
    address: '77, Main Bazaar, Nagpur, MH 440001',
    status: 'Inactive',
    follow_up_date: null,
    notes: 'Inactive since last quarter.',
  },
];

const products = [
  { name: 'LED Bulb 9W', sku: 'LED-9W', category: 'Lighting', unit_price: 85, current_stock: 500, min_stock_alert: 50, location: 'A1-Shelf1' },
  { name: 'LED Bulb 12W', sku: 'LED-12W', category: 'Lighting', unit_price: 110, current_stock: 320, min_stock_alert: 50, location: 'A1-Shelf2' },
  { name: 'Ceiling Fan 1200mm', sku: 'FAN-1200', category: 'Appliances', unit_price: 1450, current_stock: 120, min_stock_alert: 25, location: 'B2-Rack3' },
  { name: 'Extension Board 4-Socket', sku: 'EXT-4S', category: 'Electricals', unit_price: 220, current_stock: 40, min_stock_alert: 20, location: 'B3-Rack1' },
  { name: 'Copper Wire 1.5mm (roll)', sku: 'WIRE-15', category: 'Wiring', unit_price: 1890, current_stock: 15, min_stock_alert: 10, location: 'C1-Rack2' },
  { name: 'MCB 16A Single Pole', sku: 'MCB-16', category: 'Electricals', unit_price: 135, current_stock: 8, min_stock_alert: 20, location: 'B3-Rack4' },
];

const followUps = [
  { customerEmail: 'meena@meenastores.in', note: 'Called to share latest price list.' },
  { customerEmail: 'rajesh@rajeshtraders.com', note: 'Discussed quarterly discount slab.' },
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);
    const adminId = {};

    for (const u of users) {
      const existing = await client.query('SELECT id FROM users WHERE email = $1', [u.email]);
      if (existing.rowCount > 0) {
        adminId[u.role] = existing.rows[0].id;
        continue;
      }
      const res = await client.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
        [u.name, u.email, passwordHash, u.role]
      );
      adminId[u.role] = res.rows[0].id;
    }

    const customerIds = {};
    for (const c of customers) {
      const existing = await client.query(
        'SELECT id FROM customers WHERE LOWER(name) = LOWER($1)',
        [c.name]
      );
      let id;
      if (existing.rowCount > 0) {
        id = existing.rows[0].id;
      } else {
        const res = await client.query(
          `INSERT INTO customers (name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           RETURNING id`,
          [c.name, c.mobile, c.email, c.business_name, c.gst_number, c.customer_type, c.address, c.status, c.follow_up_date, c.notes, adminId.Sales]
        );
        id = res.rows[0].id;
      }
      customerIds[c.email] = id;
    }

    for (const f of followUps) {
      const custId = customerIds[f.customerEmail];
      if (!custId) continue;
      const exists = await client.query(
        'SELECT id FROM follow_ups WHERE customer_id = $1 AND note = $2',
        [custId, f.note]
      );
      if (exists.rowCount === 0) {
        await client.query(
          'INSERT INTO follow_ups (customer_id, note, created_by) VALUES ($1, $2, $3)',
          [custId, f.note, adminId.Sales]
        );
      }
    }

    const productIds = {};
    for (const p of products) {
      const existing = await client.query('SELECT id FROM products WHERE sku = $1', [p.sku]);
      let id;
      if (existing.rowCount > 0) {
        id = existing.rows[0].id;
      } else {
        const res = await client.query(
          `INSERT INTO products (name, sku, category, unit_price, current_stock, min_stock_alert, location)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id`,
          [p.name, p.sku, p.category, p.unit_price, p.current_stock, p.min_stock_alert, p.location]
        );
        id = res.rows[0].id;
      }
      productIds[p.sku] = id;
    }

    const stockMovements = [
      { sku: 'LED-9W', qty: 500, type: 'IN', reason: 'Initial stock' },
      { sku: 'LED-12W', qty: 320, type: 'IN', reason: 'Initial stock' },
      { sku: 'FAN-1200', qty: 120, type: 'IN', reason: 'Initial stock' },
      { sku: 'EXT-4S', qty: 40, type: 'IN', reason: 'Initial stock' },
      { sku: 'WIRE-15', qty: 15, type: 'IN', reason: 'Initial stock' },
      { sku: 'MCB-16', qty: 8, type: 'IN', reason: 'Initial stock' },
    ];
    for (const m of stockMovements) {
      const pid = productIds[m.sku];
      if (!pid) continue;
      const exists = await client.query(
        'SELECT id FROM stock_movements WHERE product_id = $1 AND reason = $2 AND quantity_changed = $3',
        [pid, m.reason, m.qty]
      );
      if (exists.rowCount === 0) {
        await client.query(
          'INSERT INTO stock_movements (product_id, quantity_changed, movement_type, reason, created_by) VALUES ($1, $2, $3, $4, $5)',
          [pid, m.qty, m.type, m.reason, adminId.Warehouse]
        );
      }
    }

    await client.query('COMMIT');
    console.log('[seed] Database seeded.');
    console.log('Users (password for all: ' + SEED_PASSWORD + '):');
    for (const u of users) {
      console.log(`  ${u.role.padEnd(10)} ${u.email}`);
    }
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[seed] Failed:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
