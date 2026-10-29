import type { Metadata, Viewport } from 'next';
import '@fontsource/vazirmatn/400.css';
import '@fontsource/vazirmatn/500.css';
import '@fontsource/vazirmatn/600.css';
import '@fontsource/vazirmatn/700.css';
import '@fontsource/vazirmatn/800.css';
import './globals.css';
import './experience.css';
import './seo.css';
import { absoluteUrl, indexingEnabled, jsonLd, organizationSchema, siteUrl, websiteSchema } from '@/lib/seo';
export const metadata: Metadata = {
 metadataBase: new URL(siteUrl),
 title: { default: 'LOXX | طراحی سایت، اپلیکیشن و نرم‌افزار اختصاصی', template: '%s | LOXX' },
 description: 'طراحی سایت شرکتی و فروشگاهی، اپلیکیشن، UI/UX و CRM اختصاصی در LOXX؛ تیم باتجربه، محدوده روشن، برآورد اولیه و مشاوره رایگان. تماس ۰۹۳۷۵۳۰۲۴۰۰.',
 applicationName: 'LOXX', category: 'technology',
 alternates: { canonical: absoluteUrl('/') },
 openGraph: { title: 'LOXX | از ایده تا محصول دیجیتال', description: 'طراحی و توسعه وب، موبایل و سیستم‌های اختصاصی با مسیر همکاری شفاف.', url: siteUrl, type: 'website', locale: 'fa_IR', siteName: 'LOXX', images: [{ url: absoluteUrl('/images/hero-desktop.webp'), width: 1672, height: 941, alt: 'دنیای دیجیتال و نشان نئونی LOXX' }] },
 twitter: { card: 'summary_large_image' },
 robots: { index: indexingEnabled(), follow: true },
 icons: { icon: [{ url: '/brand/loxx-icon.png', type: 'image/png' }], apple: '/brand/loxx-icon.png' },
 formatDetection: { telephone: false },
};
export const viewport:Viewport={themeColor:'#001014',colorScheme:'dark'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="fa" dir="rtl"><body><a className="skip-link" href="#main">رفتن به محتوای اصلی</a><script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd([organizationSchema,websiteSchema])}}/>{children}</body></html>}
