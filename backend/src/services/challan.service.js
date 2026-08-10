const pool = require('../config/db');
const ApiError = require('../utils/ApiError');
const challanModel = require('../models/challan.model');
const { findProductById } = require('../models/product.model');
const { changeStock } = require('./stock.service');

async function createDraftChallan(data) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const challanNumber = await challanModel.generateChallanNumber(client);
    const items = [];

    for (const line of data.items) {
      const product = await findProductById(line.product_id);
      if (!product) {
        throw ApiError.notFound(`Product id ${line.product_id} not found`);
      }
      if (!product.is_active) {
        throw ApiError.badRequest(`Product '${product.name}' is inactive and cannot be sold`);
      }
      items.push({
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku,
        unit_price: Number(product.unit_price),
        quantity: line.quantity,
        line_total: Math.round(Number(product.unit_price) * line.quantity * 100) / 100,
      });
    }

    const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);

    const challan = await challanModel.createChallan(
      { ...data, challan_number: challanNumber, status: 'Draft', total_quantity: totalQuantity },
      items,
      client
    );

    await client.query('COMMIT');
    return challan;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function confirmChallan(challanId, userId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const challan = await challanModel.findChallanById(challanId, client);
    if (!challan) throw ApiError.notFound(`Challan ${challanId} not found`);
    if (challan.status === 'Confirmed') {
      throw ApiError.conflict(`Challan ${challan.challan_number} is already confirmed`);
    }
    if (challan.status === 'Cancelled') {
      throw ApiError.conflict(`Challan ${challan.challan_number} is cancelled and cannot be confirmed`);
    }

    const items = await challanModel.findChallanItems(challanId, client);

    // 1. Validate stock for every line (FOR UPDATE locks rows).
    for (const item of items) {
      const { rows } = await client.query(
        'SELECT id, name, sku, current_stock FROM products WHERE id = $1 FOR UPDATE',
        [item.product_id]
      );
      const product = rows[0];
      if (!product) {
        throw ApiError.notFound(`Product id ${item.product_id} referenced in challan no longer exists`);
      }
      if (product.current_stock < item.quantity) {
        throw ApiError.badRequest(
          `Cannot confirm ${challan.challan_number}: insufficient stock for '${product.name}' (SKU: ${product.sku}). Available: ${product.current_stock}, required: ${item.quantity}. No stock was deducted.`
        );
      }
    }

    // 2. Deduct stock + write movement log (all-or-nothing).
    for (const item of items) {
      await changeStock(client, {
        productId: item.product_id,
        quantity: item.quantity,
        movementType: 'OUT',
        reason: `Sale via challan ${challan.challan_number}`,
        userId,
        challanId,
      });
    }

    // 3. Mark challan confirmed.
    const updated = await challanModel.updateChallanStatus(challanId, 'Confirmed', userId, client);

    await client.query('COMMIT');
    return updated;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function cancelChallan(challanId, userId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const challan = await challanModel.findChallanById(challanId, client);
    if (!challan) throw ApiError.notFound(`Challan ${challanId} not found`);
    if (challan.status === 'Cancelled') {
      throw ApiError.conflict(`Challan ${challan.challan_number} is already cancelled`);
    }
    if (challan.status === 'Confirmed') {
      throw ApiError.conflict(
        `Challan ${challan.challan_number} is already confirmed; stock was deducted. Cancel is not supported for confirmed challans.`
      );
    }

    const updated = await challanModel.updateChallanStatus(challanId, 'Cancelled', userId, client);

    await client.query('COMMIT');
    return updated;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getChallanDetail(challanId) {
  const challan = await challanModel.findChallanById(challanId);
  if (!challan) throw ApiError.notFound(`Challan ${challanId} not found`);
  const items = await challanModel.findChallanItems(challanId);
  return { ...challan, items };
}

module.exports = { createDraftChallan, confirmChallan, cancelChallan, getChallanDetail };
