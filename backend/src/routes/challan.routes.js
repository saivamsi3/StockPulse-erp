const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { validate } = require('../middleware/validate');
const { createChallanValidator } = require('../validators/challan.validator');
const { list, getOne, create, confirm, cancel } = require('../controllers/challan.controller');

const router = express.Router();

router.use(requireAuth);

router.get('/', list);
router.get('/:id', getOne);

router.post('/', requireRole('Admin', 'Sales'), createChallanValidator, validate, create);
router.put('/:id/confirm', requireRole('Admin', 'Sales', 'Warehouse'), confirm);
router.put('/:id/cancel', requireRole('Admin', 'Sales'), cancel);

module.exports = router;
