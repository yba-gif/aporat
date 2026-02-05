import { useState } from 'react';
import { 
  Globe, 
  Phone, 
  MapPin, 
  AlertTriangle, 
  Shield, 
  Users,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Wifi
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useVizesepetimData, VizesepetimApplicant } from '@/hooks/useVizesepetimData';
import { usePlatform } from '@/contexts/PlatformContext';

interface VizesepetimPanelProps {
  onClose?: () => void;
}

export function VizesepetimPanel({ onClose }: VizesepetimPanelProps) {
  const { applicants, isLoading, stats, fetchApplicants, getCorrelations } = useVizesepetimData();
  const { navigateToEntity } = usePlatform();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [correlations, setCorrelations] = useState<Record<string, { mobile: number; ip: number }>>({});

  const handleExpand = async (applicant: VizesepetimApplicant) => {
    if (expandedId === applicant.id) {
      setExpandedId(null);
      return;
    }
    
    setExpandedId(applicant.id);
    
    // Fetch correlations for this applicant
    const corr = await getCorrelations(applicant);
    setCorrelations(prev => ({
      ...prev,
      [applicant.id]: {
        mobile: corr.mobileMatches.length,
        ip: corr.ipMatches.length,
      },
    }));
  };

  const getFlagBadges = (applicant: VizesepetimApplicant) => {
    const flags = applicant.metadata?.flags || [];
    return flags.map(flag => {
      switch (flag) {
        case 'mobile_duplicate':
          return { label: 'Duplicate Mobile', variant: 'destructive' as const, icon: Phone };
        case 'ip_shared':
          return { label: 'Shared IP', variant: 'destructive' as const, icon: Wifi };
        case 'ip_vpn_detected':
          return { label: 'VPN Detected', variant: 'secondary' as const, icon: Shield };
        default:
          return { label: flag, variant: 'secondary' as const, icon: AlertTriangle };
      }
    });
  };

  return (
    <div className="h-full flex flex-col bg-surface-elevated">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-accent" />
          <div>
            <h3 className="text-sm font-semibold">vizesepetim.com</h3>
            <p className="text-[10px] text-muted-foreground">External Applicant Data</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => fetchApplicants()}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-2 p-3 border-b border-border">
        <div className="text-center">
          <p className="text-lg font-bold">{stats.total}</p>
          <p className="text-[10px] text-muted-foreground">Total</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-destructive">{stats.flagged}</p>
          <p className="text-[10px] text-muted-foreground">Flagged</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-yellow-500">{stats.vpnDetected}</p>
          <p className="text-[10px] text-muted-foreground">VPN</p>
        </div>
      </div>

      {/* Applicants List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {applicants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Globe className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No external applicants yet</p>
              <p className="text-xs mt-1">Data will appear when received via webhook</p>
            </div>
          ) : (
            applicants.map(applicant => {
              const flags = getFlagBadges(applicant);
              const isExpanded = expandedId === applicant.id;
              const corr = correlations[applicant.id];
              
              return (
                <div 
                  key={applicant.id}
                  className={`border rounded-lg overflow-hidden transition-colors ${
                    flags.length > 0 ? 'border-destructive/30 bg-destructive/5' : 'border-border'
                  }`}
                >
                  {/* Main Row */}
                  <button
                    onClick={() => handleExpand(applicant)}
                    className="w-full flex items-center justify-between p-3 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2 h-2 rounded-full ${
                        flags.length > 0 ? 'bg-destructive' : 'bg-accent'
                      }`} />
                      <div className="text-left min-w-0">
                        <p className="text-sm font-medium truncate">
                          {applicant.external_id}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {applicant.target_country}
                          </span>
                          <span>•</span>
                          <span>{applicant.ip_country || 'Unknown'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {flags.length > 0 && (
                        <Badge variant="destructive" className="text-[9px]">
                          {flags.length}
                        </Badge>
                      )}
                      <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`} />
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-3 pb-3 space-y-3 border-t border-border/50">
                      {/* Flags */}
                      {flags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-2">
                          {flags.map((flag, idx) => (
                            <Badge key={idx} variant={flag.variant} className="text-[10px] gap-1">
                              <flag.icon className="w-3 h-3" />
                              {flag.label}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 bg-secondary/30 rounded">
                          <p className="text-muted-foreground text-[10px]">Mobile Hash</p>
                          <p className="font-mono truncate">{applicant.mobile_number_hash.substring(0, 12)}...</p>
                        </div>
                        <div className="p-2 bg-secondary/30 rounded">
                          <p className="text-muted-foreground text-[10px]">IP Address</p>
                          <p className="font-mono">{applicant.ip_address || 'N/A'}</p>
                        </div>
                        <div className="p-2 bg-secondary/30 rounded">
                          <p className="text-muted-foreground text-[10px]">Gender</p>
                          <p className="capitalize">{applicant.gender || 'N/A'}</p>
                        </div>
                        <div className="p-2 bg-secondary/30 rounded">
                          <p className="text-muted-foreground text-[10px]">VPN Status</p>
                          <p className={applicant.ip_is_vpn ? 'text-yellow-500' : 'text-accent'}>
                            {applicant.ip_is_vpn ? 'Detected' : 'Clean'}
                          </p>
                        </div>
                      </div>

                      {/* Correlations */}
                      {corr && (corr.mobile > 0 || corr.ip > 0) && (
                        <div className="p-2 bg-destructive/10 rounded border border-destructive/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-destructive" />
                            <span className="text-xs font-medium text-destructive">Correlations Found</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Same Mobile:</span>
                              <span className="font-bold">{corr.mobile}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Same IP:</span>
                              <span className="font-bold">{corr.ip}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      {applicant.linked_entity_id && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateToEntity(applicant.linked_entity_id!);
                          }}
                        >
                          <ExternalLink className="w-3 h-3 mr-2" />
                          View in Graph
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-border bg-secondary/20">
        <p className="text-[10px] text-muted-foreground text-center">
          Real-time data from vizesepetim.com webhook
        </p>
      </div>
    </div>
  );
}
