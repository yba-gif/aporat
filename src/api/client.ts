/**
 * ALPAGUT API Client — connects the V3 frontend to the FastAPI backend.
 *
 * All endpoints return typed promises.  Auth token is stored in localStorage
 * and sent as a Bearer header automatically.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ─── Token helpers ───

let _token: string | null = null;

export function setToken(t: string | null) {
  _token = t;
  if (t) localStorage.setItem('portolan_token', t);
  else localStorage.removeItem('alpagut_token');
}

export function getToken(): string | null {
  if (!_token) _token = localStorage.getItem('alpagut_token');
  return _token;
}

export function clearAuth() {
  _token = null;
  localStorage.removeItem('alpagut_token');
  localStorage.removeItem('alpagut_user');
}

// ─── Fetch wrapper ───

async function apiFetch<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opts.headers as Record<string, string> || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });

  if (res.status === 401) {
    clearAuth();
    window.location.href = '/v3/login';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(body.detail || `API error ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── Types (match backend schemas) ───

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface CaseListItem {
  id: string;
  case_id: string;
  applicant: Record<string, any>;
  application_date: string;
  consulate_location: string;
  travel_destination: string;
  risk_score: number;
  risk_level: string;
  status: string;
  assigned_officer: string | null;
  created_at: string;
  updated_at: string;
}

export interface Finding {
  id: string;
  source: string;
  category: string;
  title: string;
  detail: string;
  url: string;
  confidence: number;
  risk_impact: string;
  timestamp: string;
  evidence: Record<string, any>;
}

export interface CaseDocument {
  id: string;
  name: string;
  type: string;
  file_path: string;
  ocr_status: string;
  extracted_fields: Record<string, string>;
}

export interface CaseEvent {
  id: string;
  type: string;
  description: string;
  user_name: string | null;
  timestamp: string;
}

export interface CaseDetail extends CaseListItem {
  risk_breakdown: Record<string, number>;
  risk_factors: string[];
  findings: Finding[];
  documents: CaseDocument[];
  events: CaseEvent[];
}

export interface PaginatedCases {
  items: CaseListItem[];
  total: number;
  page: number;
  per_page: number;
}

export interface DashboardStats {
  total_cases: number;
  pending_review: number;
  high_risk: number;
  approved_today: number;
  risk_distribution: Record<string, number>;
  recent_activity: CaseEvent[];
}

export interface Scan {
  id: string;
  case_id: string | null;
  scan_type: string;
  target_name: string;
  target_email: string | null;
  target_username: string | null;
  status: string;
  progress: number;
  tools_used: string[];
  results: Record<string, any>;
  findings_count: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  error: string | null;
}

// ─── Auth ───

export const auth = {
  login: (email: string, password: string) =>
    apiFetch<TokenResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string, name: string) =>
    apiFetch<TokenResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  me: () => apiFetch<User>('/api/auth/me'),
};

// ─── Cases ───

export const cases = {
  list: (params?: { page?: number; per_page?: number; status?: string; risk_level?: string; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.per_page) qs.set('per_page', String(params.per_page));
    if (params?.status && params.status !== 'all') qs.set('status', params.status);
    if (params?.risk_level && params.risk_level !== 'all') qs.set('risk_level', params.risk_level);
    if (params?.search) qs.set('search', params.search);
    return apiFetch<PaginatedCases>(`/api/cases?${qs.toString()}`);
  },

  get: (id: string) => apiFetch<CaseDetail>(`/api/cases/${id}`),

  create: (data: { applicant: Record<string, any>; consulate_location?: string; travel_destination?: string }) =>
    apiFetch<CaseDetail>('/api/cases', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: { status?: string; risk_score?: number; risk_level?: string; assigned_officer?: string }) =>
    apiFetch<CaseDetail>(`/api/cases/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: string) => apiFetch<void>(`/api/cases/${id}`, { method: 'DELETE' }),
};

// ─── Scans ───

export const scans = {
  trigger: (data: { case_id?: string; scan_type?: string; target_name: string; target_email?: string; target_username?: string }) =>
    apiFetch<Scan>('/api/scans', { method: 'POST', body: JSON.stringify(data) }),

  get: (id: string) => apiFetch<Scan>(`/api/scans/${id}`),

  list: (params?: { case_id?: string; status?: string; scan_type?: string }) => {
    const qs = new URLSearchParams();
    if (params?.case_id) qs.set('case_id', params.case_id);
    if (params?.status) qs.set('status', params.status);
    if (params?.scan_type) qs.set('scan_type', params.scan_type);
    return apiFetch<Scan[]>(`/api/scans?${qs.toString()}`);
  },
};

// ─── Dashboard ───

export const dashboard = {
  stats: () => apiFetch<DashboardStats>('/api/dashboard'),
};

// ─── Defence ───

export const defence = {
  scan: (data: { target_name: string; target_email?: string; target_username?: string }) =>
    apiFetch<Scan>('/api/defence/scan', { method: 'POST', body: JSON.stringify(data) }),

  batchUpload: async (file: File) => {
    const token = getToken();
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API_BASE}/api/defence/batch`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    if (!res.ok) throw new Error('Batch upload failed');
    return res.json() as Promise<Scan[]>;
  },

  list: () => apiFetch<Scan[]>('/api/defence/scans'),
};

// ─── Health ───

export const health = () => apiFetch<{ status: string; version: string }>('/api/health');
