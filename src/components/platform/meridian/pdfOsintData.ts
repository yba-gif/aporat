// Re-export types and provide entity lookup for PDF export
// Maps case applicants to their Social Intelligence entity profiles

export interface SocialProfile {
  platform: string;
  handle: string;
  followers: number;
  following: number;
  verified: boolean;
  lastActive: string;
  riskIndicators: string[];
}

export interface OsintFinding {
  source: string;
  category: string;
  detail: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
}

export interface SocialConnection {
  name: string;
  relationship: string;
  riskScore: number;
  flagged: boolean;
}

export interface EntityProfile {
  name: string;
  type: string;
  riskScore: number;
  riskNarrative: string;
  socialProfiles: SocialProfile[];
  connections: SocialConnection[];
  osintFindings: OsintFinding[];
}

const ENTITY_MAP: Record<string, EntityProfile> = {
  'Ahmad Rezaee': {
    name: 'Ahmad Rezaee',
    type: 'applicant',
    riskScore: 87,
    riskNarrative: 'Applicant submitted through Global Finance Consultants. Document hash matches previous rejected application under different name. Social media footprint minimal but Instagram account follows known visa mill operators. LinkedIn employment differs from visa application declaration.',
    socialProfiles: [
      { platform: 'instagram', handle: '@ahmad_rezaee_travel', followers: 234, following: 1247, verified: false, lastActive: '2026-01-20T08:00:00Z', riskIndicators: ['Following 8 flagged agency accounts', 'Account created 45 days ago'] },
      { platform: 'linkedin', handle: 'ahmad-rezaee-tehran', followers: 142, following: 310, verified: false, lastActive: '2026-01-18T12:00:00Z', riskIndicators: ['Employment listed differs from visa application', 'Profile created 60 days before submission'] },
      { platform: 'telegram', handle: '@a_rezaee_visa', followers: 0, following: 47, verified: false, lastActive: '2026-01-25T09:00:00Z', riskIndicators: ['Member of 3 visa coaching channels', 'Follows 2 known facilitator accounts'] },
    ],
    connections: [
      { name: 'Mehmet Yilmaz', relationship: 'Agency Owner', riskScore: 78, flagged: true },
      { name: 'Dmitri Volkov', relationship: 'Shared Address', riskScore: 72, flagged: true },
      { name: 'Elena Sokolova', relationship: 'Same Agency', riskScore: 45, flagged: false },
    ],
    osintFindings: [
      { source: 'Instagram', category: 'Social Graph', detail: 'Follows 8 accounts flagged as visa mill operators across 3 countries', severity: 'high', timestamp: '2026-01-20T10:30:00Z' },
      { source: 'LinkedIn', category: 'Employment Verification', detail: 'Lists "Pars Engineering Ltd" as employer — visa application states "Tehran Import Co"', severity: 'critical', timestamp: '2026-01-19T14:00:00Z' },
      { source: 'Telegram', category: 'Group Membership', detail: 'Active in "Visa Tips Turkey 2026" (1,247 members) — known coaching channel', severity: 'high', timestamp: '2026-01-25T09:15:00Z' },
      { source: 'Telegram', category: 'Group Membership', detail: 'Member of "Document Services TR" — flagged for document forgery coordination', severity: 'critical', timestamp: '2026-01-24T16:00:00Z' },
    ],
  },
  'Elena Sokolova': {
    name: 'Elena Sokolova',
    type: 'applicant',
    riskScore: 45,
    riskNarrative: 'Employment letter inconsistency detected. Company registration date conflicts with claimed employment duration. IP geolocation mismatch between application submission location and stated residence.',
    socialProfiles: [],
    connections: [
      { name: 'Mehmet Yilmaz', relationship: 'Agency Owner', riskScore: 78, flagged: true },
    ],
    osintFindings: [
      { source: 'IP Analysis', category: 'Geolocation', detail: 'Application submitted from Ukraine IP, stated residence is Germany', severity: 'medium', timestamp: '2026-01-26T09:00:00Z' },
    ],
  },
  'Viktor Petrov': {
    name: 'Viktor Petrov',
    type: 'applicant',
    riskScore: 65,
    riskNarrative: 'Application submitted through Apex Travel Agency which has an elevated fraud rate (23% vs 3% baseline). Shared contact pattern detected with multiple unrelated applicants.',
    socialProfiles: [],
    connections: [
      { name: 'Apex Travel Agency', relationship: 'Submitting Agency', riskScore: 82, flagged: true },
    ],
    osintFindings: [
      { source: 'vizesepetim.com', category: 'Contact Pattern', detail: 'Same mobile hash across 5 applicants in 30 days', severity: 'medium', timestamp: '2026-01-27T14:00:00Z' },
    ],
  },
};

export function getEntityForCase(applicantName: string): EntityProfile | undefined {
  return ENTITY_MAP[applicantName];
}
