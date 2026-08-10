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
router.post('/', createCustomerValidator, validate, create);
router.put('/:id', updateCustomerValidator, validate, update);
router.delete('/:id', requireRole('Admin', 'Sales'), remove);

router.get('/:id/follow-ups', listFollowUps);
router.post(
  '/:id/follow-ups',
  followUpValidator,
  validate,
  requireRole('Admin', 'Sales'),
  addFollowUp
);

module.exports = router;
