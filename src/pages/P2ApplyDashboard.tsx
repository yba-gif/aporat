import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, ChevronRight, Download, ExternalLink, User,
  Headphones, Check, Clock, Shield, LogOut, ChevronDown,
  Plus, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import logo from '@/assets/logo.png';

// ── Mock Data ──
const ACTIVE_APPS = [
  {
    id: 'CLR-2026-4721',
    destination: 'Switzerland',
    flag: '🇨🇭',
    status: 'PROCESSING' as const,
    progress: 65,
    submitted: 'March 5, 2026',
    estimated: 'March 6, 2026 — 08:00',
  },
];

const PAST_CERTS = [
  { id: 'CLR-2025-31842', destination: 'Germany', flag: '🇩🇪', issued: 'Jun 12, 2025', expiry: 'Dec 12, 2025', status: 'Expired' as const },
  { id: 'CLR-2025-28190', destination: 'France', flag: '🇫🇷', issued: 'Apr 3, 2025', expiry: 'Oct 3, 2025', status: 'Valid' as const },
];

const STATUS_STYLE: Record<string, { color: string; bg: string; label: string }> = {
  PROCESSING: { color: 'var(--p2-blue)', bg: 'rgba(41,128,185,0.1)', label: 'Processing' },
  CLEARED: { color: 'var(--p2-green)', bg: 'rgba(39,174,96,0.1)', label: 'Cleared' },
  UNDER_REVIEW: { color: 'var(--p2-orange)', bg: 'rgba(230,126,34,0.1)', label: 'Under Review' },
  DENIED: { color: 'var(--p2-red)', bg: 'rgba(192,57,43,0.1)', label: 'Denied' },
};

