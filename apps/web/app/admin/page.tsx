import type { Metadata } from 'next';
import { AdminDashboard } from '@/components/AdminDashboard';
import '../admin.css';

export const metadata: Metadata = {
  title: 'مدیریت استودیو LOXX',
  robots: { index: false, follow: false },
};
export default function AdminPage() {
  return <main id="main" className="admin-page"><AdminDashboard/></main>;
}
