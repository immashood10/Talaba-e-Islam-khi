import AdminSidebar from '@/components/AdminSidebar';
import AdminLiveWidget from '@/components/AdminLiveWidget';

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar />
      <main className="flex-1 min-w-0">{children}</main>
      <AdminLiveWidget />
    </div>
  );
}
