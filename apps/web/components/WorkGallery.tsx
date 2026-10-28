'use client';

import { useRef, useState } from 'react';
import { projects } from '@/lib/content';
import { Icon } from './Icons';

const filters = ['همه پروژه‌ها', 'وب و محصول', 'موبایل', 'سیستم سازمانی'];
const categories = [1, 3, 2, 1];
const portfolioImages = ['devices.webp', 'dashboard.webp', 'mobile.webp', 'work-brand.webp'];
const deliverables = [
  ['هویت بصری دیجیتال', 'طراحی رابط وب', 'نسخه واکنش‌گرا'],
  ['معماری اطلاعات', 'نمایش داده‌ها', 'طراحی سیستم مدیریت'],
  ['مسیرهای کاربر', 'طراحی اپلیکیشن', 'کامپوننت‌های رابط'],
  ['تجربه یکپارچه', 'طراحی وب و موبایل', 'زبان بصری محصول'],
];

export function WorkGallery() {
  const [filter, setFilter] = useState(0);
  const [active, setActive] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const visible = projects.map((project, index) => ({ ...project, index }))
    .filter(project => filter === 0 || categories[project.index] === filter);

  return <>
    <div className="portfolio-toolbar">
      <div className="portfolio-filters" aria-label="دسته‌بندی نمونه‌کارها">
        {filters.map((label, index) => <button type="button" key={label} aria-pressed={filter === index}
          onClick={() => setFilter(index)}>{label}</button>)}
      </div>
      <span className="concept-note"><span /> کانسپت‌های طراحی استودیو</span>
    </div>
    <div className={`portfolio-grid ${filter ? 'is-filtered' : ''}`} aria-live="polite">
      {visible.map(project => <button type="button" className={`project-tile tile-${project.index}`} key={project.title}
        aria-label={`نمایش ${project.title}`} onClick={() => { setActive(project.index); dialog.current?.showModal(); }}>
        <img src={`/images/${portfolioImages[project.index]}`} alt={project.title}
          width="800" height="533" loading="lazy" />
        <div className="project-topline"><span>0{project.index + 1} / LOXX EXPLORATIONS</span><span>کانسپت طراحی</span></div>
        <div className="project-tile-caption"><div><span>{project.type}</span><h3>{project.title}</h3>
          <p>{deliverables[project.index].join(' / ')}</p></div><span className="project-open"><Icon name="arrow" size={23} /></span></div>
      </button>)}
    </div>
    <div className="portfolio-footnote"><span dir="ltr">DESIGNED TO MAKE A DIFFERENCE.</span>
      <a href="#contact">محصول بعدی می‌تواند ایده شما باشد <Icon name="arrow" size={18} /></a></div>
    <dialog ref={dialog} className="detail-dialog project-dialog portfolio-dialog" aria-label="جزئیات کانسپت"
      onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <button type="button" className="dialog-close" aria-label="بستن نمونه" onClick={() => dialog.current?.close()}><Icon name="close" /></button>
      <img src={`/images/${portfolioImages[active]}`} alt={projects[active].title} width="800" height="533" />
      <div dir="rtl"><p className="eyebrow">LOXX / DESIGN EXPLORATION</p><h2>{projects[active].title}</h2>
        <p>{projects[active].description}</p><ul className="project-deliverables">{deliverables[active].map(item => <li key={item}><Icon name="check" size={15} />{item}</li>)}</ul>
        <small>این نمونه، یک کانسپت برای نمایش رویکرد بصری استودیو است.</small>
        <a href="#contact" className="button" onClick={() => dialog.current?.close()}>درباره ایده شما صحبت کنیم <Icon name="arrow" size={18} /></a>
      </div>
    </dialog>
  </>;
}
