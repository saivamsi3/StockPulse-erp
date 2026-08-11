const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { validate } = require('../middleware/validate');
const { createChallanValidator } = require('../validators/challan.validator');
const { list, getOne, create, confirm, cancel } = require('../controllers/challan.controller');

const router = express.Router();

router.use(requireAuth);

// All roles (Admin, Sales, Warehouse, Accounts) can view challans
router.get('/', list);
router.get('/:id', getOne);

// Only Admin and Sales can create sales challans
router.post('/', requireRole('Admin', 'Sales'), createChallanValidator, validate, create);

// Only Admin and Sales can confirm sales challans
router.put('/:id/confirm', requireRole('Admin', 'Sales'), confirm);

// Only Admin and Sales can cancel sales challans
router.put('/:id/cancel', requireRole('Admin', 'Sales'), cancel);

module.exports = router;
