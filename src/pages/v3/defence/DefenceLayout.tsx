import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { DefenceSidebar } from '@/components/defence/DefenceSidebar';
import { BackendBanner } from '@/components/defence/BackendBanner';
import { useBackendStatus } from '@/hooks/useDefenceApi';

export default function DefenceLayout() {
  const { data: backendOnline = false, refetch } = useBackendStatus();
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--v3-bg)' }}>
      <DefenceSidebar backendOnline={backendOnline} />
      <div className="flex-1 flex flex-col min-w-0">
        {!backendOnline && <BackendBanner onRetry={() => refetch()} />}
        <main className="flex-1 overflow-y-auto v3-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}