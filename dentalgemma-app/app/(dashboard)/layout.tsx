import { Sidebar } from '@/components/layout/sidebar';
import { Navbar } from '@/components/layout/navbar';
import { Disclaimer } from '@/components/shared/disclaimer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64 transition-all duration-300 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6">
          {children}
        </main>
        <Disclaimer />
      </div>
    </div>
  );
}
