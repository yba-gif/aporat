import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Shield, Globe, FileSearch, Brain, Users, AlertTriangle,
  Info, ChevronDown, ChevronUp, Clock, CheckCircle, XCircle, Send,
  FileText, Eye, Image, Zap, Network, ExternalLink,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScoreCircle } from '@/components/p2/ScoreCircle';
import { StatusBadge } from '@/components/p2/StatusBadge';
import { cn } from '@/lib/utils';
import ReviewPanel from '@/components/p2/ReviewPanel';

type ReviewDecision = 'approve' | 'deny' | 'escalate';

// ── Types ──
type Severity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface EvidenceItem {
  id: string;
  source: string;
  sourceIcon: typeof Shield;
  severity: Severity;
  summary: string;
  details: string;
  confidence: number;
  raw?: string;
}

interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  icon: typeof Clock;
  color: string;
}

interface Note {
  id: string;
  author: string;
  initials: string;
  time: string;
  text: string;
}

// ── Mock data ──
const CASE = {
  id: 'VIS-2026-1002',
  name: 'Ahmad Rezaei',
  nationality: 'Iran',
  flag: '🇮🇷',
  status: 'FLAGGED' as const,
  riskScore: 87,
  riskLevel: 'CRITICAL',
  dob: '14 March 1988',
  passport: 'IR48291057',
  applicationDate: '28 Feb 2026',
  assignedOfficer: 'Elif Demir',
  subScores: [
    { label: 'Compliance', value: 85 },
    { label: 'Social Network', value: 62 },
    { label: 'Behavioral', value: 71 },
    { label: 'Identity', value: 45 },
    { label: 'Pattern', value: 38 },
  ],
};

const EVIDENCE: EvidenceItem[] = [
  { id: 'e1', source: 'WorldCheck', sourceIcon: Shield, severity: 'HIGH', summary: 'Match found in sanctions-adjacent entity list', details: 'Subject shares a familial connection with an individual listed on the EU Consolidated Sanctions List (Reg. 267/2012). The match is based on surname clustering and geographic proximity analysis. The listed entity is associated with procurement networks linked to restricted dual-use goods.', confidence: 78, raw: '{"match_type":"familial","list":"EU_CONS_267_2012","score":0.78,"entity_ref":"EU-IR-2019-4421"}' },
  { id: 'e2', source: 'OpenSanctions', sourceIcon: Globe, severity: 'MEDIUM', summary: 'Partial name match on OFAC SDN secondary list', details: 'A partial name match (85% fuzzy similarity) was detected against the OFAC Specially Designated Nationals list. The matched entry relates to an Iranian national involved in financial intermediation. Further disambiguation is recommended.', confidence: 65 },
  { id: 'e3', source: 'Social Links', sourceIcon: Users, severity: 'HIGH', summary: 'Connected to flagged social media cluster', details: 'Network analysis of publicly available social media profiles reveals the subject is within 2 degrees of separation from 3 previously flagged applicants. Shared group memberships and interaction patterns suggest coordinated application behavior.', confidence: 72 },
  { id: 'e4', source: 'IP Intelligence', sourceIcon: Zap, severity: 'CRITICAL', summary: 'Application submitted via known VPN endpoint', details: 'The IP address used during application submission (185.x.x.x) is associated with a commercial VPN service frequently used to mask geographic origin. The true origin is estimated to be Tehran, Iran with 91% confidence.', confidence: 91 },
  { id: 'e5', source: 'Document Analysis', sourceIcon: FileSearch, severity: 'MEDIUM', summary: 'Minor inconsistency in passport metadata', details: 'OCR analysis of the submitted passport scan reveals a 2-pixel misalignment in the Machine Readable Zone (MRZ) checksum area. While not conclusive of forgery, this pattern has been observed in 23% of confirmed fraudulent Iranian passports in the last 12 months.', confidence: 58 },
  { id: 'e6', source: 'Travel History', sourceIcon: Globe, severity: 'LOW', summary: 'Recent travel to high-risk jurisdictions', details: 'Passport stamps indicate travel to Iraq (2024-08), Lebanon (2024-11), and Turkey (2025-01, 2025-06). While individual trips are not flagged, the pattern aligns with known facilitation routes.', confidence: 42 },
  { id: 'e7', source: 'Financial Screening', sourceIcon: Shield, severity: 'INFO', summary: 'Bank reference letter verified', details: 'The submitted bank reference from Bank Mellat has been cross-referenced and verified as authentic. Account balance and transaction history are consistent with the stated purpose of travel.', confidence: 95 },
  { id: 'e8', source: 'Biometric Check', sourceIcon: Eye, severity: 'LOW', summary: 'Facial recognition — no prior records', details: 'Facial recognition scan against the Interpol Red Notice database and internal watchlists returned no matches. The biometric template has been stored for future reference.', confidence: 99 },
  { id: 'e9', source: 'AI Pattern Engine', sourceIcon: Brain, severity: 'HIGH', summary: 'Application matches known fraud vector #IR-2024-07', details: 'The combination of VPN usage, document anomaly, and social network proximity closely matches fraud vector IR-2024-07, which was responsible for 12 confirmed fraudulent applications in Q4 2024.', confidence: 81 },
];

