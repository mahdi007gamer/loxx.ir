'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Icon } from './Icons';
import { Logo } from './Logo';
import '../app/brand.css';

const links = [['خانه','/#home'],['خدمات','/#services'],['نمونه‌کارها','/#work'],['برآورد هزینه','/#pricing'],['تیم و استودیو','/#about'],['مجله','/blog']];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 70);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) { setOpen(false); toggle.current?.focus(); }
      if (event.key === 'Tab' && open && ref.current) {
        const focusable = Array.from(ref.current.querySelectorAll<HTMLElement>('a,button')).filter(node => node.offsetParent !== null);
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    const outside = (event: MouseEvent) => { if (!ref.current?.contains(event.target as Node)) setOpen(false); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', outside);
    return () => { window.removeEventListener('scroll', onScroll); document.removeEventListener('keydown', onKey); document.removeEventListener('click', outside); };
  }, [open]);
  useEffect(() => { setOpen(false); }, [pathname]);
  const active = (url: string) => pathname.startsWith('/blog') ? url === '/blog' : pathname === '/' && url === '/#home';
  return <>
    <div className="header-slot"><header ref={ref} className={`site-header branded-header${scrolled ? ' is-scrolled' : ''}`}><div className="container header-inner">
      <Logo/>
      <nav className="desktop-nav" aria-label="ناوبری اصلی" dir="rtl">{links.map(([label,url]) => <a className={active(url) ? 'active' : ''} href={url} key={url}>{label}</a>)}</nav>
      <div className="header-contact"><a href="tel:+989375302400" aria-label="تماس با لوکس، ۰۹۳۷۵۳۰۲۴۰۰"><span className="signal-dot"/><span dir="ltr">0937 530 2400</span></a><small>ایده‌ات را با ما در میان بگذار</small></div>
      <a className="button header-order" href="/#pricing">شروع پروژه <Icon name="arrow" size={17}/></a>
      <a className="header-account" href="/login" aria-label="ورود به حساب کاربری"><Icon name="users" size={20}/></a>
      <button ref={toggle} className="brand-menu-toggle" aria-label={open ? 'بستن فهرست سایت' : 'باز کردن فهرست سایت'} aria-expanded={open} aria-controls="site-menu" onClick={() => setOpen(!open)}><Icon name={open ? 'close' : 'menu'} size={24}/></button>
      {open && <nav id="site-menu" className="mobile-menu brand-mobile-menu" dir="rtl" aria-label="فهرست کامل سایت">{links.map(([label,url]) => <a href={url} key={url} onClick={() => setOpen(false)}>{label}<Icon name="arrow" size={15}/></a>)}<a href="/#team" onClick={() => setOpen(false)}>نقش‌های تیم <Icon name="users" size={15}/></a><a href="/login">حساب کاربری <Icon name="users" size={15}/></a><a href="tel:+989375302400" className="menu-phone"><span dir="ltr">0937 530 2400</span><span>تماس مستقیم</span></a></nav>}
    </div></header></div>
    <nav className="mobile-dock" aria-label="دسترسی سریع موبایل"><a href="/#home"><Icon name="grid" size={19}/><span>استودیو</span></a><a href="/#work"><Icon name="layers" size={19}/><span>نمونه‌کارها</span></a><a href="/#pricing" className="dock-primary"><Icon name="rocket" size={19}/><span>برآورد پروژه</span></a><a href="tel:+989375302400"><Icon name="phone" size={19}/><span>تماس</span></a></nav>
  </>;
}
