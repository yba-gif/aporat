import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_BASE = 'http://localhost:8000/api/defence/osint';

// ─── Types ──────────────────────────────────────────────────────────
export interface DashboardStats {
  total_alerts: number;
  live_streams_detected: number;
  strava_routes_flagged: number;
  total_installations: number;
  alerts_last_24h: number;
  alerts_by_severity: { critical: number; high: number; medium: number; low: number };
  collectors_status: Record<string, string>;
}

export interface Alert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'new' | 'acknowledged' | 'investigating' | 'resolved' | 'false_positive';
  threat_category: string;
  platform: string;
  title: string;
  description: string;
  evidence_url: string | null;
  created_at: string;
  person_id: string | null;
  installation_id: string | null;
  person_name?: string;
  installation_name?: string;
  resolution_notes?: string;
}

export interface Installation {
  id: string;
  name: string;
  code: string;
  installation_type: string;
  city: string;
  latitude: number;
  longitude: number;
  radius_km: number;
  classification: string;
  is_active: boolean;
}

export interface CollectorStatus {
  platform: string;
  status: 'idle' | 'running' | 'error' | 'disabled';
  last_run_at: string | null;
  last_success_at: string | null;
  last_error: string | null;
  items_collected_total: number;
  items_collected_today: number;
  alerts_generated_total: number;
}

export interface GeofenceResult {
  inside_geofence: boolean;
  nearest: { id: string; name: string; code: string } | null;
  distance_km: number;
  severity: 'critical' | 'high' | 'medium' | 'low' | null;
}

// ─── Mock Data ──────────────────────────────────────────────────────
export const MOCK_INSTALLATIONS: Installation[] = [
  { id: '1', name: 'İncirlik Air Base', code: 'INCIRLIK', installation_type: 'airfield', city: 'Adana', latitude: 37.0021, longitude: 35.4259, radius_km: 3.0, classification: 'unclassified', is_active: true },
  { id: '2', name: 'Kürecik Radar Station', code: 'KURECIK', installation_type: 'radar', city: 'Malatya', latitude: 38.1750, longitude: 37.8350, radius_km: 5.0, classification: 'classified', is_active: true },
  { id: '3', name: 'Akıncı Air Base', code: 'AKINCI', installation_type: 'airfield', city: 'Ankara', latitude: 40.0789, longitude: 32.5656, radius_km: 2.5, classification: 'unclassified', is_active: true },
  { id: '4', name: 'Dalaman Air Base', code: 'DALAMAN', installation_type: 'airfield', city: 'Muğla', latitude: 36.7133, longitude: 28.7925, radius_km: 2.0, classification: 'unclassified', is_active: true },
  { id: '5', name: 'Diyarbakır Air Base', code: 'DIYARBAKIR', installation_type: 'airfield', city: 'Diyarbakır', latitude: 37.8939, longitude: 40.2010, radius_km: 3.0, classification: 'unclassified', is_active: true },
  { id: '6', name: 'Konya Air Base', code: 'KONYA', installation_type: 'airfield', city: 'Konya', latitude: 37.9790, longitude: 32.5615, radius_km: 3.0, classification: 'unclassified', is_active: true },
  { id: '7', name: 'Eskişehir Air Base', code: 'ESKISEHIR', installation_type: 'airfield', city: 'Eskişehir', latitude: 39.7841, longitude: 30.5821, radius_km: 2.5, classification: 'unclassified', is_active: true },
  { id: '8', name: 'Merzifon Air Base', code: 'MERZIFON', installation_type: 'airfield', city: 'Amasya', latitude: 40.8294, longitude: 35.5190, radius_km: 2.0, classification: 'unclassified', is_active: true },
  { id: '9', name: 'Çiğli Air Base', code: 'CIGLI', installation_type: 'airfield', city: 'İzmir', latitude: 38.5130, longitude: 27.0101, radius_km: 2.5, classification: 'unclassified', is_active: true },
  { id: '10', name: 'Gölcük Naval Base', code: 'GOLCUK', installation_type: 'naval', city: 'Kocaeli', latitude: 40.7178, longitude: 29.7878, radius_km: 2.0, classification: 'classified', is_active: true },
  { id: '11', name: 'Aksaz Naval Base', code: 'AKSAZ', installation_type: 'naval', city: 'Muğla', latitude: 36.9381, longitude: 28.1047, radius_km: 2.5, classification: 'classified', is_active: true },
  { id: '12', name: 'İskenderun Naval Base', code: 'ISKENDERUN', installation_type: 'naval', city: 'Hatay', latitude: 36.5882, longitude: 36.1640, radius_km: 2.0, classification: 'unclassified', is_active: true },
  { id: '13', name: 'TSK General Staff HQ', code: 'TSK-HQ', installation_type: 'headquarters', city: 'Ankara', latitude: 39.9334, longitude: 32.8597, radius_km: 1.0, classification: 'classified', is_active: true },
  { id: '14', name: '1st Army Command', code: '1ORDU', installation_type: 'headquarters', city: 'İstanbul', latitude: 41.0082, longitude: 28.9784, radius_km: 1.5, classification: 'classified', is_active: true },
  { id: '15', name: 'Sarıkamış Military Base', code: 'SARIKAMIS', installation_type: 'army_base', city: 'Kars', latitude: 40.3333, longitude: 42.5833, radius_km: 4.0, classification: 'unclassified', is_active: true },
  { id: '16', name: 'Silopi Military Base', code: 'SILOPI', installation_type: 'army_base', city: 'Şırnak', latitude: 37.2482, longitude: 42.4706, radius_km: 3.0, classification: 'classified', is_active: true },
  { id: '17', name: 'Hakkari Military Base', code: 'HAKKARI', installation_type: 'army_base', city: 'Hakkari', latitude: 37.5744, longitude: 43.7408, radius_km: 3.5, classification: 'classified', is_active: true },
  { id: '18', name: 'Foça Training Center', code: 'FOCA', installation_type: 'training', city: 'İzmir', latitude: 38.6696, longitude: 26.7580, radius_km: 3.0, classification: 'unclassified', is_active: true },
  { id: '19', name: 'Isparta Mountain Training', code: 'ISPARTA', installation_type: 'training', city: 'Isparta', latitude: 37.7648, longitude: 30.5566, radius_km: 5.0, classification: 'unclassified', is_active: true },
  { id: '20', name: 'Eğirdir Commando School', code: 'EGIRDIR', installation_type: 'training', city: 'Isparta', latitude: 37.8833, longitude: 30.8667, radius_km: 4.0, classification: 'unclassified', is_active: true },
];