const TIMELINE: TimelineEvent[] = [
  { id: 't1', time: '28 Feb 2026 09:14', title: 'Application Submitted', description: 'Online visa application received via portal', icon: FileText, color: 'var(--p2-blue)' },
  { id: 't2', time: '28 Feb 2026 09:15', title: 'Auto-Screening Initiated', description: 'Automated risk assessment pipeline started', icon: Zap, color: 'var(--p2-blue)' },
  { id: 't3', time: '28 Feb 2026 09:16', title: 'WorldCheck Scan Complete', description: 'Familial sanctions match detected (HIGH)', icon: Shield, color: 'var(--p2-red)' },
  { id: 't4', time: '28 Feb 2026 09:16', title: 'OpenSanctions Check', description: 'Partial OFAC SDN match flagged for review', icon: Globe, color: 'var(--p2-orange)' },
  { id: 't5', time: '28 Feb 2026 09:17', title: 'IP Analysis Complete', description: 'VPN endpoint detected — origin masked', icon: Zap, color: 'var(--p2-red)' },
  { id: 't6', time: '28 Feb 2026 09:18', title: 'Document OCR Processing', description: 'Passport scan analyzed — minor MRZ anomaly', icon: FileSearch, color: 'var(--p2-orange)' },
  { id: 't7', time: '28 Feb 2026 09:19', title: 'Social Network Analysis', description: 'Connected to 3 previously flagged applicants', icon: Users, color: 'var(--p2-red)' },
  { id: 't8', time: '28 Feb 2026 09:20', title: 'AI Risk Score Calculated', description: 'Composite risk score: 87/100 (CRITICAL)', icon: Brain, color: 'var(--p2-red)' },
  { id: 't9', time: '28 Feb 2026 09:21', title: 'Case Auto-Flagged', description: 'Escalated to human review queue', icon: AlertTriangle, color: 'var(--p2-red)' },
  { id: 't10', time: '28 Feb 2026 10:05', title: 'Case Assigned', description: 'Assigned to Officer Elif Demir', icon: Users, color: 'var(--p2-blue)' },
  { id: 't11', time: '28 Feb 2026 11:30', title: 'Biometric Check Clear', description: 'No Interpol or watchlist matches', icon: CheckCircle, color: 'var(--p2-green)' },
  { id: 't12', time: '28 Feb 2026 14:15', title: 'Officer Note Added', description: 'Requesting additional documentation', icon: FileText, color: 'var(--p2-gray-500)' },
];

const NOTES: Note[] = [
  { id: 'n1', author: 'Elif Demir', initials: 'ED', time: '28 Feb 14:15', text: 'WorldCheck familial match needs manual verification. Requesting additional documentation from applicant — invitation letter and hotel booking.' },
  { id: 'n2', author: 'Burak Aydın', initials: 'BA', time: '28 Feb 16:42', text: 'Confirmed VPN usage pattern is consistent with recent Iranian applicant cluster. Recommend cross-referencing with cases VIS-2026-0987 and VIS-2026-0993.' },
];

const DOCUMENTS = [
  { name: 'Passport Scan', type: 'image', pages: 1 },
  { name: 'Bank Reference', type: 'pdf', pages: 2 },
  { name: 'Invitation Letter', type: 'pdf', pages: 1 },
  { name: 'Hotel Booking', type: 'pdf', pages: 3 },
  { name: 'Photo ID', type: 'image', pages: 1 },
];

