import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CountryRiskData {
  country: string;
  instabilityScore: number;
  conflictEvents: number;
  fatalities: number;
  trend: 'rising' | 'stable' | 'declining';
}

interface CountryRiskResult {
  countryRisk: CountryRiskData | null;
  isLoading: boolean;
  isHighRisk: boolean;
  riskBoost: number;
  error: string | null;
}

// ISO 2-letter to full country name mapping for common nationalities in the dataset
const ISO_TO_COUNTRY: Record<string, string> = {
  IR: 'Iran',
  RU: 'Russia',
  UA: 'Ukraine',
  CN: 'China',
  KR: 'South Korea',
  EG: 'Egypt',
  CZ: 'Czech Republic',
  SY: 'Syria',
  AF: 'Afghanistan',
  IQ: 'Iraq',
  PK: 'Pakistan',
  NG: 'Nigeria',
  SO: 'Somalia',
  YE: 'Yemen',
  LY: 'Libya',
  SD: 'Sudan',
  MM: 'Myanmar',
  VE: 'Venezuela',
  KP: 'North Korea',
  CD: 'Congo',
  ET: 'Ethiopia',
  ML: 'Mali',
  BF: 'Burkina Faso',
  MZ: 'Mozambique',
  CM: 'Cameroon',
  TD: 'Chad',
  NE: 'Niger',
  CF: 'Central African Republic',
};

// Cache for country risk data to avoid repeated API calls
let riskCache: { data: CountryRiskData[]; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useCountryRisk(nationality: string | null | undefined): CountryRiskResult {
  const [countryRisk, setCountryRisk] = useState<CountryRiskData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRisk = useCallback(async () => {
    if (!nationality) {
      setCountryRisk(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check cache first
      if (riskCache && Date.now() - riskCache.timestamp < CACHE_TTL) {
        const match = findCountryMatch(riskCache.data, nationality);
        setCountryRisk(match);
        setIsLoading(false);
        return;
      }

      const { data, error: fnError } = await supabase.functions.invoke('geopolitical-data', {
        body: { sources: ['acled', 'gdelt'] },
      });

      if (fnError) throw fnError;

      const risks: CountryRiskData[] = data?.countryRisks || [];
      
      // Update cache
      riskCache = { data: risks, timestamp: Date.now() };

      const match = findCountryMatch(risks, nationality);
      setCountryRisk(match);
    } catch (err) {
      console.error('Country risk fetch error:', err);
      setError('Failed to fetch country risk data');
    } finally {
      setIsLoading(false);
    }
  }, [nationality]);

  useEffect(() => {
    fetchRisk();
  }, [fetchRisk]);

  const isHighRisk = (countryRisk?.instabilityScore ?? 0) >= 60;
  const riskBoost = countryRisk
    ? Math.round(Math.min(countryRisk.instabilityScore * 0.3, 25))
    : 0;

  return { countryRisk, isLoading, isHighRisk, riskBoost, error };
}

function findCountryMatch(risks: CountryRiskData[], nationality: string): CountryRiskData | null {
  // Try direct match first
  let match = risks.find(r => 
    r.country.toLowerCase() === nationality.toLowerCase()
  );
  
  if (match) return match;

  // Try ISO code mapping
  const countryName = ISO_TO_COUNTRY[nationality.toUpperCase()];
  if (countryName) {
    match = risks.find(r => 
      r.country.toLowerCase() === countryName.toLowerCase()
    );
  }

  return match || null;
}