const MOCK_ALERTS: Alert[] = [
  // TikTok live stream alerts
  { id: 'a1', severity: 'critical', status: 'new', threat_category: 'live_stream', platform: 'tiktok', title: 'Live stream from İncirlik flight line — keyword "askeriye"', description: 'Active TikTok livestream detected via keyword search "askeriye". Unknown soldier broadcasting from İncirlik Air Base showing F-16 shelters and runway operations. Stream has 1,200 concurrent viewers. GPS metadata confirms location within 200m of HAS area.', evidence_url: 'https://tiktok.com/@user_38291/live', created_at: new Date(Date.now() - 180000).toISOString(), person_id: null, installation_id: '1', installation_name: 'İncirlik Air Base' },
  { id: 'a2', severity: 'critical', status: 'new', threat_category: 'live_stream', platform: 'tiktok', title: 'Barracks live stream — keyword "komando" detected', description: 'TikTok live stream found via "komando" keyword search. Unknown commando trainee broadcasting from barracks at Eğirdir Commando School. Shows unit patches, sleeping quarters layout, and discusses upcoming field exercise schedule. 340 viewers.', evidence_url: 'https://tiktok.com/@user_77104/live', created_at: new Date(Date.now() - 420000).toISOString(), person_id: null, installation_id: '20', installation_name: 'Eğirdir Commando School' },
  { id: 'a3', severity: 'high', status: 'new', threat_category: 'live_stream', platform: 'tiktok', title: 'Convoy filming on TikTok Live — "mehmetcik" keyword', description: 'Civilian or soldier broadcasting military convoy movement through Şırnak province on TikTok Live. Detected via "mehmetcik" keyword. Video shows 15+ vehicles, unit markings visible, direction of travel identifiable. 890 viewers.', evidence_url: null, created_at: new Date(Date.now() - 900000).toISOString(), person_id: null, installation_id: '16', installation_name: 'Silopi Military Base' },
  { id: 'a4', severity: 'high', status: 'acknowledged', threat_category: 'live_stream', platform: 'tiktok', title: 'Guard post live stream — "jandarma" keyword match', description: 'TikTok live detected via "jandarma" keyword. Unknown gendarmerie soldier streaming from checkpoint near Hakkari. Shows checkpoint layout, vehicle inspection procedures, and weapon positions. Geolocated within 500m of base perimeter.', evidence_url: 'https://tiktok.com/@user_55012/live', created_at: new Date(Date.now() - 2400000).toISOString(), person_id: null, installation_id: '17', installation_name: 'Hakkari Military Base' },
  { id: 'a5', severity: 'medium', status: 'new', threat_category: 'live_stream', platform: 'tiktok', title: 'Mess hall stream — "askerlik" keyword', description: 'Low-risk TikTok live from military mess hall. Detected via "askerlik" keyword. Shows interior layout and daily routine timing but no sensitive equipment or locations. 120 viewers. Flagged for monitoring.', evidence_url: null, created_at: new Date(Date.now() - 5400000).toISOString(), person_id: null, installation_id: '6', installation_name: 'Konya Air Base' },
  { id: 'a6', severity: 'low', status: 'new', threat_category: 'live_stream', platform: 'tiktok', title: 'Off-duty soldier stream near base — "asker" keyword', description: 'TikTok live from someone near Çiğli Air Base perimeter. Detected via "asker" keyword. No sensitive content visible but base gate and fence line briefly shown in background. 45 viewers.', evidence_url: null, created_at: new Date(Date.now() - 14400000).toISOString(), person_id: null, installation_id: '9', installation_name: 'Çiğli Air Base' },
  // Strava route alerts
  { id: 'a7', severity: 'critical', status: 'new', threat_category: 'route_exposure', platform: 'strava', title: 'Running route traces full perimeter of Silopi base', description: 'Strava activity detected from unknown user running the complete perimeter of Silopi Military Base. Route reveals fence line, entry points, guard tower positions, and a previously unmapped access road. Segment has been public for 3 days.', evidence_url: 'https://strava.com/activities/12345', created_at: new Date(Date.now() - 600000).toISOString(), person_id: null, installation_id: '16', installation_name: 'Silopi Military Base' },
  { id: 'a8', severity: 'high', status: 'new', threat_category: 'route_exposure', platform: 'strava', title: 'Patrol route pattern revealed at Hakkari base', description: 'Multiple Strava running activities from different users near Hakkari Military Base reveal consistent patrol timing and routes. Analysis shows 4 unique route patterns covering different sectors with predictable 6-hour rotation schedule.', evidence_url: 'https://strava.com/segments/67890', created_at: new Date(Date.now() - 3600000).toISOString(), person_id: null, installation_id: '17', installation_name: 'Hakkari Military Base' },
  { id: 'a9', severity: 'high', status: 'investigating', threat_category: 'route_exposure', platform: 'strava', title: 'Strava segment created inside Kürecik radar perimeter', description: 'Public Strava segment traces internal road network within Kürecik Radar Station security zone. Route passes within 200m of AN/TPY-2 radar array position. Segment has 8 recorded attempts from 5 different athletes.', evidence_url: 'https://strava.com/segments/11223', created_at: new Date(Date.now() - 7200000).toISOString(), person_id: null, installation_id: '2', installation_name: 'Kürecik Radar Station' },
  { id: 'a10', severity: 'medium', status: 'new', threat_category: 'route_exposure', platform: 'strava', title: 'Cycling route exposes checkpoint positions at Foça', description: 'Strava cycling activity near Foça Training Center shows stops at 3 checkpoint locations along perimeter road. Activity metadata reveals time spent at each checkpoint — consistent with security inspection timing.', evidence_url: null, created_at: new Date(Date.now() - 10800000).toISOString(), person_id: null, installation_id: '18', installation_name: 'Foça Training Center' },
  { id: 'a11', severity: 'medium', status: 'new', threat_category: 'route_exposure', platform: 'strava', title: 'PT route inside Isparta training grounds', description: 'Strava running activity recorded entirely within Isparta Mountain Training facility boundaries. Route reveals internal trail network, assembly areas, and obstacle course positions.', evidence_url: null, created_at: new Date(Date.now() - 21600000).toISOString(), person_id: null, installation_id: '19', installation_name: 'Isparta Mountain Training' },
  { id: 'a12', severity: 'low', status: 'resolved', threat_category: 'route_exposure', platform: 'strava', title: 'Running activity near Gölcük Naval Base gate', description: 'Strava activity passes within 500m of Gölcük Naval Base main gate. Low risk — public road. Flagged due to proximity and repeated activity from same user (12 runs in 30 days).', evidence_url: null, created_at: new Date(Date.now() - 86400000).toISOString(), person_id: null, installation_id: '10', installation_name: 'Gölcük Naval Base', resolution_notes: 'Public road — civilian jogger. Marked as low priority.' },
];

