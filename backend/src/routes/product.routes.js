const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { validate } = require('../middleware/validate');
const {
  createProductValidator,
  updateProductValidator,
  stockAdjustValidator,
} = require('../validators/product.validator');
const {
  list,
  getOne,
  create,
  update,
  remove,
  adjustStock,
  movements,
  categories,
  recentMovements,
} = require('../controllers/product.controller');

const router = express.Router();

router.use(requireAuth);

// Read-only access for Admin, Sales, Warehouse, Accounts
router.get('/', list);
router.get('/categories', categories);
router.get('/movements/recent', requireRole('Admin', 'Warehouse', 'Accounts'), recentMovements);
router.get('/:id', getOne);
router.get('/:id/movements', requireRole('Admin', 'Warehouse', 'Accounts'), movements);

// Product management restricted to Admin and Warehouse
router.post('/', requireRole('Admin', 'Warehouse'), createProductValidator, validate, create);
router.put('/:id', requireRole('Admin', 'Warehouse'), updateProductValidator, validate, update);
router.delete('/:id', requireRole('Admin', 'Warehouse'), remove);

// Stock adjustment restricted to Admin and Warehouse
router.post(
  '/:id/stock',
  requireRole('Admin', 'Warehouse'),
  stockAdjustValidator,
  validate,
  adjustStock
);

module.exports = router;
