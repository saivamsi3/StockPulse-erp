const pool = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const productModel = require('../models/product.model');
const movementModel = require('../models/stockMovement.model');
const { changeStock } = require('../services/stock.service');

const list = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const result = await productModel.listProducts({
    page,
    limit,
    search: req.query.search,
    category: req.query.category,
    lowStock: req.query.lowStock,
  });
  res.json({ success: true, ...result });
});

const getOne = asyncHandler(async (req, res) => {
  const product = await productModel.findProductById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');
  res.json({ success: true, data: product });
});

const create = asyncHandler(async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const openingStock = Number(req.body.current_stock || 0);
    const product = await productModel.createProduct({ ...req.body, current_stock: 0 });
    if (openingStock > 0) {
      await changeStock(client, {
        productId: product.id,
        quantity: openingStock,
        movementType: 'IN',
        reason: 'Initial stock on product creation',
        userId: req.user.id,
      });
    }
    await client.query('COMMIT');
    const created = await productModel.findProductById(product.id);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

const update = asyncHandler(async (req, res) => {
  const product = await productModel.updateProduct(req.params.id, req.body);
  if (!product) throw ApiError.notFound('Product not found');
  res.json({ success: true, data: product });
});

const remove = asyncHandler(async (req, res) => {
  const deleted = await productModel.deleteProduct(req.params.id);
  if (!deleted) throw ApiError.notFound('Product not found');
  res.json({ success: true, message: 'Product deleted' });
});

const adjustStock = asyncHandler(async (req, res) => {
  const { movement_type, quantity, reason } = req.body;
  const product = await productModel.findProductById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const movement = await changeStock(client, {
      productId: product.id,
      quantity,
      movementType: movement_type,
      reason,
      userId: req.user.id,
    });
    const updated = await productModel.findProductById(product.id);
    await client.query('COMMIT');
    res.json({ success: true, data: { movement, product: updated } });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

const movements = asyncHandler(async (req, res) => {
  const product = await productModel.findProductById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const rows = await movementModel.listMovementsByProduct(product.id, { page });
  res.json({ success: true, data: rows });
});

const categories = asyncHandler(async (req, res) => {
  const rows = await productModel.listCategories();
  res.json({ success: true, data: rows });
});

const recentMovements = asyncHandler(async (req, res) => {
  const rows = await movementModel.listRecentMovements(10);
  res.json({ success: true, data: rows });
});

module.exports = {
  list,
  getOne,
  create,
  update,
  remove,
  adjustStock,
  movements,
  categories,
  recentMovements,
};
