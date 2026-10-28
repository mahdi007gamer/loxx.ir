import { Header } from '@/components/Header';
import { articles } from '@/lib/content';
import { Icon } from '@/components/Icons';
export const metadata={title:'یادداشت‌های استودیو'};
export default function Blog(){return <><Header/><main id="main" className="container subpage"><div className="page-intro"><p className="eyebrow">LOXX JOURNAL</p><h1>یادداشت‌های استودیو</h1><p>درباره طراحی، تکنولوژی و ساختن محصولات بهتر.</p></div><div className="article-grid">{articles.map((a,i)=><a className="article-card" href={`/blog/${a.slug}`} key={a.slug}><span>0{i+1} / INSIGHTS</span><h2>{a.title}</h2><p>{a.excerpt}</p><span className="text-link">خواندن یادداشت <Icon name="arrow" size={18}/></span></a>)}</div></main></>}
