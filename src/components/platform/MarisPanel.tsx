import { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  Hash, 
  Shield, 
  CheckCircle2, 
  Clock,
  Eye,
  FileSearch,
  Fingerprint,
  Link2,
  Database,
  AlertTriangle,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DocumentVault, VaultDocument } from './maris/DocumentVault';
import { TamperDetection } from './maris/TamperDetection';

interface DocumentStage {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'complete';
  details?: string;
}

interface ProcessedDocument {
  id: string;
  name: string;
  type: string;
  hash: string;
  timestamp: string;
  extractedData: Record<string, string>;
  confidence: number;
  flags: string[];
}

export function MarisPanel() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStages, setProcessingStages] = useState<DocumentStage[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<VaultDocument | null>(null);
  const [activeView, setActiveView] = useState<'ingest' | 'vault' | 'integrity'>('vault');

  const simulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    setProcessingStages([
      { id: 'ingest', name: 'Document Ingestion', status: 'pending' },
      { id: 'ocr', name: 'OCR Extraction', status: 'pending' },
      { id: 'hash', name: 'Hash Generation', status: 'pending' },
      { id: 'normalize', name: 'Schema Normalization', status: 'pending' },
      { id: 'validate', name: 'Integrity Validation', status: 'pending' },
    ]);

    const uploadInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 150);

    setTimeout(() => {
      setProcessingStages(prev => prev.map(s => 
        s.id === 'ingest' ? { ...s, status: 'processing' } : s
      ));
    }, 500);

    setTimeout(() => {
      setProcessingStages(prev => prev.map(s => 
        s.id === 'ingest' ? { ...s, status: 'complete', details: 'PDF parsed, 3 pages extracted' } : 
        s.id === 'ocr' ? { ...s, status: 'processing' } : s
      ));
    }, 1500);

    setTimeout(() => {
      setProcessingStages(prev => prev.map(s => 
        s.id === 'ocr' ? { ...s, status: 'complete', details: '847 characters extracted, 94.2% confidence' } : 
        s.id === 'hash' ? { ...s, status: 'processing' } : s
      ));
    }, 2500);

    setTimeout(() => {
      setProcessingStages(prev => prev.map(s => 
        s.id === 'hash' ? { ...s, status: 'complete', details: 'SHA-256: 9f86d08...c2f' } : 
        s.id === 'normalize' ? { ...s, status: 'processing' } : s
      ));
    }, 3200);

    setTimeout(() => {
      setProcessingStages(prev => prev.map(s => 
        s.id === 'normalize' ? { ...s, status: 'complete', details: 'Mapped to Passport schema v2.1' } : 
        s.id === 'validate' ? { ...s, status: 'processing' } : s
      ));
    }, 4000);

    setTimeout(() => {
      setProcessingStages(prev => prev.map(s => 
        s.id === 'validate' ? { ...s, status: 'complete', details: 'Chain-of-custody established' } : s
      ));
      setIsUploading(false);
    }, 4800);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row min-w-0">
      {/* Left Navigation — horizontal on mobile, vertical on md+ */}
      <div className="md:w-56 border-b md:border-b-0 md:border-r border-border flex md:flex-col shrink-0">
        <div className="p-3 md:p-4 md:border-b border-border hidden md:block">
          <p className="text-label mb-1">Evidence Management</p>
          <p className="text-xs text-muted-foreground">Document lifecycle</p>
        </div>

        <div className="flex md:flex-col md:p-2 md:space-y-1 overflow-x-auto md:overflow-x-visible gap-1 p-2">
          <button
            className={`flex items-center gap-2 md:gap-3 px-3 py-2 md:py-2.5 rounded text-left transition-colors whitespace-nowrap md:whitespace-normal md:w-full ${
              activeView === 'ingest' ? 'bg-accent/10 text-accent' : 'hover:bg-secondary'
            }`}
            onClick={() => setActiveView('ingest')}
          >
            <Upload className="w-4 h-4 shrink-0" />
            <div>
              <p className="text-sm font-medium">Ingest</p>
              <p className="text-[10px] text-muted-foreground hidden md:block">Upload & process</p>
            </div>
          </button>

          <button
            className={`flex items-center gap-2 md:gap-3 px-3 py-2 md:py-2.5 rounded text-left transition-colors whitespace-nowrap md:whitespace-normal md:w-full ${
              activeView === 'vault' ? 'bg-accent/10 text-accent' : 'hover:bg-secondary'
            }`}
            onClick={() => setActiveView('vault')}
          >
            <Database className="w-4 h-4 shrink-0" />
            <div>
              <p className="text-sm font-medium">Vault</p>
              <p className="text-[10px] text-muted-foreground hidden md:block">847 documents</p>
            </div>
          </button>

          <button
            className={`flex items-center gap-2 md:gap-3 px-3 py-2 md:py-2.5 rounded text-left transition-colors whitespace-nowrap md:whitespace-normal md:w-full ${
              activeView === 'integrity' ? 'bg-accent/10 text-accent' : 'hover:bg-secondary'
            }`}
            onClick={() => setActiveView('integrity')}
          >
            <Shield className="w-4 h-4 shrink-0" />
            <div>
              <p className="text-sm font-medium">Integrity</p>
              <p className="text-[10px] text-destructive hidden md:block">4 alerts</p>
            </div>
          </button>
        </div>

        {/* Stats — hidden on mobile */}
        <div className="mt-auto p-4 border-t border-border space-y-3 hidden md:block">
          <p className="text-label">Vault Statistics</p>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Documents</span>
              <span className="font-mono text-accent">847</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Storage</span>
              <span className="font-mono">12.4 GB</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">OCR Accuracy</span>
              <span className="font-mono text-accent">99.7%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Integrity Alerts</span>
              <span className="font-mono text-destructive">23</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {activeView === 'ingest' && (
        <div className="flex-1 p-4 sm:p-6 overflow-auto">
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Document Ingestion</h3>
              <p className="text-sm text-muted-foreground">
                Upload evidence files for automated processing, OCR extraction, and chain-of-custody sealing.
              </p>
            </div>

            {/* Upload Zone */}
            <div 
              className="border-2 border-dashed border-border rounded-lg p-6 sm:p-12 text-center hover:border-accent/50 transition-colors cursor-pointer"
              onClick={() => !isUploading && simulateUpload()}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">Drop evidence files here</p>
              <p className="text-xs text-muted-foreground">PDF, JPEG, PNG, DOCX supported • Max 50MB per file</p>
              {isUploading && (
                <div className="mt-6 max-w-xs mx-auto">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-accent mt-2">Uploading... {uploadProgress}%</p>
                </div>
              )}
            </div>

            {/* Processing Pipeline */}
            {processingStages.length > 0 && (
              <div className="space-y-3">
                <p className="text-label">Processing Pipeline</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {processingStages.map((stage, idx) => (
                    <div key={stage.id} className="relative">
                      {idx < processingStages.length - 1 && (
                        <div className={`absolute top-4 left-1/2 w-full h-0.5 ${
                          stage.status === 'complete' ? 'bg-accent' : 'bg-border'
                        }`} />
                      )}
                      <div className={`relative z-10 p-3 rounded-lg text-center ${
                        stage.status === 'complete' ? 'bg-accent/10' :
                        stage.status === 'processing' ? 'bg-yellow-500/10' :
                        'bg-secondary/30'
                      }`}>
                        <div className="flex justify-center mb-2">
                          {stage.status === 'pending' && (
                            <Clock className="w-5 h-5 text-muted-foreground" />
                          )}
                          {stage.status === 'processing' && (
                            <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                          )}
                          {stage.status === 'complete' && (
                            <CheckCircle2 className="w-5 h-5 text-accent" />
                          )}
                        </div>
                        <p className="text-[10px] font-medium">{stage.name}</p>
                        {stage.details && (
                          <p className="text-[9px] text-muted-foreground mt-1 truncate">{stage.details}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Supported Formats */}
            <div className="grid grid-cols-4 gap-4">
              {['Passports', 'Bank Statements', 'Employment Letters', 'Travel Documents'].map((type) => (
                <div key={type} className="p-4 bg-secondary/30 rounded-lg text-center">
                  <FileText className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs font-medium">{type}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeView === 'vault' && (
        <>
          <div className="w-96 border-r border-border" data-tour="document-vault">
            <DocumentVault
              onDocumentSelect={(doc) => setSelectedDoc(doc)}
              selectedDocId={selectedDoc?.id || null}
            />
          </div>
          
          {/* Document Detail */}
          {selectedDoc && (
            <div className="flex-1 overflow-auto p-6">
              <div className="max-w-2xl space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{selectedDoc.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedDoc.type} • {selectedDoc.size}</p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Eye className="w-4 h-4" />
                    View Original
                  </Button>
                </div>

                {/* Hash */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-accent" />
                    <p className="text-label">Cryptographic Hash</p>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded font-mono text-xs break-all">
                    sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
                  </div>
                </div>

                {/* Chain of Custody */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-accent" />
                    <p className="text-label">Chain of Custody</p>
                  </div>
                  <div className="space-y-0 relative">
                    <div className="absolute left-[7px] top-2 bottom-2 w-px bg-accent" />
                    {[
                      { event: 'Ingested from API Upload', time: '2026-01-28 14:32:00', actor: 'System' },
                      { event: 'OCR Processed', time: '2026-01-28 14:32:02', actor: 'Maris Engine v2.4' },
                      { event: 'Hash Computed & Sealed', time: '2026-01-28 14:32:03', actor: 'Cryptography Module' },
                      { event: 'Schema Normalized', time: '2026-01-28 14:32:04', actor: 'Passport Schema v2.1' },
                      { event: 'Vault Entry Created', time: '2026-01-28 14:32:05', actor: 'Evidence Vault' },
                      { event: 'Linked to Case', time: '2026-01-28 14:35:00', actor: 'Officer Yilmaz' },
                    ].map((entry, idx) => (
                      <div key={idx} className="flex items-start gap-3 py-2 relative">
                        <div className="w-4 h-4 rounded-full border-2 border-accent bg-background z-10" />
                        <div className="flex-1">
                          <p className="text-xs font-medium">{entry.event}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {entry.time} • {entry.actor}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Linked Entities */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-accent" />
                    <p className="text-label">Linked Entities</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedDoc.linkedEntities.map((entity, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-secondary rounded text-xs cursor-pointer hover:bg-accent/20">
                        {entity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeView === 'integrity' && (
        <div className="flex-1 overflow-auto p-6" data-tour="tamper-detection">
          <TamperDetection />
        </div>
      )}
    </div>
  );
}
