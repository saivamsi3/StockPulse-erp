const { verifyToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');
const { findUserById } = require('../models/user.model');

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw ApiError.unauthorized('Missing or malformed Authorization header');
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch (err) {
      throw ApiError.unauthorized('Invalid or expired token');
    }

    const user = await findUserById(payload.sub);
    if (!user || !user.is_active) {
      throw ApiError.unauthorized('User no longer exists or is disabled');
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireAuth };
