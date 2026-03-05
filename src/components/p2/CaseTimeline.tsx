import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Play, AlertTriangle, CheckCircle, Globe, UserCheck, UserX,
  GitBranch, Calculator, MessageSquare, ThumbsUp, ThumbsDown, ArrowUp, Award,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Event type config ──
type EventType =
  | 'application_submitted' | 'screening_started' | 'compliance_hit' | 'compliance_clear'
  | 'osint_scan' | 'identity_verified' | 'identity_failed' | 'graph_analysis'
  | 'risk_score_calculated' | 'officer_note' | 'review_approved' | 'review_denied'
  | 'review_escalated' | 'certificate_issued';

const EVENT_CONFIG: Record<EventType, { icon: typeof FileText; color: string }> = {
  application_submitted:  { icon: FileText,       color: 'var(--p2-blue)' },
  screening_started:      { icon: Play,           color: 'var(--p2-blue)' },
  compliance_hit:         { icon: AlertTriangle,  color: 'var(--p2-red)' },
  compliance_clear:       { icon: CheckCircle,    color: 'var(--p2-green)' },
  osint_scan:             { icon: Globe,          color: '#8B5CF6' },
  identity_verified:      { icon: UserCheck,      color: 'var(--p2-green)' },
  identity_failed:        { icon: UserX,          color: 'var(--p2-red)' },
  graph_analysis:         { icon: GitBranch,      color: 'var(--p2-blue)' },
  risk_score_calculated:  { icon: Calculator,     color: 'var(--p2-orange)' },
  officer_note:           { icon: MessageSquare,  color: 'var(--p2-gray-500)' },
  review_approved:        { icon: ThumbsUp,       color: 'var(--p2-green)' },
  review_denied:          { icon: ThumbsDown,     color: 'var(--p2-red)' },
  review_escalated:       { icon: ArrowUp,        color: 'var(--p2-orange)' },
  certificate_issued:     { icon: Award,          color: 'var(--p2-green)' },
};

interface TimelineEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  source: string;
  datetime: string; // ISO
  details?: string;
}

// ── Mock data (15 events spanning ~48 h) ──
const EVENTS: TimelineEvent[] = [
  {
    id: 'te1', type: 'application_submitted',
    title: 'Application Submitted',
    description: 'Online visa application received via e-Visa portal. Form reference VIS-2026-1002.',
    source: 'System',
    datetime: '2026-03-03T09:14:00',
    details: 'Applicant submitted a C-type Schengen visa application through the Turkish e-Visa portal. IP address logged: 185.x.x.x. Browser fingerprint stored for fraud detection. All required form fields completed.',
  },
  {
    id: 'te2', type: 'screening_started',
    title: 'Automated Screening Initiated',
    description: 'Risk assessment pipeline triggered. 7 screening modules activated.',
    source: 'System',
    datetime: '2026-03-03T09:15:22',
  },
  {
    id: 'te3', type: 'compliance_hit',
    title: 'Compliance Database Match Found',
    description: 'WorldCheck returned a familial connection to an EU-sanctioned entity (Reg. 267/2012).',
    source: 'WorldCheck',
    datetime: '2026-03-03T09:16:08',
    details: 'Match type: familial. Confidence: 78%. The matched entity is listed under EU Consolidated Sanctions List reference EU-IR-2019-4421. Subject shares surname and geographic origin with a procurement network linked to restricted dual-use goods.',
  },
  {
    id: 'te4', type: 'compliance_clear',
    title: 'OFAC Primary List Cleared',
    description: 'No direct match found on OFAC SDN primary list. Partial match on secondary list flagged for review.',
    source: 'OpenSanctions',
    datetime: '2026-03-03T09:16:45',
  },
  {
    id: 'te5', type: 'osint_scan',
    title: 'OSINT Data Collection Complete',
    description: 'Social media profiles identified across 3 platforms. Network analysis initiated.',
    source: 'Social Links',
    datetime: '2026-03-03T09:19:11',
    details: 'Identified profiles on LinkedIn, Instagram, and Telegram. Cross-referenced with known flagged clusters. Subject is within 2 degrees of separation from 3 previously flagged applicants through shared Telegram group memberships.',
  },
  {
    id: 'te6', type: 'identity_verified',
    title: 'Identity Verification Passed',
    description: 'Biometric facial recognition returned no matches against Interpol or internal watchlists.',
    source: 'Biometric Engine',
    datetime: '2026-03-03T09:20:33',
  },
  {
    id: 'te7', type: 'graph_analysis',
    title: 'Network Graph Analysis Complete',
    description: 'Entity relationship graph generated with 14 nodes and 23 edges. 3 high-risk connections identified.',
    source: 'Nautica Engine',
    datetime: '2026-03-03T09:22:47',
    details: 'Graph analysis reveals connections to 3 previously flagged applicants (VIS-2026-0987, VIS-2026-0993, VIS-2026-0998). Shared nodes include a Telegram group and a co-listed business registration in Tehran.',
  },
  {
    id: 'te8', type: 'risk_score_calculated',
    title: 'Risk Score Calculated: 87/100',
    description: 'Composite risk score computed. Primary drivers: sanctions proximity (35%), VPN usage (25%), social cluster (20%).',
    source: 'AI Risk Engine',
    datetime: '2026-03-03T09:25:00',
    details: 'Score breakdown — Compliance: 85/100, Social Network: 62/100, Behavioral: 71/100, Identity: 45/100, Pattern: 38/100. Fraud vector correlation: IR-2024-07 (81% match).',
  },
  {
    id: 'te9', type: 'officer_note',
    title: 'Officer Note Added',
    description: 'Officer Elif Demir flagged the WorldCheck familial match for manual verification.',
    source: 'Officer: Elif Demir',
    datetime: '2026-03-03T14:15:00',
    details: 'Note: "WorldCheck familial match needs manual verification. Requesting additional documentation from applicant — invitation letter and hotel booking confirmation."',
  },
  {
    id: 'te10', type: 'officer_note',
    title: 'Officer Note Added',
    description: 'Officer Burak Aydın recommended cross-referencing with related Iranian applicant cluster.',
    source: 'Officer: Burak Aydın',
    datetime: '2026-03-03T16:42:00',
    details: 'Note: "Confirmed VPN usage pattern is consistent with recent Iranian applicant cluster. Recommend cross-referencing with cases VIS-2026-0987 and VIS-2026-0993."',
  },
  {
    id: 'te11', type: 'osint_scan',
    title: 'Extended OSINT Sweep Complete',
    description: 'Deep web and public records search completed. Financial profile cross-referenced.',
    source: 'Perplexity OSINT',
    datetime: '2026-03-04T08:30:00',
  },
  {
    id: 'te12', type: 'compliance_hit',
    title: 'Additional Compliance Flag',
    description: 'Updated EU sanctions list (March 2026 revision) confirms familial link. Risk weight increased.',
    source: 'WorldCheck',
    datetime: '2026-03-04T10:12:00',
    details: 'The March 2026 quarterly revision of the EU Consolidated Sanctions List added a new entity reference (EU-IR-2026-0142) that strengthens the familial connection originally identified. Match confidence upgraded from 78% to 84%.',
  },
  {
    id: 'te13', type: 'review_escalated',
    title: 'Case Escalated to Security Division',
    description: 'Senior Officer Mehmet Yılmaz escalated case for additional review by Security Division.',
    source: 'Officer: Mehmet Yılmaz',
    datetime: '2026-03-04T11:45:00',
    details: 'Escalation reason: "Multiple compliance hits combined with social network clustering warrants Security Division review. Recommend holding decision pending inter-agency consultation."',
  },
  {
    id: 'te14', type: 'officer_note',
    title: 'Security Division Review Note',
    description: 'Security Division confirmed ongoing investigation into related applicant cluster.',
    source: 'Security Division',
    datetime: '2026-03-04T15:20:00',
    details: 'Note: "This applicant is part of a broader cluster under active investigation (Operation Kavşak). Recommend denial with referral to counter-intelligence liaison. Do not notify applicant of investigation."',
  },
  {
    id: 'te15', type: 'review_denied',
    title: 'Case Denied by Security Division',
    description: 'Application denied per Security Division recommendation. Standard denial notice issued.',
    source: 'Officer: Ayşe Korkmaz',
    datetime: '2026-03-05T09:00:00',
    details: 'Denial reason: Sanctions Hit + Identity Concerns. Denial notification sent to applicant with standard language. Internal referral to counter-intelligence logged separately.',
  },
];

