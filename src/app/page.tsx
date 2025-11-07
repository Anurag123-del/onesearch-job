import { redirect } from 'next/navigation';
import { isGuestMode } from '@/lib/utils/guest';
import DashboardPage from './(dashboard)/page';

export default function RootPage() {
  if (!isGuestMode()) {
    redirect('/login');
  }

  return <DashboardPage />;
}
