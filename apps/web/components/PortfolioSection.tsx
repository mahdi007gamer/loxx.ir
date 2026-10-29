import { Icon } from './Icons';
import { WorkGallery } from './WorkGallery';
import '@/app/portfolio.css';

export function PortfolioSection() {
  return <section id="work" className="caseport-section chapter-section" aria-labelledby="caseport-heading">
    <div className="container">
      <div className="chapter-heading caseport-heading">
        <div><p className="eyebrow">SELECTED WORK / REAL CHALLENGES</p><h2 id="caseport-heading">نام تازه،<br/><span>پشتوانه‌ای از تجربه ساختن.</span></h2></div>
        <p>فروشگاه، محصول، برند شخصی و صنعت؛<br/>چند نمونه از کارهایی که تیم ما ساخته است.</p>
      </div>
      <WorkGallery/>
      <div className="caseport-trust">
        <span className="caseport-trust-icon"><Icon name="shield" size={26}/></span>
        <div><h3>LOXX تازه معرفی شده؛ تجربه تیم از قبل شکل گرفته است.</h3><p>با هویت مستقل LOXX مسیر تازه‌ای را شروع کرده‌ایم. اینجا نمونه‌های قابل نمایش تیم را می‌بینید؛ همه همکاری‌های قبلی قابل انتشار نیستند. برای ارزیابی ما، درباره مسئله پروژه‌تان صحبت کنیم و مسیر، محدوده و خروجی‌ها را شفاف روی میز بگذاریم.</p></div>
        <a className="text-link" href="/#contact">از پروژه شما شروع کنیم <Icon name="arrow" size={18}/></a>
      </div>
    </div>
  </section>;
}
