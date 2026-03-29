import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FileText, CheckCircle, Loader2, XCircle, AlertTriangle,
  ExternalLink, ChevronDown, ChevronRight, Search as SearchIcon,
  Instagram, Facebook, Twitter, Globe, Shield, CreditCard, Plane,
  Network, Fingerprint, Clock, User, Upload, Brain, Activity
} from 'lucide-react';
import { useV3Case } from '@/api/v3-hooks';
import { v3Cases as casesApi } from '@/api/v3-supabase';
import { nationalityFlags } from '@/data/v3/mockData';
import type { Finding } from '@/api/client';
import { RiskBadge, StatusBadge, RiskScoreCircle } from '@/components/v3/V3Badges';
import { V3SocialGraph } from '@/components/v3/V3SocialGraph';
import { V3ConfirmDialog } from '@/components/v3/V3ConfirmDialog';
import { toast } from 'sonner';

const sourceIcons: Record<string, typeof Instagram> = {
  instagram: Instagram, facebook: Facebook, twitter: Twitter,
  tiktok: Globe, linkedin: Globe, strava: Activity,
  public_records: FileText, financial: CreditCard, travel: Plane, darkweb: Shield,
};

const categoryLabels: Record<string, string> = {
  social_media: 'Social Media', public_records: 'Public Records',
  financial: 'Financial', travel: 'Travel', network: 'Network',
  digital_footprint: 'Digital Footprint',
};

const categoryIcons: Record<string, typeof Globe> = {
  social_media: Instagram, public_records: FileText,
  financial: CreditCard, travel: Plane, network: Network,
  digital_footprint: Fingerprint,
};

const eventIcons: Record<string, typeof Clock> = {
  created: FileText, document_upload: Upload, ocr_complete: CheckCircle,
  scan_started: SearchIcon, scan_completed: CheckCircle, finding_added: AlertTriangle,
  risk_scored: Brain, reviewed: User, escalated: AlertTriangle,
  approved: CheckCircle, rejected: XCircle,
};

const eventColors: Record<string, string> = {
  created: 'var(--v3-text-muted)', document_upload: 'var(--v3-accent)',
  ocr_complete: 'var(--v3-green)', scan_started: 'var(--v3-accent)',
  scan_completed: 'var(--v3-green)', finding_added: 'var(--v3-amber)',
  risk_scored: 'var(--v3-accent)', reviewed: 'var(--v3-text-secondary)',
  escalated: 'var(--v3-amber)', approved: 'var(--v3-green)', rejected: 'var(--v3-red)',
};

