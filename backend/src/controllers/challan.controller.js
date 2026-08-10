const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const challanModel = require('../models/challan.model');
const challanService = require('../services/challan.service');

const list = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const result = await challanModel.listChallans({
    page,
    limit,
    search: req.query.search,
    status: req.query.status,
  });
  res.json({ success: true, ...result });
});

const getOne = asyncHandler(async (req, res) => {
  const challan = await challanService.getChallanDetail(req.params.id);
  res.json({ success: true, data: challan });
});

const create = asyncHandler(async (req, res) => {
  const challan = await challanService.createDraftChallan({
    customer_id: req.body.customer_id,
    notes: req.body.notes,
    items: req.body.items,
    created_by: req.user.id,
  });
  res.status(201).json({ success: true, data: challan });
});

const confirm = asyncHandler(async (req, res) => {
  const challan = await challanService.confirmChallan(req.params.id, req.user.id);
  res.json({ success: true, data: challan });
});

const cancel = asyncHandler(async (req, res) => {
  const challan = await challanService.cancelChallan(req.params.id, req.user.id);
  res.json({ success: true, data: challan });
});

module.exports = { list, getOne, create, confirm, cancel };
