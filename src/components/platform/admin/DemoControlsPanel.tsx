import { useState } from 'react';
import { 
  Settings2, 
  Zap, 
  RotateCcw, 
  Play, 
  Users, 
  Network, 
  Shield, 
  Globe,
  Loader2,
  CheckCircle,
  AlertTriangle,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Scenario {
  id: string;
  name: string;
  description: string;
  icon: typeof Network;
  color: string;
  applicants: Array<{
    applicant_id: string;
    mobile_number: string;
    ip_address: string;
    gender: 'male' | 'female' | 'other';
    target_country: string;
  }>;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'visa-mill',
    name: 'Visa Mill Ring',
    description: '8 applicants sharing same mobile number and document hashes through coordinated agency',
    icon: Users,
    color: 'text-destructive',
    applicants: [
      { applicant_id: 'vm-lead-001', mobile_number: '+905559876543', ip_address: '88.242.55.10', gender: 'male', target_country: 'DE' },
      { applicant_id: 'vm-member-002', mobile_number: '+905559876543', ip_address: '88.242.55.10', gender: 'female', target_country: 'DE' },
      { applicant_id: 'vm-member-003', mobile_number: '+905559876543', ip_address: '88.242.55.11', gender: 'male', target_country: 'FR' },
      { applicant_id: 'vm-member-004', mobile_number: '+905559876543', ip_address: '88.242.55.12', gender: 'female', target_country: 'DE' },
      { applicant_id: 'vm-member-005', mobile_number: '+905559876543', ip_address: '88.242.55.10', gender: 'male', target_country: 'NL' },
    ],
  },
  {
    id: 'vpn-farm',
    name: 'VPN Farm Pattern',
    description: '12 applicants using known VPN/proxy IPs to mask their true location',
    icon: Shield,
    color: 'text-amber-500',
    applicants: [
      { applicant_id: 'vpn-user-001', mobile_number: '+905551111001', ip_address: '104.238.140.77', gender: 'male', target_country: 'US' },
      { applicant_id: 'vpn-user-002', mobile_number: '+905551111002', ip_address: '104.238.140.78', gender: 'female', target_country: 'UK' },
      { applicant_id: 'vpn-user-003', mobile_number: '+905551111003', ip_address: '104.238.140.79', gender: 'male', target_country: 'CA' },
      { applicant_id: 'vpn-user-004', mobile_number: '+905551111004', ip_address: '185.220.101.1', gender: 'other', target_country: 'AU' },
    ],
  },
  {
    id: 'geographic-anomaly',
    name: 'Geographic Anomaly',
    description: 'Applicants claiming Tehran residence but connecting from Istanbul IPs',
    icon: Globe,
    color: 'text-accent',
    applicants: [
      { applicant_id: 'geo-anom-001', mobile_number: '+905552222001', ip_address: '78.160.45.100', gender: 'male', target_country: 'DE' },
      { applicant_id: 'geo-anom-002', mobile_number: '+905552222002', ip_address: '78.160.45.101', gender: 'female', target_country: 'FR' },
      { applicant_id: 'geo-anom-003', mobile_number: '+905552222003', ip_address: '78.160.45.102', gender: 'male', target_country: 'NL' },
    ],
  },
  {
    id: 'shared-ip-cluster',
    name: 'Shared IP Cluster',
    description: 'Multiple unrelated applicants submitting from identical IP address',
    icon: Network,
    color: 'text-purple-500',
    applicants: [
      { applicant_id: 'cluster-001', mobile_number: '+905553333001', ip_address: '195.175.200.50', gender: 'male', target_country: 'DE' },
      { applicant_id: 'cluster-002', mobile_number: '+905553333002', ip_address: '195.175.200.50', gender: 'female', target_country: 'DE' },
      { applicant_id: 'cluster-003', mobile_number: '+905553333003', ip_address: '195.175.200.50', gender: 'male', target_country: 'DE' },
      { applicant_id: 'cluster-004', mobile_number: '+905553333004', ip_address: '195.175.200.50', gender: 'female', target_country: 'FR' },
      { applicant_id: 'cluster-005', mobile_number: '+905553333005', ip_address: '195.175.200.50', gender: 'other', target_country: 'UK' },
      { applicant_id: 'cluster-006', mobile_number: '+905553333006', ip_address: '195.175.200.50', gender: 'male', target_country: 'NL' },
    ],
  },
];

