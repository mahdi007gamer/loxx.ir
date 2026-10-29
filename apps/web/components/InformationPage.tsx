import { Header } from './Header';
import { Logo } from './Logo';
import '../app/information.css';

export function InformationPage({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  return <><Header/><main className="information-page container" id="main"><p className="eyebrow">LOXX / CLEAR FROM THE START</p><h1>{title}</h1><p className="information-intro">{intro}</p><div className="information-content">{children}</div><div className="information-contact"><h2>درباره این موارد گفت‌وگو کنیم.</h2><a className="button" href="tel:+989375302400"><span dir="ltr">0937 530 2400</span></a><a className="text-link" href="/#contact">ثبت درخواست مشاوره ←</a></div></main><footer className="information-footer container"><Logo/><a href="/">بازگشت به استودیو</a><a href="/privacy">حریم خصوصی</a><a href="/terms">شرایط همکاری</a></footer></>;
}