const MOCK_STATS: DashboardStats = {
  total_alerts: MOCK_ALERTS.length,
  live_streams_detected: MOCK_ALERTS.filter(a => a.platform === 'tiktok').length,
  strava_routes_flagged: MOCK_ALERTS.filter(a => a.platform === 'strava').length,
  total_installations: MOCK_INSTALLATIONS.length,
  alerts_last_24h: 8,
  alerts_by_severity: { critical: 3, high: 3, medium: 3, low: 3 },
  collectors_status: { tiktok: 'running', strava: 'idle' },
};

const MOCK_COLLECTORS: CollectorStatus[] = [
  { platform: 'tiktok', status: 'running', last_run_at: new Date(Date.now() - 120000).toISOString(), last_success_at: new Date(Date.now() - 120000).toISOString(), last_error: null, items_collected_total: 4231, items_collected_today: 87, alerts_generated_total: 156 },
  { platform: 'strava', status: 'idle', last_run_at: new Date(Date.now() - 1800000).toISOString(), last_success_at: new Date(Date.now() - 1800000).toISOString(), last_error: null, items_collected_total: 891, items_collected_today: 12, alerts_generated_total: 34 },
];

// ─── API Fetch ──────────────────────────────────────────────────────
let _backendOnline = false;

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`${res.status}`);
  _backendOnline = true;
  return res.json();
}

