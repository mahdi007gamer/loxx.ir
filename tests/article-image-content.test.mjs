import test from 'node:test';
import assert from 'node:assert/strict';
import { insertArticleImages } from '../tools/article-image-content.mjs';

const images = [
  { src:'/images/articles/example-guide/detail-1.webp', alt:'تصویر نخست', caption:'توضیح نخست', afterHeading:'تصمیم نخست' },
  { src:'/images/articles/example-guide/detail-2.webp', alt:'تصویر دوم', caption:'توضیح دوم', afterHeading:'تصمیم دوم' },
];
test('inline image publication preserves editorial text, places images after the intended sections and is idempotent', () => {
  const body='مقدمه ویرایش‌شده مدیر\n\n## تصمیم نخست\n\nمتن نخست با نکته اختصاصی.\n\n## تصمیم دوم\n\nمتن دوم و پایان راهنما.';
  const result=insertArticleImages(body,images);
  assert.ok(result.startsWith('مقدمه ویرایش‌شده مدیر'));
  assert.ok(result.indexOf('متن نخست')<result.indexOf(images[0].src));
  assert.ok(result.indexOf(images[0].src)<result.indexOf('## تصمیم دوم'));
  assert.equal(insertArticleImages(result,images),result);
  assert.throws(()=>insertArticleImages(body,[{...images[0],afterHeading:'عنوان حذف‌شده'}]),/Missing target heading/);
});
