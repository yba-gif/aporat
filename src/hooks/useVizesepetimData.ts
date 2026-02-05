import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface VizesepetimApplicant {
  id: string;
  external_id: string;
  mobile_number_hash: string;
  ip_address: string | null;
  ip_country: string | null;
  ip_is_vpn: boolean;
  gender: 'male' | 'female' | 'other' | null;
  target_country: string;
  linked_entity_id: string | null;
  processed_at: string | null;
  metadata: {
    flags?: string[];
    correlations?: {
      mobile_matches: number;
      ip_matches: number;
    };
  };
  created_at: string;
}

export interface CorrelationData {
  mobileMatches: VizesepetimApplicant[];
  ipMatches: VizesepetimApplicant[];
}

export function useVizesepetimData() {
  const [applicants, setApplicants] = useState<VizesepetimApplicant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Fetch all applicants
  const fetchApplicants = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('vizesepetim_applicants')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      setApplicants((data || []) as unknown as VizesepetimApplicant[]);
      setError(null);
    } catch (err) {
      console.error('Error fetching vizesepetim applicants:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get correlations for a specific applicant
  const getCorrelations = useCallback(async (applicant: VizesepetimApplicant): Promise<CorrelationData> => {
    const mobileMatches: VizesepetimApplicant[] = [];
    const ipMatches: VizesepetimApplicant[] = [];

    try {
      // Find others with same mobile hash
      if (applicant.mobile_number_hash) {
        const { data: mobileData } = await supabase
          .from('vizesepetim_applicants')
          .select('*')
          .eq('mobile_number_hash', applicant.mobile_number_hash)
          .neq('id', applicant.id);
        
        if (mobileData) {
          mobileMatches.push(...(mobileData as unknown as VizesepetimApplicant[]));
        }
      }

      // Find others with same IP
      if (applicant.ip_address) {
        const { data: ipData } = await supabase
          .from('vizesepetim_applicants')
          .select('*')
          .eq('ip_address', applicant.ip_address)
          .neq('id', applicant.id);
        
        if (ipData) {
          ipMatches.push(...(ipData as unknown as VizesepetimApplicant[]));
        }
      }
    } catch (err) {
      console.error('Error fetching correlations:', err);
    }

    return { mobileMatches, ipMatches };
  }, []);

  // Get applicant by entity ID
  const getByEntityId = useCallback((entityId: string): VizesepetimApplicant | undefined => {
    return applicants.find(a => a.linked_entity_id === entityId);
  }, [applicants]);

  // Subscribe to realtime updates
  useEffect(() => {
    fetchApplicants();

    // Set up realtime subscription
    const channel = supabase
      .channel('vizesepetim-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'vizesepetim_applicants',
        },
        (payload) => {
          const newApplicant = payload.new as unknown as VizesepetimApplicant;
          setApplicants(prev => [newApplicant, ...prev]);
          
          // Show toast notification for new applicants
          const flags = newApplicant.metadata?.flags || [];
          if (flags.length > 0) {
            toast({
              title: 'New Flagged Applicant',
              description: `Applicant ${newApplicant.external_id} from vizesepetim.com: ${flags.join(', ')}`,
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'New Applicant Received',
              description: `Applicant ${newApplicant.external_id} from vizesepetim.com`,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'vizesepetim_applicants',
        },
        (payload) => {
          const updated = payload.new as unknown as VizesepetimApplicant;
          setApplicants(prev => 
            prev.map(a => a.id === updated.id ? updated : a)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchApplicants, toast]);

  // Stats for dashboard
  const stats = {
    total: applicants.length,
    flagged: applicants.filter(a => (a.metadata?.flags?.length || 0) > 0).length,
    vpnDetected: applicants.filter(a => a.ip_is_vpn).length,
    byCountry: applicants.reduce((acc, a) => {
      acc[a.target_country] = (acc[a.target_country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return {
    applicants,
    isLoading,
    error,
    fetchApplicants,
    getCorrelations,
    getByEntityId,
    stats,
  };
}
