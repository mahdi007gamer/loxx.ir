import { Icon } from './Icons';
import '../app/team.css';

const disciplines = [
  { name: 'علی رضایی', role: 'تحلیل و راهبری محصول', focus: 'شناخت مسئله، تعیین اولویت‌ها و روشن‌کردن محدوده پروژه', image: 'team-role-01-v2.webp', tag: 'PRODUCT' },
  { name: 'مریم احمدی', role: 'طراحی رابط و تجربه کاربری', focus: 'مسیرهای قابل فهم و طراحی هماهنگ با نیاز مخاطب', image: 'team-role-02-v3.webp', tag: 'UI / UX' },
  { name: 'محمد کریمی', role: 'توسعه فرانت‌اند', focus: 'رابط سریع، واکنش‌گرا و قابل استفاده در دستگاه‌های مختلف', image: 'team-role-03-v2.webp', tag: 'FRONTEND' },
  { name: 'نرگس حسینی', role: 'توسعه بک‌اند', focus: 'منطق محصول، داده‌ها، دسترسی‌ها و اتصال سرویس‌ها', image: 'team-role-04-v2.webp', tag: 'BACKEND' },
  { name: 'رضا صادقی', role: 'کنترل کیفیت', focus: 'بررسی مسیرهای اصلی و رفع ایرادها پیش از تحویل', image: 'team-role-05-v2.webp', tag: 'QUALITY' },
  { name: 'امیر محمدی', role: 'محتوا و سئو', focus: 'محتوای مفید، ساختار روشن و آماده‌سازی برای جست‌وجو', image: 'team-role-06-v3.webp', tag: 'CONTENT / SEO' },
];

export function TeamSection() {
  return <section className="team-section chapter-section" id="team" aria-labelledby="team-heading">
    <div className="container">
      <div className="chapter-heading"><div><p className="eyebrow">EXPERIENCE. COLLABORATION. CRAFT.</p><h2 id="team-heading">تجربه در تصمیم‌ها.<br/><span>دقت در اجرا.</span></h2></div><p>از تعریف مسئله تا تحویل محصول؛<br/>نقش‌های مکمل، در یک مسیر مشترک.</p></div>
      <div className="team-manifesto"><span className="team-manifesto-icon"><Icon name="users" size={26}/></span><div><h3>نام LOXX تازه است؛ تجربه ساختن، از قبل همراه ماست.</h3><p>تجربه تیم در طراحی و توسعه وب‌سایت، فروشگاه و نرم‌افزار شکل گرفته است. بعضی همکاری‌های قبلی مجوز نمایش عمومی ندارند؛ برای شناخت ما، کارهای قابل بررسی، روش حل مسئله و محدوده تحویل هر پروژه را ببینید.</p></div><a className="text-link" href="#work">بررسی نمونه‌کارها <Icon name="arrow" size={17}/></a></div>
      <figure className="team-group"><img src="/images/team-workroom-v3.webp" alt="تصویرسازی با هوش مصنوعی از همکاری در یک فضای کاری؛ شش چهره ایرانی با سن‌ها و ظاهر متنوع" width="1600" height="900" loading="lazy"/><figcaption><span className="team-group-note">یک مسیر مشترک؛ از مسئله تا محصول.</span><span className="team-image-credit">شخصیت‌های فرضی · تصویرسازی با هوش مصنوعی</span></figcaption></figure>
      <div className="team-roles-heading"><h3>تخصص‌هایی که پروژه را جلو می‌برند</h3><p>ترکیب اجرایی متناسب با نیاز و محدوده هر پروژه مشخص می‌شود.</p></div>
      <div className="team-grid">{disciplines.map(discipline => <article className="team-person" key={discipline.tag}><div className="team-person-image"><img src={`/images/${discipline.image}`} width="480" height="480" alt={`تصویرسازی ${discipline.name} برای نقش ${discipline.role}`} loading="lazy"/><span lang="en">{discipline.tag}</span></div><div className="team-person-copy"><h3>{discipline.name}</h3><strong>{discipline.role}</strong><p>{discipline.focus}</p></div></article>)}</div>
      <div className="team-next-step"><p>پیش از شروع، مسئول هر مرحله، روش ارتباط و معیار تحویل را در پیشنهاد همکاری مشخص می‌کنیم.</p><a className="button outline small" href="#contact">درباره پروژه‌تان صحبت کنیم <Icon name="arrow" size={17}/></a></div>
    </div>
  </section>;
}
