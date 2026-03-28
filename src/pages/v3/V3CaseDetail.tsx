import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FileText, CheckCircle, Loader2, XCircle, AlertTriangle,
  ExternalLink, ChevronDown, ChevronRight, Search as SearchIcon,
  Instagram, Facebook, Twitter, Globe, Shield, CreditCard, Plane,
  Network, Fingerprint, Clock, User, Upload, Brain, Activity
} from 'lucide-react';
import { v3Cases, nationalityFlags } from '@/data/v3/mockData';
import type { OsintFinding, CaseEvent } from '@/data/v3/mockData';
import { RiskBadge, StatusBadge, RiskScoreCircle } from '@/components/v3/V3Badges';

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
  const [activeTab, setActiveTab] = useState<'findings' | 'graph' | 'timeline' | 'documents'>('findings');
  const [findingFilter, setFindingFilter] = useState<'all' | 'high' | 'medium'>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['social_media', 'financial', 'public_records', 'network', 'digital_footprint', 'travel']));

  const caseData = v3Cases.find(c => c.id === id);

  const groupedFindings = useMemo(() => {
    if (!caseData) return {};
    let findings = caseData.osintFindings;
    let findings = caseData.osintFindings;
    if (findingFilter === 'high') findings = findings.filter(f => f.riskImpact === 'high' || f.riskImpact === 'critical');
    if (findingFilter === 'medium') findings = findings.filter(f => f.riskImpact !== 'none' && f.riskImpact !== 'low');
    const groups: Record<string, OsintFinding[]> = {};
    findings.forEach(f => {
      if (!groups[f.category]) groups[f.category] = [];
      groups[f.category].push(f);
    });
    return groups;
  }, [caseData.osintFindings, findingFilter]);

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

  const riskBreakdownRows = [
    { label: 'Document Risk', value: caseData.riskBreakdown.document },
    { label: 'Identity Risk', value: caseData.riskBreakdown.identity },
    { label: 'Travel Risk', value: caseData.riskBreakdown.travel },
    { label: 'Financial Risk', value: caseData.riskBreakdown.financial },
    { label: 'Network Risk', value: caseData.riskBreakdown.network },
    { label: 'Digital Footprint', value: caseData.riskBreakdown.digitalFootprint },
  ];

  const tabClass = (tab: string) =>
    `px-4 py-2 text-xs font-semibold border-b-2 transition-colors duration-150 cursor-pointer ${
      activeTab === tab ? '' : 'border-transparent'
    }`;

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/v3/cases')}
            className="p-1.5 rounded-md border transition-colors hover:bg-white/5"
            style={{ borderColor: 'var(--v3-border)', color: 'var(--v3-text-secondary)' }}
          >
            <ArrowLeft size={16} />
          </button>
          <span className="font-mono text-sm font-bold" style={{ color: 'var(--v3-text)' }}>{caseData.caseId}</span>
          <RiskBadge level={caseData.riskLevel} className="text-xs px-3 py-1" />
          <StatusBadge status={caseData.status} />
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 rounded-md text-xs font-semibold" style={{ background: 'var(--v3-green)', color: 'var(--v3-text-dark)' }}>Approve</button>
          <button className="px-4 py-2 rounded-md text-xs font-semibold" style={{ background: 'var(--v3-red)', color: 'white' }}>Reject</button>
          <button className="px-4 py-2 rounded-md text-xs font-semibold" style={{ background: 'var(--v3-amber-muted)', color: 'var(--v3-amber)' }}>Escalate</button>
          <button className="px-4 py-2 rounded-md text-xs font-semibold border" style={{ borderColor: 'var(--v3-border)', color: 'var(--v3-text-secondary)' }}>Request Info</button>
        </div>
      </div>

      {/* Three-column layout */}
      <div className="grid grid-cols-[280px_1fr_320px] gap-4">
        {/* LEFT COLUMN */}
        <div className="space-y-4">
          {/* Applicant Card */}
          <div
            className="border rounded-md p-4"
            style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-md flex items-center justify-center text-lg font-bold"
                style={{ background: 'var(--v3-accent-muted)', color: 'var(--v3-accent)' }}
              >
                {caseData.applicant.firstName[0]}{caseData.applicant.lastName[0]}
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--v3-text)' }}>
                  {caseData.applicant.firstName} {caseData.applicant.lastName}
                </div>
                <div className="text-[11px] flex items-center gap-1" style={{ color: 'var(--v3-text-muted)' }}>
                  {nationalityFlags[caseData.applicant.nationality]} {caseData.applicant.nationality}
                </div>
              </div>
            </div>
            {[
              ['DOB', caseData.applicant.dateOfBirth],
              ['Gender', caseData.applicant.gender === 'M' ? 'Male' : 'Female'],
              ['Passport', caseData.applicant.passportNumber],
              ['Destination', `${nationalityFlags[caseData.travelDestination] || ''} ${caseData.travelDestination}`],
              ['Consulate', caseData.consulateLocation],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-1.5 border-t" style={{ borderColor: 'var(--v3-border)' }}>
                <span className="text-[11px]" style={{ color: 'var(--v3-text-muted)' }}>{label}</span>
                <span className={`text-[11px] ${label === 'Passport' ? 'font-mono' : ''}`} style={{ color: 'var(--v3-text)' }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Documents */}
          <div
            className="border rounded-md p-4"
            style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
          >
            <div className="text-[11px] font-semibold mb-3 tracking-wide" style={{ color: 'var(--v3-text-muted)' }}>DOCUMENTS</div>
            {caseData.documents.map(doc => (
              <div
                key={doc.id}
                className="flex items-center gap-2 py-2 border-t cursor-pointer transition-colors hover:bg-white/[0.03] px-1 rounded"
                style={{ borderColor: 'var(--v3-border)' }}
              >
                {ocrIcon(doc.ocrStatus)}
                <span className="text-xs flex-1" style={{ color: 'var(--v3-text-secondary)' }}>{doc.name}</span>
                <ChevronRight size={12} style={{ color: 'var(--v3-text-muted)' }} />
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div
            className="border rounded-md p-4 grid grid-cols-3 gap-3"
            style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
          >
            {[
              { label: 'Profiles', value: caseData.osintFindings.filter(f => f.category === 'social_media').length },
              { label: 'Signals', value: caseData.osintFindings.length },
              { label: 'Connections', value: Math.floor(Math.random() * 8) + 2 },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-lg font-bold font-mono" style={{ color: 'var(--v3-text)' }}>{s.value}</div>
                <div className="text-[10px]" style={{ color: 'var(--v3-text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER COLUMN */}
        <div
          className="border rounded-md overflow-hidden"
          style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
        >
          {/* Tabs */}
          <div className="flex border-b" style={{ borderColor: 'var(--v3-border)' }}>
            {(['findings', 'graph', 'timeline', 'documents'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={tabClass(tab)}
                style={{
                  color: activeTab === tab ? 'var(--v3-accent)' : 'var(--v3-text-muted)',
                  borderBottomColor: activeTab === tab ? 'var(--v3-accent)' : 'transparent',
                }}
              >
                {tab === 'findings' ? 'OSINT Findings' : tab === 'graph' ? 'Social Graph' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="p-4 max-h-[calc(100vh-220px)] overflow-y-auto v3-scrollbar">
            {/* FINDINGS TAB */}
            {activeTab === 'findings' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {(['all', 'high', 'medium'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFindingFilter(f)}
                      className="px-3 py-1 rounded-md text-[11px] font-medium transition-colors"
                      style={{
                        background: findingFilter === f ? 'var(--v3-accent-muted)' : 'transparent',
                        color: findingFilter === f ? 'var(--v3-accent)' : 'var(--v3-text-muted)',
                      }}
                    >
                      {f === 'all' ? 'All' : f === 'high' ? 'High Only' : 'Medium+'}
                    </button>
                  ))}
                </div>

                {Object.entries(groupedFindings).map(([cat, findings]) => {
                  const CatIcon = categoryIcons[cat] || Globe;
                  const isExpanded = expandedCategories.has(cat);
                  return (
                    <div key={cat}>
                      <button
                        onClick={() => toggleCategory(cat)}
                        className="flex items-center gap-2 w-full text-left py-2"
                      >
                        {isExpanded ? <ChevronDown size={14} style={{ color: 'var(--v3-text-muted)' }} /> : <ChevronRight size={14} style={{ color: 'var(--v3-text-muted)' }} />}
                        <CatIcon size={14} style={{ color: 'var(--v3-accent)' }} />
                        <span className="text-xs font-semibold" style={{ color: 'var(--v3-text)' }}>
                          {categoryLabels[cat] || cat}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: 'var(--v3-accent-muted)', color: 'var(--v3-accent)' }}>
                          {findings.length}
                        </span>
                      </button>
                      {isExpanded && (
                        <div className="space-y-2 ml-6 mb-4">
                          {findings.map(finding => {
                            const SrcIcon = sourceIcons[finding.source] || Globe;
                            const impactColor = finding.riskImpact === 'critical' ? 'var(--v3-red)' : finding.riskImpact === 'high' ? '#F97316' : finding.riskImpact === 'medium' ? 'var(--v3-amber)' : 'var(--v3-green)';
                            return (
                              <div
                                key={finding.id}
                                className="border rounded-md p-3 transition-colors hover:border-[var(--v3-border-hover)]"
                                style={{ borderColor: 'var(--v3-border)', background: 'var(--v3-bg)' }}
                              >
                                <div className="flex items-start gap-2 mb-2">
                                  <SrcIcon size={14} style={{ color: 'var(--v3-accent)', marginTop: 2 }} />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span className="text-xs font-semibold" style={{ color: 'var(--v3-text)' }}>{finding.title}</span>
                                      <RiskBadge level={finding.riskImpact as any} className="text-[9px] px-1.5 py-0" />
                                    </div>
                                    <p className="text-[11px] leading-relaxed" style={{ color: 'var(--v3-text-secondary)' }}>{finding.detail}</p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between mt-2 pt-2 border-t" style={{ borderColor: 'var(--v3-border)' }}>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-mono" style={{ color: 'var(--v3-text-muted)' }}>
                                      Confidence: {finding.confidence}%
                                    </span>
                                    <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: 'var(--v3-border)' }}>
                                      <div className="h-full rounded-full" style={{ width: `${finding.confidence}%`, background: impactColor }} />
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button className="text-[10px] flex items-center gap-1" style={{ color: 'var(--v3-accent)' }}>
                                      <ExternalLink size={10} /> View Source
                                    </button>
                                  </div>
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

            {/* GRAPH TAB */}
            {activeTab === 'graph' && (
              <div className="flex items-center justify-center h-96 border rounded-md" style={{ borderColor: 'var(--v3-border)', background: 'var(--v3-bg)' }}>
                <div className="text-center">
                  <Network size={40} style={{ color: 'var(--v3-text-muted)' }} className="mx-auto mb-3" />
                  <p className="text-xs" style={{ color: 'var(--v3-text-muted)' }}>Social graph visualization</p>
                  <p className="text-[10px] mt-1" style={{ color: 'var(--v3-text-muted)' }}>Interactive force-directed graph</p>
                </div>
              </div>
            )}

            {/* TIMELINE TAB */}
            {activeTab === 'timeline' && (
              <div className="space-y-0">
                {caseData.timeline.map((event, i) => {
                  const EvIcon = eventIcons[event.type] || Clock;
                  const evColor = eventColors[event.type] || 'var(--v3-text-muted)';
                  return (
                    <div key={event.id} className="flex gap-3 relative">
                      {/* Line */}
                      <div className="flex flex-col items-center">
                        <div
                          className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 z-10"
                          style={{ background: `${evColor}20`, border: `1px solid ${evColor}40` }}
                        >
                          <EvIcon size={13} style={{ color: evColor }} />
                        </div>
                        {i < caseData.timeline.length - 1 && (
                          <div className="w-px flex-1 my-1" style={{ background: 'var(--v3-border)' }} />
                        )}
                      </div>
                      <div className="pb-4 pt-1 flex-1">
                        <p className="text-xs" style={{ color: 'var(--v3-text)' }}>{event.description}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono" style={{ color: 'var(--v3-text-muted)' }}>
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                          {event.user && (
                            <span className="text-[10px]" style={{ color: 'var(--v3-text-muted)' }}>by {event.user}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* DOCUMENTS TAB */}
            {activeTab === 'documents' && (
              <div className="space-y-3">
                {caseData.documents.map(doc => (
                  <div
                    key={doc.id}
                    className="border rounded-md p-4"
                    style={{ borderColor: 'var(--v3-border)', background: 'var(--v3-bg)' }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <FileText size={14} style={{ color: 'var(--v3-accent)' }} />
                      <span className="text-xs font-semibold" style={{ color: 'var(--v3-text)' }}>{doc.name}</span>
                      {ocrIcon(doc.ocrStatus)}
                      <span className="text-[10px]" style={{ color: 'var(--v3-text-muted)' }}>
                        OCR: {doc.ocrStatus}
                      </span>
                    </div>
                    {Object.keys(doc.extractedFields).length > 0 && (
                      <table className="w-full text-[11px]">
                        <tbody>
                          {Object.entries(doc.extractedFields).map(([field, value]) => (
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
          {/* Risk Assessment */}
          <div
            className="border rounded-md p-4 sticky top-0"
            style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
          >
            <div className="text-[10px] font-semibold tracking-widest mb-4" style={{ color: 'var(--v3-text-muted)' }}>RISK ASSESSMENT</div>
            <div className="flex justify-center mb-4">
              <RiskScoreCircle score={caseData.riskScore} size="lg" />
            </div>

            {/* Category breakdown */}
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

            {/* Key Risk Factors */}
            <div className="border-t pt-3" style={{ borderColor: 'var(--v3-border)' }}>
              <div className="text-[10px] font-semibold tracking-widest mb-2" style={{ color: 'var(--v3-text-muted)' }}>KEY RISK FACTORS</div>
              <ul className="space-y-1.5">
                {caseData.riskFactors.map((factor, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px]" style={{ color: 'var(--v3-text-secondary)' }}>
                    <AlertTriangle size={11} style={{ color: 'var(--v3-amber)', marginTop: 2, flexShrink: 0 }} />
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Case Actions */}
          <div
            className="border rounded-md p-4"
            style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
          >
            <div className="text-[10px] font-semibold tracking-widest mb-3" style={{ color: 'var(--v3-text-muted)' }}>ADD NOTE</div>
            <textarea
              className="w-full px-3 py-2 rounded-md border text-xs resize-none outline-none"
              rows={3}
              placeholder="Officer notes..."
              style={{ background: 'var(--v3-bg)', borderColor: 'var(--v3-border)', color: 'var(--v3-text)' }}
              onFocus={e => e.target.style.borderColor = 'var(--v3-accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--v3-border)'}
            />
            <button
              className="mt-2 w-full py-1.5 rounded-md text-xs font-semibold"
              style={{ background: 'var(--v3-accent-muted)', color: 'var(--v3-accent)' }}
            >
              Submit Note
            </button>
          </div>

          {/* Case History */}
          <div
            className="border rounded-md p-4"
            style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
          >
            <div className="text-[10px] font-semibold tracking-widest mb-3" style={{ color: 'var(--v3-text-muted)' }}>CASE HISTORY</div>
            {caseData.timeline.filter(e => ['reviewed', 'escalated', 'approved', 'rejected', 'created'].includes(e.type)).map(event => (
              <div key={event.id} className="flex items-start gap-2 py-1.5 border-t" style={{ borderColor: 'var(--v3-border)' }}>
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: eventColors[event.type] }} />
                <div>
                  <p className="text-[11px]" style={{ color: 'var(--v3-text-secondary)' }}>{event.description}</p>
                  <span className="text-[9px] font-mono" style={{ color: 'var(--v3-text-muted)' }}>
                    {new Date(event.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
