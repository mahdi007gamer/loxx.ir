import { Header } from '@/components/Header';
import { articles } from '@/lib/content';
import { journalDetails } from '@/lib/journal';
import { Icon } from '@/components/Icons';
export const metadata = { title: 'یادداشت‌های استودیو' };
export default function Blog() {
  return <><Header/><main id="main" className="editorial-page"><div className="container">
    <div className="editorial-hero"><img src="/images/studio-world.webp" alt="" width="1400" height="933"/><div><p className="eyebrow">LOXX JOURNAL / IDEAS WORTH SHARING</p><h1>کمی فکر،<br/><span>قبل از ساختن.</span></h1><p>یادداشت‌هایی برای تصمیم‌های روشن‌تر<br/>در طراحی، تکنولوژی و توسعه محصولات دیجیتال.</p></div></div>
    <div className="journal-cards">{articles.map((article,index)=><a href={`/blog/${article.slug}`} className="journal-card" key={article.slug}>
      <div className="journal-image"><img src={`/images/${journalDetails[article.slug].image}`} width="800" height="533" alt=""/><span lang="en">0{index+1} / STUDIO INSIGHTS</span></div>
      <div className="journal-card-body"><span className="journal-category">{journalDetails[article.slug].category}</span><h3>{article.title}</h3><p>{article.excerpt}</p><span className="journal-read">خواندن یادداشت <Icon name="arrow" size={18}/></span></div>
    </a>)}</div><a className="text-link" href="/">بازگشت به استودیو <Icon name="arrow" size={18}/></a>
  </div></main></>;
}