const AI_NARRATIVE = `Ahmad Rezaei presents a composite risk score of 87/100, placing him in the CRITICAL risk tier. The primary risk drivers are threefold:

First, a familial connection to an EU-sanctioned entity was identified through WorldCheck screening (78% confidence). While the subject himself is not directly listed, the familial proximity raises compliance concerns under EU Regulation 267/2012.

Second, the application was submitted through a commercial VPN endpoint, masking the true geographic origin. Our IP intelligence analysis estimates the actual origin to be Tehran, Iran, with 91% confidence. This obfuscation pattern is consistent with known fraud vectors targeting Turkish consular services.

Third, social network analysis reveals the subject is connected to three previously flagged applicants through shared social media group memberships and interaction patterns. This cluster has been under observation since Q3 2024.

The AI Pattern Engine has identified a strong correlation (81% confidence) with fraud vector IR-2024-07, which was responsible for 12 confirmed fraudulent applications in Q4 2024.`;

const AI_FINDINGS = [
  'Familial connection to EU Consolidated Sanctions List entity (Reg. 267/2012)',
  'Application submitted via VPN — true origin estimated as Tehran (91% confidence)',
  'Within 2 degrees of separation from 3 previously flagged applicants',
  'Passport MRZ anomaly detected — consistent with 23% of confirmed fraudulent Iranian passports',
  'Application pattern matches fraud vector IR-2024-07 (81% correlation)',
  'Travel history includes recent visits to Iraq, Lebanon, and Turkey in rapid succession',
  'Bank reference verified as authentic — no financial red flags',
  'No biometric matches in Interpol or internal watchlist databases',
];

// ── Severity styles ──
const SEV: Record<Severity, { bg: string; text: string }> = {
  INFO: { bg: 'bg-[--p2-gray-200]/60', text: 'text-[--p2-gray-600]' },
  LOW: { bg: 'bg-[--p2-blue]/10', text: 'text-[--p2-blue]' },
  MEDIUM: { bg: 'bg-[--p2-orange]/10', text: 'text-[--p2-orange]' },
  HIGH: { bg: 'bg-[--p2-red-light]/10', text: 'text-[--p2-red-light]' },
  CRITICAL: { bg: 'bg-[--p2-red]/15', text: 'text-[--p2-red]' },
};

function scoreColor(v: number) {
  if (v >= 70) return 'var(--p2-green)';
  if (v >= 50) return 'var(--p2-orange)';
  return 'var(--p2-red)';
}

