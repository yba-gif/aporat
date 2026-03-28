import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_BASE = 'http://localhost:8000/api/defence/osint';

// ─── Types ──────────────────────────────────────────────────────────
export interface DashboardStats {
  total_alerts: number;
  total_persons: number;
  total_installations: number;
  total_content: number;
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

export interface Person {
  id: string;
  name: string;
  rank: string | null;
  unit: string | null;
  opsec_score: number;
  is_active: boolean;
  created_at: string;
  social_accounts?: { platform: string; username: string }[];
  alert_count?: number;
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
  { id: 'a1', severity: 'critical', status: 'new', threat_category: 'location_leak', platform: 'tiktok', title: 'Soldier broadcasting live from İncirlik flight line', description: 'Active TikTok livestream showing F-16 shelters and runway operations at İncirlik Air Base. GPS metadata embedded in stream confirms location within 200m of HAS area. Stream has 1,200 concurrent viewers.', evidence_url: 'https://tiktok.com/@example/live', created_at: new Date(Date.now() - 300000).toISOString(), person_id: 'p1', installation_id: '1', person_name: 'Yüzbaşı Ahmet Kaya', installation_name: 'İncirlik Air Base' },
  { id: 'a2', severity: 'critical', status: 'new', threat_category: 'facility_exposure', platform: 'instagram', title: 'Radar installation visible in background of selfie', description: 'Instagram story posted from Kürecik area shows AN/TPY-2 radar array clearly visible in background. Geotag places the photo within the facility perimeter.', evidence_url: 'https://instagram.com/p/example', created_at: new Date(Date.now() - 600000).toISOString(), person_id: 'p2', installation_id: '2', person_name: 'Teğmen Elif Demir', installation_name: 'Kürecik Radar Station' },
  { id: 'a3', severity: 'high', status: 'new', threat_category: 'equipment_visible', platform: 'twitter', title: 'Photo of classified avionics panel shared on Twitter', description: 'Twitter user posted detailed photo of F-35 cockpit MFD display during maintenance cycle. ITAR-controlled information visible in image.', evidence_url: null, created_at: new Date(Date.now() - 1800000).toISOString(), person_id: 'p1', installation_id: '3', person_name: 'Yüzbaşı Ahmet Kaya', installation_name: 'Akıncı Air Base' },
  { id: 'a4', severity: 'high', status: 'acknowledged', threat_category: 'deployment_info', platform: 'strava', title: 'Running route reveals patrol patterns around Silopi base', description: 'Strava heatmap data from multiple soldiers shows consistent patrol routes, timing patterns, and dead zones around Silopi Military Base perimeter.', evidence_url: 'https://strava.com/activities/example', created_at: new Date(Date.now() - 3600000).toISOString(), person_id: null, installation_id: '16', installation_name: 'Silopi Military Base' },
  { id: 'a5', severity: 'medium', status: 'new', threat_category: 'personnel_exposure', platform: 'linkedin', title: 'Officer lists classified unit assignment on LinkedIn', description: 'Active duty officer updated LinkedIn profile to show assignment to Special Forces Command (ÖKK) with detailed job description mentioning operational capabilities.', evidence_url: 'https://linkedin.com/in/example', created_at: new Date(Date.now() - 7200000).toISOString(), person_id: 'p3', installation_id: null, person_name: 'Binbaşı Mert Yıldız' },
  { id: 'a6', severity: 'medium', status: 'investigating', threat_category: 'opsec_discussion', platform: 'twitter', title: 'Soldier discussing upcoming deployment on Twitter', description: 'Enlisted personnel tweeting about upcoming rotation to southeastern Turkey. Mentions specific unit designator and approximate deployment timeline.', evidence_url: null, created_at: new Date(Date.now() - 10800000).toISOString(), person_id: 'p2', installation_id: null, person_name: 'Teğmen Elif Demir' },
  { id: 'a7', severity: 'low', status: 'new', threat_category: 'social_engineering', platform: 'facebook', title: 'Suspicious friend request pattern targeting naval personnel', description: 'Multiple fake Facebook profiles sending friend requests to Gölcük Naval Base personnel. Profiles use AI-generated photos and claim to be defense industry professionals.', evidence_url: null, created_at: new Date(Date.now() - 14400000).toISOString(), person_id: null, installation_id: '10', installation_name: 'Gölcük Naval Base' },
  { id: 'a8', severity: 'critical', status: 'resolved', threat_category: 'location_leak', platform: 'tiktok', title: 'Convoy movement filmed and posted to TikTok', description: 'Civilian TikTok user filmed military convoy of 15+ vehicles moving through Şırnak province. Video shows vehicle types, unit markings, and direction of travel.', evidence_url: null, created_at: new Date(Date.now() - 86400000).toISOString(), person_id: null, installation_id: '16', installation_name: 'Silopi Military Base', resolution_notes: 'Content removed via platform cooperation. Uploader warned.' },
  { id: 'a9', severity: 'high', status: 'new', threat_category: 'unit_identification', platform: 'youtube', title: 'Training exercise video reveals unit insignia and equipment', description: 'YouTube video uploaded by civilian near Eğirdir shows commando training with clearly visible unit patches, weapon systems, and tactical procedures.', evidence_url: 'https://youtube.com/watch?v=example', created_at: new Date(Date.now() - 5400000).toISOString(), person_id: null, installation_id: '20', installation_name: 'Eğirdir Commando School' },
  { id: 'a10', severity: 'low', status: 'new', threat_category: 'opsec_discussion', platform: 'twitter', title: 'Veteran discussing current ops tempo on Twitter thread', description: 'Retired officer with large following speculating about current operational tempo based on observed aircraft movements at Diyarbakır AB.', evidence_url: null, created_at: new Date(Date.now() - 18000000).toISOString(), person_id: null, installation_id: '5', installation_name: 'Diyarbakır Air Base' },
  { id: 'a11', severity: 'medium', status: 'new', threat_category: 'facility_exposure', platform: 'strava', title: 'Strava segment created inside Foça naval base perimeter', description: 'Running segment on Strava traces internal road network within Foça Amphibious Marine Base, revealing building layouts and checkpoint locations.', evidence_url: null, created_at: new Date(Date.now() - 21600000).toISOString(), person_id: null, installation_id: '18', installation_name: 'Foça Training Center' },
  { id: 'a12', severity: 'high', status: 'new', threat_category: 'equipment_visible', platform: 'instagram', title: 'S-400 transport vehicles photographed at Akıncı', description: 'Instagram post shows transport erector launcher vehicles at Akıncı Air Base parking area. High-resolution image allows identification of S-400 system components.', evidence_url: null, created_at: new Date(Date.now() - 9000000).toISOString(), person_id: null, installation_id: '3', installation_name: 'Akıncı Air Base' },
];

const MOCK_PERSONS: Person[] = [
  { id: 'p1', name: 'Yüzbaşı Ahmet Kaya', rank: 'Yüzbaşı (Captain)', unit: '141st Filo (Squadron)', opsec_score: 82, is_active: true, created_at: '2026-01-15T10:00:00Z', social_accounts: [{ platform: 'tiktok', username: '@ahmet.kaya34' }, { platform: 'instagram', username: 'ahmetkaya_pilot' }, { platform: 'twitter', username: '@AKaya_141' }], alert_count: 4 },
  { id: 'p2', name: 'Teğmen Elif Demir', rank: 'Teğmen (Lieutenant)', unit: 'Kürecik Radar Birliği', opsec_score: 67, is_active: true, created_at: '2026-02-01T09:30:00Z', social_accounts: [{ platform: 'instagram', username: 'elif.demir99' }, { platform: 'twitter', username: '@ElifD_TR' }, { platform: 'strava', username: 'elif_runner' }], alert_count: 3 },
  { id: 'p3', name: 'Binbaşı Mert Yıldız', rank: 'Binbaşı (Major)', unit: 'Özel Kuvvetler Komutanlığı', opsec_score: 45, is_active: true, created_at: '2026-01-20T08:00:00Z', social_accounts: [{ platform: 'linkedin', username: 'mert-yildiz-okk' }, { platform: 'facebook', username: 'mert.yildiz.07' }], alert_count: 1 },
];

const MOCK_STATS: DashboardStats = {
  total_alerts: MOCK_ALERTS.length,
  total_persons: MOCK_PERSONS.length,
  total_installations: MOCK_INSTALLATIONS.length,
  total_content: 12453,
  alerts_last_24h: 8,
  alerts_by_severity: { critical: 3, high: 4, medium: 3, low: 2 },
  collectors_status: { tiktok: 'running', strava: 'idle', instagram: 'running', twitter: 'idle', facebook: 'disabled', linkedin: 'idle', youtube: 'error' },
};

const MOCK_COLLECTORS: CollectorStatus[] = [
  { platform: 'tiktok', status: 'running', last_run_at: new Date(Date.now() - 120000).toISOString(), last_success_at: new Date(Date.now() - 120000).toISOString(), last_error: null, items_collected_total: 4231, items_collected_today: 87, alerts_generated_total: 156 },
  { platform: 'strava', status: 'idle', last_run_at: new Date(Date.now() - 3600000).toISOString(), last_success_at: new Date(Date.now() - 3600000).toISOString(), last_error: null, items_collected_total: 891, items_collected_today: 12, alerts_generated_total: 34 },
  { platform: 'instagram', status: 'running', last_run_at: new Date(Date.now() - 300000).toISOString(), last_success_at: new Date(Date.now() - 300000).toISOString(), last_error: null, items_collected_total: 3102, items_collected_today: 64, alerts_generated_total: 98 },
  { platform: 'twitter', status: 'idle', last_run_at: new Date(Date.now() - 1800000).toISOString(), last_success_at: new Date(Date.now() - 1800000).toISOString(), last_error: null, items_collected_total: 2847, items_collected_today: 41, alerts_generated_total: 112 },
  { platform: 'facebook', status: 'disabled', last_run_at: null, last_success_at: null, last_error: null, items_collected_total: 0, items_collected_today: 0, alerts_generated_total: 0 },
  { platform: 'linkedin', status: 'idle', last_run_at: new Date(Date.now() - 7200000).toISOString(), last_success_at: new Date(Date.now() - 7200000).toISOString(), last_error: null, items_collected_total: 412, items_collected_today: 5, alerts_generated_total: 19 },
  { platform: 'youtube', status: 'error', last_run_at: new Date(Date.now() - 600000).toISOString(), last_success_at: new Date(Date.now() - 86400000).toISOString(), last_error: 'Rate limit exceeded — API quota depleted for current billing period', items_collected_total: 967, items_collected_today: 0, alerts_generated_total: 43 },
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
    queryFn: () => fetchWithFallback('/dashboard/stats', MOCK_STATS),
    refetchInterval: 30000,
  });
}

