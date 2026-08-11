const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { listUsers } = require('../models/user.model');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(requireAuth);
router.use(requireRole('Admin'));

// Admin only User/Role Administration
router.get('/', asyncHandler(async (req, res) => {
  const users = await listUsers();
  res.json({ success: true, data: users });
}));

module.exports = router;
