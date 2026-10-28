'use client';

import { useState } from 'react';
import { Icon, type IconName } from './Icons';

const steps: { icon: IconName; title: string; english: string; heading: string; text: string; outputs: string[] }[] = [
  { icon: 'idea', title: 'شناخت و کشف', english: 'DISCOVER', heading: 'قبل از ساختن، درست می‌فهمیم.', text: 'از هدف کسب‌وکار، مخاطب و مسئله شروع می‌کنیم. اولویت‌ها را کنار هم می‌گذاریم تا بدانیم چه محصولی و برای چه کسی می‌سازیم.', outputs: ['گفت‌وگوی شناخت پروژه', 'تعریف نیازها و اولویت‌ها', 'تعیین محدوده و مسیر پروژه'] },
  { icon: 'design', title: 'استراتژی و طراحی', english: 'DESIGN', heading: 'ایده، شکل و مسیر پیدا می‌کند.', text: 'مسیر کاربر را طراحی می‌کنیم و آن را به وایرفریم، رابط بصری و نمونه قابل بررسی تبدیل می‌کنیم؛ تصمیم‌ها قبل از توسعه روشن می‌شوند.', outputs: ['معماری اطلاعات و مسیر کاربر', 'وایرفریم و طراحی رابط', 'نمونه تعاملی و بازبینی'] },
  { icon: 'code', title: 'توسعه و ساخت', english: 'DEVELOP', heading: 'جزئیات طراحی، به محصول تبدیل می‌شوند.', text: 'رابط و منطق محصول را مرحله‌به‌مرحله پیاده می‌کنیم. هر بخش در کنار عملکرد، از نظر نمایش در دستگاه‌های مختلف و تجربه استفاده بررسی می‌شود.', outputs: ['پیاده‌سازی رابط و قابلیت‌ها', 'اتصال سرویس‌ها و داده‌ها', 'آزمون عملکرد و نمایش'] },
  { icon: 'rocket', title: 'تحویل و همراهی', english: 'LAUNCH', heading: 'آماده ورود به دنیای واقعی.', text: 'نسخه نهایی را با معیارهای توافق‌شده مرور می‌کنیم. استقرار، آموزش استفاده و برنامه نگهداری بر اساس نیاز و محدوده همکاری مشخص می‌شود.', outputs: ['بازبینی و آماده‌سازی انتشار', 'تحویل و مستندسازی توافق‌شده', 'برنامه ادامه مسیر محصول'] },
];

export function Process() {
  const [active, setActive] = useState(0);
  const step = steps[active];
  return <div className="process-experience">
    <div className="journey-selectors" aria-label="مراحل همکاری">
      {steps.map((item, index) => <button type="button" key={item.title} aria-pressed={active === index}
        onClick={() => setActive(index)}><span className="journey-number">0{index + 1}</span><Icon name={item.icon} size={26} />
        <span><strong>{item.title}</strong><small lang="en">{item.english}</small></span><Icon name="arrow" size={17} /></button>)}
    </div>
    <div className="journey-stage">
      <div className="journey-visual"><img src="/images/journey-world.webp" alt="مسیر نورانی در میان کوه‌های تاریک، رو به دروازه بلورین X" width="1600" height="800" loading="lazy" />
        <div className="journey-coordinate" lang="en"><span className="signal-dot" />IDEA → DESIGN → PRODUCT</div>
        <span className="journey-visual-caption" lang="en">Every great product<br />starts with a clear path.</span>
      </div>
      <div className="journey-content" aria-live="polite"><div className="journey-active-label"><span>مرحله {active + 1} از ۴</span><span lang="en">{step.english}</span></div>
        <h3>{step.heading}</h3><p>{step.text}</p><ul>{step.outputs.map(output => <li key={output}><Icon name="check" size={16} />{output}</li>)}</ul>
        <div className="journey-controls"><a className="text-link" href="#contact">از قدم اول شروع کنیم <Icon name="arrow" size={17} /></a>
          <button type="button" aria-label={active === 3 ? 'بازگشت به مرحله اول' : 'نمایش مرحله بعد'} onClick={() => setActive((active + 1) % 4)}><Icon name="arrow" size={20} /></button></div>
      </div>
    </div>
  </div>;
}
