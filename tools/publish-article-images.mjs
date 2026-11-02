import { PrismaClient } from '@prisma/client';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import { insertArticleImages } from './article-image-content.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const sets = JSON.parse(readFileSync(path.join(root, 'content/article-images.json'), 'utf8'));
const expected = JSON.parse(readFileSync(path.join(root, 'content/keyword-map.json'), 'utf8'));
assert.equal(sets.length, 50, 'Publication requires all fifty completed image sets.');
assert.equal(new Set(sets.map(set => set.slug)).size, 50);
for (const item of expected) assert.ok(sets.some(set => set.slug === item.slug), item.slug);
for (const set of sets) for (const image of [set.cover, ...set.inline]) {
  assert.ok(existsSync(path.join(root, 'apps/web/public', image.src)), `Missing image: ${image.src}`);
}
const apply = process.argv.includes('--apply');
const db = new PrismaClient();
try {
  const count = await db.$transaction(async tx => {
    let changed = 0;
    for (const set of sets) {
      const article = await tx.article.findUniqueOrThrow({ where: { slug: set.slug } });
      const body = insertArticleImages(article.body, set.inline);
      if (article.coverImage === set.cover.src && article.body === body) continue;
      changed++;
      if (apply) {
        const result = await tx.article.updateMany({ where: { id: article.id, updatedAt: article.updatedAt }, data: { body, coverImage: set.cover.src, updatedAt: new Date() } });
        assert.equal(result.count, 1, `Article changed during publication: ${set.slug}`);
      }
    }
    return changed;
  }, { maxWait: 10000, timeout: 30000 });
  console.log(`${apply ? 'Published' : 'Validated'} image updates for ${count} articles. Text, metadata, publication status and administrator credentials are preserved.`);
} catch (error) {
  console.error('Article image publication failed; the transaction was rolled back. ' + (error?.code === 'ERR_ASSERTION' ? error.message : 'Check database availability and file permissions privately.'));
  process.exitCode = 1;
} finally { await db.$disconnect(); }
