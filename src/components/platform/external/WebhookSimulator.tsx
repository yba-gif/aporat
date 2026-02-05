import { useState } from 'react';
import { Zap, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Demo applicant templates with varying risk profiles
const DEMO_APPLICANTS = [
  {
    name: 'Clean Applicant',
    data: {
      applicant_id: `demo-clean-${Date.now()}`,
      mobile_number: `+90555${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
      ip_address: '185.34.52.101',
      gender: 'female' as const,
      target_country: 'DE',
    },
    description: 'Standard applicant with no risk flags',
    risk: 'low',
  },
  {
    name: 'VPN User',
    data: {
      applicant_id: `demo-vpn-${Date.now()}`,
      mobile_number: `+90555${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
      ip_address: '104.238.140.77', // Known VPN IP range
      gender: 'male' as const,
      target_country: 'US',
    },
    description: 'Applicant using VPN/proxy connection',
    risk: 'medium',
  },
  {
    name: 'Duplicate Mobile',
    data: {
      applicant_id: `demo-dup-${Date.now()}`,
      mobile_number: '+905551234567', // Static number to create duplicates
      ip_address: '78.160.45.23',
      gender: 'male' as const,
      target_country: 'UK',
    },
    description: 'Uses same mobile number as existing applicant',
    risk: 'high',
  },
  {
    name: 'Shared IP (Network)',
    data: {
      applicant_id: `demo-net-${Date.now()}`,
      mobile_number: `+90555${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
      ip_address: '88.242.100.50', // Static IP to create network patterns
      gender: 'other' as const,
      target_country: 'FR',
    },
    description: 'Multiple applications from same IP address',
    risk: 'high',
  },
];

interface WebhookSimulatorProps {
  onSuccess?: () => void;
}

export function WebhookSimulator({ onSuccess }: WebhookSimulatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const { toast } = useToast();

  const simulateWebhook = async (applicant: typeof DEMO_APPLICANTS[0]) => {
    setIsLoading(applicant.name);
    setSuccessId(null);

    try {
      // Generate unique ID for this simulation
      const payload = {
        ...applicant.data,
        applicant_id: `demo-${applicant.data.applicant_id.split('-')[1]}-${Date.now()}`,
      };

      // Call the actual edge function
      const { data, error } = await supabase.functions.invoke('vizesepetim-webhook', {
        body: payload,
      });

      if (error) throw error;

      setSuccessId(applicant.name);
      toast({
        title: 'Webhook Simulated',
        description: `${applicant.name} injected successfully. Entity: ${data.entity_id}`,
      });

      onSuccess?.();

      // Clear success state after 2s
      setTimeout(() => setSuccessId(null), 2000);
    } catch (error) {
      console.error('Webhook simulation error:', error);
      toast({
        title: 'Simulation Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(null);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-accent';
      case 'medium': return 'text-amber-500';
      case 'high': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Zap className="w-4 h-4" />
          Simulate Webhook
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" />
            Demo Webhook Simulator
          </DialogTitle>
          <DialogDescription>
            Inject test applicants via the vizesepetim.com webhook to demonstrate fraud detection capabilities.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {DEMO_APPLICANTS.map((applicant) => (
            <div
              key={applicant.name}
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/20 hover:bg-secondary/40 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{applicant.name}</span>
                  <span className={`text-[10px] font-semibold uppercase ${getRiskColor(applicant.risk)}`}>
                    {applicant.risk}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {applicant.description}
                </p>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                  <span>→ {applicant.data.target_country}</span>
                  <span>• {applicant.data.gender}</span>
                </div>
              </div>

              <Button
                size="sm"
                variant={successId === applicant.name ? 'default' : 'outline'}
                onClick={() => simulateWebhook(applicant)}
                disabled={isLoading !== null}
                className="ml-3 min-w-[80px]"
              >
                {isLoading === applicant.name ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : successId === applicant.name ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  'Inject'
                )}
              </Button>
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground text-center border-t border-border pt-3">
          Injected applicants will appear in the panel with real-time correlation analysis
        </div>
      </DialogContent>
    </Dialog>
  );
}
