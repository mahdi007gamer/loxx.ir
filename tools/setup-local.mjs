import { existsSync, mkdirSync, writeFileSync, readFileSync, openSync, closeSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const envFile = join(root, 'apps', 'api', '.env');
const credentialFile = join(root, 'LOCAL_LOGIN.txt');
if (!existsSync(envFile)) {
  const password = randomBytes(18).toString('base64url');
  const secret = randomBytes(48).toString('base64url');
  writeFileSync(envFile, 'DATABASE_URL="file:./dev.db"\nPORT=4100\nWEB_ORIGIN="http://localhost:3000"\nNODE_ENV=development\nSESSION_SECRET="' + secret + '"\nADMIN_EMAIL="admin@loxx.local"\nADMIN_PASSWORD="' + password + '"\n');
  writeFileSync(credentialFile, 'LOXX LOCAL ADMIN\n\nURL: http://localhost:3000/login\nEmail: admin@loxx.local\nPassword: ' + password + '\n\nKEEP THIS FILE PRIVATE. DO NOT COMMIT.\n');
  console.log('Generated unique local admin password at LOCAL_LOGIN.txt');
} else if (!existsSync(credentialFile)) {
  const content = readFileSync(envFile, 'utf8');
  const pass = content.match(/ADMIN_PASSWORD="?([^"\r\n]+)"?/)?.[1] || '(check apps/api/.env)';
  const mail = content.match(/ADMIN_EMAIL="?([^"\r\n]+)"?/)?.[1] || 'admin@loxx.local';
  writeFileSync(credentialFile, 'URL: http://localhost:3000/login\nEmail: ' + mail + '\nPassword: ' + pass + '\n');
}
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const databaseUrl = readFileSync(envFile, 'utf8').match(/^DATABASE_URL\s*=\s*["']?([^"'\r\n]+)/m)?.[1];
if (databaseUrl?.startsWith('file:') && databaseUrl !== 'file::memory:') {
  const dbPath = resolve(root, 'apps', 'api', 'prisma', databaseUrl.slice(5).split('?')[0]);
  mkdirSync(dirname(dbPath), { recursive: true });
  if (!existsSync(dbPath)) closeSync(openSync(dbPath, 'a'));
}
function run(...args) {
  console.log('\n> npm ' + args.join(' '));
  execFileSync(npm, args, { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
}
run('run', 'db:generate', '-w', '@loxx/api');
run('run', 'db:push', '-w', '@loxx/api');
run('run', 'db:seed', '-w', '@loxx/api');
console.log('\nREADY. Open LOCAL_LOGIN.txt for your private admin login.\n');
