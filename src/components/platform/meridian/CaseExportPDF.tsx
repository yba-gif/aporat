import { useState } from 'react';
import { 
  FileDown, 
  Loader2,
  FileText,
  Shield,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getCaseById, type Case, type RedFlag } from './caseData';
import { getEntityForCase, type EntityProfile, type OsintFinding, type SocialProfile } from './pdfOsintData';

interface CaseExportPDFProps {
  caseId: string;
  caseNumber: string;
  applicantName: string;
  riskScore: number;
  status: string;
}

function getRiskClass(score: number): string {
  if (score >= 80) return 'risk-critical';
  if (score >= 60) return 'risk-high';
  if (score >= 40) return 'risk-medium';
  return 'risk-low';
}

function getRiskLabel(score: number): string {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' });
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-GB', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function getSeverityLabel(sev: string): string {
  return sev === 'critical' ? '🔴 CRITICAL' : sev === 'high' ? '🟠 HIGH' : '🟡 MEDIUM';
}

function generatePDFHTML(caseData: Case, entity?: EntityProfile): string {
  const date = new Date().toISOString().split('T')[0];
  const riskClass = getRiskClass(caseData.riskScore);
  const riskLabel = getRiskLabel(caseData.riskScore);

  const redFlagsHTML = caseData.redFlags.length > 0
    ? caseData.redFlags.map((flag: RedFlag, idx: number) => `
      <div class="flag flag-${flag.severity}">
        <div class="flag-title">#${idx + 1} ${flag.title}</div>
        <div class="flag-desc">${flag.description}</div>
        <div class="flag-source">Source: ${flag.source} | Evidence: ${flag.evidence}</div>
      </div>
    `).join('')
    : '<p class="no-flags">No red flags identified. Application passed all automated checks.</p>';

  const linkedEntitiesHTML = caseData.linkedEntities.length > 0
    ? `<ul class="entity-list">${caseData.linkedEntities.map(e => `<li>${e}</li>`).join('')}</ul>`
    : '<p style="font-size:12px;color:#6b7280;">No linked entities.</p>';

  const statusFormatted = caseData.status.replace(/_/g, ' ').toUpperCase();
  const priorityFormatted = caseData.priority.toUpperCase();
  const slaStatus = caseData.slaBreach
    ? '<span style="color:#dc2626;font-weight:600;">⚠ SLA BREACHED</span>'
    : `<span style="color:#16a34a;">On Track — Due ${formatDateTime(caseData.slaDeadline)}</span>`;

  // --- OSINT & Social Intelligence sections ---
  const osintSectionHTML = entity ? generateOsintHTML(entity) : '';
  const socialSectionHTML = entity ? generateSocialHTML(entity) : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Case Summary — ${caseData.caseNumber}</title>
  <style>
    @page { size: A4; margin: 20mm 18mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; 
      padding: 0; 
      max-width: 174mm; 
      margin: 0 auto;
      color: #1a1a2e;
      line-height: 1.55;
      font-size: 13px;
    }
    .header { 
      display: flex; justify-content: space-between; align-items: flex-start;
      padding-bottom: 18px; margin-bottom: 22px; border-bottom: 3px solid #1a1a2e;
    }
    .logo { font-size: 22px; font-weight: 700; color: #1a1a2e; letter-spacing: -0.5px; }
    .logo span { color: #2563eb; }
    .logo-sub { font-size: 11px; color: #6b7280; margin-top: 3px; letter-spacing: 0.2px; }
    .classification { background: #dc2626; color: white; padding: 5px 14px; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; }
    .doc-title { font-size: 20px; font-weight: 700; margin-bottom: 8px; color: #0f172a; }
    .doc-meta { font-size: 12px; color: #6b7280; margin-bottom: 24px; margin-top: 4px; }
    .section { margin-bottom: 22px; page-break-inside: avoid; }
    .section-title { font-size: 11px; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1.5px solid #cbd5e1; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px 24px; }
    .field-label { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
    .field-value { font-size: 13px; font-weight: 600; color: #0f172a; }
    .risk-badge { display: inline-flex; align-items: center; gap: 10px; padding: 10px 20px; border-radius: 8px; font-weight: 700; font-size: 24px; }
    .risk-label { font-size: 11px; font-weight: 600; letter-spacing: 0.5px; }
    .risk-critical { background: #fef2f2; color: #dc2626; border: 2px solid #fca5a5; }
    .risk-high { background: #fff7ed; color: #ea580c; border: 2px solid #fdba74; }
    .risk-medium { background: #fefce8; color: #ca8a04; border: 2px solid #fde047; }
    .risk-low { background: #f0fdf4; color: #16a34a; border: 2px solid #86efac; }
    .flag { padding: 12px 14px; margin-bottom: 10px; border-radius: 6px; border-left: 4px solid; page-break-inside: avoid; }
    .flag-critical { background: #fef2f2; border-color: #dc2626; }
    .flag-high { background: #fff7ed; border-color: #ea580c; }
    .flag-medium { background: #fefce8; border-color: #ca8a04; }
    .flag-title { font-weight: 700; font-size: 12px; margin-bottom: 4px; color: #0f172a; }
    .flag-desc { font-size: 12px; color: #374151; line-height: 1.5; }
    .flag-source { font-size: 10px; color: #9ca3af; margin-top: 6px; font-style: italic; }
    .no-flags { font-size: 12px; color: #16a34a; font-weight: 500; padding: 10px; background: #f0fdf4; border-radius: 6px; }
    .entity-list { padding-left: 18px; font-size: 12px; }
    .entity-list li { margin-bottom: 4px; color: #374151; }
    .timeline { border-left: 2px solid #cbd5e1; padding-left: 20px; margin-left: 4px; }
    .timeline-item { margin-bottom: 14px; position: relative; page-break-inside: avoid; }
    .timeline-item::before { content: ''; position: absolute; left: -25px; top: 5px; width: 10px; height: 10px; border-radius: 50%; background: #2563eb; border: 2px solid white; box-shadow: 0 0 0 2px #2563eb; }
    .timeline-date { font-size: 10px; color: #94a3b8; font-weight: 500; }
    .timeline-action { font-size: 12px; font-weight: 600; color: #0f172a; }
    .timeline-actor { font-size: 11px; color: #64748b; }
    .signature-block { margin-top: 32px; page-break-inside: avoid; }
    .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
    .sig-label { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .sig-line { border-top: 1px solid #0f172a; margin-top: 40px; padding-top: 6px; font-size: 11px; color: #0f172a; font-weight: 500; }
    .sig-date { font-size: 10px; color: #64748b; margin-top: 4px; }
    .footer { margin-top: 36px; padding-top: 14px; border-top: 2px solid #1a1a2e; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between; page-break-inside: avoid; }
    .footer strong { color: #475569; }
    /* Social & OSINT styles */
    .profile-card { display: flex; align-items: center; gap: 12px; padding: 10px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 8px; page-break-inside: avoid; }
    .profile-icon { font-size: 18px; width: 28px; text-align: center; }
    .profile-handle { font-size: 12px; font-weight: 600; color: #0f172a; }
    .profile-meta { font-size: 10px; color: #64748b; }
    .profile-risk { font-size: 10px; color: #dc2626; margin-top: 2px; }
    .narrative-box { background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 14px; font-size: 12px; color: #334155; line-height: 1.6; margin-bottom: 14px; }
    .conn-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 10px; }
    .conn-table th { text-align: left; padding: 6px 8px; background: #f1f5f9; color: #475569; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1.5px solid #cbd5e1; }
    .conn-table td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; color: #374151; }
    .conn-flagged { color: #dc2626; font-weight: 600; }
    @media print { body { padding: 0; max-width: none; } .no-print { display: none; } }
    @media screen { body { padding: 48px 44px; max-width: 210mm; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">Portolan<span>Labs</span></div>
      <div class="logo-sub">Mobility Compliance Intelligence Platform — Meridian Case Management</div>
    </div>
    <div class="classification">Official — Sensitive</div>
  </div>

  <div class="doc-title">Case Investigation Summary</div>
  <div class="doc-meta">${caseData.caseNumber} &nbsp;|&nbsp; Generated: ${date} &nbsp;|&nbsp; Classification: OFFICIAL — SENSITIVE</div>

  <div class="section">
    <div class="section-title">Subject Information</div>
    <div class="grid">
      <div><div class="field-label">Applicant Name</div><div class="field-value">${caseData.applicant}</div></div>
      <div><div class="field-label">Case Number</div><div class="field-value">${caseData.caseNumber}</div></div>
      <div><div class="field-label">Case Type</div><div class="field-value">${caseData.type}</div></div>
      <div><div class="field-label">Status</div><div class="field-value">${statusFormatted}</div></div>
      <div><div class="field-label">Priority</div><div class="field-value">${priorityFormatted}</div></div>
      <div><div class="field-label">Assigned Officer</div><div class="field-value">${caseData.assignee}</div></div>
      <div><div class="field-label">Team</div><div class="field-value">${caseData.team}</div></div>
      <div><div class="field-label">SLA Status</div><div class="field-value">${slaStatus}</div></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Risk Assessment</div>
    <div style="display:flex;align-items:center;gap:16px;">
      <div class="risk-badge ${riskClass}">${caseData.riskScore}<span style="font-size:16px;font-weight:400;">/100</span></div>
      <div>
        <div class="risk-label" style="color:inherit;">Composite Risk Score — ${riskLabel}</div>
        <div style="font-size:11px;color:#64748b;margin-top:2px;">Based on document integrity, network analysis, and behavioral signals</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Case Statistics</div>
    <div class="grid-3">
      <div><div class="field-label">Documents</div><div class="field-value">${caseData.documents} files</div></div>
      <div><div class="field-label">Investigation Notes</div><div class="field-value">${caseData.notes} entries</div></div>
      <div><div class="field-label">Red Flags</div><div class="field-value">${caseData.redFlags.length} identified</div></div>
      <div><div class="field-label">Created</div><div class="field-value">${formatDate(caseData.createdAt)}</div></div>
      <div><div class="field-label">Last Updated</div><div class="field-value">${formatDate(caseData.updatedAt)}</div></div>
      <div><div class="field-label">SLA Deadline</div><div class="field-value">${formatDateTime(caseData.slaDeadline)}</div></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Red Flag Summary (${caseData.redFlags.length} Identified)</div>
    ${redFlagsHTML}
  </div>

  ${socialSectionHTML}

  ${osintSectionHTML}

  <div class="section">
    <div class="section-title">Linked Entities (${caseData.linkedEntities.length})</div>
    ${linkedEntitiesHTML}
  </div>

  <div class="section">
    <div class="section-title">Decision Trail</div>
    <div class="timeline">
      <div class="timeline-item">
        <div class="timeline-date">${formatDateTime(caseData.createdAt)}</div>
        <div class="timeline-action">Case Created & Document Ingestion</div>
        <div class="timeline-actor">SYSTEM — ${caseData.documents} documents ingested, SHA-256 hashes sealed</div>
      </div>
      <div class="timeline-item">
        <div class="timeline-date">${formatDateTime(caseData.createdAt)}</div>
        <div class="timeline-action">Automated Risk Assessment</div>
        <div class="timeline-actor">RISK ENGINE — Composite score: ${caseData.riskScore}/100, ${caseData.redFlags.length} red flags auto-detected</div>
      </div>
      ${caseData.redFlags.length > 0 ? `
      <div class="timeline-item">
        <div class="timeline-date">${formatDateTime(caseData.createdAt)}</div>
        <div class="timeline-action">Network Analysis Complete</div>
        <div class="timeline-actor">NAUTICA — ${caseData.linkedEntities.length} linked entities identified</div>
      </div>` : ''}
      ${entity ? `
      <div class="timeline-item">
        <div class="timeline-date">${formatDateTime(caseData.updatedAt)}</div>
        <div class="timeline-action">OSINT Scan Completed</div>
        <div class="timeline-actor">SOCIAL INTELLIGENCE — ${entity.osintFindings.length} findings across ${entity.socialProfiles.length} platforms</div>
      </div>` : ''}
      <div class="timeline-item">
        <div class="timeline-date">${formatDateTime(caseData.updatedAt)}</div>
        <div class="timeline-action">Status: ${statusFormatted}</div>
        <div class="timeline-actor">${caseData.assignee} — ${caseData.status === 'closed' ? 'Case resolved and closed' : 'Investigation ongoing'}</div>
      </div>
    </div>
  </div>

  <div class="signature-block">
    <div class="sig-grid">
      <div>
        <div class="sig-label">Reviewing Officer Signature</div>
        <div class="sig-line">${caseData.assignee}</div>
        <div class="sig-date">Date: _______________</div>
      </div>
      <div>
        <div class="sig-label">Authorizing Supervisor Signature</div>
        <div class="sig-line">&nbsp;</div>
        <div class="sig-date">Date: _______________</div>
      </div>
    </div>
  </div>

  <div class="footer">
    <div>
      <strong>PORTOLAN LABS</strong> — Meridian Case Management System<br>
      Case ID: ${caseData.caseNumber} &nbsp;|&nbsp; Report ID: ${caseData.id} &nbsp;|&nbsp; Version: 1.0
    </div>
    <div style="text-align:right;">
      <span style="background:#dc2626;color:white;padding:2px 8px;font-size:9px;font-weight:700;letter-spacing:1px;">OFFICIAL — SENSITIVE</span><br>
      Retention: 10 Years &nbsp;|&nbsp; Page 1 of 1
    </div>
  </div>
</body>
</html>`;
}

const PLATFORM_ICONS: Record<string, string> = {
  instagram: '📸', twitter: '𝕏', linkedin: '💼', facebook: '📘', telegram: '✈️',
};

function generateSocialHTML(entity: EntityProfile): string {
  if (entity.socialProfiles.length === 0 && entity.connections.length === 0) return '';

  const profilesHTML = entity.socialProfiles.map(p => `
    <div class="profile-card">
      <div class="profile-icon">${PLATFORM_ICONS[p.platform] || '🌐'}</div>
      <div>
        <div class="profile-handle">${p.handle} <span style="font-weight:400;color:#64748b;">(${p.platform})</span></div>
        <div class="profile-meta">${p.followers.toLocaleString()} followers · ${p.following.toLocaleString()} following${p.verified ? ' · ✓ Verified' : ''}</div>
        ${p.riskIndicators.length > 0 ? `<div class="profile-risk">⚠ ${p.riskIndicators.join(' · ')}</div>` : ''}
      </div>
    </div>
  `).join('');

  const connectionsHTML = entity.connections.length > 0 ? `
    <table class="conn-table">
      <thead><tr><th>Name</th><th>Relationship</th><th>Risk</th><th>Flagged</th></tr></thead>
      <tbody>${entity.connections.map(c => `
        <tr>
          <td>${c.name}</td>
          <td>${c.relationship}</td>
          <td class="${c.riskScore >= 60 ? 'conn-flagged' : ''}">${c.riskScore}/100</td>
          <td>${c.flagged ? '🔴 Yes' : '—'}</td>
        </tr>
      `).join('')}</tbody>
    </table>
  ` : '';

  return `
  <div class="section">
    <div class="section-title">Social Intelligence — Digital Footprint (${entity.socialProfiles.length} Profiles)</div>
    <div class="narrative-box">${entity.riskNarrative}</div>
    ${profilesHTML}
    ${entity.connections.length > 0 ? `
      <div style="margin-top:14px;">
        <div style="font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Social Network Connections (${entity.connections.length})</div>
        ${connectionsHTML}
      </div>
    ` : ''}
  </div>`;
}

function generateOsintHTML(entity: EntityProfile): string {
  if (entity.osintFindings.length === 0) return '';

  const findingsHTML = entity.osintFindings.map((f, idx) => `
    <div class="flag flag-${f.severity}">
      <div class="flag-title">#${idx + 1} [${f.source}] ${f.category}</div>
      <div class="flag-desc">${f.detail}</div>
      <div class="flag-source">Collected: ${formatDateTime(f.timestamp)} | Severity: ${getSeverityLabel(f.severity)}</div>
    </div>
  `).join('');

  const bySeverity = { critical: 0, high: 0, medium: 0, low: 0 };
  entity.osintFindings.forEach(f => bySeverity[f.severity]++);
  const summaryParts = [];
  if (bySeverity.critical > 0) summaryParts.push(`🔴 ${bySeverity.critical} Critical`);
  if (bySeverity.high > 0) summaryParts.push(`🟠 ${bySeverity.high} High`);
  if (bySeverity.medium > 0) summaryParts.push(`🟡 ${bySeverity.medium} Medium`);

  return `
  <div class="section">
    <div class="section-title">OSINT Scan Results (${entity.osintFindings.length} Findings)</div>
    <div style="font-size:11px;color:#475569;margin-bottom:10px;">${summaryParts.join(' &nbsp;|&nbsp; ')}</div>
    ${findingsHTML}
  </div>`;
}

export function CaseExportPDF({ 
  caseId, 
  caseNumber, 
  applicantName, 
  riskScore,
  status
}: CaseExportPDFProps) {
  const [exporting, setExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const caseData = getCaseById(caseId);
  const entity = getEntityForCase(caseData?.applicant ?? applicantName);

  const handleExport = async () => {
    setExporting(true);

    const data = caseData || {
      id: caseId,
      caseNumber,
      applicant: applicantName,
      type: 'Visa Fraud Investigation',
      status: status as any,
      priority: 'high' as const,
      riskScore,
      assignee: 'Officer Yilmaz',
      team: 'Fraud Detection Unit',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documents: 0,
      notes: 0,
      linkedEntities: [],
      slaDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      slaBreach: false,
      redFlags: [],
    };

    const htmlContent = generatePDFHTML(data, entity);

    // Open in a new window for print-to-PDF
    const printWindow = window.open('', '_blank', 'width=800,height=1100');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      // Short delay to ensure styles render before print dialog
      setTimeout(() => {
        printWindow.print();
      }, 500);
    } else {
      // Fallback: download as HTML
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.caseNumber}-summary.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    setExporting(false);
    toast.success('Case summary ready for export');
  };

  const effectiveRiskScore = caseData?.riskScore ?? riskScore;
  const effectiveRedFlags = caseData?.redFlags ?? [];

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleExport} 
        disabled={exporting}
        className="w-full gap-2"
        variant="outline"
      >
        {exporting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating PDF...
          </>
        ) : (
          <>
            <FileDown className="w-4 h-4" />
            Export Case Summary
          </>
        )}
      </Button>

      <Button 
        variant="ghost" 
        size="sm" 
        className="w-full text-xs"
        onClick={() => setShowPreview(!showPreview)}
      >
        {showPreview ? 'Hide Preview' : 'Show Preview'}
      </Button>

      {showPreview && (
        <div className="border border-border rounded-lg p-4 bg-card/50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent" />
              <span className="font-medium text-sm">Case Summary Preview</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 bg-destructive/20 text-destructive rounded">
              OFFICIAL — SENSITIVE
            </span>
          </div>

          <div className="text-xs space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-muted-foreground">Case</p>
                <p className="font-medium">{caseData?.caseNumber ?? caseNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Applicant</p>
                <p className="font-medium">{caseData?.applicant ?? applicantName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Priority</p>
                <p className="font-medium capitalize">{caseData?.priority ?? 'high'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Team</p>
                <p className="font-medium">{caseData?.team ?? 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3 text-destructive" />
              <span className="text-destructive font-bold">{effectiveRiskScore}</span>
              <span className="text-muted-foreground">/ 100 Risk Score</span>
            </div>

            <div className="space-y-1.5">
              <p className="text-muted-foreground">Document contains:</p>
              {[
                'Subject Information & Case Metadata',
                `Risk Assessment — Score ${effectiveRiskScore}/100`,
                `Red Flag Summary (${effectiveRedFlags.length} identified)`,
                `Social Intelligence — ${entity?.socialProfiles?.length ?? 0} profiles, ${entity?.connections?.length ?? 0} connections`,
                `OSINT Scan Results (${entity?.osintFindings?.length ?? 0} findings)`,
                `Linked Entities (${caseData?.linkedEntities?.length ?? 0})`,
                'Decision Trail Timeline',
                'Dual Signature Block',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-3 h-3 text-accent" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground">
        Opens browser print dialog for PDF export. Includes red flags, decision trail, linked entities, and source attribution. Classified OFFICIAL — SENSITIVE.
      </p>
    </div>
  );
}
