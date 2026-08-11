const app = require('./app');
const { port, env } = require('./config/env');

app.listen(port, '0.0.0.0', () => {
  console.log(`[server] StockPulse ERP API running on http://127.0.0.1:${port} (${env})`);
  console.log(`[server] Health check: http://127.0.0.1:${port}/health`);
});
