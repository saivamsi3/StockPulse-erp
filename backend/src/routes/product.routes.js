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

router.get('/', list);
router.get('/categories', categories);
router.get('/movements/recent', recentMovements);
router.get('/:id', getOne);
router.get('/:id/movements', movements);

router.post('/', requireRole('Admin', 'Warehouse'), createProductValidator, validate, create);
router.put('/:id', requireRole('Admin', 'Warehouse'), updateProductValidator, validate, update);
router.delete('/:id', requireRole('Admin'), remove);

router.post(
  '/:id/stock',
  requireRole('Admin', 'Warehouse'),
  stockAdjustValidator,
  validate,
  adjustStock
);

module.exports = router;
