import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import { insertArticleImages } from './article-image-content.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(root, 'content/editorial-20261102');
const batch = readdirSync(source).filter(name => /^batch-[a-d]\.json$/.test(name)).sort()
  .flatMap(name => JSON.parse(readFileSync(path.join(source, name), 'utf8')));
assert.equal(batch.length, 50, 'The editorial release requires exactly 50 distinct guides.');
for (const field of ['slug', 'keyword', 'title', 'metaTitle', 'metaDescription']) {
  assert.equal(new Set(batch.map(item => item[field])).size, 50, `Duplicate ${field}`);
}
const articlesFile = path.join(root, 'content/articles.json');
const articles = JSON.parse(readFileSync(articlesFile, 'utf8'));
const now = new Date().toISOString();
const imageSets = JSON.parse(readFileSync(path.join(root, 'content/article-images.json'), 'utf8'));
const map = [];
let added = 0, updated = 0;
for (const item of batch) {
  assert.match(item.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.ok(item.slug.length <= 100, item.slug);
  assert.ok(item.body.trim().split(/\s+/u).length >= 500, `Insufficient editorial depth: ${item.slug}`);
  assert.ok(item.body.length <= 80000, item.slug);
  assert.ok(item.metaTitle.length <= 85 && item.metaTitle.length > 15, item.slug);
  assert.ok(item.metaDescription.length >= 100 && item.metaDescription.length <= 180, `Description: ${item.slug}`);
  assert.ok(item.excerpt.length >= 100 && item.excerpt.length <= 400, item.slug);
  const existing = articles.find(article => article.slug === item.slug);
  const imageSet = imageSets.find(set => set.slug === item.slug);
  const content = {
    slug: item.slug, title: item.title, excerpt: item.excerpt, body: imageSet ? insertArticleImages(item.body, imageSet.inline) : item.body,
    category: item.category, coverImage: imageSet?.cover.src || '/images/' + (/فروش|فروشگاه|شاپ|محصول|موجودی|درگاه|خرید/.test(item.keyword) ? 'dashboard.webp' : 'studio-world.webp'),
    metaTitle: item.metaTitle, metaDescription: item.metaDescription,
    keywords: item.keyword + ', ' + item.category + ', LOXX', published: true,
  };
  if (!existing) {
    articles.push({ ...content, createdAt: now, updatedAt: now }); added++;
  } else if (Object.entries(content).some(([key, value]) => existing[key] !== value)) {
    Object.assign(existing, content, { updatedAt: now }); updated++;
  }
  map.push({ keyword: item.keyword, slug: item.slug, title: item.title, category: item.category, url: `https://loxx.ir/blog/${item.slug}` });
}
const valid = new Set(['/', '/blog', '/#contact', '/#pricing', ...articles.map(a => '/blog/' + a.slug)]);
const services = readFileSync(path.join(root, 'apps/web/lib/service-pages.ts'), 'utf8');
for (const match of services.matchAll(/slug: '([^']+)'/g)) valid.add('/services/' + match[1]);
for (const article of batch) {
  for (const match of article.body.matchAll(/\]\((\/[^\s)]+)\)/g)) {
    assert.ok(valid.has(match[1]), `Broken editorial link ${article.slug} → ${match[1]}`);
  }
}
const landing = JSON.parse(readFileSync(path.join(root, 'content/home-seo.json'), 'utf8'));
for (const section of landing.sections) for (const match of section.body.matchAll(/\]\((\/[^\s)]+)\)/g)) assert.ok(valid.has(match[1]), `Broken landing link: ${match[1]}`);
writeFileSync(articlesFile, JSON.stringify(articles, null, 2) + '\n');
writeFileSync(path.join(root, 'content/keyword-map.json'), JSON.stringify(map, null, 2) + '\n');
const rows = map.map((item, index) => `| ${index + 1} | ${item.keyword} | [${item.title}](${item.url}) | ${item.category} |`).join('\n');
writeFileSync(path.join(root, 'docs/seo-keywords-20261102.md'), `# نقشه ۵۰ کلیدواژه و مقاله LOXX\n\nاین فهرست بر اساس خدمات واقعی و تصمیم‌های مخاطب تهیه شده است؛ داده حجم جست‌وجو یا رتبه تضمینی نیست. املای معیار «آنلاین شاپ» به‌جای غلط تایپی درخواست اولیه به کار رفته است. برای عبارت‌های نزدیک، هدف مقاله‌ها متفاوت است: ارزیابی استودیو، فرایند سفارش، اصول بصری و معیار پذیرش.\n\nمقالات پیشین و ویرایش‌های مدیر در seed بازنویسی نمی‌شوند. هر مقاله تازه یک عنوان، توضیح، URL پایدار، مثال فرضی و پیوندهای موضوعی دارد.\n\n| ردیف | کلیدواژه اصلی | مقاله | دسته |\n| --- | --- | --- | --- |\n${rows}\n\n## انتشار و پایش\n\nاجرای آماده‌سازی: \`node tools/prepare-editorial.mjs\`. درج اولیه در دیتابیس با seed معمول پروژه انجام می‌شود؛ seed موجود محتوا و رمز مدیر موجود را بازنویسی نمی‌کند. برای ویرایش محتوای زنده از پنل مدیریت استفاده کنید.\n\nسایت‌مپ پویا در [sitemap.xml](https://loxx.ir/sitemap.xml) و نشانی آن در [robots.txt](https://loxx.ir/robots.txt) قرار دارد. تاریخ مقاله‌ها از اطلاعات واقعی محتوا می‌آید. ثبت و بررسی پردازش سایت‌مپ در Search Console به حساب مالک دامنه نیاز دارد؛ انتشار فایل با ثبت حساب مالک یکسان نیست.\n\nمنابع راهنمای فنی: [محتوای مفید گوگل](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)، [ساخت سایت‌مپ](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)، [ساختار URL فروشگاه](https://developers.google.com/search/docs/specialty/ecommerce/designing-a-url-structure-for-ecommerce-sites).\n`);
console.log(`Editorial validated: ${batch.length} guides; ${added} added, ${updated} updated in source. Existing live editorial content is not modified by this command.`);
