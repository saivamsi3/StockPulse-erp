const { Pool } = require('pg');
const { databaseUrl } = require('./env');

const isCloudDb = databaseUrl.includes('neon.tech') || databaseUrl.includes('sslmode=');

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: isCloudDb ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('[pg] Unexpected error on idle client', err);
});

module.exports = pool;

