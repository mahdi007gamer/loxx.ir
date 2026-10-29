'use client';

import { useEffect, useState } from 'react';
import { estimateDate, formatMoney, projectPackages } from '@/lib/pricing';
import { Icon } from './Icons';

export function ProjectPlanner() {
  const [selected, setSelected] = useState(1);
  const [features, setFeatures] = useState<string[]>([]);
  const [goal, setGoal] = useState('دریافت درخواست و تماس');
  const [custom, setCustom] = useState('');
  const [step, setStep] = useState(1);
  const product = projectPackages[selected];
  useEffect(() => {
    const incoming = new URLSearchParams(window.location.search).get('package');
    const index = projectPackages.findIndex(item => item.id === incoming);
    if (index >= 0) setSelected(index);
  }, []);
  const selectedOptions = product.options.filter(option => features.includes(option.title));
  const low = product.low + selectedOptions.reduce((sum, option) => sum + option.low, 0);
  const high = product.high + selectedOptions.reduce((sum, option) => sum + option.high, 0);
  const budget = `${formatMoney(low)} تا ${formatMoney(high)} میلیون تومان`;
  function choose(index: number) { setSelected(index); setFeatures([]); }
  function toggle(item: string) { setFeatures(current => current.includes(item) ? current.filter(value => value !== item) : [...current, item]); }
  function sendBrief() {
    const included = [...product.included, ...features];
    const detail = { service: product.service, projectType: product.title, features: included, budget,
      goal, notes: custom, estimate: `بازه برآورد اولیه: ${budget}؛ پیش از تأیید محدوده، مبلغ قطعی نیست.` };
    window.dispatchEvent(new CustomEvent('loxx:project-brief', { detail }));
    window.dispatchEvent(new CustomEvent('loxx:exploration', { detail: { id: 'configured' } }));
    document.getElementById('contact')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    window.setTimeout(() => document.querySelector<HTMLInputElement>('#contact input[name="name"]')?.focus({ preventScroll: true }), 450);
  }
  return <div className="project-configurator">
    <div className="pricing-rail" aria-label="بازه بودجه اولیه پروژه‌ها">{projectPackages.map((item, index) => <button type="button" key={item.id} onClick={() => { choose(index); setStep(1); }} aria-pressed={selected === index}>
      <Icon name={item.icon} size={21}/><span>{item.title}</span><strong>{formatMoney(item.low)}–{formatMoney(item.high)}<small>میلیون تومان</small></strong>
    </button>)}</div>
    <div className="planner-shell">
      <div className="planner-options">
        <div className="configurator-steps" aria-label="مراحل تنظیم بریف">{['نوع محصول', 'هدف و امکانات', 'جمع‌بندی'].map((label, index) => <button type="button" key={label} aria-current={step === index + 1 ? 'step' : undefined} onClick={() => setStep(index + 1)}><span>{index + 1}</span>{label}</button>)}</div>
        <div className="configurator-step" hidden={step !== 1}>
          <div className="planner-label"><span>01</span><h3>برای کدام قدم کسب‌وکارتان می‌سازیم؟</h3></div>
          <div className="planner-services">{projectPackages.map((item, index) => <button type="button" key={item.id} aria-pressed={selected === index} onClick={() => choose(index)}><Icon name={item.icon} size={25}/><span>{item.title}</span><span className="selection-ring">{selected === index && <Icon name="check" size={12}/>}</span></button>)}</div>
          <div className="configurator-product"><h4>{product.title}</h4><p>{product.description}</p><span><Icon name="clock" size={15}/>{product.duration} پس از تأیید محدوده و آماده‌بودن ورودی‌ها</span></div>
        </div>
        <div className="configurator-step" hidden={step !== 2}>
          <div className="planner-label"><span>02</span><h3>اولویت شما چیست؟</h3></div>
          <label className="configurator-field">هدف اصلی محصول<select value={goal} onChange={event => setGoal(event.target.value)}><option>دریافت درخواست و تماس</option><option>فروش آنلاین و دریافت سفارش</option><option>بهبود فرایندهای داخلی تیم</option><option>آزمایش ایده و جذب کاربر</option><option>معرفی حرفه‌ای و اعتمادسازی</option></select></label>
          <p className="configurator-field-title">امکانات تکمیلی <span>انتخاب اختیاری · به برآورد اضافه می‌شود</span></p>
          <div className="planner-features">{product.options.map(item => <label key={item.title}><input type="checkbox" checked={features.includes(item.title)} onChange={() => toggle(item.title)}/><span className="feature-check"><Icon name="check" size={12}/></span><span>{item.title}<small>حدود {formatMoney(item.low)} تا {formatMoney(item.high)} میلیون</small></span></label>)}</div>
          <label className="configurator-field">قابلیت خاص یا توضیح بیشتر <span>(اختیاری)</span><textarea rows={3} maxLength={500} value={custom} onChange={event => setCustom(event.target.value)} placeholder="مثلاً مشتری بعد از ثبت درخواست، وضعیت سفارش را ببیند…"/></label>
        </div>
        <div className="configurator-step" hidden={step !== 3}>
          <div className="planner-label"><span>03</span><h3>یک بریف کوتاه و قابل گفت‌وگو آماده است.</h3></div>
          <div className="brief-preview"><span>محصول پیشنهادی</span><h4>{product.title}</h4><p>هدف: {goal}</p><ul>{[...product.included, ...features].map(item => <li key={item}><Icon name="check" size={14}/>{item}</li>)}</ul>{custom && <p className="brief-custom">{custom}</p>}</div>
          <p className="planner-hint"><Icon name="shield" size={17}/>ثبت بریف، درخواست بررسی و تماس است؛ پرداخت، رزرو زمان یا تعهد خرید ایجاد نمی‌کند.</p>
        </div>
        <div className="configurator-navigation"><button type="button" className="button outline small" disabled={step === 1} onClick={() => setStep(value => Math.max(1, value - 1))}>قدم قبل</button>{step < 3 ? <button type="button" className="button small" onClick={() => setStep(value => Math.min(3, value + 1))}>قدم بعد <Icon name="arrow" size={16}/></button> : <button type="button" className="button small" onClick={sendBrief}>انتقال بریف به فرم <Icon name="arrow" size={16}/></button>}</div>
      </div>
      <aside className="planner-summary" aria-label="برآورد زنده پروژه"><div className="summary-head"><p className="eyebrow">BUILD YOUR NEXT CHAPTER</p><span className="summary-glyph" aria-hidden="true">↗</span></div>
        <span className="summary-kicker">برآورد زنده · {estimateDate}</span><h3>{product.title}</h3><p>{product.description}</p>
        <div className="live-estimate" aria-live="polite" aria-atomic="true"><span>بودجه پیشنهادی برای شروع گفت‌وگو</span><strong>{formatMoney(low)}<i>تا</i>{formatMoney(high)}</strong><b>میلیون تومان</b><small>قیمت قطعی پس از شناخت و تأیید محدوده پروژه</small></div>
        <div className="summary-features"><span>در محدوده پایه</span><ul>{product.included.map(item => <li key={item}><Icon name="check" size={14}/>{item}</li>)}</ul>{features.length > 0 && <p className="configurator-extra">+ {features.length} قابلیت تکمیلی انتخاب‌شده</p>}</div>
        <button type="button" className="button" onClick={sendBrief}>بررسی رایگان همین پروژه <Icon name="arrow" size={19}/></button>
        <small>بازه‌ها پیشنهاد اولیه استودیو هستند. زیرساخت، دامنه، سرویس‌های ثالث و تولید محتوای خارج از محدوده جداگانه بررسی می‌شوند.</small>
      </aside>
    </div>
    <div className="pricing-footnote"><span><Icon name="idea" size={17}/>بودجه متفاوتی دارید؟ امکانات ضروری را برای یک فاز کوچک‌تر اولویت‌بندی می‌کنیم.</span><a href="tel:+989375302400">گفت‌وگوی مستقیم <span dir="ltr">0937 530 2400</span><Icon name="arrow" size={16}/></a></div>
  </div>;
}
