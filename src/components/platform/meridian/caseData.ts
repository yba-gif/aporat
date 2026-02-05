import { 
  AlertTriangle, 
  FileWarning, 
  Globe,
  Network,
  Users,
  CreditCard,
  MapPin,
  Smartphone
} from 'lucide-react';

export interface RedFlag {
  id: string;
  severity: 'critical' | 'high' | 'medium';
  title: string;
  description: string;
  source: string;
  evidence: string;
  icon: typeof AlertTriangle;
}

export interface Case {
  id: string;
  caseNumber: string;
  applicant: string;
  type: string;
  status: 'open' | 'under_review' | 'pending_approval' | 'escalated' | 'closed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  riskScore: number;
  assignee: string;
  team: string;
  createdAt: string;
  updatedAt: string;
  documents: number;
  notes: number;
  linkedEntities: string[];
  slaDeadline: string;
  slaBreach: boolean;
  redFlags: RedFlag[];
}

export const DEMO_CASES: Case[] = [
  {
    id: 'case-001',
    caseNumber: 'CASE-2026-4829',
    applicant: 'Ahmad Rezaee',
    type: 'Visa Fraud Investigation',
    status: 'under_review',
    priority: 'critical',
    riskScore: 94,
    assignee: 'Officer Yilmaz',
    team: 'Fraud Detection Unit',
    createdAt: '2026-01-25T10:00:00Z',
    updatedAt: '2026-01-28T14:30:00Z',
    documents: 12,
    notes: 8,
    linkedEntities: ['Global Finance Consultants', 'Dmitri Volkov', 'Template Bank Statement'],
    slaDeadline: '2026-01-30T18:00:00Z',
    slaBreach: false,
    redFlags: [
      {
        id: 'flag-1',
        severity: 'critical',
        title: 'Visa Mill Network Connection',
        description: 'Applicant connected to known visa mill network through employment agency',
        source: 'Nautica Intelligence',
        evidence: 'Linked to Apex Travel Agency (flagged cluster with 12 entities)',
        icon: Network
      },
      {
        id: 'flag-2',
        severity: 'critical',
        title: 'Document Hash Match',
        description: 'Bank statement SHA-256 hash matches template used in 8 other applications',
        source: 'Maris Document Vault',
        evidence: 'Hash: e3b0c442...98fb (matches APP-2024-*, APP-2025-*)',
        icon: FileWarning
      },
      {
        id: 'flag-3',
        severity: 'high',
        title: 'Pre-Submission Risk Signal',
        description: 'Applicant used shared mobile number with 3 other visa applicants',
        source: 'vizesepetim.com',
        evidence: 'Mobile hash shared with external_id: VS-2026-*, VS-2026-*',
        icon: Globe
      }
    ]
  },
  {
    id: 'case-002',
    caseNumber: 'CASE-2026-4827',
    applicant: 'Elena Sokolova',
    type: 'Document Verification',
    status: 'escalated',
    priority: 'high',
    riskScore: 72,
    assignee: 'Supervisor Demir',
    team: 'Document Review',
    createdAt: '2026-01-26T09:00:00Z',
    updatedAt: '2026-01-28T11:00:00Z',
    documents: 7,
    notes: 4,
    linkedEntities: ['TechServe Solutions GmbH'],
    slaDeadline: '2026-01-29T12:00:00Z',
    slaBreach: true,
    redFlags: [
      {
        id: 'flag-4',
        severity: 'high',
        title: 'Employment Letter Inconsistency',
        description: 'Company registration date conflicts with claimed employment duration',
        source: 'Maris Document Vault',
        evidence: 'TechServe Solutions GmbH registered 2025-06, employment claimed from 2023',
        icon: FileWarning
      },
      {
        id: 'flag-5',
        severity: 'medium',
        title: 'IP Geolocation Mismatch',
        description: 'Application submitted from different country than stated residence',
        source: 'vizesepetim.com',
        evidence: 'IP: Ukraine, Stated residence: Germany',
        icon: MapPin
      }
    ]
  },
  {
    id: 'case-003',
    caseNumber: 'CASE-2026-4830',
    applicant: 'Viktor Petrov',
    type: 'Network Analysis',
    status: 'open',
    priority: 'high',
    riskScore: 65,
    assignee: 'Unassigned',
    team: 'Intelligence',
    createdAt: '2026-01-27T14:00:00Z',
    updatedAt: '2026-01-28T08:00:00Z',
    documents: 5,
    notes: 2,
    linkedEntities: ['Apex Travel Agency', 'High-Risk Network Cluster'],
    slaDeadline: '2026-01-31T18:00:00Z',
    slaBreach: false,
    redFlags: [
      {
        id: 'flag-6',
        severity: 'high',
        title: 'High-Risk Agency Association',
        description: 'Application submitted through agency with elevated fraud rate',
        source: 'Nautica Intelligence',
        evidence: 'Apex Travel Agency: 23% of applications flagged (vs 3% baseline)',
        icon: Network
      },
      {
        id: 'flag-7',
        severity: 'medium',
        title: 'Shared Contact Pattern',
        description: 'Phone number linked to multiple unrelated applicants',
        source: 'vizesepetim.com',
        evidence: 'Same mobile hash across 5 applicants in 30 days',
        icon: Smartphone
      },
      {
        id: 'flag-8',
        severity: 'medium',
        title: 'Financial Document Anomaly',
        description: 'Bank statement shows unusual transaction patterns',
        source: 'Maris Document Vault',
        evidence: 'Salary deposits appear 1 day before statement generation',
        icon: CreditCard
      }
    ]
  },
  {
    id: 'case-004',
    caseNumber: 'CASE-2026-4825',
    applicant: 'Maria Santos',
    type: 'Routine Verification',
    status: 'closed',
    priority: 'low',
    riskScore: 12,
    assignee: 'Officer Kaya',
    team: 'Standard Processing',
    createdAt: '2026-01-24T11:00:00Z',
    updatedAt: '2026-01-27T16:45:00Z',
    documents: 4,
    notes: 1,
    linkedEntities: [],
    slaDeadline: '2026-01-28T18:00:00Z',
    slaBreach: false,
    redFlags: [] // No red flags - clean application
  }
];

export function getCaseById(caseId: string): Case | undefined {
  return DEMO_CASES.find(c => c.id === caseId);
}

export function getRedFlagsForCase(caseId: string): RedFlag[] {
  const caseData = getCaseById(caseId);
  return caseData?.redFlags || [];
}
