import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { tsImport } from 'tsx/esm/api';
import { productionIssues } from '../tools/check-production.mjs';

const { runtimeIssues, publicOrigin } = await tsImport('../apps/api/src/runtime-config.ts', import.meta.url);
const api = { NODE_ENV: 'production', DATABASE_URL: 'file:/var/lib/loxx/studio.db', WEB_ORIGIN: 'https://loxx.ir,https://www.loxx.ir', SESSION_SECRET: randomBytes(48).toString('hex'), ADMIN_EMAIL: 'owner@loxx.ir', ADMIN_PASSWORD: randomBytes(24).toString('base64url') };
const web = { NEXT_PUBLIC_SITE_URL: 'https://loxx.ir', NEXT_PUBLIC_ALLOW_INDEXING: 'true', API_URL: 'http://127.0.0.1:4100' };

test('a complete public configuration passes without changing local development rules', () => {
  assert.deepEqual(productionIssues(api, web), []);
  assert.deepEqual(runtimeIssues({ NODE_ENV: 'development', SESSION_SECRET: api.SESSION_SECRET }), []);
});

test('a public release rejects sample secrets, insecure origins, temporary data and mismatched canonical domains', () => {
  for (const changes of [
    { SESSION_SECRET: 'replace-with-unique-random-secret' },
    { SESSION_SECRET: 'a'.repeat(48) },
    { ADMIN_PASSWORD: 'replace-with-unique-random-password' },
    { ADMIN_EMAIL: 'admin@loxx.local' },
    { NODE_ENV: 'development' },
    { WEB_ORIGIN: 'http://loxx.ir' },
    { WEB_ORIGIN: 'https://loxx.ir/' },
    { WEB_ORIGIN: 'https://other-domain.ir' },
    { DATABASE_URL: 'file::memory:' },
    { DATABASE_URL: 'file:./dev.db' },
  ]) assert.ok(productionIssues({ ...api, ...changes }, web).length, Object.keys(changes).join(','));
  for (const changes of [
    { NEXT_PUBLIC_SITE_URL: 'https://loxx.ir/path' },
    { NEXT_PUBLIC_ALLOW_INDEXING: 'false' },
    { API_URL: 'http://127.0.0.1:4100/api' },
    { API_URL: 'http://user:password@127.0.0.1:4100' },
  ]) assert.ok(productionIssues(api, { ...web, ...changes }).length, Object.keys(changes).join(','));
});

test('public origins cannot be private preview hosts, path URLs or credential URLs', () => {
  assert.equal(publicOrigin('https://loxx.ir'), 'https://loxx.ir');
  for (const value of ['https://localhost', 'https://127.0.0.1', 'https://10.0.0.1', 'https://169.254.1.1', 'https://192.168.2.3', 'https://[::1]', 'https://[fd00::1]', 'https://terminal.local', 'https://preview.invalid', 'https://loxx.ir/admin', 'https://loxx.ir/?token=x', 'https://loxx.ir/#admin', 'https://user:secret@loxx.ir', 'http://loxx.ir', '*']) assert.equal(publicOrigin(value), null, value);
});

test('configuration errors do not disclose secrets or database paths', () => {
  const privateValue = 'replace-with-private-value-that-must-stay-hidden';
  const messages = productionIssues({ ...api, SESSION_SECRET: privateValue, ADMIN_PASSWORD: privateValue, DATABASE_URL: 'file:./private-path.db' }, web).join('\n');
  assert.equal(messages.includes(privateValue), false);
  assert.equal(messages.includes('private-path'), false);
});
