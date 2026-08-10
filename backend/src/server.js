const app = require('./app');
const { port, env } = require('./config/env');

app.listen(port, () => {
  console.log(`[server] StockPulse ERP API running on http://localhost:${port} (${env})`);
  console.log(`[server] Health check: http://localhost:${port}/health`);
});
