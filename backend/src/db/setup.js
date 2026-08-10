const { execSync } = require('child_process');
const { spawnSync } = require('child_process');

function run(script) {
  console.log(`\n>> Running ${script} ...`);
  const res = spawnSync(process.execPath, [require.resolve(script)], { stdio: 'inherit' });
  if (res.status !== 0) {
    console.error(`[setup] ${script} failed with exit code ${res.status}`);
    process.exit(res.status || 1);
  }
  return res.status;
}

const scriptPath = (name) => require('path').join(__dirname, name);

console.log('=== StockPulse ERP DB setup ===');
run(scriptPath('runMigrations.js'));
run(scriptPath('seed.js'));
console.log('\n=== DB setup complete ===');
