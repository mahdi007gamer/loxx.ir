import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { randomBytes, scryptSync } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
const db = new PrismaClient();
function hash(v: string) {
  const salt = randomBytes(16).toString('hex');
  return salt + ':' + scryptSync(v, salt, 64).toString('hex');
}
async function main() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 12) throw new Error('ADMIN_EMAIL / ADMIN_PASSWORD not set or too short');
  await db.user.upsert({
    where: { email }, create: { name: 'مدیر LOXX', email, role: 'admin', passwordHash: hash(password) },
    update: { role: 'admin' }
  });
  const posts = JSON.parse(readFileSync(resolve(dirname(resolve(process.argv[1])), '../../../content/articles.json'), 'utf8')) as {
    slug: string; title: string; excerpt: string; body: string; category: string;
    coverImage: string; metaTitle: string; metaDescription: string; keywords: string;
    published: boolean; createdAt: string; updatedAt: string;
  }[];
  const legacyBodies: Record<string, string> = {
    'website-brief': 'پیش از شروع پروژه، هدف تجاری، مخاطب، اولویت‌های محصول، نمونه‌های مورد علاقه و محتوای اولیه را مشخص کنید. برای طراحی حرفه‌ای، شاخص‌های موفقیت و معیارهای تحویل نیز ضروری هستند.',
    'ui-vs-ux': 'رابط کاربری یا UI به لایه بصری محصول مربوط است؛ تجربه کاربری یا UX به مسیر رسیدن کاربر به هدف. محصول موفق باید هر دو را هماهنگ طراحی کند.',
    'crm-planning': 'برای طراحی CRM ابتدا مراحل فروش، نقش‌های تیم، اطلاعات مشتری و شاخص‌های عملکرد را مشخص کنید. سپس قابلیت‌ها را به فازهای قابل اندازه‌گیری تقسیم کنید.'
  };
  let created = 0, upgraded = 0;
  for (const post of posts) {
    const { createdAt, updatedAt, ...data } = post;
    const existing = await db.article.findUnique({ where: { slug: data.slug } });
    if (!existing) {
      await db.article.create({ data: { ...data, createdAt: new Date(createdAt), updatedAt: new Date(updatedAt) } });
      created++;
    } else if (existing.body === legacyBodies[data.slug]) {
      // Only upgrade the exact original demo paragraphs. Never overwrite an editor's work.
      await db.article.update({ where: { id: existing.id }, data });
      upgraded++;
    }
  }
  console.log('Articles: ' + created + ' created, ' + upgraded + ' legacy drafts upgraded; existing editorial changes preserved.');
}
main().then(() => console.log('LOXX local seed complete')).finally(() => db.$disconnect());
