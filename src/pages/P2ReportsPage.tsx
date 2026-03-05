import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Shield, ClipboardList, GitBranch, BarChart3, Plus,
  Download, FileText, Trash2, X, Clock, Calendar, Loader2, CheckCircle,
  FileDown, File,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

// ── Types ──
interface ReportType {
  id: string;
  title: string;
  icon: typeof Briefcase;
  color: string;
  description: string;
  lastGenerated: string;
}

interface HistoricalReport {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
}

// ── Data ──
const REPORT_TYPES: ReportType[] = [
  { id: 'daily', title: 'Daily Summary', icon: Briefcase, color: 'var(--p2-blue)', description: 'Automated daily overview of applications, risk scores, and alerts', lastGenerated: 'Today, 08:00' },
  { id: 'risk', title: 'Risk Analysis', icon: Shield, color: 'var(--p2-red)', description: 'Detailed breakdown of flagged cases and risk patterns', lastGenerated: 'Yesterday' },
  { id: 'compliance', title: 'Compliance Audit', icon: ClipboardList, color: 'var(--p2-green)', description: 'Full audit trail of all screening decisions and data sources', lastGenerated: 'March 1, 2026' },
  { id: 'network', title: 'Network Intelligence', icon: GitBranch, color: '#8B5CF6', description: 'Cross-applicant connection analysis and community detection', lastGenerated: 'February 28, 2026' },
  { id: 'performance', title: 'Performance Metrics', icon: BarChart3, color: 'var(--p2-orange)', description: 'Processing times, approval rates, and officer productivity', lastGenerated: 'March 3, 2026' },
  { id: 'custom', title: 'Custom Report', icon: Plus, color: 'var(--p2-gray-400)', description: 'Build a report with custom parameters and date ranges', lastGenerated: '' },
];

const HISTORY: HistoricalReport[] = [
  { id: 'h1', name: 'Daily Summary — March 5, 2026', type: 'Daily Summary', date: 'Mar 5, 2026 08:00', size: '1.2 MB' },
  { id: 'h2', name: 'Risk Analysis — March 4, 2026', type: 'Risk Analysis', date: 'Mar 4, 2026 17:30', size: '3.8 MB' },
  { id: 'h3', name: 'Daily Summary — March 4, 2026', type: 'Daily Summary', date: 'Mar 4, 2026 08:00', size: '1.1 MB' },
  { id: 'h4', name: 'Performance Metrics — March 3, 2026', type: 'Performance Metrics', date: 'Mar 3, 2026 16:00', size: '2.4 MB' },
  { id: 'h5', name: 'Daily Summary — March 3, 2026', type: 'Daily Summary', date: 'Mar 3, 2026 08:00', size: '1.3 MB' },
  { id: 'h6', name: 'Compliance Audit — March 1, 2026', type: 'Compliance Audit', date: 'Mar 1, 2026 09:15', size: '8.7 MB' },
  { id: 'h7', name: 'Network Intelligence — Feb 28, 2026', type: 'Network Intelligence', date: 'Feb 28, 2026 14:00', size: '5.2 MB' },
  { id: 'h8', name: 'Daily Summary — Feb 28, 2026', type: 'Daily Summary', date: 'Feb 28, 2026 08:00', size: '1.0 MB' },
  { id: 'h9', name: 'Risk Analysis — Feb 27, 2026', type: 'Risk Analysis', date: 'Feb 27, 2026 17:45', size: '3.5 MB' },
  { id: 'h10', name: 'Custom Report — Feb 25, 2026', type: 'Custom Report', date: 'Feb 25, 2026 11:20', size: '2.1 MB' },
];

const REPORT_SECTIONS: Record<string, string[]> = {
  daily: ['Executive Summary', 'Applications Overview (47 received)', 'Risk Score Distribution', 'Flagged Cases (8 new)', 'Officer Activity Log', 'System Health Status'],
  risk: ['Risk Trend Analysis', 'Top Flagged Applicants', 'Sanctions Matches (12)', 'VPN / IP Anomalies', 'Fraud Vector Correlation', 'Recommendations'],
  compliance: ['Audit Period Summary', 'Decision Log (978 approved, 127 denied)', 'Data Source Integrity', 'RLS Policy Compliance', 'Access Log Review', 'Regulatory Checklist'],
  network: ['Graph Statistics (18 nodes, 30 edges)', 'Community Detection Results (3 clusters)', 'Risk Path Analysis', 'Cross-Case Connections', 'Entity Timeline', 'Anomalous Patterns'],
  performance: ['Officer Throughput', 'Average Processing Time (36h)', 'Approval Rate Trend (78.4%)', 'Escalation Frequency', 'Queue Wait Times', 'SLA Compliance'],
  custom: ['Custom Parameters', 'Filtered Results', 'Data Export'],
};

