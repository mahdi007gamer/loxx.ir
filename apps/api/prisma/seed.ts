import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { randomBytes, scryptSync } from 'node:crypto';
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
  const posts = [
    ['website-brief', 'قبل از سفارش طراحی سایت چه چیزهایی را آماده کنیم؟', 'چک‌لیست عملی برای شروع یک پروژه وب موفق.', 'پیش از شروع پروژه، هدف تجاری، مخاطب، اولویت‌های محصول، نمونه‌های مورد علاقه و محتوای اولیه را مشخص کنید. برای طراحی حرفه‌ای، شاخص‌های موفقیت و معیارهای تحویل نیز ضروری هستند.'],
    ['ui-vs-ux', 'تفاوت UI و UX در محصول دیجیتال', 'چرا ظاهر زیبا به تنهایی محصول موفق نمی‌سازد؟', 'رابط کاربری یا UI به لایه بصری محصول مربوط است؛ تجربه کاربری یا UX به مسیر رسیدن کاربر به هدف. محصول موفق باید هر دو را هماهنگ طراحی کند.'],
    ['crm-planning', 'چطور برای راه‌اندازی CRM آماده شویم؟', 'از فرایند فروش تا تعریف گزارش‌های کلیدی.', 'برای طراحی CRM ابتدا مراحل فروش، نقش‌های تیم، اطلاعات مشتری و شاخص‌های عملکرد را مشخص کنید. سپس قابلیت‌ها را به فازهای قابل اندازه‌گیری تقسیم کنید.']
  ];
  for (const [slug, title, excerpt, body] of posts) await db.article.upsert({
    where: { slug }, create: { slug, title, excerpt, body, published: true }, update: {}
  });
}
main().then(() => console.log('LOXX local seed complete')).finally(() => db.$disconnect());
