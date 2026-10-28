import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Icon } from '@/components/Icons';
import { articles } from '@/lib/content';
import { journalDetails } from '@/lib/journal';
export function generateStaticParams(){return articles.map(article=>({slug:article.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return {title:articles.find(article=>article.slug===slug)?.title||'یادداشت'};}
export default async function Article({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const article=articles.find(item=>item.slug===slug);
  const detail=journalDetails[slug];
  if(!article||!detail)notFound();
  return <><Header/><main id="main" className="editorial-page"><div className="container"><a className="text-link" href="/blog">بازگشت به یادداشت‌ها <Icon name="arrow" size={17}/></a>
    <div className="article-heading"><p className="eyebrow">LOXX JOURNAL / {detail.category}</p><h1>{article.title}</h1><p>{article.excerpt}</p></div>
    <img className="article-cover" src={`/images/${detail.image}`} width="1200" height="600" alt=""/>
    <div className="article-layout"><article className="article-content"><p className="article-lead">{article.body}</p>{detail.sections.map(section=><section key={section.title}><h2>{section.title}</h2><p>{section.text}</p></section>)}</article>
      <aside className="article-checklist"><p className="eyebrow">TAKE IT TO YOUR NEXT PROJECT</p><h2>برای قدم بعدی</h2><ul>{detail.checklist.map(item=><li key={item}><Icon name="check" size={16}/>{item}</li>)}</ul><a className="button" href="/#contact">درباره پروژه‌تان بگویید <Icon name="arrow" size={17}/></a></aside></div>
  </div></main></>;
}
