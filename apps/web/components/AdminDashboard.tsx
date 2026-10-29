'use client';
import { useCallback, useEffect, useState } from 'react';
import { Logo } from './Logo';

type Tab = 'overview' | 'leads' | 'quotes' | 'articles' | 'users';
type Admin = { id: string; name: string; email: string; role: string };
type Summary = { leads: number; quotes: number; users: number; articles: number; newLeads: number; newQuotes: number; publishedArticles: number; drafts: number };
type RequestItem = { id: string; name: string; phone: string; email?: string; service: string; status: string; message?: string; features?: string; budget?: string; createdAt: string };
type Article = { id?: string; slug: string; title: string; excerpt: string; body: string; category: string; coverImage: string; metaTitle: string; metaDescription: string; keywords: string; published: boolean; createdAt?: string; updatedAt?: string };
type Customer = { id: string; name: string; email: string; role: string; createdAt: string; _count: { leads: number; quotes: number } };
const labels: Record<Tab, string> = { overview: 'نمای کلی', leads: 'درخواست‌های مشاوره', quotes: 'برآوردها و پیش‌سفارش‌ها', articles: 'مقاله‌ها و سئو', users: 'کاربران' };
const statuses: Record<string, string> = { new: 'جدید', contacted: 'تماس گرفته شده', in_progress: 'در حال انجام', closed: 'بسته شده' };
const blankArticle = (): Article => ({ slug: '', title: '', excerpt: '', body: '', category: 'راهنمای پروژه', coverImage: '/images/devices.webp', metaTitle: '', metaDescription: '', keywords: '', published: false });
const date = (value?: string) => value ? new Date(value).toLocaleDateString('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch('/api/' + url, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers }, cache: 'no-store' });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof body.message === 'string' ? body.message : 'ارتباط با سرور انجام نشد. دوباره تلاش کنید.');
  return body;
}
function MarkdownPreview({ body }: { body: string }) {
  return <div className="admin-markdown">{body.split(/\n\s*\n/).map((part, i) => part.startsWith('### ') ? <h3 key={i}>{part.slice(4)}</h3> : part.startsWith('## ') ? <h2 key={i}>{part.slice(3)}</h2> : part.startsWith('# ') ? <h2 key={i}>{part.slice(2)}</h2> : <p key={i}>{part}</p>)}</div>;
}
function features(value?: string) {
  try { const parsed: unknown = JSON.parse(value || '[]'); return Array.isArray(parsed) ? parsed.filter(v => typeof v === 'string') as string[] : []; } catch { return []; }
}

