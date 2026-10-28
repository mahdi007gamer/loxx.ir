import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
const required = ['START-LOXX.bat','apps/web/app/page.tsx','apps/web/app/globals.css','apps/api/src/main.ts','apps/api/prisma/schema.prisma','tools/setup-local.mjs'];
test('all platform layers and launcher exist', () => {
  for (const path of required) assert.equal(existsSync(path), true, path);
});
test('repository does not ship a fixed production login', () => {
  const env = readFileSync('apps/api/.env.example', 'utf8');
  assert.match(env, /replace-with-unique-random/);
});
