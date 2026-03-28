import { Outlet } from 'react-router-dom';
import { V3Sidebar } from '@/components/v3/V3Sidebar';
import { V3TopBar } from '@/components/v3/V3TopBar';

export default function V3Layout() {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--v3-bg)' }}>
      <V3Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <V3TopBar />
        <main className="flex-1 overflow-y-auto p-6 v3-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
