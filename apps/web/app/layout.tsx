import type { Metadata, Viewport } from 'next';
import '@fontsource/vazirmatn/400.css';
import '@fontsource/vazirmatn/500.css';
import '@fontsource/vazirmatn/600.css';
import '@fontsource/vazirmatn/700.css';
import '@fontsource/vazirmatn/800.css';
import './globals.css';
export const metadata: Metadata = {
 metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL||'https://loxx.ir'),
 title:{default:'LOXX | طراحی و توسعه محصولات دیجیتال',template:'%s | LOXX'},
 description:'استودیو لوکس؛ طراحی وب‌سایت، اپلیکیشن موبایل، رابط کاربری و سیستم‌های اختصاصی. از ایده تا محصول، کنار شما هستیم.',
 alternates:{canonical:'/'},
 openGraph:{title:'LOXX — Digital Product Studio',description:'ایده‌های شما، محصولات دیجیتال فردا. طراحی و توسعه وب، موبایل و سیستم‌های اختصاصی.',type:'website',locale:'fa_IR',siteName:'LOXX',images:[{url:'/images/hero-desktop.webp',width:1672,height:941,alt:'منظره نئونی و نشان X استودیو LOXX'}]},
 twitter:{card:'summary_large_image'},robots:{index:true,follow:true},icons:{icon:'/icon.svg'}
};
export const viewport:Viewport={themeColor:'#001014',colorScheme:'dark'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="fa" dir="rtl"><body><a className="skip-link" href="#main">رفتن به محتوای اصلی</a>{children}</body></html>}