export default function P2ApplyDashboard() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="p2 min-h-screen bg-[--p2-gray-50] flex flex-col">
      {/* Nav */}
      <header className="border-b border-[--p2-gray-200] bg-white sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/p2" className="flex items-center gap-2"><img src={logo} alt="Portolan Labs" className="h-7" /></Link>
            <nav className="hidden sm:flex items-center gap-1">
              {[
                { label: 'My Applications', to: '/p2/apply/dashboard' },
                { label: 'New Application', to: '/p2/apply' },
                { label: 'Support', to: '#' },
              ].map(l => (
                <Link key={l.label} to={l.to}
                  className={cn('text-[11px] font-medium px-3 py-1.5 rounded-md transition-colors',
                    l.to === '/p2/apply/dashboard' ? 'text-[--p2-blue] bg-[--p2-blue]/5' : 'text-[--p2-gray-500] hover:text-[--p2-navy] hover:bg-[--p2-gray-50]'
                  )}>{l.label}</Link>
              ))}
            </nav>
          </div>
          <div className="relative">
            <button onClick={() => setMenuOpen(v => !v)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[--p2-gray-50] transition-colors">
              <div className="w-7 h-7 rounded-full bg-[--p2-blue]/10 flex items-center justify-center text-[10px] font-bold text-[--p2-blue]">AM</div>
              <span className="text-xs font-medium text-[--p2-navy] hidden sm:inline">Alexander M.</span>
              <ChevronDown size={12} className="text-[--p2-gray-400]" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-[--p2-gray-200] shadow-lg py-1 z-50">
                  <button className="w-full text-left px-3 py-2 text-xs text-[--p2-gray-600] hover:bg-[--p2-gray-50] flex items-center gap-2"><User size={13} /> Profile</button>
                  <button onClick={() => { setMenuOpen(false); navigate('/p2'); }} className="w-full text-left px-3 py-2 text-xs text-[--p2-red] hover:bg-[--p2-red]/5 flex items-center gap-2"><LogOut size={13} /> Sign Out</button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 py-8 px-4">
        <div className="max-w-[800px] mx-auto space-y-8">
          {/* Greeting */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-lg font-bold text-[--p2-navy]">Welcome back, Alexander</h1>
            <p className="text-xs text-[--p2-gray-500] mt-0.5">Manage your applications and certificates</p>
          </motion.div>

          {/* Active Applications */}
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
            <h2 className="text-xs font-semibold text-[--p2-navy] mb-3">Active Applications</h2>
            {ACTIVE_APPS.length === 0 ? (
              <div className="rounded-2xl border border-[--p2-gray-200] bg-white p-8 text-center">
                <FileText size={28} className="mx-auto text-[--p2-gray-300] mb-3" />
                <p className="text-sm font-semibold text-[--p2-navy]">No active applications</p>
                <p className="text-xs text-[--p2-gray-400] mt-1 mb-4">Start a new application to get your clearance certificate</p>
                <Button asChild className="bg-[--p2-blue] hover:bg-[--p2-blue]/90 text-white text-xs h-9 gap-1.5">
                  <Link to="/p2/apply"><Plus size={13} /> Start New Application</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {ACTIVE_APPS.map((app, i) => {
                  const st = STATUS_STYLE[app.status];
                  return (
                    <motion.div key={app.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                      className="rounded-2xl border border-[--p2-gray-200] bg-white p-5 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{app.flag}</span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-bold text-[--p2-navy]">{app.destination}</p>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: st.color, background: st.bg }}>{st.label}</span>
                            </div>
                            <p className="text-[10px] font-mono text-[--p2-gray-400] mt-0.5">{app.id}</p>
                          </div>
                        </div>
                        <Button asChild variant="outline" size="sm" className="text-xs h-9 gap-1.5 shrink-0">
                          <Link to={`/p2/apply/status/${app.id}`}>View Details <ChevronRight size={12} /></Link>
                        </Button>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] text-[--p2-gray-400]">Submitted: {app.submitted}</span>
                          <span className="text-[10px] text-[--p2-gray-400]">Est. completion: {app.estimated}</span>
                        </div>
                        <div className="h-2 bg-[--p2-gray-100] rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${app.progress}%` }} transition={{ duration: 1, delay: 0.3 }}
                            className="h-full rounded-full bg-gradient-to-r from-[--p2-blue] to-[--p2-blue-light]" />
                        </div>
                        <p className="text-[10px] text-right text-[--p2-gray-400] mt-1">{app.progress}%</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.section>

          {/* Past Certificates */}
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
            <h2 className="text-xs font-semibold text-[--p2-navy] mb-3">Past Certificates</h2>
            {PAST_CERTS.length === 0 ? (
              <div className="rounded-2xl border border-[--p2-gray-200] bg-white p-8 text-center">
                <Shield size={28} className="mx-auto text-[--p2-gray-300] mb-3" />
                <p className="text-sm font-semibold text-[--p2-navy]">No certificates yet</p>
                <p className="text-xs text-[--p2-gray-400] mt-1">Completed applications will appear here</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-[--p2-gray-200] bg-white overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[--p2-gray-100] bg-[--p2-gray-50]">
                        {['Certificate', 'Destination', 'Issued', 'Expires', 'Status', 'Actions'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[--p2-gray-400]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {PAST_CERTS.map((c, i) => (
                        <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 + i * 0.05 }}
                          className="border-b border-[--p2-gray-100] hover:bg-[--p2-gray-50] transition-colors">
                          <td className="px-4 py-3 font-mono font-semibold text-[--p2-navy]">{c.id}</td>
                          <td className="px-4 py-3"><span className="mr-1.5">{c.flag}</span>{c.destination}</td>
                          <td className="px-4 py-3 text-[--p2-gray-500]">{c.issued}</td>
                          <td className="px-4 py-3 text-[--p2-gray-500]">{c.expiry}</td>
                          <td className="px-4 py-3">
                            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full',
                              c.status === 'Valid' ? 'text-[--p2-green] bg-[--p2-green]/10' : 'text-[--p2-orange] bg-[--p2-orange]/10'
                            )}>{c.status}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button onClick={() => toast({ title: `Downloading ${c.id}` })}
                                className="p-1.5 rounded-md hover:bg-[--p2-gray-100] text-[--p2-gray-400] hover:text-[--p2-blue]"><Download size={13} /></button>
                              <Link to={`/verify/${c.id}`}
                                className="p-1.5 rounded-md hover:bg-[--p2-gray-100] text-[--p2-gray-400] hover:text-[--p2-green]"><ExternalLink size={13} /></Link>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.section>

          {/* Quick Actions */}
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
            <h2 className="text-xs font-semibold text-[--p2-navy] mb-3">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'Apply for New Certificate', desc: 'Start a clearance application', icon: ArrowRight, color: 'var(--p2-blue)', to: '/p2/apply' },
                { title: 'Verify a Certificate', desc: 'Check certificate authenticity', icon: Check, color: 'var(--p2-green)', to: '/verify' },
                { title: 'Update Profile', desc: 'Manage your personal details', icon: User, color: 'var(--p2-gray-500)', to: '#' },
                { title: 'Contact Support', desc: 'Get help from our team', icon: Headphones, color: 'var(--p2-gray-500)', to: '#' },
              ].map((a, i) => (
                <motion.div key={a.title} whileHover={{ y: -3, boxShadow: '0 6px 24px -8px rgba(0,0,0,0.1)' }}>
                  <Link to={a.to}
                    className="flex items-center gap-4 p-4 rounded-xl border border-[--p2-gray-200] bg-white hover:border-transparent transition-all group">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `color-mix(in srgb, ${a.color} 10%, transparent)` }}>
                      <a.icon size={18} style={{ color: a.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[--p2-navy] group-hover:text-[--p2-blue] transition-colors">{a.title}</p>
                      <p className="text-[10px] text-[--p2-gray-400] mt-0.5">{a.desc}</p>
                    </div>
                    <ChevronRight size={14} className="text-[--p2-gray-300] group-hover:text-[--p2-blue] transition-colors" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>
      </main>

      <footer className="border-t border-[--p2-gray-200] py-6 mt-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-[--p2-gray-400]">© 2026 Portolan Labs AG. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-[10px] text-[--p2-gray-400] hover:text-[--p2-blue]">Terms</a>
            <a href="#" className="text-[10px] text-[--p2-gray-400] hover:text-[--p2-blue]">Privacy</a>
            <a href="#" className="text-[10px] text-[--p2-gray-400] hover:text-[--p2-blue]">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
