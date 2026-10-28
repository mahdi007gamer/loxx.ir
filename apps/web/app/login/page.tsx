import { Header } from '@/components/Header';
import { Account } from '@/components/Account';
export const metadata={title:'حساب کاربری',robots:{index:false,follow:false}};
export default function Login(){return <><Header/><main id="main" className="account-page"><img className="account-landscape" src="/images/journey-world.webp" width="1600" height="800" alt=""/><div className="container account-layout"><div className="account-intro"><p className="eyebrow">YOUR SPACE IN THE LOXX UNIVERSE</p><h1>یک ایده مشترک.<br/><span>یک مسیر روشن.</span></h1><p>به فضای همکاری خود خوش آمدید.<br/>درخواست‌های ثبت‌شده را از حساب خود دنبال کنید.</p><a className="text-link" href="/">بازگشت به استودیو ←</a></div><div className="account-content"><Account/></div></div></main></>}
