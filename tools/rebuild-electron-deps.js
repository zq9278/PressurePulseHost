const { spawnSync } = require('child_process');

function envVar(name) {
  return process.env[name] || process.env[name.toLowerCase()] || '';
}

if (process.env.PPHC_SKIP_ELECTRON_REBUILD === '1') {
  process.exit(0);
}

const httpProxy = envVar('HTTP_PROXY');
const httpsProxy = envVar('HTTPS_PROXY') || httpProxy;
const noProxy = envVar('NO_PROXY');

const env = { ...process.env };
if (httpProxy) env.npm_config_proxy = httpProxy;
if (httpsProxy) env.npm_config_https_proxy = httpsProxy;
if (noProxy) env.npm_config_noproxy = noProxy;

const res = spawnSync('electron-builder', ['install-app-deps'], {
  stdio: 'inherit',
  env,
  shell: process.platform === 'win32',
});

process.exit(typeof res.status === 'number' ? res.status : 1);