// ── Helpers ──
function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function getDateLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date('2026-03-05');
  const yesterday = new Date('2026-03-04');

  const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  if (sameDay(d, today)) return 'Today';
  if (sameDay(d, yesterday)) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function groupByDate(events: TimelineEvent[]) {
  const groups: { label: string; events: TimelineEvent[] }[] = [];
  for (const ev of events) {
    const label = getDateLabel(ev.datetime);
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.events.push(ev);
    } else {
      groups.push({ label, events: [ev] });
    }
  }
  return groups;
}

// ── Event card ──
function EventCard({ event, index }: { event: TimelineEvent; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const config = EVENT_CONFIG[event.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className="flex gap-4 group"
    >
      {/* Timestamp */}
      <div className="w-14 flex-shrink-0 text-right pt-1">
        <span className="text-[11px] font-medium text-[--p2-gray-400]">{formatTime(event.datetime)}</span>
      </div>

      {/* Dot & line */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center z-10 ring-4 ring-white"
          style={{ background: config.color }}
        >
          <Icon size={14} className="text-white" />
        </div>
        <div className="w-px flex-1 bg-[--p2-gray-200] min-h-[16px]" />
      </div>

      {/* Card */}
      <div className="flex-1 pb-6 min-w-0">
        <div
          className={cn(
            'p2-card p-4 transition-all',
            event.details && 'cursor-pointer hover:border-[--p2-blue]/30',
          )}
          onClick={() => event.details && setExpanded(!expanded)}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-[--p2-navy]">{event.title}</h4>
              <p className="text-[11px] text-[--p2-gray-500] mt-1 leading-relaxed">{event.description}</p>
            </div>
            {event.details && (
              <button className="text-[--p2-gray-400] hover:text-[--p2-navy] flex-shrink-0 mt-0.5">
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>

          {/* Source tag */}
          <div className="mt-2">
            <span
              className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{
                background: `color-mix(in srgb, ${config.color} 10%, transparent)`,
                color: config.color,
              }}
            >
              {event.source}
            </span>
          </div>

          {/* Expandable details */}
          {expanded && event.details && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-[--p2-gray-100]">
                <p className="text-[11px] text-[--p2-gray-600] leading-relaxed">{event.details}</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main component ──
export default function CaseTimeline() {
  const groups = groupByDate(EVENTS);
  let globalIndex = 0;

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.label}>
          {/* Date header */}
          <div className="flex items-center gap-3 mb-4 ml-[70px]">
            <span className="text-[11px] font-bold text-[--p2-navy] uppercase tracking-wider">{group.label}</span>
            <div className="flex-1 h-px bg-[--p2-gray-200]" />
            <span className="text-[10px] text-[--p2-gray-400]">{group.events.length} event{group.events.length > 1 ? 's' : ''}</span>
          </div>

          {/* Events */}
          <div>
            {group.events.map((ev) => {
              const idx = globalIndex++;
              return <EventCard key={ev.id} event={ev} index={idx} />;
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
