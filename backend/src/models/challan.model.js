const pool = require('../config/db');

function withDb(db) {
  return db || pool;
}

async function generateChallanNumber(db) {
  const res = await db.query("SELECT nextval('challans_id_seq') AS next_id");
  const nextId = Number(res.rows[0].next_id);
  const year = new Date().getFullYear();
  return `CHL-${year}-${String(nextId).padStart(6, '0')}`;
}

async function createChallan(data, items, db) {
  const conn = withDb(db);
  const challanRes = await conn.query(
    `INSERT INTO challans (challan_number, customer_id, status, total_quantity, notes, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      data.challan_number,
      data.customer_id,
      data.status,
      data.total_quantity,
      data.notes || null,
      data.created_by,
    ]
  );
  const challan = challanRes.rows[0];

  for (const item of items) {
    await conn.query(
      `INSERT INTO challan_items (challan_id, product_id, product_name, product_sku, unit_price, quantity, line_total)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        challan.id,
        item.product_id,
        item.product_name,
        item.product_sku,
        item.unit_price,
        item.quantity,
        item.line_total,
      ]
    );
  }
  return challan;
}

async function findChallanById(id, db) {
  const conn = withDb(db);
  const { rows } = await conn.query(
    `SELECT c.*,
            cust.name AS customer_name,
            cust.business_name AS customer_business_name,
            cust.mobile AS customer_mobile,
            u.name AS created_by_name,
            cu.name AS confirmed_by_name,
            canu.name AS cancelled_by_name
     FROM challans c
     JOIN customers cust ON cust.id = c.customer_id
     LEFT JOIN users u ON u.id = c.created_by
     LEFT JOIN users cu ON cu.id = c.confirmed_by
     LEFT JOIN users canu ON canu.id = c.cancelled_by
     WHERE c.id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function findChallanItems(challanId, db) {
  const conn = withDb(db);
  const { rows } = await conn.query(
    'SELECT * FROM challan_items WHERE challan_id = $1 ORDER BY id',
    [challanId]
  );
  return rows;
}

async function listChallans({ page = 1, limit = 20, search, status }) {
  const offset = (page - 1) * limit;
  const where = [];
  const params = [];
  let paramIndex = 1;

  if (search) {
    where.push(`(c.challan_number ILIKE $${paramIndex} OR cust.name ILIKE $${paramIndex})`);
    params.push(`%${search}%`);
    paramIndex += 1;
  }
  if (status) {
    where.push(`c.status = $${paramIndex}`);
    params.push(status);
    paramIndex += 1;
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const countRes = await pool.query(
    `SELECT COUNT(*)::int AS total FROM challans c JOIN customers cust ON cust.id = c.customer_id ${whereSql}`,
    params
  );
  const total = countRes.rows[0].total;

  const { rows } = await pool.query(
    `SELECT c.*, cust.name AS customer_name, u.name AS created_by_name
     FROM challans c
     JOIN customers cust ON cust.id = c.customer_id
     LEFT JOIN users u ON u.id = c.created_by
     ${whereSql}
     ORDER BY c.created_at DESC, c.id DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  );

  return {
    data: rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

async function updateChallanStatus(id, status, userId, db) {
  const conn = withDb(db);
  const setMap = {
    Confirmed: 'confirmed_by = $3, confirmed_at = NOW(), status = $2',
    Cancelled: 'cancelled_by = $3, cancelled_at = NOW(), status = $2',
  };
  const { rows } = await conn.query(
    `UPDATE challans SET ${setMap[status]}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, status, userId]
  );
  return rows[0] || null;
}

module.exports = {
  generateChallanNumber,
  createChallan,
  findChallanById,
  findChallanItems,
  listChallans,
  updateChallanStatus,
};
