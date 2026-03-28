// V3 Intelligence Platform — Mock Data
// ============================================================

const NATIONALITIES = ['TR', 'IR', 'IQ', 'SY', 'RU', 'UA', 'GE', 'AZ', 'KZ', 'UZ', 'TM', 'AF', 'PK', 'EG', 'TN', 'MA', 'LB', 'JO'];
const DESTINATIONS = ['DE', 'FR', 'NL', 'IT', 'ES', 'BE', 'AT', 'SE', 'NO', 'DK', 'CH', 'PL', 'CZ'];
const CONSULATES: V3Case['consulateLocation'][] = ['Istanbul', 'Ankara', 'Izmir'];

export interface V3Applicant {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  gender: 'M' | 'F';
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type CaseStatus = 'new' | 'scanning' | 'in_review' | 'escalated' | 'approved' | 'rejected';

export interface OsintFinding {
  id: string;
  source: 'instagram' | 'facebook' | 'twitter' | 'tiktok' | 'linkedin' | 'strava' | 'public_records' | 'financial' | 'travel' | 'darkweb';
  category: 'social_media' | 'public_records' | 'financial' | 'travel' | 'network' | 'digital_footprint';
  title: string;
  detail: string;
  url: string;
  confidence: number;
  riskImpact: 'none' | 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}

export interface CaseDocument {
  id: string;
  name: string;
  type: 'passport' | 'bank_statement' | 'travel_insurance' | 'hotel_booking' | 'employment_letter' | 'invitation_letter';
  ocrStatus: 'completed' | 'processing' | 'failed';
  extractedFields: Record<string, string>;
}

export interface CaseEvent {
  id: string;
  timestamp: string;
  type: 'created' | 'document_upload' | 'ocr_complete' | 'scan_started' | 'scan_completed' | 'finding_added' | 'risk_scored' | 'reviewed' | 'escalated' | 'approved' | 'rejected';
  description: string;
  user?: string;
}

export interface RiskBreakdown {
  document: number;
  identity: number;
  travel: number;
  financial: number;
  network: number;
  digitalFootprint: number;
}

export interface V3Case {
  id: string;
  caseId: string;
  applicant: V3Applicant;
  applicationDate: string;
  consulateLocation: 'Istanbul' | 'Ankara' | 'Izmir';
  travelDestination: string;
  riskScore: number;
  riskLevel: RiskLevel;
  status: CaseStatus;
  assignedOfficer: string;
  osintFindings: OsintFinding[];
  documents: CaseDocument[];
  timeline: CaseEvent[];
  riskBreakdown: RiskBreakdown;
  riskFactors: string[];
  createdAt: string;
  updatedAt: string;
}

// ---------- OSINT FINDINGS TEMPLATES ----------

const findingTemplates: Omit<OsintFinding, 'id' | 'timestamp'>[] = [
  { source: 'instagram', category: 'social_media', title: 'Luxury lifestyle inconsistent with declared income', detail: 'Multiple posts showing luxury hotels, designer goods, and business class travel. Account shows 847 posts with geotags across 14 countries in 2025. Declared annual income: €18,000.', url: 'https://instagram.com/user_example', confidence: 87, riskImpact: 'high' },
  { source: 'instagram', category: 'social_media', title: 'Account recently scrubbed', detail: 'Wayback Machine snapshots show account had 2,400+ posts in November 2025. Current count: 312. Mass deletion detected 3 days before visa application.', url: 'https://instagram.com/user_example', confidence: 92, riskImpact: 'critical' },
  { source: 'facebook', category: 'social_media', title: 'Multiple identity profiles detected', detail: 'Three Facebook accounts found using same phone number but different names and photos. One profile lists employment at a company not mentioned in visa application.', url: 'https://facebook.com/profile', confidence: 78, riskImpact: 'high' },
  { source: 'twitter', category: 'social_media', title: 'Geotagged tweets contradict declared residence', detail: 'Applicant declares residence in Tehran. 73% of tweets in last 6 months geotagged from Istanbul, suggesting undeclared prior residence.', url: 'https://twitter.com/user', confidence: 84, riskImpact: 'medium' },
  { source: 'linkedin', category: 'social_media', title: 'Employment history mismatch', detail: 'LinkedIn shows employment at "Caspian Trading LLC" (2021-present). Application lists "Tehran Software Group" as current employer. No record of Tehran Software Group in business registries.', url: 'https://linkedin.com/in/user', confidence: 91, riskImpact: 'high' },
  { source: 'tiktok', category: 'social_media', title: 'Location patterns suggest different residence', detail: 'TikTok usage analytics from public profile indicate primary usage from Ankara region, not declared city of Tabriz.', url: 'https://tiktok.com/@user', confidence: 65, riskImpact: 'low' },
  { source: 'strava', category: 'social_media', title: 'Regular running routes in undeclared city', detail: 'Strava heatmap shows daily running routes in Berlin since March 2025. Applicant has not declared any prior visits to Germany.', url: 'https://strava.com/athlete', confidence: 88, riskImpact: 'high' },
  { source: 'public_records', category: 'public_records', title: 'Company registration anomaly', detail: 'Declared employer registered only 45 days before application date. Single director, no employees listed. Registered address is a residential apartment.', url: '#', confidence: 95, riskImpact: 'critical' },
  { source: 'public_records', category: 'public_records', title: 'Previous visa rejection found', detail: 'Subject was rejected for Schengen visa by German embassy in 2024. Reason: insufficient financial documentation. Not disclosed in current application.', url: '#', confidence: 97, riskImpact: 'high' },
  { source: 'financial', category: 'financial', title: 'Bank statement anomaly detected', detail: 'Large deposits (€15,000, €12,000) made 5 and 3 days before statement generation date. Account average balance prior month: €2,100. Pattern consistent with balance stuffing.', url: '#', confidence: 89, riskImpact: 'critical' },
  { source: 'financial', category: 'financial', title: 'Income source unverifiable', detail: 'Declared income from freelance consulting. No tax records found. Bank deposits show irregular cash deposits not matching any invoicing pattern.', url: '#', confidence: 76, riskImpact: 'medium' },
  { source: 'travel', category: 'travel', title: 'Unusual travel pattern', detail: 'Passport stamps show 7 entries to Serbia (visa-free for Iranian nationals) in 18 months. Each stay: 2-3 days. Pattern consistent with document shopping or transit facilitation.', url: '#', confidence: 82, riskImpact: 'high' },
  { source: 'travel', category: 'travel', title: 'Return ticket is refundable', detail: 'Submitted flight booking (IKA→FRA) is fully refundable with free cancellation. No return flight booked. Hotel booking covers only 3 of 14 requested days.', url: '#', confidence: 70, riskImpact: 'medium' },
  { source: 'darkweb', category: 'digital_footprint', title: 'Email found in data breach', detail: 'Applicant email found in 2023 breach of fraudulent document marketplace. Email was registered account (not just in dump).', url: '#', confidence: 73, riskImpact: 'critical' },
  { source: 'facebook', category: 'network', title: 'Connected to flagged applicant network', detail: 'Shares 14 mutual Facebook connections with 3 previously rejected applicants from same agency. Agency "Golden Gate Travel" flagged for document fraud in 2024.', url: '#', confidence: 85, riskImpact: 'high' },
];

// ---------- GENERATE 25+ CASES ----------

const applicantNames: [string, string, 'M' | 'F'][] = [
  ['Mehmet', 'Yılmaz', 'M'], ['Ayşe', 'Kaya', 'F'], ['Ali', 'Demir', 'M'],
  ['Fatma', 'Çelik', 'F'], ['Hasan', 'Şahin', 'M'], ['Zeynep', 'Arslan', 'F'],
  ['Ahmad', 'Rezaei', 'M'], ['Maryam', 'Hosseini', 'F'], ['Reza', 'Mohammadi', 'M'],
  ['Sara', 'Ahmadi', 'F'], ['Dmitri', 'Volkov', 'M'], ['Elena', 'Sokolova', 'F'],
  ['Viktor', 'Petrov', 'M'], ['Nadia', 'Kozlova', 'F'], ['Omar', 'Hassan', 'M'],
  ['Layla', 'Ibrahim', 'F'], ['Giorgi', 'Beridze', 'M'], ['Tamara', 'Kapanadze', 'F'],
  ['Murad', 'Aliyev', 'M'], ['Leyla', 'Mammadova', 'F'], ['Arman', 'Nazarbayev', 'M'],
  ['Dinara', 'Suleimanova', 'F'], ['Khalid', 'Al-Rashidi', 'M'], ['Farah', 'El-Amin', 'F'],
  ['Yusuf', 'Bektaş', 'M'], ['Elif', 'Özdemir', 'F'], ['Sergei', 'Ivanov', 'M'],
  ['Natalia', 'Bondarenko', 'F'], ['Tariq', 'Mansour', 'M'], ['Amina', 'Karimi', 'F'],
];

const officers = ['Officer Yılmaz', 'Officer Demir', 'Officer Kaya', 'Supervisor Arslan', 'Officer Çelik', 'Officer Şahin'];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePassport(nat: string): string {
  const letters = nat.substring(0, 2).toUpperCase();
  const nums = Math.floor(Math.random() * 9000000 + 1000000);
  return `${letters}${nums}`;
}

function generateRiskLevel(score: number): RiskLevel {
  if (score < 30) return 'low';
  if (score < 60) return 'medium';
  if (score < 80) return 'high';
  return 'critical';
}

function generateFindings(count: number): OsintFinding[] {
  const shuffled = [...findingTemplates].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((f, i) => ({
    ...f,
    id: `finding-${i}-${Date.now()}`,
    timestamp: new Date(2026, 0, Math.floor(Math.random() * 28) + 1).toISOString(),
  }));
}

function generateDocuments(): CaseDocument[] {
  const docs: CaseDocument[] = [
    { id: 'd1', name: 'Passport Scan', type: 'passport', ocrStatus: 'completed', extractedFields: { fullName: 'EXTRACTED', dateOfBirth: 'EXTRACTED', passportNumber: 'EXTRACTED', expiryDate: '2029-04-15', issuingAuthority: 'EXTRACTED' } },
    { id: 'd2', name: 'Bank Statement', type: 'bank_statement', ocrStatus: 'completed', extractedFields: { accountHolder: 'EXTRACTED', bankName: 'EXTRACTED', balance: 'EXTRACTED', period: '2025-10 to 2025-12' } },
    { id: 'd3', name: 'Travel Insurance', type: 'travel_insurance', ocrStatus: 'completed', extractedFields: { provider: 'Allianz Global', coverage: '€30,000', validFrom: '2026-02-01', validTo: '2026-02-15' } },
    { id: 'd4', name: 'Hotel Booking', type: 'hotel_booking', ocrStatus: 'processing', extractedFields: {} },
    { id: 'd5', name: 'Employment Letter', type: 'employment_letter', ocrStatus: 'completed', extractedFields: { employer: 'EXTRACTED', position: 'EXTRACTED', salary: 'EXTRACTED', startDate: 'EXTRACTED' } },
  ];
  return docs;
}

function generateTimeline(caseId: string, status: CaseStatus): CaseEvent[] {
  const events: CaseEvent[] = [
    { id: 'e1', timestamp: '2026-01-15T09:00:00Z', type: 'created', description: `Case ${caseId} created from online application` },
    { id: 'e2', timestamp: '2026-01-15T09:01:00Z', type: 'document_upload', description: 'Passport scan uploaded' },
    { id: 'e3', timestamp: '2026-01-15T09:01:30Z', type: 'document_upload', description: 'Bank statement uploaded' },
    { id: 'e4', timestamp: '2026-01-15T09:05:00Z', type: 'ocr_complete', description: 'OCR extraction completed for passport scan — 98.2% confidence' },
    { id: 'e5', timestamp: '2026-01-15T09:12:00Z', type: 'scan_started', description: 'OSINT scan initiated — scanning 6 platforms' },
    { id: 'e6', timestamp: '2026-01-15T09:14:00Z', type: 'finding_added', description: 'Instagram profile discovered — 847 posts analyzed' },
    { id: 'e7', timestamp: '2026-01-15T09:16:00Z', type: 'scan_completed', description: 'OSINT scan completed — 7 findings across 4 sources' },
    { id: 'e8', timestamp: '2026-01-15T09:16:30Z', type: 'risk_scored', description: 'Risk assessment computed — score generated from 6 categories' },
  ];
  if (status === 'in_review' || status === 'escalated' || status === 'approved' || status === 'rejected') {
    events.push({ id: 'e9', timestamp: '2026-01-16T10:00:00Z', type: 'reviewed', description: 'Case reviewed by Officer Demir', user: 'Officer Demir' });
  }
  if (status === 'escalated') {
    events.push({ id: 'e10', timestamp: '2026-01-16T10:30:00Z', type: 'escalated', description: 'Escalated to Supervisor Arslan — high-risk network connections detected', user: 'Officer Demir' });
  }
  if (status === 'approved') {
    events.push({ id: 'e10', timestamp: '2026-01-17T14:00:00Z', type: 'approved', description: 'Visa application approved', user: 'Supervisor Arslan' });
  }
  if (status === 'rejected') {
    events.push({ id: 'e10', timestamp: '2026-01-17T14:00:00Z', type: 'rejected', description: 'Visa application rejected — document fraud confirmed', user: 'Supervisor Arslan' });
  }
  return events;
}

// Risk score distribution: 40% low, 30% med, 20% high, 10% critical
const riskDistribution = [
  ...Array(12).fill('low'),
  ...Array(9).fill('medium'),
  ...Array(6).fill('high'),
  ...Array(3).fill('critical'),
];

const statusDistribution: CaseStatus[] = ['new', 'scanning', 'in_review', 'in_review', 'in_review', 'escalated', 'approved', 'approved', 'approved', 'rejected'];

export const v3Cases: V3Case[] = applicantNames.map((nameData, i) => {
  const [firstName, lastName, gender] = nameData;
  const nat = randomFrom(NATIONALITIES);
  const riskBucket = riskDistribution[i % riskDistribution.length];
  const riskScore = riskBucket === 'low' ? Math.floor(Math.random() * 25) + 5
    : riskBucket === 'medium' ? Math.floor(Math.random() * 25) + 30
    : riskBucket === 'high' ? Math.floor(Math.random() * 15) + 62
    : Math.floor(Math.random() * 12) + 85;
  const riskLevel = generateRiskLevel(riskScore);
  const status = randomFrom(statusDistribution);
  const findingCount = riskLevel === 'low' ? Math.floor(Math.random() * 2) + 1
    : riskLevel === 'medium' ? Math.floor(Math.random() * 3) + 2
    : riskLevel === 'high' ? Math.floor(Math.random() * 4) + 4
    : Math.floor(Math.random() * 4) + 6;
  const caseId = `PL-2026-${String(100 + i).padStart(5, '0')}`;
  const breakdown: RiskBreakdown = {
    document: Math.min(100, Math.max(0, riskScore + Math.floor(Math.random() * 30 - 15))),
    identity: Math.min(100, Math.max(0, riskScore + Math.floor(Math.random() * 30 - 15))),
    travel: Math.min(100, Math.max(0, riskScore + Math.floor(Math.random() * 30 - 15))),
    financial: Math.min(100, Math.max(0, riskScore + Math.floor(Math.random() * 30 - 15))),
    network: Math.min(100, Math.max(0, riskScore + Math.floor(Math.random() * 30 - 15))),
    digitalFootprint: Math.min(100, Math.max(0, riskScore + Math.floor(Math.random() * 30 - 15))),
  };
  const riskFactors = [
    'Social media inconsistency with declared income',
    'Employment verification failed',
    'Travel pattern anomaly detected',
    'Financial document irregularity',
    'Connected to flagged network',
    'Digital footprint contradicts application',
    'Previous visa rejection undisclosed',
    'Document tampering suspected',
  ].sort(() => Math.random() - 0.5).slice(0, Math.min(5, Math.max(1, Math.floor(riskScore / 20))));

  return {
    id: `case-v3-${i}`,
    caseId,
    applicant: {
      firstName, lastName, gender,
      dateOfBirth: `${1970 + Math.floor(Math.random() * 30)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      nationality: nat,
      passportNumber: generatePassport(nat),
    },
    applicationDate: `2026-01-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    consulateLocation: randomFrom(CONSULATES),
    travelDestination: randomFrom(DESTINATIONS),
    riskScore, riskLevel, status,
    assignedOfficer: randomFrom(officers),
    osintFindings: generateFindings(findingCount),
    documents: generateDocuments(),
    timeline: generateTimeline(caseId, status),
    riskBreakdown: breakdown,
    riskFactors,
    createdAt: `2026-01-${String(Math.floor(Math.random() * 15) + 1).padStart(2, '0')}T${String(Math.floor(Math.random() * 12) + 8).padStart(2, '0')}:00:00Z`,
    updatedAt: `2026-01-${String(Math.floor(Math.random() * 13) + 16).padStart(2, '0')}T${String(Math.floor(Math.random() * 12) + 8).padStart(2, '0')}:00:00Z`,
  };
});

// ---------- DEFENCE SCANS ----------

export interface OpsecViolation {
  type: 'location_leak' | 'operational_disclosure' | 'personnel_identification' | 'relationship_mapping' | 'live_streaming' | 'pattern_of_life';
  severity: RiskLevel;
  platform: string;
  content: string;
  location?: string;
  timestamp: string;
}

export interface PersonnelResult {
  id: string;
  name: string;
  rank: string;
  unit: string;
  branch: string;
  profilesFound: number;
  opsecViolations: OpsecViolation[];
  overallRisk: RiskLevel;
}

export interface DefenceScan {
  scanId: string;
  scanType: 'batch' | 'individual';
  personnelCount: number;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  startedAt: string;
  completedAt?: string;
  results: PersonnelResult[];
}

const personnelData: [string, string, string, string][] = [
  ['Cpt. Ahmet Yıldız', 'Captain', '3rd Mechanized Brigade', 'Army'],
  ['Sgt. Burak Aydın', 'Sergeant', '1st Commando Brigade', 'Army'],
  ['Lt. Emre Koç', 'Lieutenant', 'Naval Aviation', 'Navy'],
  ['Pvt. Kemal Aslan', 'Private', '2nd Armored Division', 'Army'],
  ['Cpl. Serkan Doğan', 'Corporal', 'Air Defence Command', 'Air Force'],
  ['Maj. Hakan Öztürk', 'Major', 'Special Forces Command', 'Army'],
  ['WO. Murat Güneş', 'Warrant Officer', '4th Corps', 'Army'],
  ['Ens. Barış Deniz', 'Ensign', 'Fleet Command', 'Navy'],
  ['Sgt. Onur Yavuz', 'Sergeant', '7th Main Jet Base', 'Air Force'],
  ['Lt. Cem Akar', 'Lieutenant', 'Gendarmerie Intelligence', 'Gendarmerie'],
  ['Cpt. Tolga Kara', 'Captain', '5th Armored Brigade', 'Army'],
  ['Pvt. İlker Şen', 'Private', '66th Mechanized Infantry', 'Army'],
];

const violationTemplates: Omit<OpsecViolation, 'timestamp'>[] = [
  { type: 'location_leak', severity: 'critical', platform: 'Instagram', content: 'Photo geotagged at classified military installation. Exact coordinates visible in EXIF data.', location: '39.9208° N, 32.8541° E' },
  { type: 'operational_disclosure', severity: 'critical', platform: 'TikTok', content: 'Video showing interior of command vehicle with visible radio frequencies and unit callsigns on whiteboard.', location: 'Şırnak Province' },
  { type: 'personnel_identification', severity: 'high', platform: 'Facebook', content: 'Group photo with unit designation visible on uniforms. 12 personnel identified. Names tagged.', location: undefined },
  { type: 'pattern_of_life', severity: 'high', platform: 'Strava', content: 'Daily running routes trace exact perimeter of military base. Shift patterns visible from activity timestamps.', location: 'Incirlik region' },
  { type: 'relationship_mapping', severity: 'medium', platform: 'LinkedIn', content: 'Profile lists unit, rank, and commanding officer name. Connected to 47 other military personnel.', location: undefined },
  { type: 'live_streaming', severity: 'critical', platform: 'TikTok', content: 'Live stream from military barracks showing equipment, schedules posted on wall, and colleague faces.', location: 'Batman Province' },
  { type: 'location_leak', severity: 'high', platform: 'Strava', content: 'Running route overlaps with patrol route near Syrian border. Times correlate with known patrol schedule.', location: 'Hatay Province' },
  { type: 'operational_disclosure', severity: 'medium', platform: 'Twitter', content: 'Tweet referencing upcoming deployment date and destination. Since deleted but cached.', location: undefined },
];

function generatePersonnel(count: number): PersonnelResult[] {
  return personnelData.slice(0, count).map((p, i) => {
    const violationCount = Math.floor(Math.random() * 4);
    const violations = [...violationTemplates].sort(() => Math.random() - 0.5).slice(0, violationCount).map(v => ({
      ...v,
      timestamp: new Date(2026, 0, Math.floor(Math.random() * 28) + 1).toISOString(),
    }));
    const maxSeverity = violations.reduce((max, v) => {
      const order: Record<RiskLevel, number> = { low: 0, medium: 1, high: 2, critical: 3 };
      return order[v.severity] > order[max] ? v.severity : max;
    }, 'low' as RiskLevel);
    return {
      id: `personnel-${i}`,
      name: p[0], rank: p[1], unit: p[2], branch: p[3],
      profilesFound: Math.floor(Math.random() * 5) + 1,
      opsecViolations: violations,
      overallRisk: violations.length === 0 ? 'low' : maxSeverity,
    };
  });
}

export const defenceScans: DefenceScan[] = [
  {
    scanId: 'SCAN-2026-0031', scanType: 'batch', personnelCount: 12,
    status: 'completed', progress: 100,
    startedAt: '2026-01-20T08:00:00Z', completedAt: '2026-01-20T08:47:00Z',
    results: generatePersonnel(12),
  },
  {
    scanId: 'SCAN-2026-0032', scanType: 'batch', personnelCount: 8,
    status: 'running', progress: 62,
    startedAt: '2026-01-28T14:00:00Z',
    results: generatePersonnel(5),
  },
  {
    scanId: 'SCAN-2026-0033', scanType: 'individual', personnelCount: 1,
    status: 'completed', progress: 100,
    startedAt: '2026-01-25T11:00:00Z', completedAt: '2026-01-25T11:12:00Z',
    results: generatePersonnel(1),
  },
];

// ---------- ACTIVITY FEED ----------

export interface ActivityEntry {
  id: string;
  type: 'scan_complete' | 'case_escalated' | 'case_approved' | 'case_rejected' | 'finding_added' | 'scan_started';
  description: string;
  timestamp: string;
}

export const activityFeed: ActivityEntry[] = [
  { id: 'a1', type: 'scan_complete', description: 'Scan completed for PL-2026-00142 — 7 findings detected', timestamp: '2026-01-28T15:42:00Z' },
  { id: 'a2', type: 'case_escalated', description: 'Case PL-2026-00138 escalated by Officer Demir — high-risk network', timestamp: '2026-01-28T15:38:00Z' },
  { id: 'a3', type: 'case_approved', description: 'Case PL-2026-00129 approved by Supervisor Arslan', timestamp: '2026-01-28T15:30:00Z' },
  { id: 'a4', type: 'finding_added', description: 'Critical finding: document fraud detected in PL-2026-00145', timestamp: '2026-01-28T15:25:00Z' },
  { id: 'a5', type: 'scan_started', description: 'OSINT scan initiated for PL-2026-00150 — 6 platforms', timestamp: '2026-01-28T15:20:00Z' },
  { id: 'a6', type: 'case_rejected', description: 'Case PL-2026-00133 rejected — financial document fraud confirmed', timestamp: '2026-01-28T15:15:00Z' },
  { id: 'a7', type: 'scan_complete', description: 'Defence scan SCAN-2026-0032 — 5/8 personnel scanned', timestamp: '2026-01-28T15:10:00Z' },
  { id: 'a8', type: 'finding_added', description: 'Instagram scrub detected for applicant in PL-2026-00147', timestamp: '2026-01-28T15:05:00Z' },
  { id: 'a9', type: 'case_escalated', description: 'Case PL-2026-00141 escalated — connected to flagged network', timestamp: '2026-01-28T14:55:00Z' },
  { id: 'a10', type: 'case_approved', description: 'Case PL-2026-00125 approved by Officer Kaya', timestamp: '2026-01-28T14:50:00Z' },
  { id: 'a11', type: 'scan_complete', description: 'Scan completed for PL-2026-00148 — clean profile', timestamp: '2026-01-28T14:45:00Z' },
  { id: 'a12', type: 'finding_added', description: 'Strava location leak found for PL-2026-00143', timestamp: '2026-01-28T14:40:00Z' },
  { id: 'a13', type: 'scan_started', description: 'Batch defence scan initiated — 8 personnel', timestamp: '2026-01-28T14:35:00Z' },
  { id: 'a14', type: 'case_approved', description: 'Case PL-2026-00121 approved by Supervisor Arslan', timestamp: '2026-01-28T14:30:00Z' },
  { id: 'a15', type: 'finding_added', description: 'Dark web email match found for PL-2026-00146', timestamp: '2026-01-28T14:25:00Z' },
];

// ---------- TOP RISK SIGNALS ----------

export const topRiskSignals = [
  { label: 'Social media inconsistency', count: 23, trend: 'up' as const },
  { label: 'Travel pattern anomaly', count: 14, trend: 'up' as const },
  { label: 'Financial doc irregularity', count: 11, trend: 'stable' as const },
  { label: 'Employment verification fail', count: 9, trend: 'down' as const },
  { label: 'Network connection to flagged', count: 7, trend: 'up' as const },
  { label: 'Document tampering', count: 5, trend: 'stable' as const },
  { label: 'Previous rejection undisclosed', count: 4, trend: 'down' as const },
];

// ---------- OSINT TOOL STATUS ----------

export const osintTools = [
  { name: 'Sherlock', status: 'online' as const, lastCheck: '2026-01-28T15:40:00Z' },
  { name: 'Maigret', status: 'online' as const, lastCheck: '2026-01-28T15:40:00Z' },
  { name: 'Holehe', status: 'rate_limited' as const, lastCheck: '2026-01-28T15:35:00Z' },
  { name: 'GHunt', status: 'online' as const, lastCheck: '2026-01-28T15:40:00Z' },
  { name: 'Blackbird', status: 'online' as const, lastCheck: '2026-01-28T15:40:00Z' },
  { name: 'Social Analyzer', status: 'offline' as const, lastCheck: '2026-01-28T14:00:00Z' },
  { name: 'PhoneInfoga', status: 'online' as const, lastCheck: '2026-01-28T15:40:00Z' },
  { name: 'theHarvester', status: 'online' as const, lastCheck: '2026-01-28T15:38:00Z' },
];

// ---------- NATIONALITY FLAGS ----------

export const nationalityFlags: Record<string, string> = {
  TR: '🇹🇷', IR: '🇮🇷', IQ: '🇮🇶', SY: '🇸🇾', RU: '🇷🇺', UA: '🇺🇦',
  GE: '🇬🇪', AZ: '🇦🇿', KZ: '🇰🇿', UZ: '🇺🇿', TM: '🇹🇲', AF: '🇦🇫',
  PK: '🇵🇰', EG: '🇪🇬', TN: '🇹🇳', MA: '🇲🇦', LB: '🇱🇧', JO: '🇯🇴',
  DE: '🇩🇪', FR: '🇫🇷', NL: '🇳🇱', IT: '🇮🇹', ES: '🇪🇸', BE: '🇧🇪',
  AT: '🇦🇹', SE: '🇸🇪', NO: '🇳🇴', DK: '🇩🇰', CH: '🇨🇭', PL: '🇵🇱', CZ: '🇨🇿',
};

// ---------- KPI DATA ----------

export const kpiData = {
  totalCases: v3Cases.length,
  pendingReview: v3Cases.filter(c => c.status === 'in_review').length,
  highRiskFlagged: v3Cases.filter(c => c.riskLevel === 'high' || c.riskLevel === 'critical').length,
  activeScans: 2,
  avgProcessingTime: '4.2 min',
  approvalRate: Math.round((v3Cases.filter(c => c.status === 'approved').length / v3Cases.length) * 100),
};
