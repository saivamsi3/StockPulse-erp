const ApiError = require('../utils/ApiError');

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(`Requires role: ${roles.join(' or ')}`)
      );
    }
    next();
  };
}

module.exports = { requireRole };
