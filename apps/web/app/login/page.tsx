import { Header } from '@/components/Header';
import { Account } from '@/components/Account';
export const metadata={title:'حساب کاربری',robots:{index:false,follow:false}};
export default function Login(){return <><Header/><main id="main" className="container subpage"><Account/></main></>}
