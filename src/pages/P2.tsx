import '@/styles/p2.css';
import { Shield, Users, AlertTriangle, FileCheck, Activity, Globe } from 'lucide-react';
import { StatCard } from '@/components/p2/StatCard';
import { RiskBadge } from '@/components/p2/RiskBadge';
import { StatusBadge } from '@/components/p2/StatusBadge';
import { ScoreCircle } from '@/components/p2/ScoreCircle';
import { DataTable, Column } from '@/components/p2/DataTable';
import { PageHeader } from '@/components/p2/PageHeader';
import { LoadingSpinner } from '@/components/p2/LoadingSpinner';
import { EmptyState } from '@/components/p2/EmptyState';

// Mock data
const mockCases = [
  { id: 'VIS-2026-0891', applicant: 'Mehmet Yılmaz', nationality: 'TR', riskScore: 23, status: 'CLEARED' as const, risk: 'LOW' as const, submitted: '2026-02-28' },
  { id: 'VIS-2026-0892', applicant: 'Ahmad Rezaee', nationality: 'IR', riskScore: 87, status: 'FLAGGED' as const, risk: 'CRITICAL' as const, submitted: '2026-02-27' },
  { id: 'VIS-2026-0893', applicant: 'Elena Petrov', nationality: 'UA', riskScore: 41, status: 'PROCESSING' as const, risk: 'MEDIUM' as const, submitted: '2026-03-01' },
  { id: 'VIS-2026-0894', applicant: 'Li Wei', nationality: 'CN', riskScore: 62, status: 'PENDING' as const, risk: 'HIGH' as const, submitted: '2026-03-02' },
  { id: 'VIS-2026-0895', applicant: 'Sarah Johnson', nationality: 'US', riskScore: 12, status: 'CLEARED' as const, risk: 'LOW' as const, submitted: '2026-03-03' },
  { id: 'VIS-2026-0896', applicant: 'Ravi Patel', nationality: 'IN', riskScore: 55, status: 'PROCESSING' as const, risk: 'MEDIUM' as const, submitted: '2026-03-01' },
  { id: 'VIS-2026-0897', applicant: 'Maria Garcia', nationality: 'MX', riskScore: 8, status: 'CLEARED' as const, risk: 'LOW' as const, submitted: '2026-03-04' },
  { id: 'VIS-2026-0898', applicant: 'Amir Hassan', nationality: 'SY', riskScore: 91, status: 'DENIED' as const, risk: 'CRITICAL' as const, submitted: '2026-02-25' },
];

const columns: Column<typeof mockCases[0]>[] = [
  { key: 'id', label: 'Case ID', sortable: true },
  { key: 'applicant', label: 'Applicant', sortable: true },
  { key: 'nationality', label: 'Origin', sortable: true },
  { key: 'riskScore', label: 'Risk', sortable: true, render: (row) => <ScoreCircle score={row.riskScore} size="sm" /> },
  { key: 'risk', label: 'Level', render: (row) => <RiskBadge level={row.risk} size="sm" /> },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  { key: 'submitted', label: 'Submitted', sortable: true },
];

export default function P2() {
  return (
    <div className="p2 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[--p2-navy] text-white" style={{ height: 'var(--p2-header-height)' }}>
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-[--p2-blue] flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <span className="font-bold text-sm tracking-wide">PORTOLAN LABS</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-white/70">
            <a href="#" className="text-white">Dashboard</a>
            <a href="#" className="hover:text-white transition-colors">Cases</a>
            <a href="#" className="hover:text-white transition-colors">Intelligence</a>
            <a href="#" className="hover:text-white transition-colors">Reports</a>
          </nav>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[--p2-navy-light] flex items-center justify-center text-xs font-bold">AK</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <PageHeader
          title="Visa Intelligence Dashboard"
          subtitle="Real-time monitoring of cross-border mobility cases"
          breadcrumbs={[{ label: 'Home' }, { label: 'Dashboard' }]}
        />

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Users} label="Active Cases" value="2,847" delta={12.5} />
          <StatCard icon={AlertTriangle} label="Flagged" value="143" delta={-3.2} variant="red" />
          <StatCard icon={FileCheck} label="Cleared Today" value="89" delta={8.1} variant="green" />
          <StatCard icon={Activity} label="Avg. Processing" value="4.2h" delta={-15.3} variant="blue" />
        </div>

        {/* Component Showcase Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Risk Badges */}
          <div className="p2-card p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[--p2-gray-400] mb-4">Risk Levels</h3>
            <div className="flex flex-wrap gap-2">
              <RiskBadge level="LOW" />
              <RiskBadge level="MEDIUM" />
              <RiskBadge level="HIGH" />
              <RiskBadge level="CRITICAL" />
            </div>
          </div>

          {/* Status Badges */}
          <div className="p2-card p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[--p2-gray-400] mb-4">Case Statuses</h3>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="PENDING" />
              <StatusBadge status="PROCESSING" />
              <StatusBadge status="CLEARED" />
              <StatusBadge status="FLAGGED" />
              <StatusBadge status="DENIED" />
            </div>
          </div>

          {/* Score Circles */}
          <div className="p2-card p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[--p2-gray-400] mb-4">Risk Scores</h3>
            <div className="flex items-center justify-around">
              <ScoreCircle score={15} size="sm" />
              <ScoreCircle score={42} size="md" />
              <ScoreCircle score={78} size="sm" />
              <ScoreCircle score={93} size="sm" />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-[--p2-navy] mb-3">Recent Cases</h2>
          <DataTable columns={columns} data={mockCases} searchPlaceholder="Search cases..." />
        </div>

        {/* Loading & Empty States */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p2-card">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[--p2-gray-400] px-5 pt-5 mb-0">Loading State</h3>
            <LoadingSpinner />
          </div>
          <div className="p2-card">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[--p2-gray-400] px-5 pt-5 mb-0">Empty State</h3>
            <EmptyState icon={Globe} title="No intelligence data" description="Connect a data source to begin monitoring cross-border activity."
              action={<button className="px-4 py-2 bg-[--p2-blue] text-white text-xs font-medium rounded-md hover:bg-[--p2-blue-light] transition-colors">Connect Source</button>} />
          </div>
        </div>
      </main>
    </div>
  );
}