async function fetchWithFallback<T>(path: string, fallback: T, options?: RequestInit): Promise<T> {
  try {
    return await apiFetch<T>(path, options);
  } catch {
    _backendOnline = false;
    return fallback;
  }
}

// ─── Hooks ──────────────────────────────────────────────────────────
export function useBackendStatus() {
  return useQuery({
    queryKey: ['defence', 'health'],
    queryFn: async () => {
      try {
        await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
        return true;
      } catch {
        return false;
      }
    },
    refetchInterval: 15000,
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['defence', 'stats'],
    queryFn: async () => {
      const raw = await fetchWithFallback<any>('/dashboard/stats', MOCK_STATS);
      // Normalize backend fields to our DashboardStats interface
      return {
        total_alerts: raw.total_alerts ?? 0,
        live_streams_detected: raw.live_streams_detected ?? 0,
        strava_routes_flagged: raw.strava_routes_flagged ?? 0,
        total_installations: raw.total_installations ?? 0,
        alerts_last_24h: raw.alerts_last_24h ?? raw.alerts_24h ?? 0,
        alerts_by_severity: raw.alerts_by_severity ?? { critical: 0, high: 0, medium: 0, low: 0 },
        collectors_status: raw.collectors_status ?? {},
      } as DashboardStats;
    },
    refetchInterval: 15000,
  });
}

export function useTopThreats() {
  return useQuery({
    queryKey: ['defence', 'top-threats'],
    queryFn: () => fetchWithFallback<Alert[]>('/dashboard/top-threats', MOCK_ALERTS.filter(a => ['critical', 'high'].includes(a.severity) && a.status !== 'resolved').slice(0, 10)),
    refetchInterval: 15000,
  });
}

