const pool = require('../config/db');

async function listMovementsByProduct(productId, { page = 1, limit = 50 } = {}) {
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(
    `SELECT m.*, u.name AS created_by_name,
            COALESCE(c.challan_number, NULL) AS challan_number
     FROM stock_movements m
     LEFT JOIN users u ON u.id = m.created_by
     LEFT JOIN challans c ON c.id = m.challan_id
     WHERE m.product_id = $1
     ORDER BY m.created_at DESC, m.id DESC
     LIMIT $2 OFFSET $3`,
    [productId, limit, offset]
  );
  return rows;
}

async function listRecentMovements(limit = 10) {
  const { rows } = await pool.query(
    `SELECT m.*, u.name AS created_by_name,
            COALESCE(c.challan_number, NULL) AS challan_number,
            p.name AS product_name, p.sku AS product_sku
     FROM stock_movements m
     LEFT JOIN users u ON u.id = m.created_by
     LEFT JOIN challans c ON c.id = m.challan_id
     JOIN products p ON p.id = m.product_id
     ORDER BY m.created_at DESC, m.id DESC
     LIMIT $1`,
    [limit]
  );
  return rows;
}

module.exports = { listMovementsByProduct, listRecentMovements };
