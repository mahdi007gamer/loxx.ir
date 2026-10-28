import { Header } from '@/components/Header';
import { Icon, type IconName } from '@/components/Icons';
import { Logo } from '@/components/Logo';
import { Services } from '@/components/Services';
import { WorkGallery } from '@/components/WorkGallery';
import { ProjectForm } from '@/components/ProjectForm';
import { Process } from '@/components/Process';
import { ProjectPlanner } from '@/components/ProjectPlanner';
import { FAQ } from '@/components/FAQ';
import { articles } from '@/lib/content';
export default function Home(){return <><div className="hero-shell" id="home"><picture className="hero-art"><source media="(max-width: 700px)" srcSet="/images/hero-mobile.webp"/><img src="/images/hero-desktop.webp" alt="نشان بلورین و درخشان X در میان کوه‌های تاریک و آب فیروزه‌ای" width="1672" height="941" fetchPriority="high"/></picture><Header/><main id="main"><section className="container hero" aria-labelledby="hero-title"><div className="hero-copy"><p className="studio-label" lang="en"><span className="signal-dot"/>Digital <span>Product Studio</span></p><h1 id="hero-title">طراحی و توسعه<br/><span>محصولات دیجیتال</span></h1><p className="hero-description">از ایده تا محصول، کنار شما هستیم. با ترکیب خلاقیت، تکنولوژی و تجربه<br className="desktop-break"/> به کسب‌وکارها کمک می‌کنیم ایده‌های خود را به محصولات دیجیتال<br className="desktop-break"/> موفق تبدیل کنند.</p><div className="hero-actions"><a className="button" href="#contact">مشاوره رایگان <Icon name="arrow" size={19}/></a><a className="button outline" href="#work">دیدن نمونه‌کارها <Icon name="play" size={17}/></a></div></div><p className="hero-handwriting" lang="en">Ideas<br/><span>to Digital</span><br/>Products</p><div className="mobile-capabilities" aria-label="زمینه‌های فعالیت">{[{icon:'monitor',text:'وب‌سایت'},{icon:'phone',text:'موبایل'},{icon:'settings',text:'سیستم‌های سازمانی'},{icon:'layers',text:'راهکار اختصاصی'}].map(c=><a href="#services" key={c.text}><Icon name={c.icon as IconName} size={26}/><span>{c.text}</span></a>)}</div><div className="hero-bottom"><div className="studio-values">{[{icon:'design',big:'خلاقیت',label:'در طراحی محصول'},{icon:'shield',big:'کیفیت',label:'در هر جزئیات'},{icon:'code',big:'تکنولوژی',label:'در خدمت ایده‌ها'},{icon:'heart',big:'همراهی',label:'از ایده تا محصول'}].map(s=><div className="value" key={s.big}><span className="value-icon"><Icon name={s.icon as IconName} size={23}/></span><div><strong>{s.big}</strong><span>{s.label}</span></div></div>)}</div><div className="hero-specialties" lang="en"><span className="line-mark"/><div>Web <b>|</b> Mobile <b>|</b> CRM <b>|</b> ERP<br/><span>Custom Solutions</span></div></div></div></section></main></div><section className="services-section" id="services"><div className="container"><div className="section-heading"><div><p className="eyebrow">OUR SERVICES</p><h2>خدمات ما</h2></div><p className="section-description">ارائه راهکارهای جامع و حرفه‌ای برای کسب‌وکارها<br/>از طراحی رابط کاربری تا توسعه سیستم‌های پیچیده.</p><a className="button outline small" href="#services-list">همه خدمات <Icon name="arrow" size={16}/></a></div><Services/></div></section>
<section className="portfolio-section chapter-section" id="work">
  <div className="container">
    <div className="chapter-heading"><div><p className="eyebrow">03 / SELECTED EXPLORATIONS</p><h2>ایده‌هایی که <span>شکل محصول گرفتند.</span></h2></div><p>از یک هویت بصری تا یک تجربه یکپارچه؛<br/>نگاهی نزدیک‌تر به دنیای طراحی LOXX.</p></div>
    <WorkGallery/>
  </div>
</section>
<section className="collaboration-section chapter-section" id="process">
  <div className="container">
    <div className="chapter-heading"><div><p className="eyebrow">04 / THE WAY WE CREATE</p><h2>یک مسیر روشن،<br/><span>از اولین ایده تا محصول.</span></h2></div><p>هر مرحله، یک هدف مشخص و یک خروجی قابل بررسی.<br/>مرحله‌ها را انتخاب کنید و مسیر همکاری را ببینید.</p></div>
    <Process/>
  </div>
</section>
<div className="discipline-strip" aria-label="تخصص‌های استودیو"><div className="container" lang="en"><span>DESIGN</span><i>✳</i><span>DEVELOPMENT</span><i>✳</i><span>DIGITAL PRODUCTS</span><i>✳</i><span>LOXX STUDIO</span></div></div>
<section className="studio-section chapter-section" id="about">
  <div className="container studio-layout">
    <div className="studio-image"><img src="/images/studio-world.webp" alt="تصویر مفهومی دنیای طراحی LOXX؛ نشان X بلورین در فضایی از سنگ، شیشه و نور فیروزه‌ای" width="1400" height="933" loading="lazy"/>
      <span className="studio-image-tag" lang="en"><span className="signal-dot"/>THE LOXX UNIVERSE</span>
      <div className="studio-image-caption"><span lang="en">A PLACE FOR BOLD IDEAS.</span><span>تلاقی خلاقیت و تکنولوژی</span></div>
    </div>
    <div className="studio-story"><p className="eyebrow">05 / MORE THAN A BEAUTIFUL SCREEN</p><h2>ایده‌تان را می‌فهمیم.<br/><span>آینده‌اش را می‌سازیم.</span></h2>
      <p className="studio-intro">LOXX استودیوی طراحی و توسعه محصولات دیجیتال است؛ جایی برای تبدیل مسئله‌های واقعی به تجربه‌هایی روشن، کاربردی و ماندگار.</p>
      <div className="studio-principles">
        <div><span><Icon name="idea" size={23}/></span><div><h3>اول مسئله، بعد راه‌حل</h3><p>هر تصمیم طراحی با شناخت نیاز کاربر و هدف کسب‌وکار شروع می‌شود.</p></div></div>
        <div><span><Icon name="design" size={23}/></span><div><h3>جزئیاتی که تفاوت می‌سازند</h3><p>از هویت بصری تا کوچک‌ترین تعامل، محصول باید یک زبان مشترک داشته باشد.</p></div></div>
        <div><span><Icon name="heart" size={23}/></span><div><h3>همراه، در تمام مسیر</h3><p>گفت‌وگوی مستقیم، تصمیم‌های شفاف و ساختن مرحله‌به‌مرحله در کنار شما.</p></div></div>
      </div>
      <a href="#contact" className="text-link">ایده‌تان را با ما در میان بگذارید <Icon name="arrow" size={18}/></a>
    </div>
  </div>
</section>
<section className="project-planning chapter-section" id="pricing">
  <div className="container"><div className="chapter-heading"><div><p className="eyebrow">06 / BUILT AROUND YOUR AMBITION</p><h2>محصول شما،<br/><span>مسیر و پیشنهاد مخصوص خودش را دارد.</span></h2></div><p>نوع پروژه و اولویت‌ها را انتخاب کنید.<br/>از همین‌جا، گفت‌وگوی دقیق‌تری را شروع می‌کنیم.</p></div><ProjectPlanner/></div>
</section>
<section className="faq-section chapter-section" id="faq">
  <div className="container faq-layout"><div className="faq-intro"><p className="eyebrow">07 / GOOD QUESTIONS. CLEAR ANSWERS.</p><h2>قبل از شروع،<br/><span>شفاف‌تر ببینیم.</span></h2><p>چند پاسخ برای سؤال‌هایی که معمولاً<br/>در ابتدای مسیر مطرح می‌شوند.</p><div className="faq-orbit" aria-hidden="true"><span>?</span><i/><i/></div><a className="text-link" href="#contact">سؤال دیگری دارید؟ گفت‌وگو کنیم <Icon name="arrow" size={17}/></a></div><FAQ/></div>
</section>
<section className="journal-section chapter-section" id="journal">
  <div className="container"><div className="chapter-heading"><div><p className="eyebrow">08 / NOTES FROM THE STUDIO</p><h2>کمی فکر، <span>قبل از قدم بعدی.</span></h2></div><a href="/blog" className="button outline small">همه یادداشت‌ها <Icon name="arrow" size={16}/></a></div>
    <div className="journal-cards">{articles.map((article,index)=><a href={`/blog/${article.slug}`} className="journal-card" key={article.slug}>
      <div className="journal-image"><img src={`/images/${['devices.webp','work-brand.webp','dashboard.webp'][index]}`} width="800" height="533" loading="lazy" alt=""/><span lang="en">{['PROJECT GUIDE','DESIGN THINKING','BUSINESS SYSTEMS'][index]}</span></div>
      <div className="journal-card-body"><span className="journal-category">{['شروع پروژه','تجربه کاربری','توسعه کسب‌وکار'][index]}</span><h3>{article.title}</h3><p>{article.excerpt}</p><span className="journal-read">خواندن یادداشت <Icon name="arrow" size={18}/></span></div>
    </a>)}</div>
  </div>
</section>
<section className="contact-world" id="contact"><img className="contact-landscape" src="/images/journey-world.webp" width="1600" height="800" alt="" loading="lazy"/>
  <div className="container contact-layout"><div className="contact-story"><p className="eyebrow">09 / YOUR NEXT CHAPTER STARTS HERE</p><span className="contact-hello" lang="en">Let's make<br/>something <em>matter.</em></span><h2>برای ایده بعدی شما،<br/><span>یک مسیر تازه داریم.</span></h2><p>از چیزی که می‌خواهید بسازید بگویید.<br/>اولین قدم، یک گفت‌وگوی خوب است.</p>
    <div className="contact-points"><span><Icon name="chat" size={18}/>شناخت نیاز شما</span><span><Icon name="layers" size={18}/>تعریف مسیر پروژه</span><span><Icon name="shield" size={18}/>پیشنهاد شفاف</span></div>
    <div className="contact-world-mark" lang="en"><span className="signal-dot"/>FROM YOUR IDEA. TO THE NEXT BIG THING.</div>
  </div><div className="contact-form-wrap"><div className="contact-form-heading"><span>شروع یک همکاری</span><span dir="ltr">LOXX / NEW PROJECT ↗</span></div><ProjectForm/></div></div>
</section>
<footer className="loxx-footer"><div className="container"><div className="footer-top"><div><Logo/><p>ایده‌ها را به محصولات دیجیتال<br/>ماندگار تبدیل می‌کنیم.</p></div><div className="footer-links"><span>در استودیو</span><a href="#services">خدمات</a><a href="#work">نمونه‌کارها</a><a href="#about">درباره LOXX</a><a href="/blog">یادداشت‌ها</a></div><div className="footer-links"><span>قدم بعدی شما</span><a href="#process">مسیر همکاری</a><a href="#pricing">درخواست پیشنهاد</a><a href="#faq">سؤال‌های متداول</a><a href="/login">حساب کاربری</a></div><div className="footer-invitation"><span lang="en">HAVE SOMETHING IN MIND?</span><p>از ایده‌تان شروع کنیم.</p><a href="#contact" aria-label="شروع گفت‌وگو درباره پروژه"><Icon name="arrow" size={29}/></a></div></div>
<div className="footer-wordmark" aria-hidden="true" lang="en">LO<span>XX</span><i>Digital<br/>Product Studio</i></div><div className="footer-bottom"><small dir="ltr">© {new Date().getFullYear()} LOXX. All rights reserved.</small><span>همیشه یک قدم جلوتر.</span><a href="#home">بازگشت به بالا <Icon name="arrow" size={14}/></a></div></div></footer></>}
