const pool = require('../config/db');

async function listProducts({ page = 1, limit = 20, search, category, lowStock }) {
  const offset = (page - 1) * limit;
  const where = [];
  const params = [];
  let paramIndex = 1;

  if (search) {
    const pattern = `%${search}%`;
    where.push(`(p.name ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex})`);
    params.push(pattern);
    paramIndex += 1;
  }
  if (category) {
    where.push(`p.category ILIKE $${paramIndex}`);
    params.push(category);
    paramIndex += 1;
  }
  if (lowStock === 'true' || lowStock === true) {
    where.push('p.current_stock <= p.min_stock_alert');
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const countRes = await pool.query(
    `SELECT COUNT(*)::int AS total FROM products p ${whereSql}`,
    params
  );
  const total = countRes.rows[0].total;

  const { rows } = await pool.query(
    `SELECT p.*,
            (p.current_stock <= p.min_stock_alert) AS is_low_stock
     FROM products p
     ${whereSql}
     ORDER BY p.name ASC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  );

  return {
    data: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function findProductById(id) {
  const { rows } = await pool.query(
    `SELECT p.*,
            (p.current_stock <= p.min_stock_alert) AS is_low_stock
     FROM products p WHERE p.id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function findProductBySku(sku) {
  const { rows } = await pool.query('SELECT * FROM products WHERE LOWER(sku) = LOWER($1)', [sku]);
  return rows[0] || null;
}

async function createProduct(data) {
  const { rows } = await pool.query(
    `INSERT INTO products (name, sku, category, unit_price, current_stock, min_stock_alert, location)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      data.name,
      data.sku,
      data.category || null,
      data.unit_price || 0,
      data.current_stock || 0,
      data.min_stock_alert || 0,
      data.location || null,
    ]
  );
  return rows[0];
}

async function updateProduct(id, data) {
  const { rows } = await pool.query(
    `UPDATE products SET
       name = COALESCE($2, name),
       category = COALESCE($3, category),
       unit_price = COALESCE($4, unit_price),
       min_stock_alert = COALESCE($5, min_stock_alert),
       location = COALESCE($6, location),
       is_active = COALESCE($7, is_active),
       updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, data.name, data.category, data.unit_price, data.min_stock_alert, data.location, data.is_active]
  );
  return rows[0] || null;
}

async function deleteProduct(id) {
  const { rowCount } = await pool.query('DELETE FROM products WHERE id = $1', [id]);
  return rowCount > 0;
}

async function listCategories() {
  const { rows } = await pool.query(
    `SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != '' ORDER BY category`
  );
  return rows.map((r) => r.category);
}

module.exports = {
  listProducts,
  findProductById,
  findProductBySku,
  createProduct,
  updateProduct,
  deleteProduct,
  listCategories,
};
