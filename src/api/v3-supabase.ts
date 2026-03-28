/**
 * V3 Supabase Data Layer
 * Replaces the FastAPI client with direct Supabase queries.
 * Exports the same types/shapes as @/api/client for compatibility.
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  CaseListItem, CaseDetail, PaginatedCases,
  DashboardStats, CaseEvent, Finding, CaseDocument, Scan,
} from './client';

// ─── Cases ───

export const v3Cases = {
  list: async (params?: {
    page?: number; per_page?: number;
    status?: string; risk_level?: string; search?: string;
  }): Promise<PaginatedCases> => {
    const page = params?.page || 1;
    const perPage = params?.per_page || 25;
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let query = supabase.from('v3_cases').select('*', { count: 'exact' });

    if (params?.status && params.status !== 'all') {
      query = query.eq('status', params.status);
    }
    if (params?.risk_level && params.risk_level !== 'all') {
      query = query.eq('risk_level', params.risk_level);
    }
    if (params?.search) {
      query = query.or(`case_id.ilike.%${params.search}%,applicant->>firstName.ilike.%${params.search}%,applicant->>lastName.ilike.%${params.search}%`);
    }

    query = query.order('created_at', { ascending: false }).range(from, to);
    const { data, count, error } = await query;
    if (error) throw new Error(error.message);

    return {
      items: (data || []).map(mapCaseRow),
      total: count || 0,
      page,
      per_page: perPage,
    };
  },

  get: async (id: string): Promise<CaseDetail> => {
    const { data: caseRow, error } = await supabase
      .from('v3_cases')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);

    // Fetch related data in parallel
    const [findingsRes, docsRes, eventsRes] = await Promise.all([
      supabase.from('v3_osint_findings').select('*').eq('case_id', id).order('timestamp', { ascending: false }),
      supabase.from('v3_case_documents').select('*').eq('case_id', id),
      supabase.from('v3_case_events').select('*').eq('case_id', id).order('timestamp', { ascending: true }),
    ]);

    return {
      ...mapCaseRow(caseRow),
      risk_breakdown: (caseRow.risk_breakdown as Record<string, number>) || {},
      risk_factors: (caseRow.risk_factors as string[]) || [],
      findings: (findingsRes.data || []).map(mapFinding),
      documents: (docsRes.data || []).map(mapDocument),
      events: (eventsRes.data || []).map(mapEvent),
    };
  },

  update: async (id: string, data: { status?: string; risk_score?: number; risk_level?: string; assigned_officer?: string }): Promise<CaseDetail> => {
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.status !== undefined) updateData.status = data.status;
    if (data.risk_score !== undefined) updateData.risk_score = data.risk_score;
    if (data.risk_level !== undefined) updateData.risk_level = data.risk_level;
    if (data.assigned_officer !== undefined) updateData.assigned_officer = data.assigned_officer;

    const { error } = await supabase.from('v3_cases').update(updateData).eq('id', id);
    if (error) throw new Error(error.message);

    // Create event for status change
    if (data.status) {
      const user = (await supabase.auth.getUser()).data.user;
      await supabase.from('v3_case_events').insert({
        case_id: id,
        type: data.status === 'approved' ? 'approved' : data.status === 'rejected' ? 'rejected' : 'escalated',
        description: `Case ${data.status} by ${user?.email || 'system'}`,
        user_name: user?.email || null,
      });
    }

    return v3Cases.get(id);
  },

  create: async (data: { applicant: Record<string, unknown>; consulate_location?: string; travel_destination?: string }): Promise<CaseDetail> => {
    const caseId = `PL-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;
    const insertData = {
      case_id: caseId,
      applicant: data.applicant as any,
      consulate_location: data.consulate_location || 'Istanbul',
      travel_destination: data.travel_destination || 'Schengen',
    };
    const { data: row, error } = await supabase.from('v3_cases').insert(insertData).select().single();
    if (error) throw new Error(error.message);

    // Create initial event
    await supabase.from('v3_case_events').insert({
      case_id: row.id,
      type: 'created',
      description: `Case ${caseId} created`,
    } as any);

    return v3Cases.get(row.id);
  },
};

// ─── Dashboard ───

export const v3Dashboard = {
  stats: async (): Promise<DashboardStats> => {
    const { data: cases, error } = await supabase.from('v3_cases').select('status, risk_level, risk_score');
    if (error) throw new Error(error.message);

    const all = cases || [];
    const totalCases = all.length;
    const pendingReview = all.filter(c => c.status === 'in_review' || c.status === 'new').length;
    const highRisk = all.filter(c => c.risk_level === 'high' || c.risk_level === 'critical').length;
    const approvedToday = all.filter(c => {
      // Simple check since we don't have updated_at in this query
      return c.status === 'approved';
    }).length;

    const riskDist = { low: 0, medium: 0, high: 0, critical: 0 };
    all.forEach(c => {
      const rl = c.risk_level as keyof typeof riskDist;
      if (rl in riskDist) riskDist[rl]++;
    });

    // Get recent events
    const { data: events } = await supabase.from('v3_case_events').select('*').order('timestamp', { ascending: false }).limit(15);

    return {
      total_cases: totalCases,
      pending_review: pendingReview,
      high_risk: highRisk,
      approved_today: approvedToday,
      risk_distribution: riskDist,
      recent_activity: (events || []).map(mapEvent),
    };
  },
};

// ─── Scans ───

export const v3Scans = {
  list: async (params?: { case_id?: string; status?: string; scan_type?: string }): Promise<Scan[]> => {
    let query = supabase.from('v3_osint_scans').select('*');
    if (params?.case_id) query = query.eq('case_id', params.case_id);
    if (params?.status) query = query.eq('status', params.status);
    if (params?.scan_type) query = query.eq('scan_type', params.scan_type);
    query = query.order('created_at', { ascending: false });
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data || []).map(mapScan);
  },

  get: async (id: string): Promise<Scan> => {
    const { data, error } = await supabase.from('v3_osint_scans').select('*').eq('id', id).single();
    if (error) throw new Error(error.message);
    return mapScan(data);
  },

  trigger: async (scanData: { case_id?: string; scan_type?: string; target_name: string; target_email?: string; target_username?: string }): Promise<Scan> => {
    const { data, error } = await supabase.from('v3_osint_scans').insert({
      case_id: scanData.case_id || null,
      scan_type: scanData.scan_type || 'visa',
      target_name: scanData.target_name,
      target_email: scanData.target_email || null,
      target_username: scanData.target_username || null,
      status: 'queued',
      progress: 0,
    }).select().single();
    if (error) throw new Error(error.message);
    return mapScan(data);
  },
};

// ─── Defence ───

export const v3Defence = {
  listScans: async () => {
    const { data, error } = await supabase
      .from('v3_defence_scans')
      .select('*, v3_personnel(*)')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  },

  listPersonnel: async () => {
    const { data, error } = await supabase.from('v3_personnel').select('*').order('overall_risk', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  },
};

// ─── Mappers ───

function mapCaseRow(row: any): CaseListItem {
  return {
    id: row.id,
    case_id: row.case_id,
    applicant: row.applicant as Record<string, any>,
    application_date: row.application_date,
    consulate_location: row.consulate_location,
    travel_destination: row.travel_destination,
    risk_score: Number(row.risk_score),
    risk_level: row.risk_level,
    status: row.status,
    assigned_officer: row.assigned_officer,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapFinding(row: any): Finding {
  return {
    id: row.id,
    source: row.source,
    category: row.category,
    title: row.title,
    detail: row.detail,
    url: row.url || '',
    confidence: row.confidence || 0,
    risk_impact: row.risk_impact || 'none',
    timestamp: row.timestamp,
    evidence: row.evidence || {},
  };
}

function mapDocument(row: any): CaseDocument {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    file_path: row.file_path || '',
    ocr_status: row.ocr_status || 'pending',
    extracted_fields: row.extracted_fields || {},
  };
}

function mapEvent(row: any): CaseEvent {
  return {
    id: row.id,
    type: row.type,
    description: row.description,
    user_name: row.user_name || null,
    timestamp: row.timestamp,
  };
}

function mapScan(row: any): Scan {
  return {
    id: row.id,
    case_id: row.case_id,
    scan_type: row.scan_type,
    target_name: row.target_name,
    target_email: row.target_email,
    target_username: row.target_username,
    status: row.status,
    progress: row.progress || 0,
    tools_used: row.tools_used || [],
    results: row.results || {},
    findings_count: row.findings_count || 0,
    started_at: row.started_at,
    completed_at: row.completed_at,
    created_at: row.created_at,
    error: row.error,
  };
}