// ── Report Preview Panel ──
function ReportPanel({ report, onClose }: { report: ReportType; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState('off');
  const Icon = report.icon;
  const sections = REPORT_SECTIONS[report.id] || [];

  // Simulate loading
  useState(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  });

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 h-full w-full max-w-[440px] bg-white z-50 shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[--p2-gray-200]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `color-mix(in srgb, ${report.color} 12%, transparent)` }}>
              <Icon size={18} style={{ color: report.color }} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[--p2-navy]">{report.title}</h2>
              <p className="text-[10px] text-[--p2-gray-400]">Report Preview</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-[--p2-gray-50] text-[--p2-gray-400] hover:text-[--p2-navy] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 size={28} className="animate-spin text-[--p2-blue]" />
              <p className="text-xs text-[--p2-gray-400]">Generating report preview…</p>
            </div>
          ) : (
            <>
              {/* Sections */}
              <div>
                <h3 className="text-[11px] font-semibold text-[--p2-navy] mb-3 uppercase tracking-wider">Report Sections</h3>
                <div className="space-y-2">
                  {sections.map((s, i) => (
                    <motion.div key={s} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-[--p2-gray-50] border border-[--p2-gray-100]">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0" style={{ background: report.color }}>
                        {i + 1}
                      </div>
                      <span className="text-xs text-[--p2-gray-600]">{s}</span>
                      <CheckCircle size={13} className="ml-auto text-[--p2-green]" />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Download */}
              <div>
                <h3 className="text-[11px] font-semibold text-[--p2-navy] mb-3 uppercase tracking-wider">Download</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'PDF', icon: FileDown, ext: '.pdf' },
                    { label: 'DOCX', icon: File, ext: '.docx' },
                    { label: 'CSV', icon: FileText, ext: '.csv' },
                  ].map(f => (
                    <button key={f.label}
                      onClick={() => toast({ title: `${report.title}${f.ext} downloaded` })}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-[--p2-gray-200] hover:border-[--p2-blue]/40 hover:bg-[--p2-blue]/5 transition-all">
                      <f.icon size={18} style={{ color: report.color }} />
                      <span className="text-[10px] font-semibold text-[--p2-navy]">{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Schedule */}
              <div>
                <h3 className="text-[11px] font-semibold text-[--p2-navy] mb-3 uppercase tracking-wider">Schedule</h3>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-[--p2-gray-200]">
                  <Calendar size={15} className="text-[--p2-gray-400]" />
                  <Select value={schedule} onValueChange={setSchedule}>
                    <SelectTrigger className="h-8 text-xs flex-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="off">Off</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {schedule !== 'off' && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-[--p2-green] mt-2 flex items-center gap-1">
                    <CheckCircle size={10} /> Scheduled {schedule}. Next run at 08:00.
                  </motion.p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[--p2-gray-200] flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" className="text-xs h-9" onClick={onClose}>Close</Button>
          <Button size="sm" className="text-xs h-9 gap-1.5 text-white" style={{ background: report.color }}
            onClick={() => { toast({ title: 'Report generated', description: `${report.title} is ready.` }); onClose(); }}>
            <Download size={12} /> Generate Now
          </Button>
        </div>
      </motion.div>
    </>
  );
}

// ── Main Component ──
export default function P2Reports() {
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [history, setHistory] = useState(HISTORY);

  const deleteReport = (id: string) => {
    setHistory(prev => prev.filter(r => r.id !== id));
    toast({ title: 'Report deleted' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-[--p2-navy]">Intelligence Reports</h1>
          <p className="text-xs text-[--p2-gray-400]">Generate, schedule, and download operational reports</p>
        </div>
        <Button size="sm" className="h-9 text-xs gap-1.5 bg-[--p2-blue] hover:bg-[--p2-blue]/90 text-white"
          onClick={() => setSelectedReport(REPORT_TYPES[5])}>
          <Plus size={13} /> Generate New Report
        </Button>
      </motion.div>

      {/* Report Type Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORT_TYPES.map((r, i) => {
          const Icon = r.icon;
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4, boxShadow: '0 8px 30px -12px rgba(0,0,0,0.15)' }}
              onClick={() => setSelectedReport(r)}
              className="p2-card p-5 cursor-pointer transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `color-mix(in srgb, ${r.color} 12%, transparent)` }}>
                  <Icon size={20} style={{ color: r.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-[--p2-navy] group-hover:text-[--p2-blue] transition-colors">{r.title}</h3>
                  <p className="text-[11px] text-[--p2-gray-500] mt-1 leading-relaxed">{r.description}</p>
                  {r.lastGenerated && (
                    <p className="text-[10px] text-[--p2-gray-400] mt-2 flex items-center gap-1">
                      <Clock size={10} /> Last generated: {r.lastGenerated}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* History Table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <div className="p2-card overflow-hidden">
          <div className="px-5 py-4 border-b border-[--p2-gray-200]">
            <h3 className="text-xs font-semibold text-[--p2-navy]">Previous Reports</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[--p2-gray-100] bg-[--p2-gray-50]">
                  {['Report Name', 'Type', 'Generated', 'Size', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[--p2-gray-400]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((r, i) => (
                  <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.03 }}
                    className="border-b border-[--p2-gray-100] hover:bg-[--p2-gray-50] transition-colors">
                    <td className="px-4 py-3 font-semibold text-[--p2-navy]">{r.name}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[--p2-blue]/10 text-[--p2-blue]">{r.type}</span>
                    </td>
                    <td className="px-4 py-3 text-[--p2-gray-500]">{r.date}</td>
                    <td className="px-4 py-3 text-[--p2-gray-500]">{r.size}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => toast({ title: `Downloading ${r.name}` })}
                          className="p-1.5 rounded-md hover:bg-[--p2-gray-100] text-[--p2-gray-400] hover:text-[--p2-blue]">
                          <Download size={13} />
                        </button>
                        <button onClick={() => deleteReport(r.id)}
                          className="p-1.5 rounded-md hover:bg-[--p2-red]/5 text-[--p2-gray-400] hover:text-[--p2-red]">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Panel */}
      <AnimatePresence>
        {selectedReport && <ReportPanel report={selectedReport} onClose={() => setSelectedReport(null)} />}
      </AnimatePresence>
    </div>
  );
}
