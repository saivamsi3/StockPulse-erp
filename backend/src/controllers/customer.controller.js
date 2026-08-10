const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const customerModel = require('../models/customer.model');

const list = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const result = await customerModel.listCustomers({
    page,
    limit,
    search: req.query.search,
    status: req.query.status,
    customer_type: req.query.customer_type,
  });
  res.json({ success: true, ...result });
});

const getOne = asyncHandler(async (req, res) => {
  const customer = await customerModel.findCustomerById(req.params.id);
  if (!customer) throw ApiError.notFound('Customer not found');
  res.json({ success: true, data: customer });
});

const create = asyncHandler(async (req, res) => {
  const customer = await customerModel.createCustomer({
    ...req.body,
    created_by: req.user.id,
  });
  res.status(201).json({ success: true, data: customer });
});

const update = asyncHandler(async (req, res) => {
  const customer = await customerModel.updateCustomer(req.params.id, req.body);
  if (!customer) throw ApiError.notFound('Customer not found');
  res.json({ success: true, data: customer });
});

const remove = asyncHandler(async (req, res) => {
  const deleted = await customerModel.deleteCustomer(req.params.id);
  if (!deleted) throw ApiError.notFound('Customer not found');
  res.json({ success: true, message: 'Customer deleted' });
});

const listFollowUps = asyncHandler(async (req, res) => {
  const customer = await customerModel.findCustomerById(req.params.id);
  if (!customer) throw ApiError.notFound('Customer not found');
  const notes = await customerModel.listFollowUps(req.params.id);
  res.json({ success: true, data: notes });
});

const addFollowUp = asyncHandler(async (req, res) => {
  const customer = await customerModel.findCustomerById(req.params.id);
  if (!customer) throw ApiError.notFound('Customer not found');
  const note = await customerModel.addFollowUp(req.params.id, req.body.note, req.user.id);
  res.status(201).json({ success: true, data: note });
});

module.exports = { list, getOne, create, update, remove, listFollowUps, addFollowUp };
