import { Header } from '@/components/Header';
import { Logo } from '@/components/Logo';
import { Icon } from '@/components/Icons';
import { BlogExplorer } from '@/components/BlogExplorer';
import { getPublishedPosts } from '@/lib/posts';
import { pageMetadata, absoluteUrl, jsonLd } from '@/lib/seo';
import '../blog.css';

export const dynamic = 'force-dynamic';
export const metadata = pageMetadata('راهنمای سفارش سایت، اپلیکیشن و CRM', 'راهنماهای کاربردی LOXX برای برآورد هزینه، سفارش طراحی سایت، فروشگاه اینترنتی، اپلیکیشن، CRM و تصمیم‌های پیش از شروع پروژه.', '/blog', '/images/studio-world.webp');

export default async function Blog() {
  const articles = await getPublishedPosts();
  const featured = articles.find(article => article.slug === 'website-cost') || articles[0];
  const schema = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'راهنمای سفارش محصولات دیجیتال LOXX', url: absoluteUrl('/blog'), inLanguage: 'fa-IR', mainEntity: { '@type': 'ItemList', itemListElement: articles.map((article, index) => ({ '@type': 'ListItem', position: index + 1, url: absoluteUrl('/blog/' + article.slug), name: article.title })) } };
  return <><Header/><main id="main" className="blog-hub"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}/>
    <section className="blog-hub-hero"><div className="container"><div className="blog-breadcrumb"><a href="/">استودیو LOXX</a><span> / </span><span>راهنمای پروژه</span></div><div className="blog-hero-layout"><div className="blog-hero-copy"><p className="eyebrow">IDEAS INTO INFORMED DECISIONS</p><h1>قبل از ساختن،<br/><span>روشن‌تر تصمیم بگیرید.</span></h1><p>پاسخ‌های کاربردی برای سؤال‌های واقعی سفارش سایت، اپلیکیشن و سیستم اختصاصی. از اولین ایده تا محدوده، هزینه و تحویل.</p><div className="blog-hero-actions"><a href="#guides" className="button">راهنمای مناسب من <Icon name="arrow" size={18}/></a><a href="/#contact" className="text-link">پرسش شما، شروع گفت‌وگوست</a></div><div className="blog-hero-topics"><span>هزینه و محدوده</span><i/><span>طراحی و تجربه</span><i/><span>توسعه و رشد</span></div></div>
      {featured && <a className="blog-featured" href={'/blog/' + featured.slug}><img src={featured.coverImage} alt="" width="900" height="650"/><span className="blog-featured-label">برای شروع پیشنهاد می‌کنیم</span><div><span>{featured.category}</span><h2>{featured.title}</h2><p>{featured.excerpt}</p><strong>بخوانید و با سؤال‌های دقیق‌تر شروع کنید <Icon name="arrow" size={20}/></strong></div></a>}
    </div></div></section>
    <section className="blog-library-section"><div className="container"><BlogExplorer articles={articles.map(article => ({ ...article, body: '' }))}/></div></section>
    <section className="blog-conversation"><div className="container"><div><p className="eyebrow">YOUR NEXT MOVE</p><h2>سؤال پروژه شما،<br/><span>پاسخ مخصوص خودش را دارد.</span></h2><p>اگر بعد از مطالعه هنوز میان چند مسیر مردد هستید، مسئله‌تان را برای ما بنویسید. از همان نقطه شروع می‌کنیم.</p></div><a className="button" href="/#contact">بررسی رایگان نیاز پروژه <Icon name="arrow" size={18}/></a></div></section>
  </main><footer className="blog-footer"><div className="container"><Logo/><p>یک قدم آگاهانه‌تر، پیش از ساختن.</p><a href="tel:+989375302400" dir="ltr">0937 530 2400</a></div></footer></>;
}
