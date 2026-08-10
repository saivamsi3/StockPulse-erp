require('dotenv').config();

function getEnv(name, fallback) {
  const value = process.env[name];
  if (value === undefined || value === '') {
    if (fallback !== undefined) return fallback;
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(getEnv('PORT', '5000'), 10),
  databaseUrl: getEnv('DATABASE_URL'),
  jwtSecret: getEnv('JWT_SECRET'),
  jwtExpiresIn: getEnv('JWT_EXPIRES_IN', '8h'),
  corsOrigins: (getEnv('CORS_ORIGINS', 'http://localhost:5173') || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
};
