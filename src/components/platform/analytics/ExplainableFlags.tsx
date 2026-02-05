import { AlertTriangle, Info, Shield, Users, FileWarning, Globe, Phone, Wifi, Link2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface FlagExplanation {
  flag: string;
  label: string;
  description: string;
  source: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  icon: React.ComponentType<{ className?: string }>;
}

// Flag definitions with explanations
const FLAG_DEFINITIONS: Record<string, Omit<FlagExplanation, 'flag'>> = {
  mobile_duplicate: {
    label: 'Duplicate Mobile',
    description: 'This mobile number is used by multiple applicants, indicating potential fraud or identity sharing.',
    source: 'vizesepetim.com',
    severity: 'critical',
    icon: Phone,
  },
  ip_shared: {
    label: 'Shared IP Address',
    description: 'Multiple applicants (3+) submitted from this IP address within 24 hours, suggesting a fraud farm.',
    source: 'vizesepetim.com',
    severity: 'high',
    icon: Wifi,
  },
  ip_vpn_detected: {
    label: 'VPN/Proxy Detected',
    description: 'The IP address is identified as a VPN, proxy, or hosting service, hiding true location.',
    source: 'IP Geolocation',
    severity: 'medium',
    icon: Shield,
  },
  document_hash_match: {
    label: 'Duplicate Document',
    description: 'The same document (identical SHA-256 hash) was submitted by another applicant.',
    source: 'Maris Document Vault',
    severity: 'critical',
    icon: FileWarning,
  },
  network_cluster: {
    label: 'Fraud Network Member',
    description: 'Entity is connected to a known fraud network with multiple flagged connections.',
    source: 'Nautica Graph Analysis',
    severity: 'critical',
    icon: Link2,
  },
  high_risk_connections: {
    label: 'High-Risk Connections',
    description: 'Connected to 3+ entities with risk scores above 70.',
    source: 'Network Analysis',
    severity: 'high',
    icon: Users,
  },
  geographic_mismatch: {
    label: 'Geographic Anomaly',
    description: 'IP location does not match claimed residence or citizenship.',
    source: 'IP Geolocation',
    severity: 'medium',
    icon: Globe,
  },
};

interface ExplainableFlagProps {
  flag: string;
  compact?: boolean;
}

export function ExplainableFlag({ flag, compact = false }: ExplainableFlagProps) {
  const definition = FLAG_DEFINITIONS[flag];
  
  if (!definition) {
    // Unknown flag
    return (
      <Badge variant="secondary" className="text-[10px] gap-1">
        <AlertTriangle className="w-3 h-3" />
        {flag}
      </Badge>
    );
  }

  const Icon = definition.icon;
  const severityColors = {
    critical: 'bg-destructive text-destructive-foreground',
    high: 'bg-destructive/80 text-destructive-foreground',
    medium: 'bg-yellow-500/90 text-yellow-950',
    low: 'bg-muted text-muted-foreground',
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] ${severityColors[definition.severity]}`}>
              <Icon className="w-3 h-3" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-1">
              <p className="font-medium">{definition.label}</p>
              <p className="text-xs text-muted-foreground">{definition.description}</p>
              <p className="text-[10px] text-muted-foreground">Source: {definition.source}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="destructive" 
            className={`text-[10px] gap-1 cursor-help ${severityColors[definition.severity]}`}
          >
            <Icon className="w-3 h-3" />
            {definition.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="text-xs">{definition.description}</p>
            <p className="text-[10px] text-muted-foreground">Source: {definition.source}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface ExplainableFlagsListProps {
  flags: string[];
  compact?: boolean;
  maxVisible?: number;
}

export function ExplainableFlagsList({ flags, compact = false, maxVisible = 3 }: ExplainableFlagsListProps) {
  if (flags.length === 0) return null;

  const visibleFlags = flags.slice(0, maxVisible);
  const hiddenCount = flags.length - maxVisible;

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {visibleFlags.map((flag, idx) => (
        <ExplainableFlag key={idx} flag={flag} compact={compact} />
      ))}
      {hiddenCount > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="text-[10px]">
                +{hiddenCount}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top">
              <div className="space-y-1">
                {flags.slice(maxVisible).map((flag, idx) => (
                  <p key={idx} className="text-xs">{FLAG_DEFINITIONS[flag]?.label || flag}</p>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

interface RiskExplanationPanelProps {
  riskScore: number;
  flags: string[];
  metadata?: Record<string, unknown>;
}

export function RiskExplanationPanel({ riskScore, flags, metadata }: RiskExplanationPanelProps) {
  // Calculate risk breakdown
  const breakdown: { factor: string; contribution: number; source: string }[] = [];
  
  // Base score
  breakdown.push({ factor: 'Base score', contribution: 20, source: 'System' });
  
  // Flag contributions
  flags.forEach(flag => {
    const def = FLAG_DEFINITIONS[flag];
    if (def) {
      const contribution = 
        def.severity === 'critical' ? 25 :
        def.severity === 'high' ? 15 :
        def.severity === 'medium' ? 10 : 5;
      breakdown.push({ factor: def.label, contribution, source: def.source });
    }
  });

  // Network connections from metadata
  const correlations = metadata?.correlations as { mobile_matches?: number; ip_matches?: number } | undefined;
  if (correlations?.mobile_matches) {
    breakdown.push({ 
      factor: `${correlations.mobile_matches} mobile matches`, 
      contribution: correlations.mobile_matches * 10,
      source: 'Correlation Analysis'
    });
  }
  if (correlations?.ip_matches && correlations.ip_matches > 2) {
    breakdown.push({ 
      factor: `${correlations.ip_matches} IP matches`, 
      contribution: correlations.ip_matches * 5,
      source: 'Correlation Analysis'
    });
  }

  const totalCalculated = breakdown.reduce((sum, b) => sum + b.contribution, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium">Risk Score Breakdown</span>
        </div>
        <span className={`text-lg font-bold font-mono ${
          riskScore >= 80 ? 'text-destructive' :
          riskScore >= 50 ? 'text-yellow-500' : 'text-accent'
        }`}>
          {riskScore}
        </span>
      </div>

      <div className="space-y-1.5">
        {breakdown.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs p-1.5 bg-secondary/30 rounded">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span>{item.factor}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">{item.source}</span>
              <span className="font-mono font-medium text-accent">+{item.contribution}</span>
            </div>
          </div>
        ))}
      </div>

      {totalCalculated !== riskScore && (
        <p className="text-[10px] text-muted-foreground text-center">
          Score capped at {riskScore} (calculated: {totalCalculated})
        </p>
      )}
    </div>
  );
}
