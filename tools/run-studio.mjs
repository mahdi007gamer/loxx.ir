import { spawn, spawnSync } from 'node:child_process';

const mode = process.argv[2] || 'dev';
if (!['dev', 'start'].includes(mode)) throw new Error('Use dev or start.');
const forwarded = process.argv.slice(3);
const portArgument = forwarded.indexOf('--port');
const requestedPort = portArgument >= 0 ? forwarded[portArgument + 1] : undefined;
if (portArgument >= 0 && (!requestedPort || !/^\d+$/.test(requestedPort) || Number(requestedPort) < 1 || Number(requestedPort) > 65535)) throw new Error('--port must be between 1 and 65535.');
const apiPort = process.env.API_PORT || '4100';
const webPort = requestedPort || process.env.WEB_PORT || process.env.PORT || '3000';
if (apiPort === webPort) throw new Error('API_PORT and WEB_PORT must be different.');
console.log(`LOXX web: http://localhost:${webPort} | API: http://localhost:${apiPort}`);
const children = [];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  process.exitCode = code;
  for (const child of children) {
    if (!child.pid || child.exitCode !== null) continue;
    if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
    else { try { process.kill(-child.pid, 'SIGTERM'); } catch { child.kill('SIGTERM'); } }
  }
}
for (const workspace of ['@loxx/api', '@loxx/web']) {
  const api = workspace === '@loxx/api';
  const env = { ...process.env, PORT: api ? apiPort : webPort,
    ...(api ? {} : { API_URL: process.env.API_URL || `http://127.0.0.1:${apiPort}` }),
    // The API loads its own NODE_ENV from apps/api/.env; local accounts need
    // local cookie settings. Deployment sets NODE_ENV=production explicitly.
    ...(mode === 'start' && !api ? { NODE_ENV: 'production' } : {}) };
  const command = process.platform === 'win32' ? (process.env.ComSpec || 'cmd.exe') : 'npm';
  const args = process.platform === 'win32'
    ? ['/d', '/s', '/c', `npm run ${mode} -w ${workspace}`]
    : ['run', mode, '-w', workspace];
  const child = spawn(command, args, { env, stdio: 'inherit', windowsHide: true, detached: process.platform !== 'win32' });
  children.push(child);
  child.once('error', error => { console.error(`${workspace}: ${error.message}`); stop(1); });
  child.once('exit', (code, signal) => { if (!stopping) stop(signal ? 1 : (code || 0)); });
}
process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
