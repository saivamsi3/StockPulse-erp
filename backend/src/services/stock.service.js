const ApiError = require('../utils/ApiError');

async function changeStock(client, { productId, quantity, movementType, reason, userId, challanId }) {
  if (movementType === 'OUT') {
    // Lock the product row so concurrent requests cannot oversell.
    const { rows } = await client.query(
      'SELECT id, name, sku, current_stock FROM products WHERE id = $1 FOR UPDATE',
      [productId]
    );
    const product = rows[0];
    if (!product) {
      throw ApiError.notFound(`Product id ${productId} not found`);
    }
    if (product.current_stock < quantity) {
      throw ApiError.badRequest(
        `Insufficient stock for '${product.name}' (SKU: ${product.sku}). Available: ${product.current_stock}, requested: ${quantity}`
      );
    }
    await client.query(
      'UPDATE products SET current_stock = current_stock - $1, updated_at = NOW() WHERE id = $2',
      [quantity, productId]
    );
  } else if (movementType === 'IN') {
    await client.query(
      'UPDATE products SET current_stock = current_stock + $1, updated_at = NOW() WHERE id = $2',
      [quantity, productId]
    );
  } else {
    throw ApiError.badRequest(`Invalid movement type: ${movementType}`);
  }

  const { rows } = await client.query(
    `INSERT INTO stock_movements (product_id, quantity_changed, movement_type, reason, created_by, challan_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [productId, quantity, movementType, reason, userId, challanId || null]
  );
  return rows[0];
}

module.exports = { changeStock };
