'use client';

import { useEffect, useState } from 'react';
import { services } from '@/lib/content';
import { Icon } from './Icons';

const serviceSlugs: Record<string, string> = {
  'company-website': 'طراحی وب‌سایت', 'website-design': 'طراحی وب‌سایت', 'landing-page': 'طراحی وب‌سایت',
  ecommerce: 'فروشگاه آنلاین', 'custom-crm': 'سیستم‌های سازمانی', 'mobile-app': 'اپلیکیشن موبایل', 'ui-ux': 'طراحی UI/UX',
};
type Brief = { service: string; projectType?: string; features: string[]; goal?: string; notes?: string; budget?: string; estimate?: string };

export function ProjectForm() {
  const [service, setService] = useState(services[0].title);
  const [mode, setMode] = useState('consultation');
  const [state, setState] = useState('idle');
  const [message, setMessage] = useState('');
  const [brief, setBrief] = useState('');
  const [budget, setBudget] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [prefilled, setPrefilled] = useState(false);
  const [features, setFeatures] = useState<string[]>([]);

  useEffect(() => {
    const incoming = new URLSearchParams(window.location.search).get('service');
    if (incoming) {
      const mapped = serviceSlugs[incoming] || incoming;
      if (services.some(item => item.title === mapped)) setService(mapped);
    }
    let live = true;
    fetch('/api/auth/me').then(async response => {
      if (!response.ok || !live) return;
      const user = await response.json();
      if (live) {
        if (typeof user.name === 'string') setName(current => current || user.name);
        if (typeof user.email === 'string') setEmail(current => current || user.email);
      }
    }).catch(() => {});
    function receiveBrief(event: Event) {
      const detail = (event as CustomEvent<Brief>).detail;
      if (!detail || !services.some(item => item.title === detail.service)) return;
      setService(detail.service);
      setMode('quote');
      setFeatures(detail.features.slice(0, 24));
      setBrief([
        `نوع پروژه: ${detail.projectType || detail.service}`,
        detail.goal ? `هدف اصلی: ${detail.goal}` : '',
        'محدوده و اولویت‌های پیشنهادی:',
        ...detail.features.map(item => `• ${item}`),
        detail.estimate || '',
        detail.notes ? `توضیحات: ${detail.notes}` : '',
      ].filter(Boolean).join('\n').slice(0, 2400));
      setBudget((detail.budget || '').slice(0, 90));
      setPrefilled(true); setState('idle'); setMessage('');
    }
    window.addEventListener('loxx:project-brief', receiveBrief);
    return () => { live = false; window.removeEventListener('loxx:project-brief', receiveBrief); };
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedPhone = phone.trim().replace(/[۰-۹٠-٩]/g, char => String('۰۱۲۳۴۵۶۷۸۹'.includes(char) ? '۰۱۲۳۴۵۶۷۸۹'.indexOf(char) : '٠١٢٣٤٥٦٧٨٩'.indexOf(char)));
    const common = { name: name.trim(), phone: normalizedPhone, email: email.trim(), service };
    const text = brief.trim().slice(0, mode === 'quote' ? 2400 : 2500);
    if (!common.name || !text || !/^\+?[0-9\s()-]{7,32}$/.test(normalizedPhone) || normalizedPhone.replace(/\D/g, '').length < 7) {
      setState('error'); setMessage('نام، شماره تماس معتبر و توضیح کوتاه پروژه را وارد کنید.'); return;
    }
    setState('sending'); setMessage('');
    const payload = mode === 'quote' ? { ...common, features, brief: text, budget: budget.trim() } : { ...common, message: text };
    try {
      const response = await fetch(`/api/${mode === 'quote' ? 'quotes' : 'leads'}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(15000),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof body.message === 'string' ? body.message : 'ثبت درخواست انجام نشد. دوباره تلاش کنید.');
      setState('success');
      setMessage(`درخواست شما ثبت شد${body.id ? `؛ کد پیگیری ${body.id}` : ''}. برای شناخت نیاز و بررسی محدوده با شما تماس می‌گیریم.`);
      setBrief(''); setBudget(''); setFeatures([]); setPrefilled(false);
      window.dispatchEvent(new CustomEvent('loxx:exploration', { detail: { id: 'requested' } }));
    } catch (error) {
      setState('error');
      setMessage(error instanceof Error && error.message && !/fetch|timeout|abort|network/i.test(error.message)
        ? error.message : 'ارتباط با سرور برقرار نشد. اطلاعات فرم حفظ شده؛ دوباره تلاش کنید یا با ۰۹۳۷۵۳۰۲۴۰۰ تماس بگیرید.');
    }
  }

  return <form className="project-form" onSubmit={submit}>
    <div className="form-tabs"><button type="button" aria-pressed={mode === 'consultation'} className={mode === 'consultation' ? 'active' : ''} onClick={() => { setMode('consultation'); setMessage(''); }}>مشاوره رایگان</button>
      <button type="button" aria-pressed={mode === 'quote'} className={mode === 'quote' ? 'active' : ''} onClick={() => { setMode('quote'); setMessage(''); }}>درخواست پیشنهاد پروژه</button></div>
    {prefilled && <p className="form-prefill" role="status"><Icon name="check" size={15}/>بریف و برآورد شما منتقل شد. همه جزئیات قابل ویرایش‌اند.</p>}
    <div className="form-row"><label>نام و نام خانوادگی<input name="name" autoComplete="name" placeholder="نام شما" required maxLength={90} value={name} onChange={event => setName(event.target.value)}/></label>
      <label>شماره تماس<input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="۰۹۱۲ …" required minLength={7} maxLength={32} value={phone} onChange={event => setPhone(event.target.value)}/></label></div>
    <div className="form-row"><label>ایمیل <span>(اختیاری)</span><input type="email" name="email" autoComplete="email" placeholder="you@example.com" maxLength={200} value={email} onChange={event => setEmail(event.target.value)}/></label>
      <label>خدمت موردنظر<select name="service" value={service} onChange={event => setService(event.target.value)}>{services.map(item => <option key={item.title}>{item.title}</option>)}</select></label></div>
    {mode === 'quote' && <label>بودجه تقریبی <span>(اختیاری · قابل تغییر)</span><input name="budget" placeholder="بازه بودجه موردنظر شما به تومان" maxLength={90} value={budget} onChange={event => setBudget(event.target.value)}/></label>}
    <label>از ایده‌تان بگویید<textarea name="message" rows={4} placeholder="چه مشکلی می‌خواهید حل شود و چه امکاناتی برای شروع ضروری است؟" value={brief} onChange={event => setBrief(event.target.value)} required maxLength={mode === 'quote' ? 2400 : 2500}/></label>
    <button type="submit" className="button" disabled={state === 'sending'}>{state === 'sending' ? 'در حال ثبت درخواست…' : mode === 'quote' ? 'ثبت بریف و درخواست بررسی' : 'درخواست تماس و مشاوره'}<Icon name="arrow" size={18}/></button>
    <p className={`form-status ${state}`} role="status" aria-live="polite">{message || 'ثبت فرم رایگان است و تعهد پرداخت یا رزرو زمان ایجاد نمی‌کند.'}</p>
    <p className="form-privacy">اطلاعات شما برای پاسخ به همین درخواست استفاده می‌شود. <a href="/privacy">حریم خصوصی</a><span> · </span><a href="tel:+989375302400">تماس مستقیم <span dir="ltr">0937 530 2400</span></a></p>
  </form>;
}