// ── Sub-components ──
function EvidenceCard({ item }: { item: EvidenceItem }) {
  const [open, setOpen] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const Icon = item.sourceIcon;
  const sev = SEV[item.severity];

  return (
    <div className="p2-card p-4">
      <button onClick={() => setOpen(!open)} className="w-full text-left">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[--p2-gray-50]">
            <Icon size={16} className="text-[--p2-gray-500]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-semibold text-[--p2-navy]">{item.source}</span>
              <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', sev.bg, sev.text)}>{item.severity}</span>
              <span className="text-[10px] text-[--p2-gray-400] ml-auto hidden sm:inline">Confidence: {item.confidence}%</span>
            </div>
            <p className="text-xs text-[--p2-gray-600]">{item.summary}</p>
          </div>
          {open ? <ChevronUp size={14} className="text-[--p2-gray-400] mt-1 flex-shrink-0" /> : <ChevronDown size={14} className="text-[--p2-gray-400] mt-1 flex-shrink-0" />}
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="mt-3 pt-3 border-t border-[--p2-gray-100]">
              <p className="text-xs text-[--p2-gray-600] leading-relaxed mb-3">{item.details}</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[--p2-gray-400]">Confidence</span>
                  <div className="w-20 h-1.5 bg-[--p2-gray-100] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${item.confidence}%`, background: scoreColor(item.confidence) }} />
                  </div>
                  <span className="text-[10px] font-medium" style={{ color: scoreColor(item.confidence) }}>{item.confidence}%</span>
                </div>
                {item.raw && (
                  <button onClick={(e) => { e.stopPropagation(); setShowRaw(!showRaw); }} className="text-[10px] text-[--p2-blue] hover:underline ml-auto">
                    {showRaw ? 'Hide' : 'Show'} Raw Data
                  </button>
                )}
              </div>
              {showRaw && item.raw && (
                <pre className="mt-2 p-2 bg-[--p2-navy] text-[--p2-green-light] text-[10px] rounded-md overflow-x-auto">{item.raw}</pre>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main component ──
export default function P2CaseDetail() {
  const { id } = useParams();
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState(NOTES);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewDecision, setReviewDecision] = useState<ReviewDecision>('approve');
  const caseId = id || CASE.id;

  const openReview = (d: ReviewDecision) => { setReviewDecision(d); setReviewOpen(true); };

  const addNote = () => {
    if (!noteText.trim()) return;
    setNotes(prev => [
      { id: `n${Date.now()}`, author: 'Elif Demir', initials: 'ED', time: 'Just now', text: noteText.trim() },
      ...prev,
    ]);
    setNoteText('');
  };

  return (
    <div className="space-y-4">
      {/* ── Top Bar ── */}
      <div className="p2-card p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/p2/dashboard/queue" className="flex items-center gap-1.5 text-xs text-[--p2-gray-400] hover:text-[--p2-blue] transition-colors">
              <ArrowLeft size={14} /> Back to Queue
            </Link>
            <div className="w-px h-6 bg-[--p2-gray-200]" />
            <div className="flex items-center gap-2">
              <span className="text-lg">{CASE.flag}</span>
              <h1 className="text-lg font-bold text-[--p2-navy]">{CASE.name}</h1>
            </div>
            <StatusBadge status={CASE.status} />
            <span className="text-xs text-[--p2-gray-400]">{caseId}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => openReview('approve')} className="bg-[--p2-green] hover:bg-[--p2-green]/90 text-white text-xs h-8 gap-1.5">
              <CheckCircle size={13} /> Approve
            </Button>
            <Button size="sm" onClick={() => openReview('deny')} className="bg-[--p2-red] hover:bg-[--p2-red]/90 text-white text-xs h-8 gap-1.5">
              <XCircle size={13} /> Deny
            </Button>
            <Button size="sm" onClick={() => openReview('escalate')} variant="outline" className="border-[--p2-orange] text-[--p2-orange] hover:bg-[--p2-orange]/5 text-xs h-8 gap-1.5">
              <AlertTriangle size={13} /> Escalate
            </Button>
          </div>
        </div>
      </div>

      {/* ── 3-Column Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

        {/* ── LEFT: Applicant Info ── */}
        <div className="lg:col-span-1 space-y-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p2-card p-5">
            <div className="flex flex-col items-center mb-4">
              <ScoreCircle score={CASE.riskScore} size="lg" />
              <span className="mt-2 text-xs font-bold tracking-wider" style={{ color: 'var(--p2-red)' }}>
                {CASE.riskLevel} RISK
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {[
                ['Full Name', CASE.name],
                ['Date of Birth', CASE.dob],
                ['Nationality', `${CASE.flag} ${CASE.nationality}`],
                ['Passport Number', CASE.passport],
                ['Application Date', CASE.applicationDate],
                ['Assigned Officer', CASE.assignedOfficer],
              ].map(([label, value]) => (
                <div key={label as string} className="flex justify-between">
                  <span className="text-[--p2-gray-400]">{label}</span>
                  <span className="font-medium text-[--p2-navy] text-right">{value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Sub-scores */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p2-card p-5">
            <h3 className="text-xs font-semibold text-[--p2-navy] mb-3">Risk Sub-Scores</h3>
            <div className="space-y-3">
              {CASE.subScores.map(s => (
                <div key={s.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[11px] text-[--p2-gray-500]">{s.label}</span>
                    <span className="text-[11px] font-semibold" style={{ color: scoreColor(s.value) }}>{s.value}/100</span>
                  </div>
                  <div className="w-full h-1.5 bg-[--p2-gray-100] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: scoreColor(s.value) }}
                      initial={{ width: 0 }}
                      animate={{ width: `${s.value}%` }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── CENTER: Evidence & Analysis ── */}
        <div className="lg:col-span-2">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="p2-card overflow-hidden">
            <Tabs defaultValue="evidence" className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b border-[--p2-gray-200] bg-transparent h-auto p-0">
                {['evidence', 'ai', 'timeline', 'documents'].map(t => (
                  <TabsTrigger key={t} value={t}
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-[--p2-blue] data-[state=active]:text-[--p2-blue] data-[state=active]:shadow-none px-4 py-3 text-xs font-medium text-[--p2-gray-500] capitalize">
                    {t === 'ai' ? 'AI Analysis' : t}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Evidence Tab */}
              <TabsContent value="evidence" className="p-4 space-y-3 mt-0">
                {EVIDENCE.map(e => <EvidenceCard key={e.id} item={e} />)}
              </TabsContent>

              {/* AI Analysis Tab */}
              <TabsContent value="ai" className="p-5 space-y-5 mt-0">
                <div>
                  <h3 className="text-xs font-semibold text-[--p2-navy] mb-2 flex items-center gap-1.5"><Brain size={14} /> Risk Narrative</h3>
                  <p className="text-xs text-[--p2-gray-600] leading-relaxed whitespace-pre-line">{AI_NARRATIVE}</p>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-[--p2-navy] mb-2">Key Findings</h3>
                  <ol className="space-y-2">
                    {AI_FINDINGS.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-[--p2-gray-600]">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[--p2-navy] text-white text-[10px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                        {f}
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="p-3 rounded-lg bg-[--p2-orange]/5 border border-[--p2-orange]/20">
                  <h3 className="text-xs font-semibold text-[--p2-orange] mb-1">Recommended Action</h3>
                  <p className="text-xs text-[--p2-gray-600]">Deny application pending further investigation. Request in-person interview at consulate. <span className="font-semibold text-[--p2-orange]">Confidence: 84%</span></p>
                </div>
                <p className="text-[10px] text-[--p2-gray-400] italic border-t border-[--p2-gray-100] pt-3">⚠ AI-generated analysis. Human review required before any decision is made.</p>
              </TabsContent>

              {/* Timeline Tab */}
              <TabsContent value="timeline" className="p-5 mt-0">
                <div className="relative">
                  <div className="absolute left-[11px] top-2 bottom-2 w-px bg-[--p2-gray-200]" />
                  <div className="space-y-4">
                    {TIMELINE.map((ev, i) => {
                      const Icon = ev.icon;
                      return (
                        <motion.div key={ev.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                          className="flex items-start gap-3 relative">
                          <div className="z-10 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: ev.color }}>
                            <Icon size={12} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-[--p2-navy]">{ev.title}</p>
                            <p className="text-[11px] text-[--p2-gray-500]">{ev.description}</p>
                            <p className="text-[10px] text-[--p2-gray-400] mt-0.5">{ev.time}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents" className="p-5 mt-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {DOCUMENTS.map((doc, i) => (
                    <motion.button key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                      className="p2-card p-4 text-left hover:border-[--p2-blue]/40 transition-colors group">
                      <div className="w-full h-20 bg-[--p2-gray-50] rounded-md mb-3 flex items-center justify-center">
                        {doc.type === 'image' ? <Image size={24} className="text-[--p2-gray-300]" /> : <FileText size={24} className="text-[--p2-gray-300]" />}
                      </div>
                      <p className="text-xs font-medium text-[--p2-navy] truncate">{doc.name}</p>
                      <p className="text-[10px] text-[--p2-gray-400]">{doc.type.toUpperCase()} · {doc.pages} page{doc.pages > 1 ? 's' : ''}</p>
                    </motion.button>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        {/* ── RIGHT: Graph & Notes ── */}
        <div className="lg:col-span-1 space-y-4">
          {/* Graph placeholder */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p2-card p-5">
            <h3 className="text-xs font-semibold text-[--p2-navy] mb-3 flex items-center gap-1.5"><Network size={14} /> Network Graph</h3>
            <div className="w-full h-40 bg-[--p2-gray-50] rounded-lg border border-dashed border-[--p2-gray-200] flex items-center justify-center">
              <span className="text-[11px] text-[--p2-gray-400]">Graph visualization</span>
            </div>
            <Link to={`/p2/dashboard/cases/${caseId}/graph`} className="flex items-center gap-1 text-[11px] text-[--p2-blue] hover:underline mt-3">
              View Full Graph <ExternalLink size={10} />
            </Link>
          </motion.div>

          {/* Notes */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="p2-card p-5">
            <h3 className="text-xs font-semibold text-[--p2-navy] mb-3">Officer Notes</h3>
            <div className="mb-3">
              <textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Add a note..."
                className="w-full p-2.5 text-xs border border-[--p2-gray-200] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[--p2-blue]/30 focus:border-[--p2-blue] resize-none"
                rows={3}
              />
              <Button size="sm" onClick={addNote} disabled={!noteText.trim()} className="mt-1.5 text-xs h-7 bg-[--p2-blue] hover:bg-[--p2-blue]/90 text-white gap-1">
                <Send size={11} /> Add Note
              </Button>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {notes.map(n => (
                <div key={n.id} className="flex gap-2">
                  <span className="w-6 h-6 rounded-full bg-[--p2-navy] text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{n.initials}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-[--p2-navy]">{n.author}</span>
                      <span className="text-[10px] text-[--p2-gray-400]">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-[--p2-gray-600] leading-relaxed mt-0.5">{n.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <ReviewPanel open={reviewOpen} onClose={() => setReviewOpen(false)} applicantName={CASE.name} initialDecision={reviewDecision} />
    </div>
  );
}
