const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { validate } = require('../middleware/validate');
const {
  createCustomerValidator,
  updateCustomerValidator,
  followUpValidator,
} = require('../validators/customer.validator');
const {
  list,
  getOne,
  create,
  update,
  remove,
  listFollowUps,
  addFollowUp,
} = require('../controllers/customer.controller');

const router = express.Router();

router.use(requireAuth);

router.get('/', list);
router.get('/:id', getOne);
router.get('/:id/follow-ups', listFollowUps);

// Only Admin and Sales can create or update customers
router.post('/', requireRole('Admin', 'Sales'), createCustomerValidator, validate, create);
router.put('/:id', requireRole('Admin', 'Sales'), updateCustomerValidator, validate, update);

// Only Admin can delete customers
router.delete('/:id', requireRole('Admin'), remove);

// Only Admin and Sales can record customer follow-ups
router.post(
  '/:id/follow-ups',
  requireRole('Admin', 'Sales'),
  followUpValidator,
  validate,
  addFollowUp
);

module.exports = router;
