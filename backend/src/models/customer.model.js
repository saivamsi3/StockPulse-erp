const pool = require('../config/db');

const BASE_SELECT = `
  SELECT c.*, u.name AS created_by_name
  FROM customers c
  LEFT JOIN users u ON u.id = c.created_by
`;

async function listCustomers({ page = 1, limit = 20, search, status, customer_type }) {
  const offset = (page - 1) * limit;
  const where = [];
  const params = [];
  let paramIndex = 1;

  if (search) {
    const pattern = `%${search}%`;
    where.push(`(c.name ILIKE $${paramIndex} OR c.mobile ILIKE $${paramIndex} OR c.email ILIKE $${paramIndex} OR c.business_name ILIKE $${paramIndex})`);
    params.push(pattern);
    paramIndex += 1;
  }
  if (status) {
    where.push(`c.status = $${paramIndex}`);
    params.push(status);
    paramIndex += 1;
  }
  if (customer_type) {
    where.push(`c.customer_type = $${paramIndex}`);
    params.push(customer_type);
    paramIndex += 1;
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const countRes = await pool.query(
    `SELECT COUNT(*)::int AS total FROM customers c ${whereSql}`,
    params
  );
  const total = countRes.rows[0].total;

  const { rows } = await pool.query(
    `${BASE_SELECT} ${whereSql}
     ORDER BY c.updated_at DESC
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

async function findCustomerById(id) {
  const { rows } = await pool.query(`${BASE_SELECT} WHERE c.id = $1`, [id]);
  return rows[0] || null;
}

async function createCustomer(data) {
  const { rows } = await pool.query(
    `INSERT INTO customers
       (name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      data.name,
      data.mobile || null,
      data.email || null,
      data.business_name || null,
      data.gst_number || null,
      data.customer_type || null,
      data.address || null,
      data.status || 'Lead',
      data.follow_up_date || null,
      data.notes || null,
      data.created_by,
    ]
  );
  return rows[0];
}

async function updateCustomer(id, data) {
  const { rows } = await pool.query(
    `UPDATE customers SET
       name = COALESCE($2, name),
       mobile = COALESCE($3, mobile),
       email = COALESCE($4, email),
       business_name = COALESCE($5, business_name),
       gst_number = COALESCE($6, gst_number),
       customer_type = COALESCE($7, customer_type),
       address = COALESCE($8, address),
       status = COALESCE($9, status),
       follow_up_date = COALESCE($10, follow_up_date),
       notes = COALESCE($11, notes),
       updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [
      id,
      data.name,
      data.mobile,
      data.email,
      data.business_name,
      data.gst_number,
      data.customer_type,
      data.address,
      data.status,
      data.follow_up_date,
      data.notes,
    ]
  );
  return rows[0] || null;
}

async function deleteCustomer(id) {
  const { rowCount } = await pool.query('DELETE FROM customers WHERE id = $1', [id]);
  return rowCount > 0;
}

async function listFollowUps(customerId) {
  const { rows } = await pool.query(
    `SELECT f.*, u.name AS created_by_name
     FROM follow_ups f
     LEFT JOIN users u ON u.id = f.created_by
     WHERE f.customer_id = $1
     ORDER BY f.created_at DESC`,
    [customerId]
  );
  return rows;
}

async function addFollowUp(customerId, note, userId) {
  const { rows } = await pool.query(
    'INSERT INTO follow_ups (customer_id, note, created_by) VALUES ($1, $2, $3) RETURNING *',
    [customerId, note, userId]
  );
  return rows[0];
}

module.exports = {
  listCustomers,
  findCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  listFollowUps,
  addFollowUp,
};
