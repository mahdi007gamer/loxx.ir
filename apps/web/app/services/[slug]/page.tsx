import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Icon } from '@/components/Icons';
import { Logo } from '@/components/Logo';
import { getServicePage, servicePages } from '@/lib/service-pages';
import { getPublishedArticles } from '@/lib/posts';
import { absoluteUrl, breadcrumbSchema, contactPhone, contactPhoneDisplay, jsonLd, pageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export function generateStaticParams() { return servicePages.map(service => ({ slug: service.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getServicePage(slug);
  if (!service) return { title: 'خدمت پیدا نشد', robots: { index: false, follow: false } };
  return pageMetadata(service.metaTitle, service.description, `/services/${service.slug}`, service.image);
}

export default async function Service({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getServicePage(slug);
  if (!service) notFound();
  const posts = await getPublishedArticles();
  const relatedPosts = posts.filter(post => service.articleSlugs.includes(post.slug)).slice(0, 3);
  const relatedServices = service.relatedSlugs.map(getServicePage).filter((item): item is NonNullable<typeof item> => Boolean(item));
  const requestUrl = `/?service=${service.slug}#contact`;
  const schema = {
    '@context': 'https://schema.org', '@type': 'Service', '@id': absoluteUrl(`/services/${service.slug}#service`),
    name: service.title, description: service.description, url: absoluteUrl(`/services/${service.slug}`),
    serviceType: service.title, provider: { '@id': absoluteUrl('/#organization') },
  };
  return <><Header/><main id="main" className="service-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd([schema, breadcrumbSchema([{ name: 'خانه', path: '/' }, { name: service.title, path: `/services/${service.slug}` }])]) }}/>
    <div className="container">
      <nav className="service-breadcrumb" aria-label="مسیر صفحه"><a href="/">استودیو LOXX</a><span aria-hidden="true">/</span><span>{service.title}</span></nav>
      <section className="service-hero" aria-labelledby="service-title">
        <div className="service-hero-copy"><p className="eyebrow" lang="en">LOXX / {service.eyebrow}</p><span className="service-icon"><Icon name={service.icon} size={30}/></span><h1 id="service-title">{service.title}<span>از نیاز روشن،<br/>تا محصول قابل استفاده.</span></h1><p className="service-summary">{service.description}</p><div className="service-hero-actions"><a className="button" href={requestUrl}>برآورد اولیه پروژه <Icon name="arrow" size={18}/></a><a className="text-link" href={`tel:${contactPhone}`}><bdi>{contactPhoneDisplay}</bdi><Icon name="phone" size={16}/></a></div></div>
        <div className="service-hero-visual"><img src={service.image} width="1200" height="800" fetchPriority="high" alt={service.imageAlt}/><div className="service-visual-caption"><span className="signal-dot"/><span>طراحی، توسعه و همراهی در یک مسیر</span><b lang="en">LOXX</b></div></div>
      </section>
      <div className="service-outcomes" aria-label="تمرکز این خدمت">{service.outcomes.map((outcome, index) => <div key={outcome}><span lang="en">0{index + 1}</span><Icon name="check" size={19}/><p>{outcome}</p></div>)}</div>
      <div className="service-main-layout">
        <div>
          <section className="service-content-block" aria-labelledby="service-overview"><p className="eyebrow">THE RIGHT START</p><h2 id="service-overview">چه چیزی می‌سازیم و چرا؟</h2><p className="service-intro">{service.intro}</p><div className="service-audience">{service.audience.map(item => <div key={item.title}><h3>{item.title}</h3><p>{item.text}</p></div>)}</div></section>
          <section className="service-content-block" id="deliverables"><p className="eyebrow">DEFINED SCOPE / REAL DELIVERABLES</p><h2>خروجی‌هایی که درباره‌شان توافق می‌کنیم.</h2><p>این فهرست چارچوب گفت‌وگوست؛ موارد نهایی، تعداد صفحات، نقش‌ها و معیار پذیرش در پیشنهاد مخصوص پروژه شما ثبت می‌شوند.</p><div className="service-deliverables">{service.deliverables.map((item, index) => <div key={item.title}><span lang="en">0{index + 1}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></div>)}</div></section>
          <section className="service-content-block"><p className="eyebrow">HOW WE WORK</p><h2>هر مرحله، یک تصمیم قابل بررسی.</h2><ol className="service-process">{service.steps.map((step, index) => <li key={step.title}><span lang="en">0{index + 1}</span><h3>{step.title}</h3><p>{step.text}</p></li>)}</ol></section>
          <section className="service-content-block" id="service-questions"><p className="eyebrow">BEFORE WE START</p><h2>پرسش‌های قبل از سفارش</h2><div className="service-faq">{service.questions.map(question => <details key={question.question}><summary>{question.question}<Icon name="chevron" size={17}/></summary><p>{question.answer}</p></details>)}</div></section>
        </div>
        <aside className="service-scope-card" aria-label="برآورد و شروع پروژه"><p className="eyebrow">YOUR PROJECT / FIRST ESTIMATE</p><h2>برآورد اولیه،<br/><span>با محدوده مشخص.</span></h2><strong className="service-price">{service.price}</strong><span className="service-price-date">برآورد پیشنهادی استودیو · آبان ۱۴۰۵</span><p>{service.scope}</p><ul><li><Icon name="check" size={16}/>نیازسنجی و گفت‌وگوی اولیه</li><li><Icon name="check" size={16}/>تعیین خروجی و اولویت‌ها</li><li><Icon name="check" size={16}/>پیشنهاد مکتوب پیش از شروع</li></ul><a className="button" href={requestUrl}>ثبت بریف رایگان <Icon name="arrow" size={16}/></a><a className="service-call" href={`tel:${contactPhone}`}>تماس مستقیم <bdi>{contactPhoneDisplay}</bdi></a><small>ثبت درخواست به‌معنای پرداخت، رزرو یا قرارداد نیست. هزینه زیرساخت، محتوا، مجوز و سرویس ثالث تنها در صورت درج صریح در قرارداد شامل مبلغ توسعه می‌شود.</small></aside>
      </div>
      <section className="service-trust-note"><span className="service-icon"><Icon name="shield" size={27}/></span><div><p className="eyebrow">NEW NAME. EXPERIENCED PEOPLE.</p><h2>برند تازه، پشتوانه انسانی باتجربه.</h2><p>LOXX هویت تازه تیم ماست. همه تجربه‌های پیشین اعضا قابل انتشار به نام این برند نیستند و حقوق کارفرما و تیم‌های قبلی را رعایت می‌کنیم. اعتماد را با نمونه‌های مجاز، توضیح تصمیم‌ها، تحویل مرحله‌ای و محدوده مکتوب می‌سازیم. در جلسه اول می‌توانید با مسیر کار و توان فنی تیم آشنا شوید.</p></div></section>
      {relatedPosts.length > 0 && <section className="service-content-block service-related-posts"><div className="service-related-heading"><div><p className="eyebrow">A BETTER BRIEF STARTS HERE</p><h2>قبل از سفارش، دقیق‌تر بخوانید.</h2></div><a className="text-link" href="/blog">همه راهنماها <Icon name="arrow" size={16}/></a></div><div className="service-reading-grid">{relatedPosts.map(post => <a key={post.slug} href={`/blog/${post.slug}`}><span>{post.category || 'راهنمای تصمیم'}</span><h3>{post.title}</h3><p>{post.excerpt}</p><Icon name="arrow" size={20}/></a>)}</div></section>}
      <section className="service-content-block"><p className="eyebrow">THE NEXT PIECE OF YOUR PRODUCT</p><h2>خدمت‌های مرتبط</h2><div className="service-related-grid">{relatedServices.map(item => <a key={item.slug} href={`/services/${item.slug}`}><Icon name={item.icon} size={26}/><h3>{item.title}</h3><p>{item.description}</p><span>دیدن محدوده خدمت <Icon name="arrow" size={16}/></span></a>)}</div></section>
      <section className="service-final-cta"><div><p className="eyebrow">LET’S DEFINE YOUR NEXT STEP</p><h2>از مسئله شما شروع کنیم.</h2><p>هدف، نوع محصول و امکانات ضروری را بنویسید؛ برای روشن کردن مسیر و برآورد اولیه گفت‌وگو می‌کنیم.</p></div><a className="button" href={requestUrl}>درخواست مشاوره رایگان <Icon name="arrow" size={19}/></a></section>
      <footer className="service-footer"><Logo/><nav aria-label="دسترسی‌های پایان صفحه"><a href="/#work">نمونه‌کارها</a><a href="/blog">راهنماهای سفارش</a><a href="/privacy">حریم خصوصی</a><a href={`tel:${contactPhone}`}><bdi>{contactPhoneDisplay}</bdi></a></nav><a className="text-link" href="/">بازگشت به استودیو <Icon name="arrow" size={16}/></a></footer>
    </div>
  </main></>;
}
