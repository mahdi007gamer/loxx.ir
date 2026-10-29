import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'dotenv';
import { tsImport } from 'tsx/esm/api';

const { runtimeIssues, publicOrigin, secretIsUsable } = await tsImport('../apps/api/src/runtime-config.ts', import.meta.url);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function productionIssues(api, web) {
  const issues = runtimeIssues(api);
  if (api.NODE_ENV !== 'production') issues.push('NODE_ENV in the API environment must be production for secure HTTPS session cookies.');
  const site = publicOrigin(web.NEXT_PUBLIC_SITE_URL);
  if (!site) issues.push('NEXT_PUBLIC_SITE_URL must be the final public HTTPS origin.');
  else if (!(api.WEB_ORIGIN || '').split(',').map(value => value.trim()).includes(site)) issues.push('WEB_ORIGIN must include the exact NEXT_PUBLIC_SITE_URL origin.');
  if (web.NEXT_PUBLIC_ALLOW_INDEXING !== 'true') issues.push('NEXT_PUBLIC_ALLOW_INDEXING must explicitly be true for a public indexed release.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(api.ADMIN_EMAIL || '') || /\.(?:local|invalid|example|test)$/i.test(api.ADMIN_EMAIL || '')) issues.push('ADMIN_EMAIL must be your real administrator email.');
  if (!secretIsUsable(api.ADMIN_PASSWORD, 16)) issues.push('ADMIN_PASSWORD must be a unique password of at least 16 characters, not a sample value.');
  if (!api.DATABASE_URL?.startsWith('file:') || !isAbsolute((api.DATABASE_URL || '').slice(5).split('?')[0])) issues.push('DATABASE_URL must use an absolute file path on persistent storage outside a disposable release.');
  try {
    const url = new URL(web.API_URL || '');
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error();
  } catch { issues.push('API_URL must be the internal API origin, without credentials or an /api path.'); }
  return [...new Set(issues)];
}

function load(file) { return existsSync(file) ? parse(readFileSync(file)) : {}; }

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const api = { ...load(resolve(root, 'apps/api/.env')), ...process.env };
  const web = { ...load(resolve(root, 'apps/web/.env.production')), ...process.env };
  const issues = productionIssues(api, web);
  if (issues.length) {
    console.error('LOXX production configuration is incomplete:');
    for (const issue of issues) console.error(' - ' + issue);
    console.error('See docs/production-checklist.md. No values or credentials were printed.');
    process.exitCode = 1;
  } else {
    console.log('PASS: production cookie mode, signing secret, administrator configuration, persistent database path, public canonical origin, trusted form origin, indexing choice and API URL.');
    console.log('Configuration only: DNS, TLS, database availability, backups and an actual deployment still need verification.');
  }
}
