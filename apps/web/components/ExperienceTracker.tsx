'use client';

import { useEffect, useState } from 'react';
import { Icon } from './Icons';

const storageKey = 'loxx-exploration-v1';
const missions = [
  { id: 'work', title: 'دیدن تجربه‌های واقعی', href: '#work' },
  { id: 'process', title: 'شناخت مسیر همکاری', href: '#process' },
  { id: 'configured', title: 'ساخت بریف اولیه', href: '#pricing' },
  { id: 'requested', title: 'ثبت درخواست گفت‌وگو', href: '#contact' },
];

export function ExperienceTracker() {
  const [completed, setCompleted] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (Array.isArray(saved)) setCompleted(saved.filter(item => typeof item === 'string' && missions.some(m => m.id === item)));
    } catch { /* Private browsing can disable local storage. The guide remains usable. */ }
    const complete = (id: string) => setCompleted(current => {
      if (current.includes(id)) return current;
      const next = [...current, id];
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* Optional local state. */ }
      return next;
    });
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) complete(entry.target.id);
    }, { threshold: .08 });
    for (const id of ['work', 'process']) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    }
    const onProgress = (event: Event) => {
      const id = (event as CustomEvent<{ id: string }>).detail?.id;
      if (missions.some(m => m.id === id)) complete(id);
    };
    window.addEventListener('loxx:exploration', onProgress);
    return () => { observer.disconnect(); window.removeEventListener('loxx:exploration', onProgress); };
  }, []);
  function reset() {
    setCompleted([]);
    try { localStorage.removeItem(storageKey); } catch { /* Optional local state. */ }
  }
  const count = completed.length;
  return <aside className={`exploration-widget ${open ? 'is-open' : ''}`} aria-label="راهنمای آشنایی با LOXX">
    <button className="exploration-toggle" type="button" aria-expanded={open} aria-controls="loxx-exploration-panel" onClick={() => setOpen(value => !value)}>
      <span className="exploration-icon"><Icon name={count === 4 ? 'check' : 'rocket'} size={20}/></span>
      <span><strong>{count === 4 ? 'بریف شما در مسیر شروع است' : 'مسیر آشنایی شما'}</strong><small>{new Intl.NumberFormat('fa-IR').format(count)} از ۴ قدم</small></span>
      <Icon name={open ? 'close' : 'chevron'} size={16}/>
    </button>
    <div className="exploration-meter" role="progressbar" aria-label="مراحل آشنایی انجام‌شده" aria-valuemin={0} aria-valuemax={4} aria-valuenow={count}><span style={{ width: `${count * 25}%` }}/></div>
    {open && <div className="exploration-panel" id="loxx-exploration-panel">
      <p>چهار قدم کوتاه برای یک شروع مطمئن‌تر.</p>
      <ol>{missions.map((mission, index) => <li key={mission.id} className={completed.includes(mission.id) ? 'is-complete' : ''}>
        <a href={mission.href} onClick={() => setOpen(false)}><span>{completed.includes(mission.id) ? <Icon name="check" size={13}/> : index + 1}</span>{mission.title}</a>
      </li>)}</ol>
      <small>این راهنما فقط در مرورگر شما ذخیره می‌شود؛ قدم‌ها امتیاز مالی یا تخفیف ندارند.</small>
      <button type="button" className="exploration-reset" onClick={reset}>شروع دوباره راهنما</button>
    </div>}
  </aside>;
}
