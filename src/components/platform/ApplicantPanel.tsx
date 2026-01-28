import { User, FileText, Calendar, MapPin, AlertTriangle, ExternalLink } from 'lucide-react';

interface ApplicantData {
  id: string;
  name: string;
  nationality: string;
  visaType: string;
  submissionDate: string;
  consulate: string;
  riskScore: number;
  flags: string[];
  documents: { name: string; hash: string; status: 'verified' | 'flagged' | 'pending' }[];
  connections: { type: string; count: number }[];
}

const applicants: Record<string, ApplicantData> = {
  'app-1': {
    id: 'APP-1847',
    name: 'Redacted',
    nationality: 'Pakistan',
    visaType: 'Work Permit',
    submissionDate: '2026-01-15',
    consulate: 'Islamabad',
    riskScore: 94,
    flags: ['Duplicate document hash', 'Linked to flagged agent', 'Pattern match: visa mill'],
    documents: [
      { name: 'Passport.pdf', hash: '7f83b162...', status: 'verified' },
      { name: 'BankStatement.pdf', hash: 'a3f2c891...', status: 'flagged' },
      { name: 'EmploymentLetter.pdf', hash: 'e4d1b7c2...', status: 'flagged' },
    ],
    connections: [
      { type: 'Same Agent', count: 8 },
      { type: 'Same Doc Hash', count: 8 },
      { type: 'Address Match', count: 2 },
    ],
  },
  'agent-1': {
    id: 'AGT-0041',
    name: 'Apex Travel Agency',
    nationality: 'Turkey',
    visaType: 'Registered Agent',
    submissionDate: '2024-03-01',
    consulate: 'Multiple',
    riskScore: 98,
    flags: ['8 linked applicants with identical documents', 'Submission pattern anomaly', 'Under investigation'],
    documents: [
      { name: 'License.pdf', hash: '9c2f1e83...', status: 'verified' },
    ],
    connections: [
      { type: 'Linked Applicants', count: 8 },
      { type: 'Consulates Used', count: 4 },
    ],
  },
  'doc-1': {
    id: 'DOC-7721',
    name: 'Template Bank Statement',
    nationality: '-',
    visaType: 'Financial Document',
    submissionDate: '-',
    consulate: 'Multiple',
    riskScore: 100,
    flags: ['Used in 8 applications', 'Hash collision detected', 'Suspected forgery'],
    documents: [
      { name: 'BankStatement_template.pdf', hash: 'a3f2c891...', status: 'flagged' },
    ],
    connections: [
      { type: 'Applications', count: 8 },
      { type: 'Agents', count: 1 },
    ],
  },
};

interface ApplicantPanelProps {
  selectedNode: string | null;
}

export function ApplicantPanel({ selectedNode }: ApplicantPanelProps) {
  const data = selectedNode ? applicants[selectedNode] : null;

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <div>
          <User className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Select a node to view details
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-xs font-mono text-muted-foreground">{data.id}</p>
            <h3 className="font-semibold">{data.name}</h3>
          </div>
          <div className={`px-2 py-1 rounded text-xs font-mono ${
            data.riskScore >= 90 
              ? 'bg-destructive/10 text-destructive' 
              : data.riskScore >= 70 
                ? 'bg-yellow-500/10 text-yellow-500' 
                : 'bg-accent/10 text-accent'
          }`}>
            RISK {data.riskScore}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{data.nationality}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <FileText className="w-3 h-3" />
            <span>{data.visaType}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{data.submissionDate}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <ExternalLink className="w-3 h-3" />
            <span>{data.consulate}</span>
          </div>
        </div>
      </div>

      {/* Flags */}
      <div className="p-4 border-b border-border">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          Integrity Flags
        </p>
        <div className="space-y-2">
          {data.flags.map((flag, i) => (
            <div 
              key={i}
              className="flex items-start gap-2 text-xs p-2 bg-destructive/5 border border-destructive/20 rounded"
            >
              <AlertTriangle className="w-3 h-3 text-destructive shrink-0 mt-0.5" />
              <span className="text-destructive">{flag}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Documents */}
      <div className="p-4 border-b border-border">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          Documents
        </p>
        <div className="space-y-1">
          {data.documents.map((doc, i) => (
            <div 
              key={i}
              className="flex items-center justify-between text-xs p-2 bg-secondary/50 rounded"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-3 h-3 text-muted-foreground" />
                <span>{doc.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-muted-foreground">{doc.hash}</span>
                <span className={`w-2 h-2 rounded-full ${
                  doc.status === 'verified' 
                    ? 'bg-accent' 
                    : doc.status === 'flagged' 
                      ? 'bg-destructive' 
                      : 'bg-yellow-500'
                }`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Connections */}
      <div className="p-4">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          Graph Connections
        </p>
        <div className="grid grid-cols-2 gap-2">
          {data.connections.map((conn, i) => (
            <div key={i} className="p-2 bg-secondary/50 rounded text-center">
              <p className="text-lg font-mono font-semibold">{conn.count}</p>
              <p className="text-[10px] text-muted-foreground">{conn.type}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
