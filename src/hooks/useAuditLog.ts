import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export type AuditAction = 
  | 'view_entity'
  | 'view_document'
  | 'view_case'
  | 'export_case'
  | 'decision_made'
  | 'document_uploaded'
  | 'entity_flagged'
  | 'alert_dismissed'
  | 'module_switched'
  | 'path_analysis'
  | 'webhook_received'
  | 'entity_created'
  | 'twitter_lookup'
  | 'social_analyzer_lookup';

export type AuditSource = 'user' | 'system' | 'vizesepetim';

export type AuditTargetType = 'entity' | 'document' | 'case' | 'applicant' | 'alert' | 'username';

interface LogOptions {
  action: AuditAction;
  source?: AuditSource;
  targetId?: string;
  targetType?: AuditTargetType;
  userRole?: string;
  context?: Record<string, unknown>;
}

export function useAuditLog() {
  const log = useCallback(async (options: LogOptions) => {
    const {
      action,
      source = 'user',
      targetId,
      targetType,
      userRole = 'analyst', // Default role for demo
      context = {},
    } = options;

    try {
      const insertData = {
        action: action as string,
        source: source as string,
        target_id: targetId ?? null,
        target_type: targetType ?? null,
        user_role: userRole,
        context: context as Json,
      };
      
      const { error } = await supabase
        .from('platform_audit_log')
        .insert([insertData]);

      if (error) {
        console.error('Failed to log audit event:', error);
      }
    } catch (err) {
      console.error('Audit logging error:', err);
    }
  }, []);

  // Convenience methods for common actions
  const logEntityView = useCallback((entityId: string, context?: Record<string, unknown>) => {
    return log({
      action: 'view_entity',
      targetId: entityId,
      targetType: 'entity',
      context,
    });
  }, [log]);

  const logDocumentView = useCallback((documentId: string, context?: Record<string, unknown>) => {
    return log({
      action: 'view_document',
      targetId: documentId,
      targetType: 'document',
      context,
    });
  }, [log]);

  const logCaseView = useCallback((caseId: string, context?: Record<string, unknown>) => {
    return log({
      action: 'view_case',
      targetId: caseId,
      targetType: 'case',
      context,
    });
  }, [log]);

  const logDecision = useCallback((caseId: string, decision: 'approved' | 'rejected' | 'escalated', context?: Record<string, unknown>) => {
    return log({
      action: 'decision_made',
      targetId: caseId,
      targetType: 'case',
      context: { decision, ...context },
    });
  }, [log]);

  const logExport = useCallback((caseId: string, exportType: string, context?: Record<string, unknown>) => {
    return log({
      action: 'export_case',
      targetId: caseId,
      targetType: 'case',
      context: { exportType, ...context },
    });
  }, [log]);

  const logModuleSwitch = useCallback((fromModule: string, toModule: string) => {
    return log({
      action: 'module_switched',
      context: { from: fromModule, to: toModule },
    });
  }, [log]);

  return {
    log,
    logEntityView,
    logDocumentView,
    logCaseView,
    logDecision,
    logExport,
    logModuleSwitch,
  };
}
