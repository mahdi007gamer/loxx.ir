import type { IconName } from '@/components/Icons';

/** Studio planning estimates, in million toman. The agreed scope determines a quotation. */
export type ProjectPackage = {
  id: string; title: string; service: string; icon: IconName; low: number; high: number;
  description: string; duration: string; included: string[]; options: { title: string; low: number; high: number }[];
};
export const projectPackages: ProjectPackage[] = [
  { id: 'landing', title: 'لندینگ پیج', service: 'طراحی وب‌سایت', icon: 'rocket', low: 15, high: 30,
    description: 'یک مقصد روشن برای معرفی خدمت، کمپین یا دریافت درخواست؛ با طراحی اختصاصی و مسیر تماس مشخص.', duration: 'برآورد اولیه ۲ تا ۴ هفته',
    included: ['طراحی اختصاصی یک صفحه', 'نمایش در موبایل', 'فرم ثبت درخواست', 'ساختار پایه سئو'],
    options: [{ title: 'بخش بلاگ و مدیریت محتوا', low: 5, high: 12 }, { title: 'نسخه دوم زبان', low: 4, high: 9 }, { title: 'اتصال به CRM یا سرویس پیامک', low: 3, high: 8 }, { title: 'تصویرسازی و موشن اختصاصی', low: 4, high: 12 }] },
  { id: 'company', title: 'سایت شرکتی', service: 'طراحی وب‌سایت', icon: 'monitor', low: 25, high: 55,
    description: 'برای معرفی حرفه‌ای شرکت، خدمات و پروژه‌ها؛ با مدیریت محتوا و تبدیل بازدیدکننده به سرنخ فروش.', duration: 'برآورد اولیه ۴ تا ۸ هفته',
    included: ['طراحی صفحات اصلی', 'پنل مدیریت محتوا', 'بلاگ و نمونه‌کارها', 'فرم استعلام و سئو فنی پایه'],
    options: [{ title: 'نسخه دوم زبان', low: 7, high: 16 }, { title: 'فرم استعلام چندمرحله‌ای', low: 6, high: 15 }, { title: 'اتصال به نرم‌افزار سازمانی', low: 8, high: 25 }, { title: 'کاتالوگ یا ابزار تعاملی محصول', low: 8, high: 25 }] },
  { id: 'ecommerce', title: 'فروشگاه اینترنتی', service: 'فروشگاه آنلاین', icon: 'cart', low: 45, high: 100,
    description: 'فروش محصول یا خدمات با مسیر خرید، مدیریت سفارش و تجربه موبایل متناسب با مدل کسب‌وکار شما.', duration: 'برآورد اولیه ۶ تا ۱۲ هفته',
    included: ['کاتالوگ و جست‌وجوی محصول', 'سبد خرید و فرایند سفارش', 'حساب مشتری و پنل مدیریت', 'اتصال به یک درگاه پرداخت'],
    options: [{ title: 'کیف پول و اعتبار مشتری', low: 10, high: 30 }, { title: 'مدیریت اشتراک یا لایسنس', low: 12, high: 35 }, { title: 'اتصال به موجودی یا حسابداری', low: 12, high: 40 }, { title: 'جست‌وجو و فیلتر پیشرفته', low: 6, high: 18 }] },
  { id: 'mvp', title: 'نسخه اولیه محصول', service: 'راهکارهای اختصاصی', icon: 'layers', low: 90, high: 220,
    description: 'نسخه قابل استفاده از ایده اصلی شما؛ با اولویت امکانات ضروری و امکان توسعه مرحله‌ای.', duration: 'برآورد اولیه ۸ تا ۱۶ هفته',
    included: ['جلسه شناخت و تعریف نسخه اولیه', 'طراحی مسیرهای اصلی محصول', 'توسعه وب و API اصلی', 'پنل مدیریت و آزمون مسیرها'],
    options: [{ title: 'اپلیکیشن همراه', low: 35, high: 100 }, { title: 'پرداخت و اشتراک دوره‌ای', low: 12, high: 35 }, { title: 'گفت‌وگو یا اعلان زنده', low: 15, high: 45 }, { title: 'اتصال به سرویس‌های تخصصی', low: 15, high: 60 }] },
  { id: 'crm', title: 'CRM اختصاصی', service: 'سیستم‌های سازمانی', icon: 'settings', low: 100, high: 300,
    description: 'سامانه‌ای هماهنگ با جریان فروش و کار تیم شما؛ از اطلاعات مشتری تا پیگیری، دسترسی و گزارش.', duration: 'برآورد اولیه ۱۰ تا ۲۰ هفته',
    included: ['تحلیل فرایند اصلی سازمان', 'مدیریت مشتری و فرصت فروش', 'نقش‌ها و سطوح دسترسی', 'گزارش‌های اصلی و آموزش اولیه'],
    options: [{ title: 'ورود و پاک‌سازی داده قدیمی', low: 10, high: 40 }, { title: 'اتصال به حسابداری یا ERP', low: 25, high: 80 }, { title: 'اتوماسیون چندمرحله‌ای', low: 15, high: 50 }, { title: 'گزارش‌ها و داشبورد پیشرفته', low: 12, high: 45 }] },
];

export const estimateDate = 'آبان ۱۴۰۵';
export const formatMoney = (value: number) => new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(value);
