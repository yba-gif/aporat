import { useState } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2,
  XCircle,
  FileWarning,
  Fingerprint,
  History,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TamperAlert {
  id: string;
  documentName: string;
  alertType: 'hash_mismatch' | 'metadata_anomaly' | 'signature_invalid' | 'duplicate_hash';
  severity: 'critical' | 'high' | 'medium';
  detectedAt: string;
  details: string;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  investigator?: string;
}

const TAMPER_ALERTS: TamperAlert[] = [
  {
    id: 'ta-001',
    documentName: 'passport_volkov_d.pdf',
    alertType: 'hash_mismatch',
    severity: 'critical',
    detectedAt: '2026-01-28T14:45:00Z',
    details: 'Document hash differs from original ingestion. Possible tampering detected.',
    status: 'investigating',
    investigator: 'Officer Yilmaz'
  },
  {
    id: 'ta-002',
    documentName: 'bank_statement_apex.pdf',
    alertType: 'duplicate_hash',
    severity: 'critical',
    detectedAt: '2026-01-28T13:20:00Z',
    details: 'Hash matches template document flagged in Visa Mill investigation.',
    status: 'open'
  },
  {
    id: 'ta-003',
    documentName: 'employment_letter_techserve.pdf',
    alertType: 'metadata_anomaly',
    severity: 'high',
    detectedAt: '2026-01-28T11:15:00Z',
    details: 'PDF creation date (2024) predates company registration (2025).',
    status: 'open'
  },
  {
    id: 'ta-004',
    documentName: 'invitation_letter_conference.pdf',
    alertType: 'signature_invalid',
    severity: 'medium',
    detectedAt: '2026-01-28T09:30:00Z',
    details: 'Digital signature verification failed. Signatory not in trusted registry.',
    status: 'resolved'
  }
];

export function TamperDetection() {
  const [alerts, setAlerts] = useState(TAMPER_ALERTS);
  const [selectedAlert, setSelectedAlert] = useState<TamperAlert | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const runIntegrityScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 3000);
  };

  const getSeverityColor = (severity: TamperAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  const getAlertTypeIcon = (type: TamperAlert['alertType']) => {
    switch (type) {
      case 'hash_mismatch': return <Fingerprint className="w-4 h-4" />;
      case 'duplicate_hash': return <FileWarning className="w-4 h-4" />;
      case 'metadata_anomaly': return <History className="w-4 h-4" />;
      case 'signature_invalid': return <XCircle className="w-4 h-4" />;
    }
  };

  const openAlerts = alerts.filter(a => a.status === 'open' || a.status === 'investigating');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-destructive/10 rounded">
            <Shield className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold">Tamper Detection</h3>
            <p className="text-xs text-muted-foreground">
              {openAlerts.length} active alerts
            </p>
          </div>
        </div>
        <Button 
          onClick={runIntegrityScan}
          disabled={isScanning}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          {isScanning ? (
            <>
              <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Run Scan
            </>
          )}
        </Button>
      </div>

      {/* Alerts Grid */}
      <div className="space-y-2">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              alert.status === 'resolved' ? 'opacity-50' : ''
            } ${getSeverityColor(alert.severity)}`}
            onClick={() => setSelectedAlert(alert)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {getAlertTypeIcon(alert.alertType)}
                <div>
                  <p className="font-medium text-sm">{alert.documentName}</p>
                  <p className="text-xs mt-1 opacity-80">{alert.details}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] opacity-70">
                    <span>{new Date(alert.detectedAt).toLocaleString()}</span>
                    {alert.investigator && <span>• {alert.investigator}</span>}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase ${
                  alert.status === 'open' ? 'bg-destructive/30' :
                  alert.status === 'investigating' ? 'bg-yellow-500/30' :
                  alert.status === 'resolved' ? 'bg-accent/30' :
                  'bg-secondary'
                }`}>
                  {alert.status.replace('_', ' ')}
                </span>
                <span className="text-[10px] font-mono uppercase opacity-70">
                  {alert.alertType.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 bg-secondary/30 rounded text-center">
          <p className="text-xl font-bold text-destructive">
            {alerts.filter(a => a.severity === 'critical' && a.status !== 'resolved').length}
          </p>
          <p className="text-[10px] text-muted-foreground">Critical</p>
        </div>
        <div className="p-3 bg-secondary/30 rounded text-center">
          <p className="text-xl font-bold text-orange-400">
            {alerts.filter(a => a.severity === 'high' && a.status !== 'resolved').length}
          </p>
          <p className="text-[10px] text-muted-foreground">High</p>
        </div>
        <div className="p-3 bg-secondary/30 rounded text-center">
          <p className="text-xl font-bold text-yellow-400">
            {alerts.filter(a => a.status === 'investigating').length}
          </p>
          <p className="text-[10px] text-muted-foreground">Investigating</p>
        </div>
        <div className="p-3 bg-secondary/30 rounded text-center">
          <p className="text-xl font-bold text-accent">
            {alerts.filter(a => a.status === 'resolved').length}
          </p>
          <p className="text-[10px] text-muted-foreground">Resolved</p>
        </div>
      </div>
    </div>
  );
}