interface DemoControlsPanelProps {
  onClose: () => void;
}

export function DemoControlsPanel({ onClose }: DemoControlsPanelProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [completedScenarios, setCompletedScenarios] = useState<Set<string>>(new Set());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { toast } = useToast();

  const runScenario = async (scenario: Scenario) => {
    setIsLoading(scenario.id);

    try {
      let successCount = 0;
      let errorCount = 0;

      for (const applicant of scenario.applicants) {
        const payload = {
          ...applicant,
          applicant_id: `${applicant.applicant_id}-${Date.now()}`,
        };

        const { error } = await supabase.functions.invoke('vizesepetim-webhook', {
          body: payload,
        });

        if (error) {
          errorCount++;
          console.error('Scenario injection error:', error);
        } else {
          successCount++;
        }

        // Small delay between injections for visual effect
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      setCompletedScenarios(prev => new Set([...prev, scenario.id]));

      toast({
        title: `Scenario: ${scenario.name}`,
        description: `Injected ${successCount} applicants${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
        variant: errorCount > 0 ? 'destructive' : 'default',
      });
    } catch (error) {
      console.error('Scenario error:', error);
      toast({
        title: 'Scenario Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(null);
    }
  };

  const resetDemoData = async () => {
    setIsLoading('reset');

    try {
      // Delete demo-prefixed applicants
      const { error: applicantError } = await supabase
        .from('vizesepetim_applicants')
        .delete()
        .like('external_id', 'demo-%');

      if (applicantError) throw applicantError;

      // Delete demo-prefixed nodes
      const { error: nodeError } = await supabase
        .from('demo_fraud_nodes')
        .delete()
        .like('node_id', 'vs-%');

      if (nodeError) throw nodeError;

      // Clear scenario and vm/vpn/geo/cluster prefixed applicants
      const prefixes = ['vm-', 'vpn-', 'geo-', 'cluster-'];
      for (const prefix of prefixes) {
        await supabase
          .from('vizesepetim_applicants')
          .delete()
          .like('external_id', `${prefix}%`);
      }

      setCompletedScenarios(new Set());

      toast({
        title: 'Demo Data Reset',
        description: 'All demo applicants and entities have been cleared',
      });
    } catch (error) {
      console.error('Reset error:', error);
      toast({
        title: 'Reset Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-surface-elevated border border-border rounded-lg shadow-2xl z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-accent" />
          <div>
            <h3 className="text-sm font-semibold">Demo Controls</h3>
            <p className="text-[10px] text-muted-foreground">Admin Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/30">
            DEMO MODE
          </Badge>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium">Auto-refresh panels</p>
            <p className="text-[10px] text-muted-foreground">Update UI after scenario injection</p>
          </div>
          <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
        </div>
      </div>

      {/* Scenarios */}
      <div className="px-4 py-3 space-y-2 max-h-[300px] overflow-y-auto">
        <p className="text-xs font-medium text-muted-foreground mb-2">SCENARIO PRESETS</p>
        
        {SCENARIOS.map((scenario) => {
          const isComplete = completedScenarios.has(scenario.id);
          const isRunning = isLoading === scenario.id;
          const Icon = scenario.icon;

          return (
            <div
              key={scenario.id}
              className={`p-3 rounded-lg border transition-colors ${
                isComplete 
                  ? 'border-accent/30 bg-accent/5' 
                  : 'border-border hover:border-accent/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <Icon className={`w-4 h-4 mt-0.5 ${scenario.color}`} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{scenario.name}</p>
                      <Badge variant="secondary" className="text-[9px]">
                        {scenario.applicants.length}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">
                      {scenario.description}
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant={isComplete ? 'default' : 'outline'}
                  onClick={() => runScenario(scenario)}
                  disabled={isLoading !== null}
                  className="shrink-0"
                >
                  {isRunning ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isComplete ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Separator />

      {/* Actions */}
      <div className="px-4 py-3 space-y-2">
        <Button
          variant="destructive"
          size="sm"
          className="w-full gap-2"
          onClick={resetDemoData}
          disabled={isLoading !== null}
        >
          {isLoading === 'reset' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RotateCcw className="w-4 h-4" />
          )}
          Reset Demo Data
        </Button>

        <p className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          This will delete all demo-injected applicants
        </p>
      </div>
    </div>
  );
}
