import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FileText, CheckCircle, Loader2, XCircle, AlertTriangle,
  ExternalLink, ChevronDown, ChevronRight, Search as SearchIcon,
  Instagram, Facebook, Twitter, Globe, Shield, CreditCard, Plane,
  Network, Fingerprint, Clock, User, Upload, Brain, Activity,
  Zap, BookOpen, Link2, Scan, Sparkles
} from 'lucide-react';
import { useV3Case } from '@/api/v3-hooks';
import { v3Cases as casesApi } from '@/api/v3-supabase';
import { nationalityFlags } from '@/data/v3/mockData';
import type { Finding } from '@/api/client';
import { RiskBadge, StatusBadge, RiskScoreCircle } from '@/components/v3/V3Badges';
import { V3SocialGraph } from '@/components/v3/V3SocialGraph';
import { V3ConfirmDialog } from '@/components/v3/V3ConfirmDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const sourceIcons: Record<string, typeof Instagram> = {
  instagram: Instagram, facebook: Facebook, twitter: Twitter,
  tiktok: Globe, linkedin: Globe, strava: Activity,
  public_records: FileText, financial: CreditCard, travel: Plane, darkweb: Shield,
  perplexity: Globe, ai_analysis: Brain,
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

  // New state for intelligence features
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<{ progress: number; status: string; tools: string[] } | null>(null);
  const [narrativeLoading, setNarrativeLoading] = useState(false);
  const [narrative, setNarrative] = useState<string | null>(null);
  const [narrativeGeneratedAt, setNarrativeGeneratedAt] = useState<string | null>(null);
  const [correlations, setCorrelations] = useState<Array<{ case_id: string; match_type: string; detail: string; risk_level: string; shared_attribute: string }> | null>(null);
  const [correlationLoading, setCorrelationLoading] = useState(false);

  // Load persisted narrative on mount
  useEffect(() => {
    if (!id) return;
    supabase
      .from('v3_case_narratives')
      .select('narrative, generated_at')
      .eq('case_id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.narrative) {
          setNarrative(data.narrative);
          setNarrativeGeneratedAt(data.generated_at);
        }
      });
  }, [id]);

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

  // Check for document discrepancies
  const docDiscrepancies = useMemo(() => {
    if (!caseData?.documents || !caseData?.findings) return [];
    const discreps: Array<{ doc: string; field: string; docValue: string; osintValue: string }> = [];
    
    for (const doc of caseData.documents) {
      const fields = doc.extracted_fields || {};
      for (const finding of caseData.findings) {
        if (fields.full_name && finding.category === 'social_media' && finding.detail) {
          const docName = String(fields.full_name).toLowerCase();
          const applicantName = `${caseData.applicant.firstName} ${caseData.applicant.lastName}`.toLowerCase();
          if (docName && applicantName && !docName.includes(applicantName.split(' ')[1]) && doc.type === 'passport') {
            // Only flag if passport name doesn't match
          }
        }
      }
      if (fields.passport_number && caseData.applicant.passportNumber) {
        if (String(fields.passport_number) !== String(caseData.applicant.passportNumber)) {
          discreps.push({
            doc: doc.name,
            field: 'Passport Number',
            docValue: String(fields.passport_number),
            osintValue: String(caseData.applicant.passportNumber),
          });
        }
      }
    }
    return discreps;
  }, [caseData]);

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

  // === INTELLIGENCE ACTIONS ===

  const runDeepScan = async () => {
    setScanning(true);
    setScanProgress({ progress: 5, status: 'Initializing scan…', tools: [] });

    // Start polling for scan progress
    const pollInterval = setInterval(async () => {
      const { data: scans } = await supabase
        .from('v3_osint_scans')
        .select('progress, status, tools_used')
        .eq('case_id', caseData.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (scans && scans.length > 0) {
        const scan = scans[0];
        const tools = (scan.tools_used as string[]) || [];
        const prog = scan.progress || 0;
        const stages = [
          { at: 10, label: 'Creating scan record…' },
          { at: 30, label: 'Perplexity web search…' },
          { at: 50, label: 'AI deep analysis…' },
          { at: 80, label: 'Processing findings…' },
          { at: 100, label: 'Complete' },
        ];
        const stage = [...stages].reverse().find(s => prog >= s.at) || stages[0];
        setScanProgress({ progress: prog, status: stage.label, tools });
        if (scan.status === 'completed' || scan.status === 'failed') {
          clearInterval(pollInterval);
        }
      }
    }, 1500);

    try {
      const { data, error } = await supabase.functions.invoke('case-osint-scan', {
        body: { case_id: caseData.id },
      });
      clearInterval(pollInterval);
      if (error) throw error;
      setScanProgress({ progress: 100, status: 'Complete', tools: data.tools_used || [] });
      toast.success(`Deep scan complete: ${data.findings_count} new findings`);
      refetch();
      // Auto-dismiss after 3s
      setTimeout(() => setScanProgress(null), 3000);
    } catch (e: any) {
      clearInterval(pollInterval);
      setScanProgress(null);
      toast.error(e.message || 'Scan failed');
    } finally {
      setScanning(false);
    }
  };

  const generateNarrative = async () => {
    setNarrativeLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('case-ai-narrative', {
        body: { case_id: caseData.id, action: 'narrative' },
      });
      if (error) throw error;
      const now = new Date().toISOString();
      setNarrative(data.narrative);
      setNarrativeGeneratedAt(now);
      // Persist to database (upsert)
      await supabase.from('v3_case_narratives').upsert(
        { case_id: caseData.id, narrative: data.narrative, generated_at: new Date().toISOString() },
        { onConflict: 'case_id' }
      );
      toast.success('AI narrative generated & saved');
    } catch (e: any) {
      toast.error(e.message || 'Narrative generation failed');
    } finally {
      setNarrativeLoading(false);
    }
  };

  const runCorrelation = async () => {
    setCorrelationLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('case-ai-narrative', {
        body: { case_id: caseData.id, action: 'correlate' },
      });
      if (error) throw error;
      setCorrelations(data.correlations);
      if (data.correlations.length === 0) {
        toast.info('No cross-case correlations found');
      } else {
        toast.success(`${data.correlations.length} correlations found`);
      }
    } catch (e: any) {
      toast.error(e.message || 'Correlation failed');
    } finally {
      setCorrelationLoading(false);
    }
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

  const matchTypeLabels: Record<string, string> = {
    same_origin_consulate: 'Same Origin + Consulate',
    shared_surname: 'Shared Surname',
    same_travel_pattern: 'Same Travel Pattern',
    shared_financial_institution: 'Shared Financial Institution',
  };

  const matchTypeColors: Record<string, string> = {
    same_origin_consulate: 'var(--v3-accent)',
    shared_surname: 'var(--v3-amber)',
    same_travel_pattern: 'var(--v3-green)',
    shared_financial_institution: '#F97316',
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
          {/* Intelligence Actions */}
          <button
            onClick={runDeepScan}
            disabled={scanning}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all hover:border-[var(--v3-accent)]"
            style={{ borderColor: 'var(--v3-border)', color: scanning ? 'var(--v3-text-muted)' : 'var(--v3-accent)', background: 'var(--v3-surface)' }}
          >
            {scanning ? <Loader2 size={13} className="animate-spin" /> : <Scan size={13} />}
            {scanning ? 'Scanning...' : 'Deep Scan'}
          </button>
          <button
            onClick={generateNarrative}
            disabled={narrativeLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all hover:border-[var(--v3-accent)]"
            style={{ borderColor: 'var(--v3-border)', color: narrativeLoading ? 'var(--v3-text-muted)' : 'var(--v3-accent)', background: 'var(--v3-surface)' }}
          >
            {narrativeLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
            {narrativeLoading ? 'Generating...' : 'AI Brief'}
          </button>
          <button
            onClick={runCorrelation}
            disabled={correlationLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all hover:border-[var(--v3-accent)]"
            style={{ borderColor: 'var(--v3-border)', color: correlationLoading ? 'var(--v3-text-muted)' : 'var(--v3-accent)', background: 'var(--v3-surface)' }}
          >
            {correlationLoading ? <Loader2 size={13} className="animate-spin" /> : <Link2 size={13} />}
            {correlationLoading ? 'Correlating...' : 'X-Case'}
          </button>

          <div className="w-px h-6 mx-1" style={{ background: 'var(--v3-border)' }} />

          <button onClick={() => handleAction('approve')} className="px-4 py-2.5 rounded-xl text-xs font-semibold transition-opacity hover:opacity-90" style={{ background: 'var(--v3-green)', color: 'var(--v3-text-dark)' }}>Approve</button>
          <button onClick={() => handleAction('reject')} className="px-4 py-2.5 rounded-xl text-xs font-semibold transition-opacity hover:opacity-90" style={{ background: 'var(--v3-red)', color: 'white' }}>Reject</button>
          <button onClick={() => handleAction('escalate')} className="px-4 py-2.5 rounded-xl text-xs font-semibold transition-opacity hover:opacity-90" style={{ background: 'var(--v3-amber-muted)', color: 'var(--v3-amber)' }}>Escalate</button>
        </div>
      </div>

      {/* Scan Progress Indicator */}
      {scanProgress && (
        <div className="rounded-xl border p-4 overflow-hidden relative" style={{ background: 'var(--v3-surface)', borderColor: scanProgress.progress === 100 ? 'var(--v3-green)' : 'var(--v3-accent)', borderWidth: '1px' }}>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              {scanProgress.progress < 100 ? (
                <Loader2 size={14} className="animate-spin" style={{ color: 'var(--v3-accent)' }} />
              ) : (
                <CheckCircle size={14} style={{ color: 'var(--v3-green)' }} />
              )}
              <span className="text-[10px] font-semibold tracking-widest" style={{ color: scanProgress.progress === 100 ? 'var(--v3-green)' : 'var(--v3-accent)' }}>
                DEEP OSINT SCAN
              </span>
            </div>
            <span className="text-xs font-mono font-bold" style={{ color: scanProgress.progress === 100 ? 'var(--v3-green)' : 'var(--v3-text)' }}>
              {scanProgress.progress}%
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full overflow-hidden mb-2.5" style={{ background: 'var(--v3-border)' }}>
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${scanProgress.progress}%`,
                background: scanProgress.progress === 100
                  ? 'var(--v3-green)'
                  : 'linear-gradient(90deg, var(--v3-accent), #818cf8)',
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px]" style={{ color: 'var(--v3-text-secondary)' }}>
              {scanProgress.status}
            </span>
            {scanProgress.tools.length > 0 && (
              <div className="flex items-center gap-1.5">
                {scanProgress.tools.map(tool => (
                  <span key={tool} className="text-[9px] px-1.5 py-0.5 rounded-md font-medium" style={{ background: 'var(--v3-accent-muted)', color: 'var(--v3-accent)' }}>
                    {tool}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}


      {narrative && (
        <div className="rounded-xl border p-5 relative" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-accent)', borderWidth: '1px' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={14} style={{ color: 'var(--v3-accent)' }} />
              <span className="text-[10px] font-semibold tracking-widest" style={{ color: 'var(--v3-accent)' }}>AI INTELLIGENCE BRIEF</span>
            </div>
            <button onClick={() => setNarrative(null)} className="text-[10px] px-2 py-1 rounded-lg hover:bg-white/5" style={{ color: 'var(--v3-text-muted)' }}>Dismiss</button>
          </div>
          <div className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--v3-text-secondary)' }}>
            {narrative}
          </div>
        </div>
      )}

      {/* Cross-Case Correlations Panel */}
      {correlations && correlations.length > 0 && (
        <div className="rounded-xl border p-5" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-amber)', borderWidth: '1px' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Link2 size={14} style={{ color: 'var(--v3-amber)' }} />
              <span className="text-[10px] font-semibold tracking-widest" style={{ color: 'var(--v3-amber)' }}>CROSS-CASE CORRELATIONS ({correlations.length})</span>
            </div>
            <button onClick={() => setCorrelations(null)} className="text-[10px] px-2 py-1 rounded-lg hover:bg-white/5" style={{ color: 'var(--v3-text-muted)' }}>Dismiss</button>
          </div>
          <div className="space-y-2">
            {correlations.map((corr, i) => (
              <button
                key={i}
                onClick={async () => {
                  const { data } = await supabase.from('v3_cases').select('id').eq('case_id', corr.case_id).limit(1).single();
                  if (data) navigate(`/v3/cases/${data.id}`);
                  else toast.error(`Case ${corr.case_id} not found`);
                }}
                className="w-full flex items-center justify-between py-2 px-3 rounded-lg border transition-all hover:border-[var(--v3-accent)] cursor-pointer group"
                style={{ borderColor: 'var(--v3-border)', background: 'var(--v3-bg)' }}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold group-hover:underline" style={{ color: 'var(--v3-accent)' }}>{corr.case_id}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${matchTypeColors[corr.match_type] || 'var(--v3-accent)'}20`, color: matchTypeColors[corr.match_type] || 'var(--v3-accent)' }}>
                    {matchTypeLabels[corr.match_type] || corr.match_type}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px]" style={{ color: 'var(--v3-text-secondary)' }}>{corr.detail}</span>
                  <RiskBadge level={corr.risk_level as any} className="text-[9px] px-1.5 py-0" />
                  <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--v3-accent)' }} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

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

          <div className="rounded-xl border p-5" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
            <div className="text-[10px] font-semibold mb-3 tracking-[0.15em]" style={{ color: 'var(--v3-text-muted)' }}>DOCUMENTS</div>
            {(caseData.documents || []).map(doc => (
              <div key={doc.id} className="flex items-center gap-2 py-2 border-t cursor-pointer transition-colors hover:bg-white/[0.03] px-1 rounded" style={{ borderColor: 'var(--v3-border)' }}>
                {ocrIcon(doc.ocr_status)}
                <span className="text-xs flex-1" style={{ color: 'var(--v3-text-secondary)' }}>{doc.name}</span>
                <ChevronRight size={12} style={{ color: 'var(--v3-text-muted)' }} />
              </div>
            ))}
          </div>

          {/* Document Discrepancies */}
          {docDiscrepancies.length > 0 && (
            <div className="rounded-xl border p-5" style={{ background: 'rgba(239,68,68,0.05)', borderColor: 'var(--v3-red)' }}>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={13} style={{ color: 'var(--v3-red)' }} />
                <span className="text-[10px] font-semibold tracking-widest" style={{ color: 'var(--v3-red)' }}>DOC DISCREPANCIES</span>
              </div>
              {docDiscrepancies.map((d, i) => (
                <div key={i} className="text-[11px] py-1.5 border-t" style={{ borderColor: 'var(--v3-border)', color: 'var(--v3-text-secondary)' }}>
                  <span className="font-semibold" style={{ color: 'var(--v3-red)' }}>{d.field}</span>: Doc says <span className="font-mono">{d.docValue}</span>, profile says <span className="font-mono">{d.osintValue}</span>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-xl border p-5 grid grid-cols-3 gap-3" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
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
        <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
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
                              <div key={finding.id} className="rounded-xl border p-4 transition-colors hover:border-[var(--v3-border-hover)]" style={{ borderColor: 'var(--v3-border)', background: 'var(--v3-bg)' }}>
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
                        <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 z-10" style={{ background: `${evColor}20`, border: `1px solid ${evColor}40` }}>
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
                  <div key={doc.id} className="rounded-xl border p-5" style={{ borderColor: 'var(--v3-border)', background: 'var(--v3-bg)' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <FileText size={14} style={{ color: 'var(--v3-accent)' }} />
                      <span className="text-xs font-semibold" style={{ color: 'var(--v3-text)' }}>{doc.name}</span>
                      {ocrIcon(doc.ocr_status)}
                      <span className="text-[10px]" style={{ color: 'var(--v3-text-muted)' }}>OCR: {doc.ocr_status}</span>
                    </div>
                    {Object.keys(doc.extracted_fields || {}).length > 0 && (
                      <table className="w-full text-[11px]">
                        <tbody>
                          {Object.entries(doc.extracted_fields).map(([field, value]) => {
                            // Check if this field has a discrepancy
                            const hasDiscrepancy = docDiscrepancies.some(d => d.doc === doc.name && d.field.toLowerCase().replace(' ', '_') === field.toLowerCase().replace(' ', '_'));
                            return (
                              <tr key={field} style={{ borderTop: '1px solid var(--v3-border)' }}>
                                <td className="py-1.5 pr-4 font-medium" style={{ color: 'var(--v3-text-muted)' }}>{field}</td>
                                <td className="py-1.5 font-mono flex items-center gap-2" style={{ color: hasDiscrepancy ? 'var(--v3-red)' : 'var(--v3-text)' }}>
                                  {value}
                                  {hasDiscrepancy && <AlertTriangle size={11} style={{ color: 'var(--v3-red)' }} />}
                                </td>
                              </tr>
                            );
                          })}
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
          <div className="rounded-xl border p-5 sticky top-0" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
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

          <div className="rounded-xl border p-5" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
            <div className="text-[10px] font-semibold tracking-[0.15em] mb-3" style={{ color: 'var(--v3-text-muted)' }}>ADD NOTE</div>
            <textarea
              className="w-full px-3.5 py-2.5 rounded-xl border text-xs resize-none outline-none transition-colors focus:border-[var(--v3-accent)]" rows={3} placeholder="Officer notes..."
              style={{ background: 'var(--v3-bg)', borderColor: 'var(--v3-border)', color: 'var(--v3-text)' }}
            />
            <button onClick={() => toast.success('Note added')} className="mt-3 w-full py-2 rounded-xl text-xs font-semibold transition-opacity hover:opacity-90" style={{ background: 'var(--v3-accent-muted)', color: 'var(--v3-accent)' }}>Submit Note</button>
          </div>
        </div>
      </div>
    </div>
  );
}
