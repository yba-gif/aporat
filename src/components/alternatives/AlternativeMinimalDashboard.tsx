import { useState } from 'react';
import { 
  Search,
  Filter,
  MoreHorizontal,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Building,
  FileText,
  ArrowUpRight,
  Calendar
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Case {
  id: string;
  applicant: string;
  agency: string;
  type: string;
  status: 'approved' | 'rejected' | 'pending' | 'flagged';
  riskScore: number;
  date: string;
  flags: string[];
}

const CASES: Case[] = [
  { id: 'VIS-2026-001', applicant: 'Mehmet Yilmaz', agency: 'ABC Travel', type: 'Work Visa', status: 'flagged', riskScore: 87, date: '2026-01-30', flags: ['Network Risk', 'Document Anomaly'] },
  { id: 'VIS-2026-002', applicant: 'Ayse Kaya', agency: 'Global Tours', type: 'Tourist Visa', status: 'approved', riskScore: 12, date: '2026-01-30', flags: [] },
  { id: 'VIS-2026-003', applicant: 'Ali Demir', agency: 'ABC Travel', type: 'Student Visa', status: 'pending', riskScore: 45, date: '2026-01-30', flags: ['Agency Watch'] },
  { id: 'VIS-2026-004', applicant: 'Fatma Ozturk', agency: 'Euro Visa', type: 'Work Visa', status: 'rejected', riskScore: 92, date: '2026-01-29', flags: ['Fraud Ring', 'Fake Docs'] },
  { id: 'VIS-2026-005', applicant: 'Emre Celik', agency: 'Istanbul Express', type: 'Business Visa', status: 'approved', riskScore: 8, date: '2026-01-29', flags: [] },
  { id: 'VIS-2026-006', applicant: 'Zeynep Arslan', agency: 'ABC Travel', type: 'Tourist Visa', status: 'flagged', riskScore: 76, date: '2026-01-29', flags: ['Network Risk'] },
];

const STATUS_CONFIG = {
  approved: { color: 'bg-accent/10 text-accent border-accent/20', icon: CheckCircle2 },
  rejected: { color: 'bg-destructive/10 text-destructive border-destructive/20', icon: AlertTriangle },
  pending: { color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: Clock },
  flagged: { color: 'bg-orange-500/10 text-orange-500 border-orange-500/20', icon: AlertTriangle },
};

export function AlternativeMinimalDashboard() {
  const [selectedCase, setSelectedCase] = useState<string | null>(CASES[0].id);
  const [filter, setFilter] = useState<string>('all');

  const selectedCaseData = CASES.find(c => c.id === selectedCase);

  return (
    <div className="h-full flex bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r border-border flex flex-col">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search cases..." className="pl-9 bg-secondary/50 border-0" />
          </div>
        </div>

        <div className="px-4 pb-4 flex gap-2">
          {['all', 'flagged', 'pending'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                filter === f ? 'bg-foreground text-background' : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto">
          {CASES.filter(c => filter === 'all' || c.status === filter).map((caseItem) => {
            const StatusIcon = STATUS_CONFIG[caseItem.status].icon;
            return (
              <div
                key={caseItem.id}
                onClick={() => setSelectedCase(caseItem.id)}
                className={`p-4 border-b border-border cursor-pointer transition-colors ${
                  selectedCase === caseItem.id ? 'bg-secondary' : 'hover:bg-secondary/50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-mono text-muted-foreground">{caseItem.id}</span>
                  <StatusIcon className={`w-4 h-4 ${STATUS_CONFIG[caseItem.status].color.split(' ')[1]}`} />
                </div>
                <p className="font-medium text-sm mb-1">{caseItem.applicant}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{caseItem.type}</span>
                  <span>•</span>
                  <span>{caseItem.agency}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedCaseData ? (
          <>
            {/* Header */}
            <div className="h-16 border-b border-border flex items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold">{selectedCaseData.applicant}</h2>
                <Badge variant="outline" className={STATUS_CONFIG[selectedCaseData.status].color}>
                  {selectedCaseData.status.charAt(0).toUpperCase() + selectedCaseData.status.slice(1)}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">View Documents</Button>
                <Button variant="outline" size="sm">View Network</Button>
                <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90">
                  Make Decision
                </Button>
              </div>
            </div>

            {/* Content Grid */}
            <div className="flex-1 overflow-auto p-6">
              <div className="max-w-5xl mx-auto grid grid-cols-3 gap-6">
                {/* Risk Score Card */}
                <div className="col-span-1 p-6 bg-surface-elevated rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">Risk Assessment</p>
                  <div className="flex items-end gap-3 mb-4">
                    <span className={`text-5xl font-light font-mono ${
                      selectedCaseData.riskScore > 70 ? 'text-destructive' :
                      selectedCaseData.riskScore > 40 ? 'text-yellow-500' :
                      'text-accent'
                    }`}>
                      {selectedCaseData.riskScore}
                    </span>
                    <span className="text-muted-foreground text-sm mb-1">/ 100</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        selectedCaseData.riskScore > 70 ? 'bg-destructive' :
                        selectedCaseData.riskScore > 40 ? 'bg-yellow-500' :
                        'bg-accent'
                      }`}
                      style={{ width: `${selectedCaseData.riskScore}%` }}
                    />
                  </div>
                </div>

                {/* Case Details */}
                <div className="col-span-2 p-6 bg-surface-elevated rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">Case Details</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Applicant</p>
                        <p className="font-medium">{selectedCaseData.applicant}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                        <Building className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Agency</p>
                        <p className="font-medium">{selectedCaseData.agency}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Visa Type</p>
                        <p className="font-medium">{selectedCaseData.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Submitted</p>
                        <p className="font-medium">{selectedCaseData.date}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Flags */}
                {selectedCaseData.flags.length > 0 && (
                  <div className="col-span-3 p-6 bg-surface-elevated rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">Active Flags</p>
                    <div className="flex flex-wrap gap-3">
                      {selectedCaseData.flags.map((flag) => (
                        <div key={flag} className="flex items-center gap-2 px-4 py-2 bg-destructive/10 rounded-lg border border-destructive/20">
                          <AlertTriangle className="w-4 h-4 text-destructive" />
                          <span className="text-sm font-medium text-destructive">{flag}</span>
                          <ChevronRight className="w-4 h-4 text-destructive/50" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="col-span-3 grid grid-cols-4 gap-4">
                  {[
                    { label: 'View Full Dossier', icon: User },
                    { label: 'Network Analysis', icon: ArrowUpRight },
                    { label: 'Document Audit', icon: FileText },
                    { label: 'Similar Cases', icon: Filter },
                  ].map((action) => (
                    <button
                      key={action.label}
                      className="p-4 bg-surface-elevated rounded-lg border border-border hover:border-accent/50 transition-colors flex items-center justify-between group"
                    >
                      <span className="text-sm font-medium">{action.label}</span>
                      <action.icon className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a case to view details
          </div>
        )}
      </div>
    </div>
  );
}
