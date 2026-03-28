import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { V3Sidebar } from '@/components/v3/V3Sidebar';
import { V3TopBar } from '@/components/v3/V3TopBar';
import { V3CommandPalette } from '@/components/v3/V3CommandPalette';

export default function V3Layout() {
  const [cmdOpen, setCmdOpen] = useState(false);
  const location = useLocation();
  const isGraphRoute = location.pathname === '/v3/graph';

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--v3-bg)' }}>
      <V3Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <V3TopBar onSearchClick={() => setCmdOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6 v3-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <V3CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}
