import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Logo } from '@/components/Logo';
import { Icon } from '@/components/Icons';
import { ArticleBody, parseArticle } from '@/components/ArticleBody';
import { getArticleBySlug, getPublishedArticles, readingMinutes, articleDate } from '@/lib/posts';
import { absoluteUrl, breadcrumbSchema, jsonLd, pageMetadata } from '@/lib/seo';
import '../../blog.css';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: 'راهنما پیدا نشد', robots: { index: false, follow: false } };
  const metadata = pageMetadata(article.metaTitle || article.title, article.metaDescription || article.excerpt, '/blog/' + article.slug, article.coverImage);
  return { ...metadata, keywords: article.keywords.split(',').map(keyword => keyword.trim()).filter(Boolean), openGraph: { ...metadata.openGraph, type: 'article', publishedTime: article.createdAt, modifiedTime: article.updatedAt, authors: ['تیم تحریریه LOXX'] } };
}

export default async function Article({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();
  const blocks = parseArticle(article.body);
  const headings = blocks.filter(block => block.type === 'heading');
  const all = await getPublishedArticles();
  const related = all.filter(item => item.slug !== article.slug).sort((a, b) => Number(b.category === article.category) - Number(a.category === article.category)).slice(0, 3);
  const schema = { '@context': 'https://schema.org', '@type': 'Article', '@id': absoluteUrl('/blog/' + article.slug + '#article'), headline: article.title, description: article.excerpt, image: absoluteUrl(article.coverImage), datePublished: article.createdAt, dateModified: article.updatedAt, inLanguage: 'fa-IR', articleSection: article.category, wordCount: article.body.trim().split(/\s+/u).length, mainEntityOfPage: absoluteUrl('/blog/' + article.slug), author: { '@type': 'Organization', name: 'تیم تحریریه LOXX', url: absoluteUrl('/#about') }, publisher: { '@id': absoluteUrl('/#organization') } };
  return <><Header/><main id="main" className="loxx-article-page"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}/><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema([{ name: 'LOXX', path: '/' }, { name: 'راهنمای پروژه', path: '/blog' }, { name: article.title, path: '/blog/' + article.slug }])) }}/>
    <div className="container"><nav className="blog-breadcrumb" aria-label="مسیر صفحه"><a href="/">استودیو</a><span>/</span><a href="/blog">راهنمای پروژه</a><span>/</span><span>{article.category}</span></nav>
      <header className="loxx-article-heading"><span className="article-category-pill">{article.category}</span><h1>{article.title}</h1><p>{article.excerpt}</p><div className="article-byline"><span><img src="/brand/loxx-symbol.webp" width="30" height="30" alt=""/>تیم تحریریه LOXX</span><span>به‌روزرسانی: {articleDate(article.updatedAt)}</span><span><Icon name="clock" size={15}/>حدود {readingMinutes(article.body).toLocaleString('fa-IR')} دقیقه مطالعه</span></div></header>
      <div className="loxx-article-cover"><img src={article.coverImage} alt={'تصویر مفهومی همراه راهنمای ' + article.title} width="1400" height="600" fetchPriority="high"/><span dir="ltr">LOXX PLAYBOOK / MAKE THE NEXT MOVE CLEARER.</span></div>
      <div className="loxx-reading-layout"><aside className="loxx-reading-sidebar"><nav aria-label="فهرست راهنما" className="article-toc"><p className="eyebrow">IN THIS GUIDE</p><h2>مسیر مطالعه</h2><ol>{headings.map(heading => <li key={heading.id}><a href={'#' + heading.id}>{heading.text}</a></li>)}</ol></nav><div className="article-sidebar-cta"><Icon name="chat" size={25}/><h3>پروژه شما چه سؤالی دارد؟</h3><p>درباره نیازتان بگویید تا مسیر و محدوده را با هم روشن کنیم.</p><a href="/#contact" className="button">درخواست بررسی <Icon name="arrow" size={17}/></a><a href="tel:+989375302400" className="article-phone" dir="ltr">0937 530 2400</a></div></aside>
        <article className="loxx-article-body"><ArticleBody blocks={blocks}/><div className="article-editorial-note"><strong>یادداشت تحریریه LOXX</strong><p>این راهنما برای تصمیم‌گیری اولیه نوشته شده است. محدوده، زمان و قیمت هر پروژه پس از بررسی نیاز مشخص می‌شود. نام LOXX تازه معرفی شده؛ تجربه افراد تیم پیش از این نام شکل گرفته و تنها کارهای مجاز و قابل انتشار نمایش داده می‌شوند.</p></div></article>
      </div>
      {related.length > 0 && <section className="article-related"><div className="blog-toolbar"><div><p className="eyebrow">KEEP EXPLORING</p><h2>برای قدم بعدی <span>پیشنهاد می‌کنیم.</span></h2></div><a href="/blog" className="text-link">همه راهنماها <Icon name="arrow" size={17}/></a></div><div className="article-related-grid">{related.map(item => <a href={'/blog/' + item.slug} key={item.slug}><span>{item.category}</span><h3>{item.title}</h3><p>{item.excerpt}</p><Icon name="arrow" size={20}/></a>)}</div></section>}
    </div>
  </main><footer className="blog-footer"><div className="container"><Logo/><a href="/blog">بازگشت به راهنماها <Icon name="arrow" size={16}/></a><a href="tel:+989375302400" dir="ltr">0937 530 2400</a></div></footer></>;
}
