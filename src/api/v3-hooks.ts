/**
 * V3 React hooks — Supabase-backed replacements for the FastAPI hooks.
 * Drop-in replacements with the same API surface.
 */

import { useState, useEffect, useCallback } from 'react';
import { v3Cases, v3Dashboard, v3Scans, v3Defence } from './v3-supabase';
import type {
  CaseDetail, CaseListItem, PaginatedCases,
  DashboardStats, Scan,
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

export function useV3Dashboard() {
  return useApiCall(() => v3Dashboard.stats(), []);
}

// ─── Cases list ───

export function useV3Cases(params: {
  page?: number;
  per_page?: number;
  status?: string;
  risk_level?: string;
  search?: string;
}) {
  return useApiCall(
    () => v3Cases.list(params),
    [params.page, params.per_page, params.status, params.risk_level, params.search],
  );
}

// ─── Single case ───

export function useV3Case(id: string | undefined) {
  return useApiCall(
    () => id ? v3Cases.get(id) : Promise.reject('No ID'),
    [id],
  );
}

// ─── Scans ───

export function useV3Scans(params?: { case_id?: string; status?: string; scan_type?: string }) {
  return useApiCall(
    () => v3Scans.list(params),
    [params?.case_id, params?.status, params?.scan_type],
  );
}

// ─── Defence ───

export function useV3DefenceScans() {
  return useApiCall(() => v3Defence.listScans(), []);
}

export function useV3Personnel() {
  return useApiCall(() => v3Defence.listPersonnel(), []);
}
