import { useState } from 'react';
import { Globe, Maximize2, Minimize2, ExternalLink, RefreshCw, MapPin, AlertTriangle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ConflictEvent {
  country: string;
  region: string;
  eventType: string;
  fatalities: number;
  date: string;
  source: string;
}

interface CountryRisk {
  country: string;
  conflictEvents: number;
  fatalities: number;
  instabilityScore: number;
  trend: 'rising' | 'stable' | 'declining';
  lastUpdated: string;
}

export function GeopoliticalPanel() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('map');
  const [countryRisks, setCountryRisks] = useState<CountryRisk[]>([]);
  const [conflicts, setConflicts] = useState<ConflictEvent[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const { toast } = useToast();

  const fetchGeopoliticalData = async (country?: string) => {
    setIsLoadingData(true);
    try {
      const { data, error } = await supabase.functions.invoke('geopolitical-data', {
        body: { country, sources: ['acled', 'gdelt'] },
      });

      if (error) throw error;

      if (data?.countryRisks) setCountryRisks(data.countryRisks);
      if (data?.conflicts) setConflicts(data.conflicts);

      toast({
        title: 'Geopolitical data updated',
        description: `Fetched ${data?.conflicts?.length || 0} events from ACLED/GDELT`,
      });
    } catch (err) {
      console.error('Geopolitical data fetch error:', err);
      toast({
        title: 'Data fetch failed',
        description: 'Could not retrieve geopolitical intelligence',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="w-3 h-3 text-destructive" />;
      case 'declining': return <TrendingUp className="w-3 h-3 text-accent rotate-180" />;
      default: return <span className="w-3 h-3 text-muted-foreground">—</span>;
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'destructive';
    if (score >= 60) return 'default';
    if (score >= 40) return 'secondary';
    return 'outline';
  };

  return (
    <div className={`flex flex-col bg-background ${isFullscreen ? 'fixed inset-0 z-50' : 'h-full'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface-elevated">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium">Geopolitical Context</span>
          <Badge variant="outline" className="text-[10px] font-mono">LIVE</Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => fetchGeopoliticalData()}
            disabled={isLoadingData}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => window.open('https://worldmonitor.app', '_blank')}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>

      {/* Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full rounded-none border-b border-border bg-transparent px-2 py-0 h-9">
          <TabsTrigger value="map" className="flex-1 data-[state=active]:bg-secondary rounded-sm text-xs gap-1">
            <Globe className="w-3 h-3" />
            World Monitor
          </TabsTrigger>
          <TabsTrigger value="risks" className="flex-1 data-[state=active]:bg-secondary rounded-sm text-xs gap-1">
            <AlertTriangle className="w-3 h-3" />
            Country Risks
          </TabsTrigger>
          <TabsTrigger value="events" className="flex-1 data-[state=active]:bg-secondary rounded-sm text-xs gap-1">
            <MapPin className="w-3 h-3" />
            Conflict Events
          </TabsTrigger>
        </TabsList>

        {/* World Monitor Embed */}
        <TabsContent value="map" className="flex-1 m-0">
          <iframe
            src="https://worldmonitor.app"
            className="w-full h-full border-0"
            title="World Monitor — Global Intelligence Dashboard"
            allow="fullscreen"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        </TabsContent>

        {/* Country Risks */}
        <TabsContent value="risks" className="flex-1 m-0 overflow-auto p-3 space-y-2">
          {countryRisks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-3">
              <AlertTriangle className="w-8 h-8 opacity-40" />
              <div>
                <p className="text-sm font-medium">No risk data loaded</p>
                <p className="text-xs mt-1">Click refresh to fetch country risk profiles from ACLED & GDELT</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => fetchGeopoliticalData()} disabled={isLoadingData}>
                <RefreshCw className={`w-3 h-3 mr-1 ${isLoadingData ? 'animate-spin' : ''}`} />
                Fetch Data
              </Button>
            </div>
          ) : (
            countryRisks.map((risk) => (
              <div key={risk.country} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {getTrendIcon(risk.trend)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{risk.country}</p>
                    <p className="text-xs text-muted-foreground">
                      {risk.conflictEvents} events · {risk.fatalities} fatalities
                    </p>
                  </div>
                </div>
                <Badge variant={getRiskColor(risk.instabilityScore)} className="font-mono text-xs">
                  {risk.instabilityScore}
                </Badge>
              </div>
            ))
          )}
        </TabsContent>

        {/* Conflict Events */}
        <TabsContent value="events" className="flex-1 m-0 overflow-auto p-3 space-y-2">
          {conflicts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-3">
              <MapPin className="w-8 h-8 opacity-40" />
              <div>
                <p className="text-sm font-medium">No conflict events loaded</p>
                <p className="text-xs mt-1">Fetch real-time conflict data from ACLED and UCDP</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => fetchGeopoliticalData()} disabled={isLoadingData}>
                <RefreshCw className={`w-3 h-3 mr-1 ${isLoadingData ? 'animate-spin' : ''}`} />
                Fetch Events
              </Button>
            </div>
          ) : (
            conflicts.map((event, i) => (
              <div key={i} className="p-3 rounded-lg border border-border bg-card space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{event.country} — {event.region}</span>
                  <Badge variant={event.fatalities > 0 ? 'destructive' : 'secondary'} className="text-[10px]">
                    {event.eventType}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {event.date} · {event.fatalities > 0 ? `${event.fatalities} fatalities` : 'No fatalities reported'} · Source: {event.source}
                </p>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
