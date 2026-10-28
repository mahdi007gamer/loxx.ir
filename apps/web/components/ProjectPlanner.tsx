'use client';

import { useState } from 'react';
import { services } from '@/lib/content';
import { Icon } from './Icons';

const priorities = [
  ['طراحی رابط اختصاصی', 'نمایش در موبایل', 'مدیریت محتوا', 'سئو فنی', 'چندزبانه بودن', 'اتصال به سرویس‌ها'],
  ['طراحی تجربه کاربری', 'نسخه Android', 'نسخه iOS', 'حساب کاربری', 'اعلان‌ها', 'اتصال به API'],
  ['تحلیل فرایندها', 'نقش‌ها و دسترسی‌ها', 'گزارش و داشبورد', 'مدیریت مشتریان', 'ورود داده‌ها', 'یکپارچه‌سازی'],
  ['شناخت کاربران', 'طراحی مسیرها', 'وایرفریم', 'طراحی رابط', 'نمونه تعاملی', 'سیستم طراحی'],
  ['طراحی فروشگاه', 'دسته‌بندی و جست‌وجو', 'سبد خرید', 'پرداخت آنلاین', 'مدیریت سفارش', 'مدیریت موجودی'],
  ['تعریف نسخه اولیه', 'طراحی محصول', 'توسعه اختصاصی', 'پنل مدیریت', 'اتصال سرویس‌ها', 'توسعه مرحله‌ای'],
];

export function ProjectPlanner() {
  const [selected, setSelected] = useState(0);
  const [features, setFeatures] = useState<string[]>(priorities[0].slice(0, 2));
  const service = services[selected];
  function choose(index: number) { setSelected(index); setFeatures(priorities[index].slice(0, 2)); }
  function toggle(item: string) { setFeatures(current => current.includes(item) ? current.filter(value => value !== item) : [...current, item]); }
  function sendBrief() {
    window.dispatchEvent(new CustomEvent('loxx:project-brief', { detail: { service: service.title, features } }));
    document.getElementById('contact')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  return <div className="planner-shell">
    <div className="planner-options"><div className="planner-label"><span>01</span><h3>چه محصولی در ذهن دارید؟</h3></div>
      <div className="planner-services" aria-label="نوع پروژه">{services.map((item, index) => <button type="button" key={item.title} aria-pressed={selected === index}
        onClick={() => choose(index)}><Icon name={item.icon} size={25} /><span>{item.title}</span><span className="selection-ring">{selected === index && <Icon name="check" size={12} />}</span></button>)}</div>
      <div className="planner-label"><span>02</span><h3>اولویت‌های محصولتان را انتخاب کنید.</h3></div>
      <div className="planner-features">{priorities[selected].map(item => <label key={item}><input type="checkbox" checked={features.includes(item)} onChange={() => toggle(item)} />
        <span className="feature-check"><Icon name="check" size={12} /></span>{item}</label>)}</div>
      <p className="planner-hint"><Icon name="idea" size={17} />هنوز مطمئن نیستید؟ انتخاب اولیه کافی است؛ در گفت‌وگو دقیق‌ترش می‌کنیم.</p>
    </div>
    <aside className="planner-summary" aria-label="خلاصه پروژه"><div className="summary-head"><p className="eyebrow">YOUR NEXT DIGITAL PRODUCT</p><span className="summary-glyph" aria-hidden="true">↗</span></div>
      <span className="summary-kicker">مسیر پیشنهادی شما</span><h3>{service.title}</h3><p>{service.description}</p>
      <div className="summary-features" aria-live="polite"><span>{features.length} اولویت انتخاب شده</span><ul>{features.length ? features.map(item => <li key={item}><Icon name="check" size={14} />{item}</li>) : <li>اولویت‌ها را در جلسه شناخت مشخص می‌کنیم.</li>}</ul></div>
      <div className="summary-budget"><span>هزینه و زمان‌بندی</span><strong>برآورد اختصاصی</strong><p>پس از بررسی دامنه کار و امکانات موردنیاز شما.</p></div>
      <button type="button" className="button" onClick={sendBrief}>دریافت پیشنهاد پروژه <Icon name="arrow" size={19} /></button>
      <small><Icon name="shield" size={14} />این انتخاب‌ها به فرم درخواست شما منتقل می‌شوند.</small>
    </aside>
  </div>;
}
