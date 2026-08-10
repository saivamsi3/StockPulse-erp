const pool = require('../config/db');

async function reset() {
  const client = await pool.connect();
  try {
    await client.query('DROP SCHEMA public CASCADE');
    await client.query('CREATE SCHEMA public');
    console.log('[reset] Schema dropped. Run `npm run db:setup` to re-apply schema and seed.');
  } catch (err) {
    console.error('[reset] Failed:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

reset();
