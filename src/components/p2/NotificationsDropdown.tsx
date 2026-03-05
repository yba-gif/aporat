import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, RefreshCw, UserPlus, Info, Bell,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type NType = 'high_risk' | 'case_update' | 'system' | 'assignment';
type Tab = 'all' | 'alerts' | 'updates';

interface Notification {
  id: string;
  type: NType;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const TYPE_CONFIG: Record<NType, { icon: typeof AlertTriangle; dot: string; tab: Tab }> = {
  high_risk:    { icon: AlertTriangle, dot: 'var(--p2-red)',       tab: 'alerts' },
  assignment:   { icon: UserPlus,      dot: 'var(--p2-orange)',    tab: 'updates' },
  case_update:  { icon: RefreshCw,     dot: 'var(--p2-blue)',      tab: 'updates' },
  system:       { icon: Info,          dot: 'var(--p2-gray-500)',  tab: 'updates' },
};

const NOTIFICATIONS: Notification[] = [
  { id: 'n1',  type: 'high_risk',    title: 'High Risk Case Detected',        description: 'New high-risk case: Ahmad Rezaei (score: 87). Immediate review recommended.',               time: '2m ago',     read: false },
  { id: 'n2',  type: 'assignment',   title: 'New Case Assignment',            description: 'You have been assigned case #VIS-2026-1015 — Syrian national, risk score 72.',              time: '15m ago',    read: false },
  { id: 'n3',  type: 'case_update',  title: 'Case Reviewed',                  description: 'Case #VIS-2026-0987 has been reviewed and approved by Maria K.',                           time: '42m ago',    read: false },
  { id: 'n4',  type: 'system',       title: 'WorldCheck Sync Complete',       description: 'WorldCheck API sync completed. 3 new matches detected across pending cases.',              time: '1h ago',     read: false },
  { id: 'n5',  type: 'high_risk',    title: 'Risk Score Escalation',          description: 'Case #VIS-2026-0993 risk score increased from 65 to 81 after new compliance data.',        time: '1h ago',     read: true },
  { id: 'n6',  type: 'case_update',  title: 'Case Escalated',                 description: 'Case #VIS-2026-1002 has been escalated to Security Division by Mehmet Y.',                 time: '2h ago',     read: true },
  { id: 'n7',  type: 'assignment',   title: 'Reassigned Case',                description: 'Case #VIS-2026-0945 reassigned to you from Burak A. due to workload balancing.',           time: '3h ago',     read: true },
  { id: 'n8',  type: 'system',       title: 'Daily Report Generated',         description: 'Your daily screening summary report is ready. 47 applications processed today.',           time: '5h ago',     read: true },
  { id: 'n9',  type: 'high_risk',    title: 'Sanctions List Match',           description: 'New OFAC SDN match found for case #VIS-2026-1008 — Pakistani national.',                  time: 'Yesterday',  read: true },
  { id: 'n10', type: 'case_update',  title: 'Case Denied',                    description: 'Case #VIS-2026-0962 denied by Ayşe K. Denial notification sent to applicant.',            time: 'Yesterday',  read: true },
  { id: 'n11', type: 'system',       title: 'Scheduled Maintenance',          description: 'System maintenance scheduled for March 6, 2026, 02:00–04:00 UTC.',                        time: 'Yesterday',  read: true },
  { id: 'n12', type: 'case_update',  title: 'Documents Received',             description: 'Additional documents uploaded for case #VIS-2026-1002 by applicant.',                      time: '2 days ago', read: true },
];

export default function NotificationsDropdown() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [tab, setTab] = useState<Tab>('all');

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const filtered = useMemo(() => {
    if (tab === 'all') return notifications;
    if (tab === 'alerts') return notifications.filter(n => n.type === 'high_risk');
    return notifications.filter(n => n.type !== 'high_risk');
  }, [notifications, tab]);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'alerts', label: 'Alerts' },
    { key: 'updates', label: 'Updates' },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative p-1.5 rounded-md hover:bg-[--p2-gray-100] transition-colors">
          <Bell size={18} style={{ color: 'var(--p2-gray-500)' }} />
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
              style={{ background: 'var(--p2-red)' }}
            >
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[320px] p-0 rounded-xl shadow-xl border border-[--p2-gray-200] overflow-hidden"
      >
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[--p2-gray-200]">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[--p2-navy]">Notifications</h3>
              {unreadCount > 0 && (
                <span
                  className="min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                  style={{ background: 'var(--p2-blue)' }}
                >
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-[11px] text-[--p2-blue] hover:underline">
                Mark all as read
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 px-4 py-2 border-b border-[--p2-gray-100]">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  'px-3 py-1 rounded-full text-[11px] font-medium transition-colors',
                  tab === t.key
                    ? 'bg-[--p2-navy] text-white'
                    : 'text-[--p2-gray-500] hover:bg-[--p2-gray-100]',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {filtered.length === 0 ? (
                  <div className="py-10 text-center">
                    <Bell size={24} className="mx-auto text-[--p2-gray-300] mb-2" />
                    <p className="text-xs text-[--p2-gray-400]">No notifications</p>
                  </div>
                ) : (
                  filtered.map((n, i) => {
                    const config = TYPE_CONFIG[n.type];
                    const Icon = config.icon;
                    return (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className={cn(
                          'flex gap-3 px-4 py-3 border-b border-[--p2-gray-100] last:border-b-0 cursor-pointer transition-colors hover:bg-[--p2-gray-50]',
                          !n.read && 'bg-[--p2-blue]/[0.03]',
                        )}
                      >
                        {/* Dot */}
                        <div className="flex flex-col items-center pt-1.5 flex-shrink-0">
                          <span
                            className={cn('w-2 h-2 rounded-full flex-shrink-0', !n.read && 'animate-pulse')}
                            style={{ background: n.read ? 'var(--p2-gray-200)' : config.dot }}
                          />
                        </div>

                        {/* Icon */}
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{
                            background: `color-mix(in srgb, ${config.dot} 12%, transparent)`,
                          }}
                        >
                          <Icon size={13} style={{ color: config.dot }} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className={cn('text-xs text-[--p2-navy] leading-tight', !n.read && 'font-semibold')}>
                            {n.title}
                          </p>
                          <p className="text-[11px] text-[--p2-gray-500] mt-0.5 line-clamp-2 leading-relaxed">
                            {n.description}
                          </p>
                          <p className="text-[10px] text-[--p2-gray-400] mt-1">{n.time}</p>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="border-t border-[--p2-gray-200] px-4 py-2.5 text-center">
            <button className="text-[11px] text-[--p2-blue] hover:underline font-medium">
              View all notifications
            </button>
          </div>
        </motion.div>
      </PopoverContent>
    </Popover>
  );
}
