import { Icon } from './Icons';
import '../app/team.css';

const personas = [
  { name: 'آرمان نادری', role: 'طراحی محصول', focus: 'از مسئله کسب‌وکار تا مسیر روشن محصول', image: 'team-01.webp', tag: 'PRODUCT' },
  { name: 'سارا مهران', role: 'طراحی رابط و تجربه کاربری', focus: 'تجربه‌ای قابل فهم؛ جزئیاتی هماهنگ با برند', image: 'team-02.webp', tag: 'UI / UX' },
  { name: 'کیان راد', role: 'توسعه فرانت‌اند', focus: 'رابط سریع، واکنش‌گرا و در دسترس', image: 'team-03.webp', tag: 'FRONTEND' },
  { name: 'نازنین پارسا', role: 'توسعه بک‌اند', focus: 'منطق محصول، داده و اتصال سرویس‌ها', image: 'team-04.webp', tag: 'BACKEND' },
  { name: 'امیرسام شریفی', role: 'کنترل کیفیت', focus: 'آزمودن مسیرهای واقعی قبل از تحویل', image: 'team-05.webp', tag: 'QUALITY' },
  { name: 'رها نیک‌پی', role: 'محتوا و سئو', focus: 'پاسخ درست به سؤال‌های مخاطب', image: 'team-06.webp', tag: 'CONTENT / SEO' },
];

export function TeamSection() {
  return <section className="team-section chapter-section" id="team" aria-labelledby="team-heading">
    <div className="container">
      <div className="chapter-heading"><div><p className="eyebrow">ONE PRODUCT. DIFFERENT PERSPECTIVES.</p><h2 id="team-heading">پشت یک محصول خوب،<br/><span>چند نگاه متفاوت کنار هم است.</span></h2></div><p>محصول، طراحی، توسعه، کیفیت و محتوا؛<br/>نقش‌هایی که مسیر ساخت را کامل می‌کنند.</p></div>
      <div className="team-manifesto"><span className="team-manifesto-icon"><Icon name="users" size={26}/></span><div><h3>برند تازه؛ تکیه بر تجربه تیم.</h3><p>LOXX نام تازه مسیر مستقل ماست. تجربه اعضای تیم از قبل شکل گرفته؛ اما تمام کارهای قبلی قابل انتشار نیستند. تنها نمونه‌کارهای مجاز را نشان می‌دهیم و به‌جای ادعای مبهم، درباره مسئله، محدوده کار و خروجی قابل بررسی حرف می‌زنیم.</p></div><a className="text-link" href="#work">کارها را بررسی کنید <Icon name="arrow" size={17}/></a></div>
      <figure className="team-group"><img src="/images/team-studio.webp" alt="تصویر مفهومی تولیدشده با هوش مصنوعی از شش شخصیت ایرانی در یک استودیوی طراحی؛ عکس اعضای واقعی LOXX نیست" width="1439" height="810" loading="lazy"/><div className="team-group-overlay" aria-hidden="true"><span lang="en">BUILT TOGETHER.</span><strong>از یک گفت‌وگو،<br/>تا یک محصول مشترک.</strong></div><figcaption><span className="team-concept-label">تصویر مفهومی با هوش مصنوعی</span> این تصویر و شخصیت‌های زیر برای نمایش نقش‌ها طراحی شده‌اند؛ نام و چهره اعضای واقعی LOXX نیستند.</figcaption></figure>
      <div className="team-grid">{personas.map(person => <article className="team-person" key={person.name}><div className="team-person-image"><img src={`/images/${person.image}`} width="480" height="480" alt={`پرتره مفهومی ${person.name}، شخصیت ساختگی برای معرفی نقش ${person.role}`} loading="lazy"/><span lang="en">{person.tag}</span></div><div className="team-person-copy"><small>شخصیت مفهومی</small><h3>{person.name}</h3><strong>{person.role}</strong><p>{person.focus}</p></div></article>)}</div>
      <div className="team-next-step"><p>برای شروع همکاری، درباره تیم اجرایی، مسئول هر مرحله و خروجی تحویل با هم به توافق می‌رسیم.</p><a className="button outline small" href="#contact">درباره ترکیب تیم پروژه بپرسید <Icon name="arrow" size={17}/></a></div>
    </div>
  </section>;
}
