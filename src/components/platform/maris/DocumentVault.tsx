import { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Calendar,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Hash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
}

const VAULT_DOCUMENTS: VaultDocument[] = [
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
  },
  {
    id: 'vd-004',
    name: 'visa_photo_sokolova.jpg',
    type: 'Biometric',
    hash: 'sha256:a3c1e87...b2d4',
    timestamp: '2026-01-28T10:15:00Z',
    size: '245 KB',
    confidence: 99.1,
    status: 'verified',
    linkedEntities: ['Elena Sokolova'],
    caseId: 'CASE-2026-4827'
  },
  {
    id: 'vd-005',
    name: 'hotel_reservation_santos.pdf',
    type: 'Travel',
    hash: 'sha256:9b4f2e1...c8a7',
    timestamp: '2026-01-27T16:45:00Z',
    size: '156 KB',
    confidence: 98.5,
    status: 'verified',
    linkedEntities: ['Maria Santos'],
    caseId: 'CASE-2026-4825'
  }
];

interface DocumentVaultProps {
  onDocumentSelect: (doc: VaultDocument) => void;
  selectedDocId: string | null;
}

export function DocumentVault({ onDocumentSelect, selectedDocId }: DocumentVaultProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'pending' | 'flagged'>('all');

  const filteredDocs = VAULT_DOCUMENTS.filter(doc => {
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
    <div className="flex flex-col h-full">
      {/* Search & Filter */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search documents, entities, cases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary/30"
          />
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
        {filteredDocs.map((doc) => (
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
              </div>
              <div className="text-right">
                <p className={`text-sm font-mono ${
                  doc.confidence > 90 ? 'text-accent' : 
                  doc.confidence > 80 ? 'text-yellow-500' : 'text-destructive'
                }`}>
                  {doc.confidence}%
                </p>
                <p className="text-[10px] text-muted-foreground">OCR</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Footer */}
      <div className="p-3 border-t border-border bg-secondary/20">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">{filteredDocs.length} documents</span>
          <span className="text-muted-foreground">
            {filteredDocs.filter(d => d.status === 'flagged').length} flagged
          </span>
        </div>
      </div>
    </div>
  );
}

export type { VaultDocument };
