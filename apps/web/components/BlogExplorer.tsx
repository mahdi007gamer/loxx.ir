'use client';
import { useState } from 'react';
import { Icon } from '@/components/Icons';
import type { Article } from '@/lib/posts';

const normalize = (text: string) => text.replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/\u200c/g, ' ').toLocaleLowerCase('fa');
const displayDate = (value: string) => new Date(value).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });

export function BlogExplorer({ articles }: { articles: Article[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('همه راهنماها');
  const categories = ['همه راهنماها', ...new Set(articles.map(article => article.category))];
  const visible = articles.filter(article => (category === 'همه راهنماها' || article.category === category) && normalize(article.title + ' ' + article.excerpt + ' ' + article.keywords).includes(normalize(query.trim())));
  return <div className="blog-explorer" id="guides">
    <div className="blog-toolbar"><div><p className="eyebrow">THE LOXX PLAYBOOK</p><h2>برای تصمیم بعدی، <span>یک راهنمای روشن.</span></h2></div><label className="blog-search"><Icon name="idea" size={18}/><span className="sr-only">جست‌وجو در عنوان و موضوع راهنماها</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="دنبال چه تصمیمی هستید؟"/></label></div>
    <div className="blog-categories" aria-label="موضوع راهنماها">{categories.map(item => <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item} className={category === item ? 'active' : ''}>{item}</button>)}</div>
    <p className="blog-result-count" aria-live="polite">{visible.length.toLocaleString('fa-IR')} راهنما برای انتخاب شما</p>
    <div className="blog-guide-grid">{visible.map((article, index) => <a href={'/blog/' + article.slug} className="blog-guide-card" key={article.slug}>
      <div className="blog-guide-image"><img src={article.coverImage} alt="" width="800" height="500" loading="lazy"/><span className="blog-card-index" dir="ltr">{String(index + 1).padStart(2, '0')} / READ · DECIDE · BUILD</span><span className="blog-card-arrow"><Icon name="arrow" size={23}/></span></div>
      <div className="blog-guide-copy"><span className="blog-guide-category">{article.category}</span><h3>{article.title}</h3><p>{article.excerpt}</p><div className="blog-guide-bottom"><span>{displayDate(article.updatedAt)}</span><strong>خواندن راهنما <Icon name="arrow" size={16}/></strong></div></div>
    </a>)}</div>
    {visible.length === 0 && <div className="blog-empty"><Icon name="idea" size={32}/><h3>راهنمایی با این عبارت پیدا نشد.</h3><p>عبارت کوتاه‌تری امتحان کنید یا موضوع موردنظر را برای تیم ما بنویسید.</p><button type="button" className="button outline" onClick={() => { setQuery(''); setCategory('همه راهنماها'); }}>نمایش همه راهنماها</button></div>}
  </div>;
}