export default function V3CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: caseData, loading, refetch } = useV3Case(id);
  const [activeTab, setActiveTab] = useState<'findings' | 'graph' | 'timeline' | 'documents'>('findings');
  const [findingFilter, setFindingFilter] = useState<'all' | 'high' | 'medium'>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['social_media', 'financial', 'public_records', 'network', 'digital_footprint', 'travel']));
  const [rationaleOpen, setRationaleOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ type: 'reject' | 'escalate' | 'approve' } | null>(null);

  const groupedFindings = useMemo(() => {
    if (!caseData) return {};
    let findings = caseData.findings || [];
    if (findingFilter === 'high') findings = findings.filter(f => f.risk_impact === 'high' || f.risk_impact === 'critical');
    if (findingFilter === 'medium') findings = findings.filter(f => f.risk_impact !== 'none' && f.risk_impact !== 'low');
    const groups: Record<string, Finding[]> = {};
    findings.forEach(f => {
      if (!groups[f.category]) groups[f.category] = [];
      groups[f.category].push(f);
    });
    return groups;
  }, [caseData, findingFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--v3-accent)' }} />
      </div>
    );
  }

  if (!caseData) return <div style={{ color: 'var(--v3-text)' }}>Case not found</div>;

  const handleAction = (action: 'approve' | 'reject' | 'escalate') => {
    setConfirmDialog({ type: action });
  };

  const confirmAction = async () => {
    if (!confirmDialog || !caseData) return;
    const statusMap = { approve: 'approved', reject: 'rejected', escalate: 'escalated' } as const;
    try {
      await casesApi.update(caseData.id, { status: statusMap[confirmDialog.type] });
      toast.success(`Case ${caseData.case_id} ${statusMap[confirmDialog.type]}`);
      refetch();
    } catch (e: any) {
      toast.error(e.message);
    }
    setConfirmDialog(null);
  };

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const ocrIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle size={12} style={{ color: 'var(--v3-green)' }} />;
    if (status === 'processing') return <Loader2 size={12} className="animate-spin" style={{ color: 'var(--v3-amber)' }} />;
    return <XCircle size={12} style={{ color: 'var(--v3-red)' }} />;
  };

  const breakdown = caseData.risk_breakdown || {};
  const riskBreakdownRows = [
    { label: 'Document Risk', value: breakdown.document || 0 },
    { label: 'Identity Risk', value: breakdown.identity || 0 },
    { label: 'Travel Risk', value: breakdown.travel || 0 },
    { label: 'Financial Risk', value: breakdown.financial || 0 },
    { label: 'Network Risk', value: breakdown.network || 0 },
    { label: 'Digital Footprint', value: breakdown.digitalFootprint || 0 },
  ];

  const tabClass = (tab: string) =>
    `px-4 py-2 text-xs font-semibold border-b-2 transition-colors duration-150 cursor-pointer ${
      activeTab === tab ? '' : 'border-transparent'
    }`;

  // Adapt for SocialGraph — create a compat object
  const caseCompat = {
    ...caseData,
    caseId: caseData.case_id,
    riskLevel: caseData.risk_level,
    riskScore: caseData.risk_score,
    osintFindings: (caseData.findings || []).map(f => ({
      ...f,
      riskImpact: f.risk_impact,
    })),
  };

  return (
    <div className="space-y-4">
      {confirmDialog && (
        <V3ConfirmDialog
          open={true}
          title={confirmDialog.type === 'approve' ? 'Approve Case' : confirmDialog.type === 'reject' ? 'Reject Case' : 'Escalate Case'}
          description={
            confirmDialog.type === 'approve'
              ? `Are you sure you want to approve case ${caseData.case_id}?`
              : confirmDialog.type === 'reject'
              ? `Are you sure you want to reject case ${caseData.case_id}?`
              : `Are you sure you want to escalate case ${caseData.case_id} to a supervisor?`
          }
          confirmLabel={confirmDialog.type === 'approve' ? 'Approve' : confirmDialog.type === 'reject' ? 'Reject' : 'Escalate'}
          confirmColor={confirmDialog.type === 'approve' ? 'var(--v3-green)' : confirmDialog.type === 'reject' ? 'var(--v3-red)' : 'var(--v3-amber)'}
          onConfirm={confirmAction}
          onCancel={() => setConfirmDialog(null)}
        />
      )}

      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/v3/cases')} className="p-2 rounded-xl border transition-colors hover:bg-white/5" style={{ borderColor: 'var(--v3-border)', color: 'var(--v3-text-secondary)' }}>
            <ArrowLeft size={16} />
          </button>
          <span className="font-mono text-sm font-bold" style={{ color: 'var(--v3-text)' }}>{caseData.case_id}</span>
          <RiskBadge level={caseData.risk_level as any} className="text-xs px-3 py-1" />
          <StatusBadge status={caseData.status as any} />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleAction('approve')} className="px-4 py-2.5 rounded-xl text-xs font-semibold transition-opacity hover:opacity-90" style={{ background: 'var(--v3-green)', color: 'var(--v3-text-dark)' }}>Approve</button>
          <button onClick={() => handleAction('reject')} className="px-4 py-2.5 rounded-xl text-xs font-semibold transition-opacity hover:opacity-90" style={{ background: 'var(--v3-red)', color: 'white' }}>Reject</button>
          <button onClick={() => handleAction('escalate')} className="px-4 py-2.5 rounded-xl text-xs font-semibold transition-opacity hover:opacity-90" style={{ background: 'var(--v3-amber-muted)', color: 'var(--v3-amber)' }}>Escalate</button>
        </div>
      </div>

      {/* Three-column layout */}
      <div className="grid grid-cols-[280px_1fr_320px] gap-4">
        {/* LEFT COLUMN */}
        <div className="space-y-4">
          <div className="rounded-xl border p-5" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold" style={{ background: 'var(--v3-accent-muted)', color: 'var(--v3-accent)' }}>
                {caseData.applicant.firstName?.[0]}{caseData.applicant.lastName?.[0]}
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--v3-text)' }}>{caseData.applicant.firstName} {caseData.applicant.lastName}</div>
                <div className="text-[11px] flex items-center gap-1" style={{ color: 'var(--v3-text-muted)' }}>{nationalityFlags[caseData.applicant.nationality] || ''} {caseData.applicant.nationality}</div>
              </div>
            </div>
            {[
              ['DOB', caseData.applicant.dateOfBirth],
              ['Gender', caseData.applicant.gender === 'M' || caseData.applicant.gender === 'male' ? 'Male' : 'Female'],
              ['Passport', caseData.applicant.passportNumber],
              ['Destination', caseData.travel_destination],
              ['Consulate', caseData.consulate_location],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-1.5 border-t" style={{ borderColor: 'var(--v3-border)' }}>
                <span className="text-[11px]" style={{ color: 'var(--v3-text-muted)' }}>{label}</span>
                <span className={`text-[11px] ${label === 'Passport' ? 'font-mono' : ''}`} style={{ color: 'var(--v3-text)' }}>{value}</span>
              </div>
            ))}
          </div>

          <div className="border rounded-md p-4" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
            <div className="text-[11px] font-semibold mb-3 tracking-wide" style={{ color: 'var(--v3-text-muted)' }}>DOCUMENTS</div>
            {(caseData.documents || []).map(doc => (
              <div key={doc.id} className="flex items-center gap-2 py-2 border-t cursor-pointer transition-colors hover:bg-white/[0.03] px-1 rounded" style={{ borderColor: 'var(--v3-border)' }}>
                {ocrIcon(doc.ocr_status)}
                <span className="text-xs flex-1" style={{ color: 'var(--v3-text-secondary)' }}>{doc.name}</span>
                <ChevronRight size={12} style={{ color: 'var(--v3-text-muted)' }} />
              </div>
            ))}
          </div>

          <div className="border rounded-md p-4 grid grid-cols-3 gap-3" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
            {[
              { label: 'Profiles', value: (caseData.findings || []).filter(f => f.category === 'social_media').length },
              { label: 'Signals', value: (caseData.findings || []).length },
              { label: 'Documents', value: (caseData.documents || []).length },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-lg font-bold font-mono" style={{ color: 'var(--v3-text)' }}>{s.value}</div>
                <div className="text-[10px]" style={{ color: 'var(--v3-text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER COLUMN */}
        <div className="border rounded-md overflow-hidden" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
          <div className="flex border-b" style={{ borderColor: 'var(--v3-border)' }}>
            {(['findings', 'graph', 'timeline', 'documents'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={tabClass(tab)}
                style={{ color: activeTab === tab ? 'var(--v3-accent)' : 'var(--v3-text-muted)', borderBottomColor: activeTab === tab ? 'var(--v3-accent)' : 'transparent' }}>
                {tab === 'findings' ? 'OSINT Findings' : tab === 'graph' ? 'Social Graph' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="p-4 max-h-[calc(100vh-220px)] overflow-y-auto v3-scrollbar">
            {activeTab === 'findings' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {(['all', 'high', 'medium'] as const).map(f => (
                    <button key={f} onClick={() => setFindingFilter(f)} className="px-3 py-1 rounded-md text-[11px] font-medium transition-colors"
                      style={{ background: findingFilter === f ? 'var(--v3-accent-muted)' : 'transparent', color: findingFilter === f ? 'var(--v3-accent)' : 'var(--v3-text-muted)' }}>
                      {f === 'all' ? 'All' : f === 'high' ? 'High Only' : 'Medium+'}
                    </button>
                  ))}
                </div>
                {Object.entries(groupedFindings).map(([cat, findings]) => {
                  const CatIcon = categoryIcons[cat] || Globe;
                  const isExpanded = expandedCategories.has(cat);
                  return (
                    <div key={cat}>
                      <button onClick={() => toggleCategory(cat)} className="flex items-center gap-2 w-full text-left py-2">
                        {isExpanded ? <ChevronDown size={14} style={{ color: 'var(--v3-text-muted)' }} /> : <ChevronRight size={14} style={{ color: 'var(--v3-text-muted)' }} />}
                        <CatIcon size={14} style={{ color: 'var(--v3-accent)' }} />
                        <span className="text-xs font-semibold" style={{ color: 'var(--v3-text)' }}>{categoryLabels[cat] || cat}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: 'var(--v3-accent-muted)', color: 'var(--v3-accent)' }}>{findings.length}</span>
                      </button>
                      {isExpanded && (
                        <div className="space-y-2 ml-6 mb-4">
                          {findings.map(finding => {
                            const SrcIcon = sourceIcons[finding.source] || Globe;
                            const impactColor = finding.risk_impact === 'critical' ? 'var(--v3-red)' : finding.risk_impact === 'high' ? '#F97316' : finding.risk_impact === 'medium' ? 'var(--v3-amber)' : 'var(--v3-green)';
                            return (
                              <div key={finding.id} className="border rounded-md p-3 transition-colors hover:border-[var(--v3-border-hover)]" style={{ borderColor: 'var(--v3-border)', background: 'var(--v3-bg)' }}>
                                <div className="flex items-start gap-2 mb-2">
                                  <SrcIcon size={14} style={{ color: 'var(--v3-accent)', marginTop: 2 }} />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span className="text-xs font-semibold" style={{ color: 'var(--v3-text)' }}>{finding.title}</span>
                                      <RiskBadge level={finding.risk_impact as any} className="text-[9px] px-1.5 py-0" />
                                    </div>
                                    <p className="text-[11px] leading-relaxed" style={{ color: 'var(--v3-text-secondary)' }}>{finding.detail}</p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between mt-2 pt-2 border-t" style={{ borderColor: 'var(--v3-border)' }}>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-mono" style={{ color: 'var(--v3-text-muted)' }}>Confidence: {finding.confidence}%</span>
                                    <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: 'var(--v3-border)' }}>
                                      <div className="h-full rounded-full" style={{ width: `${finding.confidence}%`, background: impactColor }} />
                                    </div>
                                  </div>
                                  {finding.url && (
                                    <a href={finding.url} target="_blank" rel="noopener" className="text-[10px] flex items-center gap-1" style={{ color: 'var(--v3-accent)' }}>
                                      <ExternalLink size={10} /> View Source
                                    </a>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'graph' && <V3SocialGraph caseData={caseCompat as any} />}

            {activeTab === 'timeline' && (
              <div className="space-y-0">
                {(caseData.events || []).map((event, i) => {
                  const EvIcon = eventIcons[event.type] || Clock;
                  const evColor = eventColors[event.type] || 'var(--v3-text-muted)';
                  return (
                    <div key={event.id} className="flex gap-3 relative">
                      <div className="flex flex-col items-center">
                        <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 z-10" style={{ background: `${evColor}20`, border: `1px solid ${evColor}40` }}>
                          <EvIcon size={13} style={{ color: evColor }} />
                        </div>
                        {i < (caseData.events || []).length - 1 && <div className="w-px flex-1 my-1" style={{ background: 'var(--v3-border)' }} />}
                      </div>
                      <div className="pb-4 pt-1 flex-1">
                        <p className="text-xs" style={{ color: 'var(--v3-text)' }}>{event.description}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono" style={{ color: 'var(--v3-text-muted)' }}>{new Date(event.timestamp).toLocaleString()}</span>
                          {event.user_name && <span className="text-[10px]" style={{ color: 'var(--v3-text-muted)' }}>by {event.user_name}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-3">
                {(caseData.documents || []).map(doc => (
                  <div key={doc.id} className="border rounded-md p-4" style={{ borderColor: 'var(--v3-border)', background: 'var(--v3-bg)' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <FileText size={14} style={{ color: 'var(--v3-accent)' }} />
                      <span className="text-xs font-semibold" style={{ color: 'var(--v3-text)' }}>{doc.name}</span>
                      {ocrIcon(doc.ocr_status)}
                      <span className="text-[10px]" style={{ color: 'var(--v3-text-muted)' }}>OCR: {doc.ocr_status}</span>
                    </div>
                    {Object.keys(doc.extracted_fields || {}).length > 0 && (
                      <table className="w-full text-[11px]">
                        <tbody>
                          {Object.entries(doc.extracted_fields).map(([field, value]) => (
                            <tr key={field} style={{ borderTop: '1px solid var(--v3-border)' }}>
                              <td className="py-1.5 pr-4 font-medium" style={{ color: 'var(--v3-text-muted)' }}>{field}</td>
                              <td className="py-1.5 font-mono" style={{ color: 'var(--v3-text)' }}>{value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4">
          <div className="border rounded-md p-4 sticky top-0" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
            <div className="text-[10px] font-semibold tracking-widest mb-4" style={{ color: 'var(--v3-text-muted)' }}>RISK ASSESSMENT</div>
            <div className="flex justify-center mb-4">
              <RiskScoreCircle score={Math.round(caseData.risk_score)} size="lg" />
            </div>
            <div className="space-y-2.5 mb-4">
              {riskBreakdownRows.map(row => {
                const barColor = row.value < 30 ? 'var(--v3-green)' : row.value < 60 ? 'var(--v3-amber)' : row.value < 80 ? '#F97316' : 'var(--v3-red)';
                return (
                  <div key={row.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px]" style={{ color: 'var(--v3-text-secondary)' }}>{row.label}</span>
                      <span className="text-[11px] font-mono font-bold" style={{ color: barColor }}>{row.value}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--v3-border)' }}>
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${row.value}%`, background: barColor }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t pt-3" style={{ borderColor: 'var(--v3-border)' }}>
              <div className="text-[10px] font-semibold tracking-widest mb-2" style={{ color: 'var(--v3-text-muted)' }}>KEY RISK FACTORS</div>
              <ul className="space-y-1.5">
                {(caseData.risk_factors || []).map((factor, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px]" style={{ color: 'var(--v3-text-secondary)' }}>
                    <AlertTriangle size={11} style={{ color: 'var(--v3-amber)', marginTop: 2, flexShrink: 0 }} />
                    {factor}
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t pt-3 mt-3" style={{ borderColor: 'var(--v3-border)' }}>
              <button onClick={() => setRationaleOpen(!rationaleOpen)} className="flex items-center gap-2 w-full text-left">
                {rationaleOpen ? <ChevronDown size={12} style={{ color: 'var(--v3-text-muted)' }} /> : <ChevronRight size={12} style={{ color: 'var(--v3-text-muted)' }} />}
                <span className="text-[10px] font-semibold tracking-widest" style={{ color: 'var(--v3-text-muted)' }}>RISK RATIONALE</span>
              </button>
              {rationaleOpen && (
                <p className="text-[11px] mt-2 leading-relaxed" style={{ color: 'var(--v3-text-secondary)' }}>
                  Based on analysis of {(caseData.findings || []).length} OSINT findings across {Object.keys(groupedFindings).length} categories, this applicant presents a {caseData.risk_level}-risk profile. {(caseData.risk_factors || []).join('. ')}. Score: {Math.round(caseData.risk_score)}/100.
                </p>
              )}
            </div>
          </div>

          <div className="border rounded-md p-4" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
            <div className="text-[10px] font-semibold tracking-widest mb-3" style={{ color: 'var(--v3-text-muted)' }}>ADD NOTE</div>
            <textarea
              className="w-full px-3 py-2 rounded-md border text-xs resize-none outline-none" rows={3} placeholder="Officer notes..."
              style={{ background: 'var(--v3-bg)', borderColor: 'var(--v3-border)', color: 'var(--v3-text)' }}
            />
            <button onClick={() => toast.success('Note added')} className="mt-2 w-full py-1.5 rounded-md text-xs font-semibold" style={{ background: 'var(--v3-accent-muted)', color: 'var(--v3-accent)' }}>Submit Note</button>
          </div>
        </div>
      </div>
    </div>
  );
}
