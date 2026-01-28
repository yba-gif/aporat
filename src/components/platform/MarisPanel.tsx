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
  Link2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

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

const DEMO_DOCUMENTS: ProcessedDocument[] = [
  {
    id: 'doc-001',
    name: 'passport_ahmad_rezaee.pdf',
    type: 'Passport',
    hash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    timestamp: '2026-01-28T14:32:00Z',
    extractedData: {
      'Full Name': 'Ahmad Rezaee',
      'Passport Number': 'K12847593',
      'Date of Birth': '1985-03-12',
      'Nationality': 'Iranian',
      'Expiry Date': '2028-06-15',
      'Issuing Authority': 'Ministry of Foreign Affairs'
    },
    confidence: 94.2,
    flags: ['Name variant detected in other documents']
  },
  {
    id: 'doc-002',
    name: 'bank_statement_global_finance.pdf',
    type: 'Financial Document',
    hash: 'sha256:4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce',
    timestamp: '2026-01-28T14:33:00Z',
    extractedData: {
      'Account Holder': 'Global Finance Consultants Ltd',
      'Account Number': '****4829',
      'Bank': 'Turkiye Is Bankasi',
      'Period': 'Dec 2025 - Jan 2026',
      'Average Balance': '$847,293.00',
      'Transaction Count': '1,247'
    },
    confidence: 97.8,
    flags: []
  },
  {
    id: 'doc-003',
    name: 'employment_letter_suspicious.pdf',
    type: 'Employment Verification',
    hash: 'sha256:ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    timestamp: '2026-01-28T14:34:00Z',
    extractedData: {
      'Employee': 'Dmitri Volkov',
      'Employer': 'TechServe Solutions GmbH',
      'Position': 'Senior Software Engineer',
      'Salary': '€95,000/year',
      'Start Date': '2023-01-15',
      'Signatory': 'Hans Mueller, HR Director'
    },
    confidence: 72.1,
    flags: ['Low confidence OCR', 'Signature anomaly detected', 'Metadata timestamp mismatch']
  }
];

export function MarisPanel() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStages, setProcessingStages] = useState<DocumentStage[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<ProcessedDocument | null>(null);
  const [documents, setDocuments] = useState<ProcessedDocument[]>(DEMO_DOCUMENTS);

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

    // Simulate upload progress
    const uploadInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 150);

    // Simulate processing stages
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
    <div className="flex-1 flex">
      {/* Left: Upload & Processing */}
      <div className="w-96 border-r border-border p-6 flex flex-col gap-6">
        {/* Upload Zone */}
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-accent/50 transition-colors cursor-pointer"
          onClick={() => !isUploading && simulateUpload()}
        >
          <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium mb-1">Drop evidence files here</p>
          <p className="text-xs text-muted-foreground">PDF, JPEG, PNG, DOCX supported</p>
          {isUploading && (
            <div className="mt-4">
              <Progress value={uploadProgress} className="h-1" />
              <p className="text-xs text-accent mt-2">Uploading... {uploadProgress}%</p>
            </div>
          )}
        </div>

        {/* Processing Pipeline */}
        {processingStages.length > 0 && (
          <div className="space-y-3">
            <p className="text-label">Processing Pipeline</p>
            {processingStages.map((stage) => (
              <div key={stage.id} className="flex items-start gap-3 p-3 bg-secondary/30 rounded">
                {stage.status === 'pending' && (
                  <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                )}
                {stage.status === 'processing' && (
                  <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin mt-0.5" />
                )}
                {stage.status === 'complete' && (
                  <CheckCircle2 className="w-4 h-4 text-accent mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${stage.status === 'complete' ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {stage.name}
                  </p>
                  {stage.details && (
                    <p className="text-xs text-muted-foreground truncate">{stage.details}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Evidence Vault Stats */}
        <div className="mt-auto p-4 bg-secondary/30 rounded-lg space-y-3">
          <p className="text-label">Evidence Vault</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-bold text-accent">847</p>
              <p className="text-xs text-muted-foreground">Documents ingested</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">12.4 GB</p>
              <p className="text-xs text-muted-foreground">Total storage</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">99.7%</p>
              <p className="text-xs text-muted-foreground">OCR accuracy</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-destructive">23</p>
              <p className="text-xs text-muted-foreground">Integrity alerts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Document List */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSearch className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">Recent Documents</span>
          </div>
          <span className="text-xs text-muted-foreground">{documents.length} documents</span>
        </div>
        
        <div className="flex-1 overflow-auto">
          {documents.map((doc) => (
            <div 
              key={doc.id}
              className={`p-4 border-b border-border cursor-pointer transition-colors ${
                selectedDoc?.id === doc.id ? 'bg-accent/10' : 'hover:bg-secondary/30'
              }`}
              onClick={() => setSelectedDoc(doc)}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded ${doc.flags.length > 0 ? 'bg-destructive/20' : 'bg-secondary'}`}>
                  <FileText className={`w-4 h-4 ${doc.flags.length > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{doc.type}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[200px]">
                      {doc.hash.slice(0, 30)}...
                    </span>
                    {doc.flags.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-destructive/20 text-destructive rounded">
                        {doc.flags.length} flag{doc.flags.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-mono ${doc.confidence > 90 ? 'text-accent' : doc.confidence > 80 ? 'text-yellow-500' : 'text-destructive'}`}>
                    {doc.confidence}%
                  </p>
                  <p className="text-[10px] text-muted-foreground">confidence</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Document Detail */}
      {selectedDoc && (
        <div className="w-96 border-l border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{selectedDoc.name}</p>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Eye className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">{selectedDoc.type}</p>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-6">
            {/* Hash & Provenance */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-accent" />
                <p className="text-label">Cryptographic Hash</p>
              </div>
              <div className="p-3 bg-secondary/30 rounded font-mono text-xs break-all">
                {selectedDoc.hash}
              </div>
            </div>

            {/* Chain of Custody */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-accent" />
                <p className="text-label">Chain of Custody</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span className="text-muted-foreground">Ingested</span>
                  <span className="ml-auto font-mono">{new Date(selectedDoc.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span className="text-muted-foreground">OCR Processed</span>
                  <span className="ml-auto font-mono">+2.3s</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span className="text-muted-foreground">Normalized</span>
                  <span className="ml-auto font-mono">+3.1s</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span className="text-muted-foreground">Vault Sealed</span>
                  <span className="ml-auto font-mono">+3.4s</span>
                </div>
              </div>
            </div>

            {/* Extracted Data */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-accent" />
                <p className="text-label">Extracted Data</p>
              </div>
              <div className="space-y-2">
                {Object.entries(selectedDoc.extractedData).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{key}</span>
                    <span className="font-mono text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Flags */}
            {selectedDoc.flags.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-destructive" />
                  <p className="text-label text-destructive">Integrity Flags</p>
                </div>
                <div className="space-y-2">
                  {selectedDoc.flags.map((flag, idx) => (
                    <div key={idx} className="p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
                      {flag}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