export function useAlerts(params?: { severity?: string; status?: string; platform?: string; skip?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.severity) query.set('severity', params.severity);
  if (params?.status) query.set('status', params.status);
  if (params?.platform) query.set('platform', params.platform);
  query.set('skip', String(params?.skip || 0));
  query.set('limit', String(params?.limit || 50));
  const qs = query.toString();

  return useQuery({
    queryKey: ['defence', 'alerts', qs],
    queryFn: () => {
      let filtered = [...MOCK_ALERTS];
      if (params?.severity) filtered = filtered.filter(a => a.severity === params.severity);
      if (params?.status) filtered = filtered.filter(a => a.status === params.status);
      if (params?.platform) filtered = filtered.filter(a => a.platform === params.platform);
      return fetchWithFallback<Alert[]>(`/alerts?${qs}`, filtered);
    },
    refetchInterval: 15000,
  });
}

export function useInstallations() {
  return useQuery({
    queryKey: ['defence', 'installations'],
    queryFn: () => fetchWithFallback<Installation[]>('/installations', MOCK_INSTALLATIONS),
    refetchInterval: 15000,
  });
}

export function useScanStatus() {
  return useQuery({
    queryKey: ['defence', 'scan-status'],
    queryFn: async () => {
      const raw = await fetchWithFallback<any[]>('/scan/status', MOCK_COLLECTORS);
      // Normalize backend field names to our CollectorStatus interface
      return raw
        .filter((c: any) => c.platform === 'tiktok' || c.platform === 'strava')
        .map((c: any): CollectorStatus => ({
          platform: c.platform,
          status: c.status ?? 'idle',
          last_run_at: c.last_run_at ?? c.last_run ?? null,
          last_success_at: c.last_success_at ?? c.last_success ?? null,
          last_error: c.last_error ?? null,
          items_collected_total: c.items_collected_total ?? c.items_total ?? 0,
          items_collected_today: c.items_collected_today ?? c.items_today ?? 0,
          alerts_generated_total: c.alerts_generated_total ?? 0,
        }));
    },
    refetchInterval: 15000,
  });
}

export function useAcknowledgeAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try { return await apiFetch(`/alerts/${id}/acknowledge`, { method: 'POST', body: JSON.stringify({ acknowledged_by: 'operator' }) }); }
      catch { return { ok: true }; }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['defence'] }); toast.success('Alert acknowledged'); },
    onError: () => toast.error('Failed to acknowledge alert'),
  });
}

export function useResolveAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, notes, falsePositive }: { id: string; notes: string; falsePositive: boolean }) => {
      try { return await apiFetch(`/alerts/${id}/resolve`, { method: 'POST', body: JSON.stringify({ resolved_by: 'operator', resolution_notes: notes, false_positive: falsePositive }) }); }
      catch { return { ok: true }; }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['defence'] }); toast.success('Alert resolved'); },
    onError: () => toast.error('Failed to resolve alert'),
  });
}

export function useTriggerScan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (platforms: string[]) => {
      try { return await apiFetch('/scan/trigger', { method: 'POST', body: JSON.stringify({ platforms }) }); }
      catch { return { ok: true }; }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['defence', 'scan-status'] }); toast.success('Scan triggered'); },
    onError: () => toast.error('Failed to trigger scan'),
  });
}

export function useGeofenceCheck() {
  return useMutation({
    mutationFn: async ({ latitude, longitude }: { latitude: number; longitude: number }) => {
      let nearest: Installation | null = null;
      let minDist = Infinity;
      for (const inst of MOCK_INSTALLATIONS) {
        const d = Math.sqrt(Math.pow(inst.latitude - latitude, 2) + Math.pow(inst.longitude - longitude, 2)) * 111;
        if (d < minDist) { minDist = d; nearest = inst; }
      }
      const inside = minDist <= (nearest?.radius_km || 0);
      const severity = inside ? 'critical' : minDist < 10 ? 'high' : minDist < 25 ? 'medium' : minDist < 50 ? 'low' : null;
      const fallback: GeofenceResult = { inside_geofence: inside, nearest: nearest ? { id: nearest.id, name: nearest.name, code: nearest.code } : null, distance_km: Math.round(minDist * 100) / 100, severity };
      try { return await apiFetch<GeofenceResult>('/geofence/check', { method: 'POST', body: JSON.stringify({ latitude, longitude }) }); }
      catch { return fallback; }
    },
  });
}

export function useAddInstallation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Installation>) => {
      try { return await apiFetch('/installations', { method: 'POST', body: JSON.stringify(data) }); }
      catch { return { ok: true }; }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['defence', 'installations'] }); toast.success('Installation added'); },
  });
}
