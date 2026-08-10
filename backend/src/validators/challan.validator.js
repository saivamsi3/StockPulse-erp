const { body } = require('express-validator');

const createChallanValidator = [
  body('customer_id')
    .isInt({ min: 1 }).withMessage('customer_id is required and must be a positive integer'),
  body('notes').optional({ nullable: true }).isString().withMessage('notes must be a string').isLength({ max: 2000 }),
  body('items')
    .isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.product_id')
    .isInt({ min: 1 }).withMessage('Each item needs a valid product_id'),
  body('items.*.quantity')
    .isInt({ min: 1 }).withMessage('Each item quantity must be a positive integer'),
];

module.exports = { createChallanValidator };
