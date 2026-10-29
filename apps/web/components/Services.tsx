'use client';
import { useRef, useState } from 'react';
import { services } from '@/lib/content';
import { Icon } from './Icons';
const pages = ['company-website', 'mobile-app', 'custom-crm', 'ui-ux', 'ecommerce', 'landing-page'];
export function Services() {
  const [selected, setSelected] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  return <><div className="service-grid" id="services-list">{services.map((service, i) => <button type="button" className="service-card" key={service.title} onClick={() => { setSelected(i); dialog.current?.showModal(); }}><div className="service-top"><Icon name={service.icon} size={32}/><span className="round-arrow"><Icon name="arrow" size={17}/></span></div><h3>{service.title}</h3><p dir={i === 1 ? 'ltr' : undefined}>{service.detail}</p></button>)}</div>
    <dialog ref={dialog} className="detail-dialog" aria-labelledby="loxx-service-title" onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>{selected !== null && <div dir="rtl"><button type="button" className="dialog-close" aria-label="بستن جزئیات" onClick={() => dialog.current?.close()}><Icon name="close"/></button><Icon name={services[selected].icon} size={42}/><p className="eyebrow">LOXX SERVICES / DEFINE THE NEXT STEP</p><h2 id="loxx-service-title">{services[selected].title}</h2><p>{services[selected].description}</p><div className="service-modal-points"><span><Icon name="check" size={15}/>محدوده روشن</span><span><Icon name="check" size={15}/>طراحی متناسب با کاربر</span><span><Icon name="check" size={15}/>تحویل مرحله‌ای طبق توافق</span></div><div className="service-modal-actions"><a className="button" href={`/?service=${encodeURIComponent(services[selected].title)}#contact`} onClick={() => dialog.current?.close()}>ثبت بریف رایگان <Icon name="arrow" size={18}/></a><a className="text-link" href={`/services/${pages[selected]}`}>جزئیات خدمت و مسیر اجرا <Icon name="arrow" size={16}/></a></div></div>}</dialog>
  </>;
}
