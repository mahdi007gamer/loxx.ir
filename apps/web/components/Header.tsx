'use client';
import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icons';
import { Logo } from './Logo';
const links = [['خانه','/#home'],['خدمات','/#services'],['نمونه‌کارها','/#work'],['قیمت‌گذاری','/#pricing'],['درباره ما','/#about'],['وبلاگ','/blog'],['تماس با ما','/#contact']];
export function Header() {
  const [open,setOpen] = useState(false); const ref = useRef<HTMLElement>(null);
  useEffect(()=>{ const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape')setOpen(false)}; const outside=(e:MouseEvent)=>{if(!ref.current?.contains(e.target as Node))setOpen(false)}; document.addEventListener('keydown',onKey); document.addEventListener('click',outside); return()=>{document.removeEventListener('keydown',onKey);document.removeEventListener('click',outside)}},[]);
  return <header className="site-header" ref={ref}><div className="container header-inner"><Logo/><nav className="desktop-nav" aria-label="ناوبری اصلی" dir="rtl">{links.map(([label,url],i)=><a className={i===0?'active':''} href={url} key={url}>{label}</a>)}</nav><a className="button header-order" href="/#contact">ثبت سفارش <Icon name="arrow" size={18}/></a><div className="header-tools"><span className="locale" title="زبان فارسی" lang="en">FA <Icon name="globe" size={11}/></span><button className="menu-toggle" aria-label={open?'بستن منو':'باز کردن منو'} aria-expanded={open} aria-controls="site-menu" onClick={()=>setOpen(!open)}><Icon name={open?'close':'grid'} size={23}/></button></div><button className="mobile-toggle" aria-label={open?'بستن منو':'باز کردن منو'} aria-expanded={open} aria-controls="site-menu" onClick={()=>setOpen(!open)}><Icon name={open?'close':'menu'} size={27}/></button>{open&&<nav id="site-menu" className="mobile-menu" dir="rtl" aria-label="فهرست سایت">{links.map(([label,url])=><a href={url} key={url} onClick={()=>setOpen(false)}>{label}</a>)}<a href="/login">ورود به حساب کاربری <Icon name="arrow" size={16}/></a></nav>}</div></header>
}
