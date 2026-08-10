const { body } = require('express-validator');

const CUSTOMER_TYPES = ['Retail', 'Wholesale', 'Distributor'];
const STATUSES = ['Lead', 'Active', 'Inactive'];

const createCustomerValidator = [
  body('name').trim().notEmpty().withMessage('Customer name is required').isLength({ max: 255 }),
  body('mobile').optional({ nullable: true }).trim().isLength({ max: 20 }).withMessage('Mobile must be <= 20 characters'),
  body('email').optional({ nullable: true }).trim().isEmail().withMessage('Must be a valid email').isLength({ max: 255 }),
  body('business_name').optional({ nullable: true }).trim().isLength({ max: 255 }),
  body('gst_number').optional({ nullable: true }).trim().isLength({ max: 50 }),
  body('customer_type')
    .optional({ nullable: true })
    .trim()
    .isIn(CUSTOMER_TYPES).withMessage(`customer_type must be one of: ${CUSTOMER_TYPES.join(', ')}`),
  body('status')
    .optional({ nullable: true })
    .trim()
    .isIn(STATUSES).withMessage(`status must be one of: ${STATUSES.join(', ')}`),
  body('follow_up_date').optional({ nullable: true }).isISO8601().withMessage('follow_up_date must be a valid date'),
  body('notes').optional({ nullable: true }).isString().withMessage('notes must be a string'),
];

const updateCustomerValidator = createCustomerValidator.map((v) =>
  v.optional({ nullable: true })
);

const followUpValidator = [
  body('note').trim().notEmpty().withMessage('Follow-up note is required').isLength({ max: 5000 }),
];

module.exports = { createCustomerValidator, updateCustomerValidator, followUpValidator };
