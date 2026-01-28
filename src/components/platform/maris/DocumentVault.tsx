import { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Search, 
  Hash,
  Upload,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VaultDocument {
  id: string;
  name: string;
  type: string;
  hash: string;
  timestamp: string;
  size: string;
  confidence: number;
  status: 'verified' | 'pending' | 'flagged';
  linkedEntities: string[];
  caseId?: string;
  fileUrl?: string;
}

// Seed documents for demo (shown alongside uploaded docs)
const SEED_DOCUMENTS: VaultDocument[] = [
  {
    id: 'vd-001',
    name: 'passport_ahmad_rezaee.pdf',
    type: 'Passport',
    hash: 'sha256:7f83b165...9069',
    timestamp: '2026-01-28T14:32:00Z',
    size: '2.4 MB',
    confidence: 94.2,
    status: 'flagged',
    linkedEntities: ['Ahmad Rezaee', 'Case #4829'],
    caseId: 'CASE-2026-4829'
  },
  {
    id: 'vd-002',
    name: 'bank_statement_gfc_dec2025.pdf',
    type: 'Financial',
    hash: 'sha256:4e07408...9fce',
    timestamp: '2026-01-28T14:33:00Z',
    size: '847 KB',
    confidence: 97.8,
    status: 'verified',
    linkedEntities: ['Global Finance Consultants Ltd'],
    caseId: 'CASE-2026-4830'
  },
  {
    id: 'vd-003',
    name: 'employment_techserve_volkov.pdf',
    type: 'Employment',
    hash: 'sha256:ef2d127...e39d',
    timestamp: '2026-01-28T14:34:00Z',
    size: '1.1 MB',
    confidence: 72.1,
    status: 'flagged',
    linkedEntities: ['Dmitri Volkov', 'TechServe Solutions GmbH'],
    caseId: 'CASE-2026-4831'
  }
];

interface DocumentVaultProps {
  onDocumentSelect: (doc: VaultDocument) => void;
  selectedDocId: string | null;
}

// Simple hash function for demo (not cryptographically secure)
async function computeHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `sha256:${hashHex.substring(0, 8)}...${hashHex.substring(hashHex.length - 4)}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function getDocumentType(mimeType: string): string {
  if (mimeType.includes('pdf')) return 'Document';
  if (mimeType.includes('image')) return 'Biometric';
  if (mimeType.includes('word')) return 'Document';
  return 'Other';
}

export function DocumentVault({ onDocumentSelect, selectedDocId }: DocumentVaultProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'pending' | 'flagged'>('all');
  const [uploadedDocs, setUploadedDocs] = useState<VaultDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch documents from Supabase on mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('vault_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const docs: VaultDocument[] = (data || []).map((doc: any) => ({
        id: doc.id,
        name: doc.filename,
        type: getDocumentType(doc.mime_type),
        hash: `sha256:${doc.sha256_hash.substring(0, 8)}...${doc.sha256_hash.substring(doc.sha256_hash.length - 4)}`,
        timestamp: doc.created_at,
        size: formatFileSize(doc.file_size),
        confidence: doc.ocr_confidence || Math.random() * 30 + 70, // Simulated OCR
        status: doc.flagged ? 'flagged' : doc.ocr_status === 'completed' ? 'verified' : 'pending',
        linkedEntities: (doc.metadata?.linkedEntities as string[]) || [],
        caseId: doc.metadata?.caseId as string,
        fileUrl: doc.file_path
      }));

      setUploadedDocs(docs);
    } catch (err) {
      console.error('Error fetching documents:', err);
      toast.error('Failed to fetch documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      try {
        // Compute hash
        const hashBuffer = await file.arrayBuffer();
        const hashArray = await crypto.subtle.digest('SHA-256', hashBuffer);
        const hashHex = Array.from(new Uint8Array(hashArray))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');

        // Upload to storage
        const filePath = `${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('document-vault')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('document-vault')
          .getPublicUrl(filePath);

        // Simulate OCR processing (random confidence for demo)
        const ocrConfidence = Math.random() * 25 + 75;
        const isFlagged = ocrConfidence < 80;

        // Insert metadata record
        const { error: dbError } = await supabase
          .from('vault_documents')
          .insert({
            filename: file.name,
            file_path: filePath,
            file_size: file.size,
            mime_type: file.type,
            sha256_hash: hashHex,
            ocr_status: 'completed',
            ocr_confidence: ocrConfidence,
            flagged: isFlagged,
            risk_score: isFlagged ? Math.floor(Math.random() * 30 + 60) : Math.floor(Math.random() * 20),
            metadata: {
              linkedEntities: [],
              uploadedVia: 'Maris Document Vault',
              originalName: file.name
            }
          });

        if (dbError) throw dbError;

        toast.success(`Uploaded: ${file.name}`);
        return true;
      } catch (err) {
        console.error('Upload error:', err);
        toast.error(`Failed to upload: ${file.name}`);
        return false;
      }
    });

    await Promise.all(uploadPromises);
    await fetchDocuments();
    setIsUploading(false);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileUpload(e.dataTransfer.files);
  };

  // Combine seed documents with uploaded documents
  const allDocs = [...uploadedDocs, ...SEED_DOCUMENTS];

  const filteredDocs = allDocs.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.linkedEntities.some(e => e.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterStatus === 'all' || doc.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status: VaultDocument['status']) => {
    switch (status) {
      case 'verified': return <CheckCircle2 className="w-4 h-4 text-accent" />;
      case 'flagged': return <AlertTriangle className="w-4 h-4 text-destructive" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div 
      className="flex flex-col h-full"
      onDragEnter={handleDrag}
    >
      {/* Upload Drop Zone Overlay */}
      {dragActive && (
        <div 
          className="absolute inset-0 z-50 bg-accent/20 border-2 border-dashed border-accent flex items-center justify-center"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <Upload className="w-12 h-12 text-accent mx-auto mb-2" />
            <p className="text-lg font-medium">Drop files to upload</p>
            <p className="text-sm text-muted-foreground">PDF, Images, Word documents</p>
          </div>
        </div>
      )}

      {/* Search, Filter & Upload */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search documents, entities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-secondary/30"
            />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
          <Button
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="gap-2"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Upload
          </Button>
        </div>
        <div className="flex gap-2">
          {(['all', 'verified', 'flagged', 'pending'] as const).map((status) => (
            <button
              key={status}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                filterStatus === status 
                  ? 'bg-accent text-accent-foreground' 
                  : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
              }`}
              onClick={() => setFilterStatus(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <FileText className="w-8 h-8 mb-2" />
            <p className="text-sm">No documents found</p>
            <p className="text-xs">Upload or adjust filters</p>
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className={`p-4 border-b border-border cursor-pointer transition-colors ${
                selectedDocId === doc.id ? 'bg-accent/10' : 'hover:bg-secondary/30'
              }`}
              onClick={() => onDocumentSelect(doc)}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded ${
                  doc.status === 'flagged' ? 'bg-destructive/20' : 'bg-secondary'
                }`}>
                  <FileText className={`w-4 h-4 ${
                    doc.status === 'flagged' ? 'text-destructive' : 'text-muted-foreground'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{doc.name}</p>
                    {getStatusIcon(doc.status)}
                  </div>
                  <p className="text-xs text-muted-foreground">{doc.type} • {doc.size}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Hash className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] font-mono text-muted-foreground truncate">
                      {doc.hash}
                    </span>
                  </div>
                  {doc.linkedEntities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {doc.linkedEntities.slice(0, 2).map((entity, idx) => (
                        <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-secondary rounded">
                          {entity}
                        </span>
                      ))}
                      {doc.linkedEntities.length > 2 && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-secondary rounded text-muted-foreground">
                          +{doc.linkedEntities.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className={`text-sm font-mono ${
                    doc.confidence > 90 ? 'text-accent' : 
                    doc.confidence > 80 ? 'text-yellow-500' : 'text-destructive'
                  }`}>
                    {doc.confidence.toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-muted-foreground">OCR</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats Footer */}
      <div className="p-3 border-t border-border bg-secondary/20">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">
            {filteredDocs.length} documents ({uploadedDocs.length} uploaded)
          </span>
          <span className="text-muted-foreground">
            {filteredDocs.filter(d => d.status === 'flagged').length} flagged
          </span>
        </div>
      </div>
    </div>
  );
}

export type { VaultDocument };