export function useTopThreats() {
  return useQuery({
    queryKey: ['defence', 'top-threats'],
    queryFn: () => fetchWithFallback<Alert[]>('/dashboard/top-threats', MOCK_ALERTS.filter(a => ['critical', 'high'].includes(a.severity) && a.status !== 'resolved').slice(0, 10)),
    refetchInterval: 30000,
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
    refetchInterval: 30000,
  });
}

export function useInstallations() {
  return useQuery({
    queryKey: ['defence', 'installations'],
    queryFn: () => fetchWithFallback<Installation[]>('/installations', MOCK_INSTALLATIONS),
    refetchInterval: 30000,
  });
}

export function usePersonnel() {
  return useQuery({
    queryKey: ['defence', 'personnel'],
    queryFn: () => fetchWithFallback<Person[]>('/personnel', MOCK_PERSONS),
    refetchInterval: 30000,
  });
}

export function useScanStatus() {
  return useQuery({
    queryKey: ['defence', 'scan-status'],
    queryFn: () => fetchWithFallback<CollectorStatus[]>('/scan/status', MOCK_COLLECTORS),
    refetchInterval: 30000,
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
      // Calculate nearest from mock data
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

export function useAddPersonnel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; rank?: string; unit?: string }) => {
      try { return await apiFetch('/personnel', { method: 'POST', body: JSON.stringify(data) }); }
      catch { return { ok: true }; }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['defence', 'personnel'] }); toast.success('Personnel added'); },
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
