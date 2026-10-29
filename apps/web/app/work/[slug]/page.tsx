import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Icon } from '@/components/Icons';
import { ProjectIdentity } from '@/components/WorkGallery';
import { portfolioProjects, getPortfolioProject } from '@/lib/portfolio';
import '@/app/portfolio.css';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://loxx.ir').replace(/\/$/, '');
export function generateStaticParams() { return portfolioProjects.map(project => ({ slug: project.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = getPortfolioProject(slug);
  if (!project) return { title: 'پروژه پیدا نشد', robots: { index: false } };
  return {
    title: `${project.title}؛ نمونه‌کار تیم LOXX`,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: { title: `${project.title} | LOXX`, description: project.summary, url: `/work/${project.slug}`,
      images: project.image ? [{ url: project.image, alt: project.imageAlt }] : undefined },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getPortfolioProject(slug);
  if (!project) notFound();
  const related = portfolioProjects.filter(item => item.slug !== slug).slice(0, 2);
  const structured = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'CreativeWork', name: project.title, description: project.summary, inLanguage: 'fa-IR',
        url: `${siteUrl}/work/${project.slug}`, ...(project.image ? { image: `${siteUrl}${project.image}` } : {}),
        about: project.categoryLabel },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'LOXX', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: 'نمونه‌کارها', item: `${siteUrl}/#work` },
        { '@type': 'ListItem', position: 3, name: project.title, item: `${siteUrl}/work/${project.slug}` },
      ] },
    ],
  };
  return <><Header/><main id="main" className="casepage" style={{ '--case-accent': project.accent } as CSSProperties}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, '\\u003c') }}/>
    <div className="container">
      <nav className="casepage-breadcrumb" aria-label="مسیر صفحه"><a href="/">استودیو</a><span>/</span><a href="/#work">نمونه‌کارها</a><span>/</span><span aria-current="page">{project.title}</span></nav>
      <section className="casepage-intro">
        <div><p className="eyebrow">SELECTED TEAM EXPERIENCE</p><h1>{project.title}</h1><p className="casepage-summary">{project.summary}</p><div className="caseport-tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div></div>
        <div className="casepage-project-meta"><span>{project.categoryLabel}</span><strong lang="en">{project.englishName}</strong><span dir="ltr">{project.domain}</span><span className={`caseport-status caseport-status-${project.statusKind}`}><i/>{project.status}</span></div>
      </section>
      <figure className="casepage-preview">
        <div className="caseport-browser"><span><i/><i/><i/></span><small dir="ltr">{project.domain}</small><Icon name="globe" size={13}/></div>
        <div className="casepage-preview-image">{project.image ? <img src={project.image} alt={project.imageAlt} width="1280" height="870" fetchPriority="high"/> : <ProjectIdentity project={project}/>}</div>
        <figcaption>{project.previewNote}</figcaption>
      </figure>
      <div className="casepage-story-grid">
        <article className="casepage-story"><p className="eyebrow">THE CONTEXT</p><h2>مسئله‌ای که پشت این تجربه بود.</h2><p>{project.introduction}</p><section><h3>چالش پروژه</h3><p>{project.challenge}</p></section><section><h3>رویکرد طراحی و اجرا</h3><p>{project.approach}</p></section></article>
        <aside className="casepage-aside"><Icon name="idea" size={27}/><h2>یک نکته برای پروژه شما</h2><p>{project.takeaway}</p><a className="button" href="/#contact">بررسی ایده مشابه <Icon name="arrow" size={17}/></a><a className="casepage-call" href="tel:+989375302400" dir="ltr">0937 530 2400</a></aside>
      </div>
      <section className="casepage-scope" aria-labelledby="casepage-scope-title"><div className="chapter-heading"><div><p className="eyebrow">PROJECT SCOPE</p><h2 id="casepage-scope-title">بخش‌های اصلی این تجربه.</h2></div><p>نگاهی به مسیرها و بخش‌های قابل نمایش پروژه.</p></div><div className="casepage-scope-grid">{project.scope.map((item, index) => <article key={item.title}><span lang="en">0{index + 1}</span><h3>{item.title}</h3><p>{item.description}</p></article>)}</div></section>
      {project.fullImage && <section className="casepage-full-preview"><div><p className="eyebrow">PROVIDED PROJECT PREVIEW</p><h2>نمای کامل نسخه جدید.</h2><p>این تصویر مربوط به نسخه جدید طراحی‌شده است؛ انتشار آن روی دامنه اصلی، مرحله بعدی پروژه خواهد بود.</p></div><a href={project.fullImage} target="_blank" rel="noopener noreferrer" aria-label="باز کردن تصویر کامل نسخه جدید مهراد کویر"><img src={project.fullImage} alt="پیش‌نمایش کامل نسخه جدید سایت مهراد کویر، شامل معرفی، محصولات، پروژه‌ها و طراحی سه‌بعدی" width="401" height="2048" loading="lazy"/><span>باز کردن پیش‌نمایش کامل <Icon name="arrow" size={17}/></span></a></section>}
      <div className="casepage-project-link">{project.statusKind === 'live' ? <a className="button outline" href={project.url} target="_blank" rel="noopener noreferrer">مشاهده دامنه پروژه <Icon name="globe" size={18}/></a> : <p><Icon name="clock" size={20}/>نسخه جدید هنوز روی دامنه اصلی منتشر نشده است؛ تصویر بالا، مرجع این نمونه‌کار است.</p>}<a className="text-link" href="/#work">همه نمونه‌کارها <Icon name="arrow" size={18}/></a></div>
      <section className="casepage-related" aria-labelledby="casepage-related-title"><p className="eyebrow">KEEP EXPLORING</p><h2 id="casepage-related-title">تجربه‌های دیگر تیم.</h2><div>{related.map(item => <a href={`/work/${item.slug}`} key={item.slug}><span>{item.categoryLabel}</span><h3>{item.title}</h3><p>{item.summary}</p><Icon name="arrow" size={21}/></a>)}</div></section>
      <section className="casepage-cta"><div><p className="eyebrow">YOUR PROJECT, NEXT.</p><h2>مسئله شما چه شکلی است؟</h2><p>از هدف، کاربران و امکانات ضروری بگویید؛ با هم محدوده نسخه اول را روشن می‌کنیم.</p></div><a className="button" href="/#contact">شروع مشاوره رایگان <Icon name="arrow" size={19}/></a></section>
    </div>
  </main></>;
}
