const ApiError = require('../utils/ApiError');

function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let details = err.details;

  if (err.code === '23505') {
    statusCode = 409;
    message = 'Duplicate value violates a unique constraint';
    const match = err.detail ? err.detail.match(/\(([^)]+)\)=\(([^)]+)\)/) : null;
    if (match) {
      message = `Value '${match[2]}' already exists for field '${match[1]}'`;
    }
  } else if (err.code === '23503') {
    statusCode = 400;
    message = 'Referenced record does not exist';
  } else if (err.code === '23514') {
    statusCode = 400;
    message = 'Value violates a check constraint';
  } else if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON in request body';
  }

  if (statusCode >= 500) {
    console.error('[error]', err);
  }

  const body = {
    success: false,
    error: {
      code: statusCode,
      message,
    },
  };
  if (details) body.error.details = details;

  res.status(statusCode).json(body);
}

module.exports = { notFoundHandler, errorHandler };
