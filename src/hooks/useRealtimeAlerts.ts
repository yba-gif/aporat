import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePlatform } from '@/contexts/PlatformContext';

interface PlatformAlert {
  id: string;
  alert_type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  entity_id?: string;
  case_id?: string;
  metadata?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export function useRealtimeAlerts() {
  const { navigateToEntity, navigateToCase } = usePlatform();

  const handleNewAlert = useCallback((alert: PlatformAlert) => {
    const severity = alert.severity;
    
    // Determine toast type based on severity
    if (severity === 'critical') {
      toast.error(alert.title, {
        description: alert.message,
        duration: 10000,
        action: alert.entity_id ? {
          label: 'View',
          onClick: () => navigateToEntity(alert.entity_id!),
        } : alert.case_id ? {
          label: 'View',
          onClick: () => navigateToCase(alert.case_id!),
        } : undefined,
      });
    } else if (severity === 'high') {
      toast.warning(alert.title, {
        description: alert.message,
        duration: 8000,
        action: alert.entity_id ? {
          label: 'View',
          onClick: () => navigateToEntity(alert.entity_id!),
        } : alert.case_id ? {
          label: 'View',
          onClick: () => navigateToCase(alert.case_id!),
        } : undefined,
      });
    } else {
      toast.info(alert.title, {
        description: alert.message,
        duration: 5000,
        action: alert.entity_id ? {
          label: 'View',
          onClick: () => navigateToEntity(alert.entity_id!),
        } : alert.case_id ? {
          label: 'View',
          onClick: () => navigateToCase(alert.case_id!),
        } : undefined,
      });
    }
  }, [navigateToEntity, navigateToCase]);

  useEffect(() => {
    // Subscribe to new alerts
    const channel = supabase
      .channel('platform-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'platform_alerts',
        },
        (payload) => {
          handleNewAlert(payload.new as PlatformAlert);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [handleNewAlert]);

  // Function to create a new alert (for testing/demo)
  const createAlert = useCallback(async (alert: Omit<PlatformAlert, 'id' | 'is_read' | 'created_at'>) => {
    const { error } = await supabase
      .from('platform_alerts')
      .insert([{
        alert_type: alert.alert_type,
        severity: alert.severity,
        title: alert.title,
        message: alert.message,
        entity_id: alert.entity_id || null,
        case_id: alert.case_id || null,
        metadata: (alert.metadata || {}) as Record<string, string | number | boolean | null>,
      }]);
    
    if (error) {
      console.error('Failed to create alert:', error);
    }
  }, []);

  return { createAlert };
}
