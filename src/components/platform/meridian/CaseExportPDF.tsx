import { useState } from 'react';
import { 
  FileDown, 
  Loader2,
  FileText,
  Shield,
  Network,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CaseExportPDFProps {
  caseId: string;
  caseNumber: string;
  applicantName: string;
  riskScore: number;
  status: string;
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

  const handleExport = async () => {
    setExporting(true);
    
    // Simulate PDF generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate PDF content as HTML and trigger download
    const pdfContent = generatePDFHTML();
    
    // Create a blob and download
    const blob = new Blob([pdfContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${caseNumber}-summary.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setExporting(false);
    toast.success('Case summary exported successfully');
  };

  const generatePDFHTML = () => {
    const date = new Date().toISOString().split('T')[0];
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Case Summary - ${caseNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', system-ui, sans-serif; 
      padding: 40px; 
      max-width: 800px; 
      margin: 0 auto;
      color: #1a1a2e;
      line-height: 1.6;
    }
    .header { 
      border-bottom: 3px solid #dc2626; 
      padding-bottom: 20px; 
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .logo { font-size: 24px; font-weight: bold; color: #1a1a2e; }
    .logo span { color: #3b82f6; }
    .classification { 
      background: #dc2626; 
      color: white; 
      padding: 4px 12px; 
      font-size: 11px; 
      font-weight: bold;
      letter-spacing: 1px;
    }
    h1 { font-size: 20px; margin-bottom: 5px; }
    .case-number { color: #6b7280; font-size: 14px; }
    .section { margin-bottom: 25px; }
    .section-title { 
      font-size: 14px; 
      font-weight: 600; 
      color: #3b82f6;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
      padding-bottom: 5px;
      border-bottom: 1px solid #e5e7eb;
    }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .field { margin-bottom: 10px; }
    .field-label { font-size: 11px; color: #6b7280; text-transform: uppercase; }
    .field-value { font-size: 14px; font-weight: 500; }
    .risk-score { 
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: bold;
      font-size: 24px;
    }
    .risk-critical { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
    .risk-high { background: #fff7ed; color: #ea580c; border: 1px solid #fed7aa; }
    .risk-medium { background: #fefce8; color: #ca8a04; border: 1px solid #fef08a; }
    .risk-low { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
    .flag { 
      padding: 12px; 
      margin-bottom: 10px; 
      border-radius: 6px;
      border-left: 4px solid;
    }
    .flag-critical { background: #fef2f2; border-color: #dc2626; }
    .flag-high { background: #fff7ed; border-color: #ea580c; }
    .flag-title { font-weight: 600; font-size: 13px; margin-bottom: 4px; }
    .flag-desc { font-size: 12px; color: #4b5563; }
    .flag-source { font-size: 11px; color: #9ca3af; margin-top: 6px; }
    .timeline { border-left: 2px solid #e5e7eb; padding-left: 20px; }
    .timeline-item { margin-bottom: 15px; position: relative; }
    .timeline-item::before {
      content: '';
      position: absolute;
      left: -25px;
      top: 5px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #3b82f6;
    }
    .timeline-date { font-size: 11px; color: #6b7280; }
    .timeline-action { font-size: 13px; font-weight: 500; }
    .timeline-actor { font-size: 12px; color: #6b7280; }
    .footer { 
      margin-top: 40px; 
      padding-top: 20px; 
      border-top: 1px solid #e5e7eb;
      font-size: 11px;
      color: #6b7280;
      display: flex;
      justify-content: space-between;
    }
    .signature-block { margin-top: 30px; }
    .signature-line { 
      width: 200px; 
      border-top: 1px solid #1a1a2e; 
      margin-top: 40px;
      padding-top: 5px;
      font-size: 12px;
    }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">Portolan<span>Labs</span></div>
      <p style="font-size: 12px; color: #6b7280; margin-top: 5px;">Fraud Detection Intelligence Platform</p>
    </div>
    <div class="classification">OFFICIAL - SENSITIVE</div>
  </div>

  <h1>Case Investigation Summary</h1>
  <p class="case-number">${caseNumber} | Generated: ${date}</p>

  <div class="section" style="margin-top: 25px;">
    <div class="section-title">Subject Information</div>
    <div class="grid">
      <div class="field">
        <div class="field-label">Applicant Name</div>
        <div class="field-value">${applicantName}</div>
      </div>
      <div class="field">
        <div class="field-label">Case Status</div>
        <div class="field-value">${status.replace('_', ' ').toUpperCase()}</div>
      </div>
      <div class="field">
        <div class="field-label">Case Type</div>
        <div class="field-value">Visa Fraud Investigation</div>
      </div>
      <div class="field">
        <div class="field-label">Assigned Officer</div>
        <div class="field-value">Officer Yilmaz</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Risk Assessment</div>
    <div class="risk-score ${riskScore >= 80 ? 'risk-critical' : riskScore >= 60 ? 'risk-high' : riskScore >= 40 ? 'risk-medium' : 'risk-low'}">
      ${riskScore}/100
      <span style="font-size: 12px; font-weight: normal;">Composite Risk Score</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Red Flag Summary (Top 3)</div>
    
    <div class="flag flag-critical">
      <div class="flag-title">#1 Visa Mill Network Connection</div>
      <div class="flag-desc">Applicant connected to known visa mill network through employment agency</div>
      <div class="flag-source">Source: Nautica Intelligence | Evidence: Linked to Apex Travel Agency cluster</div>
    </div>
    
    <div class="flag flag-critical">
      <div class="flag-title">#2 Document Hash Match</div>
      <div class="flag-desc">Bank statement SHA-256 hash matches template used in 8 other applications</div>
      <div class="flag-source">Source: Maris Document Vault | Evidence: Hash match with APP-2024-*, APP-2025-*</div>
    </div>
    
    <div class="flag flag-high">
      <div class="flag-title">#3 Pre-Submission Risk Signal</div>
      <div class="flag-desc">Applicant used shared mobile number with 3 other visa applicants</div>
      <div class="flag-source">Source: vizesepetim.com | Evidence: Mobile hash correlation detected</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Decision Trail</div>
    <div class="timeline">
      <div class="timeline-item">
        <div class="timeline-date">2026-01-25 10:05</div>
        <div class="timeline-action">Document Ingestion Complete</div>
        <div class="timeline-actor">SYSTEM - All documents verified and sealed</div>
      </div>
      <div class="timeline-item">
        <div class="timeline-date">2026-01-25 10:05</div>
        <div class="timeline-action">Automated Risk Assessment</div>
        <div class="timeline-actor">RISK ENGINE - Score 94, flagged for manual review</div>
      </div>
      <div class="timeline-item">
        <div class="timeline-date">2026-01-25 11:00</div>
        <div class="timeline-action">Network Analysis Complete</div>
        <div class="timeline-actor">NAUTICA - Linked to visa mill network cluster</div>
      </div>
      <div class="timeline-item">
        <div class="timeline-date">2026-01-28 09:00</div>
        <div class="timeline-action">Officer Review In Progress</div>
        <div class="timeline-actor">Officer Yilmaz - Reviewing document authenticity</div>
      </div>
    </div>
  </div>

  <div class="signature-block">
    <div class="signature-line">Reviewing Officer Signature</div>
  </div>

  <div class="footer">
    <div>
      <strong>PORTOLAN LABS</strong> | Meridian Case Management System<br>
      Document ID: ${caseId}
    </div>
    <div style="text-align: right;">
      Classification: OFFICIAL - SENSITIVE<br>
      Retention Period: 10 Years
    </div>
  </div>
</body>
</html>
    `.trim();
  };

  return (
    <div className="space-y-4">
      {/* Export Button */}
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

      {/* Preview Toggle */}
      <Button 
        variant="ghost" 
        size="sm" 
        className="w-full text-xs"
        onClick={() => setShowPreview(!showPreview)}
      >
        {showPreview ? 'Hide Preview' : 'Show Preview'}
      </Button>

      {/* Preview */}
      {showPreview && (
        <div className="border border-border rounded-lg p-4 bg-card/50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent" />
              <span className="font-medium text-sm">Case Summary Preview</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 bg-destructive/20 text-destructive rounded">
              OFFICIAL - SENSITIVE
            </span>
          </div>

          <div className="text-xs space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-muted-foreground">Case</p>
                <p className="font-medium">{caseNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Applicant</p>
                <p className="font-medium">{applicantName}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3 text-destructive" />
              <span className="text-destructive font-bold">{riskScore}</span>
              <span className="text-muted-foreground">Risk Score</span>
            </div>

            <div className="space-y-1.5">
              <p className="text-muted-foreground">Contents:</p>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-3 h-3 text-accent" />
                <span>Subject Information</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-3 h-3 text-accent" />
                <span>Risk Assessment Summary</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-3 h-3 text-accent" />
                <span>Red Flag Summary (Top 3)</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-3 h-3 text-accent" />
                <span>Decision Trail Timeline</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-3 h-3 text-accent" />
                <span>Signature Block</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground">
        Export includes red flags, decision trail, and source attribution. Classified as OFFICIAL - SENSITIVE.
      </p>
    </div>
  );
}