export function AdminDashboard() {
  const [identity, setIdentity] = useState<'loading' | 'guest' | 'denied' | 'ready'>('loading');
  const [user, setUser] = useState<Admin | null>(null);
  const [tab, setTab] = useState<Tab>('overview');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [users, setUsers] = useState<Customer[]>([]);
  const [draft, setDraft] = useState<Article | null>(null);
  const [preview, setPreview] = useState(false);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false);
  const [actionBusy, setActionBusy] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState('');

  useEffect(() => {
    let live = true;
    api<Admin>('auth/me').then(data => {
      if (!live) return;
      setUser(data); setIdentity(data.role === 'admin' ? 'ready' : 'denied');
    }).catch(() => { if (live) setIdentity('guest'); });
    return () => { live = false; };
  }, []);

  const load = useCallback(async () => {
    if (identity !== 'ready') return;
    setBusy(true); setError('');
    try {
      const stats = await api<Summary>('admin/overview'); setSummary(stats);
      if (tab === 'leads' || tab === 'quotes') {
        const params = new URLSearchParams({ paginated: '1', page: String(page), pageSize: '15' });
        if (search) params.set('q', search);
        if (status) params.set('status', status);
        const data = await api<{ items: RequestItem[]; total: number }>('admin/' + tab + '?' + params);
        setRequests(data.items); setTotal(data.total);
      } else if (tab === 'articles') setArticles(await api<Article[]>('admin/articles'));
      else if (tab === 'users') setUsers(await api<Customer[]>('admin/users'));
    } catch (e) { setError(e instanceof Error ? e.message : 'دریافت اطلاعات انجام نشد.'); }
    finally { setBusy(false); }
  }, [identity, tab, page, search, status]);
  useEffect(() => { void load(); }, [load]);

  function changeTab(next: Tab) {
    setTab(next); setPage(1); setQuery(''); setSearch(''); setStatus(''); setNotice(''); setError(''); setDeleteId('');
  }
  async function logout() {
    try { await api('auth/logout', { method: 'POST' }); location.assign('/login'); }
    catch (e) { setError(e instanceof Error ? e.message : 'خروج انجام نشد.'); }
  }
  async function changeStatus(item: RequestItem, next: string) {
    setActionBusy(item.id); setError(''); setNotice('');
    try {
      await api('admin/' + tab + '/' + item.id, { method: 'PATCH', body: JSON.stringify({ status: next }) });
      setNotice('وضعیت درخواست ذخیره شد.'); await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'ذخیره وضعیت انجام نشد.'); }
    finally { setActionBusy(''); }
  }
  async function saveArticle(published: boolean) {
    if (!draft) return;
    setActionBusy('article'); setError(''); setNotice('');
    try {
      const saved = await api<Article>('admin/articles' + (draft.id ? '/' + draft.id : ''), { method: draft.id ? 'PATCH' : 'POST', body: JSON.stringify({ ...draft, published }) });
      setDraft(saved); setNotice(published ? 'مقاله منتشر شد و در بلاگ قابل مشاهده است.' : 'پیش‌نویس ذخیره شد و در سایت عمومی نمایش داده نمی‌شود.');
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'ذخیره مقاله انجام نشد.'); }
    finally { setActionBusy(''); }
  }
  async function deleteArticle(article: Article) {
    setActionBusy(article.id || ''); setError(''); setNotice('');
    try {
      await api('admin/articles/' + article.id, { method: 'DELETE' });
      if (draft?.id === article.id) setDraft(null);
      setDeleteId(''); setNotice('مقاله حذف شد.'); await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'حذف انجام نشد.'); }
    finally { setActionBusy(''); }
  }
  function exportPage() {
    const cell = (value: string) => '"' + (/^\s*[=+\-@]/.test(value) ? "'" + value : value).replace(/"/g, '""') + '"';
    const csv = ['نام,تماس,خدمت,وضعیت,تاریخ', ...requests.map(item => [item.name, item.phone, item.service, statuses[item.status] || item.status, date(item.createdAt)].map(cell).join(','))].join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a'); link.href = url; link.download = 'loxx-' + tab + '-page-' + page + '.csv'; link.click(); URL.revokeObjectURL(url);
  }

  if (identity !== 'ready') return <div className="admin-gate"><Logo/><p className="eyebrow">LOXX / STUDIO CONTROL</p><h1>{identity === 'loading' ? 'در حال بررسی حساب…' : identity === 'guest' ? 'وارد حساب مدیریت شوید.' : 'این بخش مخصوص مدیر استودیو است.'}</h1><p>{identity === 'loading' ? 'کمی صبر کنید.' : identity === 'guest' ? 'برای دیدن درخواست‌ها و مدیریت مقاله‌ها، با حساب مدیر وارد شوید.' : 'حساب فعلی دسترسی مدیریت ندارد. درخواست‌های خود را از حساب کاربری دنبال کنید.'}</p>{identity !== 'loading' && <a className="button" href="/login">ورود / حساب کاربری ←</a>}<a className="admin-site-link" href="/">بازگشت به سایت</a></div>;

  return <div className="admin-shell"><aside className="admin-sidebar"><Logo/><p className="admin-sidebar-label">فضای مدیریت استودیو</p><nav aria-label="مدیریت">{(Object.keys(labels) as Tab[]).map((key, i) => <button type="button" aria-current={tab === key ? 'page' : undefined} className={tab === key ? 'active' : ''} key={key} onClick={() => changeTab(key)}><span className="admin-nav-number">0{i + 1}</span>{labels[key]}{key === 'leads' && !!summary?.newLeads && <b>{summary.newLeads}</b>}</button>)}</nav><div className="admin-sidebar-bottom"><p>{user?.name}<small>{user?.email}</small></p><a href="/" target="_blank" rel="noreferrer">مشاهده سایت ↗</a><a href="/blog" target="_blank" rel="noreferrer">مشاهده بلاگ ↗</a><button type="button" onClick={logout}>خروج از حساب</button></div></aside>
    <div className="admin-workspace"><header className="admin-topbar"><div><p className="eyebrow">LOXX / WORKSPACE</p><h1>{labels[tab]}</h1></div><button type="button" className="admin-secondary" onClick={() => void load()} disabled={busy}>{busy ? 'در حال دریافت…' : 'تازه‌سازی ↻'}</button></header>
      <div className="admin-messages" aria-live="polite">{notice && <p className="admin-success">{notice}</p>}{error && <p className="admin-error" role="alert">{error}</p>}</div>
      {tab === 'overview' && <><div className="admin-stat-grid">{[['newLeads', 'مشاوره در انتظار تماس'], ['newQuotes', 'برآورد در انتظار بررسی'], ['publishedArticles', 'مقاله منتشرشده'], ['users', 'حساب کاربری']].map(([key, label]) => <div key={key} className="admin-stat"><span>{label}</span><strong>{summary ? summary[key as keyof Summary].toLocaleString('fa-IR') : '…'}</strong><small>بر اساس داده‌های ثبت‌شده</small></div>)}</div><div className="admin-overview-grid"><section className="admin-panel"><p className="eyebrow">NEXT ACTION</p><h2>از گفت‌وگو تا همکاری</h2><p>درخواست‌های جدید را بررسی کنید، با مشتری تماس بگیرید و وضعیت هر گفت‌وگو را به‌روز نگه دارید.</p><button className="button" onClick={() => changeTab('leads')}>بررسی مشاوره‌ها ←</button><button className="admin-text-button" onClick={() => changeTab('quotes')}>مشاهده برآوردها</button></section><section className="admin-panel"><p className="eyebrow">CONTENT DESK</p><h2>یک محتوای خوب، یک تصمیم روشن‌تر.</h2><p>{summary?.articles ?? '…'} مقاله ثبت شده؛ {summary?.drafts ?? '…'} پیش‌نویس منتظر انتشار. عنوان، توضیح متا و متن مقاله را از همین‌جا مدیریت کنید.</p><button className="button outline" onClick={() => { changeTab('articles'); setDraft(blankArticle()); }}>نوشتن مقاله تازه +</button></section></div><div className="admin-note">این پنل تعداد واقعی درخواست‌ها و محتوا را نشان می‌دهد. آمار بازدید و رتبه جست‌وجو پس از اتصال ابزار تحلیل جداگانه قابل بررسی هستند.</div></>}
      {(tab === 'leads' || tab === 'quotes') && <section className="admin-panel"><form className="admin-filters" onSubmit={e => { e.preventDefault(); setSearch(query); setPage(1); }}><label>جست‌وجوی درخواست<input value={query} onChange={e => setQuery(e.target.value)} placeholder="نام، شماره تماس یا خدمت" maxLength={150}/></label><label>وضعیت<select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}><option value="">همه وضعیت‌ها</option>{Object.entries(statuses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><button className="admin-secondary" type="submit">جست‌وجو</button><button className="admin-secondary" type="button" onClick={exportPage} disabled={!requests.length}>خروجی همین صفحه ↓</button></form><div className="admin-list-meta"><span>{total.toLocaleString('fa-IR')} درخواست مطابق فیلتر</span><span>صفحه {page.toLocaleString('fa-IR')}</span></div><div className="admin-request-list">{busy ? <p className="admin-empty">در حال دریافت درخواست‌ها…</p> : requests.length === 0 ? <p className="admin-empty">درخواستی با این مشخصات پیدا نشد.</p> : requests.map(item => <article className="admin-request" key={item.id}><div className="admin-request-head"><div><span className={'admin-badge status-' + item.status}>{statuses[item.status] || item.status}</span><small>{date(item.createdAt)}</small></div><select aria-label={'وضعیت درخواست ' + item.name} value={item.status} disabled={actionBusy === item.id} onChange={e => void changeStatus(item, e.target.value)}>{Object.entries(statuses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div><h2>{item.service}</h2><div className="admin-request-contact"><strong>{item.name}</strong><a href={'tel:' + item.phone} dir="ltr">{item.phone}</a>{item.email && <a href={'mailto:' + item.email}>{item.email}</a>}</div>{item.message && <p className="admin-request-message">{item.message}</p>}{item.budget && <p>برآورد اعلام‌شده: <b>{item.budget}</b></p>}{item.features && <ul className="admin-feature-tags">{features(item.features).map((feature, i) => <li key={i}>{feature}</li>)}</ul>}<small className="admin-request-id" dir="ltr">ID: {item.id}</small></article>)}</div><div className="admin-pagination"><button className="admin-secondary" disabled={page <= 1 || busy} onClick={() => setPage(page - 1)}>صفحه قبل</button><span>{page.toLocaleString('fa-IR')} / {Math.max(1, Math.ceil(total / 15)).toLocaleString('fa-IR')}</span><button className="admin-secondary" disabled={page * 15 >= total || busy} onClick={() => setPage(page + 1)}>صفحه بعد</button></div></section>}
      {tab === 'articles' && <div className="admin-content-grid"><section className="admin-panel admin-article-list"><div className="admin-section-title"><h2>میز محتوا</h2><button className="admin-secondary" onClick={() => { setDraft(blankArticle()); setPreview(false); setNotice(''); }}>مقاله تازه +</button></div><label className="admin-content-search">جست‌وجو در مقاله‌ها<input value={query} onChange={e => setQuery(e.target.value)} placeholder="عنوان یا دسته‌بندی"/></label>{articles.filter(article => (article.title + article.category).includes(query)).map(article => <article key={article.id} className={'admin-article-row ' + (draft?.id === article.id ? 'selected' : '')}><span className={'admin-badge ' + (article.published ? 'published' : 'draft')}>{article.published ? 'منتشرشده' : 'پیش‌نویس'}</span><h3>{article.title}</h3><p>{article.category} · {date(article.updatedAt)}</p><div><button className="admin-text-button" onClick={() => { setDraft(article); setPreview(false); setDeleteId(''); }}>ویرایش ←</button>{article.published && <a href={'/blog/' + article.slug} target="_blank" rel="noreferrer">مشاهده ↗</a>}<button className="admin-delete" onClick={() => setDeleteId(deleteId === article.id ? '' : article.id || '')}>حذف</button></div>{deleteId === article.id && <div className="admin-delete-confirm"><p>این مقاله برای همیشه حذف شود؟</p><button disabled={actionBusy === article.id} onClick={() => void deleteArticle(article)}>بله، حذف مقاله</button><button onClick={() => setDeleteId('')}>انصراف</button></div>}</article>)}{!busy && !articles.length && <p className="admin-empty">هنوز مقاله‌ای ثبت نشده است.</p>}</section>
        <section className="admin-panel admin-editor">{draft ? <><div className="admin-section-title"><h2>{draft.id ? 'ویرایش مقاله' : 'مقاله تازه'}</h2><button className="admin-secondary" onClick={() => setPreview(!preview)}>{preview ? 'بازگشت به ویرایش' : 'پیش‌نمایش متن'}</button></div>{preview ? <><h1>{draft.title || 'عنوان مقاله'}</h1><p>{draft.excerpt}</p><MarkdownPreview body={draft.body}/><button className="admin-text-button" onClick={() => setPreview(false)}>ادامه ویرایش ←</button></> : <form onSubmit={e => { e.preventDefault(); void saveArticle(draft.published); }}><label>عنوان مقاله<input value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} required maxLength={160}/></label><div className="admin-fields-two"><label>نشانی انگلیسی<input value={draft.slug} onChange={e => setDraft({ ...draft, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} dir="ltr" required minLength={3} maxLength={100} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="website-design-guide"/><small>تغییر نشانی مقاله منتشرشده، لینک قبلی را تغییر می‌دهد.</small></label><label>دسته‌بندی<input value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value })} required maxLength={100}/></label></div><label>خلاصه برای فهرست بلاگ<textarea value={draft.excerpt} onChange={e => setDraft({ ...draft, excerpt: e.target.value })} required maxLength={400} rows={3}/></label><label>تصویر مقاله<input value={draft.coverImage} onChange={e => setDraft({ ...draft, coverImage: e.target.value })} required maxLength={500} dir="ltr"/><small>نشانی /images/... یا لینک HTTPS تصویر</small></label><label>متن کامل مقاله<textarea className="admin-body-input" value={draft.body} onChange={e => setDraft({ ...draft, body: e.target.value })} required maxLength={80000} rows={22}/><small>متن ساده یا Markdown: تیتر با ##، فهرست با - و لینک با [عنوان](نشانی). {draft.body.length.toLocaleString('fa-IR')} نویسه</small></label><fieldset className="admin-seo-fields"><legend>اطلاعات جست‌وجو و اشتراک‌گذاری</legend><label>عنوان سئو<input value={draft.metaTitle} onChange={e => setDraft({ ...draft, metaTitle: e.target.value })} maxLength={160}/><small>{draft.metaTitle.length}/160؛ عنوان کوتاه و مرتبط با محتوای صفحه بنویسید.</small></label><label>توضیح متا<textarea value={draft.metaDescription} onChange={e => setDraft({ ...draft, metaDescription: e.target.value })} maxLength={350} rows={3}/><small>{draft.metaDescription.length}/350؛ خلاصه‌ای دقیق برای تصمیم کاربر.</small></label><label>کلیدواژه‌های تحریریه<input value={draft.keywords} onChange={e => setDraft({ ...draft, keywords: e.target.value })} maxLength={1000}/><small>برای سازمان‌دهی محتوا؛ تکرار کلیدواژه به‌تنهایی رتبه ایجاد نمی‌کند.</small></label><div className="admin-serp-preview"><span dir="ltr">loxx.ir/blog/{draft.slug || 'article-slug'}</span><strong>{draft.metaTitle || draft.title || 'عنوان صفحه در جست‌وجو'}</strong><p>{draft.metaDescription || draft.excerpt || 'توضیح کوتاه مقاله'}</p></div></fieldset><div className="admin-editor-actions"><button type="submit" className="button" disabled={!!actionBusy}>{actionBusy === 'article' ? 'در حال ذخیره…' : draft.published ? 'ذخیره تغییرات' : 'ذخیره پیش‌نویس'}</button><button type="button" className="admin-secondary" disabled={!!actionBusy || !draft.title || !draft.slug || !draft.body || !draft.excerpt || !draft.category || !draft.coverImage} onClick={() => void saveArticle(!draft.published)}>{draft.published ? 'برداشتن از انتشار' : 'ذخیره و انتشار'}</button></div></form>}</> : <div className="admin-editor-empty"><span>✳</span><h2>یک ایده را به مقاله تبدیل کنید.</h2><p>مقاله‌ای را انتخاب کنید یا از یک پیش‌نویس تازه شروع کنید.</p><button className="button outline" onClick={() => setDraft(blankArticle())}>شروع نوشتن +</button></div>}</section></div>}
      {tab === 'users' && <section className="admin-panel"><div className="admin-section-title"><h2>کاربران ثبت‌شده</h2><span>{users.length.toLocaleString('fa-IR')} حساب اخیر</span></div><div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>نام</th><th>ایمیل</th><th>نقش</th><th>درخواست‌ها</th><th>تاریخ عضویت</th></tr></thead><tbody>{users.map(customer => <tr key={customer.id}><td>{customer.name}</td><td dir="ltr">{customer.email}</td><td>{customer.role === 'admin' ? 'مدیر' : 'مشتری'}</td><td>{(customer._count.leads + customer._count.quotes).toLocaleString('fa-IR')}</td><td>{date(customer.createdAt)}</td></tr>)}</tbody></table></div><p className="admin-note">رمز عبور و اطلاعات نشست کاربران در این پنل نمایش داده نمی‌شوند.</p></section>}
      <footer className="admin-footer"><span>LOXX · مدیریت محتوا و ارتباط با مشتری</span><a href="tel:+989375302400" dir="ltr">0937 530 2400</a></footer>
    </div></div>;
}
