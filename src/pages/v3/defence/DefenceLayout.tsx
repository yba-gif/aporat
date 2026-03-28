import { Outlet } from 'react-router-dom';
import { DefenceSidebar } from '@/components/defence/DefenceSidebar';
import { BackendBanner } from '@/components/defence/BackendBanner';
import { useBackendStatus } from '@/hooks/useDefenceApi';

export default function DefenceLayout() {
  const { data: backendOnline = false, refetch } = useBackendStatus();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0A0F1C' }}>
      <DefenceSidebar backendOnline={backendOnline} />
      <div className="flex-1 flex flex-col min-w-0">
        {!backendOnline && <BackendBanner onRetry={() => refetch()} />}
        <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#1E293B transparent' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
