import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tsImport } from 'tsx/esm/api';

const read = name => JSON.parse(readFileSync(new URL('../content/' + name, import.meta.url), 'utf8'));
const sets=read('article-images.json'), articles=read('articles.json'), keywords=read('keyword-map.json');
const { parseArticle }=await tsImport('../apps/web/components/ArticleBody.tsx',import.meta.url);

test('all fifty guides have one unique cover and two unique in-article images with real optimized assets and useful alternative text',()=>{
  assert.equal(sets.length,50);
  assert.equal(new Set(sets.map(set=>set.slug)).size,50);
  const hashes=new Set();
  for(const item of keywords){
    const set=sets.find(set=>set.slug===item.slug);
    assert.ok(set,item.slug);
    assert.equal(set.inline.length,2);
    assert.equal(new Set(set.inline.map(image=>image.afterHeading)).size,2);
    const article=articles.find(article=>article.slug===item.slug);
    assert.equal(article.coverImage,set.cover.src);
    const blocks=parseArticle(article.body).filter(block=>block.type==='image');
    assert.equal(blocks.length,2,item.slug);
    for(const image of [set.cover,...set.inline]){
      assert.ok(image.src.startsWith('/images/articles/'+item.slug+'/'));
      assert.ok(image.alt.length>=15 && image.caption.length>=15);
      assert.ok(image.width>=1400 && image.height>=750);
      const bytes=readFileSync(new URL('../apps/web/public'+image.src,import.meta.url));
      assert.equal(bytes.toString('ascii',0,4),'RIFF');
      assert.equal(bytes.toString('ascii',8,12),'WEBP');
      const hash=createHash('sha256').update(bytes).digest('hex');
      assert.ok(!hashes.has(hash),'Image reused: '+image.src);hashes.add(hash);
    }
    assert.deepEqual(blocks.map(block=>block.src).sort(),set.inline.map(image=>image.src).sort());
  }
  assert.equal(hashes.size,150);
});
