'use client';
import { useRef, useState } from 'react';
import { services } from '@/lib/content';
import { Icon } from './Icons';
export function Services() {
  const [selected,setSelected]=useState<number|null>(null); const dialog=useRef<HTMLDialogElement>(null);
  return <><div className="service-grid" id="services-list">{services.map((service,i)=><button className="service-card" key={service.title} onClick={()=>{setSelected(i);dialog.current?.showModal()}}><div className="service-top"><Icon name={service.icon} size={32}/><span className="round-arrow"><Icon name="arrow" size={17}/></span></div><h3>{service.title}</h3><p dir={i===1?'ltr':undefined}>{service.detail}</p></button>)}</div><dialog ref={dialog} className="detail-dialog" aria-label="جزئیات خدمات" onClick={e=>{if(e.target===e.currentTarget)dialog.current?.close()}}>{selected!==null&&<div dir="rtl"><button className="dialog-close" aria-label="بستن جزئیات" onClick={()=>dialog.current?.close()}><Icon name="close"/></button><Icon name={services[selected].icon} size={42}/><p className="eyebrow">LOXX SERVICES</p><h2>{services[selected].title}</h2><p>{services[selected].description}</p><a className="button" href={`/?service=${encodeURIComponent(services[selected].title)}#contact`} onClick={()=>dialog.current?.close()}>درخواست مشاوره <Icon name="arrow" size={18}/></a></div>}</dialog></>
}
