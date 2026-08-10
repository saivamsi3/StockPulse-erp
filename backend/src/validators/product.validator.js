const { body } = require('express-validator');

const createProductValidator = [
  body('name').trim().notEmpty().withMessage('Product name is required').isLength({ max: 255 }),
  body('sku').trim().notEmpty().withMessage('SKU is required').isLength({ max: 100 }),
  body('category').optional({ nullable: true }).trim().isLength({ max: 100 }),
  body('unit_price')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('unit_price must be >= 0'),
  body('current_stock')
    .optional({ nullable: true })
    .isInt({ min: 0 }).withMessage('current_stock must be a non-negative integer'),
  body('min_stock_alert')
    .optional({ nullable: true })
    .isInt({ min: 0 }).withMessage('min_stock_alert must be a non-negative integer'),
  body('location').optional({ nullable: true }).trim().isLength({ max: 255 }),
];

const updateProductValidator = createProductValidator.map((v) =>
  v.optional({ nullable: true })
);

const stockAdjustValidator = [
  body('movement_type')
    .trim()
    .notEmpty().withMessage('movement_type is required')
    .isIn(['IN', 'OUT']).withMessage('movement_type must be IN or OUT'),
  body('quantity')
    .isInt({ min: 1 }).withMessage('quantity must be a positive integer'),
  body('reason')
    .trim()
    .notEmpty().withMessage('reason is required')
    .isLength({ max: 255 }),
];

module.exports = { createProductValidator, updateProductValidator, stockAdjustValidator };
