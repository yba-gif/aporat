/**
 * React hooks that wrap the API client.
 * Each hook handles loading, error, and refetch states.
 */

import { useState, useEffect, useCallback } from 'react';
import * as api from './client';
import type {
  CaseDetail, CaseListItem, PaginatedCases,
  DashboardStats, Scan, User,
} from './client';

// ─── Generic fetch hook ───

function useApiCall<T>(fetcher: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    fetcher()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, deps);

  useEffect(() => { refetch(); }, [refetch]);

  return { data, loading, error, refetch };
}

// ─── Dashboard ───

export function useDashboard() {
  return useApiCall(() => api.dashboard.stats(), []);
}

// ─── Cases list ───

export function useCases(params: {
  page?: number;
  per_page?: number;
  status?: string;
  risk_level?: string;
  search?: string;
}) {
  return useApiCall(
    () => api.cases.list(params),
    [params.page, params.per_page, params.status, params.risk_level, params.search],
  );
}

// ─── Single case ───

export function useCase(id: string | undefined) {
  return useApiCall(
    () => id ? api.cases.get(id) : Promise.reject('No ID'),
    [id],
  );
}

// ─── Scans ───

export function useScans(params?: { case_id?: string; status?: string; scan_type?: string }) {
  return useApiCall(
    () => api.scans.list(params),
    [params?.case_id, params?.status, params?.scan_type],
  );
}

export function useScan(id: string | undefined) {
  return useApiCall(
    () => id ? api.scans.get(id) : Promise.reject('No ID'),
    [id],
  );
}

// ─── Defence scans ───

export function useDefenceScans() {
  return useApiCall(() => api.defence.list(), []);
}

// ─── Auth state ───

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('alpagu_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.auth.login(email, password);
      api.setToken(res.access_token);
      localStorage.setItem('alpagu_user', JSON.stringify(res.user));
      setUser(res.user);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.clearAuth();
    setUser(null);
  };

  const isAuthenticated = !!user && !!api.getToken();

  return { user, login, logout, loading, isAuthenticated };
}
